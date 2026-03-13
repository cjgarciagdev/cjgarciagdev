import React from 'react';
import '../styles/Portfoliolist.css';
import { BitcoinIcon, MochcoinIcon, EthereumIcon, SolanaIcon, lightIcon } from '../icons';

const coins = [
  { name: 'Bitcoin', symbol: 'BTC', icon: BitcoinIcon, color: '#f2a900' },
  { name: 'Mochocoin', symbol: 'MCC', icon: MochcoinIcon, color: '#444' },
  { name: 'Solana', symbol: 'SOL', icon: SolanaIcon, color: '#00ffb9' },
  { name: 'Light', symbol: 'LTC', icon: lightIcon, color: '#aaa' },
  { name: 'Ethereum', symbol: 'ETH', icon: EthereumIcon, color: '#627eea' },
];

type PortfolioListProps = {
  selected: string;
  onSelect: (symbol: string) => void;
};

const PortfolioList: React.FC<PortfolioListProps> = ({ selected, onSelect }) => (
  <div className="portfolio-list-container">
    <div className="portfolio-title">My Portfolio</div>
    {coins.map((coin) => (
      <div
        className={`portfolio-coin-row${selected === coin.symbol ? " selected" : ""}`}
        key={coin.name}
        onClick={() => onSelect(coin.symbol)}
        style={{ cursor: "pointer" }}
      >
        <span className="portfolio-coin-icon">
          <img src={coin.icon} alt={coin.name} />
        </span>
        <div className="portfolio-coin-info">
          <div className="portfolio-coin-name">{coin.name}</div>
          <div className="portfolio-coin-symbol">{coin.symbol}</div>
        </div>
        <div className="portfolio-coin-percentage">**%</div>
      </div>
    ))}
  </div>
);

export default PortfolioList;