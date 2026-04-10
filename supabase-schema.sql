-- Create modules table
CREATE TABLE IF NOT EXISTS modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create steps table
CREATE TABLE IF NOT EXISTS steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  tip TEXT,
  step_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  step_id UUID NOT NULL REFERENCES steps(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  task_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create task_states table (for tracking daily completions)
CREATE TABLE IF NOT EXISTS task_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(task_id, completed_at)
);

-- Create module_completions table
CREATE TABLE IF NOT EXISTS module_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  completed BOOLEAN NOT NULL DEFAULT true,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(module_id)
);

-- Enable Row Level Security
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_completions ENABLE ROW LEVEL SECURITY;

-- Create policies for public read/write (for development)
-- NOTE: For production, you should implement proper authentication
CREATE POLICY "Allow public read access on modules" ON modules FOR SELECT USING (true);
CREATE POLICY "Allow public insert on modules" ON modules FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on modules" ON modules FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on modules" ON modules FOR DELETE USING (true);

CREATE POLICY "Allow public read access on steps" ON steps FOR SELECT USING (true);
CREATE POLICY "Allow public insert on steps" ON steps FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on steps" ON steps FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on steps" ON steps FOR DELETE USING (true);

CREATE POLICY "Allow public read access on tasks" ON tasks FOR SELECT USING (true);
CREATE POLICY "Allow public insert on tasks" ON tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on tasks" ON tasks FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on tasks" ON tasks FOR DELETE USING (true);

CREATE POLICY "Allow public read access on task_states" ON task_states FOR SELECT USING (true);
CREATE POLICY "Allow public insert on task_states" ON task_states FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on task_states" ON task_states FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on task_states" ON task_states FOR DELETE USING (true);

CREATE POLICY "Allow public read access on module_completions" ON module_completions FOR SELECT USING (true);
CREATE POLICY "Allow public insert on module_completions" ON module_completions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on module_completions" ON module_completions FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on module_completions" ON module_completions FOR DELETE USING (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_steps_module_id ON steps(module_id);
CREATE INDEX IF NOT EXISTS idx_tasks_step_id ON tasks(step_id);
CREATE INDEX IF NOT EXISTS idx_task_states_task_id ON task_states(task_id);
CREATE INDEX IF NOT EXISTS idx_task_states_completed_at ON task_states(completed_at);
CREATE INDEX IF NOT EXISTS idx_module_completions_module_id ON module_completions(module_id);
