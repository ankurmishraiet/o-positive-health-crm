import TargetVsAchievementSheet from "@/components/hr/target-vs-achievement-sheet";

export default function TargetsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Target vs Achievement</h1>
        <p className="text-muted-foreground">
          Set targets and track employee performance
        </p>
      </div>
      <TargetVsAchievementSheet />
    </div>
  );
}
