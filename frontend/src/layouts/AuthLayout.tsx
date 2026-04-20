import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Calendar } from 'lucide-react';

export default function AuthLayout() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'he';

  return (
    <div className="min-h-screen flex" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="hidden lg:flex lg:w-1/2 bg-primary items-center justify-center p-12">
        <div className="text-center text-primary-foreground">
          <Calendar className="w-20 h-20 mx-auto mb-6" />
          <h1 className="text-4xl font-bold mb-4">{t('app.name')}</h1>
          <p className="text-xl opacity-90">{t('app.tagline')}</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Calendar className="w-8 h-8 text-primary" />
              <h1 className="text-2xl font-bold">{t('app.name')}</h1>
            </div>
            <p className="text-muted-foreground">{t('app.tagline')}</p>
          </div>

          <Outlet />

          <div className="mt-6 text-center">
            <button
              onClick={() => i18n.changeLanguage(i18n.language === 'he' ? 'en' : 'he')}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {i18n.language === 'he' ? 'English' : 'עברית'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
