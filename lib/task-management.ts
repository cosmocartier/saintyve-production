import { createClient } from "@/lib/supabase/server"

export type Project = {
  id: string
  name: string
  description: string | null
  status: "active" | "on_hold" | "completed" | "archived"
  priority: "low" | "medium" | "high" | "critical"
  owner_id: string | null
  created_at: string
  updated_at: string
}

export type Subproject = {
  id: string
  project_id: string
  name: string
  description: string | null
  status: "active" | "on_hold" | "completed" | "archived"
  priority: "low" | "medium" | "high" | "critical"
  created_at: string
  updated_at: string
}

export type Task = {
  id: string
  project_id: string
  subproject_id: string | null
  title: string
  description: string | null
  status: "backlog" | "todo" | "in_progress" | "blocked" | "in_review" | "done"
  priority: "low" | "medium" | "high" | "urgent"
  assignee_id: string | null
  due_date: string | null
  linked_resource_type: string | null
  linked_resource_id: string | null
  tags: string[]
  created_at: string
  updated_at: string
  completed_at: string | null
}

export async function fetchProjects() {
  const supabase = await createClient()

  const { data, error } = await supabase.from("projects").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching projects:", error)
    return []
  }

  return data as Project[]
}

export async function fetchSubprojectsByProject(projectId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("subprojects")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching subprojects:", error)
    return []
  }

  return data as Subproject[]
}

export async function fetchTasksByProject(projectId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching tasks:", error)
    return []
  }

  return data as Task[]
}
