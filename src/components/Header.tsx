// Header.tsx - Updated with logo click navigation to homepage
import React, { useState, useEffect } from 'react';
import { User, LogOut, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import HeaderLogo from "../assets/img/etta-replace1-removebg-preview.png"

interface HeaderProps {
  currentPage: string;
  onNavigate?: (page: string) => void;
  user: any;
  onLoginClick: () => void;
  onProfileClick: () => void;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  currentPage, 
  onNavigate, 
  user, 
  onLoginClick, 
  onProfileClick,
  onLogout 
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [hideTopSection, setHideTopSection] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [imageError, setImageError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setScrolled(scrollPosition > 50);
      setHideTopSection(scrollPosition > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleProfileClick = () => {
    if (onProfileClick) {
      onProfileClick();
    }
    setShowProfileDropdown(false);
  };

  const handleLogout = () => {
    onLogout();
    setShowProfileDropdown(false);
  };

  // Function to handle logo click - navigate to homepage
  const handleLogoClick = () => {
    navigate('/');
    // Also call onNavigate if provided for consistency
    if (onNavigate) {
      onNavigate('home');
    }
  };

  // Function to get profile image URL
  const getProfileImageUrl = (profile: any) => {
    if (!profile?.profile_pix) return null;
    
    if (profile.profile_pix.startsWith('http')) {
      return profile.profile_pix;
    }
    
    // Assuming your media is served from localhost:8000
    return `http://localhost:8000${profile.profile_pix}`;
  };

  // Reset image error when user changes
  useEffect(() => {
    setImageError(false);
  }, [user]);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-lg' 
          : 'bg-white/80 backdrop-blur-sm'
      }`}
    >
      {/* Top Section - Logo and Auth - Collapsible */}
      <div 
        className={`border-b border-white/20 transition-all duration-300 ${
          hideTopSection 
            ? 'h-0 opacity-0 overflow-hidden' 
            : 'h-auto opacity-100'
        }`}
        style={{
          transitionProperty: 'opacity, height',
          transitionDuration: '300ms',
          transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        <div className="container mx-auto px-12 py-3">
          <div className="flex items-center justify-between">
            {/* Logo - Now clickable */}
            <button 
              onClick={handleLogoClick}
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity cursor-pointer"
            >
              <div className="bg-white rounded-full flex items-center justify-center">
                <img src={HeaderLogo} alt="ETTA-ATLANTIC Logo" className="w-16 h-16 object-contain" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 tracking-tight leading-tight">
                  ETHA-ATLANTIC
                </h1>
                <p className="text-xs font-semibold text-gray-700 tracking-wider">
                  MEMORIAL
                </p>
              </div>
            </button>

            {/* User Section */}
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-3">
                  {/* Profile Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                      className="flex items-center space-x-2 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-gray-200 hover:shadow-md transition-all cursor-pointer"
                    >
                      {/* Profile Image or Fallback Icon */}
                      {user.profile?.profile_pix && !imageError ? (
                        <div className="w-6 h-6 rounded-full overflow-hidden border border-gray-300 flex items-center justify-center">
                          <img 
                            src={getProfileImageUrl(user.profile)} 
                            alt="Profile" 
                            className="w-full h-full object-cover"
                            onError={() => setImageError(true)}
                          />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                          <span className="text-white text-xs font-medium">
                            {user.profile?.fullname?.charAt(0) || user.username?.charAt(0) || 'U'}
                          </span>
                        </div>
                      )}
                      
                      <span className="text-sm font-medium text-gray-800">
                        {user.profile?.fullname || user.username}
                      </span>
                      <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full font-medium">
                        {user.profile?.role}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${
                        showProfileDropdown ? 'rotate-180' : ''
                      }`} />
                    </button>

                    {/* Dropdown Menu */}
                    {showProfileDropdown && (
                      <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                        <button
                          onClick={handleProfileClick}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                        >
                          <User className="w-4 h-4" />
                          <span>Go to Dashboard</span>
                        </button>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center space-x-2"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Logout</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <button 
                  onClick={onLoginClick}
                  className="bg-blue-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-blue-700 transition-all shadow-md hover:shadow-lg"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Section */}
      <nav className="bg-gradient-to-r from-white/50 to-white/30 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-12">
          <div className="flex items-center justify-between h-14">
            {/* Navigation Links */}
            <ul className="flex space-x-8">
              {['home', 'about us', 'services', 'packages', 'blog', 'contact'].map((page) => (
                <li key={page}>
                  <button
                    onClick={() => onNavigate && onNavigate(page)}
                    className={`font-semibold text-sm uppercase transition-colors relative h-14 flex items-center ${
                      currentPage === page
                        ? 'text-gray-900'
                        : 'text-gray-700 hover:text-blue-600'
                    }`}
                  >
                    {page}
                    {currentPage === page && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></span>
                    )}
                  </button>
                </li>
              ))}
            </ul>

            {/* Book Appointment Button */}
            <button className="bg-red-500 text-white px-6 py-2.5 rounded-full font-semibold hover:bg-red-600 transition-all shadow-md hover:shadow-lg flex-shrink-0">
              Book Appointment
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;