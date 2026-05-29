import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import { Outlet } from "react-router-dom";
import RouteBreadcrumb from "../route-breadcrumb";
import AppSidebar from "../app-sidebar";

export default function DashboardLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset className="flex h-svh flex-col overflow-hidden">
        {/* Fixed Header */}
        <div className="bg-background z-10 flex shrink-0 items-center gap-2 border-b p-3">
          <SidebarTrigger />
          <RouteBreadcrumb />
        </div>

        {/* Scrollable Area (X + Y) */}
        <div className="flex-1 overflow-auto p-4">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
