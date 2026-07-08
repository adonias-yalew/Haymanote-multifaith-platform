-- 018_create_auth_users.sql
-- 1. Creates Supabase Auth entries for mock users created in 017
-- 2. Additional mock data: sermons, community posts, marketplace products
-- Run this AFTER 017_mock_data.sql has been executed.

-- Password for all users: Pass@123!
-- Meets Supabase requirements: 8+ chars, special char (@), number (123), uppercase (P)

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================
-- PART 1: CREATE/UPDATE SUPABASE AUTH USERS
-- ============================================

-- Update password for any auth users that may have been created with the old 'password123'
UPDATE auth.users
SET encrypted_password = crypt('Pass@123!', gen_salt('bf'))
WHERE id IN (
    'a0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000003',
    'b0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000002',
    'b0000000-0000-0000-0000-000000000003',
    'c0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000002',
    'c0000000-0000-0000-0000-000000000003',
    'd0000000-0000-0000-0000-000000000001'
);

-- Create auth users (skip if already exist)
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, confirmation_sent_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud)
SELECT
    id, email,
    crypt('Pass@123!', gen_salt('bf')),
    NOW(), NOW(),
    '{"provider":"email","providers":["email"]}',
    jsonb_build_object('religion', religion, 'role', role, 'organizationName', organization_name),
    NOW(), NOW(), 'authenticated', 'authenticated'
FROM public.users
WHERE id IN (
    'a0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000003',
    'b0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000002',
    'b0000000-0000-0000-0000-000000000003',
    'c0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000002',
    'c0000000-0000-0000-0000-000000000003',
    'd0000000-0000-0000-0000-000000000001'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
SELECT
    id, id,
    jsonb_build_object('sub', id::text, 'email', email),
    'email', email, NOW(), NOW(), NOW()
FROM public.users
WHERE id IN (
    'a0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000003',
    'b0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000002',
    'b0000000-0000-0000-0000-000000000003',
    'c0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000002',
    'c0000000-0000-0000-0000-000000000003',
    'd0000000-0000-0000-0000-000000000001'
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- PART 2: ADDITIONAL MOCK DATA
-- Sermons, community posts, marketplace products
-- ============================================

DO $$
DECLARE
    -- User ID shortcuts (from 017)
    orthodox_member_id   UUID := 'a0000000-0000-0000-0000-000000000001';
    orthodox_leader_id   UUID := 'a0000000-0000-0000-0000-000000000002';
    orthodox_vendor_id   UUID := 'a0000000-0000-0000-0000-000000000003';
    muslim_member_id     UUID := 'b0000000-0000-0000-0000-000000000001';
    muslim_leader_id     UUID := 'b0000000-0000-0000-0000-000000000002';
    muslim_vendor_id     UUID := 'b0000000-0000-0000-0000-000000000003';
    protestant_member_id UUID := 'c0000000-0000-0000-0000-000000000001';
    protestant_leader_id UUID := 'c0000000-0000-0000-0000-000000000002';
    protestant_vendor_id UUID := 'c0000000-0000-0000-0000-000000000003';

    -- New sermon IDs
    s_orth_2 UUID := 'aa000000-0000-0000-0000-000000000001';
    s_orth_3 UUID := 'aa000000-0000-0000-0000-000000000002';
    s_mus_2  UUID := 'aa000000-0000-0000-0000-000000000003';
    s_mus_3  UUID := 'aa000000-0000-0000-0000-000000000004';
    s_prot_2 UUID := 'aa000000-0000-0000-0000-000000000005';
    s_prot_3 UUID := 'aa000000-0000-0000-0000-000000000006';

    -- New post IDs
    p_orth_3 UUID := 'ab000000-0000-0000-0000-000000000001';
    p_orth_4 UUID := 'ab000000-0000-0000-0000-000000000002';
    p_mus_3  UUID := 'ab000000-0000-0000-0000-000000000003';
    p_mus_4  UUID := 'ab000000-0000-0000-0000-000000000004';
    p_prot_3 UUID := 'ab000000-0000-0000-0000-000000000005';
    p_prot_4 UUID := 'ab000000-0000-0000-0000-000000000006';

    -- New comment IDs
    c_5 UUID := 'ac000000-0000-0000-0000-000000000001';
    c_6 UUID := 'ac000000-0000-0000-0000-000000000002';
    c_7 UUID := 'ac000000-0000-0000-0000-000000000003';
    c_8 UUID := 'ac000000-0000-0000-0000-000000000004';

    -- New product IDs
    prod_orth_3 UUID := 'ad000000-0000-0000-0000-000000000001';
    prod_orth_4 UUID := 'ad000000-0000-0000-0000-000000000002';
    prod_mus_2  UUID := 'ad000000-0000-0000-0000-000000000003';
    prod_mus_3  UUID := 'ad000000-0000-0000-0000-000000000004';
    prod_prot_2 UUID := 'ad000000-0000-0000-0000-000000000005';
    prod_prot_3 UUID := 'ad000000-0000-0000-0000-000000000006';

BEGIN

    -- ============================================
    -- ADDITIONAL SERMONS (2 more per religion)
    -- ============================================
    INSERT INTO sermons (id, author_id, title, content, published, religion, created_at) VALUES

    -- Orthodox
    (s_orth_2, orthodox_leader_id, 'The Power of the Jesus Prayer',
     'The Jesus Prayer — "Lord Jesus Christ, Son of God, have mercy on me, a sinner" — is the prayer of the heart. It is not merely words repeated by the lips, but a cry from the depths of the soul. When we pray this prayer with attention and contrition, it becomes a living connection to Christ Himself. The hesychast fathers taught that this simple prayer can become as natural as breathing, uniting us constantly with God.',
     TRUE, 'orthodox', '2025-03-20 06:00:00+00'),
    (s_orth_3, orthodox_leader_id, 'Fasting as a Path to Liberation',
     'In our Orthodox tradition, fasting is not a punishment but a liberation. When we free ourselves from the tyranny of food and bodily desires, we create space for the Spirit to work within us. The great Lent is a school of repentance, teaching us to turn away from our passions and toward the light of Christ\'s Resurrection. Let us fast with joy, not with grim determination.',
     TRUE, 'orthodox', '2025-04-01 06:30:00+00'),

    -- Muslim
    (s_mus_2, muslim_leader_id, 'The Pillars of Faith: A Deeper Look',
     'Iman is not simply a declaration on the tongue. True faith manifests in the heart, the tongue, and the limbs. We believe in Allah, His angels, His books, His messengers, the Last Day, and divine decree. But how often do we reflect on what these pillars mean for our daily conduct? Today we explore how each pillar of faith should shape our character, our decisions, and our relationships with others.',
     TRUE, 'muslim', '2025-03-18 13:30:00+00'),
    (s_mus_3, muslim_leader_id, 'Patience in Times of Trial',
     'Allah tells us in the Quran: "Indeed, Allah is with the patient" (Al-Baqarah 2:153). Sabr is not passive waiting — it is active endurance, trust, and perseverance. In a world of instant gratification, we have forgotten the virtue of patience. This khutbah reflects on how the prophets exemplified sabr in the face of immense hardship and how we can cultivate this quality in our own lives.',
     TRUE, 'muslim', '2025-04-05 14:00:00+00'),

    -- Protestant
    (s_prot_2, protestant_leader_id, 'Walking in the Spirit',
     'Galatians 5:16 says, "Walk by the Spirit, and you will not gratify the desires of the flesh." But what does it truly mean to walk in the Spirit? It means daily surrender, moment-by-moment dependence on God, and allowing the Holy Spirit to produce His fruit in us — love, joy, peace, patience, kindness, goodness, faithfulness, gentleness, and self-control. Not by our strength, but by His.',
     TRUE, 'protestant', '2025-03-15 09:00:00+00'),
    (s_prot_3, protestant_leader_id, 'The Parable of the Prodigal Son',
     'The story of the prodigal son is not just about a wayward child — it is a revelation of the Father\'s heart. While the son was still far off, the father saw him and ran to embrace him. This is the God we serve: not distant and angry, but running toward us with open arms. Whether you feel like the prodigal or the elder brother, the Father\'s invitation stands open today.',
     TRUE, 'protestant', '2025-04-02 10:00:00+00');

    -- ============================================
    -- ADDITIONAL COMMUNITY POSTS (2 more per religion)
    -- ============================================
    INSERT INTO posts (id, author_id, title, content, status, tags, religion, view_count, likes_count, comments_count, leader_responses_count, image_url, created_at) VALUES

    -- Orthodox
    (p_orth_3, orthodox_member_id, 'Seeking advice on raising children in the faith',
     'As a young parent, I want my children to grow up loving the Orthodox Church and its traditions. But in today''s world, it''s challenging. How do other parents make the faith come alive for their kids without it feeling like a chore?',
     'PUBLISHED', ARRAY['parenting', 'children', 'faith-formation'], 'orthodox', 78, 14, 3, 0, NULL, '2025-04-10 08:00:00+00'),
    (p_orth_4, orthodox_member_id, 'Understanding the Divine Liturgy better',
     'I''ve been attending the Divine Liturgy my whole life, but I want to understand the symbolism behind each part more deeply. Can someone explain the significance of the Great Entrance and the Cherubic Hymn?',
     'PUBLISHED', ARRAY['liturgy', 'worship', 'symbolism'], 'orthodox', 95, 16, 2, 0, NULL, '2025-04-15 07:30:00+00'),

    -- Muslim
    (p_mus_3, muslim_member_id, 'Preparing for Ramadan: A checklist',
     'Ramadan is approaching and I want to be fully prepared this year — spiritually, physically, and mentally. What are your essential preparations? Let''s share tips on Quran reading plans, meal prep, and charity goals.',
     'PUBLISHED', ARRAY['ramadan', 'preparation', 'spiritual-goals'], 'muslim', 180, 28, 5, 0, NULL, '2025-04-05 21:00:00+00'),
    (p_mus_4, muslim_member_id, 'Dealing with gossip in the community',
     'Assalamu Alaikum. Our community has been struggling with gossip and backbiting. The Quran warns us about this, but it still happens. How do we address this gently without causing more division?',
     'PUBLISHED', ARRAY['community', 'gossip', 'unity'], 'muslim', 145, 20, 4, 0, NULL, '2025-04-12 20:00:00+00'),

    -- Protestant
    (p_prot_3, protestant_member_id, 'Worship styles: Contemporary vs. Traditional',
     'Our church is having discussions about worship style. Some prefer hymns and liturgy, others want contemporary worship songs. Can''t we have both? How does your church balance this?',
     'PUBLISHED', ARRAY['worship', 'church-culture', 'unity'], 'protestant', 120, 22, 6, 0, NULL, '2025-04-08 09:30:00+00'),
    (p_prot_4, protestant_member_id, 'Starting a small group: Lessons learned',
     'I started a small Bible study group in my neighborhood three months ago. Here are some things I''ve learned: keep it simple, focus on application not just knowledge, and build real friendships. Would love to hear others'' experiences!',
     'PUBLISHED', ARRAY['small-groups', 'discipleship', 'community'], 'protestant', 88, 15, 3, 0, NULL, '2025-04-18 08:00:00+00');

    -- ============================================
    -- ADDITIONAL COMMENTS
    -- ============================================
    INSERT INTO comments (id, post_id, author_id, content, is_anonymous, parent_id, likes_count, is_helpful, is_leader_response, religion, created_at) VALUES
    (c_5, p_orth_3, orthodox_leader_id, 'Bring them to church regularly, but more importantly, let them see you praying at home. Children learn faith by watching their parents live it.', FALSE, NULL, 12, TRUE, TRUE, 'orthodox', '2025-04-10 12:00:00+00'),
    (c_6, p_mus_3, muslim_leader_id, 'Start with sincere intention (niyyah). Then focus on Quran recitation — aim to complete at least one full reading during the month. And don''t forget to increase your sadaqah!', FALSE, NULL, 18, TRUE, TRUE, 'muslim', '2025-04-06 05:30:00+00'),
    (c_7, p_prot_3, protestant_leader_id, 'We use a blended approach — hymns during the first half, contemporary worship after the sermon. It took time but now both generations appreciate it.', FALSE, NULL, 15, TRUE, TRUE, 'protestant', '2025-04-08 14:00:00+00'),
    (c_8, p_prot_3, protestant_member_id, 'I agree with blended worship! Also rotating who leads helps everyone feel invested.', FALSE, NULL, 6, FALSE, FALSE, 'protestant', '2025-04-08 16:00:00+00');

    -- ============================================
    -- ADDITIONAL MARKETPLACE PRODUCTS (2 more per religion)
    -- ============================================
    INSERT INTO products (id, vendor_id, title, description, price, image_url, category, stock, religion, created_at) VALUES

    -- Orthodox
    (prod_orth_3, orthodox_vendor_id, 'Incense Burner & Frankincense Set',
     'Traditional Ethiopian Orthodox incense burner (mebasha) made of brass, with pure frankincense from Tigray. Perfect for home prayer corners.', 85.00, 'https://example.com/images/incense-set.jpg', 'Religious Items', 20, 'orthodox', '2025-03-01 10:00:00+00'),
    (prod_orth_4, orthodox_vendor_id, 'Ethiopian Orthodox Prayer Book (Mezmur)',
     'Complete prayer book containing daily prayers, Psalms, and hymns for the liturgical year. In Ge''ez with Amharic translation.', 60.00, 'https://example.com/images/mezmur.jpg', 'Books', 15, 'orthodox', '2025-03-15 10:00:00+00'),

    -- Muslim
    (prod_mus_2, muslim_vendor_id, 'Prayer Rug & Beads Combo',
     'High-quality machine-woven prayer rug with built-in compass, paired with a 99-bead misbaha (prayer beads). Available in green and burgundy.', 40.00, 'https://example.com/images/prayer-rug.jpg', 'Religious Items', 35, 'muslim', '2025-03-05 11:00:00+00'),
    (prod_mus_3, muslim_vendor_id, 'Halal Gift Basket',
     'Curated gift box of halal-certified Ethiopian coffee, dates, honey, and traditional snacks. Perfect for Ramadan gifts or Eid celebrations.', 65.00, 'https://example.com/images/gift-basket.jpg', 'Food & Gifts', 25, 'muslim', '2025-03-20 11:30:00+00'),

    -- Protestant
    (prod_prot_2, protestant_vendor_id, 'ESV Study Bible (Amharic-English)',
     'The English Standard Version study Bible with side-by-side Amharic translation. Includes maps, commentary, and reading plans.', 75.00, 'https://example.com/images/study-bible.jpg', 'Books', 30, 'protestant', '2025-03-10 09:00:00+00'),
    (prod_prot_3, protestant_vendor_id, 'Worship Team Bundle: Guitar & Hymnal',
     'Acoustic guitar starter bundle with 100-sheet Ethiopian Praise & Worship hymnal. Everything a worship team member needs.', 250.00, 'https://example.com/images/guitar-bundle.jpg', 'Music', 10, 'protestant', '2025-03-25 09:30:00+00');

END $$;

NOTIFY pgrst, 'reload schema';
