// components/Modernicon.tsx
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
  Edit2: Icons.Edit2,
  Trash: Icons.Trash2,
  Trash2: Icons.Trash2,
  Eye: Icons.Eye,
  EyeOff: Icons.EyeOff,
  Calendar: Icons.Calendar,
  Clock: Icons.Clock,
  Shield: Icons.Shield,
  Activity: Icons.Activity,
  Check: Icons.Check,
  CheckCircle: Icons.CheckCircle,
  RefreshCw: Icons.RefreshCw,
  Settings: Icons.Settings,
  LogOut: Icons.LogOut,
  LogIn: Icons.LogIn,

  // Medical icons
  Stethoscope: Icons.Stethoscope,
  Flask: Icons.FlaskConical,
  FlaskConical: Icons.FlaskConical,
  Beaker: Icons.FlaskConical,
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
  ChevUp: Icons.ChevronUp,
  ChevronUp: Icons.ChevronUp,
  Menu: Icons.Menu,
  MoreVertical: Icons.MoreVertical,
  MoreHorizontal: Icons.MoreHorizontal,

  // Chart icons
  BarChart: Icons.BarChart3,
  BarChart3: Icons.BarChart3,
  LineChart: Icons.LineChart,
  PieChart: Icons.PieChart,
  TrendingUp: Icons.TrendingUp,
  TrendingDown: Icons.TrendingDown,

  // Document icons
  File: Icons.File,
  Clipboard: Icons.Clipboard,
  ClipboardList: Icons.ClipboardList,
  Folder: Icons.Folder,
  FolderOpen: Icons.FolderOpen,

  // Status icons
  Alert: Icons.AlertCircle,
  AlertCircle: Icons.AlertCircle,
  AlertTriangle: Icons.AlertTriangle,
  Info: Icons.Info,
  HelpCircle: Icons.HelpCircle,

  // Actions
  Send: Icons.Send,
  Mail: Icons.Mail,
  Phone: Icons.Phone,
  MessageSquare: Icons.MessageSquare,
  Share: Icons.Share2,
  Share2: Icons.Share2,
  Copy: Icons.Copy,
  Save: Icons.Save,
  Upload: Icons.Upload,

  // Logo / Brand
  Logo: Icons.LayoutDashboard,
  LayoutDashboard: Icons.LayoutDashboard,
  Database: Icons.Database,
  Server: Icons.Server,

  // Misc
  Star: Icons.Star,
  StarFilled: Icons.Star,
  Image: Icons.Image,
  Lock: Icons.Lock,
  Unlock: Icons.Unlock,
  Key: Icons.Key,
  Wifi: Icons.Wifi,
  WifiOff: Icons.WifiOff,
};

// Fallback component when icon is missing
const FallbackIcon: React.FC<{ 
  size?: number; 
  className?: string; 
  style?: React.CSSProperties 
}> = ({ 
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
    return <div style={{ width: size, height: size, display: 'inline-block' }} />;
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

// Export default for backwards compatibility
export default UniversalIcon;