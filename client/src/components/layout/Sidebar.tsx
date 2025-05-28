import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const [location] = useLocation();

  const isActiveRoute = (path: string) => {
    return location === path;
  };

  const navItemClass = (path: string) => {
    return cn(
      "sidebar-menu-item flex items-center px-4 py-3 transition-all duration-200",
      isActiveRoute(path) 
        ? "text-primary font-medium bg-primary bg-opacity-10" 
        : "text-neutral-700 hover:bg-primary hover:bg-opacity-5"
    );
  };

  return (
    <aside 
      className={cn(
        "bg-white w-64 h-full shadow-md flex-shrink-0 overflow-y-auto z-50 transition-all duration-300 ease-in-out",
        "fixed md:static top-0 left-0",
        open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}
    >
      <div className="p-4 border-b border-neutral-200">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xl">
            Q
          </div>
          <h1 className="ml-3 text-xl font-bold text-primary">QAQF Platform</h1>
          <button 
            onClick={onClose}
            className="ml-auto text-neutral-500 md:hidden"
          >
            <span className="material-icons">close</span>
          </button>
        </div>
      </div>
      
      <nav className="py-4">
        <div className="px-4 mb-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
          Dashboard
        </div>
        
        <Link href="/">
          <a className={navItemClass("/")}>
            <span className="material-icons mr-3 text-inherit">dashboard</span>
            Overview
          </a>
        </Link>
        
        <div className="px-4 mt-6 mb-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
          Content
        </div>
        
        <Link href="/content-generator">
          <a className={navItemClass("/content-generator")}>
            <span className="material-icons mr-3 text-inherit">description</span>
            Content Generator
          </a>
        </Link>
        
        <Link href="/my-content">
          <a className={navItemClass("/my-content")}>
            <span className="material-icons mr-3 text-inherit">history_edu</span>
            Module Library
          </a>
        </Link>
        
        <Link href="/lesson-plan">
          <a className={navItemClass("/lesson-plan")}>
            <span className="material-icons mr-3 text-inherit">event_note</span>
            Lesson Plan
          </a>
        </Link>
        
        <Link href="/study-material">
          <a className={navItemClass("/study-material")}>
            <span className="material-icons mr-3 text-inherit">book</span>
            Study Material
          </a>
        </Link>
        
        <Link href="/video-generator">
          <a className={navItemClass("/video-generator")}>
            <span className="material-icons mr-3 text-inherit">video_library</span>
            Video Generator
          </a>
        </Link>
        
        <div className="px-4 mt-6 mb-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
          Quality Assurance
        </div>
        
        <Link href="/verification">
          <a className={navItemClass("/verification")}>
            <span className="material-icons mr-3 text-inherit">verified</span>
            Verification
          </a>
        </Link>
        
        <Link href="/moderation">
          <a className={navItemClass("/moderation")}>
            <span className="material-icons mr-3 text-inherit">gavel</span>
            Moderation
          </a>
        </Link>
        
        <Link href="/assessment">
          <a className={navItemClass("/assessment")}>
            <span className="material-icons mr-3 text-inherit">school</span>
            Assessment
          </a>
        </Link>
        
        <Link href="/assessment-in-progress">
          <a className={navItemClass("/assessment-in-progress")}>
            <span className="material-icons mr-3 text-inherit">assignment_late</span>
            Assessment in Progress
          </a>
        </Link>

        <Link href="/analytics">
          <a className={navItemClass("/analytics")}>
            <span className="material-icons mr-3 text-inherit">analytics</span>
            Analytics
          </a>
        </Link>
        
        <div className="px-4 mt-6 mb-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
          Administration
        </div>
        
        <Link href="/qaqf-admin">
          <a className={navItemClass("/qaqf-admin")}>
            <span className="material-icons mr-3 text-inherit">admin_panel_settings</span>
            QAQF Admin
          </a>
        </Link>
        
        <Link href="/settings">
          <a className={navItemClass("/settings")}>
            <span className="material-icons mr-3 text-inherit">settings</span>
            Settings
          </a>
        </Link>
        
        <a href="#" className="sidebar-menu-item flex items-center px-4 py-3 text-neutral-700">
          <span className="material-icons mr-3 text-neutral-500">help</span>
          Help & Guides
        </a>
      </nav>
    </aside>
  );
};

export default Sidebar;
