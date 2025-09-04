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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Navbar = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/messages', icon: MessageCircle, label: 'Messages' },
    { path: '/friends', icon: Users, label: 'Friends' },
    { path: '/stories', icon: Camera, label: 'Stories' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-card border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">HC</span>
            </div>
            <span className="font-bold text-lg text-primary">Hamro Chautari</span>
          </Link>

          {/* Search bar */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder="Search friends, posts, stories..."
                className="w-full pl-10 pr-4 py-2 bg-muted rounded-full border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          {/* Navigation items */}
          <div className="flex items-center space-x-1">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={location.pathname === item.path ? "default" : "ghost"}
                  size="sm"
                  className="hidden sm:flex items-center space-x-2"
                >
                  <item.icon className="w-4 h-4" />
                  <span className="hidden lg:inline">{item.label}</span>
                </Button>
              </Link>
            ))}

            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="w-4 h-4" />
              <Badge variant="destructive" className="absolute -top-1 -right-1 w-5 h-5 text-xs p-0 flex items-center justify-center">
                3
              </Badge>
            </Button>

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" alt="User" />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {user?.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
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
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border">
        <div className="flex justify-around items-center py-2">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path}>
              <Button
                variant={location.pathname === item.path ? "default" : "ghost"}
                size="sm"
                className="flex flex-col items-center space-y-1 h-auto py-2"
              >
                <item.icon className="w-4 h-4" />
                <span className="text-xs">{item.label}</span>
              </Button>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;