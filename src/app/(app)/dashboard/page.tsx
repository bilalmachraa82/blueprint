"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  FileText,
  FolderOpen,
  TrendingUp,
  Users,
  Clock,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Data types
interface Project {
  id: string;
  name: string;
  status: string;
}

interface WorkOrder {
  id: string;
  title: string;
  status: string;
  dueDate: string | null;
}

interface Task {
  id: string;
  title: string;
  status: string;
  createdAt: string;
}

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [projectsRes, workOrdersRes, tasksRes] = await Promise.all([
        fetch('/api/projects'),
        fetch('/api/work-orders'),
        fetch('/api/tasks'),
      ]);

      if (projectsRes.ok) setProjects(await projectsRes.json());
      if (workOrdersRes.ok) setWorkOrders(await workOrdersRes.json());
      if (tasksRes.ok) setTasks(await tasksRes.json());
    };

    fetchData();
  }, []);

  // Calculate stats
  const activeProjects = projects.filter(p => p.status === 'inProgress').length;
  const openWorkOrders = workOrders.filter(wo => wo.status !== 'completed' && wo.status !== 'cancelled').length;
  const tasksInProgress = tasks.filter(t => t.status === 'inProgress').length;

  const stats = [
    {
      title: "Active Projects",
      value: activeProjects,
      icon: FolderOpen,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Open Work Orders",
      value: openWorkOrders,
      icon: FileText,
      color: "text-secondary",
      bgColor: "bg-secondary/10",
    },
    {
      title: "Tasks In Progress",
      value: tasksInProgress,
      icon: Clock,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    // Placeholder for Quality Checks
    {
      title: "Quality Checks",
      value: "N/A",
      icon: CheckCircle2,
      color: "text-success",
      bgColor: "bg-success/10",
    },
  ];

  // Prepare data for charts
  const workOrderChartData = [
    { name: 'Pending', value: workOrders.filter(wo => wo.status === 'pending').length },
    { name: 'In Progress', value: workOrders.filter(wo => wo.status === 'inProgress').length },
    { name: 'Completed', value: workOrders.filter(wo => wo.status === 'completed').length },
  ];

  const recentTasks = tasks.slice(0, 4); // Get the 4 most recent tasks

  // Placeholder data for other charts
  const qualityData = [
    { name: "Passed", value: 89, color: "#10b981" },
    { name: "Failed", value: 8, color: "#ef4444" },
    { name: "Pending", value: 3, color: "#f59e0b" },
  ];

  const productionData = [
    { name: "Week 1", production: 850, target: 900 },
    { name: "Week 2", production: 920, target: 900 },
    { name: "Week 3", production: 880, target: 900 },
    { name: "Week 4", production: 960, target: 900 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's an overview of your workspace.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className={`${stat.bgColor} p-2 rounded-lg`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Chart Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Work Order Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={workOrderChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#1B4F72" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Recent Activities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-start gap-4 pb-4 last:pb-0 border-b last:border-0"
                >
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">{task.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Created: {new Date(task.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge
                    variant={
                      task.status === "completed"
                        ? "completed"
                        : task.status === "inProgress"
                        ? "inProgress"
                        : "pending"
                    }
                  >
                    {task.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Quality Control Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              Quality Control Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={qualityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {qualityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Production Line Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Production vs Target
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={productionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="production" stroke="#1B4F72" strokeWidth={2} />
                <Line type="monotone" dataKey="target" stroke="#F39C12" strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}