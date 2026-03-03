// components/dashboards/AdminDashboard.tsx - FIXED VERSION
import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { apiService } from "../../services/api";

// ─── HOSPITAL BRAND PALETTE ───────────────────────────────────────────────
const C = {
  blue1: "#1378e5",
  blue2: "#177fed",
  blue3: "#0f5fc4",
  red: "#e53935",
  white: "#ffffff",
  slate: "#f0f4fa",
  muted: "#8aa0ba",
  text: "#0d1b2e",
  soft: "#e8f0fc",
  green: "#12b76a",
  amber: "#f59e0b",
  purple: "#7c3aed",
  teal: "#0d9488",
  indigo: "#4f46e5",
  orange: "#ea580c",
};

// ─── BACKEND ORIGIN ───────────────────────────────────────────────────────
const BACKEND_ORIGIN = (
  (import.meta as any).env?.VITE_API_URL ??
  "https://hospitalback-clean.onrender.com/api"
).replace(/\/api\/?$/, "");

function imgUrl(p: any): string | null {
  if (!p?.profile_pix) return null;
  return p.profile_pix.startsWith("http")
    ? p.profile_pix
    : `${BACKEND_ORIGIN}${p.profile_pix}`;
}

const STAT_DELTAS = [7, 4, 9, 3];

// ─── SVG ICON LIBRARY ─────────────────────────────────────────────────────
const I: Record<
  string,
  (p: React.SVGProps<SVGSVGElement>) => React.ReactElement
> = {
  Logo: (p) => (
    <svg viewBox="0 0 32 32" {...p}>
      <rect width="32" height="32" rx="8" fill="#177fed" />
      <path
        d="M16 6v20M6 16h20"
        stroke="#fff"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
    </svg>
  ),
  Home: (p) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...p}
    >
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  Users: (p) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...p}
    >
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87" />
      <path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  ),
  User: (p) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...p}
    >
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  UserPlus: (p) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...p}
    >
      <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="8.5" cy="7" r="4" />
      <line x1="20" y1="8" x2="20" y2="14" />
      <line x1="23" y1="11" x2="17" y2="11" />
    </svg>
  ),
  FileText: (p) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...p}
    >
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
  BarChart: (p) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...p}
    >
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
      <line x1="2" y1="20" x2="22" y2="20" />
    </svg>
  ),
  Bell: (p) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...p}
    >
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 01-3.46 0" />
    </svg>
  ),
  Search: (p) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...p}
    >
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  ),
  ChevDown: (p) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...p}
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  ),
  ChevLeft: (p) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...p}
    >
      <path d="M15 18l-6-6 6-6" />
    </svg>
  ),
  X: (p) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      {...p}
    >
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  ),
  Filter: (p) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...p}
    >
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  ),
  Download: (p) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...p}
    >
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
    </svg>
  ),
  Plus: (p) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      {...p}
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  Edit: (p) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...p}
    >
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
  Trash: (p) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...p}
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2" />
    </svg>
  ),
  Eye: (p) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...p}
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  Calendar: (p) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...p}
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  ),
  Clock: (p) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...p}
    >
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 7 12 12 15 15" />
    </svg>
  ),
  Shield: (p) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...p}
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  Stethoscope: (p) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...p}
    >
      <path d="M4.5 7.5a3 3 0 003 3M4.5 7.5H3M7.5 10.5c0 5 4 8 7 8a5 5 0 005-5" />
      <circle cx="19.5" cy="13.5" r="1.5" />
      <path d="M4.5 7.5V5a1.5 1.5 0 013 0v2.5M4.5 5a1.5 1.5 0 00-3 0v2.5" />
    </svg>
  ),
  Flask: (p) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...p}
    >
      <path d="M9 3h6M10 3v7L6.5 16.5A3 3 0 009.5 21h5a3 3 0 003-4.5L14 10V3" />
      <path d="M7.5 16h9" strokeWidth="1.4" />
    </svg>
  ),
  RefreshCw: (p) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...p}
    >
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
    </svg>
  ),
  Activity: (p) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...p}
    >
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  ),
  Check: (p) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...p}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
};

// ─── SAFE ICON COMPONENT ──────────────────────────────────────────────────
function Icon({ 
  name, 
  style 
}: { 
  name: string; 
  style?: React.CSSProperties 
}) {
  // Safety: ensure name is valid
  if (!name || typeof name !== 'string') {
    console.warn('Icon: invalid name prop', name);
    return null;
  }
  
  const IconComponent = I[name];
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }
  
  try {
    return <IconComponent style={style} />;
  } catch (error) {
    console.error(`Error rendering icon "${name}":`, error);
    return null;
  }
}

// ─── TYPES ────────────────────────────────────────────────────────────────
interface DashboardStats {
  totalPatients: number;
  totalDoctors: number;
  totalNurses: number;
  totalLabScientists: number;
  totalAppointments: number;
  blogStats: {
    total_posts: number;
    published_posts: number;
    draft_posts: number;
    posts_with_toc: number;
    toc_usage_rate: number;
  };
}

interface StaffAssignment {
  appointmentId: number;
  patientId: number;
  patientName: string;
  assignedDoctor?: any;
  assignedNurse?: any;
  assignedLab?: any;
  status: string;
  bookedAt: string;
}

// ─── STATUS MAP ────────────────────────────────────────────────────────────
const ST: Record<
  string,
  { label: string; bg: string; color: string; dot: string }
> = {
  COMPLETED: {
    label: "Completed",
    bg: "#ecfdf5",
    color: "#059669",
    dot: "#12b76a",
  },
  IN_REVIEW: {
    label: "In Review",
    bg: "#eff6ff",
    color: "#1378e5",
    dot: "#177fed",
  },
  AWAITING_RESULTS: {
    label: "Awaiting Results",
    bg: "#fffbeb",
    color: "#b45309",
    dot: "#f59e0b",
  },
  PENDING: {
    label: "Pending",
    bg: "#f8fafc",
    color: "#64748b",
    dot: "#94a3b8",
  },
  IN_PROGRESS: {
    label: "In Progress",
    bg: "#f0fdf4",
    color: "#16a34a",
    dot: "#22c55e",
  },
};

// ─── SHARED STYLES ────────────────────────────────────────────────────────
const ls: React.CSSProperties = {
  display: "block",
  fontSize: 12.5,
  fontWeight: 600,
  color: C.text,
  marginBottom: 6,
};
const is: React.CSSProperties = {
  width: "100%",
  height: 40,
  padding: "0 12px",
  border: `1.5px solid ${C.soft}`,
  borderRadius: 10,
  fontSize: 13,
  color: C.text,
  background: C.slate,
  outline: "none",
  fontFamily: "inherit",
  marginBottom: 16,
};
const ts: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  border: `1.5px solid ${C.soft}`,
  borderRadius: 10,
  fontSize: 13,
  color: C.text,
  background: C.slate,
  outline: "none",
  fontFamily: "inherit",
  resize: "vertical" as const,
  marginBottom: 16,
};

// ─── SHARED UI PRIMITIVES ─────────────────────────────────────────────────
function Avatar({
  name,
  size = 32,
  grad = `135deg,${C.blue1},${C.blue2}`,
}: {
  name: string;
  size?: number;
  grad?: string;
}) {
  const safeName = name || "?";
  const safeGrad = grad || `135deg,${C.blue1},${C.blue2}`;
  
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: `linear-gradient(${safeGrad})`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <span style={{ color: C.white, fontSize: size * 0.38, fontWeight: 600 }}>
        {safeName.charAt(0).toUpperCase()}
      </span>
    </div>
  );
}

function Pill({ status }: { status: string }) {
  const s = ST[status] || ST.PENDING;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "3px 10px",
        borderRadius: 20,
        background: s.bg,
        color: s.color,
        fontSize: 11.5,
        fontWeight: 600,
      }}
    >
      <span
        style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot }}
      />
      {s.label}
    </span>
  );
}

function Modal({
  title,
  subtitle,
  onClose,
  children,
  wide,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(13,27,46,0.55)",
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        backdropFilter: "blur(3px)",
      }}
    >
      <div
        style={{
          background: C.white,
          borderRadius: 18,
          width: "100%",
          maxWidth: wide ? 640 : 480,
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 24px 64px rgba(23,127,237,0.2)",
          fontFamily: "'DM Sans',sans-serif",
        }}
      >
        <div
          style={{
            padding: "20px 24px",
            borderBottom: `1px solid ${C.soft}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "sticky",
            top: 0,
            background: C.white,
            borderRadius: "18px 18px 0 0",
            zIndex: 1,
          }}
        >
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>
              {title}
            </div>
            {subtitle && (
              <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>
                {subtitle}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              border: "none",
              background: C.slate,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name="X" style={{ width: 14, height: 14, color: C.muted }} />
          </button>
        </div>
        <div style={{ padding: "20px 24px" }}>{children}</div>
      </div>
    </div>
  );
}

function Actions({
  onCancel,
  label,
  color = C.blue2,
  disabled = false,
}: {
  onCancel: () => void;
  label: string;
  color?: string;
  disabled?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "flex-end",
        gap: 10,
        paddingTop: 4,
      }}
    >
      <button
        type="button"
        onClick={onCancel}
        style={{
          padding: "9px 20px",
          borderRadius: 9,
          border: `1.5px solid ${C.soft}`,
          background: C.white,
          color: C.muted,
          fontSize: 13,
          fontWeight: 600,
          cursor: "pointer",
          fontFamily: "inherit",
        }}
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={disabled}
        style={{
          padding: "9px 20px",
          borderRadius: 9,
          border: "none",
          background: disabled ? C.muted : color,
          color: C.white,
          fontSize: 13,
          fontWeight: 700,
          cursor: disabled ? "not-allowed" : "pointer",
          fontFamily: "inherit",
          boxShadow: disabled ? "none" : `0 4px 12px ${color}55`,
          opacity: disabled ? 0.6 : 1,
        }}
      >
        {label}
      </button>
    </div>
  );
}

function TableCard({
  header,
  children,
}: {
  header: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: C.white,
        borderRadius: 16,
        border: `1px solid ${C.soft}`,
        overflow: "hidden",
        boxShadow: "0 2px 12px rgba(23,127,237,0.05)",
      }}
    >
      <div
        style={{ padding: "18px 22px", borderBottom: `1px solid ${C.soft}` }}
      >
        {header}
      </div>
      <div style={{ overflowX: "auto" as const }}>{children}</div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────
const AdminDashboard: React.FC = () => {
  const authContext = useAuth();
  
  // Safety check for auth context
  if (!authContext) {
    return (
      <div style={{ padding: 20, color: C.red }}>
        Error: Authentication context not available
      </div>
    );
  }
  
  const { user, logout } = authContext;
  
  const [activeTab, setActiveTab] = useState<
    "overview" | "patients" | "staff" | "assignments" | "blog"
  >("overview");
  const [collapsed, setCollapsed] = useState(false);
  
  // Initialize with safe defaults
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    totalDoctors: 0,
    totalNurses: 0,
    totalLabScientists: 0,
    totalAppointments: 0,
    blogStats: {
      total_posts: 0,
      published_posts: 0,
      draft_posts: 0,
      posts_with_toc: 0,
      toc_usage_rate: 0,
    },
  });
  
  const [staff, setStaff] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState<any>(null);
  const [availableDoctors, setAvailableDoctors] = useState<any[]>([]);
  const [availableNurses, setAvailableNurses] = useState<any[]>([]);
  const [availableLabs, setAvailableLabs] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<StaffAssignment[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [q, setQ] = useState("");
  const [error, setError] = useState<string | null>(null);

  const isAdmin = user?.profile?.role === "ADMIN";
  const sw = collapsed ? 72 : 248;

  // Safe counts with fallbacks
  const totalDoctors = stats?.totalDoctors ?? 0;
  const totalNurses = stats?.totalNurses ?? 0;
  const totalLabScientists = stats?.totalLabScientists ?? 0;
  const totalPatients = stats?.totalPatients ?? 0;
  
  const navItems = [
    { id: "overview", label: "Overview", icon: "Home", count: null },
    { id: "patients", label: "Patients", icon: "User", count: totalPatients },
    {
      id: "staff",
      label: "Staff",
      icon: "Users",
      count: totalDoctors + totalNurses + totalLabScientists,
    },
    {
      id: "assignments",
      label: "Staff Assignments",
      icon: "UserPlus",
      count: appointments?.filter((a) => a?.status !== "COMPLETED").length ?? 0,
    },
    {
      id: "blog",
      label: "Blog Management",
      icon: "FileText",
      count: blogPosts?.length ?? 0,
    },
  ];

  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        window.location.href = '/login';
        return;
      }
      
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const exp = payload.exp * 1000;
        if (exp < Date.now()) {
          try {
            await apiService.refreshToken();
          } catch {
            window.location.href = '/login';
          }
        }
      } catch {
        window.location.href = '/login';
      }
    };
    
    checkToken();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      loadData();
      loadStaff();
    }
  }, [isAdmin]);

  useEffect(() => {
    if (activeTab === "assignments") buildAssignments();
  }, [activeTab, statusFilter, appointments]);

  // FIXED: Proper retry logic for API calls
  async function loadData() {
  try {
    setLoading(true);
    setError(null);
    
    // Helper to safely fetch with proper retry on 401
    const safeFetch = async <T,>(
      fetchFn: () => Promise<T>,
      fallback: T
    ): Promise<T> => {
      try {
        return await fetchFn();
      } catch (error: any) {
        if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
          try {
            await apiService.refreshToken();
            return await fetchFn();
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
            logout();
            return fallback;
          }
        }
        console.error('Fetch error:', error);
        return fallback;
      }
    };

    // Define the expected blog stats type
    type BlogStatsType = {
      total_posts: number;
      published_posts: number;
      draft_posts: number;
      posts_with_toc: number;
      toc_usage_rate: number;
    };

    const defaultBlogStats: BlogStatsType = {
      total_posts: 0,
      published_posts: 0,
      draft_posts: 0,
      posts_with_toc: 0,
      toc_usage_rate: 0,
    };

    const [staffData, apptData, blogStats, posts] = await Promise.all([
      safeFetch(() => apiService.getStaffMembers(), []),
      safeFetch(() => apiService.getAppointments(), []),
      safeFetch(() => apiService.getBlogStats(), defaultBlogStats),
      safeFetch(() => apiService.getAllBlogPosts(), []),
    ]);

    // Ensure all data is arrays
    const safeStaffData = Array.isArray(staffData) ? staffData : [];
    const safeApptData = Array.isArray(apptData) ? apptData : [];
    const safePosts = Array.isArray(posts) ? posts : [];

    setStaff(safeStaffData);
    setAppointments(safeApptData);
    setBlogPosts(safePosts);

    // Extract unique patients from appointments
    const pm = new Map<number, any>();
    safeApptData.forEach((a: any) => {
      if (a?.patient && a.patient.id) {
        if (!pm.has(a.patient.id)) {
          pm.set(a.patient.id, {
            ...a.patient,
            appointments_count: safeApptData.filter(
              (x: any) => x?.patient?.id === a.patient.id
            ).length,
          });
        }
      }
    });

    setPatients(Array.from(pm.values()));

    // Ensure blogStats has all required properties
    const safeBlogStats: BlogStatsType = {
      total_posts: (blogStats as any)?.total_posts ?? 0,
      published_posts: (blogStats as any)?.published_posts ?? 0,
      draft_posts: (blogStats as any)?.draft_posts ?? 0,
      posts_with_toc: (blogStats as any)?.posts_with_toc ?? 0,
      toc_usage_rate: (blogStats as any)?.toc_usage_rate ?? 0,
    };

    // Set stats with safe defaults
    setStats({
      totalPatients: pm.size,
      totalDoctors: safeStaffData.filter((s: any) => s?.role === "DOCTOR").length,
      totalNurses: safeStaffData.filter((s: any) => s?.role === "NURSE").length,
      totalLabScientists: safeStaffData.filter((s: any) => s?.role === "LAB").length,
      totalAppointments: safeApptData.length,
      blogStats: safeBlogStats,
    });
  } catch (e) {
    console.error('Error loading dashboard data:', e);
    setError('Failed to load dashboard data. Please refresh.');
  } finally {
    setLoading(false);
  }
}

  async function loadStaff() {
    try {
      const [d, n, l] = await Promise.all([
        apiService.getAvailableStaff("DOCTOR").catch(() => []),
        apiService.getAvailableStaff("NURSE").catch(() => []),
        apiService.getAvailableStaff("LAB").catch(() => []),
      ]);
      setAvailableDoctors(Array.isArray(d) ? d : []);
      setAvailableNurses(Array.isArray(n) ? n : []);
      setAvailableLabs(Array.isArray(l) ? l : []);
    } catch (e) {
      console.error('Error loading staff:', e);
    }
  }

  function buildAssignments() {
    if (!Array.isArray(appointments)) {
      setAssignments([]);
      return;
    }

    const src =
      statusFilter === "all"
        ? appointments
        : appointments.filter((a) => a?.status === statusFilter);

    const newAssignments = src
      .filter((appt) => appt != null)
      .map((a: any) => {
        try {
          const getAssignedDoctor = () => {
            try {
              if (!a) return null;
              if (a.doctor) return a.doctor;
              if (a.assigned_doctor?.staff) return a.assigned_doctor.staff;
              if (a.assignments) {
                const doctorAssign = a.assignments.find(
                  (ass: any) => ass?.role === "DOCTOR"
                );
                return doctorAssign?.staff || null;
              }
              return null;
            } catch {
              return null;
            }
          };

          const getAssignedNurse = () => {
            try {
              if (!a) return null;
              if (
                a.vital_requests &&
                Array.isArray(a.vital_requests) &&
                a.vital_requests.length > 0
              ) {
                const firstVital = a.vital_requests[0];
                if (firstVital) {
                  return firstVital.assigned_to || firstVital.staff || null;
                }
              }
              if (a.assignments) {
                const nurseAssign = a.assignments.find(
                  (ass: any) => ass?.role === "NURSE"
                );
                return nurseAssign?.staff || null;
              }
              return null;
            } catch {
              return null;
            }
          };

          const getAssignedLab = () => {
            try {
              if (!a) return null;
              if (
                a.test_requests &&
                Array.isArray(a.test_requests) &&
                a.test_requests.length > 0
              ) {
                const firstTest = a.test_requests[0];
                if (firstTest) {
                  return firstTest.assigned_to || firstTest.staff || null;
                }
              }
              if (a.assignments) {
                const labAssign = a.assignments.find(
                  (ass: any) => ass?.role === "LAB"
                );
                return labAssign?.staff || null;
              }
              return null;
            } catch {
              return null;
            }
          };

          return {
            appointmentId: a?.id ?? 0,
            patientId: a?.patient?.id ?? 0,
            patientName: a?.name ?? "Unknown",
            assignedDoctor: getAssignedDoctor(),
            assignedNurse: getAssignedNurse(),
            assignedLab: getAssignedLab(),
            status: a?.status ?? "PENDING",
            bookedAt: a?.booked_at ?? new Date().toISOString(),
          };
        } catch (error) {
          return {
            appointmentId: a?.id ?? 0,
            patientId: 0,
            patientName: "Unknown",
            assignedDoctor: null,
            assignedNurse: null,
            assignedLab: null,
            status: "PENDING",
            bookedAt: new Date().toISOString(),
          };
        }
      });

    setAssignments(newAssignments);
  }

  async function handleAssign(data: any) {
    const ops = [];
    if (data.doctor_id)
      ops.push(
        apiService.assignStaff({
          appointment_id: data.appointment_id,
          staff_id: data.doctor_id,
          role: "DOCTOR",
        })
      );
    if (data.nurse_id)
      ops.push(
        apiService.assignStaff({
          appointment_id: data.appointment_id,
          staff_id: data.nurse_id,
          role: "NURSE",
        })
      );
    if (data.lab_id)
      ops.push(
        apiService.assignStaff({
          appointment_id: data.appointment_id,
          staff_id: data.lab_id,
          role: "LAB",
        })
      );
    await Promise.all(ops);
    loadData();
    buildAssignments();
  }

  function exportCSV() {
    const rows = (assignments || []).map((a) => ({
      "Appointment ID": a?.appointmentId ?? 0,
      Patient: a?.patientName ?? "Unknown",
      Doctor: a?.assignedDoctor?.fullname || "Unassigned",
      Nurse: a?.assignedNurse?.fullname || "Unassigned",
      "Lab Scientist": a?.assignedLab?.fullname || "Unassigned",
      Status: a?.status ?? "PENDING",
      Booked: a?.bookedAt
        ? new Date(a.bookedAt).toLocaleDateString()
        : "Unknown",
    }));
    if (!rows.length) return;
    const hdrs = Object.keys(rows[0]);
    const csv = [
      hdrs.join(","),
      ...rows.map((r) =>
        hdrs
          .map((h) => {
            const v = String((r as any)[h]);
            return /[,"\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
          })
          .join(",")
      ),
    ].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = `assignments_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  }

  const filteredPatients = useMemo(
    () =>
      q
        ? (patients || []).filter(
            (p) =>
              p?.fullname?.toLowerCase().includes(q.toLowerCase()) ||
              p?.user?.email?.toLowerCase().includes(q.toLowerCase())
          )
        : patients || [],
    [patients, q]
  );

  const filteredStaff = useMemo(
    () =>
      q
        ? (staff || []).filter(
            (s) =>
              s?.fullname?.toLowerCase().includes(q.toLowerCase()) ||
              s?.role?.toLowerCase().includes(q.toLowerCase())
          )
        : staff || [],
    [staff, q]
  );

  const filteredPosts = useMemo(
    () =>
      q
        ? (blogPosts || []).filter((p) =>
            p?.title?.toLowerCase().includes(q.toLowerCase())
          )
        : blogPosts || [],
    [blogPosts, q]
  );

  // ── Access guard ──────────────────────────────────────────────────────
  if (!user) {
    return (
      <div
        style={{
          fontFamily: "'DM Sans',sans-serif",
          minHeight: "100vh",
          background: C.slate,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');`}</style>
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 44,
              height: 44,
              border: `3px solid ${C.soft}`,
              borderTopColor: C.blue2,
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 14px",
            }}
          />
          <p style={{ color: C.muted, fontSize: 13 }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div
        style={{
          fontFamily: "'DM Sans',sans-serif",
          minHeight: "100vh",
          background: C.slate,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');`}</style>
        <div
          style={{
            background: C.white,
            borderRadius: 18,
            padding: "40px 48px",
            textAlign: "center",
            boxShadow: "0 24px 64px rgba(23,127,237,0.15)",
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "#fef2f2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <Icon name="X" style={{ width: 24, height: 24, color: C.red }} />
          </div>
          <div
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: C.text,
              marginBottom: 8,
            }}
          >
            Access Denied
          </div>
          <div style={{ fontSize: 14, color: C.muted }}>
            Admin role required to access this dashboard.
          </div>
        </div>
      </div>
    );
  }

  // ── Loading ───────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div
        style={{
          fontFamily: "'DM Sans',sans-serif",
          minHeight: "100vh",
          background: C.slate,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 44,
              height: 44,
              border: `3px solid ${C.soft}`,
              borderTopColor: C.blue2,
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 14px",
            }}
          />
          <p style={{ color: C.muted, fontSize: 13 }}>
            Loading admin dashboard…
          </p>
        </div>
      </div>
    );
  }

  // ── Error state ───────────────────────────────────────────────────────
  if (error) {
    return (
      <div
        style={{
          fontFamily: "'DM Sans',sans-serif",
          minHeight: "100vh",
          background: C.slate,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
        }}
      >
        <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');`}</style>
        <div
          style={{
            background: C.white,
            borderRadius: 18,
            padding: "40px 48px",
            textAlign: "center",
            boxShadow: "0 24px 64px rgba(23,127,237,0.15)",
            maxWidth: 400,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "#fef2f2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <Icon name="X" style={{ width: 24, height: 24, color: C.red }} />
          </div>
          <div
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: C.text,
              marginBottom: 8,
            }}
          >
            Error Loading Dashboard
          </div>
          <div style={{ fontSize: 14, color: C.muted, marginBottom: 20 }}>
            {error}
          </div>
          <button
            onClick={() => {
              setError(null);
              loadData();
            }}
            style={{
              padding: "10px 24px",
              borderRadius: 10,
              border: "none",
              background: C.blue2,
              color: C.white,
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const adminImg = imgUrl(user?.profile);

  return (
    <div
      style={{
        fontFamily: "'DM Sans',sans-serif",
        WebkitFontSmoothing: "antialiased",
        minHeight: "100vh",
        background: C.slate,
        display: "flex",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:4px;height:4px}::-webkit-scrollbar-thumb{background:${C.soft};border-radius:4px}
        .nh:hover{background:${C.soft}!important}.rh:hover{background:${C.slate}!important}
        .ch:hover{transform:translateY(-2px);box-shadow:0 8px 28px rgba(23,127,237,0.12)!important}
        .bp:hover{background:${C.blue3}!important}.gp:hover{background:#059669!important}
        .pp:hover{background:#6d28d9!important}.ip:hover{background:#4338ca!important}.op:hover{background:#c2410c!important}
        .xh:hover{background:${C.soft}!important}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fi{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        .fi{animation:fi 0.2s ease forwards}
        table{border-collapse:collapse;width:100%}
        th{padding:11px 18px;text-align:left;font-size:11.5px;font-weight:600;color:${C.muted};text-transform:uppercase;letter-spacing:0.5px;background:${C.slate};border-bottom:1px solid ${C.soft}}
        td{padding:13px 18px;font-size:13px;color:${C.text};border-bottom:1px solid ${C.soft}}
      `}</style>

      {/* ─── SIDEBAR ─────────────────────────────────────────────────── */}
      <aside
        style={{
          width: sw,
          minHeight: "100vh",
          background: C.white,
          display: "flex",
          flexDirection: "column",
          borderRight: `1px solid ${C.soft}`,
          position: "sticky",
          top: 0,
          height: "100vh",
          overflow: "hidden",
          flexShrink: 0,
          transition: "width 0.25s cubic-bezier(.4,0,.2,1)",
          boxShadow: "2px 0 10px rgba(23,127,237,0.05)",
        }}
      >
        {/* Brand */}
        <div
          style={{
            padding: "18px 14px 14px",
            borderBottom: `1px solid ${C.soft}`,
            display: "flex",
            alignItems: "center",
            gap: 10,
            minHeight: 62,
          }}
        >
          <Icon name="Logo" style={{ width: 30, height: 30, flexShrink: 0 }} />
          {!collapsed && (
            <div>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 14,
                  color: C.text,
                  lineHeight: 1.2,
                  whiteSpace: "nowrap",
                }}
              >
                Etha-Atlantic
              </div>
              <div style={{ fontSize: 11, color: C.muted }}>Admin Panel</div>
            </div>
          )}
        </div>
        {/* Nav */}
        <nav
          style={{
            flex: 1,
            padding: "10px 8px",
            display: "flex",
            flexDirection: "column",
            gap: 3,
            overflowY: "auto",
          }}
        >
          {navItems.map((n) => {
            const act = activeTab === n.id;
            return (
              <button
                key={n.id}
                className="nh"
                onClick={() => setActiveTab(n.id as any)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: collapsed ? "10px" : "10px 12px",
                  borderRadius: 10,
                  border: "none",
                  cursor: "pointer",
                  background: act ? C.soft : "transparent",
                  justifyContent: collapsed ? "center" : "flex-start",
                  transition: "all 0.15s",
                }}
              >
                <Icon
                  name={n.icon}
                  style={{
                    width: 17,
                    height: 17,
                    color: act ? C.blue2 : C.muted,
                    flexShrink: 0,
                  }}
                />
                {!collapsed && (
                  <>
                    <span
                      style={{
                        flex: 1,
                        textAlign: "left",
                        fontSize: 13,
                        fontWeight: act ? 600 : 400,
                        color: act ? C.text : C.muted,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {n.label}
                    </span>
                    {n.count !== null && (
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          minWidth: 20,
                          height: 20,
                          borderRadius: 10,
                          background: act ? C.blue2 : "#eef2f7",
                          color: act ? C.white : C.muted,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: "0 6px",
                        }}
                      >
                        {n.count}
                      </span>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </nav>
        {/* User card */}
        <div style={{ borderTop: `1px solid ${C.soft}`, padding: "10px 8px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 10px",
              borderRadius: 10,
              background: C.slate,
            }}
          >
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                background: `linear-gradient(135deg,${C.purple},#9333ea)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                overflow: "hidden",
              }}
            >
              {adminImg ? (
                <img
                  src={adminImg}
                  alt=""
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <span style={{ color: C.white, fontSize: 12, fontWeight: 600 }}>
                  {user?.profile?.fullname?.charAt(0) || "A"}
                </span>
              )}
            </div>
            {!collapsed && (
              <div style={{ flex: 1, overflow: "hidden" }}>
                <div
                  style={{
                    fontSize: 12.5,
                    fontWeight: 600,
                    color: C.text,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {user?.profile?.fullname || "Admin"}
                </div>
                <div style={{ fontSize: 11, color: C.muted }}>
                  Administrator
                </div>
              </div>
            )}
          </div>
          <button
            className="nh"
            onClick={() => setCollapsed(!collapsed)}
            style={{
              marginTop: 6,
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              padding: "7px",
              borderRadius: 8,
              border: "none",
              background: "transparent",
              cursor: "pointer",
              color: C.muted,
              fontSize: 12,
              transition: "all 0.15s",
            }}
          >
            <Icon
              name="ChevLeft"
              style={{
                width: 13,
                height: 13,
                transition: "transform 0.25s",
                transform: collapsed ? "rotate(180deg)" : "none",
              }}
            />
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>

      {/* ─── MAIN ────────────────────────────────────────────────────── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          minHeight: "100vh",
        }}
      >
        {/* Topbar */}
        <header
          style={{
            height: 64,
            background: C.white,
            borderBottom: `1px solid ${C.soft}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 24px",
            position: "sticky",
            top: 0,
            zIndex: 30,
            boxShadow: "0 2px 10px rgba(23,127,237,0.04)",
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 700, color: C.text }}>
            {navItems.find((n) => n.id === activeTab)?.label}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ position: "relative" }}>
              <Icon
                name="Search"
                style={{
                  width: 14,
                  height: 14,
                  color: C.muted,
                  position: "absolute",
                  left: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
              />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search…"
                style={{
                  paddingLeft: 30,
                  paddingRight: 12,
                  height: 36,
                  border: `1.5px solid ${C.soft}`,
                  borderRadius: 10,
                  fontSize: 13,
                  color: C.text,
                  background: C.slate,
                  outline: "none",
                  fontFamily: "inherit",
                  width: 210,
                }}
              />
            </div>
            <button
              className="xh"
              onClick={loadData}
              title="Refresh"
              style={{
                width: 36,
                height: 36,
                borderRadius: 9,
                border: `1.5px solid ${C.soft}`,
                background: C.white,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.15s",
              }}
            >
              <Icon name="RefreshCw" style={{ width: 15, height: 15, color: C.muted }} />
            </button>
            <button
              className="xh"
              style={{
                width: 36,
                height: 36,
                borderRadius: 9,
                border: `1.5px solid ${C.soft}`,
                background: C.white,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                transition: "all 0.15s",
              }}
            >
              <Icon name="Bell" style={{ width: 15, height: 15, color: C.muted }} />
              <span
                style={{
                  position: "absolute",
                  top: 6,
                  right: 6,
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: C.red,
                  border: `1.5px solid ${C.white}`,
                }}
              />
            </button>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "5px 12px 5px 5px",
                borderRadius: 24,
                background: C.slate,
                border: `1.5px solid ${C.soft}`,
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  background: `linear-gradient(135deg,${C.purple},#9333ea)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                {adminImg ? (
                  <img
                    src={adminImg}
                    alt=""
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <span
                    style={{ color: C.white, fontSize: 11, fontWeight: 600 }}
                  >
                    {user?.profile?.fullname?.charAt(0) || "A"}
                  </span>
                )}
              </div>
              <span style={{ fontSize: 12.5, fontWeight: 600, color: C.text }}>
                {user?.profile?.fullname?.split(" ")[0] || "Admin"}
              </span>
              <Icon name="ChevDown" style={{ width: 13, height: 13, color: C.muted }} />
            </div>
          </div>
        </header>

        {/* Content */}
        <main
          style={{
            flex: 1,
            overflowY: "auto",
            padding: 24,
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          {/* ── OVERVIEW ──────────────────────────────────────────────── */}
          {activeTab === "overview" && stats && (
            <div className="fi">
              {/* Stats row */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4,1fr)",
                  gap: 16,
                  marginBottom: 20,
                }}
              >
                {[
                  {
                    label: "Total Patients",
                    value: stats.totalPatients,
                    sub: "All registered",
                    grad: `135deg,${C.blue1},${C.blue2}`,
                    icon: "User",
                  },
                  {
                    label: "Doctors",
                    value: stats.totalDoctors,
                    sub: "Active physicians",
                    grad: "135deg,#059669,#10b981",
                    icon: "Stethoscope",
                  },
                  {
                    label: "Nurses",
                    value: stats.totalNurses,
                    sub: "Care staff",
                    grad: `135deg,${C.teal},#14b8a6`,
                    icon: "Shield",
                  },
                  {
                    label: "Lab Scientists",
                    value: stats.totalLabScientists,
                    sub: "Laboratory staff",
                    grad: `135deg,${C.orange},#f97316`,
                    icon: "Flask",
                  },
                ].map((s, i) => {
                  return (
                    <div
                      key={i}
                      className="ch"
                      style={{
                        background: C.white,
                        borderRadius: 14,
                        border: `1px solid ${C.soft}`,
                        padding: "18px 20px",
                        transition: "all 0.18s",
                        boxShadow: "0 2px 12px rgba(23,127,237,0.04)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          justifyContent: "space-between",
                          marginBottom: 14,
                        }}
                      >
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 11,
                            background: `linear-gradient(${s.grad})`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Icon name={s.icon} style={{ width: 18, height: 18, color: C.white }} />
                        </div>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            color: C.green,
                            background: "#ecfdf5",
                            padding: "2px 8px",
                            borderRadius: 10,
                          }}
                        >
                          +{STAT_DELTAS[i]}%
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: 28,
                          fontWeight: 700,
                          color: C.text,
                          lineHeight: 1,
                        }}
                      >
                        {s.value}
                      </div>
                      <div
                        style={{
                          fontSize: 12.5,
                          fontWeight: 600,
                          color: C.text,
                          marginTop: 4,
                        }}
                      >
                        {s.label}
                      </div>
                      <div
                        style={{ fontSize: 11.5, color: C.muted, marginTop: 2 }}
                      >
                        {s.sub}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Second row */}
              {stats.blogStats && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 16,
                  }}
                >
                  {/* Blog stats */}
                  <div
                    style={{
                      background: C.white,
                      borderRadius: 14,
                      border: `1px solid ${C.soft}`,
                      padding: "20px 22px",
                      boxShadow: "0 2px 12px rgba(23,127,237,0.04)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 18,
                      }}
                    >
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 9,
                          background: `linear-gradient(135deg,${C.purple},#9333ea)`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Icon name="BarChart" style={{ width: 15, height: 15, color: C.white }} />
                      </div>
                      <span
                        style={{ fontSize: 14, fontWeight: 700, color: C.text }}
                      >
                        Blog Statistics
                      </span>
                    </div>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 10,
                      }}
                    >
                      {[
                        {
                          label: "Total Posts",
                          value: stats.blogStats.total_posts,
                          bg: "#eff6ff",
                          color: C.blue2,
                        },
                        {
                          label: "Published",
                          value: stats.blogStats.published_posts,
                          bg: "#ecfdf5",
                          color: "#059669",
                        },
                        {
                          label: "Drafts",
                          value: stats.blogStats.draft_posts,
                          bg: "#fffbeb",
                          color: "#b45309",
                        },
                        {
                          label: "With TOC",
                          value: stats.blogStats.posts_with_toc,
                          bg: "#f5f3ff",
                          color: C.purple,
                        },
                      ].map((b, i) => (
                        <div
                          key={i}
                          style={{
                            background: b.bg,
                            borderRadius: 10,
                            padding: "12px 14px",
                            textAlign: "center",
                          }}
                        >
                          <div
                            style={{
                              fontSize: 22,
                              fontWeight: 700,
                              color: b.color,
                            }}
                          >
                            {b.value}
                          </div>
                          <div
                            style={{
                              fontSize: 11.5,
                              color: C.muted,
                              marginTop: 3,
                            }}
                          >
                            {b.label}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick actions */}
                  <div
                    style={{
                      background: C.white,
                      borderRadius: 14,
                      border: `1px solid ${C.soft}`,
                      padding: "20px 22px",
                      boxShadow: "0 2px 12px rgba(23,127,237,0.04)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: C.text,
                        marginBottom: 14,
                      }}
                    >
                      Quick Actions
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                      }}
                    >
                      {[
                        {
                          label: "Assign Staff to Patient",
                          icon: "UserPlus",
                          color: C.blue2,
                          cls: "bp",
                          tab: "assignments",
                        },
                        {
                          label: "View All Patients",
                          icon: "User",
                          color: C.green,
                          cls: "gp",
                          tab: "patients",
                        },
                        {
                          label: "Create Blog Post",
                          icon: "FileText",
                          color: C.purple,
                          cls: "pp",
                          tab: "blog",
                        },
                      ].map((a, i) => {
                        return (
                          <button
                            key={i}
                            className={a.cls}
                            onClick={() =>
                              a.tab === "blog"
                                ? (setActiveTab("blog"),
                                  setShowCreateModal(true))
                                : setActiveTab(a.tab as any)
                            }
                            style={{
                              width: "100%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              padding: "12px 14px",
                              borderRadius: 10,
                              border: "none",
                              background: a.color + "12",
                              cursor: "pointer",
                              fontFamily: "inherit",
                              transition: "all 0.15s",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                              }}
                            >
                              <Icon
                                name={a.icon}
                                style={{
                                  width: 15,
                                  height: 15,
                                  color: a.color,
                                }}
                              />
                              <span
                                style={{
                                  fontSize: 13,
                                  fontWeight: 600,
                                  color: a.color,
                                }}
                              >
                                {a.label}
                              </span>
                            </div>
                            <Icon
                              name="ChevLeft"
                              style={{
                                width: 13,
                                height: 13,
                                color: a.color,
                                transform: "rotate(180deg)",
                              }}
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Appointment summary */}
              <div
                style={{
                  background: C.white,
                  borderRadius: 14,
                  border: `1px solid ${C.soft}`,
                  padding: "18px 22px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap" as const,
                  gap: 16,
                  boxShadow: "0 2px 12px rgba(23,127,237,0.04)",
                  marginTop: 0,
                }}
              >
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>
                    Appointment Overview
                  </div>
                  <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>
                    {stats.totalAppointments} total appointments
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 20,
                    flexWrap: "wrap" as const,
                  }}
                >
                  {[
                    {
                      label: "Pending",
                      value: (appointments || []).filter(
                        (a) => a?.status === "PENDING",
                      ).length,
                      color: "#64748b",
                    },
                    {
                      label: "In Review",
                      value: (appointments || []).filter(
                        (a) => a?.status === "IN_REVIEW",
                      ).length,
                      color: C.blue2,
                    },
                    {
                      label: "Awaiting",
                      value: (appointments || []).filter(
                        (a) => a?.status === "AWAITING_RESULTS",
                      ).length,
                      color: C.amber,
                    },
                    {
                      label: "Completed",
                      value: (appointments || []).filter(
                        (a) => a?.status === "COMPLETED",
                      ).length,
                      color: C.green,
                    },
                  ].map((m, i) => (
                    <div key={i} style={{ textAlign: "center" }}>
                      <div
                        style={{
                          fontSize: 22,
                          fontWeight: 700,
                          color: m.color,
                        }}
                      >
                        {m.value}
                      </div>
                      <div style={{ fontSize: 11, color: C.muted }}>
                        {m.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── PATIENTS ──────────────────────────────────────────────── */}
          {activeTab === "patients" && (
            <div className="fi">
              <TableCard
                header={
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <div
                        style={{ fontSize: 15, fontWeight: 700, color: C.text }}
                      >
                        Patient Management
                      </div>
                      <div
                        style={{ fontSize: 12, color: C.muted, marginTop: 2 }}
                      >
                        {filteredPatients.length} registered patients
                      </div>
                    </div>
                    <button
                      className="bp"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 7,
                        padding: "9px 16px",
                        borderRadius: 10,
                        border: "none",
                        background: C.blue2,
                        color: C.white,
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: "pointer",
                        fontFamily: "inherit",
                        boxShadow: `0 4px 12px ${C.blue2}44`,
                        transition: "all 0.15s",
                      }}
                    >
                      <Icon name="Plus" style={{ width: 14, height: 14 }} />
                      Add Patient
                    </button>
                  </div>
                }
              >
                <table>
                  <thead>
                    <tr>
                      <th>Patient</th>
                      <th>Contact</th>
                      <th>Appointments</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPatients.map((p) => (
                      <tr
                        key={p?.id ?? Math.random()}
                        className="rh"
                        style={{ cursor: "pointer" }}
                      >
                        <td>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                            }}
                          >
                            <Avatar
                              name={p?.fullname || "P"}
                              size={34}
                              grad={`135deg,${C.blue1},${C.blue2}`}
                            />
                            <div>
                              <div style={{ fontWeight: 600, fontSize: 13 }}>
                                {p?.fullname ?? "Unknown"}
                              </div>
                              <div style={{ fontSize: 11.5, color: C.muted }}>
                                ID: {p?.id ?? "N/A"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div style={{ fontSize: 13 }}>
                            {p?.user?.email ?? "No email"}
                          </div>
                          <div style={{ fontSize: 11.5, color: C.muted }}>
                            {p?.phone || "No phone"}
                          </div>
                        </td>
                        <td>
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                              padding: "3px 10px",
                              borderRadius: 20,
                              background: C.soft,
                              color: C.blue2,
                              fontSize: 11.5,
                              fontWeight: 600,
                            }}
                          >
                            {p?.appointments_count ?? 0} appts
                          </span>
                        </td>
                        <td>
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 5,
                              padding: "3px 10px",
                              borderRadius: 20,
                              background: "#ecfdf5",
                              color: "#059669",
                              fontSize: 11.5,
                              fontWeight: 600,
                            }}
                          >
                            <span
                              style={{
                                width: 6,
                                height: 6,
                                borderRadius: "50%",
                                background: C.green,
                              }}
                            />
                            Active
                          </span>
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: 6 }}>
                            {[
                              { ic: "Eye", col: C.blue2 },
                              { ic: "Edit", col: C.green },
                              { ic: "Trash", col: C.red },
                            ].map((b, i) => {
                              return (
                                <button
                                  key={i}
                                  style={{
                                    width: 28,
                                    height: 28,
                                    borderRadius: 7,
                                    border: "none",
                                    background: b.col + "14",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }}
                                >
                                  <Icon
                                    name={b.ic}
                                    style={{
                                      width: 13,
                                      height: 13,
                                      color: b.col,
                                    }}
                                  />
                                </button>
                              );
                            })}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TableCard>
            </div>
          )}

          {/* ── STAFF ─────────────────────────────────────────────────── */}
          {activeTab === "staff" && (
            <div className="fi">
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3,1fr)",
                  gap: 14,
                  marginBottom: 16,
                }}
              >
                {[
                  {
                    role: "DOCTOR",
                    label: "Doctors",
                    grad: `135deg,${C.blue1},${C.blue2}`,
                    icon: "Stethoscope",
                  },
                  {
                    role: "NURSE",
                    label: "Nurses",
                    grad: `135deg,${C.teal},#14b8a6`,
                    icon: "Shield",
                  },
                  {
                    role: "LAB",
                    label: "Lab Scientists",
                    grad: `135deg,${C.orange},#f97316`,
                    icon: "Flask",
                  },
                ].map((r, i) => {
                  const cnt = (staff || []).filter(
                    (s) => s?.role === r.role,
                  ).length;
                  return (
                    <div
                      key={i}
                      style={{
                        background: C.white,
                        borderRadius: 12,
                        border: `1px solid ${C.soft}`,
                        padding: "14px 18px",
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                      }}
                    >
                      <div
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: 10,
                          background: `linear-gradient(${r.grad})`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Icon name={r.icon} style={{ width: 17, height: 17, color: C.white }} />
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: 22,
                            fontWeight: 700,
                            color: C.text,
                          }}
                        >
                          {cnt}
                        </div>
                        <div style={{ fontSize: 12, color: C.muted }}>
                          {r.label}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <TableCard
                header={
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <div
                        style={{ fontSize: 15, fontWeight: 700, color: C.text }}
                      >
                        Staff Management
                      </div>
                      <div
                        style={{ fontSize: 12, color: C.muted, marginTop: 2 }}
                      >
                        {filteredStaff.length} staff members
                      </div>
                    </div>
                    <button
                      className="gp"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 7,
                        padding: "9px 16px",
                        borderRadius: 10,
                        border: "none",
                        background: C.green,
                        color: C.white,
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: "pointer",
                        fontFamily: "inherit",
                        boxShadow: `0 4px 12px ${C.green}44`,
                        transition: "all 0.15s",
                      }}
                    >
                      <Icon name="Plus" style={{ width: 14, height: 14 }} />
                      Add Staff
                    </button>
                  </div>
                }
              >
                <table>
                  <thead>
                    <tr>
                      <th>Staff Member</th>
                      <th>Role</th>
                      <th>Contact</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStaff.map((m) => {
                      const roleColor =
                        m?.role === "DOCTOR"
                          ? C.blue2
                          : m?.role === "NURSE"
                            ? C.teal
                            : C.orange;
                      return (
                        <tr key={m?.id ?? Math.random()} className="rh">
                          <td>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                              }}
                            >
                              <Avatar
                                name={m?.fullname || "S"}
                                size={34}
                                grad={
                                  m?.role === "DOCTOR"
                                    ? `135deg,${C.blue1},${C.blue2}`
                                    : m?.role === "NURSE"
                                      ? `135deg,${C.teal},#14b8a6`
                                      : `135deg,${C.orange},#f97316`
                                }
                              />
                              <div>
                                <div style={{ fontWeight: 600, fontSize: 13 }}>
                                  {m?.fullname ?? "Unknown"}
                                </div>
                                <div style={{ fontSize: 11.5, color: C.muted }}>
                                  ID: {m?.id ?? "N/A"}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span
                              style={{
                                padding: "3px 10px",
                                borderRadius: 20,
                                background: roleColor + "16",
                                color: roleColor,
                                fontSize: 11.5,
                                fontWeight: 600,
                              }}
                            >
                              {m?.role ?? "Unknown"}
                            </span>
                          </td>
                          <td>
                            <div style={{ fontSize: 13 }}>
                              {m?.user?.email ?? "No email"}
                            </div>
                            <div style={{ fontSize: 11.5, color: C.muted }}>
                              {m?.phone || "No phone"}
                            </div>
                          </td>
                          <td>
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 5,
                                padding: "3px 10px",
                                borderRadius: 20,
                                background: "#ecfdf5",
                                color: "#059669",
                                fontSize: 11.5,
                                fontWeight: 600,
                              }}
                            >
                              <span
                                style={{
                                  width: 6,
                                  height: 6,
                                  borderRadius: "50%",
                                  background: C.green,
                                }}
                              />
                              Active
                            </span>
                          </td>
                          <td>
                            <div style={{ display: "flex", gap: 6 }}>
                              {[
                                { ic: "Eye", col: C.blue2 },
                                { ic: "Edit", col: C.green },
                                { ic: "Trash", col: C.red },
                              ].map((b, i) => {
                                return (
                                  <button
                                    key={i}
                                    style={{
                                      width: 28,
                                      height: 28,
                                      borderRadius: 7,
                                      border: "none",
                                      background: b.col + "14",
                                      cursor: "pointer",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                    }}
                                  >
                                    <Icon
                                      name={b.ic}
                                      style={{
                                        width: 13,
                                        height: 13,
                                        color: b.col,
                                      }}
                                    />
                                  </button>
                                );
                              })}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </TableCard>
            </div>
          )}

          {/* ── ASSIGNMENTS ───────────────────────────────────────────── */}
          {activeTab === "assignments" && (
            <div
              className="fi"
              style={{ display: "flex", flexDirection: "column", gap: 16 }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3,1fr)",
                  gap: 14,
                }}
              >
                {[
                  {
                    label: "Doctors Assigned",
                    icon: "Stethoscope",
                    color: C.blue2,
                    count: (assignments || []).filter((a) => a?.assignedDoctor)
                      .length,
                    grad: `135deg,${C.blue1},${C.blue2}`,
                  },
                  {
                    label: "Nurses Assigned",
                    icon: "Shield",
                    color: C.teal,
                    count: (assignments || []).filter((a) => a?.assignedNurse)
                      .length,
                    grad: `135deg,${C.teal},#14b8a6`,
                  },
                  {
                    label: "Lab Scientists Assigned",
                    icon: "Flask",
                    color: C.orange,
                    count: (assignments || []).filter((a) => a?.assignedLab)
                      .length,
                    grad: `135deg,${C.orange},#f97316`,
                  },
                ].map((s, i) => {
                  const total = assignments?.length || 0;
                  const pct = total ? Math.round((s.count / total) * 100) : 0;
                  return (
                    <div
                      key={i}
                      style={{
                        background: C.white,
                        borderRadius: 14,
                        border: `1px solid ${C.soft}`,
                        padding: "18px 20px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          marginBottom: 14,
                        }}
                      >
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 10,
                            background: `linear-gradient(${s.grad})`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Icon name={s.icon} style={{ width: 16, height: 16, color: C.white }} />
                        </div>
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: C.text,
                          }}
                        >
                          {s.label}
                        </div>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-end",
                          justifyContent: "space-between",
                        }}
                      >
                        <div
                          style={{
                            fontSize: 26,
                            fontWeight: 700,
                            color: C.text,
                          }}
                        >
                          {s.count}
                          <span
                            style={{
                              fontSize: 13,
                              color: C.muted,
                              fontWeight: 400,
                            }}
                          >
                            /{total}
                          </span>
                        </div>
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: s.color,
                            background: s.color + "14",
                            padding: "3px 10px",
                            borderRadius: 10,
                          }}
                        >
                          {pct}%
                        </span>
                      </div>
                      <div
                        style={{
                          height: 4,
                          borderRadius: 2,
                          background: C.soft,
                          marginTop: 12,
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            borderRadius: 2,
                            background: `linear-gradient(${s.grad})`,
                            width: `${pct}%`,
                            transition: "width 0.6s ease",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <TableCard
                header={
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap" as const,
                      gap: 10,
                    }}
                  >
                    <div>
                      <div
                        style={{ fontSize: 15, fontWeight: 700, color: C.text }}
                      >
                        Active Appointments
                      </div>
                      <div
                        style={{ fontSize: 12, color: C.muted, marginTop: 2 }}
                      >
                        Click any row or press Assign to allocate staff
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        flexWrap: "wrap" as const,
                      }}
                    >
                      <div style={{ position: "relative" }}>
                        <Icon
                          name="Filter"
                          style={{
                            width: 13,
                            height: 13,
                            color: C.muted,
                            position: "absolute",
                            left: 10,
                            top: "50%",
                            transform: "translateY(-50%)",
                          }}
                        />
                        <select
                          onChange={(e) => setStatusFilter(e.target.value)}
                          value={statusFilter}
                          style={{
                            paddingLeft: 28,
                            paddingRight: 12,
                            height: 36,
                            border: `1.5px solid ${C.soft}`,
                            borderRadius: 10,
                            fontSize: 12.5,
                            color: C.text,
                            background: C.white,
                            outline: "none",
                            fontFamily: "inherit",
                            cursor: "pointer",
                          }}
                        >
                          <option value="all">All Status</option>
                          <option value="PENDING">Pending</option>
                          <option value="IN_REVIEW">In Review</option>
                          <option value="AWAITING_RESULTS">
                            Awaiting Results
                          </option>
                          <option value="COMPLETED">Completed</option>
                        </select>
                      </div>
                      <button
                        className="ip"
                        onClick={() => {
                          loadData();
                          buildAssignments();
                        }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 7,
                          padding: "0 14px",
                          height: 36,
                          borderRadius: 10,
                          border: "none",
                          background: C.indigo,
                          color: C.white,
                          fontSize: 12.5,
                          fontWeight: 600,
                          cursor: "pointer",
                          fontFamily: "inherit",
                          transition: "all 0.15s",
                        }}
                      >
                        <Icon name="RefreshCw" style={{ width: 13, height: 13 }} />
                        Refresh
                      </button>
                      <button
                        className="gp"
                        onClick={exportCSV}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 7,
                          padding: "0 14px",
                          height: 36,
                          borderRadius: 10,
                          border: "none",
                          background: C.green,
                          color: C.white,
                          fontSize: 12.5,
                          fontWeight: 600,
                          cursor: "pointer",
                          fontFamily: "inherit",
                          transition: "all 0.15s",
                        }}
                      >
                        <Icon name="Download" style={{ width: 13, height: 13 }} />
                        Export
                      </button>
                    </div>
                  </div>
                }
              >
                <table>
                  <thead>
                    <tr>
                      <th>Patient</th>
                      <th>Doctor</th>
                      <th>Nurse</th>
                      <th>Lab Scientist</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(appointments || [])
                      .filter((appt) => appt != null)
                      .filter(
                        (a) =>
                          statusFilter === "all" || a?.status === statusFilter
                      )
                      .map((appt) => {
                        const doctor =
                          appt?.doctor || appt?.assigned_doctor?.staff || null;
                        const nurse =
                          appt?.vital_requests?.[0]?.assigned_to ||
                          appt?.vital_requests?.[0]?.staff ||
                          appt?.assignments?.find(
                            (a: any) => a?.role === "NURSE"
                          )?.staff ||
                          null;
                        const lab =
                          appt?.test_requests?.[0]?.assigned_to ||
                          appt?.test_requests?.[0]?.staff ||
                          appt?.assignments?.find((a: any) => a?.role === "LAB")
                            ?.staff ||
                          null;

                        return (
                          <tr
                            key={appt?.id ?? Math.random()}
                            className="rh"
                            style={{ cursor: "pointer" }}
                            onClick={() => {
                              setSelectedAppt(appt);
                              setShowAssignModal(true);
                            }}
                          >
                            <td>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 10,
                                }}
                              >
                                <Avatar name={appt?.name || "P"} size={32} />
                                <div>
                                  <div
                                    style={{ fontWeight: 600, fontSize: 13 }}
                                  >
                                    {appt?.name ?? "Unknown"}
                                  </div>
                                  <div
                                    style={{ fontSize: 11.5, color: C.muted }}
                                  >
                                    Age {appt?.age ?? "?"} · 
                                    {appt?.sex === "M"
                                      ? "Male"
                                      : appt?.sex === "F"
                                        ? "Female"
                                        : "Other"}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td>
                              {doctor ? (
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 7,
                                  }}
                                >
                                  <Avatar
                                    name={doctor?.fullname || "?"}
                                    size={24}
                                    grad={`135deg,${C.blue2},${C.blue2}cc`}
                                  />
                                  <span style={{ fontSize: 13 }}>
                                    {doctor?.fullname ?? "Unknown"}
                                  </span>
                                </div>
                              ) : (
                                <span
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 5,
                                    padding: "3px 10px",
                                    borderRadius: 20,
                                    background: "#fffbeb",
                                    color: "#b45309",
                                    fontSize: 11.5,
                                    fontWeight: 600,
                                  }}
                                >
                                  <Icon name="Clock" style={{ width: 10, height: 10 }} />
                                  Unassigned
                                </span>
                              )}
                            </td>
                            <td>
                              {nurse ? (
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 7,
                                  }}
                                >
                                  <Avatar
                                    name={nurse?.fullname || "?"}
                                    size={24}
                                    grad={`135deg,${C.teal},${C.teal}cc`}
                                  />
                                  <span style={{ fontSize: 13 }}>
                                    {nurse?.fullname ?? "Unknown"}
                                  </span>
                                </div>
                              ) : (
                                <span
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 5,
                                    padding: "3px 10px",
                                    borderRadius: 20,
                                    background: "#fffbeb",
                                    color: "#b45309",
                                    fontSize: 11.5,
                                    fontWeight: 600,
                                  }}
                                >
                                  <Icon name="Clock" style={{ width: 10, height: 10 }} />
                                  Unassigned
                                </span>
                              )}
                            </td>
                            <td>
                              {lab ? (
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 7,
                                  }}
                                >
                                  <Avatar
                                    name={lab?.fullname || "?"}
                                    size={24}
                                    grad={`135deg,${C.orange},${C.orange}cc`}
                                  />
                                  <span style={{ fontSize: 13 }}>
                                    {lab?.fullname ?? "Unknown"}
                                  </span>
                                </div>
                              ) : (
                                <span
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 5,
                                    padding: "3px 10px",
                                    borderRadius: 20,
                                    background: "#fffbeb",
                                    color: "#b45309",
                                    fontSize: 11.5,
                                    fontWeight: 600,
                                  }}
                                >
                                  <Icon name="Clock" style={{ width: 10, height: 10 }} />
                                  Unassigned
                                </span>
                              )}
                            </td>
                            <td>
                              <Pill status={appt?.status ?? "PENDING"} />
                            </td>
                            <td onClick={(e) => e.stopPropagation()}>
                              <button
                                className="ip"
                                onClick={() => {
                                  setSelectedAppt(appt);
                                  setShowAssignModal(true);
                                }}
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 6,
                                  padding: "6px 12px",
                                  borderRadius: 8,
                                  border: "none",
                                  background: C.indigo,
                                  color: C.white,
                                  fontSize: 12,
                                  fontWeight: 600,
                                  cursor: "pointer",
                                  fontFamily: "inherit",
                                  transition: "all 0.15s",
                                }}
                              >
                                <Icon name="UserPlus" style={{ width: 12, height: 12 }} />
                                Assign
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </TableCard>
            </div>
          )}

          {/* ── BLOG ──────────────────────────────────────────────────── */}
          {activeTab === "blog" && (
            <div className="fi">
              <TableCard
                header={
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <div
                        style={{ fontSize: 15, fontWeight: 700, color: C.text }}
                      >
                        Blog Management
                      </div>
                      <div
                        style={{ fontSize: 12, color: C.muted, marginTop: 2 }}
                      >
                        {filteredPosts.length} posts
                      </div>
                    </div>
                    <button
                      className="op"
                      onClick={() => setShowCreateModal(true)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 7,
                        padding: "9px 16px",
                        borderRadius: 10,
                        border: "none",
                        background: C.orange,
                        color: C.white,
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: "pointer",
                        fontFamily: "inherit",
                        boxShadow: `0 4px 12px ${C.orange}44`,
                        transition: "all 0.15s",
                      }}
                    >
                      <Icon name="Plus" style={{ width: 14, height: 14 }} />
                      New Post
                    </button>
                  </div>
                }
              >
                <table>
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Author</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPosts.map((post) => (
                      <tr key={post?.id ?? Math.random()} className="rh">
                        <td style={{ maxWidth: 280 }}>
                          <div
                            style={{
                              fontWeight: 600,
                              fontSize: 13,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {post?.title ?? "Untitled"}
                          </div>
                          <div
                            style={{
                              fontSize: 11.5,
                              color: C.muted,
                              marginTop: 2,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {post?.description?.substring(0, 80) ?? ""}…
                          </div>
                        </td>
                        <td>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 7,
                            }}
                          >
                            <Avatar
                              name={post?.author?.fullname || "A"}
                              size={26}
                              grad={`135deg,${C.purple},#9333ea`}
                            />
                            <span style={{ fontSize: 13 }}>
                              {post?.author?.fullname || "Unknown"}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 5,
                              padding: "3px 10px",
                              borderRadius: 20,
                              background: post?.published
                                ? "#ecfdf5"
                                : "#fffbeb",
                              color: post?.published ? "#059669" : "#b45309",
                              fontSize: 11.5,
                              fontWeight: 600,
                            }}
                          >
                            <span
                              style={{
                                width: 6,
                                height: 6,
                                borderRadius: "50%",
                                background: post?.published ? C.green : C.amber,
                              }}
                            />
                            {post?.published ? "Published" : "Draft"}
                          </span>
                        </td>
                        <td style={{ fontSize: 12.5, color: C.muted }}>
                          {post?.created_at
                            ? new Date(post.created_at).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                }
                              )
                            : "Unknown"}
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: 6 }}>
                            {[
                              { ic: "Eye", col: C.blue2, action: "view" },
                              { ic: "Edit", col: C.green, action: "edit" },
                              { ic: "Trash", col: C.red, action: "delete" },
                            ].map((b) => {
                              if (b.action === "delete") {
                                return (
                                  <button
                                    key={b.action}
                                    onClick={async () => {
                                      if (!confirm("Delete this post?")) return;
                                      try {
                                        await apiService.deleteBlogPost(post?.slug);
                                        loadData();
                                      } catch {
                                        alert("Failed to delete.");
                                      }
                                    }}
                                    style={{
                                      width: 28,
                                      height: 28,
                                      borderRadius: 7,
                                      border: "none",
                                      background: C.red + "14",
                                      cursor: "pointer",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                    }}
                                  >
                                    <Icon
                                      name={b.ic}
                                      style={{
                                        width: 13,
                                        height: 13,
                                        color: C.red,
                                      }}
                                    />
                                  </button>
                                );
                              }
                              
                              return (
                                <button
                                  key={b.action}
                                  onClick={() => {
                                    if (b.action === "view") {
                                      window.open(`/blog/${post?.slug}`, "_blank");
                                    }
                                  }}
                                  style={{
                                    width: 28,
                                    height: 28,
                                    borderRadius: 7,
                                    border: "none",
                                    background: b.col + "14",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }}
                                >
                                  <Icon
                                    name={b.ic}
                                    style={{
                                      width: 13,
                                      height: 13,
                                      color: b.col,
                                    }}
                                  />
                                </button>
                              );
                            })}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TableCard>
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      {showAssignModal && selectedAppt && (
        <AssignModal
          appointment={selectedAppt}
          doctors={availableDoctors}
          nurses={availableNurses}
          labs={availableLabs}
          onClose={() => {
            setShowAssignModal(false);
            setSelectedAppt(null);
          }}
          onAssign={handleAssign}
        />
      )}
      {showCreateModal && (
        <CreateBlogModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadData();
          }}
        />
      )}
    </div>
  );
};

// ─── ASSIGN MODAL ─────────────────────────────────────────────────────────
const AssignModal: React.FC<{
  appointment: any;
  doctors: any[];
  nurses: any[];
  labs: any[];
  onClose: () => void;
  onAssign: (data: any) => Promise<void>;
}> = ({ appointment, doctors, nurses, labs, onClose, onAssign }) => {
  const [selDoctor, setSelDoctor] = useState(
    appointment?.doctor?.id?.toString() || ""
  );
  const [selNurse, setSelNurse] = useState(
    appointment?.vital_requests?.[0]?.assigned_to?.id?.toString() || ""
  );
  const [selLab, setSelLab] = useState(
    appointment?.test_requests?.[0]?.assigned_to?.id?.toString() || ""
  );
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selDoctor && !selNurse && !selLab) {
      alert("Please select at least one staff member.");
      return;
    }
    setSaving(true);
    try {
      await onAssign({
        appointment_id: appointment?.id,
        doctor_id: selDoctor,
        nurse_id: selNurse,
        lab_id: selLab,
        notes,
      });
      onClose();
    } catch (err: any) {
      alert(`Assignment failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  const rows = [
    {
      label: "Assign Doctor",
      icon: "Stethoscope",
      color: C.blue2,
      val: selDoctor,
      set: setSelDoctor,
      opts: doctors || [],
      prefix: "Dr. ",
    },
    {
      label: "Assign Nurse",
      icon: "Shield",
      color: C.teal,
      val: selNurse,
      set: setSelNurse,
      opts: nurses || [],
      prefix: "Nurse ",
    },
    {
      label: "Assign Lab Scientist",
      icon: "Flask",
      color: C.orange,
      val: selLab,
      set: setSelLab,
      opts: labs || [],
      prefix: "",
    },
  ];

  return (
    <Modal
      title="Assign Staff"
      subtitle={`Allocate healthcare professionals to ${appointment?.name}`}
      onClose={onClose}
      wide
    >
      <form onSubmit={handleSubmit}>
        <div
          style={{
            background: C.slate,
            borderRadius: 10,
            padding: "12px 14px",
            marginBottom: 18,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 8,
          }}
        >
          {[
            ["Patient", appointment?.name ?? "Unknown"],
            [
              "Age / Sex",
              `${appointment?.age ?? "?"} / ${appointment?.sex === "M" ? "Male" : appointment?.sex === "F" ? "Female" : "Other"}`,
            ],
            ["Status", appointment?.status?.replace(/_/g, " ") ?? "Unknown"],
            [
              "Booked",
              appointment?.booked_at
                ? new Date(appointment.booked_at).toLocaleDateString()
                : "Unknown",
            ],
          ].map(([k, v]) => (
            <div key={k}>
              <span style={{ fontSize: 11, color: C.muted }}>{k}</span>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>
                {v}
              </div>
            </div>
          ))}
        </div>
        {rows.map((row, i) => {
          return (
            <div key={i} style={{ marginBottom: 16 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  marginBottom: 7,
                }}
              >
                <Icon name={row.icon} style={{ width: 14, height: 14, color: row.color }} />
                <label style={{ ...ls, marginBottom: 0 }}>{row.label}</label>
              </div>
              <select
                value={row.val}
                onChange={(e) => row.set(e.target.value)}
                style={{
                  ...is,
                  marginBottom: 0,
                  borderColor: row.val ? row.color + "55" : C.soft,
                }}
              >
                <option value="">Select…</option>
                {row.opts.map((o: any) => (
                  <option key={o?.id ?? Math.random()} value={o?.id}>
                    {row.prefix}
                    {o?.fullname ?? "Unknown"}
                  </option>
                ))}
              </select>
            </div>
          );
        })}
        <label style={ls}>Assignment Notes (optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Special instructions for assigned staff…"
          style={ts}
        />
        <Actions
          onCancel={onClose}
          label={saving ? "Assigning…" : "Assign Staff"}
          color={C.indigo}
          disabled={saving}
        />
      </form>
    </Modal>
  );
};

// ─── CREATE BLOG MODAL ────────────────────────────────────────────────────
const CreateBlogModal: React.FC<{
  onClose: () => void;
  onSuccess: () => void;
}> = ({ onClose, onSuccess }) => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    content: "",
    published: false,
    enable_toc: true,
  });
  const [featImg, setFeatImg] = useState<File | null>(null);
  const [img1, setImg1] = useState<File | null>(null);
  const [img2, setImg2] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (
      !form.title.trim() ||
      !form.description.trim() ||
      !form.content.trim()
    ) {
      alert("Please fill all required fields.");
      return;
    }
    if (!featImg) {
      alert("Featured image is required.");
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("description", form.description);
      fd.append("content", form.content);
      fd.append("published", form.published.toString());
      fd.append("enable_toc", form.enable_toc.toString());
      fd.append("featured_image", featImg);
      if (img1) fd.append("image_1", img1);
      if (img2) fd.append("image_2", img2);

      await apiService.createBlogPost(fd);
      onSuccess();
      alert("Blog post created!");
    } catch (err: any) {
      alert(`Failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  function fileInput(
    label: string,
    req: boolean,
    onChange: (f: File | null) => void,
    color: string
  ) {
    return (
      <div>
        <label style={ls}>
          {label}
          {req && <span style={{ color: C.red }}> *</span>}
        </label>
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 14px",
            border: `1.5px dashed ${color}55`,
            borderRadius: 10,
            cursor: "pointer",
            background: color + "08",
          }}
        >
          <Icon name="Plus" style={{ width: 14, height: 14, color }} />
          <span style={{ fontSize: 12.5, color, fontWeight: 600 }}>
            Choose image…
          </span>
          <input
            type="file"
            accept="image/*"
            required={req}
            onChange={(e) => onChange(e.target.files?.[0] || null)}
            style={{ display: "none" }}
          />
        </label>
      </div>
    );
  }

  return (
    <Modal
      title="Create Blog Post"
      subtitle="Publish a new article to the hospital blog"
      onClose={onClose}
      wide
    >
      <form onSubmit={handleSubmit}>
        <label style={ls}>
          Title<span style={{ color: C.red }}> *</span>
        </label>
        <input
          required
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Enter post title"
          style={is}
        />

        <label style={ls}>
          Description<span style={{ color: C.red }}> *</span>
        </label>
        <textarea
          required
          rows={2}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Brief summary shown in blog listing"
          style={ts}
        />

        <label style={ls}>
          Content<span style={{ color: C.red }}> *</span>
        </label>
        <textarea
          required
          rows={12}
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          placeholder={
            "Write your post content using HTML.\n\nExample:\n<h2>Introduction</h2>\n<p>Your content here...</p>\n<h2>Section Two</h2>\n<p>More content...</p>"
          }
          style={{ ...ts, fontFamily: "monospace", fontSize: 12 }}
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 12,
            marginBottom: 16,
          }}
        >
          {fileInput("Featured Image", true, (f) => setFeatImg(f), C.blue2)}
          {fileInput("Image 2 (optional)", false, (f) => setImg1(f), C.green)}
          {fileInput("Image 3 (optional)", false, (f) => setImg2(f), C.purple)}
        </div>

        <div style={{ display: "flex", gap: 20, marginBottom: 20 }}>
          {(
            [
              ["published", "Publish immediately"],
              ["enable_toc", "Enable table of contents"],
            ] as const
          ).map(([key, label]) => (
            <label
              key={key}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                cursor: "pointer",
              }}
            >
              <div
                onClick={() => setForm((f) => ({ ...f, [key]: !f[key] }))}
                style={{
                  width: 36,
                  height: 20,
                  borderRadius: 10,
                  background: form[key] ? C.blue2 : C.soft,
                  position: "relative",
                  transition: "background 0.2s",
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: "50%",
                    background: C.white,
                    position: "absolute",
                    top: 3,
                    left: form[key] ? 19 : 3,
                    transition: "left 0.2s",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                  }}
                />
              </div>
              <span style={{ fontSize: 13, fontWeight: 500, color: C.text }}>
                {label}
              </span>
            </label>
          ))}
        </div>

        <Actions
          onCancel={onClose}
          label={saving ? "Creating…" : "Create Post"}
          color={C.orange}
          disabled={saving}
        />
      </form>
    </Modal>
  );
};

export default AdminDashboard;