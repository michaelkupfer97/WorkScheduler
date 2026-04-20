import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, LogOut, UserPlus } from 'lucide-react';

export default function OrganizationSetupPage() {
  const { t } = useTranslation();
  const { updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [orgName, setOrgName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/organizations', { name: orgName });
      const me = await api.get('/auth/me');
      updateUser(me.data);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/organizations/join', { inviteCode });
      const me = await api.get('/auth/me');
      updateUser(me.data);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>{t('org.noOrg')}</CardTitle>
          <CardDescription>{t('org.createOrJoin')}</CardDescription>
          <p className="text-xs text-muted-foreground pt-2 text-pretty">{t('org.setupExistingUserHint')}</p>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md mb-4">{error}</div>
          )}
          <Tabs defaultValue="create">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="create" className="gap-2">
                <Building2 className="h-4 w-4" />
                {t('org.create')}
              </TabsTrigger>
              <TabsTrigger value="join" className="gap-2">
                <UserPlus className="h-4 w-4" />
                {t('org.join')}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="create">
              <form onSubmit={handleCreate} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>{t('org.name')}</Label>
                  <Input value={orgName} onChange={(e) => setOrgName(e.target.value)} required placeholder="My Company" />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? t('common.loading') : t('org.create')}
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="join">
              <p className="text-sm text-muted-foreground leading-relaxed pt-4">{t('org.inviteCodeHelp')}</p>
              <form onSubmit={handleJoin} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>{t('org.inviteCode')}</Label>
                  <Input value={inviteCode} onChange={(e) => setInviteCode(e.target.value)} required placeholder="abc123def456" />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? t('common.loading') : t('org.join')}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          <div className="mt-6 border-t pt-4 space-y-2">
            <p className="text-xs text-muted-foreground text-center">{t('org.setupFooterHint')}</p>
            <Button type="button" variant="outline" className="w-full gap-2" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
              {t('org.signOutToLogin')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
