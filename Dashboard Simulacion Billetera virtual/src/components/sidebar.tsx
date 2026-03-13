import React from 'react';
import {
  AccountIcon,
  ChartIcon,
  WalletIcon,
  DashboardIcon,
  NewsIcon,
  SettingsIcon,
  LogoutIcon,
} from '../icons';
import '../styles/Sidebar.css';

const menuItems = [
  { icon: DashboardIcon, label: 'Dashboard' },
  { icon: AccountIcon, label: 'Account' },
  { icon: ChartIcon, label: 'Chart' },
  { icon: WalletIcon, label: 'Wallet' },
  { icon: NewsIcon, label: 'News' },
  { icon: SettingsIcon, label: 'Settings' },
];

type SidebarProps = {
  onSelect: (label: string) => void;
};

const Sidebar: React.FC<SidebarProps> = ({ onSelect }) => (
  <aside className="sidebar">
    <div className="sidebar-avatar"></div>
    <nav className="sidebar-nav">
      <ul>
        {menuItems.map((item) => (
          <li
            key={item.label}
            className="sidebar-item"
            onClick={() => onSelect(item.label)}
            style={{ cursor: 'pointer' }}
          >
            <span className="sidebar-icon">
              <img className="sidebar-icon" src={item.icon} alt={item.label} />
            </span>
            <span className="sidebar-label">{item.label}</span>
          </li>
        ))}
      </ul>
    </nav>
    <div className="sidebar-logout">
      <li className="sidebar-item">
        <span className="sidebar-icon">
          <img className="sidebar-icon" src={LogoutIcon} alt="Log out" />
        </span>
        <span className="sidebar-label">Log out</span>
      </li>
    </div>
  </aside>
);

export default Sidebar;