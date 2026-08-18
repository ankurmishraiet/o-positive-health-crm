"use client";

import { useEffect, useState } from "react";
import axios from "@/axios/axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  LabelList,
} from "recharts";

interface OPDIPDTrendData {
  period: string;
  opd: number;
  ipd: number;
}

interface DepartmentData {
  department: string;
  opd: number;
  ipd: number;
  total: number;
}

interface RevenueData {
  period: string;
  revenue: number;
}

interface FunnelData {
  stage: string;
  value: number;
  fill: string;
}

// Chart configurations
const opdIpdChartConfig = {
  opd: {
    label: "OPD",
    color: "hsl(var(--chart-1))",
  },
  ipd: {
    label: "IPD",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

const departmentChartConfig = {
  total: {
    label: "Total",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

const revenueChartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

const funnelChartConfig = {
  value: {
    label: "Count",
  },
} satisfies ChartConfig;

export default function DashboardAnalytics() {
  const [opdIpdTrends, setOpdIpdTrends] = useState<OPDIPDTrendData[]>([]);
  const [trendPeriod, setTrendPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [departmentData, setDepartmentData] = useState<DepartmentData[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [revenuePeriod, setRevenuePeriod] = useState<'daily' | 'monthly' | 'yearly'>('monthly');
  const [funnelData, setFunnelData] = useState<FunnelData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllAnalytics();
  }, []);

  useEffect(() => {
    fetchOPDIPDTrends();
  }, [trendPeriod]);

  useEffect(() => {
    fetchRevenueAnalytics();
  }, [revenuePeriod]);

  const fetchAllAnalytics = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchOPDIPDTrends(),
        fetchDepartmentDistribution(),
        fetchRevenueAnalytics(),
        fetchFunnelData(),
      ]);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOPDIPDTrends = async () => {
    try {
      const response = await axios.get(`/dashboard/analytics/opd-ipd-trends?period=${trendPeriod}`);
      setOpdIpdTrends(response.data);
    } catch (error) {
      console.error("Error fetching OPD/IPD trends:", error);
    }
  };

  const fetchDepartmentDistribution = async () => {
    try {
      const response = await axios.get('/dashboard/analytics/department-distribution');
      const dataWithTotal = response.data.map((dept: any) => ({
        ...dept,
        total: dept.opd + dept.ipd,
      }));
      setDepartmentData(dataWithTotal);
    } catch (error) {
      console.error("Error fetching department distribution:", error);
    }
  };

  const fetchRevenueAnalytics = async () => {
    try {
      const response = await axios.get(`/dashboard/analytics/revenue?period=${revenuePeriod}`);
      setRevenueData(response.data.data);
      setTotalRevenue(response.data.total);
    } catch (error) {
      console.error("Error fetching revenue analytics:", error);
    }
  };

  const fetchFunnelData = async () => {
    try {
      const response = await axios.get('/dashboard/analytics/funnel');
      const funnelColors = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];
      const dataWithColors = response.data.map((item: any, index: number) => ({
        ...item,
        fill: funnelColors[index % funnelColors.length],
      }));
      setFunnelData(dataWithColors);
    } catch (error) {
      console.error("Error fetching funnel data:", error);
    }
  };

  const formatCurrency = (value: number) => {
    if (value >= 10000000) {
      return `₹${(value / 10000000).toFixed(2)}Cr`;
    } else if (value >= 100000) {
      return `₹${(value / 100000).toFixed(2)}L`;
    } else if (value >= 1000) {
      return `₹${(value / 1000).toFixed(2)}K`;
    }
    return `₹${value.toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart - OPD/IPD Trends */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>OPD & IPD Trends</CardTitle>
                <CardDescription>Patient visits over time</CardDescription>
              </div>
              <Tabs value={trendPeriod} onValueChange={(v) => setTrendPeriod(v as 'monthly' | 'yearly')}>
                <TabsList>
                  <TabsTrigger value="monthly">Monthly</TabsTrigger>
                  <TabsTrigger value="yearly">Yearly</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            <ChartContainer config={opdIpdChartConfig} className="h-[300px]">
              <BarChart data={opdIpdTrends}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="period"
                  tickLine={false}
                  axisLine={false}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="opd" fill="var(--color-opd)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="ipd" fill="var(--color-ipd)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Pie Chart - Department Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Department-wise Distribution</CardTitle>
            <CardDescription>Total OPD & IPD by department</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={departmentChartConfig} className="h-[300px]">
              <PieChart>
                <Pie
                  data={departmentData}
                  dataKey="total"
                  nameKey="department"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ department, percent }) => 
                    percent > 0.05 ? `${department}: ${(percent * 100).toFixed(0)}%` : ''
                  }
                >
                  {departmentData.map((_, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={`hsl(var(--chart-${(index % 5) + 1}))`} 
                    />
                  ))}
                </Pie>
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  formatter={(value, name, props) => [
                    `OPD: ${props.payload.opd}, IPD: ${props.payload.ipd}, Total: ${value}`,
                    name
                  ]}
                />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Donut Chart - Revenue */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Revenue Analytics</CardTitle>
                <CardDescription>Total: {formatCurrency(totalRevenue)}</CardDescription>
              </div>
              <Tabs value={revenuePeriod} onValueChange={(v) => setRevenuePeriod(v as 'daily' | 'monthly' | 'yearly')}>
                <TabsList>
                  <TabsTrigger value="daily">Daily</TabsTrigger>
                  <TabsTrigger value="monthly">Monthly</TabsTrigger>
                  <TabsTrigger value="yearly">Yearly</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            <ChartContainer config={revenueChartConfig} className="h-[300px]">
              <PieChart>
                <Pie
                  data={revenueData}
                  dataKey="revenue"
                  nameKey="period"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  label={({ period, percent }) => 
                    percent > 0.05 ? period : ''
                  }
                >
                  {revenueData.map((_, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={`hsl(var(--chart-${(index % 5) + 1}))`} 
                    />
                  ))}
                </Pie>
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  formatter={(value: any) => [formatCurrency(value), "Revenue"]}
                />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Funnel Chart - Conversion */}
        <Card>
          <CardHeader>
            <CardTitle>Conversion Funnel</CardTitle>
            <CardDescription>Lead to patient conversion pipeline</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={funnelChartConfig} className="h-[300px]">
              <BarChart data={funnelData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tickLine={false} axisLine={false} />
                <YAxis 
                  dataKey="stage" 
                  type="category" 
                  tickLine={false} 
                  axisLine={false}
                  width={150}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                  <LabelList dataKey="value" position="right" />
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
