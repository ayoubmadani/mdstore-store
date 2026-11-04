# mdstore-store (Next) على خادم (Contabo) — Vercel لا يستعمل هذا الملف
# إعدادات الإنتاج تُمرَّر للبناء كـ secret (NEXT_PUBLIC_* تُدمج في البناء) ولا تُحفظ في الصورة
FROM node:22-bookworm-slim AS build
WORKDIR /app
# pnpm 9 = نفس Vercel (pnpm 12 يتجاهل overrides في package.json فلا يطابق القفل)
RUN corepack enable && corepack prepare pnpm@9.15.9 --activate
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# بلا prune: next.config.ts يحتاج typescript عند next start
RUN --mount=type=secret,id=env,target=/app/.env.production npx next build

FROM node:22-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production PORT=3000 NEXT_TELEMETRY_DISABLED=1
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/package.json /app/next.config.ts ./
EXPOSE 3000
CMD ["node", "node_modules/next/dist/bin/next", "start", "-H", "0.0.0.0", "-p", "3000"]
