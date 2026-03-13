import React, { useState } from "react";
import "../styles/ChartSIDE.css";
import Chartb from "./chartb";
import Chartl from "./chartl";
import Chartm from "./chartm";
import Charts from "./charts";
import Charte from "./charte";
import '../styles/ChartSM.css';
import { BitcoinIcon, MochcoinIcon, EthereumIcon, SolanaIcon, lightIcon } from '../icons';
import ChartHorizontal from "./ChartHorizontal"; // ya importado

const charts = [
  Chartb,
  Chartl,
  Chartm,
  Charts,
  Charte,
];

const horizontalDatasets = [
  [
    { value: 2106, color: "red" },
    { value: 1410, color: "limegreen" },
    { value: 1200, color: "red" },
    { value: 884, color: "limegreen" },
    { value: 1000, color: "limegreen" },
    { value: 900, color: "red" },
    { value: 1400, color: "red" },
    { value: 800, color: "limegreen" },
    { value: 600, color: "limegreen" },
  ],
  [
    { value: 1800, color: "red" },
    { value: 2000, color: "limegreen" },
    { value: 1200, color: "limegreen" },
    { value: 900, color: "red" },
    { value: 700, color: "limegreen" },
    { value: 1100, color: "limegreen" },
    { value: 1300, color: "red" },
    { value: 1400, color: "red" },
    { value: 1000, color: "limegreen" },
  ],
  [
    { value: 1500, color: "limegreen" },
    { value: 1700, color: "red" },
    { value: 1300, color: "limegreen" },
    { value: 1100, color: "red" },
    { value: 900, color: "limegreen" },
    { value: 1200, color: "limegreen" },
    { value: 800, color: "red" },
    { value: 1400, color: "red" },
    { value: 1000, color: "limegreen" },
  ],
  [
    { value: 2200, color: "limegreen" },
    { value: 1800, color: "red" },
    { value: 1600, color: "limegreen" },
    { value: 1400, color: "red" },
    { value: 1000, color: "limegreen" },
    { value: 1300, color: "limegreen" },
    { value: 900, color: "red" },
    { value: 1500, color: "red" },
    { value: 1100, color: "limegreen" },
  ],
  [
    { value: 2000, color: "red" },
    { value: 2100, color: "limegreen" },
    { value: 1500, color: "limegreen" },
    { value: 1300, color: "red" },
    { value: 1100, color: "limegreen" },
    { value: 1400, color: "limegreen" },
    { value: 1200, color: "red" },
    { value: 1600, color: "red" },
    { value: 900, color: "limegreen" },
  ],
];

const Chart: React.FC = () => {
  const [chartIndex, setChartIndex] = useState<number>(0);

  const nextChart = () => {
    setChartIndex((prev) => (prev + 1) % charts.length);
  };

  const ChartComponent = charts[chartIndex];
  const horizontalData = horizontalDatasets[chartIndex % horizontalDatasets.length];

  return (
    <main className="main-content">
      <div className="char-controls">
        <button></button>
        <button></button>
      </div>
      <div className="charts-row" style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
        <div className="char-graph">
          {React.createElement(ChartComponent)}
        </div>
        <div className="char-graph">
          <ChartHorizontal data={horizontalData} />
        </div>
      </div>
      <div className="Newsetion">
        <div className="Newsetion-content">
          <div>
            <div className="Newsetion-title">
              {`New about "${["BTC", "LHT", "MMC", "SOL", "ETH",][chartIndex] || "MMC"}"`}
            </div>
            <div className="Newsetion-text">
              {[
                "Bitcoin news: Market volatility increases as BTC hits new highs.",
                "Light announces new partnerships for blockchain adoption.",
                "Lorem ipsum massa at cangue donec arcu laareet scelweisque viverra duis magna proin quisque elementum",
                "Solana ecosystem grows with new DeFi projects launching.",
                "Ethereum update: ETH 2.0 staking reaches record participation.",
              ][chartIndex] || "Lorem ipsum massa at cangue donec arcu laareet scelweisque viverra duis magna proin quisque elementum"}
            </div>
          </div>
          <img
            className="imgmnew"
            src={
              [
                BitcoinIcon,
                lightIcon,
                MochcoinIcon,
                SolanaIcon,
                EthereumIcon
              ][chartIndex] || MochcoinIcon
            }
            alt={
              [
                "Mochcoin Icon",
                "Bitcoin Icon",
                "Ethereum Icon",
                "Solana Icon",
                "Light Icon"
              ][chartIndex] || "Mochcoin Icon"
            }
            style={{ cursor: "pointer" }}
            onClick={nextChart}
          />
        </div>
      </div>
    </main>
  );
};

export default Chart;