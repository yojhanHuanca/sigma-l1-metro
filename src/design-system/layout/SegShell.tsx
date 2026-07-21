import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function SegShell({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar right={right} />
        <main className="flex-1 px-7 py-7 max-w-[1500px] w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
