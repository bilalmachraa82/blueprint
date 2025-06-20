'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus } from 'lucide-react';

// Type definitions
interface Project {
  id: string;
  name: string;
}

interface WorkOrder {
  id: string;
  title: string;
}

interface NewTaskDialogProps {
  onTaskCreated: () => void;
}

export function NewTaskDialog({ onTaskCreated }: NewTaskDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState('');
  const [workOrderId, setWorkOrderId] = useState('');

  const [projects, setProjects] = useState<Project[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [isLoadingWorkOrders, setIsLoadingWorkOrders] = useState(false);

  // Fetch projects when the dialog opens
  useEffect(() => {
    if (open) {
      const fetchProjects = async () => {
        const response = await fetch('/api/projects', { credentials: 'include' });
        if (response.ok) {
          setProjects(await response.json());
        }
      };
      fetchProjects();
    }
  }, [open]);

  // Fetch work orders when a project is selected
  useEffect(() => {
    if (projectId) {
      const fetchWorkOrders = async () => {
        setIsLoadingWorkOrders(true);
        const response = await fetch(`/api/work-orders?projectId=${projectId}`, { credentials: 'include' });
        if (response.ok) {
          setWorkOrders(await response.json());
        }
        setIsLoadingWorkOrders(false);
      };
      fetchWorkOrders();
    } else {
      setWorkOrders([]);
    }
  }, [projectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !title) {
      alert('Project and Title are required.');
      return;
    }

    try {
      const response = await fetch('/api/tasks', {
        credentials: 'include',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, projectId, workOrderId: workOrderId || null }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create task');
      }

      const newTask = await response.json();
      console.log('Task created:', newTask);

      // Reset form and close dialog
      setTitle('');
      setDescription('');
      setProjectId('');
      setWorkOrderId('');
      onTaskCreated();
      setOpen(false);
    } catch (error) {
      console.error('Error creating task:', error);
      alert(`Failed to create task: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Task
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>Fill in the details for the new task.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Project Selector */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="project" className="text-right">Project</Label>
              <Select onValueChange={setProjectId} value={projectId}>
                <SelectTrigger className="col-span-3"><SelectValue placeholder="Select a project" /></SelectTrigger>
                <SelectContent>
                  {projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Work Order Selector (Optional) */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="work-order" className="text-right">Work Order</Label>
              <Select onValueChange={setWorkOrderId} value={workOrderId} disabled={!projectId || isLoadingWorkOrders}>
                <SelectTrigger className="col-span-3"><SelectValue placeholder={isLoadingWorkOrders ? 'Loading...' : 'Select a work order (optional)'} /></SelectTrigger>
                <SelectContent>
                  {workOrders.map((wo) => <SelectItem key={wo.id} value={wo.id}>{wo.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Title Input */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">Title</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="col-span-3" required />
            </div>

            {/* Description Input */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">Description</Label>
              <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Create Task</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
