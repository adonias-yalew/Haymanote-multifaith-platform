-- 024_marketplace_enhancements.sql
-- Adds messaging, notifications, reviews, wishlist, order timeline, and payment abstraction

-- ============================================================
-- 1. MESSAGING SYSTEM
-- ============================================================

CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    buyer_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    vendor_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    subject TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conversations_buyer ON conversations(buyer_id);
CREATE INDEX IF NOT EXISTS idx_conversations_vendor ON conversations(vendor_id);
CREATE INDEX IF NOT EXISTS idx_conversations_product ON conversations(product_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_conversations_unique ON conversations(buyer_id, vendor_id, COALESCE(product_id, '00000000-0000-0000-0000-000000000000'));

CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(conversation_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages(conversation_id, is_read) WHERE is_read = FALSE;

-- Enable Realtime for messages table (for live chat)
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;

-- ============================================================
-- 2. NOTIFICATIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL CHECK (type IN (
        'new_order', 'order_update', 'new_message', 'new_review',
        'product_approved', 'product_rejected', 'payment_received',
        'stock_warning', 'vendor_reply', 'shipping_update', 'refund_update'
    )),
    title TEXT NOT NULL,
    body TEXT,
    data JSONB,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;

-- Enable Realtime for notifications table
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- ============================================================
-- 3. PRODUCT REVIEWS / RATINGS
-- ============================================================

CREATE TABLE IF NOT EXISTS product_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    content TEXT,
    is_verified_purchase BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(product_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_product_reviews_product ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_user ON product_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_rating ON product_reviews(product_id, rating);

ALTER PUBLICATION supabase_realtime ADD TABLE product_reviews;

-- ============================================================
-- 4. WISHLIST
-- ============================================================

CREATE TABLE IF NOT EXISTS wishlist_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_wishlist_user ON wishlist_items(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_product ON wishlist_items(product_id);

-- ============================================================
-- 5. ORDER TIMELINE / TRACKING
-- ============================================================

CREATE TABLE IF NOT EXISTS order_timeline (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED')),
    note TEXT,
    changed_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_timeline_order ON order_timeline(order_id);
CREATE INDEX IF NOT EXISTS idx_order_timeline_created ON order_timeline(order_id, created_at ASC);

-- ============================================================
-- 6. PAYMENT TRANSACTIONS (Abstract Layer)
-- ============================================================

CREATE TABLE IF NOT EXISTS payment_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    provider TEXT NOT NULL CHECK (provider IN ('chapa', 'telebirr', 'cbe_birr', 'stripe', 'paypal', 'cash_on_delivery', 'other')),
    provider_transaction_id TEXT,
    amount NUMERIC(10,2) NOT NULL,
    currency TEXT DEFAULT 'ETB',
    status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled')),
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_order ON payment_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user ON payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_provider ON payment_transactions(provider, status);

ALTER PUBLICATION supabase_realtime ADD TABLE payment_transactions;

-- ============================================================
-- 7. VENDOR_PROFILES ENHANCEMENTS
-- ============================================================

ALTER TABLE vendor_profiles ADD COLUMN IF NOT EXISTS store_description TEXT;
ALTER TABLE vendor_profiles ADD COLUMN IF NOT EXISTS store_logo_url TEXT;
ALTER TABLE vendor_profiles ADD COLUMN IF NOT EXISTS store_banner_url TEXT;
ALTER TABLE vendor_profiles ADD COLUMN IF NOT EXISTS phone_number VARCHAR(50);
ALTER TABLE vendor_profiles ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE vendor_profiles ADD COLUMN IF NOT EXISTS total_sales INTEGER DEFAULT 0;
ALTER TABLE vendor_profiles ADD COLUMN IF NOT EXISTS total_revenue NUMERIC(12,2) DEFAULT 0;
ALTER TABLE vendor_profiles ADD COLUMN IF NOT EXISTS average_rating NUMERIC(3,2) DEFAULT 0;
ALTER TABLE vendor_profiles ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0;
ALTER TABLE vendor_profiles ADD COLUMN IF NOT EXISTS response_time_hours INTEGER DEFAULT 24;
ALTER TABLE vendor_profiles ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;
ALTER TABLE vendor_profiles ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ;

-- ============================================================
-- 8. PRODUCTS ENHANCEMENTS
-- ============================================================

ALTER TABLE products ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS discount_percent NUMERIC(5,2) DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS discount_ends_at TIMESTAMPTZ;
ALTER TABLE products ADD COLUMN IF NOT EXISTS average_rating NUMERIC(3,2) DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS total_sold INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured, created_at DESC) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_products_tags ON products USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_products_rating ON products(average_rating DESC);
CREATE INDEX IF NOT EXISTS idx_products_category_active ON products(category, is_active) WHERE is_active = TRUE;

-- ============================================================
-- 9. ORDERS ENHANCEMENTS
-- ============================================================

ALTER TABLE orders ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_number TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS estimated_delivery_date TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;

-- ============================================================
-- 10. HELPER FUNCTION: Create order timeline entry
-- ============================================================

CREATE OR REPLACE FUNCTION create_order_timeline_entry()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO order_timeline (order_id, status, note)
    VALUES (NEW.id, NEW.status, 'Order ' || LOWER(NEW.status));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_order_timeline_insert ON orders;
CREATE TRIGGER trg_order_timeline_insert
    AFTER INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION create_order_timeline_entry();

CREATE OR REPLACE FUNCTION create_order_timeline_update()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO order_timeline (order_id, status, note)
        VALUES (NEW.id, NEW.status, 'Status changed to ' || LOWER(NEW.status));
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_order_timeline_update ON orders;
CREATE TRIGGER trg_order_timeline_update
    AFTER UPDATE OF status ON orders
    FOR EACH ROW
    EXECUTE FUNCTION create_order_timeline_update();

-- ============================================================
-- 11. RLS POLICIES for new tables
-- ============================================================

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- Conversations: participants and admins can read; participants can insert
DROP POLICY IF EXISTS conversations_select ON conversations;
CREATE POLICY conversations_select ON conversations
    FOR SELECT USING (
        buyer_id = auth.uid()::uuid
        OR vendor_id = auth.uid()::uuid
        OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::uuid AND role = 'admin')
    );

DROP POLICY IF EXISTS conversations_insert ON conversations;
CREATE POLICY conversations_insert ON conversations
    FOR INSERT WITH CHECK (
        buyer_id = auth.uid()::uuid OR vendor_id = auth.uid()::uuid
    );

-- Messages: conversation participants and admins
DROP POLICY IF EXISTS messages_select ON messages;
CREATE POLICY messages_select ON messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM conversations c
            WHERE c.id = conversation_id
            AND (c.buyer_id = auth.uid()::uuid OR c.vendor_id = auth.uid()::uuid)
        )
        OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::uuid AND role = 'admin')
    );

DROP POLICY IF EXISTS messages_insert ON messages;
CREATE POLICY messages_insert ON messages
    FOR INSERT WITH CHECK (
        sender_id = auth.uid()::uuid
        AND EXISTS (
            SELECT 1 FROM conversations c
            WHERE c.id = conversation_id
            AND (c.buyer_id = auth.uid()::uuid OR c.vendor_id = auth.uid()::uuid)
        )
    );

-- Notifications: owning user and admins
DROP POLICY IF EXISTS notifications_select ON notifications;
CREATE POLICY notifications_select ON notifications
    FOR SELECT USING (
        user_id = auth.uid()::uuid
        OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::uuid AND role = 'admin')
    );

DROP POLICY IF EXISTS notifications_update ON notifications;
CREATE POLICY notifications_update ON notifications
    FOR UPDATE USING (user_id = auth.uid()::uuid)
    WITH CHECK (user_id = auth.uid()::uuid);

-- Product reviews: all can read; authenticated users can insert/update own
DROP POLICY IF EXISTS product_reviews_select ON product_reviews;
CREATE POLICY product_reviews_select ON product_reviews
    FOR SELECT USING (true);

DROP POLICY IF EXISTS product_reviews_insert ON product_reviews;
CREATE POLICY product_reviews_insert ON product_reviews
    FOR INSERT WITH CHECK (user_id = auth.uid()::uuid);

DROP POLICY IF EXISTS product_reviews_update ON product_reviews;
CREATE POLICY product_reviews_update ON product_reviews
    FOR UPDATE USING (user_id = auth.uid()::uuid);

-- Wishlist: owner and admins
DROP POLICY IF EXISTS wishlist_select ON wishlist_items;
CREATE POLICY wishlist_select ON wishlist_items
    FOR SELECT USING (
        user_id = auth.uid()::uuid
        OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::uuid AND role = 'admin')
    );

DROP POLICY IF EXISTS wishlist_insert ON wishlist_items;
CREATE POLICY wishlist_insert ON wishlist_items
    FOR INSERT WITH CHECK (user_id = auth.uid()::uuid);

DROP POLICY IF EXISTS wishlist_delete ON wishlist_items;
CREATE POLICY wishlist_delete ON wishlist_items
    FOR DELETE USING (user_id = auth.uid()::uuid);

-- Order timeline: buyer, vendor, admin
DROP POLICY IF EXISTS order_timeline_select ON order_timeline;
CREATE POLICY order_timeline_select ON order_timeline
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM orders o
            WHERE o.id = order_id
            AND (o.buyer_id = auth.uid()::uuid)
        )
        OR EXISTS (
            SELECT 1 FROM order_items oi
            JOIN products p ON p.id = oi.product_id
            WHERE oi.order_id = order_id
            AND p.vendor_id = auth.uid()::uuid
        )
        OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::uuid AND role = 'admin')
    );

-- Payment transactions: owner and admin
DROP POLICY IF EXISTS payment_transactions_select ON payment_transactions;
CREATE POLICY payment_transactions_select ON payment_transactions
    FOR SELECT USING (
        user_id = auth.uid()::uuid
        OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::uuid AND role = 'admin')
    );

-- ============================================================
-- 12. NEW ORDER STATUS: Add CONFIRMED, PROCESSING, REFUNDED
-- ============================================================

-- The check constraint on orders.status needs to be altered to support new statuses
-- We do this safely by first dropping the constraint then re-adding
-- (ONLY if it doesn't already include the new statuses)
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_status_check
    CHECK (status IN ('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'));
