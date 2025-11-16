-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#3b82f6',
  parent_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  is_archived BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_project_name_per_user UNIQUE(user_id, name, parent_id)
);

-- Prompts table
CREATE TABLE prompts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  favorite BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  word_count INTEGER DEFAULT 0,
  character_count INTEGER DEFAULT 0,
  token_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used_at TIMESTAMP WITH TIME ZONE
);

-- Prompt versions table (for history)
CREATE TABLE prompt_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prompt_id UUID REFERENCES prompts(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  version_number INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_version_per_prompt UNIQUE(prompt_id, version_number)
);

-- Prompt links table (for chaining)
CREATE TABLE prompt_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  source_prompt_id UUID REFERENCES prompts(id) ON DELETE CASCADE,
  target_prompt_id UUID REFERENCES prompts(id) ON DELETE CASCADE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_link UNIQUE(source_prompt_id, target_prompt_id)
);

-- Quick notes table
CREATE TABLE prompt_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prompt_id UUID REFERENCES prompts(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shared prompts table (public links)
CREATE TABLE shared_prompts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prompt_id UUID REFERENCES prompts(id) ON DELETE CASCADE,
  share_token TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shared projects table
CREATE TABLE shared_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  share_token TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User settings table
CREATE TABLE user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'light',
  font_family TEXT DEFAULT 'Inter',
  font_size INTEGER DEFAULT 14,
  layout_mode TEXT DEFAULT 'comfortable',
  auto_backup BOOLEAN DEFAULT true,
  sync_enabled BOOLEAN DEFAULT true,
  encryption_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sync queue table (for offline mode)
CREATE TABLE sync_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  operation TEXT NOT NULL, -- 'create', 'update', 'delete'
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  synced BOOLEAN DEFAULT false
);

-- Create indexes for better query performance
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_parent_id ON projects(parent_id);
CREATE INDEX idx_prompts_user_id ON prompts(user_id);
CREATE INDEX idx_prompts_project_id ON prompts(project_id);
CREATE INDEX idx_prompts_tags ON prompts USING GIN(tags);
CREATE INDEX idx_prompts_favorite ON prompts(favorite) WHERE favorite = true;
CREATE INDEX idx_prompts_archived ON prompts(is_archived);
CREATE INDEX idx_prompt_versions_prompt_id ON prompt_versions(prompt_id);
CREATE INDEX idx_prompt_links_source ON prompt_links(source_prompt_id);
CREATE INDEX idx_sync_queue_user_id ON sync_queue(user_id, synced);

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_queue ENABLE ROW LEVEL SECURITY;

-- Projects policies
CREATE POLICY "Users can view their own projects"
  ON projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects"
  ON projects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects"
  ON projects FOR DELETE
  USING (auth.uid() = user_id);

-- Prompts policies
CREATE POLICY "Users can view their own prompts"
  ON prompts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own prompts"
  ON prompts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own prompts"
  ON prompts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own prompts"
  ON prompts FOR DELETE
  USING (auth.uid() = user_id);

-- Prompt versions policies
CREATE POLICY "Users can view versions of their prompts"
  ON prompt_versions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM prompts WHERE prompts.id = prompt_versions.prompt_id AND prompts.user_id = auth.uid()
  ));

CREATE POLICY "Users can create versions of their prompts"
  ON prompt_versions FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM prompts WHERE prompts.id = prompt_versions.prompt_id AND prompts.user_id = auth.uid()
  ));

-- Prompt links policies
CREATE POLICY "Users can manage their own prompt links"
  ON prompt_links FOR ALL
  USING (auth.uid() = user_id);

-- Prompt notes policies
CREATE POLICY "Users can manage notes for their prompts"
  ON prompt_notes FOR ALL
  USING (EXISTS (
    SELECT 1 FROM prompts WHERE prompts.id = prompt_notes.prompt_id AND prompts.user_id = auth.uid()
  ));

-- User settings policies
CREATE POLICY "Users can view their own settings"
  ON user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
  ON user_settings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings"
  ON user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Sync queue policies
CREATE POLICY "Users can manage their own sync queue"
  ON sync_queue FOR ALL
  USING (auth.uid() = user_id);

-- Functions and Triggers

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prompts_updated_at BEFORE UPDATE ON prompts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create prompt version on update
CREATE OR REPLACE FUNCTION create_prompt_version()
RETURNS TRIGGER AS $$
DECLARE
  next_version INTEGER;
BEGIN
  IF OLD.content != NEW.content OR OLD.title != NEW.title THEN
    SELECT COALESCE(MAX(version_number), 0) + 1 INTO next_version
    FROM prompt_versions
    WHERE prompt_id = NEW.id;
    
    INSERT INTO prompt_versions (prompt_id, title, content, version_number)
    VALUES (OLD.id, OLD.title, OLD.content, next_version);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for versioning
CREATE TRIGGER prompt_versioning BEFORE UPDATE ON prompts
  FOR EACH ROW EXECUTE FUNCTION create_prompt_version();

-- Function to calculate word, character, and token counts
CREATE OR REPLACE FUNCTION calculate_prompt_stats()
RETURNS TRIGGER AS $$
BEGIN
  NEW.word_count = array_length(regexp_split_to_array(trim(NEW.content), '\s+'), 1);
  NEW.character_count = length(NEW.content);
  -- Rough token estimation (divide by 4)
  NEW.token_count = CEIL(NEW.character_count::NUMERIC / 4);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for stats calculation
CREATE TRIGGER calculate_stats BEFORE INSERT OR UPDATE ON prompts
  FOR EACH ROW EXECUTE FUNCTION calculate_prompt_stats();

-- Function to initialize user settings on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_settings (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for new user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();