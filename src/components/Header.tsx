// Header.tsx - Redesigned with semi-transparent overlay and collapsible top section
import React, { useState, useEffect } from 'react';
import { Activity, User, LogOut } from 'lucide-react';

interface HeaderProps {
  currentPage: string;
  onNavigate?: (page: string) => void;
  user: any;
  onLoginClick: () => void;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  currentPage, 
  onNavigate, 
  user, 
  onLoginClick, 
  onLogout 
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [hideTopSection, setHideTopSection] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setScrolled(scrollPosition > 50);
      setHideTopSection(scrollPosition > 100); // Hide top section after scrolling 100px
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center border-4 border-red-500 shadow-md">
                <Activity className="w-7 h-7 text-red-500" strokeWidth={3} />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 tracking-tight leading-tight">
                  ETTA-ATLANTIC
                </h1>
                <p className="text-xs font-semibold text-gray-700 tracking-wider">
                  MEMORIAL
                </p>
              </div>
            </div>

            {/* User Section */}
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-gray-200">
                    <User className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-800">
                      {user.profile?.fullname || user.username}
                    </span>
                    <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full font-medium">
                      {user.profile?.role}
                    </span>
                  </div>
                  <button
                    onClick={onLogout}
                    className="flex items-center space-x-1 text-gray-700 hover:text-red-600 transition-colors bg-white/50 hover:bg-white px-3 py-1.5 rounded-full"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm font-medium">Logout</span>
                  </button>
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
        <div className="container mx-auto px-4">
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
