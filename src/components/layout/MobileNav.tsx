import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Receipt, BarChart3, Wallet, Target, Landmark, FileText, Sparkles, User } from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Transactions', href: '/transactions', icon: Receipt },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Budgets', href: '/budgets', icon: Wallet },
  { name: 'Goals', href: '/goals', icon: Target },
  { name: 'FD', href: '/fixed-deposits', icon: Landmark },
  { name: 'Reports', href: '/reports', icon: FileText },
  { name: 'AI Plan', href: '/financial-planning', icon: Sparkles },
  { name: 'Profile', href: '/profile', icon: User },
];

export default function MobileNav() {
  const location = useLocation();

  return (
    <div className="xl:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <nav className="flex justify-around items-center h-16">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs mt-1">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
