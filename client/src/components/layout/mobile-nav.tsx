import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

const navigation = [
  { name: 'Dashboard', href: '/', icon: 'fas fa-tachometer-alt' },
  { name: 'Transazioni', href: '/transactions', icon: 'fas fa-list' },
  { name: 'Budget', href: '/budget', icon: 'fas fa-piggy-bank' },
  { name: 'Report', href: '/reports', icon: 'fas fa-chart-bar' },
];

export default function MobileNav() {
  const [location] = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 lg:hidden">
      <div className="grid grid-cols-5 py-2">
        {navigation.map((item) => {
          const isActive = location === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center py-2 px-1",
                isActive ? "text-primary-600" : "text-slate-400"
              )}
              data-testid={`mobile-nav-${item.name.toLowerCase()}`}
            >
              <i className={`${item.icon} text-lg`} />
              <span className="text-xs mt-1">{item.name}</span>
            </Link>
          );
        })}
        
        {/* Add Transaction Button */}
        <button className="flex flex-col items-center py-2 px-1 text-slate-400">
          <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center mb-1">
            <i className="fas fa-plus text-white text-sm"></i>
          </div>
          <span className="text-xs">Aggiungi</span>
        </button>
      </div>
    </div>
  );
}
