"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Download,
  FileText,
  BarChart3,
  TrendingUp,
  Package,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

const reportTypes = [
  {
    id: "production",
    title: "Production Report",
    description: "Daily and weekly production metrics",
    icon: BarChart3,
    color: "bg-blue-500",
    metrics: {
      unitsProduced: 1234,
      efficiency: "92%",
      downtime: "2.5 hours",
    },
  },
  {
    id: "quality",
    title: "Quality Report",
    description: "Quality control metrics and defect analysis",
    icon: CheckCircle,
    color: "bg-green-500",
    metrics: {
      passRate: "96.5%",
      defectsFound: 42,
      inspectionsCompleted: 856,
    },
  },
  {
    id: "inventory",
    title: "Inventory Report",
    description: "Stock levels and material usage",
    icon: Package,
    color: "bg-purple-500",
    metrics: {
      stockLevel: "78%",
      materialsUsed: "$12,450",
      reorderNeeded: 15,
    },
  },
  {
    id: "performance",
    title: "Performance Report",
    description: "Employee and equipment performance",
    icon: TrendingUp,
    color: "bg-orange-500",
    metrics: {
      avgCycleTime: "45 min",
      utilizationRate: "87%",
      tasksCompleted: 234,
    },
  },
];

export default function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("week");
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });

  const handleGenerateReport = (reportType: string) => {
    // In a real app, this would generate and download the report
    console.log(`Generating ${reportType} report for period: ${dateRange.start} to ${dateRange.end}`);
    alert(`Generating ${reportType} report...`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">
            Generate and analyze operational reports
          </p>
        </div>
      </div>

      {/* Date Range Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Report Period</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex gap-2">
              <Button
                variant={selectedPeriod === "day" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setSelectedPeriod("day");
                  setDateRange({
                    start: new Date().toISOString().split('T')[0],
                    end: new Date().toISOString().split('T')[0],
                  });
                }}
              >
                Today
              </Button>
              <Button
                variant={selectedPeriod === "week" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setSelectedPeriod("week");
                  setDateRange({
                    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    end: new Date().toISOString().split('T')[0],
                  });
                }}
              >
                Last 7 Days
              </Button>
              <Button
                variant={selectedPeriod === "month" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setSelectedPeriod("month");
                  setDateRange({
                    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    end: new Date().toISOString().split('T')[0],
                  });
                }}
              >
                Last 30 Days
              </Button>
              <Button
                variant={selectedPeriod === "custom" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPeriod("custom")}
              >
                Custom
              </Button>
            </div>
            {selectedPeriod === "custom" && (
              <div className="flex gap-2 items-center">
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
                <span className="text-muted-foreground">to</span>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Report Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportTypes.map((report) => (
          <Card key={report.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${report.color} text-white`}>
                    <report.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle>{report.title}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {report.description}
                    </p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Metrics Preview */}
                <div className="grid grid-cols-3 gap-4">
                  {Object.entries(report.metrics).map(([key, value]) => (
                    <div key={key} className="text-center">
                      <p className="text-2xl font-bold">{value}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    onClick={() => handleGenerateReport(report.id)}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                  <Button variant="outline" size="icon">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              { name: "Production Report - Week 7", date: "2024-02-15", type: "production" },
              { name: "Quality Analysis - February", date: "2024-02-14", type: "quality" },
              { name: "Inventory Status - Q1", date: "2024-02-12", type: "inventory" },
              { name: "Performance Review - Team A", date: "2024-02-10", type: "performance" },
            ].map((report, index) => {
              const reportType = reportTypes.find(r => r.id === report.type);
              const Icon = reportType?.icon || FileText;
              
              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{report.name}</p>
                      <p className="text-xs text-muted-foreground">{report.date}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}