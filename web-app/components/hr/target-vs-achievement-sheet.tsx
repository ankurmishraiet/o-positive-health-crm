"use client";

import { useState, useEffect } from "react";
import axios from "@/axios/axios";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Save, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import {
  extractMonthFromYYYYMM,
  extractYearFromYYYYMM,
  getCurrentMonthYYYYMM,
} from "@/lib/date-utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Employee {
  _id: string;
  name: string;
  employeeId: string;
  designation: string;
  photo?: string;
}

interface TargetData {
  employeeId: string;
  revenueTarget: number;
  opdTarget: number;
  ipdTarget: number;
  revenueAchievement: number;
  opdAchievement: number;
  ipdAchievement: number;
}

interface ExistingTarget {
  _id: string;
  employeeId: {
    _id: string;
    name: string;
    employeeId: string;
    designation: string;
  };
  revenueTarget: number;
  opdTarget: number;
  ipdTarget: number;
  revenueAchievement: number;
  opdAchievement: number;
  ipdAchievement: number;
  month: string;
  year: number;
}

interface TargetVsAchievement {
  employee: Employee;
  target: {
    revenueTarget: number;
    opdTarget: number;
    ipdTarget: number;
    _id?: string;
  };
  achievements: {
    revenueAchievement: number;
    opdAchievement: number;
    ipdAchievement: number;
  };
  progress: {
    revenueProgress: number;
    opdProgress: number;
    ipdProgress: number;
  };
}

export default function TargetVsAchievementSheet() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [month, setMonth] = useState<string>(getCurrentMonthYYYYMM());
  const [targets, setTargets] = useState<Record<string, TargetData>>({});
  const [existingTargets, setExistingTargets] = useState<
    Record<string, ExistingTarget>
  >({});
  const [achievements, setAchievements] = useState<TargetVsAchievement[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState<"set" | "view" | "achievement">(
    "view"
  );
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [editTarget, setEditTarget] = useState<TargetData | null>(null);
  const [deletingTargetId, setDeletingTargetId] = useState<string | null>(null);
  const { toast } = useToast();

  // Extract year from month whenever month changes
  const year = extractYearFromYYYYMM(month);

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (month) {
      if (viewMode === "view") {
        fetchTargetsVsAchievements();
      } else {
        fetchExistingTargets();
      }
    }
  }, [month, viewMode]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/employees");
      // API returns { employees, total, page, totalPages }
      const employeesList = Array.isArray(response.data)
        ? response.data
        : response.data.employees || [];
      setEmployees(employeesList);
    } catch (error) {
      console.error("Error fetching employees:", error);
      toast({
        title: "Error",
        description: "Failed to fetch employees",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTargetsVsAchievements = async () => {
    try {
      setLoading(true);
      const monthStr = extractMonthFromYYYYMM(month);
      const response = await axios.get(`/targets/vs-achievements`, {
        params: { month: monthStr, year },
      });
      setAchievements(response.data);
    } catch (error) {
      console.error("Error fetching targets vs achievements:", error);
      setAchievements([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchExistingTargets = async () => {
    try {
      setLoading(true);
      const monthStr = extractMonthFromYYYYMM(month);
      const response = await axios.get(`/targets/monthly`, {
        params: { month: monthStr, year },
      });

      const targetsMap: Record<string, ExistingTarget> = {};
      const targetsDataMap: Record<string, TargetData> = {};

      response.data.forEach((target: ExistingTarget) => {
        const empId = target.employeeId._id;
        targetsMap[empId] = target;
        targetsDataMap[empId] = {
          employeeId: empId,
          revenueTarget: target.revenueTarget,
          opdTarget: target.opdTarget,
          ipdTarget: target.ipdTarget,
          revenueAchievement: target.revenueAchievement || 0,
          opdAchievement: target.opdAchievement || 0,
          ipdAchievement: target.ipdAchievement || 0,
        };
      });

      setExistingTargets(targetsMap);
      setTargets(targetsDataMap);
    } catch (error) {
      console.error("Error fetching existing targets:", error);
      setExistingTargets({});
      setTargets({});
    } finally {
      setLoading(false);
    }
  };

  const handleTargetChange = (
    employeeId: string,
    field: "revenueTarget" | "opdTarget" | "ipdTarget",
    value: string
  ) => {
    setTargets((prev) => ({
      ...prev,
      [employeeId]: {
        ...prev[employeeId],
        employeeId,
        revenueTarget: prev[employeeId]?.revenueTarget || 0,
        opdTarget: prev[employeeId]?.opdTarget || 0,
        ipdTarget: prev[employeeId]?.ipdTarget || 0,
        [field]: parseInt(value) || 0,
      },
    }));
  };

  const handleSaveTargets = async () => {
    try {
      setSaving(true);

      const targetsArray = Object.values(targets).filter(
        (t) => t.revenueTarget > 0 || t.opdTarget > 0 || t.ipdTarget > 0
      );

      if (targetsArray.length === 0) {
        toast({
          title: "Warning",
          description: "Please set targets for at least one employee",
          variant: "destructive",
        });
        return;
      }

      const monthStr = extractMonthFromYYYYMM(month);

      await axios.post("/targets/bulk", {
        targets: targetsArray,
        month: monthStr,
        year,
      });

      toast({
        title: "Success",
        description: `Targets set for ${targetsArray.length} employees`,
      });

      // Refresh existing targets to show the newly saved data
      fetchExistingTargets();
    } catch (error: any) {
      console.error("Error saving targets:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to save targets",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEditTarget = (employee: Employee) => {
    const existingTarget = existingTargets[employee._id];
    if (existingTarget) {
      setEditingEmployee(employee);
      setEditTarget({
        employeeId: employee._id,
        revenueTarget: existingTarget.revenueTarget,
        opdTarget: existingTarget.opdTarget,
        ipdTarget: existingTarget.ipdTarget,
        revenueAchievement: existingTarget.revenueAchievement || 0,
        opdAchievement: existingTarget.opdAchievement || 0,
        ipdAchievement: existingTarget.ipdAchievement || 0,
      });
    }
  };

  const handleSaveEdit = async () => {
    if (!editingEmployee || !editTarget) return;

    try {
      setSaving(true);
      const targetId = existingTargets[editingEmployee._id]?._id;

      if (!targetId) {
        toast({
          title: "Error",
          description: "Target ID not found",
          variant: "destructive",
        });
        return;
      }

      await axios.put(`/targets/${targetId}`, {
        revenueTarget: editTarget.revenueTarget,
        opdTarget: editTarget.opdTarget,
        ipdTarget: editTarget.ipdTarget,
      });

      toast({
        title: "Success",
        description: "Target updated successfully",
      });

      setEditingEmployee(null);
      setEditTarget(null);
      fetchExistingTargets();
    } catch (error: any) {
      console.error("Error updating target:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update target",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTarget = async () => {
    if (!deletingTargetId) return;

    try {
      await axios.delete(`/targets/${deletingTargetId}`);

      toast({
        title: "Success",
        description: "Target deleted successfully",
      });

      setDeletingTargetId(null);
      fetchExistingTargets();
    } catch (error: any) {
      console.error("Error deleting target:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete target",
        variant: "destructive",
      });
    }
  };

  const handleAchievementChange = (
    employeeId: string,
    field: "revenueAchievement" | "opdAchievement" | "ipdAchievement",
    value: string
  ) => {
    setTargets((prev) => ({
      ...prev,
      [employeeId]: {
        ...prev[employeeId],
        employeeId,
        revenueTarget:
          prev[employeeId]?.revenueTarget ||
          existingTargets[employeeId]?.revenueTarget ||
          0,
        opdTarget:
          prev[employeeId]?.opdTarget ||
          existingTargets[employeeId]?.opdTarget ||
          0,
        ipdTarget:
          prev[employeeId]?.ipdTarget ||
          existingTargets[employeeId]?.ipdTarget ||
          0,
        revenueAchievement:
          prev[employeeId]?.revenueAchievement ||
          existingTargets[employeeId]?.revenueAchievement ||
          0,
        opdAchievement:
          prev[employeeId]?.opdAchievement ||
          existingTargets[employeeId]?.opdAchievement ||
          0,
        ipdAchievement:
          prev[employeeId]?.ipdAchievement ||
          existingTargets[employeeId]?.ipdAchievement ||
          0,
        [field]: parseInt(value) || 0,
      },
    }));
  };

  const handleSaveAchievements = async () => {
    try {
      setSaving(true);

      const achievementsToUpdate = Object.entries(targets)
        .filter(([employeeId, data]) => existingTargets[employeeId])
        .map(([employeeId, data]) => ({
          employeeId,
          targetId: existingTargets[employeeId]._id,
          revenueAchievement:
            data.revenueAchievement ??
            existingTargets[employeeId].revenueAchievement ??
            0,
          opdAchievement:
            data.opdAchievement ??
            existingTargets[employeeId].opdAchievement ??
            0,
          ipdAchievement:
            data.ipdAchievement ??
            existingTargets[employeeId].ipdAchievement ??
            0,
        }));

      if (achievementsToUpdate.length === 0) {
        toast({
          title: "Warning",
          description: "No employees with targets for this month",
          variant: "destructive",
        });
        return;
      }

      // Update each target's achievement
      await Promise.all(
        achievementsToUpdate.map((achievement) =>
          axios.put(`/targets/${achievement.targetId}`, {
            revenueAchievement: achievement.revenueAchievement,
            opdAchievement: achievement.opdAchievement,
            ipdAchievement: achievement.ipdAchievement,
          })
        )
      );

      toast({
        title: "Success",
        description: `Achievements updated for ${achievementsToUpdate.length} employees`,
      });

      // Refresh data
      fetchExistingTargets();
      fetchTargetsVsAchievements();
      setTargets({});
    } catch (error: any) {
      console.error("Error saving achievements:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to save achievements",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return "bg-green-500";
    if (progress >= 75) return "bg-blue-500";
    if (progress >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Target vs Achievement</CardTitle>
          <CardDescription>
            Set targets and view achievements for employees
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <Input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-[200px]"
            />

            <Select
              value={viewMode}
              onValueChange={(value) =>
                setViewMode(value as "set" | "view" | "achievement")
              }
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="view">View Achievements</SelectItem>
                <SelectItem value="set">Set Targets</SelectItem>
                <SelectItem value="achievement">Set Achievement</SelectItem>
              </SelectContent>
            </Select>

            {viewMode === "set" && (
              <Button onClick={handleSaveTargets} disabled={saving}>
                <Save className="mr-2 h-4 w-4" />
                {saving ? "Saving..." : "Save Targets"}
              </Button>
            )}

            {viewMode === "achievement" && (
              <Button onClick={handleSaveAchievements} disabled={saving}>
                <Save className="mr-2 h-4 w-4" />
                {saving ? "Saving..." : "Save Achievements"}
              </Button>
            )}
          </div>

          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : viewMode === "set" ? (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">S.No</TableHead>
                    <TableHead>Employee ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Designation</TableHead>
                    <TableHead>Revenue Target</TableHead>
                    <TableHead>OPD Target</TableHead>
                    <TableHead>IPD Target</TableHead>
                    <TableHead className="w-[120px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((employee, index) => (
                    <TableRow key={employee._id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{employee.employeeId}</TableCell>
                      <TableCell>{employee.name}</TableCell>
                      <TableCell>{employee.designation}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          value={targets[employee._id]?.revenueTarget || ""}
                          onChange={(e) =>
                            handleTargetChange(
                              employee._id,
                              "revenueTarget",
                              e.target.value
                            )
                          }
                          className="w-[100px]"
                          placeholder="0"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          value={targets[employee._id]?.opdTarget || ""}
                          onChange={(e) =>
                            handleTargetChange(
                              employee._id,
                              "opdTarget",
                              e.target.value
                            )
                          }
                          className="w-[100px]"
                          placeholder="0"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          value={targets[employee._id]?.ipdTarget || ""}
                          onChange={(e) =>
                            handleTargetChange(
                              employee._id,
                              "ipdTarget",
                              e.target.value
                            )
                          }
                          className="w-[100px]"
                          placeholder="0"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {existingTargets[employee._id] && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditTarget(employee)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  setDeletingTargetId(
                                    existingTargets[employee._id]._id
                                  )
                                }
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : viewMode === "achievement" ? (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">S.No</TableHead>
                    <TableHead>Employee ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Designation</TableHead>
                    <TableHead>Revenue Achievement</TableHead>
                    <TableHead>OPD Achievement</TableHead>
                    <TableHead>IPD Achievement</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.values(existingTargets).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        No targets set for this month. Please set targets first.
                      </TableCell>
                    </TableRow>
                  ) : (
                    Object.values(existingTargets).map((target, index) => (
                      <TableRow key={target._id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{target.employeeId.employeeId}</TableCell>
                        <TableCell>{target.employeeId.name}</TableCell>
                        <TableCell>{target.employeeId.designation}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Input
                              type="number"
                              min="0"
                              value={
                                targets[target.employeeId._id]
                                  ?.revenueAchievement ??
                                target.revenueAchievement ??
                                ""
                              }
                              onChange={(e) =>
                                handleAchievementChange(
                                  target.employeeId._id,
                                  "revenueAchievement",
                                  e.target.value
                                )
                              }
                              className="w-[100px]"
                              placeholder="0"
                            />
                            <div className="text-xs text-gray-500">
                              Target: {target.revenueTarget}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Input
                              type="number"
                              min="0"
                              value={
                                targets[target.employeeId._id]
                                  ?.opdAchievement ??
                                target.opdAchievement ??
                                ""
                              }
                              onChange={(e) =>
                                handleAchievementChange(
                                  target.employeeId._id,
                                  "opdAchievement",
                                  e.target.value
                                )
                              }
                              className="w-[100px]"
                              placeholder="0"
                            />
                            <div className="text-xs text-gray-500">
                              Target: {target.opdTarget}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Input
                              type="number"
                              min="0"
                              value={
                                targets[target.employeeId._id]
                                  ?.ipdAchievement ??
                                target.ipdAchievement ??
                                ""
                              }
                              onChange={(e) =>
                                handleAchievementChange(
                                  target.employeeId._id,
                                  "ipdAchievement",
                                  e.target.value
                                )
                              }
                              className="w-[100px]"
                              placeholder="0"
                            />
                            <div className="text-xs text-gray-500">
                              Target: {target.ipdTarget}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">S.No</TableHead>
                    <TableHead>Employee</TableHead>
                    <TableHead>Designation</TableHead>
                    <TableHead>Leads</TableHead>
                    <TableHead>OPD</TableHead>
                    <TableHead>IPD</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {achievements.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        No targets set for this month
                      </TableCell>
                    </TableRow>
                  ) : (
                    achievements.map((item, index) => (
                      <TableRow key={item.employee._id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {item.employee.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {item.employee.employeeId}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{item.employee.designation}</TableCell>
                        <TableCell>
                          <div className="space-y-2">
                            <div className="text-sm">
                              {item.achievements.revenueAchievement} /{" "}
                              {item.target.revenueTarget}
                            </div>
                            <div className="flex items-center gap-2">
                              <Progress
                                value={item.progress.revenueProgress}
                                className="h-2"
                              />
                              <span className="text-xs font-medium">
                                {item.progress.revenueProgress}%
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-2">
                            <div className="text-sm">
                              {item.achievements.opdAchievement} /{" "}
                              {item.target.opdTarget}
                            </div>
                            <div className="flex items-center gap-2">
                              <Progress
                                value={item.progress.opdProgress}
                                className="h-2"
                              />
                              <span className="text-xs font-medium">
                                {item.progress.opdProgress}%
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-2">
                            <div className="text-sm">
                              {item.achievements.ipdAchievement} /{" "}
                              {item.target.ipdTarget}
                            </div>
                            <div className="flex items-center gap-2">
                              <Progress
                                value={item.progress.ipdProgress}
                                className="h-2"
                              />
                              <span className="text-xs font-medium">
                                {item.progress.ipdProgress}%
                              </span>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Target Dialog */}
      <Dialog
        open={!!editingEmployee}
        onOpenChange={(open) => {
          if (!open) {
            setEditingEmployee(null);
            setEditTarget(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Target for {editingEmployee?.name}</DialogTitle>
            <DialogDescription>
              Update monthly targets for {editingEmployee?.employeeId}
            </DialogDescription>
          </DialogHeader>
          {editTarget && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label
                  htmlFor="revenueTarget"
                  className="text-right font-medium"
                >
                  Revenue Target
                </label>
                <Input
                  id="revenueTarget"
                  type="number"
                  min="0"
                  value={editTarget.revenueTarget}
                  onChange={(e) =>
                    setEditTarget({
                      ...editTarget,
                      revenueTarget: parseInt(e.target.value) || 0,
                    })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="opdTarget" className="text-right font-medium">
                  OPD Target
                </label>
                <Input
                  id="opdTarget"
                  type="number"
                  min="0"
                  value={editTarget.opdTarget}
                  onChange={(e) =>
                    setEditTarget({
                      ...editTarget,
                      opdTarget: parseInt(e.target.value) || 0,
                    })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="ipdTarget" className="text-right font-medium">
                  IPD Target
                </label>
                <Input
                  id="ipdTarget"
                  type="number"
                  min="0"
                  value={editTarget.ipdTarget}
                  onChange={(e) =>
                    setEditTarget({
                      ...editTarget,
                      ipdTarget: parseInt(e.target.value) || 0,
                    })
                  }
                  className="col-span-3"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditingEmployee(null);
                setEditTarget(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deletingTargetId}
        onOpenChange={(open) => {
          if (!open) setDeletingTargetId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Target</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this target? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTarget}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
