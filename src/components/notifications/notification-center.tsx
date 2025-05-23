'use client';

import { useState, useEffect } from 'react';
import { 
  Bell, 
  Check, 
  ChevronRight, 
  Info, 
  Loader2, 
  Mail, 
  MoreHorizontal, 
  Shield, 
  Star, 
  Trash,
  X 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { createClient } from '@/lib/supabase/client';
import { format, formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

// Types
type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'system';
type NotificationStatus = 'unread' | 'read' | 'archived';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  status: NotificationStatus;
  link?: string;
  created_at: string;
  user_id: string;
}

export default function NotificationCenter() {
  const supabase = createClient();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  // Fetch notifications on load and when opened
  useEffect(() => {
    if (open) {
      fetchNotifications();
    }
  }, [open]);

  // Initial fetch for unread count
  useEffect(() => {
    const getUnreadCount = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'unread');
      
      if (count !== null) {
        setUnreadCount(count);
      }
    };

    getUnreadCount();

    // Subscribe to notifications table changes
    const channel = supabase
      .channel('notification_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          setUnreadCount((prev) => prev + 1);
          
          // Show toast for new notification
          toast.info(newNotification.title, {
            description: newNotification.message,
            action: {
              label: 'View',
              onClick: () => setOpen(true),
            },
          });
          
          // If notifications panel is open, refresh the list
          if (open) {
            fetchNotifications();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (data) {
        setNotifications(data as Notification[]);
        const unread = data.filter(n => n.status === 'unread').length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ status: 'read' })
        .eq('id', notificationId);

      if (error) throw error;

      // Update local state
      setNotifications(notifications.map(notification => 
        notification.id === notificationId
          ? { ...notification, status: 'read' }
          : notification
      ));
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('notifications')
        .update({ status: 'read' })
        .eq('user_id', user.id)
        .eq('status', 'unread');

      if (error) throw error;

      // Update local state
      setNotifications(notifications.map(notification => 
        notification.status === 'unread'
          ? { ...notification, status: 'read' }
          : notification
      ));
      
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;

      // Update local state
      const deletedNotification = notifications.find(n => n.id === notificationId);
      setNotifications(notifications.filter(n => n.id !== notificationId));
      
      if (deletedNotification?.status === 'unread') {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
      case 'success':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <Shield className="h-4 w-4 text-amber-500" />;
      case 'error':
        return <X className="h-4 w-4 text-red-500" />;
      case 'system':
        return <Star className="h-4 w-4 text-purple-500" />;
      default:
        return <Mail className="h-4 w-4 text-primary" />;
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[380px] p-0">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Notifications</h3>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                Mark all read
              </Button>
            )}
          </div>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid grid-cols-3 w-full rounded-none">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">
              Unread
              {unreadCount > 0 && (
                <Badge className="ml-1">{unreadCount}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="read">Read</TabsTrigger>
          </TabsList>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* All Notifications */}
              <TabsContent value="all" className="max-h-[400px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="py-6 text-center">
                    <p className="text-sm text-muted-foreground">No notifications</p>
                  </div>
                ) : (
                  <div>
                    {notifications.map((notification) => (
                      <NotificationItem 
                        key={notification.id}
                        notification={notification}
                        onMarkAsRead={markAsRead}
                        onDelete={deleteNotification}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Unread Notifications */}
              <TabsContent value="unread" className="max-h-[400px] overflow-y-auto">
                {notifications.filter(n => n.status === 'unread').length === 0 ? (
                  <div className="py-6 text-center">
                    <p className="text-sm text-muted-foreground">No unread notifications</p>
                  </div>
                ) : (
                  <div>
                    {notifications
                      .filter(n => n.status === 'unread')
                      .map((notification) => (
                        <NotificationItem 
                          key={notification.id}
                          notification={notification}
                          onMarkAsRead={markAsRead}
                          onDelete={deleteNotification}
                        />
                      ))}
                  </div>
                )}
              </TabsContent>

              {/* Read Notifications */}
              <TabsContent value="read" className="max-h-[400px] overflow-y-auto">
                {notifications.filter(n => n.status === 'read').length === 0 ? (
                  <div className="py-6 text-center">
                    <p className="text-sm text-muted-foreground">No read notifications</p>
                  </div>
                ) : (
                  <div>
                    {notifications
                      .filter(n => n.status === 'read')
                      .map((notification) => (
                        <NotificationItem 
                          key={notification.id}
                          notification={notification}
                          onMarkAsRead={markAsRead}
                          onDelete={deleteNotification}
                        />
                      ))}
                  </div>
                )}
              </TabsContent>
            </>
          )}
        </Tabs>
      </PopoverContent>
    </Popover>
  );
}

// NotificationItem component
interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

function NotificationItem({ notification, onMarkAsRead, onDelete }: NotificationItemProps) {
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
      case 'success':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <Shield className="h-4 w-4 text-amber-500" />;
      case 'error':
        return <X className="h-4 w-4 text-red-500" />;
      case 'system':
        return <Star className="h-4 w-4 text-purple-500" />;
      default:
        return <Mail className="h-4 w-4 text-primary" />;
    }
  };

  const createdAtDate = new Date(notification.created_at);
  const timeAgo = formatDistanceToNow(createdAtDate, { addSuffix: true });
  const formattedDate = format(createdAtDate, 'MMM d, yyyy');

  return (
    <div 
      className={`
        p-3 hover:bg-accent
        ${notification.status === 'unread' ? 'bg-primary/5' : ''}
        ${notification.link ? 'cursor-pointer' : ''}
      `}
    >
      <div className="flex items-start gap-3">
        <div className="p-1.5 bg-background border rounded-full">
          {getNotificationIcon(notification.type)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-medium text-sm line-clamp-1">
              {notification.title}
            </h4>
            <div className="flex items-center gap-2">
              {notification.status === 'unread' && (
                <div className="w-2 h-2 rounded-full bg-primary"></div>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {notification.status === 'unread' && (
                    <DropdownMenuItem onClick={() => onMarkAsRead(notification.id)}>
                      <Check className="h-4 w-4 mr-2" />
                      Mark as read
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => onDelete(notification.id)}>
                    <Trash className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground mt-0.5">
            {notification.message}
          </p>
          
          <div className="mt-1 flex items-center justify-between">
            <p className="text-xs text-muted-foreground" title={formattedDate}>
              {timeAgo}
            </p>
            {notification.link && (
              <Button variant="ghost" size="sm" className="h-6 px-2">
                View <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </div>
      <Separator className="mt-3" />
    </div>
  );
} 