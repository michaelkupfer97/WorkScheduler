import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import {
  Calendar,
  CalendarCog,
  LayoutDashboard,
  ClipboardList,
  ArrowLeftRight,
  CalendarOff,
  Settings,
  Bell,
  LogOut,
  Menu,
  X,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function AppLayout() {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isRTL = i18n.language === 'he';
  const isManager = user?.role === 'manager' || user?.role === 'admin';

  const { data: unreadCount } = useQuery({
    queryKey: ['notifications', 'unread'],
    queryFn: () => api.get('/notifications/unread-count').then((r) => r.data.count),
    refetchInterval: 30000,
    enabled: !!user?.organizationId,
  });

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: t('nav.dashboard') },
    { to: '/schedule', icon: Calendar, label: t('nav.schedule') },
    ...(isManager ? [{ to: '/manage', icon: CalendarCog, label: t('nav.manageSchedule') }] : []),
    { to: '/availability', icon: ClipboardList, label: t('nav.availability') },
    { to: '/swaps', icon: ArrowLeftRight, label: t('nav.swaps') },
    { to: '/time-off', icon: CalendarOff, label: t('nav.timeOff') },
    ...(isManager ? [{ to: '/members', icon: Users, label: t('nav.members') }] : []),
    { to: '/settings', icon: Settings, label: t('nav.settings') },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Mobile header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-background border-b h-14 flex items-center px-4">
        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex-1 flex items-center justify-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          <span className="font-semibold">{t('app.name')}</span>
        </div>
        <NavLink to="/notifications" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]">
              {unreadCount}
            </Badge>
          )}
        </NavLink>
      </header>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className={cn('absolute top-0 bottom-0 w-72 bg-background border-e p-4 flex flex-col', isRTL ? 'right-0' : 'left-0')}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Calendar className="h-6 w-6 text-primary" />
                <span className="font-bold text-lg">{t('app.name')}</span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav className="flex-1 space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    cn('flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                      isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-accent')
                  }
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <div className="border-t pt-4">
              <div className="px-3 mb-3">
                <p className="font-medium text-sm">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <Button variant="ghost" className="w-full justify-start gap-3" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
                {t('nav.logout')}
              </Button>
            </div>
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className={cn('hidden lg:flex lg:flex-col lg:fixed lg:top-0 lg:bottom-0 lg:w-64 lg:border-e lg:bg-background lg:p-4', isRTL ? 'right-0' : 'left-0')}>
        <div className="flex items-center gap-2 mb-8 px-3">
          <Calendar className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">{t('app.name')}</span>
        </div>
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn('flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-accent')
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t pt-4 space-y-2">
          <NavLink
            to="/notifications"
            className={({ isActive }) =>
              cn('flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-accent')
            }
          >
            <Bell className="h-4 w-4" />
            {t('nav.notifications')}
            {unreadCount > 0 && <Badge className="ms-auto">{unreadCount}</Badge>}
          </NavLink>
          <button
            onClick={() => i18n.changeLanguage(i18n.language === 'he' ? 'en' : 'he')}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium hover:bg-accent transition-colors"
          >
            {i18n.language === 'he' ? '🇺🇸 English' : '🇮🇱 עברית'}
          </button>
          <div className="px-3 py-2">
            <p className="font-medium text-sm">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
          </div>
          <Button variant="ghost" className="w-full justify-start gap-3 text-destructive" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            {t('nav.logout')}
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className={cn('lg:ps-64 pt-14 lg:pt-0')}>
        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
