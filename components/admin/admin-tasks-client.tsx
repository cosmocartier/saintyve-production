"use client"

import { useState } from "react"
import { Search, Plus, MoreVertical, Pencil, Archive, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface Project {
  id: string
  name: string
  description: string | null
  status: "active" | "on_hold" | "completed" | "archived"
  priority: "low" | "medium" | "high" | "critical"
  owner_id: string | null
  created_at: string
  updated_at: string
  owner?: {
    id: string
    email: string
    full_name: string | null
    first_name: string | null
  }
  taskCount: number
  openTasksCount: number
}

interface AdminUser {
  id: string
  email: string
  full_name: string | null
  first_name: string | null
}

interface AdminTasksClientProps {
  initialProjects: Project[]
  adminUsers: AdminUser[]
}

export function AdminTasksClient({ initialProjects, adminUsers }: AdminTasksClientProps) {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>(initialProjects)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterPriority, setFilterPriority] = useState<string>("all")

  // Project dialog state
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [projectForm, setProjectForm] = useState({
    name: "",
    description: "",
    status: "active" as const,
    priority: "medium" as const,
    owner_id: "none",
  })
  const [isSaving, setIsSaving] = useState(false)

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === "all" || project.status === filterStatus
    const matchesPriority = filterPriority === "all" || project.priority === filterPriority
    return matchesSearch && matchesStatus && matchesPriority
  })

  const openCreateDialog = () => {
    setEditingProject(null)
    setProjectForm({
      name: "",
      description: "",
      status: "active",
      priority: "medium",
      owner_id: "none",
    })
    setIsProjectDialogOpen(true)
  }

  const openEditDialog = (project: Project) => {
    setEditingProject(project)
    setProjectForm({
      name: project.name,
      description: project.description || "",
      status: project.status,
      priority: project.priority,
      owner_id: project.owner_id || "none",
    })
    setIsProjectDialogOpen(true)
  }

  const handleSaveProject = async () => {
    if (!projectForm.name.trim()) return

    setIsSaving(true)
    try {
      const payload = {
        name: projectForm.name.trim(),
        description: projectForm.description.trim() || null,
        status: projectForm.status,
        priority: projectForm.priority,
        owner_id: projectForm.owner_id === "none" ? null : projectForm.owner_id,
      }

      const url = editingProject ? `/api/admin/tasks/projects?id=${editingProject.id}` : "/api/admin/tasks/projects"

      const response = await fetch(url, {
        method: editingProject ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) throw new Error("Failed to save project")

      setIsProjectDialogOpen(false)
      router.refresh()
    } catch (error) {
      console.error("[v0] Error saving project:", error)
      alert("Failed to save project")
    } finally {
      setIsSaving(false)
    }
  }

  const handleMarkCompleted = async (projectId: string) => {
    try {
      const response = await fetch(`/api/admin/tasks/projects?id=${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "completed" }),
      })

      if (!response.ok) throw new Error("Failed to update project")
      router.refresh()
    } catch (error) {
      console.error("[v0] Error updating project:", error)
    }
  }

  const handleArchiveProject = async (projectId: string) => {
    try {
      const response = await fetch(`/api/admin/tasks/projects?id=${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "archived" }),
      })

      if (!response.ok) throw new Error("Failed to archive project")
      router.refresh()
    } catch (error) {
      console.error("[v0] Error archiving project:", error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200"
      case "on_hold":
        return "bg-amber-100 text-amber-800 border-amber-200"
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "archived":
        return "bg-gray-100 text-gray-600 border-gray-200"
      default:
        return "bg-gray-100 text-gray-600 border-gray-200"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200"
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-600 border-gray-200"
    }
  }

  return (
    <div className="flex min-h-screen bg-white">
      <AdminSidebar />

      <div className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-medium tracking-widest uppercase mb-2">TASKS</h1>
            <p className="text-sm text-zinc-500 tracking-wide">
              Central workspace for all Designerdrip projects and tasks.
            </p>
          </div>
          <Button
            onClick={openCreateDialog}
            className="bg-black text-white hover:bg-black/90 rounded-none tracking-wide uppercase text-xs"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input
              placeholder="Search by project name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="on_hold">On Hold</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Projects Table */}
        {filteredProjects.length > 0 ? (
          <div className="border border-black/10">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs tracking-widest uppercase text-zinc-500">Name</th>
                    <th className="px-6 py-4 text-left text-xs tracking-widest uppercase text-zinc-500">Status</th>
                    <th className="px-6 py-4 text-left text-xs tracking-widest uppercase text-zinc-500">Priority</th>
                    <th className="px-6 py-4 text-left text-xs tracking-widest uppercase text-zinc-500">Owner</th>
                    <th className="px-6 py-4 text-left text-xs tracking-widest uppercase text-zinc-500">Tasks</th>
                    <th className="px-6 py-4 text-left text-xs tracking-widest uppercase text-zinc-500">Created</th>
                    <th className="px-6 py-4 text-left text-xs tracking-widest uppercase text-zinc-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/10">
                  {filteredProjects.map((project) => (
                    <tr key={project.id} className="hover:bg-zinc-50">
                      <td className="px-6 py-4">
                        <Link href={`/admin/tasks/${project.id}`} className="hover:underline">
                          <div>
                            <p className="text-sm font-medium text-zinc-900">{project.name}</p>
                            {project.description && (
                              <p className="text-xs text-zinc-500 mt-1 line-clamp-1">{project.description}</p>
                            )}
                          </div>
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium capitalize ${getStatusColor(project.status)}`}
                        >
                          {project.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium capitalize ${getPriorityColor(project.priority)}`}
                        >
                          {project.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-zinc-600">
                          {project.owner
                            ? project.owner.first_name || project.owner.full_name || project.owner.email
                            : "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-zinc-600">
                          <span className="font-medium">{project.openTasksCount}</span> / {project.taskCount}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-zinc-600">
                          {new Date(project.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditDialog(project)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit project
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleMarkCompleted(project.id)}>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Mark as completed
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleArchiveProject(project.id)}>
                              <Archive className="h-4 w-4 mr-2" />
                              Archive project
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="border border-black/10 p-12 text-center">
            <div className="max-w-md mx-auto">
              <h3 className="text-lg font-medium mb-2">No projects yet</h3>
              <p className="text-sm text-zinc-500 mb-6">
                Create your first project to group related tasks, investigations, and improvements.
              </p>
              <Button
                onClick={openCreateDialog}
                className="bg-black text-white hover:bg-black/90 rounded-none tracking-wide uppercase text-xs"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Project
              </Button>
            </div>
          </div>
        )}

        {/* Project Dialog */}
        <Dialog open={isProjectDialogOpen} onOpenChange={setIsProjectDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingProject ? "Edit Project" : "Create New Project"}</DialogTitle>
              <DialogDescription>
                {editingProject ? "Update the project details below." : "Fill in the details to create a new project."}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={projectForm.name}
                  onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                  placeholder="Project name"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={projectForm.description}
                  onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                  placeholder="Project description (optional)"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={projectForm.status}
                    onValueChange={(v: any) => setProjectForm({ ...projectForm, status: v })}
                  >
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="on_hold">On Hold</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={projectForm.priority}
                    onValueChange={(v: any) => setProjectForm({ ...projectForm, priority: v })}
                  >
                    <SelectTrigger id="priority">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="owner">Owner</Label>
                <Select
                  value={projectForm.owner_id}
                  onValueChange={(v) => setProjectForm({ ...projectForm, owner_id: v })}
                >
                  <SelectTrigger id="owner">
                    <SelectValue placeholder="Select owner (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {adminUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.first_name || user.full_name || user.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsProjectDialogOpen(false)} disabled={isSaving}>
                Cancel
              </Button>
              <Button onClick={handleSaveProject} disabled={isSaving || !projectForm.name.trim()}>
                {isSaving ? "Saving..." : editingProject ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
