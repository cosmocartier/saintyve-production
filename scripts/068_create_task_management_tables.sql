-- Create task management tables for Saint Yve admin dashboard
-- Migration: 068_create_task_management_tables.sql

-- 1. PROJECTS TABLE
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'on_hold', 'completed', 'archived')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. SUBPROJECTS TABLE
CREATE TABLE IF NOT EXISTS public.subprojects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'on_hold', 'completed', 'archived')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TASKS TABLE
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  subproject_id UUID REFERENCES public.subprojects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'backlog' CHECK (status IN ('backlog', 'todo', 'in_progress', 'blocked', 'in_review', 'done')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  assignee_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  due_date TIMESTAMPTZ,
  linked_resource_type TEXT,
  linked_resource_id TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_subprojects_project_id ON public.subprojects(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON public.tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_subproject_id ON public.tasks(subproject_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee_id ON public.tasks(assignee_id);

-- Add triggers to update updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_projects_updated_at 
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subprojects_updated_at 
  BEFORE UPDATE ON public.subprojects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at 
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subprojects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Admin-only access (following existing pattern)
-- Projects policies
CREATE POLICY "Admins can view all projects"
  ON public.projects FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can insert projects"
  ON public.projects FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update projects"
  ON public.projects FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Admins can delete projects"
  ON public.projects FOR DELETE
  USING (public.is_admin());

-- Subprojects policies
CREATE POLICY "Admins can view all subprojects"
  ON public.subprojects FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can insert subprojects"
  ON public.subprojects FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update subprojects"
  ON public.subprojects FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Admins can delete subprojects"
  ON public.subprojects FOR DELETE
  USING (public.is_admin());

-- Tasks policies
CREATE POLICY "Admins can view all tasks"
  ON public.tasks FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can insert tasks"
  ON public.tasks FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update tasks"
  ON public.tasks FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Admins can delete tasks"
  ON public.tasks FOR DELETE
  USING (public.is_admin());
