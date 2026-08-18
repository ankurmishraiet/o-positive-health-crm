import MyTargetsView from "@/components/hr/my-targets-view";

export default function MyTargetsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Targets</h1>
        <p className="text-muted-foreground">
          View your monthly targets and achievements
        </p>
      </div>
      <MyTargetsView />
    </div>
  );
}
