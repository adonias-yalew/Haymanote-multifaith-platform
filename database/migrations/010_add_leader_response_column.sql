-- Add leader response tracking to comments table
ALTER TABLE comments ADD COLUMN IF NOT EXISTS is_leader_response BOOLEAN DEFAULT FALSE;

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_comments_is_leader_response ON comments(is_leader_response);

-- Add comment to clarify the field
COMMENT ON COLUMN comments.is_leader_response IS 'Marks if this comment is a top-level response from a verified leader to a user question';
