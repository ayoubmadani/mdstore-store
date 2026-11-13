// حزم الثيمات التي قُيّمت: أي مكوّن منها يُقرأ فوراً بلا انتظار، فيُرسم غلاف المتجر (الرأس والتذييل)
// ومحتوى الصفحة في لحظة واحدة — وإلا ظهر التذييل تحت الرأس ثم قفز لأسفل عند وصول المحتوى.
export type ThemeExports = Record<string, unknown>;
type ThemeComponent = (props: any) => unknown;

export function pickComponent(exports: ThemeExports | undefined, exportName: string): ThemeComponent | null {
  const comp = exports?.[exportName] ?? exports?.default ?? exports?.Main;
  return typeof comp === 'function' ? (comp as ThemeComponent) : null;
}

export function createThemeRegistry() {
  const loaded = new Map<string, ThemeExports>();
  return {
    remember(bundleUrl: string, exports: ThemeExports) { loaded.set(bundleUrl, exports); },
    component(bundleUrl: string, exportName: string) { return pickComponent(loaded.get(bundleUrl), exportName); },
  };
}
