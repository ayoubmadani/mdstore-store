export function showError(msg: string) {
  if (typeof document === 'undefined') return;
  const d = document.createElement('div');
  d.dir = 'rtl';
  d.style.cssText = [
    'position:fixed',
    'top:20px',
    'left:50%',
    'transform:translateX(-50%)',
    'background:#ef4444',
    'color:#fff',
    'padding:12px 28px',
    'border-radius:10px',
    'z-index:99999',
    'font-size:15px',
    'font-family:inherit',
    'box-shadow:0 4px 20px rgba(0,0,0,.25)',
    'pointer-events:none',
  ].join(';');
  d.textContent = msg;
  document.body.appendChild(d);
  setTimeout(() => d.remove(), 3000);
}
