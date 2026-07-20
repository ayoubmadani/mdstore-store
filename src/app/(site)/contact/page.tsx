import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import ContactForm from './ContactForm';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('contact');
  return {
    title: t('meta_title'),
    description: t('meta_description'),
    openGraph: {
      title: t('meta_title'),
      description: t('meta_description'),
      images: [{ url: '/og/mdstore-default.png' }],
    },
  };
}

export default async function ContactPage() {
  const t = await getTranslations('contact');

  return (
    <div className="bg-white dark:bg-brand-dark min-h-screen py-16 px-6 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4">{t('title')}</h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto text-lg">{t('subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-gray-50 dark:bg-zinc-900 p-8 rounded-[2rem] shadow-sm border border-gray-100 dark:border-zinc-800 space-y-8">
              <ContactInfoItem
                icon={<MapPin size={20} />}
                title={t('address_label')}
                content={t('address_val')}
                color="text-brand-primary"
                bgColor="bg-brand-primary/10"
              />
              <ContactInfoItem
                icon={<Phone size={20} />}
                title={t('phone_label')}
                content="+213 555 00 00 00"
                color="text-brand-success"
                bgColor="bg-brand-success/10"
                isLtr
              />
              <ContactInfoItem
                icon={<Mail size={20} />}
                title={t('email_label')}
                content="support@mdstore.top"
                color="text-purple-600 dark:text-purple-400"
                bgColor="bg-purple-50 dark:bg-purple-500/10"
              />
            </div>

            <div className="bg-brand-primary p-8 rounded-[2rem] shadow-xl shadow-brand-primary/20 text-white relative overflow-hidden group">
              <Clock className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 group-hover:rotate-12 transition-transform duration-500" />
              <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
                <Clock size={20} />
                {t('hours_title')}
              </h3>
              <ul className="space-y-3 opacity-90 text-sm">
                <li className="flex justify-between border-b border-white/10 pb-2">
                  <span>{t('days_work')}</span>
                  <span className="font-bold" dir="ltr">9:00 AM - 6:00 PM</span>
                </li>
                <li className="flex justify-between">
                  <span>{t('days_off')}</span>
                  <span className="font-bold">{t('closed')}</span>
                </li>
              </ul>
            </div>
          </div>

          <ContactForm />
        </div>
      </div>
    </div>
  );
}

const ContactInfoItem = ({
  icon,
  title,
  content,
  color,
  bgColor,
  isLtr,
}: {
  icon: React.ReactNode;
  title: string;
  content: string;
  color: string;
  bgColor: string;
  isLtr?: boolean;
}) => (
  <div className="flex items-start gap-5">
    <div className={`w-12 h-12 ${bgColor} ${color} rounded-2xl flex items-center justify-center shrink-0 shadow-sm`}>
      {icon}
    </div>
    <div>
      <h3 className="font-bold text-gray-900 dark:text-white mb-1">{title}</h3>
      <p className={`text-gray-500 dark:text-gray-400 text-sm leading-relaxed ${isLtr ? 'font-sans' : ''}`} dir={isLtr ? 'ltr' : 'auto'}>
        {content}
      </p>
    </div>
  </div>
);
