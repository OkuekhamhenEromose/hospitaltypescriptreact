// components/UniversalIcon.tsx
import React from 'react';
import * as Icons from 'lucide-react';

// Comprehensive icon map with all possible variants
const iconMap: Record<string, React.FC<any>> = {
  // Common icons
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
  Settings: Icons.Settings,
  LogOut: Icons.LogOut,
  
  // Medical icons - with multiple name variants
  Stethoscope: Icons.Stethoscope,
  Flask: Icons.FlaskConical,
  FlaskConical: Icons.FlaskConical,
  Beaker: Icons.FlaskConical, // ALIAS: Beaker -> FlaskConical
  Heart: Icons.Heart,
  Thermometer: Icons.Thermometer,
  ThermometerSun: Icons.ThermometerSun,
  Pill: Icons.Pill,
  PillBottle: Icons.Pill,
  Syringe: Icons.Syringe,
  
  // Navigation icons
  ChevDown: Icons.ChevronDown,
  ChevronDown: Icons.ChevronDown,
  ChevLeft: Icons.ChevronLeft,
  ChevronLeft: Icons.ChevronLeft,
  ChevRight: Icons.ChevronRight,
  ChevronRight: Icons.ChevronRight,
  Menu: Icons.Menu,
  
  // Chart icons
  BarChart: Icons.BarChart3,
  BarChart3: Icons.BarChart3,
  LineChart: Icons.LineChart,
  PieChart: Icons.PieChart,
  
  // Document icons
  FileText: Icons.FileText,
  File: Icons.File,
  Clipboard: Icons.Clipboard,
  ClipboardList: Icons.ClipboardList,
  
  // Status icons
  Alert: Icons.AlertCircle,
  AlertCircle: Icons.AlertCircle,
  AlertTriangle: Icons.AlertTriangle,
  Info: Icons.Info,
  
  // Logo / Brand
  Logo: Icons.LayoutDashboard,
  LayoutDashboard: Icons.LayoutDashboard,
};

// Fallback component when icon is missing
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
      display: 'inline-block',
      ...style 
    }} 
    className={className}
  />
);

interface UniversalIconProps {
  name: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  fallback?: React.ReactNode;
}

export const UniversalIcon: React.FC<UniversalIconProps> = ({ 
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

  if (!mounted) {
    return <div style={{ width: size, height: size }} />;
  }

  if (!name || typeof name !== 'string') {
    console.warn('UniversalIcon: Invalid name prop', name);
    return fallback ? <>{fallback}</> : <FallbackIcon size={size} className={className} style={style} />;
  }

  if (error) {
    return fallback ? <>{fallback}</> : <FallbackIcon size={size} className={className} style={style} />;
  }

  try {
    const IconComponent = iconMap[name];
    
    if (!IconComponent) {
      console.warn(`UniversalIcon: Icon "${name}" not found, using fallback`);
      return fallback ? <>{fallback}</> : <FallbackIcon size={size} className={className} style={style} />;
    }
    
    return <IconComponent size={size} className={className} style={style} />;
  } catch (err) {
    console.error(`UniversalIcon: Error rendering icon "${name}":`, err);
    setError(true);
    return fallback ? <>{fallback}</> : <FallbackIcon size={size} className={className} style={style} />;
  }
};