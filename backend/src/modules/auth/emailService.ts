import { getSupabase } from '../../db/supabaseClient.js';
import { env } from '../../config/env.js';
import net from 'node:net';
import tls from 'node:tls';

const VERIFICATION_TOKEN_EXPIRY_HOURS = 24;
const SMTP_TIMEOUT_MS = 15000;

type SmtpSocket = net.Socket | tls.TLSSocket;

const encodeHeader = (value: string): string => {
  if (/^[\x00-\x7F]*$/.test(value)) return value;
  return `=?UTF-8?B?${Buffer.from(value, 'utf8').toString('base64')}?=`;
};

const escapeSmtpData = (message: string): string => message.replace(/^\./gm, '..');
const extractEmailAddress = (value: string): string => {
  const match = value.match(/<([^>]+)>/);
  return (match?.[1] || value).trim().replace(/^["']|["']$/g, '');
};

const formatFromHeader = (value: string): string => {
  const email = extractEmailAddress(value);
  const nameMatch = value.match(/^"?([^"<]+)"?\s*</);
  const name = nameMatch?.[1]?.trim() || 'Haymanote';
  return `${encodeHeader(name)} <${email}>`;
};

const getSenderEmail = (): string => {
  return env.BREVO_SENDER_EMAIL || extractEmailAddress(env.EMAIL_FROM);
};

const getSenderName = (): string => {
  if (env.BREVO_SENDER_NAME) return env.BREVO_SENDER_NAME;
  const match = env.EMAIL_FROM.match(/^"?([^"<]+)"?\s*</);
  return match?.[1]?.trim() || 'Haymanote';
};

class SmtpClient {
  private socket: SmtpSocket | null = null;
  private buffer = '';

  async send(message: string): Promise<void> {
    await this.connect();
    await this.expect([220]);
    await this.command(`EHLO ${this.localhost()}`, [250]);

    if (!this.usesImplicitTls()) {
      await this.command('STARTTLS', [220]);
      this.upgradeToTls();
      await this.command(`EHLO ${this.localhost()}`, [250]);
    }

    if (env.SMTP_USER && env.SMTP_PASS) {
      await this.command('AUTH LOGIN', [334]);
      await this.command(Buffer.from(env.SMTP_USER).toString('base64'), [334]);
      await this.command(Buffer.from(env.SMTP_PASS).toString('base64'), [235]);
    }

    await this.command(`MAIL FROM:<${extractEmailAddress(env.EMAIL_FROM)}>`, [250]);
    await this.command(`RCPT TO:<${this.extractRecipient(message)}>`, [250, 251]);
    await this.command('DATA', [354]);
    await this.command(`${escapeSmtpData(message)}\r\n.`, [250]);
    await this.command('QUIT', [221]);
    this.socket?.end();
  }

  private connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      const onError = (error: Error) => reject(error);
      const onConnect = () => {
        this.socket?.off('error', onError);
        resolve();
      };

      this.socket = this.usesImplicitTls()
        ? tls.connect(env.SMTP_PORT, env.SMTP_HOST, { servername: env.SMTP_HOST }, onConnect)
        : net.connect(env.SMTP_PORT, env.SMTP_HOST, onConnect);

      this.socket.setEncoding('utf8');
      this.socket.setTimeout(SMTP_TIMEOUT_MS, () => {
        this.socket?.destroy(new Error('SMTP connection timed out'));
      });
      this.socket.once('error', onError);
      this.socket.on('data', (chunk) => {
        this.buffer += chunk;
      });
    });
  }

  private upgradeToTls(): void {
    if (!this.socket) throw new Error('SMTP socket unavailable');
    this.socket.removeAllListeners('data');
    this.buffer = '';
    this.socket = tls.connect({
      socket: this.socket,
      servername: env.SMTP_HOST,
    });
    this.socket.setEncoding('utf8');
    this.socket.setTimeout(SMTP_TIMEOUT_MS, () => {
      this.socket?.destroy(new Error('SMTP connection timed out'));
    });
    this.socket.on('data', (chunk) => {
      this.buffer += chunk;
    });
  }

  private command(command: string, expectedCodes: number[]): Promise<string> {
    if (!this.socket) throw new Error('SMTP socket unavailable');
    this.socket.write(`${command}\r\n`);
    return this.expect(expectedCodes);
  }

  private expect(expectedCodes: number[]): Promise<string> {
    return new Promise((resolve, reject) => {
      const startedAt = Date.now();
      const check = () => {
        const response = this.completeResponse();
        if (response) {
          const code = Number(response.slice(0, 3));
          if (expectedCodes.includes(code)) {
            resolve(response);
          } else {
            reject(new Error(`SMTP error: ${response.trim()}`));
          }
          return;
        }

        if (Date.now() - startedAt > SMTP_TIMEOUT_MS) {
          reject(new Error('SMTP response timed out'));
          return;
        }

        setTimeout(check, 25);
      };
      check();
    });
  }

  private completeResponse(): string | null {
    const normalized = this.buffer.replace(/\r\n/g, '\n');
    const lines = normalized.split('\n').filter(Boolean);
    if (lines.length === 0) return null;

    const lastLine = lines[lines.length - 1];
    if (/^\d{3} /.test(lastLine)) {
      const response = lines.join('\n');
      this.buffer = '';
      return response;
    }

    return null;
  }

  private localhost(): string {
    return 'haymanote.local';
  }

  private usesImplicitTls(): boolean {
    return env.SMTP_SECURE || env.SMTP_PORT === 465;
  }

  private extractRecipient(message: string): string {
    const match = message.match(/^To:\s*(.+)$/im);
    if (!match) throw new Error('Missing email recipient');
    return match[1].trim().replace(/^.*<(.+)>$/, '$1');
  }
}

export class EmailVerificationService {
  /**
   * Generate a six-digit email verification code.
   */
  generateVerificationToken(): string {
    return String(Math.floor(100000 + Math.random() * 900000));
  }

  /**
   * Send verification email.
   * @param email - The email to send verification to
   * @param token - The six-digit verification code
   */
  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const verificationPage = `${env.FRONTEND_URL}/verify-email?email=${encodeURIComponent(email)}`;
    const subject = 'Your Haymanote verification code';
    const htmlContent = [
      `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a">`,
      `<h2>Your Haymanote verification code</h2>`,
      `<p>Use this code to verify your account:</p>`,
      `<p style="font-size:28px;font-weight:700;letter-spacing:8px">${token}</p>`,
      `<p>This code expires in ${VERIFICATION_TOKEN_EXPIRY_HOURS} hours.</p>`,
      `<p><a href="${verificationPage}">Open verification page</a></p>`,
      `</div>`,
    ].join('');

    if (env.SMTP_HOST && env.EMAIL_FROM) {
      const message = [
        `From: ${formatFromHeader(env.EMAIL_FROM)}`,
        `To: ${email}`,
        `Subject: ${encodeHeader(subject)}`,
        'MIME-Version: 1.0',
        'Content-Type: text/html; charset=UTF-8',
        '',
        htmlContent,
      ].join('\r\n');

      try {
        await new SmtpClient().send(message);
        return;
      } catch (error) {
        console.error('[EMAIL SERVICE] SMTP send failed:', error);
        if (env.NODE_ENV !== 'development') {
          throw new Error('Failed to send verification email');
        }
      }
    }

    if (env.BREVO_API_KEY && getSenderEmail()) {
      try {
        await this.sendWithBrevo(email, subject, htmlContent);
        return;
      } catch (error) {
        console.error('[EMAIL SERVICE] Brevo send failed:', error);
        if (env.NODE_ENV !== 'development') {
          throw new Error('Failed to send verification email');
        }
      }
    }
    
    console.log(`[EMAIL SERVICE] Verification email for ${email}:`);
    console.log(`[EMAIL SERVICE] Your Haymanote verification code is: ${token}`);
    console.log(`[EMAIL SERVICE] Enter it here: ${verificationPage}`);
    console.log('[EMAIL SERVICE] Email is not configured. Set BREVO_API_KEY and EMAIL_FROM/BREVO_SENDER_EMAIL to send real email.');
  }

  private async sendWithBrevo(email: string, subject: string, htmlContent: string): Promise<void> {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'api-key': env.BREVO_API_KEY,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: {
          name: getSenderName(),
          email: getSenderEmail(),
        },
        to: [{ email }],
        subject,
        htmlContent,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Brevo API ${response.status}: ${body}`);
    }
  }

  /**
   * Create and send verification token for a user
   * @param userId - The user ID
   * @param email - The user's email
   * @returns The verification token
   */
  async createAndSendVerificationToken(userId: string, email: string): Promise<string> {
    const supabase = getSupabase();
    const token = this.generateVerificationToken();
    
    // Calculate expiry time (24 hours from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + VERIFICATION_TOKEN_EXPIRY_HOURS);

    // Delete older unused codes for this user.
    await supabase
      .from('email_verification_tokens')
      .delete()
      .eq('user_id', userId);

    // Store code in database.
    const { error: storeError } = await supabase
      .from('email_verification_tokens')
      .insert({
        user_id: userId,
        token,
        expires_at: expiresAt.toISOString()
      });

    if (storeError) {
      console.error('Failed to store verification token:', storeError);
      throw new Error('Failed to create verification token');
    }

    // Update user with verification code.
    const { error: updateError } = await supabase
      .from('users')
      .update({ verification_token: token })
      .eq('id', userId);

    if (updateError) {
      console.error('Failed to update user with verification token:', updateError);
      throw new Error('Failed to update user');
    }

    // Send verification email
    await this.sendVerificationEmail(email, token);

    return token;
  }

  /**
   * Verify a code and mark email as verified
   * @param token - The six-digit verification code
   * @param email - The email to verify
   * @returns true if verification successful, false otherwise
   */
  async verifyToken(token: string, email: string): Promise<boolean> {
    const supabase = getSupabase();

    // Find the token in database
    const { data: tokenData, error: fetchError } = await supabase
      .from('email_verification_tokens')
      .select('id, user_id, expires_at')
      .eq('token', token)
      .single();

    if (fetchError || !tokenData) {
      console.error('Token not found:', fetchError);
      return false;
    }

    // Check if token is expired
    const expiresAt = new Date(tokenData.expires_at);
    if (new Date() > expiresAt) {
      console.log('Token expired');
      return false;
    }

    // Verify user's email matches
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('email')
      .eq('id', tokenData.user_id)
      .single();

    if (userError || !user || user.email !== email) {
      console.error('User email mismatch:', userError);
      return false;
    }

    // Mark email as verified
    const { error: updateError } = await supabase
      .from('users')
      .update({
        email_verified: true,
        verification_token: null
      })
      .eq('id', tokenData.user_id);

    if (updateError) {
      console.error('Failed to mark email as verified:', updateError);
      return false;
    }

    // Delete the used token
    await supabase
      .from('email_verification_tokens')
      .delete()
      .eq('id', tokenData.id);

    return true;
  }

  /**
   * Check if an email is verified
   * @param email - The email to check
   * @returns true if email is verified, false otherwise
   */
  async isEmailVerified(email: string): Promise<boolean> {
    const supabase = getSupabase();

    const { data: user, error } = await supabase
      .from('users')
      .select('email_verified')
      .eq('email', email)
      .single();

    if (error || !user) {
      return false;
    }

    return user.email_verified === true;
  }

  /**
   * Resend verification email for a user
   * @param email - The email to resend verification for
   */
  async resendVerificationEmail(email: string): Promise<void> {
    const supabase = getSupabase();

    // Find user by email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email_verified')
      .eq('email', email)
      .single();

    if (userError || !user) {
      throw new Error('User not found');
    }

    if (user.email_verified) {
      throw new Error('Email already verified');
    }

    // Delete old tokens for this user
    await supabase
      .from('email_verification_tokens')
      .delete()
      .eq('user_id', user.id);

    // Create and send new token
    await this.createAndSendVerificationToken(user.id, email);
  }

  /**
   * Clean up expired verification tokens (can be run periodically)
   */
  async cleanupExpiredTokens(): Promise<number> {
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('email_verification_tokens')
      .delete()
      .lt('expires_at', new Date().toISOString())
      .select('id');

    if (error) {
      console.error('Failed to cleanup expired tokens:', error);
      throw new Error('Failed to cleanup expired tokens');
    }

    return data?.length || 0;
  }
}

// Export singleton instance
export const emailVerificationService = new EmailVerificationService();
