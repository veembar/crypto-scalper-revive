
import { Button } from "@/components/ui/button";
import { Bitcoin, ChartLine } from "lucide-react";

const Header = () => {
  return (
    <header className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 bg-dark-card border-b border-dark-border">
      <div className="flex items-center gap-2">
        <Bitcoin className="w-6 h-6 text-primary" />
        <h1 className="text-xl font-bold text-white">BTC Scalper Pro</h1>
      </div>
      <div className="flex items-center gap-4">
        <Button variant="outline" className="text-xs sm:text-sm border-dark-border hover:border-primary hover:bg-transparent">
          <ChartLine className="w-4 h-4 mr-2" /> Demo Account
        </Button>
      </div>
    </header>
  );
};

export default Header;
