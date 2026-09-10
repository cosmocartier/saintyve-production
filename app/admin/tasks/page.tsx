import { createClient } from "@/lib/supabase/server"
import { AdminTasksClient } from "@/components/admin/admin-tasks-client"
import { redirect } from "next/navigation"

export default async function AdminTasksPage() {
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

  // Fetch projects with owner profiles and task counts
  const { data: projects } = await supabase
    .from("projects")
    .select(
      `
      *,
      owner:profiles!projects_owner_id_fkey(id, email, full_name, first_name)
    `,
    )
    .order("created_at", { ascending: false })

  // Fetch all tasks to calculate counts
  const { data: allTasks } = await supabase.from("tasks").select("id, status, project_id")

  const projectsWithCounts = (projects || []).map((project) => {
    const projectTasks = allTasks?.filter((t) => t.project_id === project.id) || []
    return {
      ...project,
      taskCount: projectTasks.length,
      openTasksCount: projectTasks.filter((t) => t.status !== "done").length,
    }
  })

  // Fetch all admin users for assignee/owner selects
  const { data: adminUsers } = await supabase
    .from("profiles")
    .select("id, email, full_name, first_name")
    .eq("role", "admin")

  return <AdminTasksClient initialProjects={projectsWithCounts} adminUsers={adminUsers || []} />
}
