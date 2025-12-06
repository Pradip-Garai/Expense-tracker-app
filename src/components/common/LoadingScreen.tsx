import { Wallet } from 'lucide-react';

export default function LoadingScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="absolute inset-0 animate-ping">
            <div className="h-16 w-16 rounded-full bg-primary/20" />
          </div>
          <div className="relative h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
            <Wallet className="h-8 w-8 text-primary" />
          </div>
        </div>
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground">Expense Tracker</h2>
          <p className="text-sm text-muted-foreground mt-1">Loading your data...</p>
        </div>
      </div>
    </div>
  );
}
