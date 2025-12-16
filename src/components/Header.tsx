// Header.tsx - Updated with safe guard
import React, { useState, useEffect } from "react";
import { User, LogOut, ChevronDown, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MobileNav from "./MobileNav";
import HeaderLogo from "../assets/img/etta-replace1-removebg-preview.png";
import { normalizeMediaUrl } from "../utils/mediaUrl";

interface HeaderProps {
  currentPage: string;
  onNavigate?: (page: string) => void;
  user: any; // Could be null, undefined, or user object
  onLoginClick: () => void;
  onProfileClick: () => void;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({
  currentPage,
  onNavigate,
  user, // This is undefined causing the error!
  onLoginClick,
  onProfileClick,
  onLogout,
}) => {
  // SAFE GUARD: Convert undefined to null
  const safeUser = user === undefined ? null : user;
  
  const [scrolled, setScrolled] = useState(false);
  const [hideTopSection, setHideTopSection] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Now safeUser is guaranteed to be null or an object, never undefined
  const profileImageUrl = safeUser?.profile?.profile_pix
    ? normalizeMediaUrl(safeUser.profile.profile_pix)
    : null;

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setScrolled(scrollPosition > 50);
      setHideTopSection(scrollPosition > 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
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
    navigate("/");
    if (onNavigate) {
      onNavigate("home");
    }
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6 text-gray-800" />
            </button>

            <button
              onClick={handleLogoClick}
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity cursor-pointer"
            >
              <div className="bg-white rounded-full flex items-center justify-center ml-8 mt-2">
                <img
                  src={HeaderLogo}
                  alt="Etha-Atlantic Memorial Logo"
                  className="w-12 h-12"
                />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-gray-900 tracking-tight leading-tight">
                  ETHA-ATLANTIC
                </h1>
                <p className="text-xs font-semibold text-gray-700 tracking-wider">
                  MEMORIAL
                </p>
              </div>
            </button>
          </div>

          {/* Mobile Sign In Button - Use safeUser */}
          <div>
            {!safeUser ? (
              <button
                onClick={onLoginClick}
                className="bg-blue-600 text-white px-4 py-2 rounded-full font-semibold hover:bg-blue-700 transition-all shadow-sm hover:shadow-md text-sm"
              >
                Sign In
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <div className="lg:hidden">
        <MobileNav
          isOpen={mobileMenuOpen}
          onToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
          currentPage={currentPage}
          onNavigate={onNavigate || (() => {})}
          onLogoClick={handleLogoClick}
          user={safeUser} // Pass safeUser
          onLoginClick={onLoginClick}
        />
      </div>

      {/* Desktop Header */}
      <header
        className={`hidden lg:block fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-md shadow-lg"
            : "bg-white/80 backdrop-blur-sm"
        }`}
      >
        {/* Top Section - Logo and Auth */}
        <div
          className={`border-b border-white/20 transition-all duration-300 ${
            hideTopSection
              ? "h-0 opacity-0 overflow-hidden"
              : "h-auto opacity-100"
          }`}
          style={{
            transitionProperty: "opacity, height",
            transitionDuration: "300ms",
            transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          <div className="container mx-auto px-12 py-3">
            <div className="flex items-center justify-between">
              <button
                onClick={handleLogoClick}
                className="flex items-center space-x-3 hover:opacity-80 transition-opacity cursor-pointer"
              >
                <div className="bg-white rounded-full flex items-center justify-center">
                  <img
                    src={HeaderLogo}
                    alt="Etha-Atlantic Memorial Logo"
                    className="w-8 h-8"
                  />
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

              {/* User Section - Use safeUser */}
              <div className="flex items-center space-x-4">
                {safeUser ? (
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <button
                        onClick={() =>
                          setShowProfileDropdown(!showProfileDropdown)
                        }
                        className="flex items-center space-x-2 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-gray-200 hover:shadow-md transition-all cursor-pointer"
                      >
                        {/* Profile Image - Use safeUser */}
                        {profileImageUrl ? (
                          <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                            <img
                              src={profileImageUrl}
                              alt="Profile"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                console.error(
                                  "Profile image failed to load:",
                                  profileImageUrl
                                );
                                e.currentTarget.style.display = "none";
                                const parent = e.currentTarget.parentElement;
                                if (parent) {
                                  const fallback =
                                    document.createElement("div");
                                  fallback.className =
                                    "w-full h-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center";
                                  fallback.innerHTML = `<span class="text-white text-sm font-medium">${
                                    safeUser.profile?.fullname?.charAt(0) ||
                                    safeUser.username?.charAt(0) ||
                                    "U"
                                  }</span>`;
                                  parent.appendChild(fallback);
                                }
                              }}
                            />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-sm font-medium">
                              {safeUser.profile?.fullname?.charAt(0) ||
                                safeUser.username?.charAt(0) ||
                                "U"}
                            </span>
                          </div>
                        )}

                        <div className="flex flex-col items-start min-w-0">
                          <span className="text-sm font-medium text-gray-800 truncate max-w-[120px]">
                            {safeUser.profile?.fullname || safeUser.username}
                          </span>
                          <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full font-medium">
                            {safeUser.profile?.role || "USER"}
                          </span>
                        </div>

                        <ChevronDown
                          className={`w-4 h-4 text-gray-600 transition-transform ${
                            showProfileDropdown ? "rotate-180" : ""
                          }`}
                        />
                      </button>

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
              <ul className="flex space-x-8">
                {[
                  "home",
                  "about us",
                  "services",
                  "packages",
                  "blog",
                  "contact",
                ].map((page) => (
                  <li key={page}>
                    <button
                      onClick={() => onNavigate && onNavigate(page)}
                      className={`font-semibold text-sm uppercase transition-colors relative h-14 flex items-center ${
                        currentPage === page
                          ? "text-gray-900"
                          : "text-gray-700 hover:text-blue-600"
                      }`}
                    >
                      {page}
                      {currentPage === page && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-700"></span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>

              <button className="bg-red-500 text-white px-6 py-2.5 rounded-full font-semibold hover:bg-red-600 transition-all shadow-md hover:shadow-lg flex-shrink-0">
                Book Appointment
              </button>
            </div>
          </div>
        </nav>
      </header>
    </>
  );
};

export default Header;