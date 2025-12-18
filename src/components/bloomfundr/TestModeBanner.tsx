import { FlaskConical } from "lucide-react";

interface TestModeBannerProps {
  message?: string;
}

export function TestModeBanner({ message = "No real money is being transferred. Payouts are simulated for testing purposes." }: TestModeBannerProps) {
  return (
    <div className="flex items-start gap-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg mb-4">
      <FlaskConical className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
      <div>
        <span className="font-semibold text-amber-700 dark:text-amber-500">TEST MODE</span>
        <p className="text-sm text-amber-600 dark:text-amber-400 mt-0.5">{message}</p>
      </div>
    </div>
  );
}
