import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeftRight, Check, X } from 'lucide-react';

export default function SwapsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isManager = user?.role === 'manager' || user?.role === 'admin';

  const { data: swaps = [] } = useQuery({
    queryKey: ['swaps'],
    queryFn: () => api.get('/swaps').then((r) => r.data),
  });

  const { data: orgSwaps = [] } = useQuery({
    queryKey: ['swaps', 'org'],
    queryFn: () => api.get('/swaps/org').then((r) => r.data),
    enabled: isManager,
  });

  const respondMutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: string }) =>
      api.patch(`/swaps/${id}/respond`, { action }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['swaps'] }),
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: string }) =>
      api.patch(`/swaps/${id}/approve`, { action }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['swaps'] }),
  });

  const incoming = swaps.filter((s: any) => s.targetEmployeeId?._id === user?._id && s.status === 'pending');
  const myRequests = swaps.filter((s: any) => s.requesterId?._id === user?._id);

  const statusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'success' as const;
      case 'rejected': return 'destructive' as const;
      default: return 'warning' as const;
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t('swaps.title')}</h1>

      <Tabs defaultValue="incoming">
        <TabsList>
          <TabsTrigger value="incoming">
            {t('swaps.incomingRequests')} {incoming.length > 0 && `(${incoming.length})`}
          </TabsTrigger>
          <TabsTrigger value="my">{t('swaps.myRequests')}</TabsTrigger>
          {isManager && <TabsTrigger value="manage">Manager View</TabsTrigger>}
        </TabsList>

        <TabsContent value="incoming" className="mt-4 space-y-3">
          {incoming.length === 0 && <p className="text-muted-foreground">{t('common.noData')}</p>}
          {incoming.map((swap: any) => (
            <SwapCard key={swap._id} swap={swap} userId={user?._id}>
              <div className="flex gap-2">
                <Button size="sm" variant="default" className="gap-1"
                  onClick={() => respondMutation.mutate({ id: swap._id, action: 'accept' })}>
                  <Check className="h-3 w-3" /> {t('swaps.accept')}
                </Button>
                <Button size="sm" variant="destructive" className="gap-1"
                  onClick={() => respondMutation.mutate({ id: swap._id, action: 'reject' })}>
                  <X className="h-3 w-3" /> {t('swaps.reject')}
                </Button>
              </div>
            </SwapCard>
          ))}
        </TabsContent>

        <TabsContent value="my" className="mt-4 space-y-3">
          {myRequests.length === 0 && <p className="text-muted-foreground">{t('common.noData')}</p>}
          {myRequests.map((swap: any) => (
            <SwapCard key={swap._id} swap={swap} userId={user?._id}>
              <Badge variant={statusColor(swap.status)}>{t(`swaps.${swap.status}`)}</Badge>
            </SwapCard>
          ))}
        </TabsContent>

        {isManager && (
          <TabsContent value="manage" className="mt-4 space-y-3">
            {orgSwaps.filter((s: any) => s.status === 'pending').length === 0 && (
              <p className="text-muted-foreground">{t('common.noData')}</p>
            )}
            {orgSwaps
              .filter((s: any) => s.status === 'pending')
              .map((swap: any) => (
                <SwapCard key={swap._id} swap={swap} userId={user?._id}>
                  <div className="flex gap-2">
                    <Button size="sm" className="gap-1"
                      onClick={() => approveMutation.mutate({ id: swap._id, action: 'approve' })}>
                      <Check className="h-3 w-3" /> {t('swaps.approve')}
                    </Button>
                    <Button size="sm" variant="destructive" className="gap-1"
                      onClick={() => approveMutation.mutate({ id: swap._id, action: 'reject' })}>
                      <X className="h-3 w-3" /> {t('swaps.reject')}
                    </Button>
                  </div>
                </SwapCard>
              ))}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

function SwapCard({ swap, userId, children }: { swap: any; userId?: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <ArrowLeftRight className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium text-sm">
                {swap.requesterId?.firstName} {swap.requesterId?.lastName}
                {' <-> '}
                {swap.targetEmployeeId?.firstName} {swap.targetEmployeeId?.lastName}
              </p>
              <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                <p>
                  Shift 1: {swap.originalShiftId?.shiftType} - {swap.originalShiftId?.date && new Date(swap.originalShiftId.date).toLocaleDateString()}
                </p>
                <p>
                  Shift 2: {swap.targetShiftId?.shiftType} - {swap.targetShiftId?.date && new Date(swap.targetShiftId.date).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
          {children}
        </div>
      </CardContent>
    </Card>
  );
}
