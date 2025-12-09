import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Flower2 } from "lucide-react";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-bloomfundr-card/95 backdrop-blur-sm border-b border-bloomfundr-muted">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/fundraiser" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-bloomfundr-primary to-bloomfundr-primary-light flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
            <Flower2 className="w-6 h-6 text-bloomfundr-primary-foreground" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-bloomfundr-primary to-bloomfundr-secondary bg-clip-text text-transparent">
            BloomFundr
          </span>
        </Link>

        <nav className="flex items-center gap-3">
          <Button
            variant="ghost"
            asChild
            className="text-foreground hover:text-bloomfundr-primary hover:bg-bloomfundr-muted"
          >
            <Link to="/fundraiser/login">Login</Link>
          </Button>
          <Button
            asChild
            className="bg-bloomfundr-primary hover:bg-bloomfundr-primary-light text-bloomfundr-primary-foreground shadow-md hover:shadow-lg transition-all"
          >
            <Link to="/fundraiser/register">Sign Up</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
