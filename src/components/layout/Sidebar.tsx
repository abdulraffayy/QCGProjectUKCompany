import { Link, useLocation } from 'wouter';
import { cn } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const [location] = useLocation();
  const { user } = useAuth();
  const isVerifier = user?.role === 'verification';
  const isModerator = user?.role === 'moderation';
  const isAdmin = user?.role === 'admin';

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
        "bg-white w-64 h-screen shadow-md flex-shrink-0 z-50 transition-all duration-300 ease-in-out sticky top-0",
        "sticky top-0 left-0 flex flex-col",
        open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}
    >
      <div className="p-4 border-b border-neutral-200 bg-white flex-shrink-0">
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
      
      <nav className="py-4 flex-1 overflow-y-auto">
        <div className="px-4 mb-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
          Dashboard
        </div>
        
        <Link href="/dashboard" className={navItemClass("/dashboard")}>
          <span className="material-icons mr-3 text-inherit">dashboard</span>
          Overview
        </Link>
        
        {/* Content section - only for regular users and admins */}
        {(!isVerifier && !isModerator) || isAdmin ? (
          <>
            <div className="px-4 mt-6 mb-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Content
            </div>
            <Link href="/content-generator" className={navItemClass("/content-generator")}> 
              <span className="material-icons mr-3 text-inherit">auto_awesome</span>
              AI Content Studio
            </Link>
            <Link href="/course-generator" className={navItemClass("/course-generator")}>
              <span className="material-icons mr-3 text-inherit">auto_awesome</span>
              Course Generator
            </Link>
            <Link href="/lesson-plan" className={navItemClass("/lesson-plan")}> 
              <span className="material-icons mr-3 text-inherit">event_note</span>
              Lesson Plan
            </Link>
            <Link href="/study-material" className={navItemClass("/study-material")}> 
              <span className="material-icons mr-3 text-inherit">book</span>
              Study Material
            </Link>
            <Link href="/video-generator" className={navItemClass("/video-generator")}> 
              <span className="material-icons mr-3 text-inherit">video_library</span>
              Video Generator
            </Link>
          </>
                 ) : null}
         
         {/* Assessment in Progress - only for regular users */}
         {(!isVerifier && !isModerator && !isAdmin) && (
           <>
             <div className="px-4 mt-6 mb-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
               Assessment
             </div>
             <Link href="/assessment-in-progress" className={navItemClass("/assessment-in-progress")}>
               <span className="material-icons mr-3 text-inherit">assignment_late</span>
               Assessment in Progress
             </Link>
           </>
         )}
         
         {/* Quality Assurance section per role */}
        {(isAdmin || isVerifier || isModerator) && (
          <>
            <div className="px-4 mt-6 mb-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Quality Assurance
            </div>
                         {/* Verification view: Only Verification and Assessment */}
             {isVerifier && !isAdmin && (
               <>
                 <Link href="/verification" className={navItemClass("/verification")}>
                   <span className="material-icons mr-3 text-inherit">verified</span>
                   Verification
                 </Link>
                 <Link href="/assessment" className={navItemClass("/assessment")}>
                   <span className="material-icons mr-3 text-inherit">school</span>
                   Assessment
                 </Link>
               </>
             )}

                         {/* Moderation view: Only Moderation and Assessment */}
             {isModerator && !isAdmin && (
               <>
                 <Link href="/moderation" className={navItemClass("/moderation")}>
                   <span className="material-icons mr-3 text-inherit">gavel</span>
                   Moderation
                 </Link>
                 <Link href="/assessment" className={navItemClass("/assessment")}>
                   <span className="material-icons mr-3 text-inherit">school</span>
                   Assessment
                 </Link>
               </>
             )}

            {/* Admin sees everything under QA */}
            {isAdmin && (
              <>
                <Link href="/verification" className={navItemClass("/verification")}>
                  <span className="material-icons mr-3 text-inherit">verified</span>
                  Verification
                </Link>
                <Link href="/moderation" className={navItemClass("/moderation")}>
                  <span className="material-icons mr-3 text-inherit">gavel</span>
                  Moderation
                </Link>
                <Link href="/assessment" className={navItemClass("/assessment")}>
                  <span className="material-icons mr-3 text-inherit">school</span>
                  Assessment
                </Link>
                <Link href="/analytics" className={navItemClass("/analytics")}>
                  <span className="material-icons mr-3 text-inherit">analytics</span>
                  Analytics
                </Link>
                <Link href="/assessment-in-progress" className={navItemClass("/assessment-in-progress")}>
                  <span className="material-icons mr-3 text-inherit">assignment_late</span>
                  Assessment in Progress
                </Link>
              </>
            )}
          </>
        )}
        
                 {/* Administration section */}
         {(isAdmin || isVerifier || isModerator) && (
           <>
             <div className="px-4 mt-6 mb-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
               Administration
             </div>
             
                           {/* QAQF Admin - only for Admin */}
              {isAdmin && (
                <Link href="/qaqf-admin" className={navItemClass("/qaqf-admin")}>
                  <span className="material-icons mr-3 text-inherit">admin_panel_settings</span>
                  QAQF Admin
                </Link>
              )}
             
                           <Link href="/settings" className={navItemClass("/settings")}>
                <span className="material-icons mr-3 text-inherit">settings</span>
                Settings
              </Link>
              
              {/* Assessment - only for Admin
              {isAdmin && (
                <Link href="/assessment" className={navItemClass("/assessment")}>
                  <span className="material-icons mr-3 text-inherit">school</span>
                  Assessment
                </Link>
              )} */}
           </>
         )}
        
       
        {/* <div className="px-4 mt-6 mb-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Quality Assurance
            </div>
        {!isVerifier && (
              <Link href="/assessment-in-progress" className={navItemClass("/assessment-in-progress")}> 
                <span className="material-icons mr-3 text-inherit">assignment_late</span>
                Assessment in Progress
              </Link>
            )}
        {isRegularUser && (
          <>
            <div className="px-4 mt-6 mb-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Account
            </div>
            
            <Link href="/settings" className={navItemClass("/settings")}>
              <span className="material-icons mr-3 text-inherit">settings</span>
              Settings
            </Link>
          </>
        )} */}


{/* <Link href="/rafay" className={navItemClass("/rafay")}>
              <span className="material-icons mr-3 text-inherit">rafay</span>
              Rafay
            </Link> */}
{/* <Link href="/dummylesson" className={navItemClass("/dummylesson")}>
                  <span className="material-icons mr-3 text-inherit">school</span>
                  Dummy Lesson
                </Link> */}
      </nav>
    </aside>
  );
};

export default Sidebar;
