import React from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Bell, 
  Heart, 
  MessageCircle, 
  UserPlus, 
  Mail, 
  AtSign,
  Check,
  CheckCheck,
  Trash2,
  ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const Notifications = () => {
  const { notifications, loading, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="w-5 h-5 text-red-500" />;
      case 'comment':
        return <MessageCircle className="w-5 h-5 text-blue-500" />;
      case 'follow':
        return <UserPlus className="w-5 h-5 text-green-500" />;
      case 'message':
        return <Mail className="w-5 h-5 text-purple-500" />;
      case 'mention':
        return <AtSign className="w-5 h-5 text-orange-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'like':
        return 'bg-red-50 border-red-100';
      case 'comment':
        return 'bg-blue-50 border-blue-100';
      case 'follow':
        return 'bg-green-50 border-green-100';
      case 'message':
        return 'bg-purple-50 border-purple-100';
      case 'mention':
        return 'bg-orange-50 border-orange-100';
      default:
        return 'bg-gray-50 border-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Link to="/">
                <Button variant="ghost" size="sm" className="rounded-xl">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
                <p className="text-gray-600 mt-1">
                  {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
                </p>
              </div>
            </div>
            
            {unreadCount > 0 && (
              <Button 
                onClick={markAllAsRead}
                variant="outline"
                className="rounded-xl border-blue-200 hover:bg-blue-50 text-blue-600"
              >
                <CheckCheck className="w-4 h-4 mr-2" />
                Mark all read
              </Button>
            )}
          </div>
        </div>

        {/* Notifications */}
        <div className="space-y-3">
          {notifications.length === 0 ? (
            <Card className="p-8 text-center bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No notifications yet</h3>
              <p className="text-gray-500">We'll let you know when something happens!</p>
            </Card>
          ) : (
            notifications.map((notification) => (
              <Card 
                key={notification.id} 
                className={`transition-all duration-200 hover:shadow-lg border ${
                  notification.is_read 
                    ? 'bg-white/60 border-gray-100' 
                    : `bg-white/90 ${getNotificationColor(notification.type)} shadow-md`
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-4">
                    {/* Icon */}
                    <div className={`p-2 rounded-xl ${getNotificationColor(notification.type)}`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className={`font-semibold ${notification.is_read ? 'text-gray-700' : 'text-gray-900'}`}>
                            {notification.title}
                          </h4>
                          <p className={`text-sm mt-1 ${notification.is_read ? 'text-gray-500' : 'text-gray-700'}`}>
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-2">
                            {format(new Date(notification.created_at), 'PPp')}
                          </p>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex items-center space-x-2 ml-4">
                          {!notification.is_read && (
                            <Button
                              onClick={() => markAsRead(notification.id)}
                              variant="ghost"
                              size="sm"
                              className="rounded-lg hover:bg-blue-50 text-blue-600"
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            onClick={() => deleteNotification(notification.id)}
                            variant="ghost"
                            size="sm"
                            className="rounded-lg hover:bg-red-50 text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Unread indicator */}
                    {!notification.is_read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;