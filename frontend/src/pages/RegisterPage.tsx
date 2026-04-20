import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, UserPlus } from 'lucide-react';

export default function RegisterPage() {
  const { t, i18n } = useTranslation();
  const { registerCreateOrg, registerJoinOrg } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [account, setAccount] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });
  const [orgName, setOrgName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const locale = i18n.language as 'en' | 'he';

  const updateAccount = (field: string, value: string) => setAccount((p) => ({ ...p, [field]: value }));

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setStep(2);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await registerCreateOrg({
        ...account,
        locale,
        name: orgName,
        timezone: 'Asia/Jerusalem',
        weekStartsOn: 0,
      });
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string } } };
      setError(ax.response?.data?.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await registerJoinOrg({
        ...account,
        locale,
        inviteCode: inviteCode.trim(),
      });
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string } } };
      setError(ax.response?.data?.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('auth.register')}</CardTitle>
        <CardDescription>
          {step === 1 ? t('auth.stepAccount') : t('auth.stepOrganization')}
        </CardDescription>
        <p className="text-xs text-muted-foreground pt-1">{t('auth.registerNoOrphanHint')}</p>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md mb-4">{error}</div>
        )}

        {step === 1 ? (
          <form onSubmit={handleStep1} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">{t('auth.firstName')}</Label>
                <Input
                  id="firstName"
                  value={account.firstName}
                  onChange={(e) => updateAccount('firstName', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">{t('auth.lastName')}</Label>
                <Input
                  id="lastName"
                  value={account.lastName}
                  onChange={(e) => updateAccount('lastName', e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t('auth.email')}</Label>
              <Input
                id="email"
                type="email"
                value={account.email}
                onChange={(e) => updateAccount('email', e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t('auth.password')}</Label>
              <Input
                id="password"
                type="password"
                value={account.password}
                onChange={(e) => updateAccount('password', e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>
            <Button type="submit" className="w-full">
              {t('auth.continue')}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              {t('auth.haveAccount')}{' '}
              <Link to="/login" className="text-primary hover:underline font-medium">
                {t('auth.signIn')}
              </Link>
            </p>
          </form>
        ) : (
          <div className="space-y-4">
            <Button type="button" variant="ghost" className="px-0 h-auto text-muted-foreground" onClick={() => setStep(1)}>
              ← {t('auth.back')}
            </Button>
            <Tabs defaultValue="create" className="w-full">
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
                  <p className="text-sm text-muted-foreground">{t('auth.registerCreateBlurb')}</p>
                  <div className="space-y-2">
                    <Label>{t('org.name')}</Label>
                    <Input
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      required
                      placeholder="My Company"
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? t('common.loading') : t('auth.finishCreate')}
                  </Button>
                </form>
              </TabsContent>
              <TabsContent value="join">
                <p className="text-sm text-muted-foreground leading-relaxed pt-4">{t('org.inviteCodeHelp')}</p>
                <form onSubmit={handleJoin} className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>{t('org.inviteCode')}</Label>
                    <Input
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value)}
                      required
                      placeholder="abc123def456"
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? t('common.loading') : t('auth.finishJoin')}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
            <p className="text-center text-sm text-muted-foreground">
              {t('auth.haveAccount')}{' '}
              <Link to="/login" className="text-primary hover:underline font-medium">
                {t('auth.signIn')}
              </Link>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
