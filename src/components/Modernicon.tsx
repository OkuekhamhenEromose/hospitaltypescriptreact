import React from 'react';
import { Home, Users, User, UserPlus, FileText, BarChart3, Bell, Search, ChevronDown, ChevronLeft, X, Filter, Download, Plus, CreditCard as Edit, Trash2, Eye, Calendar, Clock, Shield, Activity, Check, RefreshCw, Stethoscope, FlaskConical, LayoutDashboard, Settings, LogOut } from 'lucide-react';

const iconMap = {
  Home,
  Users,
  User,
  UserPlus,
  FileText,
  BarChart: BarChart3,
  Bell,
  Search,
  ChevDown: ChevronDown,
  ChevLeft: ChevronLeft,
  X,
  Filter,
  Download,
  Plus,
  Edit,
  Trash: Trash2,
  Eye,
  Calendar,
  Clock,
  Shield,
  Activity,
  Check,
  RefreshCw,
  Stethoscope,
  Flask: FlaskConical,
  Logo: LayoutDashboard,
  Settings,
  LogOut,
};

interface ModernIconProps {
  name: keyof typeof iconMap;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const ModernIcon: React.FC<ModernIconProps> = ({
  name,
  size = 20,
  className = '',
  style
}) => {
  const IconComponent = iconMap[name];

  if (!IconComponent) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }

  return <IconComponent size={size} className={className} style={style} />;
};
