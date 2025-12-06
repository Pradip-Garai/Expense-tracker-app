import ThemeToggle from '@/components/common/ThemeToggle';

export default function MobileHeader() {
  return (
    <div className="xl:hidden sticky top-0 z-40 bg-card border-b border-border">
      <div className="flex items-center justify-between px-4 h-14">
        <h1 className="text-xl font-bold text-primary">Expense Tracker</h1>
        <ThemeToggle />
      </div>
    </div>
  );
}
