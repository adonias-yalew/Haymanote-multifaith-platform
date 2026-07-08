-- 017_mock_data.sql
-- Comprehensive mock data for Haymanote multi-faith platform
-- Covers all three religions: orthodox, muslim, protestant
-- Run after all prior migrations have been applied

-- Enable pgcrypto for bcrypt password hashing (used by auth.users)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
    -- Orthodox users
    orthodox_member_id  UUID := 'a0000000-0000-0000-0000-000000000001';
    orthodox_leader_id  UUID := 'a0000000-0000-0000-0000-000000000002';
    orthodox_vendor_id  UUID := 'a0000000-0000-0000-0000-000000000003';

    -- Muslim users
    muslim_member_id    UUID := 'b0000000-0000-0000-0000-000000000001';
    muslim_leader_id    UUID := 'b0000000-0000-0000-0000-000000000002';
    muslim_vendor_id    UUID := 'b0000000-0000-0000-0000-000000000003';

    -- Protestant users
    protestant_member_id UUID := 'c0000000-0000-0000-0000-000000000001';
    protestant_leader_id UUID := 'c0000000-0000-0000-0000-000000000002';
    protestant_vendor_id UUID := 'c0000000-0000-0000-0000-000000000003';

    -- Admin
    admin_id            UUID := 'd0000000-0000-0000-0000-000000000001';

    -- Post IDs
    post_orthodox_1 UUID := 'e0000000-0000-0000-0000-000000000001';
    post_orthodox_2 UUID := 'e0000000-0000-0000-0000-000000000002';
    post_muslim_1   UUID := 'e0000000-0000-0000-0000-000000000003';
    post_muslim_2   UUID := 'e0000000-0000-0000-0000-000000000004';
    post_protestant_1 UUID := 'e0000000-0000-0000-0000-000000000005';
    post_protestant_2 UUID := 'e0000000-0000-0000-0000-000000000006';

    -- Comment IDs
    comment_1 UUID := 'f0000000-0000-0000-0000-000000000001';
    comment_2 UUID := 'f0000000-0000-0000-0000-000000000002';
    comment_3 UUID := 'f0000000-0000-0000-0000-000000000003';
    comment_4 UUID := 'f0000000-0000-0000-0000-000000000004';

    -- Sermon IDs
    sermon_orthodox_1 UUID := '10000000-0000-0000-0000-000000000001';
    sermon_muslim_1   UUID := '10000000-0000-0000-0000-000000000002';
    sermon_protestant_1 UUID := '10000000-0000-0000-0000-000000000003';

    -- Prayer IDs
    prayer_orthodox_1 UUID := '20000000-0000-0000-0000-000000000001';
    prayer_muslim_1   UUID := '20000000-0000-0000-0000-000000000002';
    prayer_protestant_1 UUID := '20000000-0000-0000-0000-000000000003';

    -- Product IDs
    product_orthodox_1 UUID := '30000000-0000-0000-0000-000000000001';
    product_orthodox_2 UUID := '30000000-0000-0000-0000-000000000002';
    product_muslim_1   UUID := '30000000-0000-0000-0000-000000000003';
    product_protestant_1 UUID := '30000000-0000-0000-0000-000000000004';

    -- Conversation ID
    conv_1 UUID := '40000000-0000-0000-0000-000000000001';
    conv_2 UUID := '40000000-0000-0000-0000-000000000002';

    -- Donation recipient IDs
    donor_orthodox UUID := '50000000-0000-0000-0000-000000000001';
    donor_muslim   UUID := '50000000-0000-0000-0000-000000000002';
    donor_protestant UUID := '50000000-0000-0000-0000-000000000003';

    -- Order ID
    order_1 UUID := '60000000-0000-0000-0000-000000000001';

    -- Blog IDs
    blog_1 UUID := '70000000-0000-0000-0000-000000000001';
    blog_2 UUID := '70000000-0000-0000-0000-000000000002';

    -- Prayer tracker IDs
    tracker_1 UUID := '80000000-0000-0000-0000-000000000001';
    tracker_2 UUID := '80000000-0000-0000-0000-000000000002';

    -- Verification request
    ver_req_1 UUID := '90000000-0000-0000-0000-000000000001';
    ver_req_2 UUID := '90000000-0000-0000-0000-000000000002';

BEGIN

    -- ============================================
    -- USERS (10 users across all roles & religions)
    -- ============================================
    INSERT INTO users (id, email, display_name, role, religion, organization_name, email_verified, verification_status, account_status, created_at) VALUES
    -- Orthodox
    (orthodox_member_id,  'dawit.hailu@mail.haymanote.com',    'Dawit Hailu',      'user',   'orthodox',   NULL,               TRUE, 'APPROVED', 'ACTIVE', '2025-01-15 08:30:00+00'),
    (orthodox_leader_id,  'abune.germame@mail.haymanote.com',  'Abune Germame',    'leader', 'orthodox',   NULL,               TRUE, 'APPROVED', 'ACTIVE', '2025-01-10 06:00:00+00'),
    (orthodox_vendor_id,  'kidus.maket@mail.haymanote.com',    'Kidus Market',     'vendor', 'orthodox',   'Kidus Maket PLC', TRUE, 'APPROVED', 'ACTIVE', '2025-02-01 07:00:00+00'),

    -- Muslim
    (muslim_member_id,    'amina.hassan@mail.haymanote.com',   'Amina Hassan',     'user',   'muslim',     NULL,               TRUE, 'APPROVED', 'ACTIVE', '2025-01-20 09:15:00+00'),
    (muslim_leader_id,    'sheikh.ahmed@mail.haymanote.com',   'Sheikh Ahmed',     'leader', 'muslim',     NULL,               TRUE, 'APPROVED', 'ACTIVE', '2025-01-12 05:00:00+00'),
    (muslim_vendor_id,    'halal.goods@mail.haymanote.com',    'Halal Goods',      'vendor', 'muslim',     'Halal Goods Trading', TRUE, 'APPROVED', 'ACTIVE', '2025-02-10 08:00:00+00'),

    -- Protestant
    (protestant_member_id,'sara.tadesse@mail.haymanote.com',   'Sara Tadesse',     'user',   'protestant', NULL,               TRUE, 'APPROVED', 'ACTIVE', '2025-01-25 10:00:00+00'),
    (protestant_leader_id,'pastor.markos@mail.haymanote.com',  'Pastor Markos',    'leader', 'protestant', NULL,               TRUE, 'APPROVED', 'ACTIVE', '2025-01-08 07:30:00+00'),
    (protestant_vendor_id,'grace.books@mail.haymanote.com',    'Grace Books',      'vendor', 'protestant', 'Grace Books & Media', TRUE, 'APPROVED', 'ACTIVE', '2025-02-15 09:00:00+00'),

    -- Admin
    (admin_id,            'admin@mail.haymanote.com',          'Haymanote Admin',  'admin',  'orthodox',   NULL,               TRUE, 'APPROVED', 'ACTIVE', '2025-01-01 00:00:00+00');

    -- ============================================
    -- LEADER PROFILES
    -- ============================================
    INSERT INTO leader_profiles (user_id, bio, status, verification_document_url) VALUES
    (orthodox_leader_id,    'Serving as priest for 20 years at Debre Berhan Selassie Church. Provides spiritual counsel and leads community outreach programs.', 'VERIFIED', 'https://example.com/docs/abune_germame_credential.pdf'),
    (muslim_leader_id,      'Imam and Quranic scholar with 15 years of teaching experience. Holds a degree in Islamic Studies from Al-Azhar University.',          'VERIFIED', 'https://example.com/docs/sheikh_ahmed_credential.pdf'),
    (protestant_leader_id,  'Lead pastor with a passion for youth ministry and community service. Graduate of Ethiopian Graduate School of Theology.',               'VERIFIED', 'https://example.com/docs/pastor_markos_credential.pdf');

    -- ============================================
    -- VENDOR PROFILES
    -- ============================================
    INSERT INTO vendor_profiles (user_id, organization_name, status) VALUES
    (orthodox_vendor_id,    'Kidus Maket PLC',      'VERIFIED'),
    (muslim_vendor_id,      'Halal Goods Trading',   'VERIFIED'),
    (protestant_vendor_id,  'Grace Books & Media',   'VERIFIED');

    -- ============================================
    -- POSTS (Community Q&A / Stories)
    -- ============================================
    INSERT INTO posts (id, author_id, title, content, status, tags, religion, view_count, likes_count, comments_count, leader_responses_count, image_url, created_at) VALUES
    (post_orthodox_1, orthodox_member_id,  'Preparing for Timkat spiritually',
     'As Timkat approaches, I want to focus on the spiritual meaning rather than just the celebration. How do you prepare your heart for this holy season?',
     'PUBLISHED', ARRAY['timkat', 'epiphany', 'preparation'], 'orthodox', 142, 18, 3, 1, NULL, '2025-03-01 09:00:00+00'),
    (post_orthodox_2, orthodox_leader_id,  'The importance of daily prayer rule',
     'Many ask me: what is the minimum prayer rule for a busy Orthodox Christian? Let me share some guidance from the Church Fathers.',
     'PUBLISHED', ARRAY['prayer', 'daily-rule', 'guidance'], 'orthodox', 89, 12, 2, 0, NULL, '2025-03-05 06:30:00+00'),
    (post_muslim_1, muslim_member_id,      'Tips for staying consistent with Tahajjud',
     'I want to make Tahajjud prayer a regular part of my life. Those who pray it regularly, what advice do you have for consistency?',
     'PUBLISHED', ARRAY['tahajjud', 'night-prayer', 'consistency'], 'muslim', 210, 25, 4, 1, NULL, '2025-02-20 22:00:00+00'),
    (post_muslim_2, muslim_leader_id,     'Understanding the names of Allah',
     'A reflection on Al-Wadud (The Loving One) and how understanding this name transforms our relationship with our Creator.',
     'PUBLISHED', ARRAY['allah-names', 'reflection', 'tawheed'], 'muslim', 167, 22, 3, 0, NULL, '2025-03-10 05:00:00+00'),
    (post_protestant_1, protestant_member_id, 'How to grow in daily Bible reading',
     'I struggle with consistency in reading the Bible daily. What methods or plans have helped you stay on track?',
     'PUBLISHED', ARRAY['bible-reading', 'discipleship', 'daily-devotion'], 'protestant', 195, 30, 5, 1, NULL, '2025-02-25 07:00:00+00'),
    (post_protestant_2, protestant_leader_id, 'Finding hope in difficult times',
     'A sermon reflection on Romans 15:13 - May the God of hope fill you with all joy and peace as you trust in Him.',
     'PUBLISHED', ARRAY['hope', 'suffering', 'romans'], 'protestant', 134, 19, 2, 0, NULL, '2025-03-12 08:00:00+00');

    -- ============================================
    -- COMMENTS
    -- ============================================
    INSERT INTO comments (id, post_id, author_id, content, is_anonymous, parent_id, likes_count, is_helpful, is_leader_response, religion, created_at) VALUES
    (comment_1, post_orthodox_1, muslim_leader_id,  'Even as a Muslim, I admire the devotion of our Orthodox brothers during Timkat. Fasting and prayer unite us all.', FALSE, NULL, 7, TRUE,  FALSE, 'orthodox', '2025-03-01 12:00:00+00'),
    (comment_2, post_orthodox_1, orthodox_leader_id,'Beautiful question, my child. I will address this in my next sermon. For now, focus on confession and reconciliation before the feast.', FALSE, NULL, 15, TRUE, TRUE, 'orthodox', '2025-03-01 14:30:00+00'),
    (comment_3, post_muslim_1, muslim_leader_id,    'Start with just 2 rakats before Fajr. Consistency is better than quantity. May Allah accept your efforts.', FALSE, NULL, 20, TRUE, TRUE, 'muslim', '2025-02-21 05:00:00+00'),
    (comment_4, post_protestant_1, protestant_leader_id, 'I recommend starting with the Gospel of John, one chapter a day. Pair it with a devotional guide for context.', FALSE, NULL, 18, TRUE, TRUE, 'protestant', '2025-02-25 09:00:00+00');

    -- ============================================
    -- POST LIKES (conditional: 001-only table)
    -- ============================================
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'post_likes') THEN
        INSERT INTO post_likes (post_id, user_id) VALUES
        (post_orthodox_1, orthodox_leader_id),
        (post_orthodox_1, orthodox_vendor_id),
        (post_muslim_1,   muslim_leader_id),
        (post_muslim_1,   muslim_vendor_id),
        (post_protestant_1, protestant_leader_id);
    END IF;

    -- ============================================
    -- COMMENT LIKES (conditional: 001-only table)
    -- ============================================
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'comment_likes') THEN
        INSERT INTO comment_likes (comment_id, user_id) VALUES
        (comment_2, orthodox_member_id),
        (comment_3, muslim_member_id),
        (comment_4, protestant_member_id);
    END IF;

    -- ============================================
    -- SERMONS / TEACHINGS
    -- ============================================
    INSERT INTO sermons (id, author_id, title, content, published, religion, created_at) VALUES
    (sermon_orthodox_1, orthodox_leader_id, 'The Mystery of the Holy Trinity',
     'In the name of the Father, and the Son, and the Holy Spirit. Today we contemplate the central mystery of our Orthodox faith — the Holy Trinity. The Father is unbegotten, the Son is begotten of the Father, and the Holy Spirit proceeds from the Father. Yet they are one in essence, undivided, and worthy of equal glory and worship.',
     TRUE, 'orthodox', '2025-02-15 08:00:00+00'),
    (sermon_muslim_1, muslim_leader_id, 'The Mercy of Allah in Our Daily Lives',
     'Bismillah ir-Rahman ir-Rahim. Today we reflect on the names Ar-Rahman and Ar-Rahim. Every breath we take, every meal we eat, every moment of peace we enjoy — these are manifestations of Allah''s endless mercy. How can we embody this mercy in our dealings with others?',
     TRUE, 'muslim', '2025-02-18 13:00:00+00'),
    (sermon_protestant_1, protestant_leader_id, 'Faith That Moves Mountains',
     'In Matthew 17:20, Jesus tells us that faith as small as a mustard seed can move mountains. But what does this faith look like practically? It is not a magic formula, but a deep trust in God''s character and promises, even when circumstances seem impossible.',
     TRUE, 'protestant', '2025-02-20 10:00:00+00');

    -- ============================================
    -- SERMON LIKES
    -- ============================================
    INSERT INTO sermon_likes (sermon_id, user_id) VALUES
    (sermon_orthodox_1, orthodox_member_id),
    (sermon_muslim_1,   muslim_member_id),
    (sermon_protestant_1, protestant_member_id);

    -- ============================================
    -- LEADER RESPONSES
    -- ============================================
    INSERT INTO leader_responses (leader_id, content, post_id, created_at) VALUES
    (orthodox_leader_id,    'Begin by setting aside 15 minutes each morning. Read a portion of the Psalms, then pray the Jesus Prayer. Consistency matters more than duration.',  post_orthodox_1, '2025-03-02 07:00:00+00'),
    (muslim_leader_id,      'Set your intention (niyyah) before sleeping. Use an alarm, and remind yourself of the hadith: "The best prayer after the obligatory prayers is the night prayer."', post_muslim_1,   '2025-02-21 06:00:00+00'),
    (protestant_leader_id,  'Join a small group Bible study. Community accountability is one of the most effective ways to build a consistent reading habit.',                 post_protestant_1, '2025-02-26 08:00:00+00');

    -- ============================================
    -- PRAYERS
    -- ============================================
    INSERT INTO prayers (id, user_id, title, description, is_public, is_answered, prayed_count, religion, created_at) VALUES
    (prayer_orthodox_1, orthodox_member_id,   'For my mother''s health',       'Please pray for my mother who is recovering from surgery. May the Lord grant her strength and healing.', TRUE, FALSE, 12, 'orthodox', '2025-03-01 18:00:00+00'),
    (prayer_muslim_1,    muslim_member_id,    'Guidance in my career',         'I am at a crossroads in my career. I ask Allah to guide me to the path that is best for my dunya and akhirah.', FALSE, FALSE, 0, 'muslim', '2025-03-05 20:00:00+00'),
    (prayer_protestant_1, protestant_member_id, 'Peace for our community',     'Praying for unity and peace in our church community after recent disagreements.', TRUE, TRUE, 25, 'protestant', '2025-02-10 12:00:00+00');

    -- ============================================
    -- PRODUCTS (Marketplace)
    -- ============================================
    INSERT INTO products (id, vendor_id, title, description, price, image_url, category, stock, religion, created_at) VALUES
    (product_orthodox_1, orthodox_vendor_id, 'Handcrafted Procession Cross',   'Beautiful wooden procession cross with traditional Ethiopian Orthodox engravings.',            45.00, 'https://example.com/images/cross.jpg',       'Religious Items', 30, 'orthodox',  '2025-02-01 10:00:00+00'),
    (product_orthodox_2, orthodox_vendor_id, 'Icon of St. George',              'Hand-painted icon of Saint George, the patron saint of Ethiopia, on quality wood panel.',   120.00, 'https://example.com/images/st-george.jpg',   'Icons',          10, 'orthodox',  '2025-02-05 10:00:00+00'),
    (product_muslim_1,   muslim_vendor_id,   'Quran with Amharic Translation', 'Premium hardcover Quran with side-by-side Arabic and Amharic translation.',                    55.00, 'https://example.com/images/quran.jpg',       'Books',          25, 'muslim',    '2025-02-10 11:00:00+00'),
    (product_protestant_1, protestant_vendor_id, 'Worship Music Collection',   'Compilation of 30 contemporary Ethiopian worship songs across 2 CDs.',                         20.00, 'https://example.com/images/worship-cd.jpg',  'Music',          50, 'protestant', '2025-02-15 09:00:00+00');

    -- ============================================
    -- ORDERS & ORDER ITEMS
    -- ============================================
    INSERT INTO orders (id, buyer_id, total_amount, status, shipping_address, created_at) VALUES
    (order_1, orthodox_member_id, 165.00, 'DELIVERED', 'Bole Subcity, Addis Ababa, Ethiopia', '2025-03-10 14:00:00+00');

    INSERT INTO order_items (order_id, product_id, quantity, price) VALUES
    (order_1, product_orthodox_1, 1, 45.00),
    (order_1, product_orthodox_2, 1, 120.00);

    -- ============================================
    -- AI CONVERSATIONS & MESSAGES
    -- ============================================
    INSERT INTO ai_conversations (id, user_id, title, religion, created_at) VALUES
    (conv_1, orthodox_member_id,  'Questions about fasting periods', 'orthodox', '2025-03-02 20:00:00+00'),
    (conv_2, muslim_member_id,    'Learning Tajweed rules',         'muslim',   '2025-03-06 21:00:00+00');

    INSERT INTO ai_messages (conversation_id, role, content, created_at) VALUES
    (conv_1, 'user',     'What are the fasting periods in the Ethiopian Orthodox calendar?',                         '2025-03-02 20:01:00+00'),
    (conv_1, 'assistant', 'The Ethiopian Orthodox Church observes seven major fasting periods, including Lent (Hudade) for 55 days, the Fast of the Apostles, and the Fast of the Assumption.', '2025-03-02 20:01:15+00'),
    (conv_1, 'user',     'When does the Fast of the Assumption start?',                                             '2025-03-02 20:02:00+00'),
    (conv_1, 'assistant', 'The Fast of the Assumption (Filseta) begins on August 7 and ends on August 22, leading to the Feast of the Assumption on August 23.', '2025-03-02 20:02:10+00'),
    (conv_2, 'user',     'Can you explain the rule of Noon Sakinah in Tajweed?',                                    '2025-03-06 21:00:00+00'),
    (conv_2, 'assistant', 'Certainly. Noon Sakinah (noon with sukoon) has four rules: Izhar (clear pronunciation), Idgham (merging), Iqlab (conversion), and Ikhfa (hiding).', '2025-03-06 21:00:20+00');

    -- ============================================
    -- PRAYER TRACKER & STREAKS (conditional)
    -- ============================================
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'prayer_tracker') THEN
        INSERT INTO prayer_tracker (id, user_id, prayer_name, religion, completed_date) VALUES
        (tracker_1, orthodox_member_id,   'Morning Prayers',    'orthodox',   '2025-03-15 06:00:00+00'),
        (tracker_2, protestant_member_id, 'Daily Devotion',     'protestant', '2025-03-15 07:00:00+00');
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'prayer_streaks') THEN
        INSERT INTO prayer_streaks (user_id, prayer_id, current_streak, longest_streak, last_completed_date) VALUES
        (orthodox_member_id,   tracker_1, 5,  12, '2025-03-15 06:00:00+00'),
        (protestant_member_id, tracker_2, 10, 30, '2025-03-15 07:00:00+00');
    END IF;

    -- ============================================
    -- DONATION RECIPIENTS & DONATIONS (conditional)
    -- ============================================
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'donation_recipients') THEN
        INSERT INTO donation_recipients (id, religion, name, description, image_url, bank_account) VALUES
        (donor_orthodox, 'orthodox',   'Debre Berhan Selassie Church Restoration',   'Help restore the historic Debre Berhan Selassie Church in Gondar.',                                    'https://example.com/images/dbs-church.jpg',  '1000123456789'),
        (donor_muslim,   'muslim',     'Anwar Mosque Community Kitchen',             'Support the daily iftar meals serving hundreds during Ramadan and year-round.',                         'https://example.com/images/mosque-kitchen.jpg', '2000234567890'),
        (donor_protestant, 'protestant', 'Mekane Yesus Youth Scholarship Fund',      'Provide educational scholarships for underprivileged youth in our congregation.',                       'https://example.com/images/youth-scholarship.jpg','3000345678901');
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'donations') THEN
        INSERT INTO donations (user_id, recipient_id, amount, transaction_id, created_at) VALUES
        (orthodox_member_id,   donor_orthodox,    500.00, 'TXN-001-ORTHODOX',  '2025-03-08 10:00:00+00'),
        (muslim_member_id,     donor_muslim,      300.00, 'TXN-002-MUSLIM',    '2025-03-09 11:30:00+00'),
        (protestant_member_id, donor_protestant,  450.00, 'TXN-003-PROTESTANT','2025-03-10 09:00:00+00');
    END IF;

    -- ============================================
    -- BLOGS (conditional: may not exist if 001 wasn't run)
    -- ============================================
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'blogs') THEN
        INSERT INTO blogs (id, author_id, title, content, excerpt, cover_image, tags, published, view_count, likes_count, created_at) VALUES
        (blog_1, orthodox_leader_id, 'The Spiritual Discipline of Fasting',
         'Fasting is not merely abstaining from food. It is a spiritual discipline that trains the soul to overcome bodily desires and draw closer to God. In the Orthodox tradition, fasting is always accompanied by increased prayer and almsgiving...',
         'An Orthodox perspective on the purpose and practice of fasting beyond mere abstinence.',
         'https://example.com/images/fasting-blog.jpg', ARRAY['fasting', 'spiritual-discipline', 'orthodox-teaching'], TRUE, 340, 28, '2025-02-20 08:00:00+00'),
        (blog_2, protestant_leader_id, 'Building a Strong Christian Family',
         'The family is the first church. In a world that constantly challenges biblical values, how do we build homes that honor God? This begins with parents who model prayer, Scripture reading, and forgiveness...',
         'Practical advice for raising a Christ-centered family in modern Ethiopia.',
         'https://example.com/images/family-blog.jpg', ARRAY['family', 'parenting', 'christian-home'], TRUE, 275, 22, '2025-03-01 07:00:00+00');

        INSERT INTO blog_likes (blog_id, user_id) VALUES
        (blog_1, orthodox_member_id),
        (blog_1, orthodox_vendor_id),
        (blog_2, protestant_member_id);
    END IF;

    -- ============================================
    -- SAVED CONTENT (conditional)
    -- ============================================
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'saved_content') THEN
        INSERT INTO saved_content (user_id, content_type, content_id) VALUES
        (orthodox_member_id,  'POST', post_orthodox_2),
        (muslim_member_id,    'POST', post_muslim_2),
        (protestant_member_id, 'POST', post_protestant_1),
        (orthodox_member_id,  'BLOG', blog_1);
    END IF;

    -- ============================================
    -- REPORTS (for moderation testing, conditional)
    -- ============================================
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'reports') THEN
        INSERT INTO reports (reporter_id, target_type, target_id, reason, description, status, created_at) VALUES
        (orthodox_member_id, 'COMMENT', comment_1, 'OTHER', 'This comment seems off-topic for our Orthodox discussion.', 'PENDING',  '2025-03-02 16:00:00+00');
    END IF;

    -- ============================================
    -- VERIFICATION REQUESTS (conditional)
    -- ============================================
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'verification_requests') THEN
        INSERT INTO verification_requests (id, user_id, document_path, document_name, status, reviewed_by, reviewed_at, created_at) VALUES
        (ver_req_1, orthodox_leader_id,   'https://example.com/docs/abune_credential.pdf',   'ordination_certificate.pdf',   'APPROVED', admin_id, '2025-01-11 10:00:00+00', '2025-01-10 08:00:00+00'),
        (ver_req_2, protestant_leader_id, 'https://example.com/docs/markos_credential.pdf',  'theology_degree.pdf',          'APPROVED', admin_id, '2025-01-09 10:00:00+00', '2025-01-08 08:00:00+00');
    END IF;

    -- ============================================
    -- USER REPUTATION HISTORY (conditional)
    -- ============================================
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_reputation_history') THEN
        INSERT INTO user_reputation_history (user_id, action_type, points, reference_type, reference_id) VALUES
        (orthodox_member_id,   'POST_CREATED',           10, 'POST', post_orthodox_1),
        (orthodox_member_id,   'POST_LIKED',             5,  'POST', post_orthodox_1),
        (muslim_member_id,     'POST_CREATED',           10, 'POST', post_muslim_1),
        (muslim_member_id,     'COMMENT_CREATED',        3,  'COMMENT', comment_3),
        (protestant_member_id, 'POST_CREATED',           10, 'POST', post_protestant_1),
        (protestant_member_id, 'COMMENT_CREATED',        3,  'COMMENT', comment_4);
    END IF;

    -- Update reputation and badge for users
    UPDATE users SET reputation_score = 15, helpfulness_badge = 'BRONZE' WHERE id = orthodox_member_id;
    UPDATE users SET reputation_score = 13, helpfulness_badge = 'BRONZE' WHERE id = muslim_member_id;
    UPDATE users SET reputation_score = 13, helpfulness_badge = 'BRONZE' WHERE id = protestant_member_id;

    -- ============================================
    -- CREATE SUPABASE AUTH USERS (so mock users can log in)
    -- Password for all: Pass@123!
    -- ============================================
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') THEN
        INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, confirmation_sent_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud)
        SELECT id, email, crypt('password123', gen_salt('bf')), NOW(), NOW(),
               '{"provider":"email","providers":["email"]}',
               jsonb_build_object('religion', religion, 'role', role, 'organizationName', organization_name),
               NOW(), NOW(), 'authenticated', 'authenticated'
        FROM public.users
        WHERE id IN (orthodox_member_id, orthodox_leader_id, orthodox_vendor_id,
                     muslim_member_id, muslim_leader_id, muslim_vendor_id,
                     protestant_member_id, protestant_leader_id, protestant_vendor_id,
                     admin_id)
        ON CONFLICT (id) DO NOTHING;

        INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
        SELECT id, id,
               jsonb_build_object('sub', id::text, 'email', email),
               'email', email, NOW(), NOW(), NOW()
        FROM public.users
        WHERE id IN (orthodox_member_id, orthodox_leader_id, orthodox_vendor_id,
                     muslim_member_id, muslim_leader_id, muslim_vendor_id,
                     protestant_member_id, protestant_leader_id, protestant_vendor_id,
                     admin_id)
        ON CONFLICT (id) DO NOTHING;
    END IF;

END $$;

-- Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';
