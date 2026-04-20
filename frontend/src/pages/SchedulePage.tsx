import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getWeekStart, getWeekDates, cn } from '@/lib/utils';

export default function SchedulePage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const isManager = user?.role === 'manager' || user?.role === 'admin';
  const [weekOffset, setWeekOffset] = useState(0);

  const weekStart = useMemo(() => {
    const ws = getWeekStart();
    ws.setDate(ws.getDate() + weekOffset * 7);
    return ws;
  }, [weekOffset]);

  const weekEnd = useMemo(() => {
    const we = new Date(weekStart);
    we.setDate(we.getDate() + 6);
    return we;
  }, [weekStart]);

  const weekDates = useMemo(() => getWeekDates(weekStart), [weekStart]);

  const { data: shifts = [] } = useQuery({
    queryKey: ['shifts', weekStart.toISOString()],
    queryFn: () =>
      api.get('/shifts', {
        params: { start: weekStart.toISOString(), end: weekEnd.toISOString() },
      }).then((r) => r.data),
  });

  const { data: org } = useQuery({
    queryKey: ['organization'],
    queryFn: () => api.get('/organizations').then((r) => r.data),
  });

  const shiftTypes = org?.shiftTypes || [];
  const locale = i18n.language === 'he' ? 'he-IL' : 'en-US';

  const shiftsByDateAndType = useMemo(() => {
    const map = new Map<string, any[]>();
    for (const shift of shifts) {
      const dateStr = new Date(shift.date).toISOString().split('T')[0];
      const key = `${dateStr}-${shift.shiftType}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(shift);
    }
    return map;
  }, [shifts]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t('schedule.weeklyView')}</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setWeekOffset((p) => p - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setWeekOffset(0)}>
            {t('common.today')}
          </Button>
          <Button variant="outline" size="icon" onClick={() => setWeekOffset((p) => p + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="weekly">
        <TabsList>
          <TabsTrigger value="weekly">{t('schedule.weeklyView')}</TabsTrigger>
          <TabsTrigger value="my">{t('schedule.mySchedule')}</TabsTrigger>
          {isManager && <TabsTrigger value="team">{t('schedule.teamView')}</TabsTrigger>}
        </TabsList>

        <TabsContent value="weekly" className="mt-4">
          <div className="overflow-x-auto">
            <div className="min-w-[700px]">
              {/* Week header */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDates.map((date, i) => {
                  const isToday = date.toDateString() === new Date().toDateString();
                  return (
                    <div
                      key={i}
                      className={cn(
                        'text-center p-2 rounded-md text-sm font-medium',
                        isToday && 'bg-primary text-primary-foreground'
                      )}
                    >
                      <div>{date.toLocaleDateString(locale, { weekday: 'short' })}</div>
                      <div className="text-xs opacity-75">{date.getDate()}/{date.getMonth() + 1}</div>
                    </div>
                  );
                })}
              </div>

              {/* Shift type rows */}
              {shiftTypes.map((st: any) => (
                <div key={st.name} className="mb-2">
                  <div className="text-xs font-semibold text-muted-foreground mb-1 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: st.color }} />
                    {st.name} ({st.startTime} - {st.endTime})
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {weekDates.map((date, i) => {
                      const dateStr = date.toISOString().split('T')[0];
                      const key = `${dateStr}-${st.name}`;
                      const cellShifts = shiftsByDateAndType.get(key) || [];
                      const shift = cellShifts[0];

                      return (
                        <div
                          key={i}
                          className={cn(
                            'border rounded-md p-2 min-h-[60px] text-xs',
                            shift ? 'bg-card' : 'bg-muted/30'
                          )}
                          style={shift ? { borderLeftColor: st.color, borderLeftWidth: 3 } : undefined}
                        >
                          {shift ? (
                            <>
                              <div className="flex items-center justify-between mb-1">
                                <Badge
                                  variant={
                                    shift.status === 'published' ? 'default' :
                                    shift.status === 'completed' ? 'success' as any : 'secondary'
                                  }
                                  className="text-[10px] px-1 py-0"
                                >
                                  {shift.assignedEmployees?.length || 0}/{shift.requiredCount}
                                </Badge>
                              </div>
                              <div className="space-y-0.5">
                                {shift.assignedEmployees?.slice(0, 3).map((emp: any) => (
                                  <div key={emp._id || emp} className="truncate text-muted-foreground">
                                    {emp.firstName ? `${emp.firstName} ${emp.lastName?.charAt(0)}.` : '...'}
                                  </div>
                                ))}
                                {(shift.assignedEmployees?.length || 0) > 3 && (
                                  <div className="text-muted-foreground">+{shift.assignedEmployees.length - 3}</div>
                                )}
                              </div>
                            </>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              {shiftTypes.length === 0 && (
                <p className="text-center text-muted-foreground py-12">{t('schedule.noShifts')}</p>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="my" className="mt-4">
          <MyScheduleView shifts={shifts} userId={user?._id} />
        </TabsContent>

        {isManager && (
          <TabsContent value="team" className="mt-4">
            <TeamView shifts={shifts} weekDates={weekDates} locale={locale} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

function MyScheduleView({ shifts, userId }: { shifts: any[]; userId?: string }) {
  const { t } = useTranslation();
  const myShifts = shifts.filter((s: any) =>
    s.assignedEmployees?.some((e: any) => (e._id || e) === userId)
  );

  if (myShifts.length === 0) {
    return <p className="text-center text-muted-foreground py-12">{t('schedule.noShifts')}</p>;
  }

  return (
    <div className="space-y-2">
      {myShifts.map((shift: any) => (
        <Card key={shift._id}>
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: shift.color || '#6366f1' }} />
              <div>
                <p className="font-medium">{shift.shiftType}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(shift.date).toLocaleDateString()} &middot; {shift.startTime} - {shift.endTime}
                </p>
              </div>
            </div>
            <Badge>{t(`schedule.${shift.status}`)}</Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function TeamView({ shifts, weekDates, locale }: { shifts: any[]; weekDates: Date[]; locale: string }) {
  const { t } = useTranslation();
  const employees = useMemo(() => {
    const map = new Map<string, { firstName: string; lastName: string }>();
    for (const shift of shifts) {
      for (const emp of shift.assignedEmployees || []) {
        if (emp._id && !map.has(emp._id)) {
          map.set(emp._id, { firstName: emp.firstName, lastName: emp.lastName });
        }
      }
    }
    return Array.from(map.entries());
  }, [shifts]);

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[700px] text-sm">
        <thead>
          <tr>
            <th className="text-start p-2 border-b font-medium">{t('schedule.employees')}</th>
            {weekDates.map((d, i) => (
              <th key={i} className="text-center p-2 border-b font-medium">
                {d.toLocaleDateString(locale, { weekday: 'short', day: 'numeric' })}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {employees.map(([empId, emp]) => (
            <tr key={empId}>
              <td className="p-2 border-b font-medium">{emp.firstName} {emp.lastName}</td>
              {weekDates.map((date, i) => {
                const dateStr = date.toISOString().split('T')[0];
                const empShifts = shifts.filter(
                  (s: any) =>
                    new Date(s.date).toISOString().split('T')[0] === dateStr &&
                    s.assignedEmployees?.some((e: any) => (e._id || e) === empId)
                );
                return (
                  <td key={i} className="text-center p-2 border-b">
                    {empShifts.map((s: any) => (
                      <Badge
                        key={s._id}
                        className="text-[10px]"
                        style={{ backgroundColor: s.color || '#6366f1', color: '#fff' }}
                      >
                        {s.shiftType}
                      </Badge>
                    ))}
                  </td>
                );
              })}
            </tr>
          ))}
          {employees.length === 0 && (
            <tr>
              <td colSpan={8} className="text-center p-8 text-muted-foreground">{t('common.noData')}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
