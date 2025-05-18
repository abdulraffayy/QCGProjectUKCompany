import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  // Mock user data - in a real app this would come from auth context
  const user = {
    name: "Dr. Jane Doe",
    role: "Academic Moderator",
    initials: "JD"
  };

  return (
    <header className="bg-white border-b border-neutral-200 flex items-center justify-between p-4 h-16">
      <div className="flex items-center md:hidden">
        <button 
          onClick={toggleSidebar} 
          className="text-neutral-700"
          aria-label="Toggle sidebar"
        >
          <span className="material-icons">menu</span>
        </button>
        <h1 className="ml-3 text-lg font-bold text-primary">QAQF Platform</h1>
      </div>
      
      <div className="hidden md:flex items-center">
        <div className="relative">
          <span className="material-icons absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400">
            search
          </span>
          <Input 
            type="text" 
            placeholder="Search academic content..." 
            className="pl-10 pr-4 py-2 w-80"
          />
        </div>
      </div>
      
      <div className="flex items-center">
        <Button variant="ghost" size="icon" className="mr-4 text-neutral-700 relative">
          <span className="material-icons">notifications</span>
          <span className="absolute top-0 right-0 w-2 h-2 bg-accent rounded-full"></span>
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center cursor-pointer">
              <Avatar className="w-8 h-8 bg-primary text-white">
                <AvatarFallback>{user.initials}</AvatarFallback>
              </Avatar>
              <div className="ml-2 mr-2 hidden md:block">
                <div className="text-sm font-medium">{user.name}</div>
                <div className="text-xs text-neutral-500">{user.role}</div>
              </div>
              <span className="material-icons text-neutral-700">arrow_drop_down</span>
            </div>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <span className="material-icons mr-2 text-sm">person</span>
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <span className="material-icons mr-2 text-sm">settings</span>
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <span className="material-icons mr-2 text-sm">logout</span>
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
