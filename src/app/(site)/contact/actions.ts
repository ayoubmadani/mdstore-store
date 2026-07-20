'use server';

import { submitContact } from '@/lib/api';

export interface ContactFormState {
  success: boolean;
  error: boolean;
}

export async function submitContactForm(
  _prevState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const username = String(formData.get('username') || '').trim();
  const email = String(formData.get('email') || '').trim();
  const subject = String(formData.get('subject') || '').trim();
  const message = String(formData.get('message') || '').trim();

  if (!username || !email || !subject || !message) {
    return { success: false, error: true };
  }

  const ok = await submitContact({ username, email, subject, message });
  return { success: ok, error: !ok };
}
