// components/SafeIcon.tsx
import React from 'react';
import * as Icons from 'lucide-react';

// Create a comprehensive icon map with aliases
const iconMap: Record<string, React.FC<any>> = {
  // Direct mappings
  Home: Icons.Home,
  Users: Icons.Users,
  User: Icons.User,
  UserPlus: Icons.UserPlus,
  FileText: Icons.FileText,
  Bell: Icons.Bell,
  Search: Icons.Search,
  X: Icons.X,
  Filter: Icons.Filter,
  Download: Icons.Download,
  Plus: Icons.Plus,
  Edit: Icons.Edit,
  Trash: Icons.Trash2,
  Eye: Icons.Eye,
  Calendar: Icons.Calendar,
  Clock: Icons.Clock,
  Shield: Icons.Shield,
  Activity: Icons.Activity,
  Check: Icons.Check,
  RefreshCw: Icons.RefreshCw,
  Stethoscope: Icons.Stethoscope,
  Settings: Icons.Settings,
  LogOut: Icons.LogOut,
  
  // Aliases
  BarChart: Icons.BarChart3,
  Flask: Icons.FlaskConical,
  Logo: Icons.LayoutDashboard,
  ChevDown: Icons.ChevronDown,
  ChevLeft: Icons.ChevronLeft,
  
  // Additional fallbacks for common variations
  Dashboard: Icons.LayoutDashboard,
  'Bar-Chart': Icons.BarChart3,
  'Flask-Conical': Icons.FlaskConical,
};

// Fallback icon component
const FallbackIcon: React.FC<{ size?: number; className?: string; style?: React.CSSProperties }> = ({ 
  size = 20, 
  className = '', 
  style 
}) => (
  <div 
    style={{ 
      width: size, 
      height: size, 
      backgroundColor: '#e5e7eb',
      borderRadius: '4px',
      ...style 
    }} 
    className={className}
  />
);

interface SafeIconProps {
  name: string; // Use string for flexibility
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  fallback?: React.ReactNode;
}

export const SafeIcon: React.FC<SafeIconProps> = ({ 
  name, 
  size = 20, 
  className = '', 
  style,
  fallback 
}) => {
  const [mounted, setMounted] = React.useState(false);
  const [error, setError] = React.useState(false);
  
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render on server to avoid hydration issues
  if (!mounted) {
    return <div style={{ width: size, height: size }} />;
  }

  // Validate input
  if (!name || typeof name !== 'string') {
    console.warn('SafeIcon: Invalid name prop', name);
    return fallback ? <>{fallback}</> : <FallbackIcon size={size} className={className} style={style} />;
  }

  // If we've already errored, show fallback
  if (error) {
    return fallback ? <>{fallback}</> : <FallbackIcon size={size} className={className} style={style} />;
  }

  try {
    const IconComponent = iconMap[name];
    
    if (!IconComponent) {
      console.warn(`SafeIcon: Icon "${name}" not found, using fallback`);
      return fallback ? <>{fallback}</> : <FallbackIcon size={size} className={className} style={style} />;
    }
    
    return <IconComponent size={size} className={className} style={style} />;
  } catch (err) {
    console.error(`SafeIcon: Error rendering icon "${name}":`, err);
    setError(true);
    return fallback ? <>{fallback}</> : <FallbackIcon size={size} className={className} style={style} />;
  }
};