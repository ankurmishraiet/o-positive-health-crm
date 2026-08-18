"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "@/axios/axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Target, TrendingUp, Award } from "lucide-react";
import {
  extractMonthFromYYYYMM,
  extractYearFromYYYYMM,
  getCurrentMonthYYYYMM,
  formatMonthYear,
} from "@/lib/date-utils";
import { Skeleton } from "@/components/ui/skeleton";

interface TargetData {
  revenueTarget: number;
  opdTarget: number;
  ipdTarget: number;
  totalIncentiveEarned?: number;
}

interface AchievementData {
  revenueAchievement: number;
  opdAchievement: number;
  ipdAchievement: number;
}

interface ProgressData {
  revenueProgress: number;
  opdProgress: number;
  ipdProgress: number;
}

interface TargetVsAchievement {
  target: TargetData;
  achievements: AchievementData;
  totalIncentiveEarned?: number;
  progress: ProgressData;
}

interface Employee {
  _id: string;
  employeeId: string;
  name?: string;
}

export default function MyTargetsView({ employeeId }: { employeeId?: string }) {
  const { session } = useAuth();
  const [month, setMonth] = useState<string>(getCurrentMonthYYYYMM());
  const [data, setData] = useState<TargetVsAchievement | null>(null);
  const [loading, setLoading] = useState(false);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const { toast } = useToast();

  const fetchEmployee = useCallback(async (): Promise<Employee | null> => {
    try {
      const empId = employeeId || session?.user?.employeeId;
      if (!empId) return null;

      const response = await axios.get(`/employees`);
      const employeesList = Array.isArray(response.data)
        ? response.data
        : response.data?.employees || [];

      const foundEmployee = employeesList.find(
        (emp: Employee) => emp.employeeId === empId,
      );

      if (!foundEmployee) {
        toast({
          title: "Employee Not Found",
          description: "Could not find employee record",
          variant: "destructive",
        });
        return null;
      }

      return foundEmployee;
    } catch (error) {
      console.error("Error fetching employee:", error);
      toast({
        title: "Error",
        description: "Failed to fetch employee data",
        variant: "destructive",
      });
      return null;
    }
  }, [employeeId, session, toast]);

  const fetchTargetVsAchievement = useCallback(async () => {
    if (!employee) return;

    try {
      setLoading(true);
      const monthStr = extractMonthFromYYYYMM(month);
      const year = extractYearFromYYYYMM(month);

      const response = await axios.get(
        `/targets/employee/${employee._id}/vs-achievement`,
        {
          params: {
            month: monthStr,
            year,
            includeIncentives: true,
          },
        },
      );

      // Normalize data to ensure proper structure
      const normalizedData: TargetVsAchievement = {
        target: {
          revenueTarget: response.data.target?.revenueTarget || 0,
          opdTarget: response.data.target?.opdTarget || 0,
          ipdTarget: response.data.target?.ipdTarget || 0,
          totalIncentiveEarned: response.data.target?.totalIncentiveEarned || 0,
        },
        achievements: {
          revenueAchievement:
            response.data.achievements?.revenueAchievement || 0,
          opdAchievement: response.data.achievements?.opdAchievement || 0,
          ipdAchievement: response.data.achievements?.ipdAchievement || 0,
        },
        totalIncentiveEarned: response.data.totalIncentiveEarned || 0,
        progress: {
          revenueProgress:
            response.data.progress?.revenueProgress ||
            response.data.progress?.leadProgress ||
            0,
          opdProgress: response.data.progress?.opdProgress || 0,
          ipdProgress: response.data.progress?.ipdProgress || 0,
        },
      };

      // Calculate progress if not provided by API
      if (
        !response.data.progress?.revenueProgress &&
        normalizedData.target.revenueTarget > 0
      ) {
        normalizedData.progress.revenueProgress =
          (normalizedData.achievements.revenueAchievement /
            normalizedData.target.revenueTarget) *
          100;
      }

      if (
        !response.data.progress?.opdProgress &&
        normalizedData.target.opdTarget > 0
      ) {
        normalizedData.progress.opdProgress =
          (normalizedData.achievements.opdAchievement /
            normalizedData.target.opdTarget) *
          100;
      }

      if (
        !response.data.progress?.ipdProgress &&
        normalizedData.target.ipdTarget > 0
      ) {
        normalizedData.progress.ipdProgress =
          (normalizedData.achievements.ipdAchievement /
            normalizedData.target.ipdTarget) *
          100;
      }

      setData(normalizedData);
    } catch (error) {
      console.error("Error fetching target vs achievement:", error);
      toast({
        title: "Error",
        description: "Failed to load target data for the selected month",
        variant: "destructive",
      });
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [employee, month, toast]);

  useEffect(() => {
    const loadEmployeeAndTargets = async () => {
      if (!month) return;

      const emp = await fetchEmployee();
      if (emp) {
        setEmployee(emp);
      }
    };

    loadEmployeeAndTargets();
  }, [month, fetchEmployee]);

  useEffect(() => {
    if (employee && month) {
      fetchTargetVsAchievement();
    }
  }, [employee, month, fetchTargetVsAchievement]);

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return "text-green-600";
    if (progress >= 75) return "text-blue-600";
    if (progress >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const getProgressBgColor = (progress: number) => {
    if (progress >= 100) return "bg-green-500";
    if (progress >= 75) return "bg-blue-500";
    if (progress >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat("en-IN").format(num);
  };

  const formatPercentage = (value: number): string => {
    return `${Math.min(Math.round(value * 10) / 10, 100).toFixed(1)}%`;
  };

  const renderTargetCard = (
    title: string,
    achievement: number,
    target: number,
    progress: number,
    isCurrency: boolean = false,
  ) => (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-bold">
              {isCurrency
                ? formatCurrency(achievement)
                : formatNumber(achievement)}
            </div>
            <div className="text-sm text-muted-foreground">
              / {isCurrency ? formatCurrency(target) : formatNumber(target)}
            </div>
          </div>
          <Progress value={Math.min(progress, 100)} className="h-2" />
          <div className={`text-sm font-medium ${getProgressColor(progress)}`}>
            {formatPercentage(progress)} Complete
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                My Targets & Achievements
              </CardTitle>
              <CardDescription>
                Track your monthly targets and progress for{" "}
                {formatMonthYear(month)}
              </CardDescription>
            </div>
            <div>
              <Input
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-[200px]"
                disabled={loading}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-6">
              <div className="grid gap-6 md:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                  <Card key={i}>
                    <CardHeader className="pb-3">
                      <Skeleton className="h-4 w-24" />
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-baseline justify-between">
                        <Skeleton className="h-8 w-20" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                      <Skeleton className="h-2 w-full" />
                      <Skeleton className="h-4 w-24" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : !data ? (
            <div className="text-center py-8">
              <div className="text-muted-foreground mb-4">
                No targets found for {formatMonthYear(month)}
              </div>
              <p className="text-sm text-muted-foreground">
                Please contact your manager to set up targets for this month.
              </p>
            </div>
          ) : (
            <>
              <div className="grid gap-6 md:grid-cols-3">
                {renderTargetCard(
                  "Revenue Target",
                  data.achievements.revenueAchievement,
                  data.target.revenueTarget,
                  data.progress.revenueProgress,
                  true,
                )}
                {renderTargetCard(
                  "OPD Target",
                  data.achievements.opdAchievement,
                  data.target.opdTarget,
                  data.progress.opdProgress,
                )}
                {renderTargetCard(
                  "IPD Target",
                  data.achievements.ipdAchievement,
                  data.target.ipdTarget,
                  data.progress.ipdProgress,
                )}
              </div>

              {data.totalIncentiveEarned !== undefined &&
                data.totalIncentiveEarned > 0 && (
                  <div className="mt-6 animate-in fade-in duration-500">
                    <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <Award className="h-4 w-4 text-green-600" />
                          Total Incentive Earned
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-3xl font-bold text-green-700">
                              {formatCurrency(data.totalIncentiveEarned)}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Running total of all incentives earned
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-green-600">
                              Current Month
                            </div>
                            <div className="text-lg font-semibold text-green-700">
                              {data.target.totalIncentiveEarned
                                ? formatCurrency(
                                    data.target.totalIncentiveEarned,
                                  )
                                : "₹0"}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
