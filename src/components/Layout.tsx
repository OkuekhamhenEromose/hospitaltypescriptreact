import React from 'react';
import Header from './Header';
import Footer from './Footer';
import SocialButton from './SocialWidget';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
  currentPage?: string;
  onNavigate?: (page: string) => void;
  onLoginClick?: () => void;
  onProfileClick?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  currentPage = 'home', 
  onNavigate, 
  onLoginClick,
  onProfileClick,
}) => {
  const { user, logout } = useAuth();

  const handleLoginClick = () => {
    if (onLoginClick) {
      onLoginClick();
    }
  };

  const handleProfileClick = () => {
    if (onProfileClick) {
      onProfileClick();
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-white">
      <Header
        currentPage={currentPage}
        onNavigate={onNavigate}
        user={user}
        onLoginClick={handleLoginClick}
        onProfileClick={handleProfileClick}
        onLogout={handleLogout}
      />
      
      <main className="pt-24 md:pt-28 lg:pt-28">
        {children}
      </main>
      
      <Footer />
      <SocialButton />
    </div>
  );
};

export default Layout;