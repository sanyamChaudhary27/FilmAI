import React from 'react';
import { LayoutDashboard, Film, Scissors, Music, Settings, HelpCircle, type LucideIcon } from 'lucide-react';

interface NavItemProps {
  icon: LucideIcon;
  label: string;
  active?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ icon: Icon, label, active }) => (
  <div className={`nav-item ${active ? 'active' : ''}`}>
    <Icon size={20} />
    <span>{label}</span>
  </div>
);

const Sidebar: React.FC = () => {
  return (
    <aside className="sidebar glass">
      <div className="logo">
        <Film className="logo-icon" size={32} />
        <h1>Film<span>AI</span></h1>
      </div>

      <nav>
        <NavItem icon={LayoutDashboard} label="Dashboard" active />
        <NavItem icon={Scissors} label="Smart Stripper" />
        <NavItem icon={Music} label="B-Roll Manager" />
      </nav>

      <div className="sidebar-footer">
        <NavItem icon={Settings} label="Settings" />
        <NavItem icon={HelpCircle} label="Help & Support" />
      </div>

      <style>{`
        .sidebar {
          width: 260px;
          height: calc(100vh - 40px);
          margin: 20px;
          display: flex;
          flex-direction: column;
          padding: 24px 16px;
          flex-shrink: 0;
        }
        
        .logo {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0 8px;
          margin-bottom: 40px;
        }
        
        .logo-icon {
          color: var(--primary);
        }
        
        .logo h1 {
          font-size: 24px;
          font-weight: 800;
          letter-spacing: -0.5px;
        }
        
        .logo span {
          color: var(--primary);
        }
        
        nav {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 12px;
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.2s ease;
          font-weight: 500;
        }
        
        .nav-item:hover {
          background: rgba(255, 255, 255, 0.05);
          color: var(--text-main);
        }
        
        .nav-item.active {
          background: var(--primary-glow);
          color: var(--text-main);
          border: 1px solid var(--glass-border);
        }
        
        .sidebar-footer {
          border-top: 1px solid var(--border);
          padding-top: 20px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
      `}</style>
    </aside>
  );
};

export default Sidebar;
