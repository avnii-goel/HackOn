CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    credits_balance INTEGER DEFAULT 0,
    co2_saved_kg DECIMAL DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price DECIMAL NOT NULL,
    image_url TEXT,
    return_rate INTEGER,
    common_return_reasons TEXT[],
    refurb_available BOOLEAN DEFAULT false,
    refurb_price DECIMAL,
    description TEXT
);

CREATE TABLE listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID REFERENCES users(id),
    product_name TEXT NOT NULL,
    category TEXT NOT NULL,
    condition_score INTEGER,
    verdict TEXT,
    ai_description TEXT,
    suggested_price DECIMAL,
    original_price DECIMAL,
    co2_saved DECIMAL,
    image_url TEXT,
    status TEXT DEFAULT 'available',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    action_type TEXT,
    credits_earned INTEGER,
    listing_id UUID REFERENCES listings(id),
    created_at TIMESTAMP DEFAULT NOW()
);


-- ============================================================
-- MOCK DATA
-- ============================================================

-- USERS
INSERT INTO users (id, name, email, credits_balance, co2_saved_kg)
VALUES
    ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Shourya Agrawal', 'shourya@test.com', 450, 8.5),
    ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'Priya Sharma', 'priya@test.com', 280, 5.2);

-- PRODUCTS
INSERT INTO products (name, category, price, return_rate, common_return_reasons, refurb_available, refurb_price)
VALUES
    ('Sony WH-1000XM5 Headphones', 'electronics', 29990, 18, ARRAY['Sound quality not as expected','Uncomfortable fit','Connectivity issues'], true, 21990),
    ('Nike Air Max Running Shoes', 'clothing', 8995, 34, ARRAY['Size runs small','Different color than shown','Sole defect'], true, 5995),
    ('Apple iPad 10th Gen', 'electronics', 44900, 12, ARRAY['Dead pixels','Performance issues','Not compatible'], true, 32900),
    ('Prestige Pressure Cooker 5L', 'home', 2499, 8, ARRAY['Whistle defective','Lid doesn''t fit','Wrong size delivered'], false, NULL),
    ('Atomic Habits Book', 'books', 399, 5, ARRAY['Damaged pages','Wrong edition'], false, NULL),
    ('Nivia Football Size 5', 'sports', 1299, 15, ARRAY['Air doesn''t hold','Size smaller than expected'], true, 799);

-- LISTINGS (seller_id = Shourya)
INSERT INTO listings (seller_id, product_name, category, condition_score, verdict, suggested_price, original_price, co2_saved, status)
VALUES
    ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Samsung Galaxy Buds', 'electronics', 82, 'Resell', 3499, 5999, 2.5, 'available'),
    ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Levi''s Jeans 32W', 'clothing', 65, 'Resell', 999, 2499, 1.8, 'available'),
    ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Philips Air Fryer', 'home', 45, 'Refurbish', 2999, 6999, 1.2, 'available'),
    ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Boat Earphones', 'electronics', 78, 'Resell', 599, 1299, 2.5, 'available');

-- TRANSACTIONS
INSERT INTO transactions (user_id, action_type, credits_earned)
VALUES
    ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'resell_submitted', 200),
    ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'refurb_purchased', 150),
    ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'donated', 100),
    ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'resell_submitted', 200);
