// Layout.tsx
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
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  currentPage = 'home', 
  onNavigate,
  onLoginClick 
}) => {
  const { user, logout } = useAuth();

  const handleLoginClick = () => {
    if (onLoginClick) {
      onLoginClick();
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
        onLogout={handleLogout}
      />
      <main>{children}</main>
      <Footer />
      <SocialButton />
    </div>
  );
};

export default Layout;