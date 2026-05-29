import React, { useState, useEffect } from "react";
import {
  X,
  Search,
  Filter,
  User,
  Award,
  ChevronDown,
  Package,
  LogOut,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { getInitials } from "@/utils/formatUtils";
import { NotificationBell } from "./NotificationBell";

interface FilterBarProps {
  activeStatus: "lost" | "found" | undefined;
  onStatusChange: (status: "lost" | "found" | undefined) => void;
  onSearch: (query: string) => void;
  searchQuery: string;
  onCategoryChange: (category: string) => void;
  categories: string[];
  activeCategory: string;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  activeStatus,
  onStatusChange,
  onSearch,
  searchQuery,
  onCategoryChange,
  categories,
  activeCategory,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="relative">
        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Search by name, description, or tags..."
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
          className="rounded-full bg-gray-50 pr-10 pl-10"
        />
        {searchQuery && (
          <button
            onClick={() => onSearch("")}
            className="absolute top-1/2 right-3 -translate-y-1/2"
          >
            <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      <div className="mt-4">
        <Tabs
          defaultValue="all"
          value={activeStatus || "all"}
          onValueChange={(v) =>
            onStatusChange(v === "all" ? undefined : (v as "lost" | "found"))
          }
        >
          <TabsList className="grid w-full grid-cols-3 rounded-xl bg-gray-100 p-1">
            <TabsTrigger
              value="all"
              className="rounded-lg data-[state=active]:bg-white"
            >
              All
            </TabsTrigger>
            <TabsTrigger
              value="lost"
              className="rounded-lg data-[state=active]:bg-white"
            >
              Lost
            </TabsTrigger>
            <TabsTrigger
              value="found"
              className="rounded-lg data-[state=active]:bg-white"
            >
              Found
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="mt-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-sm text-gray-600"
        >
          <Filter className="h-4 w-4" />
          <span>Categories</span>
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform",
              isExpanded && "rotate-180",
            )}
          />
        </button>

        {isExpanded && (
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge
              className={cn(
                "cursor-pointer px-3 py-1 text-sm",
                !activeCategory && "bg-blue-500 text-white",
              )}
              onClick={() => onCategoryChange("")}
            >
              All
            </Badge>
            {categories.map((cat) => (
              <Badge
                key={cat}
                variant={activeCategory === cat ? "default" : "outline"}
                className={cn(
                  "cursor-pointer px-3 py-1 text-sm",
                  activeCategory === cat && "bg-blue-500 text-white",
                )}
                onClick={() => onCategoryChange(cat)}
              >
                {cat}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// NAVBAR

interface NavbarProps {
  user: any;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        "sticky top-0 z-50 border-b bg-white/80 backdrop-blur-lg transition-shadow md:hidden",
        isScrolled && "shadow-md",
      )}
    >
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-500">
            <Award className="h-6 w-6 text-white" />
          </div>
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-xl font-bold text-transparent">
            Lost & Found
          </span>
        </div>

        <div className="flex items-center gap-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <NotificationBell />
              </TooltipTrigger>
              <TooltipContent>Notifications</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 rounded-full p-0"
              >
                <Avatar className="h-9 w-9">
                  {user.avatar ? (
                    <AvatarImage src={user.avatar} />
                  ) : (
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                      {getInitials(user.name || user.email)}
                    </AvatarFallback>
                  )}
                </Avatar>
                <span className="hidden text-sm font-medium md:inline">
                  {user.name}
                </span>
                <ChevronDown className="hidden h-4 w-4 md:block" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem
                onClick={() => (window.location.href = "/profile")}
              >
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => (window.location.href = "/my-items")}
              >
                <Package className="mr-2 h-4 w-4" />
                My Items
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onLogout} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
};
