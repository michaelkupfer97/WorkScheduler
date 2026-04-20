import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Plus, Trash2 } from 'lucide-react';

export default function SettingsPage() {
  const { t, i18n } = useTranslation();
  const { user, updateUser } = useAuth();
  const queryClient = useQueryClient();
  const isManager = user?.role === 'manager' || user?.role === 'admin';

  const { data: org } = useQuery({
    queryKey: ['organization'],
    queryFn: () => api.get('/organizations').then((r) => r.data),
    enabled: !!user?.organizationId,
  });

  const { data: inviteData } = useQuery({
    queryKey: ['inviteCode'],
    queryFn: () => api.get('/organizations/invite-code').then((r) => r.data),
    enabled: isManager && !!user?.organizationId,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t('nav.settings')}</h1>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          {isManager && user?.organizationId && <TabsTrigger value="organization">{t('org.settings')}</TabsTrigger>}
        </TabsList>

        <TabsContent value="profile" className="mt-4">
          <ProfileSettings />
        </TabsContent>

        {isManager && user?.organizationId && (
          <TabsContent value="organization" className="mt-4">
            <OrgSettings org={org} inviteCode={inviteData?.inviteCode} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

function ProfileSettings() {
  const { t, i18n } = useTranslation();
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
  });

  const saveMutation = useMutation({
    mutationFn: () => api.patch('/auth/me', form).then((r) => r.data),
    onSuccess: (data) => updateUser(data),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>{t('auth.firstName')}</Label>
            <Input value={form.firstName} onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>{t('auth.lastName')}</Label>
            <Input value={form.lastName} onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))} />
          </div>
        </div>
        <div className="space-y-2">
          <Label>{t('auth.email')}</Label>
          <Input value={user?.email} disabled />
        </div>
        <div className="space-y-2">
          <Label>Phone</Label>
          <Input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label>Language</Label>
          <Select value={i18n.language} onValueChange={(v) => i18n.changeLanguage(v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="he">עברית</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
          {saveMutation.isPending ? t('common.loading') : t('common.save')}
        </Button>
      </CardContent>
    </Card>
  );
}

function OrgSettings({ org, inviteCode }: { org: any; inviteCode?: string }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [name, setName] = useState(org?.name || '');
  const [shiftTypes, setShiftTypes] = useState(org?.shiftTypes || []);
  const [newType, setNewType] = useState({ name: '', startTime: '08:00', endTime: '16:00', color: '#6366f1' });

  const saveMutation = useMutation({
    mutationFn: () => api.patch('/organizations', { name, shiftTypes }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['organization'] }),
  });

  const addType = () => {
    if (!newType.name) return;
    setShiftTypes([...shiftTypes, { ...newType }]);
    setNewType({ name: '', startTime: '08:00', endTime: '16:00', color: '#6366f1' });
  };

  const removeType = (idx: number) => {
    setShiftTypes(shiftTypes.filter((_: any, i: number) => i !== idx));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('org.settings')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t('org.name')}</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          {inviteCode && (
            <div className="space-y-2">
              <Label>{t('org.inviteCode')}</Label>
              <div className="flex gap-2">
                <Input value={inviteCode} readOnly className="font-mono" />
                <Button variant="outline" size="icon" onClick={() => navigator.clipboard.writeText(inviteCode)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">{t('org.inviteCodeShareHint')}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('org.shiftTypes')}</CardTitle>
          <CardDescription>Configure the types of shifts for your organization.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {shiftTypes.map((st: any, i: number) => (
            <div key={i} className="flex items-center gap-3 p-3 border rounded-md">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: st.color }} />
              <span className="font-medium flex-1">{st.name}</span>
              <span className="text-sm text-muted-foreground">{st.startTime} - {st.endTime}</span>
              <Button variant="ghost" size="icon" onClick={() => removeType(i)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
          <div className="flex flex-wrap items-end gap-2 pt-2 border-t">
            <div>
              <Label>Name</Label>
              <Input className="w-28" value={newType.name} onChange={(e) => setNewType((p) => ({ ...p, name: e.target.value }))} />
            </div>
            <div>
              <Label>Start</Label>
              <Input type="time" className="w-28" value={newType.startTime} onChange={(e) => setNewType((p) => ({ ...p, startTime: e.target.value }))} />
            </div>
            <div>
              <Label>End</Label>
              <Input type="time" className="w-28" value={newType.endTime} onChange={(e) => setNewType((p) => ({ ...p, endTime: e.target.value }))} />
            </div>
            <div>
              <Label>Color</Label>
              <Input type="color" className="w-12 h-10 p-1" value={newType.color} onChange={(e) => setNewType((p) => ({ ...p, color: e.target.value }))} />
            </div>
            <Button variant="outline" className="gap-1" onClick={addType}><Plus className="h-4 w-4" /> Add</Button>
          </div>
          <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="mt-4">
            {saveMutation.isPending ? t('common.loading') : t('common.save')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
