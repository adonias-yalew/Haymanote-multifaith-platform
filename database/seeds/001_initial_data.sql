-- Addis Tesfa Platform - Initial Seed Data
-- Run this after migrations to populate with sample data

-- Create admin user (password: admin123)
-- In production, use proper hashed passwords
INSERT INTO users (id, email, role, is_anonymous, display_name, bio, reputation_score, helpfulness_badge)
VALUES (
    gen_random_uuid(),
    'admin@addistesfa.com',
    'ADMIN',
    false,
    'Administrator',
    'Platform administrator for content moderation and user management.',
    1000,
    'PLATINUM'
);

-- Create verified professional (password: pro123)
INSERT INTO users (id, email, role, is_anonymous, display_name, bio, reputation_score, helpfulness_badge)
VALUES (
    gen_random_uuid(),
    'dr.sarah@addistesfa.com',
    'PROFESSIONAL',
    false,
    'Dr. Sarah Johnson',
    'Licensed clinical psychologist with 10 years of experience in mental health counseling.',
    500,
    'GOLD'
);

-- Get the professional user ID
DO $$
DECLARE
    pro_user_id UUID;
BEGIN
    SELECT id INTO pro_user_id FROM users WHERE email = 'dr.sarah@addistesfa.com';
    
    -- Create professional profile
    INSERT INTO professional_profiles (
        user_id, license_number, specialization, credentials, 
        years_of_experience, bio, status, verified_at, verified_by
    )
    VALUES (
        pro_user_id,
        'ETH-PSY-12345',
        'Clinical Psychology',
        'PhD in Clinical Psychology, Addis Ababa University; Licensed by Ethiopian Psychology Council',
        10,
        'Specializing in anxiety, depression, and trauma counseling. Fluent in Amharic and English.',
        'VERIFIED',
        NOW(),
        (SELECT id FROM users WHERE email = 'admin@addistesfa.com')
    );
END $$;

-- Create regular user (password: user123)
INSERT INTO users (id, email, role, is_anonymous, display_name, reputation_score)
VALUES (
    gen_random_uuid(),
    'user@mail.haymanote.com',
    'USER',
    false,
    'Regular User',
    50
);

-- Create sample posts
DO $$
DECLARE
    user_id UUID;
    pro_id UUID;
BEGIN
    SELECT id INTO user_id FROM users WHERE email = 'user@mail.haymanote.com';
    SELECT id INTO pro_id FROM users WHERE email = 'dr.sarah@addistesfa.com';
    
    -- Sample post 1: Anonymous sharing
    INSERT INTO posts (author_id, title, content, is_anonymous, status, tags)
    VALUES (
        user_id,
        'Struggling with anxiety during exams',
        'I''ve been experiencing severe anxiety during exam periods. My heart races, I can''t sleep, and I feel like I can''t breathe. Has anyone else dealt with this? What helped you cope?',
        true,
        'PUBLISHED',
        ARRAY['anxiety', 'exams', 'stress', 'help']
    );
    
    -- Sample post 2: Non-anonymous
    INSERT INTO posts (author_id, title, content, is_anonymous, status, tags)
    VALUES (
        user_id,
        'Finding peace through mindfulness',
        'I wanted to share my journey with mindfulness meditation. After 6 months of daily practice, my anxiety has decreased significantly. Here are some resources that helped me...',
        false,
        'PUBLISHED',
        ARRAY['mindfulness', 'meditation', 'self-help', 'anxiety']
    );
    
    -- Sample blog post by professional
    INSERT INTO blogs (author_id, title, content, excerpt, tags, published)
    VALUES (
        pro_id,
        'Understanding Anxiety: A Guide for Students',
        'Anxiety is one of the most common mental health concerns among students. In this article, we explore the physiological mechanisms of anxiety, common triggers in academic settings, and evidence-based coping strategies...',
        'Learn about the science behind anxiety and discover practical strategies for managing exam stress.',
        ARRAY['anxiety', 'students', 'mental-health', 'education'],
        true
    );
END $$;

-- Create reputation history for badges demonstration
DO $$
DECLARE
    admin_id UUID;
BEGIN
    SELECT id INTO admin_id FROM users WHERE email = 'admin@addistesfa.com';
    
    INSERT INTO user_reputation_history (user_id, action_type, points, reference_type)
    VALUES 
        (admin_id, 'POST_CREATED', 5, 'posts'),
        (admin_id, 'HELPFUL_COMMENT', 10, 'comments'),
        (admin_id, 'PROFESSIONAL_RESPONSE', 10, 'professional_responses'),
        (admin_id, 'BLOG_PUBLISHED', 20, 'blogs'),
        (admin_id, 'HELPFUL_COMMENT', 10, 'comments'),
        (admin_id, 'HELPFUL_COMMENT', 10, 'comments');
END $$;
