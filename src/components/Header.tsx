// Header.tsx
import React from 'react';
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
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center border-4 border-red-500">
              <Activity className="w-8 h-8 text-red-500" strokeWidth={3} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">ETTA-ATLANTIC</h1>
              <p className="text-xs font-semibold text-gray-700 tracking-wider">MEMORIAL</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 bg-gray-100 px-3 py-2 rounded-full">
                  <User className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    {user.profile?.fullname || user.username}
                  </span>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {user.profile?.role}
                  </span>
                </div>
                <button
                  onClick={onLogout}
                  className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm">Logout</span>
                </button>
              </div>
            ) : (
              <button 
                onClick={onLoginClick}
                className="bg-blue-600 text-white px-6 py-2.5 rounded-full font-semibold hover:bg-blue-700 transition-colors shadow-md"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>

      <nav className="bg-gray-50 border-t border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <ul className="flex space-x-8 py-4">
              {['home', 'about', 'services', 'packages', 'blog', 'contact'].map((page) => (
                <li key={page}>
                  <button
                    onClick={() => onNavigate && onNavigate(page)}
                    className={`font-medium transition-colors ${
                      currentPage === page
                        ? 'text-gray-900 border-b-2 border-blue-600 pb-1'
                        : 'text-gray-700 hover:text-blue-600'
                    }`}
                  >
                    {page.toUpperCase()}
                  </button>
                </li>
              ))}
            </ul>
            <button className="bg-red-500 text-white px-6 py-2.5 rounded-full font-semibold hover:bg-red-600 transition-colors shadow-md">
              Book Appointment
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;