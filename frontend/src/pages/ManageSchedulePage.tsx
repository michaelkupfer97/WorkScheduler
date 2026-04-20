import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight, ClipboardList, Wand2, Send, Plus, Trash2 } from 'lucide-react';
import { getWeekStart, getWeekDates, cn } from '@/lib/utils';

export default function ManageSchedulePage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isManager = user?.role === 'manager' || user?.role === 'admin';
  const [weekOffset, setWeekOffset] = useState(1);
  const [conflicts, setConflicts] = useState<any[]>([]);
  const [addShiftOpen, setAddShiftOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [newShift, setNewShift] = useState({ shiftType: '', startTime: '', endTime: '', requiredCount: 1 });

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

  const { data: shifts = [], refetch: refetchShifts } = useQuery({
    queryKey: ['shifts', weekStart.toISOString()],
    queryFn: () =>
      api.get('/shifts', { params: { start: weekStart.toISOString(), end: weekEnd.toISOString() } }).then((r) => r.data),
  });

  const { data: org } = useQuery({
    queryKey: ['organization'],
    queryFn: () => api.get('/organizations').then((r) => r.data),
  });

  const { data: templates = [] } = useQuery({
    queryKey: ['templates'],
    queryFn: () => api.get('/shifts/templates').then((r) => r.data),
  });

  const { data: constraints = [] } = useQuery({
    queryKey: ['constraints', 'org', weekStart.toISOString()],
    queryFn: () =>
      api.get('/constraints', { params: { weekStartDate: weekStart.toISOString() } }).then((r) => r.data),
  });

  const shiftTypes = org?.shiftTypes || [];

  const autoGenerate = useMutation({
    mutationFn: () => api.post('/shifts/auto-generate', { weekStartDate: weekStart.toISOString() }),
    onSuccess: (res) => {
      setConflicts(res.data.conflicts || []);
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
    },
  });

  const publishWeek = useMutation({
    mutationFn: () => api.post('/shifts/publish', { weekStartDate: weekStart.toISOString() }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
    },
  });

  const deleteShift = useMutation({
    mutationFn: (id: string) => api.delete(`/shifts/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['shifts'] }),
  });

  const addShift = useMutation({
    mutationFn: () => api.post('/shifts', { ...newShift, date: selectedDate }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
      setAddShiftOpen(false);
    },
  });

  const draftCount = shifts.filter((s: any) => s.status === 'draft').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{t('nav.manageSchedule')}</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-xl">{t('schedule.manageBlurb')}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setWeekOffset((p) => p - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">{weekStart.toLocaleDateString()}</span>
          <Button variant="outline" size="icon" onClick={() => setWeekOffset((p) => p + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <Button onClick={() => autoGenerate.mutate()} disabled={autoGenerate.isPending} className="gap-2">
          <Wand2 className="h-4 w-4" />
          {autoGenerate.isPending ? t('common.loading') : t('schedule.generate')}
        </Button>
        {draftCount > 0 && (
          <Button onClick={() => publishWeek.mutate()} disabled={publishWeek.isPending} variant="default" className="gap-2">
            <Send className="h-4 w-4" />
            {publishWeek.isPending ? t('common.loading') : `${t('schedule.publish')} (${draftCount})`}
          </Button>
        )}
        {isManager && (
          <Button variant="outline" asChild className="gap-2">
            <Link to="/availability">
              <ClipboardList className="h-4 w-4" />
              {t('schedule.myAvailability')}
            </Link>
          </Button>
        )}
      </div>

      {conflicts.length > 0 && (
        <Card className="border-yellow-300 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-800">{t('schedule.conflicts')} ({conflicts.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {conflicts.map((c: any, i: number) => (
              <div key={i} className="flex items-start gap-2 text-sm text-yellow-800">
                <Badge variant="warning" className="text-xs">{c.type}</Badge>
                <span>{c.message} — {c.date} ({c.shiftType})</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="schedule">
        <TabsList>
          <TabsTrigger value="schedule">{t('schedule.weeklyView')}</TabsTrigger>
          <TabsTrigger value="templates">{t('templates.title')}</TabsTrigger>
          <TabsTrigger value="constraints">
            {t('schedule.teamSubmissions')} ({constraints.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="schedule" className="mt-4">
          <div className="overflow-x-auto">
            <div className="min-w-[700px]">
              <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDates.map((date, i) => (
                  <div key={i} className="text-center p-2 text-sm font-medium">
                    <div>{date.toLocaleDateString(undefined, { weekday: 'short' })}</div>
                    <div className="text-xs text-muted-foreground">{date.getDate()}/{date.getMonth() + 1}</div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-1 h-6 text-xs"
                      onClick={() => {
                        setSelectedDate(date.toISOString().split('T')[0]);
                        setAddShiftOpen(true);
                      }}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>

              {shiftTypes.map((st: any) => (
                <div key={st.name} className="mb-2">
                  <div className="text-xs font-semibold text-muted-foreground mb-1 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: st.color }} />
                    {st.name}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {weekDates.map((date, i) => {
                      const dateStr = date.toISOString().split('T')[0];
                      const dayShifts = shifts.filter(
                        (s: any) => new Date(s.date).toISOString().split('T')[0] === dateStr && s.shiftType === st.name
                      );
                      const shift = dayShifts[0];

                      return (
                        <div key={i} className={cn('border rounded-md p-2 min-h-[70px] text-xs', shift ? 'bg-card' : 'bg-muted/20')}
                          style={shift ? { borderLeftColor: st.color, borderLeftWidth: 3 } : undefined}
                        >
                          {shift ? (
                            <div>
                              <div className="flex items-center justify-between">
                                <Badge variant={shift.status === 'published' ? 'default' : 'secondary'} className="text-[10px] px-1">
                                  {shift.assignedEmployees?.length || 0}/{shift.requiredCount}
                                </Badge>
                                <button
                                  onClick={() => deleteShift.mutate(shift._id)}
                                  className="text-destructive hover:text-destructive/80 p-0.5"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                              {shift.assignedEmployees?.map((emp: any) => (
                                <div key={emp._id || emp} className="truncate text-muted-foreground mt-0.5">
                                  {emp.firstName || '...'}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="mt-4">
          <TemplatesManager templates={templates} shiftTypes={shiftTypes} />
        </TabsContent>

        <TabsContent value="constraints" className="mt-4">
          <ConstraintsViewer constraints={constraints} shiftTypes={shiftTypes} />
        </TabsContent>
      </Tabs>

      <Dialog open={addShiftOpen} onOpenChange={setAddShiftOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('schedule.addShift')}</DialogTitle>
            <DialogDescription>{selectedDate}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t('schedule.shiftType')}</Label>
              <Select value={newShift.shiftType} onValueChange={(v) => {
                const st = shiftTypes.find((s: any) => s.name === v);
                setNewShift((p) => ({ ...p, shiftType: v, startTime: st?.startTime || '', endTime: st?.endTime || '' }));
              }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {shiftTypes.map((st: any) => (
                    <SelectItem key={st.name} value={st.name}>{st.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('schedule.startTime')}</Label>
                <Input type="time" value={newShift.startTime} onChange={(e) => setNewShift((p) => ({ ...p, startTime: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>{t('schedule.endTime')}</Label>
                <Input type="time" value={newShift.endTime} onChange={(e) => setNewShift((p) => ({ ...p, endTime: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t('schedule.required')}</Label>
              <Input type="number" min={1} value={newShift.requiredCount} onChange={(e) => setNewShift((p) => ({ ...p, requiredCount: parseInt(e.target.value) || 1 }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddShiftOpen(false)}>{t('common.cancel')}</Button>
            <Button onClick={() => addShift.mutate()} disabled={addShift.isPending}>{t('common.save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TemplatesManager({ templates, shiftTypes }: { templates: any[]; shiftTypes: any[] }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ dayOfWeek: 0, shiftType: '', requiredCount: 1 });

  const upsert = useMutation({
    mutationFn: () => api.post('/shifts/templates', form),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['templates'] }),
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/shifts/templates/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['templates'] }),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('templates.title')}</CardTitle>
        <CardDescription>Define recurring shift requirements for each day.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2 items-end">
          <div>
            <Label>{t('templates.day')}</Label>
            <Select value={String(form.dayOfWeek)} onValueChange={(v) => setForm((p) => ({ ...p, dayOfWeek: parseInt(v) }))}>
              <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
              <SelectContent>
                {[0, 1, 2, 3, 4, 5, 6].map((d) => (
                  <SelectItem key={d} value={String(d)}>{t(`days.${d}`)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>{t('templates.type')}</Label>
            <Select value={form.shiftType} onValueChange={(v) => setForm((p) => ({ ...p, shiftType: v }))}>
              <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
              <SelectContent>
                {shiftTypes.map((st: any) => (
                  <SelectItem key={st.name} value={st.name}>{st.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>{t('templates.count')}</Label>
            <Input type="number" min={1} className="w-20" value={form.requiredCount}
              onChange={(e) => setForm((p) => ({ ...p, requiredCount: parseInt(e.target.value) || 1 }))} />
          </div>
          <Button onClick={() => upsert.mutate()} disabled={!form.shiftType}>{t('templates.save')}</Button>
        </div>

        <div className="space-y-2">
          {templates.map((tmpl: any) => (
            <div key={tmpl._id} className="flex items-center justify-between p-3 border rounded-md">
              <div className="flex items-center gap-3">
                <Badge variant="outline">{t(`days.${tmpl.dayOfWeek}`)}</Badge>
                <span className="font-medium">{tmpl.shiftType}</span>
                <span className="text-muted-foreground">x{tmpl.requiredCount}</span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => remove.mutate(tmpl._id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
          {templates.length === 0 && <p className="text-muted-foreground text-sm">{t('common.noData')}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

function ConstraintsViewer({ constraints, shiftTypes }: { constraints: any[]; shiftTypes: any[] }) {
  const { t } = useTranslation();

  return (
    <div className="space-y-3">
      {constraints.map((c: any) => (
        <Card key={c._id}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">
                {c.userId?.firstName} {c.userId?.lastName}
              </span>
              <span className="text-xs text-muted-foreground">
                {new Date(c.submittedAt).toLocaleString()}
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              {c.entries?.map((e: any, i: number) => (
                <Badge
                  key={i}
                  variant={e.preference === 'preferred' ? 'default' : e.preference === 'unavailable' ? 'destructive' : 'secondary'}
                  className="text-xs"
                >
                  {t(`days.${e.dayOfWeek}`)} - {e.shiftType}: {t(`availability.${e.preference}`)}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
      {constraints.length === 0 && <p className="text-muted-foreground">{t('common.noData')}</p>}
    </div>
  );
}
