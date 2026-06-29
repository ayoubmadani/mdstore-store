'use client';

import React, { useEffect, useState } from 'react';
import * as ReactDOM from 'react-dom';
import * as ReactJSX from 'react/jsx-runtime';
import * as Zustand from 'zustand';
import * as ZustandMiddleware from 'zustand/middleware';
import axios from 'axios';
import * as LucideReact from 'lucide-react';
import * as FramerMotion from 'framer-motion';
import * as UUID from 'uuid';
import DOMPurify from 'isomorphic-dompurify';
import NextLink from 'next/link';
import NextImage from 'next/image';
import * as NextNavigation from 'next/navigation';

const esm = (obj: Record<string, any>) => ({ ...obj, __esModule: true });

function makeRequire() {
  const mods: Record<string, any> = {
    'react':                esm({ default: React, ...React }),
    'react-dom':            esm({ default: ReactDOM, ...ReactDOM }),
    'react/jsx-runtime':    esm({ ...ReactJSX }),
    'zustand':              esm({ ...Zustand }),
    'zustand/middleware':   esm({ ...ZustandMiddleware }),
    'axios':                esm({ default: axios }),
    'lucide-react':         esm({ ...LucideReact }),
    'framer-motion':        esm({ ...FramerMotion }),
    'uuid':                 esm({ ...UUID }),
    'isomorphic-dompurify': esm({ default: DOMPurify }),
    'next/link':            esm({ default: NextLink }),
    'next/image':           esm({ default: NextImage }),
    'next/navigation':      esm({ ...NextNavigation }),
    'next/router':          esm({ ...NextNavigation }),
  };
  return (id: string) => mods[id] ?? {};
}

const bundleCache = new Map<string, React.ComponentType<any>>();

interface ThemeRunnerProps {
  bundleUrl: string;
  exportName?: string;
  themeProps: Record<string, any>;
  children?: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function ThemeRunner({
  bundleUrl,
  exportName = 'default',
  themeProps,
  children,
  fallback = null,
}: ThemeRunnerProps) {
  const [Component, setComponent] = useState<React.ComponentType<any> | null>(
    () => bundleCache.get(`${bundleUrl}:${exportName}`) ?? null
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cacheKey = `${bundleUrl}:${exportName}`;
    if (bundleCache.has(cacheKey)) {
      setComponent(() => bundleCache.get(cacheKey)!);
      return;
    }

    fetch(bundleUrl)
      .then((r) => {
        if (!r.ok) throw new Error(`R2 ${r.status}`);
        return r.text();
      })
      .then((code) => {
        const mod = { exports: {} as Record<string, any> };
        // eslint-disable-next-line no-new-func
        const fn = new Function('module', 'exports', 'require', 'React', 'console', 'process', code);
        fn(mod, mod.exports, makeRequire(), React, console, {
          env: {
            NEXT_PUBLIC_API_URL:      process.env.NEXT_PUBLIC_API_URL      ?? '',
            NEXT_PUBLIC_ROOT_DOMAIN:  process.env.NEXT_PUBLIC_ROOT_DOMAIN  ?? '',
            NODE_ENV:                 process.env.NODE_ENV                  ?? 'production',
          },
        });

        const comp: React.ComponentType<any> =
          mod.exports[exportName] ?? mod.exports['default'] ?? mod.exports['Main'];

        if (typeof comp !== 'function') throw new Error(`export "${exportName}" not found`);

        bundleCache.set(cacheKey, comp);
        setComponent(() => comp);
      })
      .catch((err) => {
        console.error('[ThemeRunner]', bundleUrl, err.message);
        setError(err.message);
      });
  }, [bundleUrl, exportName]);

  if (error) return <>{children ?? fallback}</>;
  if (!Component) return <>{children ?? fallback}</>;

  return <Component {...themeProps}>{children}</Component>;
}
