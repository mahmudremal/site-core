import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Search, Menu, Bell, Upload, User, Mic, ArrowLeft } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { cn } from '../../lib/utils';

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [mobileSearch, setMobileSearch] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="flex h-16 items-center px-4">
        {/* Logo and menu for desktop */}
        <div className={cn("flex items-center mr-4", mobileSearch ? 'hidden' : 'flex')}>
          <Link to="/" className="flex items-center space-x-2">
            <div className="flex items-center">
              <svg viewBox="0 0 24 24" className="h-6 w-6 mr-1" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="18" height="18" x="3" y="3" rx="3" fill="#FF0000" />
                <path d="M16 12L10 16V8L16 12Z" fill="white" />
              </svg>
              <span className="font-bold text-lg">VideoHub</span>
            </div>
          </Link>
        </div>

        {/* Mobile search button */}
        <div className={cn("md:hidden ml-auto mr-4", mobileSearch ? 'hidden' : 'block')}>
          <Button variant="ghost" size="icon" onClick={() => setMobileSearch(true)}>
            <Search className="h-5 w-5" />
          </Button>
        </div>

        {/* Mobile search bar */}
        {mobileSearch && (
          <div className="flex items-center w-full px-2 md:hidden">
            <Button variant="ghost" size="icon" className="mr-2" onClick={() => setMobileSearch(false)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <form onSubmit={handleSearch} className="flex-1">
              <Input
                type="search"
                placeholder="Search"
                className="w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
            </form>
          </div>
        )}

        {/* Desktop search bar */}
        <form 
          onSubmit={handleSearch}
          className={cn(
            "hidden md:flex flex-1 items-center max-w-lg mx-4",
            mobileSearch ? 'hidden' : 'md:flex'
          )}
        >
          <div className="relative w-full flex items-center">
            <div className="flex items-center w-full overflow-hidden">
              <div className="relative w-full flex">
                <Input
                  type="search"
                  placeholder="Search"
                  className="border rounded-l-full bg-muted/30 focus-visible:ring-0 focus-visible:ring-offset-0 h-10 px-4 py-2 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                />
                <Button 
                  type="submit" 
                  className="bg-secondary hover:bg-secondary/90 text-secondary-foreground h-10 rounded-l-none rounded-r-full px-5 flex items-center justify-center"
                >
                  <Search className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
          <Button type="button" variant="ghost" size="icon" className="ml-2">
            <Mic className="h-5 w-5" />
          </Button>
        </form>

        {/* Right side icons */}
        <div className={cn("flex items-center gap-1 ml-auto", mobileSearch ? 'hidden' : 'flex')}>
          <Button variant="ghost" size="icon" className="hidden sm:flex">
            <Upload className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="hidden sm:flex">
            <Bell className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}