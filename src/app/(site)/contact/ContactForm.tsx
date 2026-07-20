'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { useTranslations, useLocale } from 'next-intl';
import { Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { submitContactForm, type ContactFormState } from './actions';

const initialState: ContactFormState = { success: false, error: false };

function SubmitButton() {
  const { pending } = useFormStatus();
  const t = useTranslations('contact');
  const locale = useLocale();
  const isRtl = locale === 'ar';

  return (
    <button
      type="submit"
      disabled={pending}
      className={`w-full md:w-max px-12 py-4 bg-brand-primary text-white font-black rounded-2xl transition-all shadow-xl shadow-brand-primary/20 flex items-center justify-center gap-3 group active:scale-95 ${
        pending ? 'opacity-70 cursor-not-allowed' : 'hover:bg-brand-primary/90'
      }`}
    >
      <span>{pending ? t('sending') : t('send_btn')}</span>
      {!pending && (
        <Send size={18} className={`${isRtl ? 'rotate-180' : ''} group-hover:translate-x-1 transition-transform`} />
      )}
    </button>
  );
}

export default function ContactForm() {
  const t = useTranslations('contact');
  const [state, formAction] = useActionState(submitContactForm, initialState);
  const [showSuccess, setShowSuccess] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      setShowSuccess(true);
      formRef.current?.reset();
      const timeout = setTimeout(() => setShowSuccess(false), 5000);
      return () => clearTimeout(timeout);
    }
  }, [state.success]);

  return (
    <div className="lg:col-span-2 bg-white dark:bg-zinc-900 p-8 md:p-12 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-zinc-800">
      {showSuccess && (
        <div className="mb-8 p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-2xl flex items-center gap-3 text-emerald-700 dark:text-emerald-400">
          <CheckCircle2 size={20} />
          <span className="font-bold">{t('success_msg')}</span>
        </div>
      )}

      {state.error && (
        <div className="mb-8 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl flex items-center gap-3 text-red-700 dark:text-red-400">
          <AlertCircle size={20} />
          <span className="font-bold">{t('error_msg')}</span>
        </div>
      )}

      <form ref={formRef} action={formAction} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mx-1">{t('name_label')}</label>
            <input
              type="text"
              name="username"
              required
              className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 text-gray-900 dark:text-white outline-none focus:border-brand-primary transition-all"
              placeholder={t('name_placeholder')}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mx-1">{t('email_label')}</label>
            <input
              type="email"
              name="email"
              required
              className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 text-gray-900 dark:text-white outline-none focus:border-brand-primary transition-all"
              placeholder="example@mail.com"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mx-1">{t('subject_label')}</label>
          <input
            type="text"
            name="subject"
            required
            className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 text-gray-900 dark:text-white outline-none focus:border-brand-primary transition-all"
            placeholder={t('subject_placeholder')}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mx-1">{t('message_label')}</label>
          <textarea
            name="message"
            rows={5}
            required
            className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 text-gray-900 dark:text-white outline-none focus:border-brand-primary transition-all resize-none"
            placeholder={t('message_placeholder')}
          ></textarea>
        </div>

        <SubmitButton />
      </form>
    </div>
  );
}
