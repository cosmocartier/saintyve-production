import { createClient } from "@/lib/supabase/server"
import { ProjectDetailClient } from "@/components/admin/project-detail-client"
import { redirect, notFound } from "next/navigation"

export default async function ProjectDetailPage({ params }: { params: { projectId: string } }) {
  const supabase = await createClient()

  // Check admin authentication
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "admin") {
    redirect("/")
  }

  // Fetch project
  const { data: project } = await supabase
    .from("projects")
    .select(
      `
      *,
      owner:profiles!projects_owner_id_fkey(id, email, full_name, first_name)
    `,
    )
    .eq("id", params.projectId)
    .single()

  if (!project) {
    notFound()
  }

  // Fetch subprojects
  const { data: subprojects } = await supabase
    .from("subprojects")
    .select("*")
    .eq("project_id", params.projectId)
    .order("created_at", { ascending: false })

  // Fetch tasks
  const { data: tasks } = await supabase
    .from("tasks")
    .select(
      `
      *,
      assignee:profiles!tasks_assignee_id_fkey(id, email, full_name, first_name),
      subproject:subprojects(id, name)
    `,
    )
    .eq("project_id", params.projectId)
    .order("created_at", { ascending: false })

  // Calculate task counts for subprojects
  const subprojectsWithCounts = (subprojects || []).map((sub) => ({
    ...sub,
    taskCount: tasks?.filter((t) => t.subproject_id === sub.id).length || 0,
  }))

  // Fetch admin users
  const { data: adminUsers } = await supabase
    .from("profiles")
    .select("id, email, full_name, first_name")
    .eq("role", "admin")

  return (
    <ProjectDetailClient
      project={project}
      subprojects={subprojectsWithCounts}
      tasks={tasks || []}
      adminUsers={adminUsers || []}
    />
  )
}
