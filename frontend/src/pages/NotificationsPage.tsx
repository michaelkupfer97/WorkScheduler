import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, CheckCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function NotificationsPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get('/notifications').then((r) => r.data),
  });

  const markRead = useMutation({
    mutationFn: (id: string) => api.patch(`/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllRead = useMutation({
    mutationFn: () => api.patch('/notifications/read-all'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const unread = notifications.filter((n: any) => !n.read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t('nav.notifications')}</h1>
        {unread > 0 && (
          <Button variant="outline" size="sm" className="gap-2" onClick={() => markAllRead.mutate()}>
            <CheckCheck className="h-4 w-4" />
            Mark all read ({unread})
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {notifications.length === 0 && <p className="text-muted-foreground">{t('common.noData')}</p>}
        {notifications.map((notif: any) => (
          <Card
            key={notif._id}
            className={cn('cursor-pointer transition-colors hover:bg-accent/50', !notif.read && 'border-primary/30 bg-primary/5')}
            onClick={() => {
              if (!notif.read) markRead.mutate(notif._id);
              if (notif.link) navigate(notif.link);
            }}
          >
            <CardContent className="p-4 flex items-start gap-3">
              <Bell className={cn('h-5 w-5 mt-0.5', !notif.read ? 'text-primary' : 'text-muted-foreground')} />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className={cn('font-medium text-sm', !notif.read && 'font-semibold')}>{notif.title}</p>
                  <span className="text-xs text-muted-foreground">{new Date(notif.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">{notif.message}</p>
              </div>
              {!notif.read && <div className="w-2 h-2 rounded-full bg-primary mt-2" />}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
