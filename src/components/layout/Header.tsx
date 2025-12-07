import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Building2, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function Header() {
  const { isAuthenticated, role, flatNumber, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-card shadow-sm">
      <div className="container flex h-16 items-center justify-between">
        <div 
          className="flex items-center gap-3 cursor-pointer" 
          onClick={() => navigate("/")}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold leading-tight">D Block</h1>
            <p className="text-xs text-muted-foreground">Finance Tracker</p>
          </div>
        </div>

        {isAuthenticated && (
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">
                {role === "admin" ? "Administrator" : `Flat ${flatNumber}`}
              </p>
              <p className="text-xs text-muted-foreground capitalize">{role}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
