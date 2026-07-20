import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Facebook, Twitter, Instagram, Linkedin, Mail, MapPin, Phone } from 'lucide-react';

const DASHBOARD_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL || '';

export default async function SiteFooter() {
  const tFooter = await getTranslations('footer');
  const tNav = await getTranslations('nav');
  const tContact = await getTranslations('contact');
  const tHome = await getTranslations('home');

  return (
    <footer className="bg-white dark:bg-brand-dark border-t border-gray-100 dark:border-zinc-800 pt-16 pb-8 transition-colors duration-300">
      <div className="container mx-auto px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <Link dir="ltr" href="/" className="inline-flex items-center gap-0.5 group">
              <div className="w-10 h-10 bg-gradient-to-br from-brand-primary to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
                <span className="text-white font-bold text-xl font-sans">MD</span>
              </div>
              <span className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter italic">Store</span>
            </Link>
            <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-sm">{tFooter('description')}</p>
            <div className="flex gap-4">
              <SocialIcon icon={<Facebook size={18} />} href="#" label="Facebook" />
              <SocialIcon icon={<Twitter size={18} />} href="#" label="Twitter" />
              <SocialIcon icon={<Instagram size={18} />} href="#" label="Instagram" />
              <SocialIcon icon={<Linkedin size={18} />} href="#" label="LinkedIn" />
            </div>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 dark:text-white mb-6 text-lg">{tFooter('quick_links')}</h4>
            <ul className="space-y-4">
              <FooterLink href="/" label={tNav('home')} />
              <FooterLink href="/about" label={tNav('about')} />
              <FooterLink href="/contact" label={tNav('contact')} />
              <FooterLink href={`${DASHBOARD_URL}/auth/register`} label={tHome('get_started')} />
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 dark:text-white mb-6 text-lg">{tFooter('legal')}</h4>
            <ul className="space-y-4">
              <FooterLink href="/privacy" label={tFooter('privacy')} />
              <FooterLink href="/terms" label={tFooter('terms')} />
              <FooterLink href="/cookies" label={tFooter('cookies')} />
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 dark:text-white mb-6 text-lg">{tContact('title')}</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-gray-500 dark:text-gray-400 text-sm">
                <MapPin size={18} className="text-brand-primary shrink-0" />
                <span>{tContact('address_val')}</span>
              </li>
              <li className="flex items-center gap-3 text-gray-500 dark:text-gray-400 text-sm">
                <Phone size={18} className="text-brand-primary shrink-0" />
                <span dir="ltr">+213 500 00 00 00</span>
              </li>
              <li className="flex items-center gap-3 text-gray-500 dark:text-gray-400 text-sm">
                <Mail size={18} className="text-brand-primary shrink-0" />
                <span>support@mdstore.top</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-100 dark:border-zinc-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <p>© {new Date().getFullYear()} MdStore. {tFooter('rights')}</p>
          <div className="flex gap-6">
            <span className="hover:text-brand-primary cursor-pointer transition-colors">Algeria 🇩🇿</span>
            <span className="hover:text-brand-primary cursor-pointer transition-colors">English</span>
            <span className="hover:text-brand-primary cursor-pointer transition-colors">Français</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

const FooterLink = ({ href, label }: { href: string; label: string }) => (
  <li>
    <Link href={href} className="text-gray-500 dark:text-gray-400 hover:text-brand-primary dark:hover:text-brand-primary transition-colors text-sm font-medium">
      {label}
    </Link>
  </li>
);

const SocialIcon = ({ icon, href, label }: { icon: React.ReactNode; href: string; label: string }) => (
  <a
    href={href}
    aria-label={label}
    className="w-9 h-9 bg-gray-50 dark:bg-zinc-900 text-gray-400 dark:text-gray-500 rounded-lg flex items-center justify-center hover:bg-brand-primary hover:text-white dark:hover:bg-brand-primary dark:hover:text-white transition-all shadow-sm"
  >
    {icon}
  </a>
);
