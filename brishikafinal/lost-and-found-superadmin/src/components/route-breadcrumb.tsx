import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useLocation, Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export default function RouteBreadcrumb() {
  const location = useLocation();
  const paths = location.pathname.split("/").filter(Boolean);

  // Root → Dashboard only
  if (paths.length === 0) {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink className="text-foreground pointer-events-none text-lg text-[16px] leading-4 font-medium">
              Dashboard
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {paths.map((path, index) => {
          const href = "/" + paths.slice(0, index + 1).join("/");

          const label = path
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");

          const isLast = index === paths.length - 1;

          return (
            <div key={href} className="flex items-center">
              {index > 0 && <BreadcrumbSeparator />}

              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link
                    to={href}
                    className={cn(
                      "text-lg text-[16px] leading-4 font-medium transition-colors",
                      isLast
                        ? "text-foreground pointer-events-none"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {label}
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
            </div>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
