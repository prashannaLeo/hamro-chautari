import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  MessageCircle, 
  Users, 
  Camera, 
  Bell, 
  Search,
  LogOut,
  Settings
} from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import EnhancedSearch from '@/components/Friends/EnhancedSearch';

const Navbar = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const { notifications, unreadCount, markAsRead } = useNotifications();

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/messages', icon: MessageCircle, label: 'Messages' },
    { path: '/friends', icon: Users, label: 'Friends' },
    { path: '/stories', icon: Camera, label: 'Stories' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
              <span className="text-white font-bold text-xl">HC</span>
            </div>
            <span className="font-bold text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hidden sm:block">
              Hamro Chautari
            </span>
          </Link>

          {/* Search bar */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <EnhancedSearch 
              placeholder="Search friends, posts, stories..."
              onUserSelect={() => { window.location.href = '/friends'; }}
              onPostSelect={(post: any) => { window.location.href = `/?post=${post.id}`; }}
            />
          </div>

          {/* Navigation items */}
          <div className="flex items-center space-x-1 sm:space-x-3">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path} className="hidden sm:block">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`flex items-center space-x-2 px-2 sm:px-4 py-2 sm:py-3 rounded-xl font-medium transition-all duration-200 ${
                    location.pathname === item.path 
                      ? 'bg-blue-600 text-white shadow-lg hover:shadow-xl hover:bg-blue-700' 
                      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  <item.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden lg:inline text-sm">{item.label}</span>
                </Button>
              </Link>
            ))}

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative p-2 sm:p-3 rounded-xl hover:bg-blue-50 transition-colors">
                  <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 text-xs p-0 flex items-center justify-center bg-red-500 hover:bg-red-500">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72 sm:w-80 bg-white/95 backdrop-blur-sm border shadow-xl">
                <div className="p-3 sm:p-4 border-b">
                  <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Notifications</h3>
                </div>
                <div className="max-h-80 sm:max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.slice(0, 3).map((notification) => (
                      <DropdownMenuItem 
                        key={notification.id}
                        className="p-3 sm:p-4 hover:bg-blue-50 flex items-start space-x-3 border-b cursor-pointer"
                        onClick={() => {
                          if (!notification.is_read) {
                            markAsRead(notification.id);
                          }
                          // Navigate based on notification type
                          if (notification.type === 'comment' && notification.data?.post_id) {
                            window.location.href = `/?post=${notification.data.post_id}`;
                          } else if (notification.type === 'like' && notification.data?.post_id) {
                            window.location.href = `/?post=${notification.data.post_id}`;
                          } else if (notification.type === 'friend_request') {
                            window.location.href = '/friends';
                          }
                        }}
                      >
                        <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                          notification.is_read ? 'bg-gray-300' : 
                          notification.type === 'like' ? 'bg-red-500' :
                          notification.type === 'comment' ? 'bg-blue-500' :
                          notification.type === 'follow' ? 'bg-green-500' :
                          'bg-purple-500'
                        }`}></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{notification.title}</p>
                          <p className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </DropdownMenuItem>
                    ))
                  )}
                </div>
                <div className="p-3 border-t">
                  <Link to="/notifications">
                    <Button variant="ghost" className="w-full text-sm text-blue-600 hover:bg-blue-50">
                      View all notifications
                    </Button>
                  </Link>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 sm:h-10 sm:w-10 rounded-full">
                  <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                    <AvatarImage src="" alt="User" />
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm sm:text-base">
                      {user?.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48 sm:w-56" align="end" forceMount>
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="flex items-center">
                    <Avatar className="h-6 w-6 mr-2">
                      <AvatarImage src="" alt="User" />
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        {user?.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{user?.email}</p>
                      <p className="text-xs text-muted-foreground">View profile</p>
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="flex items-center">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={signOut} className="flex items-center text-destructive focus:text-destructive">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Mobile navigation */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-lg z-50 safe-area-pb">
        <div className="flex justify-around items-center py-2 px-2">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path} className="flex-1">
              <Button
                variant="ghost"
                size="sm"
                className={`flex flex-col items-center justify-center space-y-1 h-12 w-full py-1 px-1 rounded-xl transition-all duration-200 ${
                  location.pathname === item.path 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-xs font-medium leading-none">{item.label}</span>
              </Button>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;