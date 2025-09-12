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
  Settings,
  Menu
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
    <>
      {/* Desktop Navigation */}
      <nav className="desktop-header hidden sm:block">
        <div className="container-mobile">
          <div className="flex justify-between items-center h-16 lg:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <span className="text-white font-bold text-lg lg:text-xl">HC</span>
              </div>
              <span className="font-bold text-xl lg:text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hidden md:block">
                Hamro Chautari
              </span>
            </Link>

            {/* Search bar */}
            <div className="hidden lg:flex flex-1 max-w-lg mx-8">
              <EnhancedSearch 
                placeholder="Search friends, posts, stories..."
                onUserSelect={() => { window.location.href = '/friends'; }}
                onPostSelect={(post: any) => { window.location.href = `/?post=${post.id}`; }}
              />
            </div>

            {/* Navigation items */}
            <div className="flex items-center space-x-1 lg:space-x-2">
              {navItems.map((item) => (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`btn-ghost-mobile hidden md:flex ${
                      location.pathname === item.path 
                        ? 'bg-primary text-primary-foreground shadow-lg' 
                        : 'text-gray-600 hover:text-primary hover:bg-primary/10'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="hidden lg:inline text-sm ml-2">{item.label}</span>
                  </Button>
                </Link>
              ))}

              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="btn-ghost-mobile relative">
                    <Bell className="w-5 h-5 text-gray-600" />
                    {unreadCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 w-5 h-5 text-xs p-0 flex items-center justify-center bg-red-500 hover:bg-red-500">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 bg-white/95 backdrop-blur-sm border shadow-xl z-50">
                  <div className="p-4 border-b">
                    <h3 className="font-semibold text-gray-800">Notifications</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        No notifications yet
                      </div>
                    ) : (
                      notifications.slice(0, 3).map((notification) => (
                        <DropdownMenuItem 
                          key={notification.id}
                          className="p-4 hover:bg-blue-50 flex items-start space-x-3 border-b cursor-pointer"
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
                  <Button variant="ghost" className="btn-ghost-mobile">
                    <Avatar className="avatar-mobile-md">
                      <AvatarImage src="" alt="User" />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {user?.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 z-50" align="end" forceMount>
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
      </nav>

      {/* Mobile Header */}
      <div className="mobile-header sm:hidden">
        <div className="flex justify-between items-center px-4 h-14">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-sm">HC</span>
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Hamro Chautari
            </span>
          </Link>
          
          <div className="flex items-center space-x-1">
            {/* Mobile Search */}
            <Button variant="ghost" size="sm" className="btn-ghost-mobile">
              <Search className="w-5 h-5" />
            </Button>
            
            {/* Mobile Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="btn-ghost-mobile relative">
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 w-4 h-4 text-xs p-0 flex items-center justify-center bg-red-500 hover:bg-red-500">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72 bg-white border shadow-xl z-50">
                <div className="p-3 border-b">
                  <h3 className="font-semibold text-gray-800 text-sm">Notifications</h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 text-sm">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.slice(0, 3).map((notification) => (
                      <DropdownMenuItem 
                        key={notification.id}
                        className="p-3 hover:bg-blue-50 flex items-start space-x-2 border-b cursor-pointer"
                      >
                        <div className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${
                          notification.is_read ? 'bg-gray-300' : 'bg-blue-500'
                        }`}></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{notification.title}</p>
                          <p className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </DropdownMenuItem>
                    ))
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="mobile-nav">
        <div className="flex justify-around items-center py-1">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path} className="flex-1">
              <div
                className={`mobile-nav-item ${
                  location.pathname === item.path ? 'active' : ''
                }`}
              >
                <item.icon className="w-6 h-6 mb-1" />
                <span className="text-xs font-medium leading-none">{item.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
};

export default Navbar;