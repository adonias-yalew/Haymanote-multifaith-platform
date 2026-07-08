CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    display_name TEXT,
    avatar_url TEXT,
    reputation_score INTEGER DEFAULT 0,
    helpfulness_badge TEXT,
    role TEXT DEFAULT 'MEMBER' CHECK (role IN ('MEMBER', 'LEADER', 'VENDOR', 'ADMIN')),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE leader_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    bio TEXT,
    status TEXT DEFAULT 'PENDING'
        CHECK (status IN ('PENDING', 'VERIFIED', 'REJECTED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE leader_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    leader_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    post_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE sermons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE sermon_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sermon_id UUID NOT NULL REFERENCES sermons(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (sermon_id, user_id)
);

CREATE TABLE prayers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    is_answered BOOLEAN DEFAULT FALSE,
    prayed_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    image_url TEXT,
    category TEXT NOT NULL,
    stock INTEGER DEFAULT 10,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    total_amount NUMERIC(10,2) NOT NULL,
    status TEXT DEFAULT 'PENDING'
        CHECK (status IN ('PENDING','SHIPPED','DELIVERED','CANCELLED')),
    shipping_address TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    price NUMERIC(10,2) NOT NULL
);

CREATE TABLE ai_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


CREATE TABLE ai_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user','assistant')),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_prayers_user ON prayers(user_id);
CREATE INDEX idx_prayers_public ON prayers(is_public);
CREATE INDEX idx_products_vendor ON products(vendor_id);
CREATE INDEX idx_orders_buyer ON orders(buyer_id);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_ai_conv_user ON ai_conversations(user_id);
CREATE INDEX idx_ai_msg_conv ON ai_messages(conversation_id);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_prayers_updated_at
BEFORE UPDATE ON prayers
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON products
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON orders
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_conversations_updated_at
BEFORE UPDATE ON ai_conversations
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE VIEW v_verified_leaders AS
SELECT 
    lp.*,
    u.email,
    u.display_name,
    u.avatar_url,
    u.reputation_score,
    u.helpfulness_badge
FROM leader_profiles lp
JOIN users u ON lp.user_id = u.id
WHERE lp.status = 'VERIFIED';

ALTER TABLE prayers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE leader_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE leader_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE sermons ENABLE ROW LEVEL SECURITY;
ALTER TABLE sermon_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own prayers"
ON prayers FOR ALL
USING (user_id = auth.uid());

CREATE POLICY "Public prayers visible"
ON prayers FOR SELECT
USING (is_public = TRUE);


CREATE POLICY "View products"
ON products FOR SELECT
USING (TRUE);

CREATE POLICY "Vendor manages products"
ON products FOR ALL
USING (vendor_id = auth.uid());

CREATE POLICY "Buyer views own orders"
ON orders FOR SELECT
USING (buyer_id = auth.uid());

CREATE POLICY "Own AI conversations"
ON ai_conversations FOR ALL
USING (user_id = auth.uid());

CREATE POLICY "Own AI messages"
ON ai_messages FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM ai_conversations c
        WHERE c.id = conversation_id
        AND c.user_id = auth.uid()
    )
);

CREATE POLICY "View published sermons"
ON sermons FOR SELECT
USING (published = TRUE);

CREATE POLICY "Authors manage sermons"
ON sermons FOR ALL
USING (author_id = auth.uid());

CREATE POLICY "View responses"
ON leader_responses FOR SELECT
USING (TRUE);

CREATE POLICY "Verified leaders respond"
ON leader_responses FOR INSERT
WITH CHECK (leader_id = auth.uid());
