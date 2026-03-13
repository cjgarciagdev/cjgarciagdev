import React, { useState } from "react";
import Portfoliolist from './PortfolioList';
import Mainchartb from './Mainchartb';
import BalanceCards from "./BalanceCards";
import Mainchartm from "./Mainchartm";
import Maincharte from "./Maincharte";
import Maincharts from "./Maincharts";
import Mainchartl from "./Mainchartl";
import '../styles/Dashboard.css';

const Dashboard = () => {
  const [selectedChart, setSelectedChart] = useState("BTC");

  const renderChart = () => {
    switch (selectedChart) {
      case "BTC":
        return <Mainchartb />;
      case "MCC":
        return <Mainchartm />;
      case "ETH":
        return <Maincharte />;
      case "SOL":
        return <Maincharts />;
      case "LTC":
        return <Mainchartl />;
      default:
        return <Mainchartb />;
    }
  };

  return (
    <main className="main-content">
      <section className="dashboard-header-row">
        <div className="nouts-card">
          <div>
            <div className="nouts-header">TOTAL BALANCE</div>
            <div className="nouts-balance-row">
              <span className="nouts-balance">$**,*&nbsp;**<sup>**</sup></span>
            </div>
          </div>
          <div className="nouts-stats-row">
            <div className="nouts-stat">
              <div className="nouts-stat-label">Today</div>
              <div className="nouts-stat-value nouts-down">-**% <span>↘</span></div>
            </div>
            <div className="nouts-stat">
              <div className="nouts-stat-label">7 Days</div>
              <div className="nouts-stat-value nouts-up">+**% <span>↗</span></div>
            </div>
            <div className="nouts-stat">
              <div className="nouts-stat-label">30 Days</div>
              <div className="nouts-stat-value nouts-up">+**% <span>↗</span></div>
            </div>
          </div>
        </div>
        <div className="balance-cards"> <BalanceCards selected={selectedChart} onSelect={setSelectedChart} /></div>
      </section>
      <section className="dashboard-main-row">

        <div className="portfolio">
          <Portfoliolist selected={selectedChart} onSelect={setSelectedChart} />
        </div>

        <div className="mainchart">{renderChart()}</div>

      </section>
    </main>
  );
};

export default Dashboard;