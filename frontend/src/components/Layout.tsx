// Layout.tsx - Updated with profile click handler
import React  from 'react';
import Header from './Header';
import Footer from './Footer';
import SocialButton from './SocialWidget';
import { useAuth } from '../contexts/AuthContext';
// import { useLocation } from 'react-router-dom';
// import EthaLogo from "../assets/img/etta-replace1-removebg-preview.png";

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
  // const Layout = () => {
  // const location = useLocation();
  // useEffect(() => {
  //   window.scrollTo(0, 0);
  // }, [location.pathname]);

  return (
    <div className="min-h-screen bg-white">
      {/* <div className='flex items-center justify-center pt-4'> */}
        <Header
        currentPage={currentPage}
        onNavigate={onNavigate}
        user={user}
        onLoginClick={handleLoginClick}
        onProfileClick={handleProfileClick}
        onLogout={handleLogout}
      />
      {/* <img src={EthaLogo} alt="Etha Logo" className="w-16 h-16" /> */}
      {/* </div> */}
      
      
      <main className="pt-24 md:pt-28 lg:pt-28"> {/* Added padding-top to account for fixed header */}
        {children}
      </main>
      
      <Footer />
      <SocialButton />
    </div>
  );
};

export default Layout;