import Search from "../search";

export function NavActions() {
  return (
    <div className="flex items-center gap-2 text-sm">
      <div className="hidden font-medium text-muted-foreground md:inline-block">
        <Search />
      </div>
    </div>
  );
}

export default NavActions;
