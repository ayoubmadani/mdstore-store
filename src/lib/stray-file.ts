// ملف في جذر الموقع غير موجود (مثل /meta.json الذي يطلبه زاحف فيسبوك آلاف المرات يومياً):
// بدون هذا يصل لمسار [domain] ويُرندر صفحة كاملة باعتبار «meta.json» دومين متجر، مع طلبين للـ API.
// الدومين نفسه في المسار (تطوير محلي: /sidobox.top) ليس ملفاً لأن امتداده ليس امتداد ملف.

const REAL_FILES = new Set(['/robots.txt', '/llms.txt', '/sitemap.xml', '/icon.png', '/favicon.ico', '/favicon.png']);
const FILE_EXT = /^\/[^/]+\.(json|txt|xml|html?|php|ya?ml|env|js|mjs|map|css|ico|png|jpe?g|gif|svg|webp|avif|woff2?|ttf|zip|gz|sql|bak|log|ini|conf|cfg|md)$/i;

export const isStrayFile = (path: string) => FILE_EXT.test(path) && !REAL_FILES.has(path.toLowerCase());
