-- 021_more_sermons_marketplace_donations_community.sql
-- Adds more mock data for sermons, marketplace products, donations,
-- and community posts across all three religions.
--
-- Password for all auth user operations: Pass@123!

-- ============================================
-- Additional mock data
-- ============================================

DO $$
DECLARE
    -- User shortcuts (same UUIDs from 017)
    orthodox_member_id    UUID := 'a0000000-0000-0000-0000-000000000001';
    orthodox_leader_id    UUID := 'a0000000-0000-0000-0000-000000000002';
    orthodox_vendor_id    UUID := 'a0000000-0000-0000-0000-000000000003';
    muslim_member_id      UUID := 'b0000000-0000-0000-0000-000000000001';
    muslim_leader_id      UUID := 'b0000000-0000-0000-0000-000000000002';
    muslim_vendor_id      UUID := 'b0000000-0000-0000-0000-000000000003';
    protestant_member_id  UUID := 'c0000000-0000-0000-0000-000000000001';
    protestant_leader_id  UUID := 'c0000000-0000-0000-0000-000000000002';
    protestant_vendor_id  UUID := 'c0000000-0000-0000-0000-000000000003';
    admin_id              UUID := 'd0000000-0000-0000-0000-000000000001';

    -- New sermon IDs (3 per religion)
    s_orth_4 UUID := 'ae000000-0000-0000-0000-000000000001';
    s_orth_5 UUID := 'ae000000-0000-0000-0000-000000000002';
    s_orth_6 UUID := 'ae000000-0000-0000-0000-000000000003';
    s_mus_4  UUID := 'ae000000-0000-0000-0000-000000000004';
    s_mus_5  UUID := 'ae000000-0000-0000-0000-000000000005';
    s_mus_6  UUID := 'ae000000-0000-0000-0000-000000000006';
    s_prot_4 UUID := 'ae000000-0000-0000-0000-000000000007';
    s_prot_5 UUID := 'ae000000-0000-0000-0000-000000000008';
    s_prot_6 UUID := 'ae000000-0000-0000-0000-000000000009';

    -- New post IDs (3 per religion)
    p_orth_5 UUID := 'af000000-0000-0000-0000-000000000001';
    p_orth_6 UUID := 'af000000-0000-0000-0000-000000000002';
    p_orth_7 UUID := 'af000000-0000-0000-0000-000000000003';
    p_mus_5  UUID := 'af000000-0000-0000-0000-000000000004';
    p_mus_6  UUID := 'af000000-0000-0000-0000-000000000005';
    p_mus_7  UUID := 'af000000-0000-0000-0000-000000000006';
    p_prot_5 UUID := 'af000000-0000-0000-0000-000000000007';
    p_prot_6 UUID := 'af000000-0000-0000-0000-000000000008';
    p_prot_7 UUID := 'af000000-0000-0000-0000-000000000009';

    -- New comment IDs
    c_9  UUID := 'a0000000-000a-0000-0000-000000000001';
    c_10 UUID := 'a0000000-000a-0000-0000-000000000002';
    c_11 UUID := 'a0000000-000a-0000-0000-000000000003';
    c_12 UUID := 'a0000000-000a-0000-0000-000000000004';
    c_13 UUID := 'a0000000-000a-0000-0000-000000000005';
    c_14 UUID := 'a0000000-000a-0000-0000-000000000006';

    -- New product IDs (2 per religion)
    prod_orth_5 UUID := 'a0000000-000b-0000-0000-000000000001';
    prod_orth_6 UUID := 'a0000000-000b-0000-0000-000000000002';
    prod_mus_4  UUID := 'a0000000-000b-0000-0000-000000000003';
    prod_mus_5  UUID := 'a0000000-000b-0000-0000-000000000004';
    prod_prot_4 UUID := 'a0000000-000b-0000-0000-000000000005';
    prod_prot_5 UUID := 'a0000000-000b-0000-0000-000000000006';

    -- New donation recipient IDs (1 per religion)
    don_recip_4 UUID := 'a0000000-000c-0000-0000-000000000001';
    don_recip_5 UUID := 'a0000000-000c-0000-0000-000000000002';
    don_recip_6 UUID := 'a0000000-000c-0000-0000-000000000003';

    -- New order IDs
    order_2 UUID := 'a0000000-000d-0000-0000-000000000001';
    order_3 UUID := 'a0000000-000d-0000-0000-000000000002';

BEGIN

    -- ============================================
    -- ADDITIONAL SERMONS (3 more per religion)
    -- ============================================
    INSERT INTO sermons (id, author_id, title, content, published, religion, created_at) VALUES

    -- Orthodox
    (s_orth_4, orthodox_leader_id, 'The Mystery of the Holy Trinity',
     'The doctrine of the Holy Trinity is the foundation of our Orthodox faith. One God in three persons — Father, Son, and Holy Spirit — not three gods but one God. St. Athanasius taught that the Son is of one substance with the Father, and the Holy Spirit proceeds from the Father. This mystery is not meant to be fully understood by the human mind but to be experienced through prayer and participation in the sacramental life of the Church.',
     TRUE, 'orthodox', '2025-04-20 06:30:00+00'),
    (s_orth_5, orthodox_leader_id, 'Repentance as a Path to Renewal',
     'In the Orthodox tradition, repentance (metanoia) is not merely feeling sorry for sins — it is a complete transformation of the mind and heart. It is turning away from the darkness of sin and toward the light of Christ. As St. John Climacus wrote, "Repentance is the renewal of baptism." Every moment is an opportunity to begin again, to shed the old self, and to put on Christ.',
     TRUE, 'orthodox', '2025-05-05 06:00:00+00'),
    (s_orth_6, orthodox_leader_id, 'Theosis: Becoming Partakers of Divine Nature',
     'The ultimate goal of the Christian life in Orthodox teaching is theosis — deification. Not that we become God by nature, but that we participate in God''s divine energies through grace. As St. Peter writes, we become "partakers of the divine nature" (2 Peter 1:4). Through prayer, fasting, the sacraments, and a life of virtue, we are gradually transformed to reflect the glory of God more fully.',
     TRUE, 'orthodox', '2025-05-20 06:00:00+00'),

    -- Muslim
    (s_mus_4, muslim_leader_id, 'The Importance of Sincere Intention (Niyyah)',
     'The Prophet Muhammad (peace be upon him) said, "Actions are judged by intentions." Every act of worship, every good deed, begins with niyyah — the intention of the heart. A deed done without sincere intention for Allah''s sake becomes mere habit. But when we purify our intention, even our daily activities — eating, sleeping, working — become acts of worship. Today we explore how to cultivate and maintain sincere intention in all aspects of life.',
     TRUE, 'muslim', '2025-04-25 13:00:00+00'),
    (s_mus_5, muslim_leader_id, 'Gratitude: The Key to Increase',
     'Allah says in the Quran: "If you are grateful, I will surely increase you" (Ibrahim 14:7). Gratitude (shukr) is not just saying Alhamdulillah — it is a state of the heart that manifests in action. When we recognize every blessing as coming from Allah and use those blessings in ways that please Him, our provision increases, our faith strengthens, and our peace deepens. Learn how to transform your life through the power of gratitude.',
     TRUE, 'muslim', '2025-05-10 14:30:00+00'),
    (s_mus_6, muslim_leader_id, 'Building Strong Family Ties in Islam',
     'The family is the foundation of the Muslim community. The Quran and Sunnah place great emphasis on maintaining family ties (silat ar-rahim). From honoring parents to being kind to spouses and raising righteous children, Islam provides comprehensive guidance for every family relationship. This khutbah offers practical advice on strengthening family bonds in the challenges of modern life.',
     TRUE, 'muslim', '2025-05-25 13:45:00+00'),

    -- Protestant
    (s_prot_4, protestant_leader_id, 'The Power of Forgiveness',
     'Ephesians 4:32 calls us to "be kind to one another, tenderhearted, forgiving one another, as God in Christ forgave you." Forgiveness is not optional for the Christian — it is a direct reflection of the gospel we have received. Yet it is one of the hardest commands to obey. When we withhold forgiveness, we imprison ourselves in bitterness. When we forgive, we walk in the freedom Christ purchased for us.',
     TRUE, 'protestant', '2025-04-22 09:30:00+00'),
    (s_prot_5, protestant_leader_id, 'Equipped for Every Good Work',
     '2 Timothy 3:16-17 declares that all Scripture is God-breathed and useful for teaching, rebuking, correcting, and training in righteousness, so that the servant of God may be thoroughly equipped for every good work. The Bible is not a textbook for academic study but a living Word that transforms us and prepares us for the specific works God has prepared for us. Are you letting Scripture equip you?',
     TRUE, 'protestant', '2025-05-08 10:00:00+00'),
    (s_prot_6, protestant_leader_id, 'Abiding in Christ: The Secret of Fruitfulness',
     'In John 15, Jesus gives us the metaphor of the vine and the branches. "Abide in me, and I in you. As the branch cannot bear fruit by itself, unless it abides in the vine, neither can you, unless you abide in me." So many of us strive and struggle to produce spiritual fruit in our own strength. But fruitfulness comes not from striving but from abiding — remaining in constant connection with Christ through prayer, Scripture, and obedience.',
     TRUE, 'protestant', '2025-05-22 10:30:00+00');

    -- ============================================
    -- ADDITIONAL COMMUNITY POSTS (3 per religion)
    -- ============================================
    INSERT INTO posts (id, author_id, title, content, status, tags, religion, view_count, likes_count, comments_count, leader_responses_count, image_url, created_at) VALUES

    -- Orthodox
    (p_orth_5, orthodox_member_id, 'Iconography: More Than Just Religious Art',
     'I''ve recently started learning about iconography and I''m amazed by the theology behind it. Icons are not just decorative — they are windows into heaven. I''d love to hear from others about their favorite icons and what they''ve learned about the theological meaning behind the colors and symbols.',
     'PUBLISHED', ARRAY['iconography', 'theology', 'orthodox-art'], 'orthodox', 67, 11, 2, 0, NULL, '2025-05-01 08:30:00+00'),
    (p_orth_6, orthodox_member_id, 'How to Observe the Fast of the Apostles',
     'The Fast of the Apostles is approaching (June). Unlike Lent, this fast is often overlooked. I want to be intentional about observing it this year. What are your traditions and practices for this fasting period? Any good recipes?',
     'PUBLISHED', ARRAY['fasting', 'apostles-fast', 'traditions'], 'orthodox', 82, 15, 4, 0, NULL, '2025-05-10 07:45:00+00'),
    (p_orth_7, orthodox_leader_id, 'The Role of the Spiritual Father in Orthodox Life',
     'Having a spiritual father (confessor) is a cherished tradition in Orthodoxy. A good spiritual father guides us not by imposing rules but by helping us discern God''s will for our unique circumstances. I share some thoughts on how to choose a spiritual father and what to expect from the relationship.',
     'PUBLISHED', ARRAY['spiritual-father', 'confession', 'guidance'], 'orthodox', 112, 20, 5, 0, NULL, '2025-05-15 06:15:00+00'),

    -- Muslim
    (p_mus_5, muslim_member_id, 'Benefits of Fasting Sunnah Days',
     'Beyond Ramadan, there are many blessed days to fast: Mondays and Thursdays, the White Days (13th-15th of each lunar month), and the Day of Arafah. I''ve been trying to incorporate these into my routine and the spiritual benefits are incredible. What are your experiences with sunnah fasting?',
     'PUBLISHED', ARRAY['fasting', 'sunnah', 'spiritual-growth'], 'muslim', 156, 24, 6, 0, NULL, '2025-04-28 20:30:00+00'),
    (p_mus_6, muslim_member_id, 'Memorizing the Quran: Tips and Motivation',
     'I''ve started memorizing Surah Al-Mulk and I''m looking for effective memorization techniques. I find that listening to recitations while reading along helps, and reviewing before sleep solidifies what I''ve learned. What methods have worked for you? Let''s encourage each other on this blessed journey.',
     'PUBLISHED', ARRAY['quran', 'memorization', 'hifdh'], 'muslim', 198, 31, 7, 0, NULL, '2025-05-05 21:15:00+00'),
    (p_mus_7, muslim_leader_id, 'The Concept of Ummah: Beyond Borders',
     'The Ummah of Muhammad (peace be upon him) is not limited by nationality, ethnicity, or language. We are one body — when one part hurts, the whole body feels the pain. In a world of division, how can we strengthen our sense of brotherhood and sisterhood? How can we support our fellow Muslims locally and globally?',
     'PUBLISHED', ARRAY['ummah', 'unity', 'brotherhood'], 'muslim', 132, 22, 4, 0, NULL, '2025-05-12 19:00:00+00'),

    -- Protestant
    (p_prot_5, protestant_member_id, 'Dealing with Doubt in Your Faith Journey',
     'I went through a season of doubt last year where I questioned everything I believed. At first I felt guilty, like I was betraying God. But I''ve learned that doubt is not the opposite of faith — it''s a part of faith. God is big enough to handle our questions. How have you navigated seasons of doubt?',
     'PUBLISHED', ARRAY['doubt', 'faith', 'struggles'], 'protestant', 168, 27, 8, 0, NULL, '2025-04-30 09:00:00+00'),
    (p_prot_6, protestant_member_id, 'Serving in Your Local Church: Finding Your Place',
     'Every believer has been given gifts to serve the body of Christ. But finding where you fit can be challenging. I started in the children''s ministry and discovered a passion I never knew I had. If you''re unsure about your place of service, start by praying, talking to your pastor, and trying different areas. Don''t be afraid to step out!',
     'PUBLISHED', ARRAY['service', 'church', 'spiritual-gifts'], 'protestant', 95, 18, 4, 0, NULL, '2025-05-08 08:30:00+00'),
    (p_prot_7, protestant_leader_id, 'The Importance of Biblical Community',
     'Hebrews 10:24-25 urges us not to neglect meeting together. In an age of online streaming and individualized faith, we must remember that Christianity was never meant to be lived alone. Biblical community provides accountability, encouragement, and a context for spiritual growth. Here''s why gathering together matters more than ever.',
     'PUBLISHED', ARRAY['community', 'fellowship', 'church-life'], 'protestant', 78, 14, 3, 0, NULL, '2025-05-18 09:15:00+00');

    -- ============================================
    -- ADDITIONAL COMMENTS
    -- ============================================
    INSERT INTO comments (id, post_id, author_id, content, is_anonymous, parent_id, likes_count, is_helpful, is_leader_response, religion, created_at) VALUES
    (c_9,  p_orth_5, orthodox_leader_id, 'The use of gold in icons represents the divine light of Tabor — the uncreated light that the disciples saw at the Transfiguration. This is why iconographers use gold leaf as a symbol of God''s presence.', FALSE, NULL, 8, TRUE, TRUE, 'orthodox', '2025-05-01 12:00:00+00'),
    (c_10, p_mus_5,  muslim_leader_id, 'A reminder: the Prophet (peace be upon him) said that fasting on Monday and Thursday is like having a good deed recorded for every day of the week. Consistency is better than intensity — even two days a week can transform your spiritual life.', FALSE, NULL, 14, TRUE, TRUE, 'muslim', '2025-04-28 23:00:00+00'),
    (c_11, p_prot_5, protestant_leader_id, 'C.S. Lewis said, "A man can no more diminish God''s glory by refusing to worship Him than a lunatic can put out the sun by scribbling the word ''darkness'' on the walls of his cell." Your doubts don''t diminish God — they can actually deepen your faith when you bring them honestly before Him.', FALSE, NULL, 19, TRUE, TRUE, 'protestant', '2025-04-30 14:00:00+00'),
    (c_12, p_orth_6, orthodox_member_id, 'I love making lentil soup during the Apostles Fast. Simple, nutritious, and helps keep the focus on prayer rather than elaborate meals.', FALSE, NULL, 5, FALSE, FALSE, 'orthodox', '2025-05-10 14:00:00+00'),
    (c_13, p_mus_6,  muslim_member_id, 'I recommend the Tarteel app for memorization — it highlights the verse you''re reciting and helps with repetition. Also, find a memorization buddy for accountability!', FALSE, NULL, 7, FALSE, FALSE, 'muslim', '2025-05-06 09:00:00+00'),
    (c_14, p_prot_6, protestant_member_id, 'I started in the tech team running slides and discovered I love serving behind the scenes. There''s a place for everyone!', FALSE, NULL, 4, FALSE, FALSE, 'protestant', '2025-05-08 16:00:00+00');

    -- ============================================
    -- ADDITIONAL MARKETPLACE PRODUCTS (2 per religion)
    -- ============================================
    INSERT INTO products (id, vendor_id, title, description, price, image_url, category, stock, religion, created_at) VALUES

    -- Orthodox
    (prod_orth_5, orthodox_vendor_id, 'Hand-Painted Icon of St. George',
     'Beautiful hand-painted icon of St. George the Victory-Bearer on wood panel. Painted by a monk from Debre Libanos monastery using traditional egg tempera technique. Each icon is blessed before shipping.', 180.00, 'https://example.com/images/st-george-icon.jpg', 'Religious Items', 5, 'orthodox', '2025-04-01 10:00:00+00'),
    (prod_orth_6, orthodox_vendor_id, 'Ethiopian Cross Necklace (Silver)',
     'Intricately designed silver Ethiopian Orthodox cross pendant with chain. Each cross is handmade by skilled silversmiths in Aksum. Comes in a gift box with a prayer card.', 95.00, 'https://example.com/images/cross-necklace.jpg', 'Jewelry', 25, 'orthodox', '2025-04-10 10:00:00+00'),

    -- Muslim
    (prod_mus_4, muslim_vendor_id, 'Quran with Amharic Translation (3-Volume Set)',
     'Complete Quran with original Arabic text facing page and clear Amharic translation. Includes tafsir footnotes for deeper understanding. Beautiful hardcover binding with gold embossing.', 120.00, 'https://example.com/images/quran-set.jpg', 'Books', 15, 'muslim', '2025-04-05 11:00:00+00'),
    (prod_mus_5, muslim_vendor_id, 'Oud Attar Perfume Oil (Premium)',
     'Traditional Arabian oud perfume oil, 12ml roll-on. Made from pure agarwood oil with no alcohol. Long-lasting fragrance suitable for daily wear and Jumuah. Comes in a decorative glass bottle.', 55.00, 'https://example.com/images/oud-perfume.jpg', 'Personal Care', 30, 'muslim', '2025-04-15 11:30:00+00'),

    -- Protestant
    (prod_prot_4, protestant_vendor_id, 'Worship Songbook: 50 Ethiopian Praise Songs',
     'Comprehensive songbook with chords and lyrics for 50 popular Ethiopian praise and worship songs. Includes both Amharic and English lyrics. Spiral-bound for easy use on music stands.', 35.00, 'https://example.com/images/songbook.jpg', 'Music', 40, 'protestant', '2025-04-08 09:00:00+00'),
    (prod_prot_5, protestant_vendor_id, 'Bible Journaling Kit',
     'Complete journaling Bible kit: ESV Journaling Bible (compact size), set of 12 no-bleed gel pens, 3 stencils, washi tape set, and a beginner''s guide to Bible journaling. Everything you need to start creatively engaging with Scripture.', 65.00, 'https://example.com/images/journaling-kit.jpg', 'Books', 20, 'protestant', '2025-04-20 09:30:00+00');

    -- ============================================
    -- ADDITIONAL ORDERS
    -- ============================================
    INSERT INTO orders (id, buyer_id, total_amount, status, shipping_address, created_at) VALUES
    (order_2, muslim_member_id, 175.00, 'SHIPPED', 'Kazanches Subcity, Addis Ababa, Ethiopia', '2025-04-20 15:30:00+00'),
    (order_3, protestant_member_id, 100.00, 'PENDING', 'Megenagna Subcity, Addis Ababa, Ethiopia', '2025-05-10 14:00:00+00');

    INSERT INTO order_items (order_id, product_id, quantity, price) VALUES
    (order_2, prod_mus_4, 1, 120.00),
    (order_2, prod_mus_5, 1, 55.00),
    (order_3, prod_prot_4, 2, 35.00),
    (order_3, prod_prot_5, 1, 65.00);

    -- ============================================
    -- ADDITIONAL DONATION RECIPIENTS & DONATIONS (conditional)
    -- ============================================
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'donation_recipients') THEN
        INSERT INTO donation_recipients (id, religion, name, description, image_url, bank_account) VALUES
        (don_recip_4, 'orthodox',   'Lalibela Rock-Hewn Churches Preservation',  'Support the ongoing preservation of the UNESCO World Heritage rock-hewn churches of Lalibela.',        'https://example.com/images/lalibela.jpg',    '4000456789012'),
        (don_recip_5, 'muslim',     'Harar Jugol Old City Water Project',        'Provide clean water access to families in the historic walled city of Harar.',                         'https://example.com/images/harar-water.jpg', '5000567890123'),
        (don_recip_6, 'protestant', 'Ethiopian Bible Translation Fund',           'Help translate the Bible into minority Ethiopian languages that still lack Scripture in their heart language.', 'https://example.com/images/bible-translation.jpg', '6000678901234');

        INSERT INTO donations (user_id, recipient_id, amount, transaction_id, created_at) VALUES
        (orthodox_vendor_id, don_recip_4, 1000.00, 'TXN-004-LALIBELA',    '2025-04-15 08:00:00+00'),
        (muslim_vendor_id,   don_recip_5, 750.00,  'TXN-005-HARAR-WATER', '2025-04-20 09:00:00+00'),
        (protestant_vendor_id, don_recip_6, 500.00, 'TXN-006-BIBLE-TRANSL','2025-04-25 10:00:00+00'),
        (orthodox_member_id, don_recip_4, 250.00,  'TXN-007-LALIBELA-2',  '2025-05-01 11:00:00+00'),
        (muslim_member_id,   don_recip_5, 300.00,  'TXN-008-HARAR-2',     '2025-05-05 12:00:00+00');
    END IF;

    -- ============================================
    -- AI CONVERSATIONS (one new per religion)
    -- ============================================
    INSERT INTO ai_conversations (id, user_id, title, religion, created_at) VALUES
    ('a0000000-000e-0000-0000-000000000001', protestant_member_id, 'Understanding the Book of Revelation', 'protestant', '2025-05-12 19:30:00+00'),
    ('a0000000-000e-0000-0000-000000000002', orthodox_member_id,   'Steps of Orthodox Baptism',           'orthodox',   '2025-05-15 20:00:00+00'),
    ('a0000000-000e-0000-0000-000000000003', muslim_member_id,     'Rules of Zakat Calculation',          'muslim',     '2025-05-18 21:00:00+00');

    INSERT INTO ai_messages (conversation_id, role, content, created_at) VALUES
    -- Protestant: Revelation
    ('a0000000-000e-0000-0000-000000000001', 'user',      'Can you explain the seven churches in Revelation chapters 2-3 and what they represent?', '2025-05-12 19:31:00+00'),
    ('a0000000-000e-0000-0000-000000000001', 'assistant', 'The seven churches in Revelation 2-3 represent seven historical churches in Asia Minor and seven types of spiritual conditions. Ephesus represents lost first love, Smyrna represents faithful suffering, Pergamum represents compromise with the world, Thyatira represents tolerance of false teaching, Sardis represents spiritual death, Philadelphia represents faithful witness, and Laodicea represents lukewarmness. Each message speaks to both its historical context and to spiritual conditions present in churches today.', '2025-05-12 19:31:20+00'),
    -- Orthodox: Baptism
    ('a0000000-000e-0000-0000-000000000002', 'user',      'What are the steps of Orthodox baptism for an adult convert?', '2025-05-15 20:01:00+00'),
    ('a0000000-000e-0000-0000-000000000002', 'assistant', 'Adult baptism in the Orthodox Church follows several steps: 1) Catechesis — a period of learning the faith, 2) Renunciation of Satan and union with Christ, 3) The Creed recited by the catechumen, 4) Blessing of the water, 5) Anointing with oil, 6) Triple immersion in the name of the Father, Son, and Holy Spirit, 7) Chrismation (anointing with Holy Chrism), 8) Tonsure, and 9) First Holy Communion. The entire service is rich with symbolic meaning and connects the convert to the full life of the Church.', '2025-05-15 20:01:30+00'),
    -- Muslim: Zakat
    ('a0000000-000e-0000-0000-000000000003', 'user',      'How do I calculate zakat on my savings and investments?', '2025-05-18 21:01:00+00'),
    ('a0000000-000e-0000-0000-000000000003', 'assistant', 'Zakat is 2.5% of your total wealth held for one lunar year. To calculate: 1) Add up all your savings, cash, gold, silver, business inventory, and investment value. 2) Subtract your immediate debts and expenses. 3) If the remaining amount exceeds the nisab (threshold, roughly the value of 85g of gold), multiply by 2.5%. For investments, zakat is due on the market value of shares plus any dividends received. For rental properties, zakat is due on the net rental income after expenses, not the property value. Consult a knowledgeable scholar for complex cases.', '2025-05-18 21:01:25+00'),
    ('a0000000-000e-0000-0000-000000000003', 'user',      'Is zakat due on gold jewelry I wear?', '2025-05-18 21:02:00+00'),
    ('a0000000-000e-0000-0000-000000000003', 'assistant', 'There is a difference of opinion among scholars. The majority view (Hanafi, Shafi''i, Hanbali) is that zakat is due on all gold and silver, including jewelry, if it reaches the nisab. The Maliki school considers personal-use jewelry exempt from zakat. Many contemporary scholars advise paying zakat on jewelry as a precaution, especially if the amount is significant. If your gold jewelry exceeds 85g in weight, the safest option is to pay 2.5% of its current market value annually.', '2025-05-18 21:02:15+00');

    -- ============================================
    -- BLOGS (conditional, one per religion)
    -- ============================================
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'blogs') THEN
        INSERT INTO blogs (id, author_id, title, content, excerpt, cover_image, tags, published, view_count, likes_count, created_at) VALUES
        ('a0000000-000f-0000-0000-000000000001', muslim_leader_id, 'The Spiritual Benefits of Fasting in Islam',
         'Fasting is not merely abstaining from food and drink. It is a comprehensive spiritual discipline that trains the soul in taqwa (God-consciousness). When we fast, we learn to control our desires, empathize with the hungry, and prioritize our relationship with Allah over physical needs. The Quran says, "O you who have believed, decreed upon you is fasting as it was decreed upon those before you that you may become righteous" (Al-Baqarah 2:183). This article explores the deeper dimensions of fasting beyond the physical act.',
         'An exploration of how Islamic fasting cultivates God-consciousness and spiritual growth.',
         'https://example.com/images/islamic-fasting.jpg', ARRAY['fasting', 'ramadan', 'spirituality', 'islam'], TRUE, 210, 18, '2025-04-10 14:00:00+00'),
        ('a0000000-000f-0000-0000-000000000002', protestant_leader_id, 'Discipling the Next Generation',
         'The church is only one generation away from extinction. This sobering reality calls us to intentional discipleship of our young people. We cannot assume that children who grow up in church will automatically develop a vibrant faith. They need mentors, they need to see authentic faith modeled, and they need opportunities to own their faith personally. This post shares practical strategies for parents, youth leaders, and pastors to build a culture of discipleship.',
         'Why intentional discipleship of youth is crucial and how to do it effectively.',
         'https://example.com/images/discipleship.jpg', ARRAY['discipleship', 'youth', 'mentoring', 'next-generation'], TRUE, 185, 15, '2025-04-25 08:00:00+00'),
        ('a0000000-000f-0000-0000-000000000003', orthodox_leader_id, 'The Meaning of the Divine Liturgy',
         'Many Orthodox Christians attend the Divine Liturgy weekly without fully understanding its profound meaning. The Liturgy is not merely a service — it is a participation in the heavenly worship. The Proskomide, the Liturgy of the Catechumens, the Great Entrance, the Anaphora — each part carries deep theological significance. In this article, we walk through the Liturgy step by step, explaining the symbolism of each prayer and action, helping the faithful enter more fully into this mystery.',
         'A step-by-step guide to understanding the symbolism and theology of the Orthodox Divine Liturgy.',
         'https://example.com/images/divine-liturgy.jpg', ARRAY['liturgy', 'worship', 'orthodox', 'sacraments'], TRUE, 260, 24, '2025-05-05 06:00:00+00');
    END IF;

END $$;

NOTIFY pgrst, 'reload schema';
