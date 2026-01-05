import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Package, 
  Wrench, 
  Truck, 
  Users, 
  LayoutDashboard, 
  HandCoins,
  ChevronLeft,
  ChevronRight,
  LogOut,
  FileText,
  Monitor,
  Bell,
  Shirt,
  Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import fesaLogo from '@/assets/fesa-logo.png';
import fesaIcon from '@/assets/fesa-icon.png';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard, rolesAllowed: ['admin', 'technician', 'bodeguero'], supervisorLabel: 'Mi Dashboard' },
  { name: 'Materiales', href: '/materials', icon: Package, rolesAllowed: ['admin', 'technician', 'bodeguero', 'supervisor'] },
  { name: 'Ropa y Uniformes', href: '/clothing', icon: Shirt, rolesAllowed: ['admin', 'technician', 'bodeguero', 'supervisor'] },
  { name: 'EPP', href: '/epp', icon: Shield, rolesAllowed: ['admin', 'technician', 'bodeguero', 'supervisor'] },
  { name: 'Herramientas', href: '/tools', icon: Wrench, rolesAllowed: ['admin', 'technician', 'bodeguero', 'supervisor'] },
  { name: 'Equipos', href: '/equipments', icon: Monitor, rolesAllowed: ['admin', 'technician', 'bodeguero', 'supervisor'] },
  { name: 'Equipos en Reparación', href: '/equipment-repairs', icon: Wrench, rolesAllowed: ['admin', 'technician', 'bodeguero', 'supervisor'] },
  { name: 'Préstamos', href: '/loans', icon: HandCoins, rolesAllowed: ['admin', 'technician', 'bodeguero', 'supervisor'] },
  { name: 'Solicitudes', href: '/material-requests', icon: FileText, rolesAllowed: ['admin', 'supervisor', 'bodeguero'] },
  { name: 'Vehículos', href: '/vehicles', icon: Truck, rolesAllowed: ['admin', 'technician', 'bodeguero', 'supervisor'] },
  { name: 'Notificaciones', href: '/notifications', icon: Bell, rolesAllowed: ['admin', 'supervisor', 'technician', 'bodeguero'] },
  { name: 'Usuarios', href: '/users', icon: Users, adminOnly: true },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { userProfile, signOut } = useAuth();

  const filteredNav = navigation.filter(item => {
    if (item.adminOnly && userProfile?.role !== 'admin') return false;
    if (item.rolesAllowed && !item.rolesAllowed.includes(userProfile?.role || '')) return false;
    return true;
  });

  return (
    <aside className={cn(
      "fixed left-0 top-0 h-screen bg-sidebar text-sidebar-foreground transition-all duration-300 z-50 flex flex-col shadow-2xl",
      collapsed ? "w-20" : "w-64"
    )}>
      {/* Logo */}
      <div className="flex items-center justify-center h-20 border-b border-sidebar-border">
        <img 
          src={collapsed ? fesaIcon : fesaLogo} 
          alt="FESA" 
          className={cn(
            "transition-all duration-300",
            collapsed ? "h-10 w-10 object-contain" : "h-10"
          )}
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
        {filteredNav.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group",
                isActive 
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg" 
                  : "hover:bg-sidebar-accent text-sidebar-foreground/80 hover:text-sidebar-foreground"
              )}
            >
              <item.icon className={cn(
                "h-5 w-5 flex-shrink-0 transition-transform group-hover:scale-110",
                isActive && "animate-pulse-glow"
              )} />
              {!collapsed && (
                <span className="font-medium truncate">
                  {userProfile?.role === 'supervisor' && item.supervisorLabel ? item.supervisorLabel : item.name}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User info */}
      {userProfile && (
        <div className={cn(
          "px-3 py-4 border-t border-sidebar-border",
          collapsed ? "text-center" : ""
        )}>
          {!collapsed && (
            <div className="px-4 mb-3">
              <p className="font-semibold text-sm truncate">{userProfile.name}</p>
              <p className="text-xs text-sidebar-foreground/60 capitalize">{userProfile.role}</p>
            </div>
          )}
          <button
            onClick={signOut}
            className={cn(
              "flex items-center gap-3 px-4 py-2 rounded-lg transition-colors w-full",
              "hover:bg-destructive/20 text-sidebar-foreground/70 hover:text-destructive",
              collapsed && "justify-center"
            )}
          >
            <LogOut className="h-5 w-5" />
            {!collapsed && <span className="text-sm">Cerrar sesión</span>}
          </button>
        </div>
      )}

      {/* Collapse button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-24 bg-primary text-primary-foreground rounded-full p-1.5 shadow-lg hover:scale-110 transition-transform"
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>
    </aside>
  );
}
