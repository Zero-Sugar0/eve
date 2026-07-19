"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Clock, AlertCircle, CheckCircle2, TrendingUp } from "lucide-react";

interface AgentRun {
  id: string;
  agentType: string;
  action: string;
  status: "pending" | "success" | "failed";
  duration?: number;
  cost?: string;
  createdAt: Date;
}

interface AnalyticsData {
  total: number;
  successful: number;
  failed: number;
  avgDuration: number;
  totalCost: number;
}

export function AgentAnalytics() {
  const [runs, setRuns] = useState<AgentRun[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch("/api/agent-runs?limit=100");
        if (response.ok) {
          const data = await response.json();
          setRuns(data.runs);

          // Calculate analytics
          const successful = data.runs.filter(
            (r: AgentRun) => r.status === "success",
          ).length;
          const failed = data.runs.filter(
            (r: AgentRun) => r.status === "failed",
          ).length;
          const avgDuration =
            data.runs.reduce((sum: number, r: AgentRun) => sum + (r.duration || 0), 0) /
            data.runs.length || 0;
          const totalCost = data.runs.reduce(
            (sum: number, r: AgentRun) => sum + parseFloat(r.cost || "0"),
            0,
          );

          setAnalytics({
            total: data.runs.length,
            successful,
            failed,
            avgDuration,
            totalCost,
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  // Group runs by agent type for chart
  const chartData = runs.reduce(
    (acc: Record<string, any>, run: AgentRun) => {
      const existing = acc[run.agentType] || { type: run.agentType, success: 0, failed: 0 };
      if (run.status === "success") existing.success++;
      else if (run.status === "failed") existing.failed++;
      acc[run.agentType] = existing;
      return acc;
    },
    {},
  );

  const agentTypeData = Object.values(chartData);

  if (isLoading) {
    return <div className="text-center py-8">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Runs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.total || 0}</div>
            <p className="text-xs text-gray-500">All-time agent executions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600">
              <CheckCircle2 className="h-4 w-4 inline mr-1" />
              Successful
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {analytics?.successful || 0}
            </div>
            <p className="text-xs text-gray-500">
              {analytics?.total
                ? `${((analytics.successful / analytics.total) * 100).toFixed(1)}% success rate`
                : "N/A"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-600">
              <AlertCircle className="h-4 w-4 inline mr-1" />
              Failed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {analytics?.failed || 0}
            </div>
            <p className="text-xs text-gray-500">Failed executions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-600">
              <Clock className="h-4 w-4 inline mr-1" />
              Avg Duration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(analytics?.avgDuration || 0).toFixed(0)}
            </div>
            <p className="text-xs text-gray-500">milliseconds</p>
          </CardContent>
        </Card>
      </div>

      {/* Agent Type Distribution */}
      {agentTypeData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Agent Execution by Type</CardTitle>
            <CardDescription>
              Success and failure count by agent type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={agentTypeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="success" fill="#10b981" name="Successful" />
                <Bar dataKey="failed" fill="#ef4444" name="Failed" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Recent Runs */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Runs</CardTitle>
          <CardDescription>Last 10 agent executions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {runs.slice(0, 10).map((run) => (
              <div
                key={run.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-medium">{run.agentType || "Unknown"}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(run.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {run.duration && (
                    <span className="text-sm text-gray-600">
                      {run.duration}ms
                    </span>
                  )}
                  <Badge
                    variant={
                      run.status === "success"
                        ? "default"
                        : run.status === "failed"
                          ? "destructive"
                          : "secondary"
                    }
                  >
                    {run.status}
                  </Badge>
                </div>
              </div>
            ))}
            {runs.length === 0 && (
              <p className="text-center text-gray-500 py-8">
                No agent runs yet. Start using the agent to see analytics!
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
