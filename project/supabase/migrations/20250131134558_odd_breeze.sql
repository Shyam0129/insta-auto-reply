/*
  # Initial Schema Setup

  1. New Tables
    - users
      - Stores user information and Instagram credentials
    - keywords
      - Stores keyword-response pairs for auto-replies
    - auto_reply_logs
      - Tracks all auto-reply activities and errors

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  instagram_access_token text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Keywords table
CREATE TABLE IF NOT EXISTS keywords (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) NOT NULL,
  keyword text NOT NULL,
  response_message text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE keywords ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own keywords"
  ON keywords
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Auto-reply logs table
CREATE TABLE IF NOT EXISTS auto_reply_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) NOT NULL,
  keyword_id uuid REFERENCES keywords(id) NOT NULL,
  comment_id text NOT NULL,
  follower_name text NOT NULL,
  sent_message text NOT NULL,
  status text NOT NULL,
  error_message text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE auto_reply_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own logs"
  ON auto_reply_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can create logs"
  ON auto_reply_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);