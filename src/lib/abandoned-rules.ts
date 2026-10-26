// قواعد «الطلبات المتروكة» بلا DOM (قابلة للاختبار)

export const isDzMobile = (raw: string) => {
  let d = raw.replace(/\D/g, '');
  if (d.startsWith('00213')) d = d.slice(5); else if (d.startsWith('213')) d = d.slice(3);
  if (d.length === 9) d = `0${d}`;
  return /^0[567]\d{8}$/.test(d) ? d : null;
};

/** نص الخيار المختار — والخيار الفارغ («اختر الولاية»، value="") يُعتبر بلا قيمة */
export const selectText = (value: string, text: string) => (value === '' ? '' : text.trim());
