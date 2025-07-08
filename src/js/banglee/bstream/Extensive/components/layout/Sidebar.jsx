import { useState } from 'react';
import { Link, useLocation } from 'react-router';
import { 
  Home, 
  Compass, 
  PlaySquare, 
  Clock, 
  ThumbsUp, 
  History, 
  Film, 
  Flame, 
  ShoppingBag, 
  Music2, 
  Radio, 
  GamepadIcon, 
  Newspaper, 
  Trophy, 
  Lightbulb, 
  Settings, 
  Flag, 
  HelpCircle, 
  MessageSquare 
} from 'lucide-react';
import { cn } from '../../lib/utils';

export default function Sidebar({ isSidebarOpen }) {
  const location = useLocation();
  const [showMore, setShowMore] = useState(false);

  const mainItems = [
    { name: 'Home', icon: <Home className="h-5 w-5" />, path: '/' },
    { name: 'Explore', icon: <Compass className="h-5 w-5" />, path: '/explore' },
    { name: 'Shorts', icon: <PlaySquare className="h-5 w-5" />, path: '/shorts' },
    { name: 'Subscriptions', icon: <Radio className="h-5 w-5" />, path: '/subscriptions' },
  ];

  const personalItems = [
    { name: 'Library', icon: <Film className="h-5 w-5" />, path: '/library' },
    { name: 'History', icon: <History className="h-5 w-5" />, path: '/history' },
    { name: 'Your Videos', icon: <PlaySquare className="h-5 w-5" />, path: '/your-videos' },
    { name: 'Watch Later', icon: <Clock className="h-5 w-5" />, path: '/watch-later' },
    { name: 'Liked Videos', icon: <ThumbsUp className="h-5 w-5" />, path: '/liked-videos' },
  ];

  const exploreItems = [
    { name: 'Trending', icon: <Flame className="h-5 w-5" />, path: '/trending' },
    { name: 'Shopping', icon: <ShoppingBag className="h-5 w-5" />, path: '/shopping' },
    { name: 'Music', icon: <Music2 className="h-5 w-5" />, path: '/music' },
    { name: 'Gaming', icon: <GamepadIcon className="h-5 w-5" />, path: '/gaming' },
    { name: 'News', icon: <Newspaper className="h-5 w-5" />, path: '/news' },
    { name: 'Sports', icon: <Trophy className="h-5 w-5" />, path: '/sports' },
    { name: 'Learning', icon: <Lightbulb className="h-5 w-5" />, path: '/learning' },
  ];

  const helpItems = [
    { name: 'Settings', icon: <Settings className="h-5 w-5" />, path: '/settings' },
    { name: 'Report History', icon: <Flag className="h-5 w-5" />, path: '/report' },
    { name: 'Help', icon: <HelpCircle className="h-5 w-5" />, path: '/help' },
    { name: 'Send Feedback', icon: <MessageSquare className="h-5 w-5" />, path: '/feedback' },
  ];

  const renderSidebarItems = (items, section) => {
    return (
      <div className={cn("flex flex-col", !isSidebarOpen && "items-center")}>
        {isSidebarOpen && section && (
          <h3 className="ml-3 mt-2 mb-1 text-sm font-semibold text-muted-foreground">{section}</h3>
        )}
        {items.map((item, index) => (
          <Link 
            key={index} 
            to={item.path} 
            className={cn(
              "flex items-center py-2 px-3 rounded-lg mb-1 hover:bg-accent",
              location.pathname === item.path ? "bg-accent font-medium" : "",
              !isSidebarOpen && "justify-center px-2"
            )}
          >
            <span className={!isSidebarOpen ? 'mx-auto' : 'mr-3'}>{item.icon}</span>
            {isSidebarOpen && <span className="text-sm">{item.name}</span>}
          </Link>
        ))}
      </div>
    );
  };

  return (
    <aside 
      className={cn(
        "fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] bg-background/95 backdrop-blur transition-all duration-300 ease-in-out",
        isSidebarOpen ? "w-56" : "w-16",
      )}
    >
      <div className="flex h-full flex-col gap-2 overflow-y-auto py-3 px-2">
        {renderSidebarItems(mainItems, "")}
        
        {isSidebarOpen && <div className="my-2 border-t border-border"></div>}
        
        {renderSidebarItems(personalItems, isSidebarOpen ? "You" : "")}
        
        {isSidebarOpen && <div className="my-2 border-t border-border"></div>}
        
        {showMore ? (
          <>
            {renderSidebarItems(exploreItems, isSidebarOpen ? "Explore" : "")}
            
            {isSidebarOpen && <div className="my-2 border-t border-border"></div>}
            
            {renderSidebarItems(helpItems, isSidebarOpen ? "More" : "")}
          </>
        ) : (
          <>
            {renderSidebarItems(exploreItems.slice(0, 3), isSidebarOpen ? "Explore" : "")}
            
            {isSidebarOpen ? (
              <button 
                onClick={() => setShowMore(true)}
                className="flex items-center py-2 px-3 rounded-lg mb-1 hover:bg-accent"
              >
                <span className="mr-3">...</span>
                <span className="text-sm">Show more</span>
              </button>
            ) : (
              <button 
                onClick={() => setShowMore(true)}
                className="flex justify-center items-center py-2 px-2 rounded-lg mb-1 hover:bg-accent"
              >
                <span>...</span>
              </button>
            )}
          </>
        )}

        {isSidebarOpen && (
          <div className="mt-auto pt-4 px-3 text-xs text-muted-foreground">
            <p>© 2025 VideoHub</p>
          </div>
        )}
      </div>
    </aside>
  );
}