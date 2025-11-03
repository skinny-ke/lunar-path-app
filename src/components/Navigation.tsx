import { Link, useLocation } from "react-router-dom";
import { Home, Calendar, BarChart3, User, History as HistoryIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const Navigation = () => {
  const location = useLocation();

  const navItems = [
    { path: "/dashboard", icon: Home, label: "Home" },
    { path: "/calendar", icon: Calendar, label: "Calendar" },
    { path: "/history", icon: HistoryIcon, label: "History" },
    { path: "/analytics", icon: BarChart3, label: "Stats" },
    { path: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-lg border-t border-border/50 shadow-soft">
      <div className="container mx-auto px-4">
        <div className="flex justify-around items-center h-16">
          {navItems.map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all duration-300",
                  isActive
                    ? "text-primary scale-110"
                    : "text-muted-foreground hover:text-primary hover:scale-105"
                )}
              >
                <Icon className={cn("h-6 w-6", isActive && "drop-shadow-glow")} />
                <span className="text-xs font-medium">{label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;