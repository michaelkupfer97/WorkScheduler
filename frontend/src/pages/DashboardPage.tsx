import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, Clock, AlertTriangle } from 'lucide-react';
import { getWeekStart, formatDate } from '@/lib/utils';

export default function DashboardPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const isManager = user?.role === 'manager' || user?.role === 'admin';

  const weekStart = getWeekStart();
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const { data: shifts = [] } = useQuery({
    queryKey: ['shifts', 'week', weekStart.toISOString()],
    queryFn: () =>
      api
        .get('/shifts', {
          params: { start: weekStart.toISOString(), end: weekEnd.toISOString() },
        })
        .then((r) => r.data),
  });

  const { data: myShifts = [] } = useQuery({
    queryKey: ['shifts', 'mine', weekStart.toISOString()],
    queryFn: () =>
      api
        .get('/shifts/mine', {
          params: { start: weekStart.toISOString(), end: weekEnd.toISOString() },
        })
        .then((r) => r.data),
    enabled: !isManager,
  });

  const { data: members = [] } = useQuery({
    queryKey: ['members'],
    queryFn: () => api.get('/organizations/members').then((r) => r.data),
    enabled: isManager,
  });

  const { data: swaps = [] } = useQuery({
    queryKey: ['swaps'],
    queryFn: () => api.get('/swaps').then((r) => r.data),
  });

  const pendingSwaps = swaps.filter((s: any) => s.status === 'pending');
  const displayShifts = isManager ? shifts : myShifts;
  const upcomingShifts = displayShifts
    .filter((s: any) => new Date(s.date) >= new Date())
    .slice(0, 5);

  const totalRequired = shifts.reduce((sum: number, s: any) => sum + s.requiredCount, 0);
  const totalAssigned = shifts.reduce((sum: number, s: any) => sum + (s.assignedEmployees?.length || 0), 0);
  const openPositions = totalRequired - totalAssigned;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('dashboard.welcome')}, {user?.firstName}!</h1>
        <p className="text-muted-foreground mt-1">
          {formatDate(weekStart)} - {formatDate(weekEnd)}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.shiftsThisWeek')}</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{displayShifts.length}</div>
          </CardContent>
        </Card>

        {isManager && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{t('dashboard.totalEmployees')}</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{members.length}</div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.pendingSwaps')}</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingSwaps.length}</div>
          </CardContent>
        </Card>

        {isManager && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{t('dashboard.openPositions')}</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{openPositions > 0 ? openPositions : 0}</div>
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('dashboard.upcomingShifts')}</CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingShifts.length === 0 ? (
            <p className="text-muted-foreground text-sm">{t('schedule.noShifts')}</p>
          ) : (
            <div className="space-y-3">
              {upcomingShifts.map((shift: any) => (
                <div key={shift._id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: shift.color || '#6366f1' }}
                    />
                    <div>
                      <p className="font-medium text-sm">{shift.shiftType}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(shift.date)} &middot; {shift.startTime} - {shift.endTime}
                      </p>
                    </div>
                  </div>
                  <Badge variant={shift.status === 'published' ? 'default' : 'secondary'}>
                    {t(`schedule.${shift.status}`)}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
