-- Create game_sessions table
CREATE TABLE IF NOT EXISTS game_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_state JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
    user_id TEXT,
    is_ai BOOLEAN NOT NULL DEFAULT FALSE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster message lookups by session
CREATE INDEX IF NOT EXISTS idx_messages_session_id ON messages(session_id);

-- Create an update_timestamp function to automatically set updated_at
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update the updated_at field
CREATE TRIGGER update_game_sessions_timestamp
BEFORE UPDATE ON game_sessions
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Set up Supabase Realtime
BEGIN;
  -- Remove the supabase_realtime publication if it exists
  DROP PUBLICATION IF EXISTS supabase_realtime;
  
  -- Re-create the supabase_realtime publication
  CREATE PUBLICATION supabase_realtime;
COMMIT;

-- Add messages table to the publication for realtime subscriptions
ALTER PUBLICATION supabase_realtime ADD TABLE messages; 