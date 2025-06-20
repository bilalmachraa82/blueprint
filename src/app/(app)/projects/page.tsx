"use client";

import { useState, useEffect } from 'react'; 
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NewProjectDialog } from '@/components/dialogs/NewProjectDialog';
import { EditProjectDialog } from '@/components/dialogs/EditProjectDialog';
import { apiGet } from '@/lib/utils/fetch';
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Calendar,
  Users,
  Image as ImageIcon,
  Edit,
} from "lucide-react";

const mockProjects = [
  {
    id: "1",
    name: "Manufacturing Line A",
    description: "Complete overhaul of production line A including new equipment installation",
    status: "active",
    startDate: "2024-01-15",
    endDate: "2024-06-30",
    progress: 65,
    manager: "John Doe",
    images: 3,
  },
  {
    id: "2",
    name: "Quality System Upgrade",
    description: "Implementation of new quality control procedures and equipment",
    status: "active",
    startDate: "2024-02-01",
    endDate: "2024-05-15",
    progress: 80,
    manager: "Jane Smith",
    images: 5,
  },
  {
    id: "3",
    name: "Warehouse Expansion",
    description: "Expansion of warehouse B to increase storage capacity by 40%",
    status: "onHold",
    startDate: "2024-03-01",
    endDate: "2024-08-31",
    progress: 25,
    manager: "Mike Johnson",
    images: 2,
  },
  {
    id: "4",
    name: "Assembly Line Optimization",
    description: "Optimization of assembly line workflow for increased efficiency",
    status: "completed",
    startDate: "2023-11-01",
    endDate: "2024-01-31",
    progress: 100,
    manager: "Sarah Davis",
    images: 8,
  },
];

const statusColors = {
  active: "success",
  completed: "completed",
  onHold: "pending",
  cancelled: "destructive",
} as const;

// Define Project interface based on usage and Prisma schema
interface Project {
  id: string;
  name: string;
  description: string | null;
  status: string;
  progress: number;
  startDate: string | null; // Assuming string from API, will be formatted
  endDate?: string | null;
  manager?: string; // This might be a relation in Prisma, simplify for now
  images?: string[];
  // Fields from Prisma schema that might be useful
  organizationId: string;
  createdBy: string;
  createdAt: string; // Dates are often strings in JSON
  updatedAt: string;
}

export default function ProjectsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [projects, setProjects] = useState<Project[]>([]); // Typed the projects state
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const fetchProjects = async () => {
    try {
      const response = await apiGet('/api/projects');
      if (!response.ok) {
        console.error('Failed to fetch projects:', response.status);
        const errorData = await response.json();
        console.error('Error response:', errorData);
        // Use mock data if API fails
        setProjects(mockProjects);
        return;
      }
      
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
      // Use mock data if API fails
      setProjects(mockProjects);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (project.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || project.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">
            Manage and track all your projects in one place
          </p>
        </div>
        <NewProjectDialog onProjectCreated={fetchProjects} />
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-10 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-lg border border-input bg-background px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="onHold">On Hold</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Projects Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredProjects.map((project) => (
          <Card key={project.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{project.name}</CardTitle>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => {
                    setEditingProject(project);
                    setIsEditDialogOpen(true);
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {project.description || 'No description'}
              </p>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Progress</span>
                  <span className="text-sm font-medium">{project.progress}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'N/A'}
                </div>
                <Badge variant={statusColors[project.status as keyof typeof statusColors]}>
                  {project.status}
                </Badge>
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{project.manager}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <ImageIcon className="h-4 w-4" />
                  <span>{project.images}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Project Dialog */}
      {editingProject && (
        <EditProjectDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          project={editingProject}
          onProjectUpdated={() => {
            fetchProjects();
            setIsEditDialogOpen(false);
            setEditingProject(null);
          }}
        />
      )}
    </div>
  );
}