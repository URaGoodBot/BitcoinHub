import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Mock user data - would come from auth context in production
  const user = {
    username: "Guest",
    streakDays: 5
  };
  
  const isActiveLink = (path: string) => location === path;

  return (
    <nav className="bg-card border-b border-muted/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/">
              <a className="flex items-center">
                <i className="fas fa-bitcoin text-primary text-2xl mr-2"></i>
                <span className="text-xl font-bold text-foreground">BitcoinHub</span>
              </a>
            </Link>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
              <Link href="/">
                <a className={`${isActiveLink('/') ? 'text-foreground border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'} px-1 pt-1 font-medium`}>
                  Dashboard
                </a>
              </Link>
              <Link href="/news">
                <a className={`${isActiveLink('/news') ? 'text-foreground border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'} px-1 pt-1 font-medium`}>
                  News
                </a>
              </Link>
              <Link href="/learn">
                <a className={`${isActiveLink('/learn') ? 'text-foreground border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'} px-1 pt-1 font-medium`}>
                  Learn
                </a>
              </Link>
              <Link href="/community">
                <a className={`${isActiveLink('/community') ? 'text-foreground border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'} px-1 pt-1 font-medium`}>
                  Community
                </a>
              </Link>
              <Link href="/portfolio">
                <a className={`${isActiveLink('/portfolio') ? 'text-foreground border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'} px-1 pt-1 font-medium`}>
                  Portfolio
                </a>
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            <Button variant="outline" size="icon" className="mr-3 relative">
              <Bell className="h-4 w-4" />
              <span className="absolute top-0 right-0 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
            </Button>
            <div className="flex items-center bg-muted rounded-full p-1 pr-3">
              <div className="rounded-full bg-muted/50 p-1">
                <i className="fas fa-user text-foreground text-sm"></i>
              </div>
              <span className="ml-2 text-sm font-medium text-foreground">{user.username}</span>
              {user.username !== "Guest" && (
                <div className="ml-2 flex items-center space-x-1">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-muted/50 text-primary">
                    <i className="fas fa-fire-flame-curved"></i> {user.streakDays} day streak
                  </span>
                </div>
              )}
            </div>
            
            <button 
              className="ml-4 sm:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
            >
              <i className={`fas fa-${mobileMenuOpen ? 'times' : 'bars'} text-foreground`}></i>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-muted/20" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link href="/">
              <a className={`${isActiveLink('/') ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted'} block px-3 py-2 rounded-md text-base font-medium`}>
                Dashboard
              </a>
            </Link>
            <Link href="/news">
              <a className={`${isActiveLink('/news') ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted'} block px-3 py-2 rounded-md text-base font-medium`}>
                News
              </a>
            </Link>
            <Link href="/learn">
              <a className={`${isActiveLink('/learn') ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted'} block px-3 py-2 rounded-md text-base font-medium`}>
                Learn
              </a>
            </Link>
            <Link href="/community">
              <a className={`${isActiveLink('/community') ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted'} block px-3 py-2 rounded-md text-base font-medium`}>
                Community
              </a>
            </Link>
            <Link href="/portfolio">
              <a className={`${isActiveLink('/portfolio') ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted'} block px-3 py-2 rounded-md text-base font-medium`}>
                Portfolio
              </a>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
