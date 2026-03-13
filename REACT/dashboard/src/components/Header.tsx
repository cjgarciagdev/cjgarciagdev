import React from 'react';
import {
  MensajeIcon,
  NotifyIcon,
  AccountIcon,
} from '../icons';
import '../styles/Header.css';

const menuItems = [
  { icon: MensajeIcon, label: 'Messages' },
  { icon: NotifyIcon, label: 'Notifications' },
  { icon: AccountIcon, label: 'Profile' },
];

const Header: React.FC = () => (
  <header className="header">
    <h2 className="header__title">Dashboard</h2>
    <input
      type="text"
      placeholder="Search"
      className="header__search"
    />
    <div className="header__menu">
      {menuItems.map((item) => (
        <span key={item.label} title={item.label} className="header__menu-item">
          <img src={item.icon} alt={item.label} />
        </span>
      ))}
    </div>
  </header>
);

export default Header;