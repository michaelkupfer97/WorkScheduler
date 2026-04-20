import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { getWeekStart, cn } from '@/lib/utils';
import type { Preference, ConstraintEntry } from '@shared/types/index';

const PREFERENCE_CYCLE: Preference[] = ['available', 'preferred', 'unavailable'];
const PREFERENCE_COLORS: Record<Preference, string> = {
  available: 'bg-green-100 text-green-800 border-green-300',
  preferred: 'bg-blue-100 text-blue-800 border-blue-300',
  unavailable: 'bg-red-100 text-red-800 border-red-300',
};

export default function AvailabilityPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [weekOffset, setWeekOffset] = useState(1);
  const [entries, setEntries] = useState<ConstraintEntry[]>([]);
  const [dirty, setDirty] = useState(false);

  const weekStart = useMemo(() => {
    const ws = getWeekStart();
    ws.setDate(ws.getDate() + weekOffset * 7);
    return ws;
  }, [weekOffset]);

  const { data: org } = useQuery({
    queryKey: ['organization'],
    queryFn: () => api.get('/organizations').then((r) => r.data),
  });

  const { data: existing } = useQuery({
    queryKey: ['constraints', 'mine', weekStart.toISOString()],
    queryFn: () =>
      api.get('/constraints/mine', { params: { weekStartDate: weekStart.toISOString() } }).then((r) => r.data),
    enabled: !!org,
  });

  useMemo(() => {
    if (existing?.length > 0 && !dirty) {
      setEntries(existing[0].entries);
    }
  }, [existing, dirty]);

  const shiftTypes = org?.shiftTypes || [];

  const toggleCell = (dayOfWeek: number, shiftType: string) => {
    setDirty(true);
    setEntries((prev) => {
      const idx = prev.findIndex((e) => e.dayOfWeek === dayOfWeek && e.shiftType === shiftType);
      if (idx === -1) {
        return [...prev, { dayOfWeek, shiftType, preference: 'available' }];
      }
      const current = prev[idx].preference;
      if (current === 'unavailable') {
        return prev.filter((_, j) => j !== idx);
      }
      const i = PREFERENCE_CYCLE.indexOf(current);
      const next = [...prev];
      next[idx] = { ...next[idx], preference: PREFERENCE_CYCLE[i + 1] };
      return next;
    });
  };

  const getPreference = (dayOfWeek: number, shiftType: string): Preference | null => {
    return entries.find((e) => e.dayOfWeek === dayOfWeek && e.shiftType === shiftType)?.preference || null;
  };

  const submitMutation = useMutation({
    mutationFn: () =>
      api.post('/constraints', {
        weekStartDate: weekStart.toISOString(),
        entries,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['constraints'] });
      setDirty(false);
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t('availability.title')}</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => { setWeekOffset((p) => p - 1); setDirty(false); }}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium px-2">
            {weekStart.toLocaleDateString()}
          </span>
          <Button variant="outline" size="icon" onClick={() => { setWeekOffset((p) => p + 1); setDirty(false); }}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('common.week')} {weekStart.toLocaleDateString()}</CardTitle>
          <CardDescription>{t('availability.instructions')}</CardDescription>
          <p className="text-xs text-muted-foreground mt-1">{t('availability.cycleHint')}</p>
          <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded border bg-muted/40 border-muted-foreground/25" />
              <span className="text-xs">{t('availability.noPreference')}</span>
            </div>
            {PREFERENCE_CYCLE.map((p) => (
              <div key={p} className="flex items-center gap-1.5">
                <div className={cn('w-3 h-3 rounded border', PREFERENCE_COLORS[p])} />
                <span className="text-xs">{t(`availability.${p}`)}</span>
              </div>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-sm">
              <thead>
                <tr>
                  <th className="p-2 text-start">{t('templates.type')}</th>
                  {[0, 1, 2, 3, 4, 5, 6].map((d) => (
                    <th key={d} className="p-2 text-center">{t(`days.${d}`)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {shiftTypes.map((st: any) => (
                  <tr key={st.name}>
                    <td className="p-2 font-medium">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: st.color }} />
                        {st.name}
                      </div>
                    </td>
                    {[0, 1, 2, 3, 4, 5, 6].map((d) => {
                      const pref = getPreference(d, st.name);
                      return (
                        <td key={d} className="p-1 text-center">
                          <button
                            onClick={() => toggleCell(d, st.name)}
                            className={cn(
                              'w-full h-10 rounded-md border-2 transition-colors text-xs font-medium',
                              pref ? PREFERENCE_COLORS[pref] : 'bg-muted/30 border-transparent hover:border-muted-foreground/20'
                            )}
                          >
                            {pref ? t(`availability.${pref}`).charAt(0).toUpperCase() : '-'}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end mt-6">
            <Button
              onClick={() => submitMutation.mutate()}
              disabled={submitMutation.isPending || !dirty}
              className="gap-2"
            >
              <Check className="h-4 w-4" />
              {submitMutation.isPending ? t('common.loading') : t('availability.submit')}
            </Button>
          </div>

          {existing?.length > 0 && !dirty && (
            <Badge variant="success" className="mt-2">
              {t('availability.submitted')} {new Date(existing[0].submittedAt).toLocaleString()}
            </Badge>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
