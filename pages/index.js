import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function Dashboard() {
  const { data: session } = useSession();

  const quickActions = [
    {
      title: 'Order Beverages',
      description: 'Request kombucha or cold brew refills',
      href: '/beverages',
      icon: '☕',
      color: 'bg-[#68d2df]/20 border-[#68d2df]/30',
    },
    // Add more quick actions for future features:
    // {
    //   title: 'IT Support',
    //   description: 'Submit a help desk ticket',
    //   href: '/it-requests',
    //   icon: '💻',
    //   color: 'bg-purple-500/20 border-purple-500/30',
    // },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {session?.user?.name?.split(' ')[0]}!
        </h1>
        <p className="text-white/70">
          What would you like to do today?
        </p>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {quickActions.map((action) => (
          <Link
            key={action.title}
            href={action.href}
            className={`card ${action.color} hover:scale-105 transition-transform cursor-pointer`}
          >
            <div className="text-4xl mb-4">{action.icon}</div>
            <h3 className="text-lg font-semibold mb-2">{action.title}</h3>
            <p className="text-white/70 text-sm">{action.description}</p>
          </Link>
        ))}

        {/* Placeholder for future features */}
        <div className="card bg-white/5 border-dashed border-white/20 flex items-center justify-center min-h-[160px]">
          <div className="text-center text-white/40">
            <div className="text-2xl mb-2">+</div>
            <p className="text-sm">More features coming soon</p>
          </div>
        </div>
      </div>

      {/* Recent Activity / Announcements section */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Company Updates</h2>
        <div className="space-y-4">
          <div className="flex items-start gap-4 p-4 bg-white/5 rounded-lg">
            <div className="w-2 h-2 mt-2 rounded-full bg-[#68d2df]"></div>
            <div>
              <p className="font-medium">Beverage Ordering System Live!</p>
              <p className="text-sm text-white/60 mt-1">
                You can now order kombucha and cold brew refills directly through the intranet.
              </p>
              <p className="text-xs text-white/40 mt-2">Just now</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
