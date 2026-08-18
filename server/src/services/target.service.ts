import { Target } from "../models/target.model";
import { Types } from "mongoose";

export const TargetService = {
  async setTarget(
    employeeId: string,
    month: string,
    year: number,
    revenueTarget: number,
    opdTarget: number,
    ipdTarget: number,
    setById: string,
    remarks?: string
  ) {
    const target = await Target.findOneAndUpdate(
      {
        employeeId: new Types.ObjectId(employeeId),
        month,
        year,
      },
      {
        revenueTarget,
        opdTarget,
        ipdTarget,
        setBy: new Types.ObjectId(setById),
        remarks,
      },
      {
        upsert: true,
        new: true,
      }
    ).populate("employeeId", "name employeeId designation");

    return target;
  },

  async setBulkTargets(
    targets: Array<{
      employeeId: string;
      revenueTarget: number;
      opdTarget: number;
      ipdTarget: number;
    }>,
    month: string,
    year: number,
    setById: string
  ) {
    const operations = targets.map((item) => ({
      updateOne: {
        filter: {
          employeeId: new Types.ObjectId(item.employeeId),
          month,
          year,
        },
        update: {
          revenueTarget: item.revenueTarget,
          opdTarget: item.opdTarget,
          ipdTarget: item.ipdTarget,
          setBy: new Types.ObjectId(setById),
        },
        upsert: true,
      },
    }));

    await Target.bulkWrite(operations);

    return this.getTargetsByMonth(month, year);
  },

  async getTargetByEmployee(employeeId: string, month: string, year: number) {
    return await Target.findOne({
      employeeId: new Types.ObjectId(employeeId),
      month,
      year,
    }).populate("employeeId", "name employeeId designation photo");
  },

  async getTargetsByMonth(month: string, year: number) {
    return await Target.find({
      month,
      year,
    })
      .populate("employeeId", "name employeeId designation photo")
      .populate("setBy", "name")
      .sort({ createdAt: -1 });
  },

  async getAchievements(employeeId: string, month: string, year: number) {
    // Get achievements from the target document (set by admins)
    const target = await Target.findOne({
      employeeId: new Types.ObjectId(employeeId),
      month,
      year,
    });

    // Return achievements stored in the target document, or 0 if not set
    return {
      revenueAchievement: target?.revenueAchievement || 0,
      opdAchievement: target?.opdAchievement || 0,
      ipdAchievement: target?.ipdAchievement || 0,
    };
  },

  async getTargetVsAchievement(
    employeeId: string,
    month: string,
    year: number
  ) {
    const target = await this.getTargetByEmployee(employeeId, month, year);
    const achievements = await this.getAchievements(employeeId, month, year);

    return {
      target: target || {
        revenueTarget: 0,
        opdTarget: 0,
        ipdTarget: 0,
        totalIncentiveEarned: 0,
      },
      achievements: achievements || {
        revenueAchievement: 0,
        opdAchievement: 0,
        ipdAchievement: 0,
      },
      totalIncentiveEarned: target?.totalIncentiveEarned || 0,
      progress: {
        revenueProgress:
          target?.revenueTarget && target.revenueTarget > 0
            ? Math.round(
                (achievements.revenueAchievement / target.revenueTarget) * 100
              )
            : 0,
        opdProgress:
          target?.opdTarget && target.opdTarget > 0
            ? Math.round((achievements.opdAchievement / target.opdTarget) * 100)
            : 0,
        ipdProgress:
          target?.ipdTarget && target.ipdTarget > 0
            ? Math.round((achievements.ipdAchievement / target.ipdTarget) * 100)
            : 0,
      },
    };
  },

  async getAllTargetsVsAchievements(month: string, year: number) {
    const targets = await this.getTargetsByMonth(month, year);

    const results = await Promise.all(
      targets.map(async (target) => {
        const achievements = await this.getAchievements(
          target.employeeId._id.toString(),
          month,
          year
        );

        console.log(achievements);

        return {
          employee: target.employeeId,
          target: {
            revenueTarget: target.revenueTarget,
            opdTarget: target.opdTarget,
            ipdTarget: target.ipdTarget,
          },
          achievements: {
            revenueAchievement: achievements.revenueAchievement,
            opdAchievement: achievements.opdAchievement,
            ipdAchievement: achievements.ipdAchievement,
          },
          progress: {
            revenueProgress:
              target.revenueTarget && target.revenueTarget > 0
                ? Math.round(
                    (achievements.revenueAchievement / target.revenueTarget) *
                      100
                  )
                : 0,
            opdProgress:
              target.opdTarget && target.opdTarget > 0
                ? Math.round(
                    (achievements.opdAchievement / target.opdTarget) * 100
                  )
                : 0,
            ipdProgress:
              target.ipdTarget && target.ipdTarget > 0
                ? Math.round(
                    (achievements.ipdAchievement / target.ipdTarget) * 100
                  )
                : 0,
          },
        };
      })
    );

    return results;
  },

  async updateTarget(
    id: string,
    updates: Partial<{
      revenueTarget: number;
      opdTarget: number;
      ipdTarget: number;
      revenueAchievement: number;
      opdAchievement: number;
      ipdAchievement: number;
      remarks: string;
    }>
  ) {
    return await Target.findByIdAndUpdate(id, updates, { new: true }).populate(
      "employeeId",
      "name employeeId designation"
    );
  },

  async deleteTarget(id: string) {
    return await Target.findByIdAndDelete(id);
  },
};
