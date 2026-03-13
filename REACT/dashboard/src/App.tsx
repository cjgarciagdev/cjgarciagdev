import React, { useState } from 'react';
import Sidebar from './components/sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Account from './components/Account';
import Chart from './components/Chart';
import Wallet from './components/Wallet';
import News from './components/News';
import Setting from './components/Settings';
import './styles/App.css';

const App = () => {
  const [selected, setSelected] = useState('Dashboard');

  return (
    <>
      <div>
        <Sidebar onSelect={setSelected} />
      </div>
      <main className='main-conten'>
        <div><Header /></div>
        <div>
          {selected === 'Dashboard' && <Dashboard />}
          {selected === 'Account' && <Account />}
          {selected === 'Chart' && <Chart />}
          {selected === 'Wallet' && <Wallet />}
          {selected === 'News' && <News />}
          {selected === 'Settings' && <Setting />}
          {/* Otros componentes */}
        </div>
      </main>
    </>
  );
};

export default App;