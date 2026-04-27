import { SidebarInset, SidebarProvider, SidebarTrigger } from "../ui/sidebar";
import RouteBreadcrumb from "../route-breadcrumb";
import { Outlet, useLocation } from "react-router-dom";
import UserSidebar from "../user-sidebar";

const UserLayout = () => {
  const location = useLocation();

  // Define routes where header should be hidden
  const hideHeaderRoutes = [
    "/create-lost-item",
    "/create-found-item",
    "/messages",
    "/profile/edit",
    "/my-items",
  ];

  // Or use pattern matching for dynamic routes
  const shouldHideHeader =
    hideHeaderRoutes.includes(location.pathname) || location.pathname === "/";

  return (
    <SidebarProvider>
      <UserSidebar />

      <SidebarInset className="flex h-svh flex-col overflow-hidden">
        {/* Fixed Header - Conditionally rendered */}
        {!shouldHideHeader && (
          <div className="bg-background z-10 hidden shrink-0 items-center gap-2 border-b p-3 md:flex">
            <SidebarTrigger />
            <RouteBreadcrumb />
          </div>
        )}

        {/* Scrollable Area (X + Y) */}
        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default UserLayout;
