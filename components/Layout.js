import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';

// Navigation items - add new features here
const navigationItems = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Order Beverages', href: '/beverages', icon: CoffeeIcon },
  // Future features can be added here:
  // { name: 'IT Requests', href: '/it-requests', icon: ComputerIcon },
  // { name: 'Time Off', href: '/time-off', icon: CalendarIcon },
  // { name: 'Directory', href: '/directory', icon: UsersIcon },
];

function HomeIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );
}

function CoffeeIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function MoonLogo() {
  return (
    <svg className="w-10 h-10" viewBox="0 0 100 100" fill="none">
      <circle cx="50" cy="50" r="45" fill="#68d2df"/>
      <circle cx="65" cy="50" r="35" fill="#041e42"/>
    </svg>
  );
}

export default function Layout({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-[#68d2df]">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="card max-w-md w-full text-center">
          <div className="flex justify-center mb-6">
            <MoonLogo />
          </div>
          <h1 className="text-3xl font-bold mb-2">Luna Intranet</h1>
          <p className="text-white/70 mb-8">Sign in to access company resources</p>
          <button
            onClick={() => signIn('google')}
            className="btn-primary w-full flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-black/20 border-r border-white/10 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <Link href="/" className="flex items-center gap-3">
            <MoonLogo />
            <span className="text-xl font-bold">Luna</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navigationItems.map((item) => {
              const isActive = router.pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-[#68d2df] text-[#041e42]'
                        : 'hover:bg-white/10'
                    }`}
                  >
                    <item.icon />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-4">
            {session.user.image && (
              <img
                src={session.user.image}
                alt=""
                className="w-10 h-10 rounded-full"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{session.user.name}</p>
              <p className="text-sm text-white/60 truncate">{session.user.email}</p>
            </div>
          </div>
          <button
            onClick={() => signOut()}
            className="w-full text-left px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
