"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Play,
  Pause,
  StopCircle,
  Clock,
  Activity,
  Package,
  Wrench,
  ShieldCheck,
  Truck,
  Settings2,
  MoreHorizontal,
} from "lucide-react";

type Operation = {
  id: string;
  title: string;
  type: string;
  status: string;
  task: string | null;
  workOrder: string;
  startTime: string | null;
  endTime?: string;
  duration: number;
  performedBy: string;
};

const operationTypes = {
  corte: { label: "Corte", icon: Activity, color: "bg-blue-500" },
  furos: { label: "Furos", icon: Settings2, color: "bg-purple-500" },
  quinagem: { label: "Quinagem", icon: Wrench, color: "bg-green-500" },
  soldadura: { label: "Soldadura", icon: Activity, color: "bg-orange-500" },
  limpeza: { label: "Limpeza", icon: ShieldCheck, color: "bg-cyan-500" },
  pintura: { label: "Pintura", icon: Package, color: "bg-pink-500" },
  montagem: { label: "Montagem", icon: Package, color: "bg-indigo-500" },
  verificacao: { label: "Verificação", icon: ShieldCheck, color: "bg-red-500" },
};

const mockOperations: Operation[] = [
  {
    id: "OP-001",
    title: "Corte de chapa metálica - Peça A234",
    type: "corte",
    status: "inProgress",
    task: "TSK-001",
    workOrder: "WO-2024-001",
    startTime: new Date().toISOString(),
    duration: 0,
    performedBy: "João Silva",
  },
  {
    id: "OP-002",
    title: "Furação de precisão - Componente B567",
    type: "furos",
    status: "pending",
    task: "TSK-002",
    workOrder: "WO-2024-002",
    startTime: null,
    duration: 0,
    performedBy: "Maria Santos",
  },
  {
    id: "OP-003",
    title: "Montagem final - Unidade C890",
    type: "montagem",
    status: "completed",
    task: null,
    workOrder: "WO-2024-001",
    startTime: "2024-02-15T09:00:00",
    endTime: "2024-02-15T11:30:00",
    duration: 150,
    performedBy: "Pedro Costa",
  },
  {
    id: "OP-004",
    title: "Soldadura TIG - Estrutura D123",
    type: "soldadura",
    status: "pending",
    task: "TSK-003",
    workOrder: "WO-2024-003",
    startTime: null,
    duration: 0,
    performedBy: "Ana Ferreira",
  },
];

export default function OperationsPage() {
  const [operations, setOperations] = useState<Operation[]>(mockOperations);
  const [activeTimers, setActiveTimers] = useState<Record<string, boolean>>({});
  const [elapsedTime, setElapsedTime] = useState<Record<string, number>>({});

  // Timer logic
  useEffect(() => {
    const interval = setInterval(() => {
      Object.entries(activeTimers).forEach(([opId, isActive]) => {
        if (isActive) {
          const op = operations.find(o => o.id === opId);
          if (op && op.startTime) {
            const elapsed = Math.floor((Date.now() - new Date(op.startTime).getTime()) / 1000);
            setElapsedTime(prev => ({ ...prev, [opId]: elapsed }));
          }
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTimers, operations]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartTimer = (opId: string) => {
    setActiveTimers(prev => ({ ...prev, [opId]: true }));
    setOperations(prev => prev.map(op => 
      op.id === opId 
        ? { ...op, startTime: new Date().toISOString(), status: "inProgress" }
        : op
    ));
  };

  const handlePauseTimer = (opId: string) => {
    setActiveTimers(prev => ({ ...prev, [opId]: false }));
  };

  const handleStopTimer = (opId: string) => {
    setActiveTimers(prev => ({ ...prev, [opId]: false }));
    const elapsed = elapsedTime[opId] || 0;
    setOperations(prev => prev.map(op => 
      op.id === opId 
        ? { 
            ...op, 
            status: "completed",
            endTime: new Date().toISOString(),
            duration: Math.floor(elapsed / 60)
          }
        : op
    ));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Operations</h1>
        <p className="text-muted-foreground">
          Track time and manage operational activities
        </p>
      </div>

      {/* Operation Types Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        {Object.entries(operationTypes).map(([key, type]) => (
          <Card key={key} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex flex-col items-center gap-2">
                <div className={`p-3 rounded-lg ${type.color} text-white`}>
                  <type.icon className="h-5 w-5" />
                </div>
                <span className="text-xs font-medium text-center">
                  {type.label}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Active Operations */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Active Operations</h2>
        {operations.map((operation) => {
          const typeInfo = operationTypes[operation.type as keyof typeof operationTypes];
          const isActive = activeTimers[operation.id];
          const currentTime = operation.status === "inProgress" 
            ? (elapsedTime[operation.id] || 0)
            : operation.duration * 60;

          return (
            <Card key={operation.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${typeInfo.color} text-white`}>
                      <typeInfo.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base">
                        {operation.title}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {operation.workOrder} {operation.task && `• ${operation.task}`}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      operation.status === "completed"
                        ? "completed"
                        : operation.status === "inProgress"
                        ? "inProgress"
                        : "pending"
                    }
                  >
                    {operation.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <span>Performed by: {operation.performedBy}</span>
                    {operation.startTime && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        Started: {new Date(operation.startTime).toLocaleTimeString()}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-2xl font-mono font-bold">
                      {formatTime(currentTime)}
                    </div>
                    
                    {operation.status === "pending" && (
                      <Button
                        size="icon"
                        onClick={() => handleStartTimer(operation.id)}
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                    )}
                    
                    {operation.status === "inProgress" && (
                      <>
                        <Button
                          size="icon"
                          variant={isActive ? "secondary" : "default"}
                          onClick={() => 
                            isActive 
                              ? handlePauseTimer(operation.id)
                              : handleStartTimer(operation.id)
                          }
                        >
                          {isActive ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          size="icon"
                          variant="destructive"
                          onClick={() => handleStopTimer(operation.id)}
                        >
                          <StopCircle className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    
                    {operation.status === "completed" && operation.endTime && (
                      <span className="text-sm text-muted-foreground">
                        Completed at {new Date(operation.endTime).toLocaleTimeString()}
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}