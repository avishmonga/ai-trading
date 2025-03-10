-- Create watchlists table
CREATE TABLE watchlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  coins TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_id for faster lookups
CREATE INDEX idx_watchlists_user_id ON watchlists(user_id);

-- Create RLS (Row Level Security) policies
ALTER TABLE watchlists ENABLE ROW LEVEL SECURITY;

-- Policy for selecting watchlists (users can only see their own watchlists)
CREATE POLICY "Users can view their own watchlists" 
  ON watchlists 
  FOR SELECT 
  USING (auth.uid()::text = user_id);

-- Policy for inserting watchlists (users can only insert their own watchlists)
CREATE POLICY "Users can insert their own watchlists" 
  ON watchlists 
  FOR INSERT 
  WITH CHECK (auth.uid()::text = user_id);

-- Policy for updating watchlists (users can only update their own watchlists)
CREATE POLICY "Users can update their own watchlists" 
  ON watchlists 
  FOR UPDATE 
  USING (auth.uid()::text = user_id);

-- Policy for deleting watchlists (users can only delete their own watchlists)
CREATE POLICY "Users can delete their own watchlists" 
  ON watchlists 
  FOR DELETE 
  USING (auth.uid()::text = user_id);

-- For demo purposes, create a function to allow the demo user to access watchlists
-- In a real app, you would use proper authentication
CREATE OR REPLACE FUNCTION public.get_demo_user_watchlist(demo_user_id TEXT)
RETURNS TABLE (
  id UUID,
  user_id TEXT,
  coins TEXT[],
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT w.id, w.user_id, w.coins, w.created_at, w.updated_at
  FROM watchlists w
  WHERE w.user_id = demo_user_id;
END;
$$; 