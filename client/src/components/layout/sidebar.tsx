import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

const navigation = [
  { name: 'Dashboard', href: '/', icon: 'fas fa-tachometer-alt' },
  { name: 'Transazioni', href: '/transactions', icon: 'fas fa-list' },
  { name: 'Categorie', href: '/categories', icon: 'fas fa-tags' },
  { name: 'Budget', href: '/budget', icon: 'fas fa-piggy-bank' },
  { name: 'Conti Bancari', href: '/accounts', icon: 'fas fa-university' },
  { name: 'Report', href: '/reports', icon: 'fas fa-chart-bar' },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white border-r border-slate-200">
      <div className="flex flex-col flex-1">
        {/* Logo */}
        <div className="flex items-center px-6 py-4 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <i className="fas fa-chart-line text-white text-sm"></i>
            </div>
            <h1 className="text-xl font-semibold text-slate-900">ExpenseTracker</h1>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navigation.map((item) => {
            const isActive = location === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center px-3 py-2 text-sm font-medium rounded-md",
                  isActive
                    ? "bg-primary-50 text-primary-700"
                    : "text-slate-600 hover:bg-slate-50"
                )}
                data-testid={`nav-${item.name.toLowerCase()}`}
              >
                <i 
                  className={cn(
                    item.icon,
                    "mr-3",
                    isActive ? "text-primary-500" : ""
                  )} 
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="border-t border-slate-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-slate-300 rounded-full flex items-center justify-center">
              <i className="fas fa-user text-slate-600 text-sm"></i>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-900">Mario Rossi</p>
              <p className="text-xs text-slate-500">mario@example.com</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
