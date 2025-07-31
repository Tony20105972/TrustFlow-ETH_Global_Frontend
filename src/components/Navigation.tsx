import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";

const Navigation = () => {
  const location = useLocation();
  const { theme, setTheme } = useTheme();

  const navItems = [
    { path: "/", label: "Home" },
    { path: "/deploy", label: "Deploy" },
    { path: "/dao", label: "DAO" },
    { path: "/zk", label: "ZK Detector" },
    { path: "/ipfs", label: "IPFS" },
    { path: "/defi", label: "DeFi" },
    { path: "/lop", label: "LOP Analyzer" },
  ];

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-6">
          <Link to="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-trustflow-gradient"></div>
            <span className="font-bold text-xl bg-trustflow-gradient bg-clip-text text-transparent">
              TrustFlow
            </span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={location.pathname === item.path ? "default" : "ghost"}
                  size="sm"
                  className={location.pathname === item.path ? "bg-trustflow-gradient" : ""}
                >
                  {item.label}
                </Button>
              </Link>
            ))}
          </div>
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        >
          <SunIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <MoonIcon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </div>
    </nav>
  );
};

export default Navigation;