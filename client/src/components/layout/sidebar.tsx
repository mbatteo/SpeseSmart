// client/src/components/layout/Sidebar.tsx
import { useAuth } from '@/hooks/useAuth';
import type { User } from '@shared/schema';
import cn from 'clsx';

const navigation = [
  { name: 'Dashboard', href: '/', icon: 'fas fa-tachometer-alt' },
  { name: 'Transazioni', href: '/transactions', icon: 'fas fa-list' },
  { name: 'Categorie', href: '/categories', icon: 'fas fa-tags' },
  { name: 'Budget', href: '/budget', icon: 'fas fa-piggy-bank' },
  { name: 'Conti Bancari', href: '/accounts', icon: 'fas fa-university' },
  { name: 'Report', href: '/reports', icon: 'fas fa-chart-bar' },
];

export default function Sidebar() {
  const { user } = useAuth() as { user: User | null };

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white border-r border-slate-200">
      <div className="flex flex-col flex-1 h-full">
        {/* Logo */}
        <div className="flex items-center px-6 py-4 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center">
              <img
        src="https://it.calcuworld.com/wp-content/uploads/sites/4/2014/07/spese-matrimonio.png"   
        alt="Logo"
        className="w-full h-full object-cover"
      />
            </div>
            <h1 className="text-xl font-semibold text-slate-900">SpeseSmart</h1>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center px-3 py-2 text-sm font-medium rounded-md text-slate-600 hover:bg-slate-50",
              )}
            >
              <i className={cn(item.icon, 'mr-3')} />
              {item.name}
            </a>
          ))}
        </nav>

        {/* User Profile */}
        {user && (
          <div className="border-t border-slate-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-slate-300 rounded-full flex items-center justify-center">
                <i className="fas fa-user text-slate-600 text-sm"></i>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-900">
                  {user.firstName || user.email?.split('@')[0] || 'Utente'}
                </p>
                <p className="text-xs text-slate-500">{user.email}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
