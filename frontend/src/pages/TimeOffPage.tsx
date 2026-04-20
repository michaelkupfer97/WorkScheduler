import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { CalendarOff, Plus, Check, X } from 'lucide-react';

export default function TimeOffPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isManager = user?.role === 'manager' || user?.role === 'admin';
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ startDate: '', endDate: '', reason: '' });

  const { data: myRequests = [] } = useQuery({
    queryKey: ['timeoff', 'mine'],
    queryFn: () => api.get('/time-off/mine').then((r) => r.data),
  });

  const { data: orgRequests = [] } = useQuery({
    queryKey: ['timeoff', 'org'],
    queryFn: () => api.get('/time-off').then((r) => r.data),
    enabled: isManager,
  });

  const createMutation = useMutation({
    mutationFn: () => api.post('/time-off', form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeoff'] });
      setDialogOpen(false);
      setForm({ startDate: '', endDate: '', reason: '' });
    },
  });

  const handleMutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: string }) =>
      api.patch(`/time-off/${id}`, { action }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['timeoff'] }),
  });

  const statusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'success' as const;
      case 'rejected': return 'destructive' as const;
      default: return 'warning' as const;
    }
  };

  const requests = isManager ? orgRequests : myRequests;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t('timeOff.title')}</h1>
        {!isManager && (
          <Button onClick={() => setDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            {t('timeOff.request')}
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {requests.length === 0 && <p className="text-muted-foreground">{t('common.noData')}</p>}
        {requests.map((req: any) => (
          <Card key={req._id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <CalendarOff className="h-5 w-5 text-muted-foreground" />
                  <div>
                    {isManager && req.userId && (
                      <p className="font-medium text-sm">{req.userId.firstName} {req.userId.lastName}</p>
                    )}
                    <p className="text-sm">
                      {new Date(req.startDate).toLocaleDateString()} - {new Date(req.endDate).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{req.reason}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isManager && req.status === 'pending' ? (
                    <>
                      <Button size="sm" className="gap-1" onClick={() => handleMutation.mutate({ id: req._id, action: 'approve' })}>
                        <Check className="h-3 w-3" /> {t('timeOff.approve')}
                      </Button>
                      <Button size="sm" variant="destructive" className="gap-1" onClick={() => handleMutation.mutate({ id: req._id, action: 'reject' })}>
                        <X className="h-3 w-3" /> {t('timeOff.reject')}
                      </Button>
                    </>
                  ) : (
                    <Badge variant={statusColor(req.status)}>{t(`swaps.${req.status}`)}</Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('timeOff.request')}</DialogTitle>
            <DialogDescription>Submit a request for time off.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('timeOff.startDate')}</Label>
                <Input type="date" value={form.startDate} onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>{t('timeOff.endDate')}</Label>
                <Input type="date" value={form.endDate} onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t('timeOff.reason')}</Label>
              <Input value={form.reason} onChange={(e) => setForm((p) => ({ ...p, reason: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>{t('common.cancel')}</Button>
            <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>{t('common.save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
