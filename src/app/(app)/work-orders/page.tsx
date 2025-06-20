"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Search,
  ChevronRight,
  ChevronDown,
  Package,
  Wrench,
  Settings2,
  Clock,
  AlertCircle,
} from "lucide-react";
import { NewWorkOrderDialog } from '@/components/dialogs/NewWorkOrderDialog';

// Type definitions for our data
interface Project {
  id: string;
  name: string;
}

interface WorkOrder {
  id: string;
  title: string;
  type: string;
  status: string;
  priority: string;
  dueDate: string | null;
  project: Project;
  children: WorkOrder[];
}

const typeIcons = {
  assembly: Package,
  part: Wrench,
  service: Settings2,
};

const priorityColors = {
  low: "default",
  medium: "secondary",
  high: "destructive",
  urgent: "destructive",
} as const;

const statusColors = {
  pending: "pending",
  inProgress: "inProgress",
  completed: "completed",
  cancelled: "destructive",
} as const;

export default function WorkOrdersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedOrders, setExpandedOrders] = useState<string[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);

  const fetchWorkOrders = async () => {
    const response = await fetch('/api/work-orders');
    if (response.ok) {
      const data = await response.json();
      setWorkOrders(data);
    }
  };

  useEffect(() => {
    fetchWorkOrders();
  }, []);

  const toggleExpanded = (orderId: string) => {
    setExpandedOrders((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Work Orders</h1>
          <p className="text-muted-foreground">
            Manage assemblies, parts, and service orders
          </p>
        </div>
        <NewWorkOrderDialog onWorkOrderCreated={fetchWorkOrders} />
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          placeholder="Search work orders..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-lg border border-input bg-background px-10 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Work Orders List */}
      <div className="space-y-4">
        {workOrders.map((order) => {
          const Icon = typeIcons[order.type as keyof typeof typeIcons] || Package;
          const isExpanded = expandedOrders.includes(order.id);
          
          return (
            <Card key={order.id}>
              <CardHeader
                className="cursor-pointer"
                onClick={() => order.children.length > 0 && toggleExpanded(order.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {order.children.length > 0 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpanded(order.id);
                        }}
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                    <div className="p-2 bg-muted rounded-lg">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <CardTitle className="text-base">{order.id}</CardTitle>
                        <Badge variant={statusColors[order.status as keyof typeof statusColors]}>
                          {order.status}
                        </Badge>
                        <Badge variant={priorityColors[order.priority as keyof typeof priorityColors]}>
                          {order.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {order.title}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {order.dueDate ? new Date(order.dueDate).toLocaleDateString() : 'N/A'}
                    </div>
                    <span className="text-primary font-medium">
                      {order.project.name}
                    </span>
                  </div>
                </div>
              </CardHeader>
              
              {isExpanded && order.children.length > 0 && (
                <CardContent className="pt-0">
                  <div className="ml-10 space-y-2">
                    {order.children.map((child) => {
                      const ChildIcon = typeIcons[child.type as keyof typeof typeIcons] || Package;
                      return (
                        <div
                          key={child.id}
                          className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-1.5 bg-background rounded">
                              <ChildIcon className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">{child.id}</p>
                              <p className="text-xs text-muted-foreground">
                                {child.title}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={statusColors[child.status as keyof typeof statusColors]}
                              className="text-xs"
                            >
                              {child.status}
                            </Badge>
                            <Badge
                              variant={priorityColors[child.priority as keyof typeof priorityColors]}
                              className="text-xs"
                            >
                              {child.priority}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}