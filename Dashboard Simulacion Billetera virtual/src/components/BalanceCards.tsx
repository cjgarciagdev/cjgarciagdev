import React from 'react';
import '../styles/BalanceCards.css';
import { BitcoinIcon, MochcoinIcon, EthereumIcon, SolanaIcon } from '../icons';
import { btcData, mccData, ethData, solData } from './miniCharts'; // crea este archivo con los arrays de datos
import { LineChart, Line, ResponsiveContainer, YAxis, XAxis } from 'recharts';

const cards = [
  {
    name: 'Bitcoin',
    symbol: 'BTC',
    icon: BitcoinIcon, // ruta de imagen
    color: '#f2a900',
    value: '$**.**',
    percent: '+**%',
    trend: 'up',
    lineColor: '#ffe066',
    chartData: btcData, // <-- aquí
  },
  {
    name: 'Mochocoin',
    symbol: 'MCC',
    icon: MochcoinIcon,
    color: '#2962ff',
    value: '$**.**',
    percent: '+**%',
    trend: 'up',
    lineColor: '#bdbdbd',
    chartData: mccData,
  },
  {
    name: 'Ethereum',
    symbol: 'ETH',
    icon: EthereumIcon,
    color: '#627eea',
    value: '$**.**',
    percent: '+**%',
    trend: 'up',
    lineColor: '#1e40af',
    chartData: ethData,
  },
  {
    name: 'Solana',
    symbol: 'SOL',
    icon: SolanaIcon,
    color: '#00ffb9',
    value: '$**.**',
    percent: '-**%',
    trend: 'down',
    lineColor: '#00ffb9',
    chartData: solData,
  }
];

type BalanceCardProps = {
  name: string;
  symbol: string;
  icon: string;
  color: string;
  value: string;
  percent: string;
  trend: string;
  lineColor: string;
  chartData: Array<{ name: string; value: number }>;
  selected: boolean;
  onClick: () => void;
};

const BalanceCard = ({
  name,
  symbol,
  icon,
  color,
  value,
  percent,
  trend,
  lineColor,
  chartData,
  selected,
  onClick,
}: BalanceCardProps) => (
  <div
    className={`balance-card${selected ? " selected" : ""}`}
    onClick={onClick}
    style={{ cursor: "pointer" }}
  >
    <div className="balance-card-header">
      <span className="balance-card-icon">
        <img className="balance-card-img" src={icon} alt={name} />
      </span>
      <div>
        <div className="balance-card-title">{name}</div>
        <div className="balance-card-symbol">{symbol}</div>
      </div>
      <span className="balance-card-arrow" style={{ color: trend === 'up' ? '#00e676' : '#ff1744' }}>
        {trend === 'up' ? '↗' : '↘'}
      </span>
    </div>
    {/* Mueve la gráfica y el valor más abajo */}
    <div style={{ flex: 1 }} />
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: "0.375rem" }}>
      <div className="balance-card-balance" style={{ flexShrink: 0 }}>{value}</div>
      <div style={{ flex: 1, height: 32 }}>
        <ResponsiveContainer width="100%" height={32}>
          <LineChart
            data={chartData}
            margin={{ top: 4, right: 0, left: 0, bottom: 0 }}
          >
            <Line
              type="monotone"
              dataKey="value"
              stroke={lineColor}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
            <YAxis
              type="number"
              domain={[0, 'dataMax']}
              hide={true}
            />
            <XAxis hide={true} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
    <div className="balance-card-growth" style={{ color: trend === 'up' ? '#00e676' : '#ff1744' }}>
      {percent} {trend === 'up' ? '▲' : '▼'}
    </div>
  </div>
);

// Cambia BalanceCards para recibir props
type BalanceCardsProps = {
  selected: string;
  onSelect: (symbol: string) => void;
};

const BalanceCards = ({ selected, onSelect }: BalanceCardsProps) => (
  <div className="balance-cards">
    {cards.map(card => (
      <BalanceCard
        key={card.name}
        {...card}
        selected={selected === card.symbol}
        onClick={() => onSelect(card.symbol)}
      />
    ))}
  </div>
);

export default BalanceCards;