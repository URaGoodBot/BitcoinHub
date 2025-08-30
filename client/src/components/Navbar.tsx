import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Bell, TrendingUp, TrendingDown, AlertCircle, X } from "lucide-react";
import bitcoinHouseImage from "@assets/Screen Shot 2025-07-09 at 3.38.43 PM_1752093374897.png";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { DonationButton } from "@/components/DonationButton";

const Navbar = () => {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAllNotifications, setShowAllNotifications] = useState(false);
  const queryClient = useQueryClient();
  
  const isActiveLink = (path: string) => location === path;

  // Fetch real-time notifications
  const { data: notifications = [], isLoading: notificationsLoading } = useQuery({
    queryKey: ['/api/notifications'],
    refetchInterval: 2 * 60 * 1000, // Check every 2 minutes for new notifications
  });

  const notificationsList = Array.isArray(notifications) ? notifications : [];
  const unreadCount = notificationsList.filter((n: any) => !n.read).length;

  // Mutation to mark notification as read and remove it
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      await apiRequest('POST', `/api/notifications/${notificationId}/read`, {});
    },
    onSuccess: (_, notificationId) => {
      // Remove the notification from the cache
      queryClient.setQueryData(['/api/notifications'], (oldData: any[]) => {
        return oldData ? oldData.filter(n => n.id !== notificationId) : [];
      });
    },
  });

  // Mutation to clear all notifications
  const clearAllMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', '/api/notifications/clear-all', {});
    },
    onSuccess: () => {
      // Clear all notifications from cache
      queryClient.setQueryData(['/api/notifications'], []);
      setShowAllNotifications(false);
    },
  });

  const handleNotificationClick = (notificationId: string) => {
    markAsReadMutation.mutate(notificationId);
  };

  const handleViewAllNotifications = () => {
    setShowAllNotifications(!showAllNotifications);
  };

  const handleClearAllNotifications = () => {
    clearAllMutation.mutate();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'price_alert':
        return TrendingUp;
      case 'news':
        return AlertCircle;
      case 'market':
        return TrendingDown;
      default:
        return Bell;
    }
  };

  return (
    <nav className="bg-card border-b border-muted/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/">
              <div className="flex items-center cursor-pointer">
                <img 
                  src={bitcoinHouseImage} 
                  alt="BitcoinHub Logo" 
                  className="w-8 h-8 rounded-lg mr-2 object-cover"
                />
                <span className="text-xl font-bold text-foreground">BitcoinHub</span>
              </div>
            </Link>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
              <Link href="/">
                <a className={`${isActiveLink('/') ? 'text-foreground border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'} px-1 pt-1 font-medium`}>
                  Learn
                </a>
              </Link>
              <Link href="/analytics">
                <a className={`${isActiveLink('/analytics') ? 'text-foreground border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'} px-1 pt-1 font-medium`}>
                  Analytics
                </a>
              </Link>
              <Link href="/news">
                <a className={`${isActiveLink('/news') ? 'text-foreground border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'} px-1 pt-1 font-medium`}>
                  News
                </a>
              </Link>
              <Link href="/web-resources">
                <a className={`${isActiveLink('/web-resources') ? 'text-foreground border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'} px-1 pt-1 font-medium`}>
                  Web Resources
                </a>
              </Link>
              <Link href="/legislation">
                <a className={`${isActiveLink('/legislation') ? 'text-foreground border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'} px-1 pt-1 font-medium`}>
                  Legislation
                </a>
              </Link>
              <Link href="/indicators">
                <a className={`${isActiveLink('/indicators') ? 'text-foreground border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'} px-1 pt-1 font-medium`}>
                  Indicators
                </a>
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="relative">
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <div className="px-3 py-2 border-b">
                  <h4 className="font-medium">Notifications</h4>
                  {unreadCount > 0 && (
                    <p className="text-sm text-muted-foreground">{unreadCount} new</p>
                  )}
                </div>
                {notificationsLoading ? (
                  <div className="px-3 py-6 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                    <p className="text-sm text-muted-foreground mt-2">Loading notifications...</p>
                  </div>
                ) : notificationsList.length > 0 ? (
                  <div className="max-h-96 overflow-y-auto">
                    {(showAllNotifications ? notificationsList : notificationsList.slice(0, 5)).map((notification: any) => {
                      const Icon = getNotificationIcon(notification.type);
                      return (
                        <DropdownMenuItem 
                          key={notification.id} 
                          className="px-3 py-3 cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => handleNotificationClick(notification.id)}
                        >
                          <div className="flex items-start gap-3 w-full">
                            <div className={`p-1 rounded-full ${
                              notification.priority === 'high' ? 'bg-red-100 text-red-600' :
                              notification.type === 'price_alert' ? 'bg-green-100 text-green-600' :
                              notification.type === 'news' ? 'bg-blue-100 text-blue-600' :
                              'bg-orange-100 text-orange-600'
                            }`}>
                              <Icon className="h-3 w-3" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm ${!notification.read ? 'font-medium' : 'font-normal'}`}>
                                {notification.title}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                {notification.message}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(notification.timestamp).toLocaleTimeString([], { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {!notification.read && (
                                <div className="w-2 h-2 bg-primary rounded-full"></div>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleNotificationClick(notification.id);
                                }}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </DropdownMenuItem>
                      );
                    })}
                  </div>
                ) : (
                  <div className="px-3 py-6 text-center text-muted-foreground">
                    <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No notifications yet</p>
                  </div>
                )}
                <DropdownMenuSeparator />
                <div className="px-3 py-2 flex gap-2">
                  <DropdownMenuItem 
                    className="flex-1 justify-center text-sm text-primary cursor-pointer"
                    onClick={handleViewAllNotifications}
                  >
                    {showAllNotifications ? 'Show less' : `View all (${notificationsList.length})`}
                  </DropdownMenuItem>
                  {notificationsList.length > 0 && (
                    <DropdownMenuItem 
                      className="justify-center text-sm text-destructive cursor-pointer"
                      onClick={handleClearAllNotifications}
                    >
                      Clear all
                    </DropdownMenuItem>
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Bitcoin Donation Button */}
            <DonationButton />
            
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="sm:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <div className="space-y-1">
                <div className="w-5 h-0.5 bg-foreground"></div>
                <div className="w-5 h-0.5 bg-foreground"></div>
                <div className="w-5 h-0.5 bg-foreground"></div>
              </div>
            </Button>
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
            <Link href="/web-resources">
              <a className={`${isActiveLink('/web-resources') ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted'} block px-3 py-2 rounded-md text-base font-medium`}>
                Web Resources
              </a>
            </Link>
            <Link href="/legislation">
              <a className={`${isActiveLink('/legislation') ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted'} block px-3 py-2 rounded-md text-base font-medium`}>
                Legislation
              </a>
            </Link>
            <Link href="/indicators">
              <a className={`${isActiveLink('/indicators') ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted'} block px-3 py-2 rounded-md text-base font-medium`}>
                Indicators
              </a>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;