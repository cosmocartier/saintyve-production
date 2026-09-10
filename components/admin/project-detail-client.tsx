"use client"

import { useState } from "react"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, Pencil, Archive, MoreVertical } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export function ProjectDetailClient({ project, subprojects, tasks, adminUsers }: any) {
  const router = useRouter()

  // State for subproject dialog
  const [isSubprojectDialogOpen, setIsSubprojectDialogOpen] = useState(false)
  const [editingSubproject, setEditingSubproject] = useState<any>(null)
  const [subprojectForm, setSubprojectForm] = useState({
    name: "",
    description: "",
    status: "active" as const,
    priority: "medium" as const,
  })

  // State for task dialog
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<any>(null)
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    status: "todo" as const,
    priority: "medium" as const,
    subproject_id: "none",
    assignee_id: "none",
    due_date: "",
    linked_resource_type: "none",
    linked_resource_id: "",
  })

  // Task filters
  const [taskStatusFilter, setTaskStatusFilter] = useState("all")
  const [taskSubprojectFilter, setTaskSubprojectFilter] = useState("all")

  const [isSaving, setIsSaving] = useState(false)

  const filteredTasks = tasks.filter((task: any) => {
    const matchesStatus = taskStatusFilter === "all" || task.status === taskStatusFilter
    const matchesSubproject = taskSubprojectFilter === "all" || task.subproject_id === taskSubprojectFilter
    return matchesStatus && matchesSubproject
  })

  const openTaskDialog = (task?: any) => {
    if (task) {
      setEditingTask(task)
      setTaskForm({
        title: task.title,
        description: task.description || "",
        status: task.status,
        priority: task.priority,
        subproject_id: task.subproject_id || "none",
        assignee_id: task.assignee_id || "none",
        due_date: task.due_date || "",
        linked_resource_type: task.linked_resource_type || "none",
        linked_resource_id: task.linked_resource_id || "",
      })
    } else {
      setEditingTask(null)
      setTaskForm({
        title: "",
        description: "",
        status: "todo",
        priority: "medium",
        subproject_id: "none",
        assignee_id: "none",
        due_date: "",
        linked_resource_type: "none",
        linked_resource_id: "",
      })
    }
    setIsTaskDialogOpen(true)
  }

  const handleSaveTask = async () => {
    if (!taskForm.title.trim()) return

    setIsSaving(true)
    try {
      const payload = {
        project_id: project.id,
        title: taskForm.title.trim(),
        description: taskForm.description.trim() || null,
        status: taskForm.status,
        priority: taskForm.priority,
        subproject_id: taskForm.subproject_id === "none" ? null : taskForm.subproject_id,
        assignee_id: taskForm.assignee_id === "none" ? null : taskForm.assignee_id,
        due_date: taskForm.due_date || null,
        linked_resource_type: taskForm.linked_resource_type === "none" ? null : taskForm.linked_resource_type,
        linked_resource_id: taskForm.linked_resource_id || null,
        completed_at: taskForm.status === "done" ? new Date().toISOString() : null,
      }

      const url = editingTask ? `/api/admin/tasks/tasks?id=${editingTask.id}` : "/api/admin/tasks/tasks"

      const response = await fetch(url, {
        method: editingTask ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) throw new Error("Failed to save task")

      setIsTaskDialogOpen(false)
      router.refresh()
    } catch (error) {
      console.error("[v0] Error saving task:", error)
      alert("Failed to save task")
    } finally {
      setIsSaving(false)
    }
  }

  const handleQuickStatusChange = async (taskId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/tasks/tasks?id=${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          completed_at: newStatus === "done" ? new Date().toISOString() : null,
        }),
      })

      if (!response.ok) throw new Error("Failed to update status")
      router.refresh()
    } catch (error) {
      console.error("[v0] Error updating task status:", error)
    }
  }

  const openSubprojectDialog = (subproject?: any) => {
    if (subproject) {
      setEditingSubproject(subproject)
      setSubprojectForm({
        name: subproject.name,
        description: subproject.description || "",
        status: subproject.status,
        priority: subproject.priority,
      })
    } else {
      setEditingSubproject(null)
      setSubprojectForm({
        name: "",
        description: "",
        status: "active",
        priority: "medium",
      })
    }
    setIsSubprojectDialogOpen(true)
  }

  const handleSaveSubproject = async () => {
    if (!subprojectForm.name.trim()) return

    setIsSaving(true)
    try {
      const payload = {
        project_id: project.id,
        name: subprojectForm.name.trim(),
        description: subprojectForm.description.trim() || null,
        status: subprojectForm.status,
        priority: subprojectForm.priority,
      }

      const url = editingSubproject
        ? `/api/admin/tasks/subprojects?id=${editingSubproject.id}`
        : "/api/admin/tasks/subprojects"

      const response = await fetch(url, {
        method: editingSubproject ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) throw new Error("Failed to save subproject")

      setIsSubprojectDialogOpen(false)
      router.refresh()
    } catch (error) {
      console.error("[v0] Error saving subproject:", error)
      alert("Failed to save subproject")
    } finally {
      setIsSaving(false)
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: "bg-green-100 text-green-800",
      backlog: "bg-gray-100 text-gray-800",
      todo: "bg-blue-100 text-blue-800",
      in_progress: "bg-purple-100 text-purple-800",
      blocked: "bg-red-100 text-red-800",
      in_review: "bg-amber-100 text-amber-800",
      done: "bg-green-100 text-green-800",
      completed: "bg-blue-100 text-blue-800",
      on_hold: "bg-amber-100 text-amber-800",
      archived: "bg-gray-100 text-gray-600",
    }
    return colors[status] || "bg-gray-100 text-gray-600"
  }

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      critical: "bg-red-100 text-red-800",
      urgent: "bg-red-100 text-red-800",
      high: "bg-orange-100 text-orange-800",
      medium: "bg-yellow-100 text-yellow-800",
      low: "bg-green-100 text-green-800",
    }
    return colors[priority] || "bg-gray-100 text-gray-600"
  }

  return (
    <div className="flex min-h-screen bg-white">
      <AdminSidebar />

      <div className="flex-1 p-8">
        {/* Breadcrumbs */}
        <div className="mb-6 flex items-center gap-2 text-sm text-zinc-500">
          <Link href="/admin/tasks" className="hover:text-zinc-900">
            Tasks
          </Link>
          <span>/</span>
          <span className="text-zinc-900">{project.name}</span>
        </div>

        {/* Project Header */}
        <div className="mb-8 border border-black/10 p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-2xl font-medium tracking-wide uppercase mb-2">{project.name}</h1>
              {project.description && <p className="text-sm text-zinc-600 mb-4">{project.description}</p>}

              <div className="flex flex-wrap gap-4 text-sm text-zinc-600">
                <div className="flex items-center gap-2">
                  <span className="text-zinc-400">Status:</span>
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-medium capitalize ${getStatusColor(project.status)}`}
                  >
                    {project.status.replace("_", " ")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-zinc-400">Priority:</span>
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-medium capitalize ${getPriorityColor(project.priority)}`}
                  >
                    {project.priority}
                  </span>
                </div>
                {project.owner && (
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-400">Owner:</span>
                    <span>{project.owner.first_name || project.owner.full_name || project.owner.email}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Pencil className="h-4 w-4 mr-2" />
                Edit Project
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Subprojects */}
          <div className="lg:col-span-1">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-medium tracking-wide uppercase">Sub-projects</h2>
              <Button
                size="sm"
                onClick={() => openSubprojectDialog()}
                className="bg-black text-white hover:bg-black/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>

            <div className="space-y-3">
              {subprojects.map((sub: any) => (
                <div key={sub.id} className="border border-black/10 p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="text-sm font-medium mb-1">{sub.name}</h3>
                      {sub.description && <p className="text-xs text-zinc-500 mb-2">{sub.description}</p>}
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs capitalize ${getStatusColor(sub.status)}`}
                        >
                          {sub.status}
                        </span>
                        <span className="text-xs text-zinc-500">{sub.taskCount} tasks</span>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openSubprojectDialog(sub)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Archive className="h-4 w-4 mr-2" />
                          Archive
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}

              {subprojects.length === 0 && (
                <div className="border border-dashed border-black/10 p-6 text-center">
                  <p className="text-sm text-zinc-500 mb-3">No sub-projects yet</p>
                  <Button size="sm" variant="outline" onClick={() => openSubprojectDialog()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Sub-project
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Tasks */}
          <div className="lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-medium tracking-wide uppercase">Tasks</h2>
              <Button size="sm" onClick={() => openTaskDialog()} className="bg-black text-white hover:bg-black/90">
                <Plus className="h-4 w-4 mr-2" />
                New Task
              </Button>
            </div>

            {/* Task Filters */}
            <div className="mb-4 flex gap-2">
              <Select value={taskStatusFilter} onValueChange={setTaskStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="backlog">Backlog</SelectItem>
                  <SelectItem value="todo">To-do</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                  <SelectItem value="in_review">In Review</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>

              <Select value={taskSubprojectFilter} onValueChange={setTaskSubprojectFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sub-projects</SelectItem>
                  {subprojects.map((sub: any) => (
                    <SelectItem key={sub.id} value={sub.id}>
                      {sub.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tasks Table */}
            {filteredTasks.length > 0 ? (
              <div className="border border-black/10">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-zinc-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs tracking-widest uppercase text-zinc-500">Title</th>
                        <th className="px-4 py-3 text-left text-xs tracking-widest uppercase text-zinc-500">Status</th>
                        <th className="px-4 py-3 text-left text-xs tracking-widest uppercase text-zinc-500">
                          Priority
                        </th>
                        <th className="px-4 py-3 text-left text-xs tracking-widest uppercase text-zinc-500">
                          Assignee
                        </th>
                        <th className="px-4 py-3 text-left text-xs tracking-widest uppercase text-zinc-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/10">
                      {filteredTasks.map((task: any) => (
                        <tr key={task.id} className="hover:bg-zinc-50">
                          <td className="px-4 py-3">
                            <div>
                              <p className="text-sm font-medium">{task.title}</p>
                              {task.subproject && (
                                <p className="text-xs text-zinc-500 mt-0.5">{task.subproject.name}</p>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <Select value={task.status} onValueChange={(v) => handleQuickStatusChange(task.id, v)}>
                              <SelectTrigger className="w-32 h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="backlog">Backlog</SelectItem>
                                <SelectItem value="todo">To-do</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="blocked">Blocked</SelectItem>
                                <SelectItem value="in_review">In Review</SelectItem>
                                <SelectItem value="done">Done</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex rounded-full px-2 py-1 text-xs capitalize ${getPriorityColor(task.priority)}`}
                            >
                              {task.priority}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm text-zinc-600">
                              {task.assignee
                                ? task.assignee.first_name || task.assignee.full_name || task.assignee.email
                                : "—"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <Button variant="ghost" size="sm" onClick={() => openTaskDialog(task)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="border border-dashed border-black/10 p-8 text-center">
                <p className="text-sm text-zinc-500 mb-3">No tasks yet</p>
                <Button size="sm" onClick={() => openTaskDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Task
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Subproject Dialog */}
        <Dialog open={isSubprojectDialogOpen} onOpenChange={setIsSubprojectDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingSubproject ? "Edit Sub-project" : "Create Sub-project"}</DialogTitle>
              <DialogDescription>
                {editingSubproject ? "Update the sub-project details." : "Add a new sub-project to organize tasks."}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="sub-name">Name *</Label>
                <Input
                  id="sub-name"
                  value={subprojectForm.name}
                  onChange={(e) => setSubprojectForm({ ...subprojectForm, name: e.target.value })}
                  placeholder="Sub-project name"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="sub-description">Description</Label>
                <Textarea
                  id="sub-description"
                  value={subprojectForm.description}
                  onChange={(e) => setSubprojectForm({ ...subprojectForm, description: e.target.value })}
                  placeholder="Description (optional)"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Status</Label>
                  <Select
                    value={subprojectForm.status}
                    onValueChange={(v: any) => setSubprojectForm({ ...subprojectForm, status: v })}
                  >
                    <SelectTrigger>
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
                  <Label>Priority</Label>
                  <Select
                    value={subprojectForm.priority}
                    onValueChange={(v: any) => setSubprojectForm({ ...subprojectForm, priority: v })}
                  >
                    <SelectTrigger>
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
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsSubprojectDialogOpen(false)} disabled={isSaving}>
                Cancel
              </Button>
              <Button onClick={handleSaveSubproject} disabled={isSaving || !subprojectForm.name.trim()}>
                {isSaving ? "Saving..." : editingSubproject ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Task Dialog */}
        <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingTask ? "Edit Task" : "Create New Task"}</DialogTitle>
              <DialogDescription>
                {editingTask ? "Update the task details." : "Add a new task to the project."}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="task-title">Title *</Label>
                <Input
                  id="task-title"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  placeholder="Task title"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="task-description">Description</Label>
                <Textarea
                  id="task-description"
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  placeholder="Task description (optional)"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Status</Label>
                  <Select value={taskForm.status} onValueChange={(v: any) => setTaskForm({ ...taskForm, status: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="backlog">Backlog</SelectItem>
                      <SelectItem value="todo">To-do</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="blocked">Blocked</SelectItem>
                      <SelectItem value="in_review">In Review</SelectItem>
                      <SelectItem value="done">Done</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label>Priority</Label>
                  <Select
                    value={taskForm.priority}
                    onValueChange={(v: any) => setTaskForm({ ...taskForm, priority: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Sub-project</Label>
                  <Select
                    value={taskForm.subproject_id}
                    onValueChange={(v) => setTaskForm({ ...taskForm, subproject_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {subprojects.map((sub: any) => (
                        <SelectItem key={sub.id} value={sub.id}>
                          {sub.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label>Assignee</Label>
                  <Select
                    value={taskForm.assignee_id}
                    onValueChange={(v) => setTaskForm({ ...taskForm, assignee_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {adminUsers.map((user: any) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.first_name || user.full_name || user.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="due-date">Due Date</Label>
                <Input
                  id="due-date"
                  type="date"
                  value={taskForm.due_date}
                  onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Linked Resource Type</Label>
                  <Select
                    value={taskForm.linked_resource_type}
                    onValueChange={(v) => setTaskForm({ ...taskForm, linked_resource_type: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="None" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="order">Order</SelectItem>
                      <SelectItem value="investigation">Investigation</SelectItem>
                      <SelectItem value="membership">Membership</SelectItem>
                      <SelectItem value="product">Product</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="resource-id">Resource ID</Label>
                  <Input
                    id="resource-id"
                    value={taskForm.linked_resource_id}
                    onChange={(e) => setTaskForm({ ...taskForm, linked_resource_id: e.target.value })}
                    placeholder="ID or slug"
                    disabled={taskForm.linked_resource_type === "none"}
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsTaskDialogOpen(false)} disabled={isSaving}>
                Cancel
              </Button>
              <Button onClick={handleSaveTask} disabled={isSaving || !taskForm.title.trim()}>
                {isSaving ? "Saving..." : editingTask ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
