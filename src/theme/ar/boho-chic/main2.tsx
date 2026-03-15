import React from 'react';
import Footer from './components/footer';
import { Navbar } from './components/navbar';

export default function Main({ store, children }: any) {
  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: '#F7F0E6', fontFamily: "'Karla', sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,300;1,9..144,400;1,9..144,600&family=Karla:wght@300;400;500;600&display=swap');

        * { -webkit-font-smoothing: antialiased; }

        /* Subtle grain texture over entire page */
        body::before {
          content: '';
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          opacity: 0.028;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          background-size: 200px 200px;
        }

        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #EDE4D4; }
        ::-webkit-scrollbar-thumb { background: #C4714A; border-radius: 10px; }

        @keyframes sway { 0%,100%{transform:rotate(-2deg)} 50%{transform:rotate(2deg)} }
        @keyframes drift { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-6px)} }
        @keyframes boho-in { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }

        .boho-in { animation: boho-in 0.7s ease forwards; }
        .boho-in-1 { animation: boho-in 0.7s 0.1s ease both; }
        .boho-in-2 { animation: boho-in 0.7s 0.2s ease both; }
        .boho-in-3 { animation: boho-in 0.7s 0.35s ease both; }

        .leaf-sway { animation: sway 4s ease-in-out infinite; transform-origin: bottom center; }
        .feather-drift { animation: drift 5s ease-in-out infinite; }

        .boho-card:hover { transform: translateY(-4px); }
        .boho-card { transition: transform 0.4s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.4s ease; }
        .boho-card:hover { box-shadow: 0 20px 50px rgba(61,35,20,0.12); }

        .wavy-divider { line-height: 0; overflow: hidden; }
      `}</style>

      {/* Top bar */}
      {store.topBar?.enabled && store.topBar?.text && (
        <div
          className="py-2.5 px-4 text-center text-xs font-medium tracking-widest"
          style={{
            backgroundColor: '#3D2314',
            color: '#F7F0E6',
            fontFamily: "'Karla', sans-serif",
            letterSpacing: '0.12em',
          }}
        >
          ✦ {store.topBar.text} ✦
        </div>
      )}

      <Navbar store={store} />
      <main style={{ position: 'relative', zIndex: 1 }}>{children}</main>
      <Footer store={store} />
    </div>
  );
}