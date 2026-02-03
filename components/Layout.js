import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Layout({ children }) {
  const router = useRouter();
  const currentPath = router.pathname;

  const navItems = [
    { name: 'Home', path: '/', icon: '🏠' },
    { name: 'Beverage Ordering', path: '/beverages', icon: '🍺' },
    { name: 'Order History', path: '/history', icon: '📋' },
    { name: 'NDA Requests', path: '/nda', icon: '📝' },
    { name: 'NDA History', path: '/nda-history', icon: '📁' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-navy/50 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8">
                <svg viewBox="0 0 40 40" className="w-full h-full">
                  <path
                    d="M20 5 C10 5, 5 15, 5 20 C5 30, 15 35, 20 35 C15 30, 12 25, 12 20 C12 12, 18 8, 20 5"
                    fill="#68D2DF"
                  />
                </svg>
              </div>
              <span className="text-white font-bold text-xl">Luna Intranet</span>
            </div>
            <nav className="flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentPath === item.path
                      ? 'bg-white/20 text-white'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span className="mr-1.5">{item.icon}</span>
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Beta Features Banner - Clinical Trial Dashboard */}
      {!currentPath.startsWith('/clinical-trial') && (
        <div className="fixed bottom-6 right-6 z-50">
          <Link
            href="/clinical-trial"
            className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            <span className="text-lg">🔬</span>
            <div>
              <div className="font-semibold text-sm">Clinical Trial Dashboard</div>
              <div className="text-xs text-teal-100">Beta Feature</div>
            </div>
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      )}

      <style jsx global>{`
        .bg-navy {
          background-color: #041E42;
        }
        .text-navy {
          color: #041E42;
        }
      `}</style>
    </div>
  );
}
