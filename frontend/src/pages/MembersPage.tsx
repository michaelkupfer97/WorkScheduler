import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';

export default function MembersPage() {
  const { t } = useTranslation();

  const { data: members = [] } = useQuery({
    queryKey: ['members'],
    queryFn: () => api.get('/organizations/members').then((r) => r.data),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t('nav.members')}</h1>
        <Badge variant="outline" className="gap-1">
          <Users className="h-3 w-3" />
          {members.length}
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map((m: any) => (
          <Card key={m._id}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                {m.firstName?.[0]}{m.lastName?.[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{m.firstName} {m.lastName}</p>
                <p className="text-xs text-muted-foreground truncate">{m.email}</p>
              </div>
              <Badge variant={m.role === 'manager' ? 'default' : 'secondary'} className="capitalize">
                {t(`auth.${m.role}`)}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
