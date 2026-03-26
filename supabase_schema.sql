-- Drop tables if they exist
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS winners CASCADE;
DROP TABLE IF EXISTS draws CASCADE;
DROP TABLE IF EXISTS scores CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS charities CASCADE;
DROP TABLE IF EXISTS system_config CASCADE;

-- 1. Charities Table
CREATE TABLE charities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. System Config Table
CREATE TABLE system_config (
  id INT PRIMARY KEY DEFAULT 1,
  subscription_amount NUMERIC NOT NULL DEFAULT 10.00,
  rollover_pool NUMERIC NOT NULL DEFAULT 0.00,
  draw_type TEXT CHECK (draw_type IN ('random', 'algorithmic')) DEFAULT 'random',
  last_draw_date TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Users Table (Extends Supabase Auth)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('user', 'admin')) DEFAULT 'user',
  is_subscribed BOOLEAN DEFAULT false,
  plan_type TEXT CHECK (plan_type IN ('monthly', 'yearly')),
  subscription_start TIMESTAMP WITH TIME ZONE,
  subscription_end TIMESTAMP WITH TIME ZONE,
  charity_id UUID REFERENCES charities(id) ON DELETE SET NULL,
  contribution_percent INTEGER CHECK (contribution_percent >= 10) DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Scores Table
CREATE TABLE scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  score INTEGER CHECK (score >= 1 AND score <= 45) NOT NULL,
  score_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Function to limit scores to latest 5 per user
CREATE OR REPLACE FUNCTION enforce_score_limit()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM scores
  WHERE id IN (
    SELECT id FROM scores
    WHERE user_id = NEW.user_id
    ORDER BY score_date DESC
    OFFSET 5
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER maintain_score_limit
AFTER INSERT ON scores
FOR EACH ROW EXECUTE FUNCTION enforce_score_limit();

-- 5. Draws Table
CREATE TABLE draws (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numbers INTEGER[] NOT NULL,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Winners Table
CREATE TABLE winners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  draw_id UUID NOT NULL REFERENCES draws(id) ON DELETE CASCADE,
  match_count INTEGER CHECK (match_count IN (3, 4, 5)) NOT NULL,
  prize_amount NUMERIC DEFAULT 0.00,
  status TEXT CHECK (status IN ('pending', 'approved', 'paid')) DEFAULT 'pending',
  proof_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Transactions Table
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  plan_type TEXT CHECK (plan_type IN ('monthly', 'yearly')),
  status TEXT CHECK (status IN ('success', 'failed', 'pending')) DEFAULT 'success',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Notifications Table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE charities ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE draws ENABLE ROW LEVEL SECURITY;
ALTER TABLE winners ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Read policies (Everyone can read charities, system_config, draws)
CREATE POLICY "Public charities" ON charities FOR SELECT USING (true);
CREATE POLICY "Public config" ON system_config FOR SELECT USING (true);
CREATE POLICY "Public draws" ON draws FOR SELECT USING (true);

-- User specifics (Users can only read/write their own data)
CREATE POLICY "Users can read own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can read own scores" ON scores FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own scores" ON scores FOR INSERT WITH CHECK (auth.uid() = user_id AND EXISTS(SELECT 1 FROM users WHERE id = auth.uid() AND is_subscribed = true));

CREATE POLICY "Users can read own winnings" ON winners FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can read own transactions" ON transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can read own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);
