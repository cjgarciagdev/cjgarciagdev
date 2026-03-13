import React, { useState } from "react";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Bar, Area
} from 'recharts';
import '../styles/MainchartDB.css';

const data = [
    { name: '00:00', value: 1234, bar: 20 },
    { name: '00:10', value: 8765, bar: 30 },
    { name: '00:20', value: 4321, bar: 25 },
    { name: '00:30', value: 13987, bar: 40 },
    { name: '00:40', value: 5678, bar: 35 },
    { name: '00:50', value: 12000, bar: 50 },
    { name: '01:00', value: 9000, bar: 45 },
    { name: '01:10', value: 14000, bar: 60 },
    { name: '01:20', value: 3500, bar: 55 },
    { name: '01:30', value: 11000, bar: 70 },
    { name: '01:40', value: 7000, bar: 65 },
    { name: '01:50', value: 13500, bar: 80 },
    { name: '02:00', value: 8000, bar: 75 },
    { name: '02:10', value: 2000, bar: 90 },
    { name: '02:20', value: 9500, bar: 85 },
    { name: '02:30', value: 4000, bar: 100 },
    { name: '02:40', value: 12300, bar: 95 },
    { name: '02:50', value: 6700, bar: 110 },
    { name: '03:00', value: 1400, bar: 105 },
    { name: '03:10', value: 13400, bar: 120 },
    { name: '03:20', value: 1200, bar: 115 },
    { name: '03.30', value: 10000, bar: 130 },
    { name: '03:40', value: 800, bar: 125 },
    { name: '03:50', value: 7000, bar: 140 },
    { name: '04:00', value: 6000, bar: 135 },
    { name: '04:10', value: 14000, bar: 150 },
    { name: '04:20', value: 900, bar: 145 },
    { name: '04:30', value: 13000, bar: 140 },
    { name: '04:40', value: 11000, bar: 135 },
    { name: '04:50', value: 5000, bar: 130 },
    { name: '05:00', value: 3000, bar: 125 },
    { name: '05:10', value: 12500, bar: 120 },
    { name: '05:20', value: 400, bar: 115 },
    { name: '05:30', value: 14000, bar: 110 },
    { name: '05.40', value: 1000, bar: 105 },
    { name: '05.50', value: 8000, bar: 100 },
    { name: '06.00', value: 2000, bar: 95 },
    { name: '06.10', value: 700, bar: 90 },
    { name: '06.20', value: 9000, bar: 85 },
    { name: '06.30', value: 300, bar: 80 },
    { name: '06.40', value: 11000, bar: 75 },
    { name: '06.50', value: 12000, bar: 70 },
    { name: '07:00', value: 600, bar: 65 },
    { name: '07:10', value: 13000, bar: 60 },
    { name: '07:20', value: 1400, bar: 55 },
    { name: '07:30', value: 7000, bar: 50 },
    { name: '07:40', value: 900, bar: 45 },
    { name: '07:50', value: 8000, bar: 40 },
    { name: '08:00', value: 12000, bar: 35 },
    { name: '08:10', value: 1300, bar: 30 },
    { name: '08.20', value: 14000, bar: 25 },
    { name: '08.30', value: 500, bar: 20 },
    { name: '08.40', value: 10000, bar: 15 },
    { name: '08.50', value: 2000, bar: 10 },
    { name: '09.00', value: 9000, bar: 12 },
    { name: '09.10', value: 300, bar: 14 },
    { name: '09.20', value: 12000, bar: 16 },
    { name: '09.30', value: 1000, bar: 18 },
    { name: '09.40', value: 14000, bar: 20 },
    { name: '09.50', value: 700, bar: 22 },
    { name: '10.00', value: 8000, bar: 24 },
    { name: '10.10', value: 600, bar: 26 },
    { name: '10.20', value: 13000, bar: 28 },
    { name: '10.30', value: 400, bar: 30 },
    { name: '10.40', value: 9000, bar: 32 },
    { name: '10.50', value: 2000, bar: 34 },
    { name: '11.00', value: 11000, bar: 36 },
    { name: '11.10', value: 1200, bar: 38 },
    { name: '11.20', value: 14000, bar: 40 },
    { name: '11.30', value: 1300, bar: 42 },
    { name: '11:40', value: 10000, bar: 44 },
    { name: '11:50', value: 900, bar: 46 },
    { name: '12:00', value: 8000, bar: 48 },
    { name: '12:10', value: 700, bar: 50 },
    { name: '12:20', value: 12000, bar: 52 },
    { name: '12:30', value: 600, bar: 54 },
    { name: '12:40', value: 14000, bar: 56 },
    { name: '12:50', value: 500, bar: 58 },
    { name: '13:00', value: 13000, bar: 60 },
    { name: '13:10', value: 400, bar: 62 },
    { name: '13:20', value: 9000, bar: 64 },
    { name: '13.30', value: 300, bar: 66 },
    { name: '13.40', value: 11000, bar: 68 },
    { name: '13.50', value: 2000, bar: 70 },
    { name: '14.00', value: 10000, bar: 72 },
    { name: '14.10', value: 1200, bar: 74 },
    { name: '14.20', value: 14000, bar: 76 },
    { name: '14.30', value: 1300, bar: 78 },
    { name: '14.40', value: 8000, bar: 80 },
    { name: '14.50', value: 700, bar: 82 },
    { name: '15.00', value: 12000, bar: 84 },
    { name: '15.10', value: 600, bar: 86 },
    { name: '15.20', value: 13000, bar: 88 },
    { name: '15.30', value: 400, bar: 90 },
    { name: '15.40', value: 9000, bar: 92 },
    { name: '15.50', value: 2000, bar: 94 },
    { name: '16.00', value: 11000, bar: 96 },
    { name: '16.10', value: 1200, bar: 98 },
    { name: '16.20', value: 14000, bar: 100 },
    { name: '16.30', value: 1300, bar: 102 },
    { name: '16:40', value: 10000, bar: 104 },
    { name: '16:50', value: 900, bar: 106 },
    { name: '17:00', value: 8000, bar: 108 },
    { name: '17:10', value: 700, bar: 110 },
    { name: '17:20', value: 12000, bar: 112 },
    { name: '17:30', value: 600, bar: 114 },
    { name: '17:40', value: 14000, bar: 116 },
    { name: '17:50', value: 500, bar: 118 },
    { name: '18:00', value: 13000, bar: 120 },
    { name: '18:10', value: 400, bar: 122 },
    { name: '18:20', value: 9000, bar: 124 },
    { name: '18:30', value: 300, bar: 126 },
    { name: '18:40', value: 11000, bar: 128 },
    { name: '18:50', value: 2000, bar: 130 },
    { name: '19:00', value: 10000, bar: 132 },
    { name: '19:10', value: 1200, bar: 134 },
    { name: '19:20', value: 14000, bar: 136 },
    { name: '19:30', value: 1300, bar: 138 },
    { name: '19:40', value: 8000, bar: 140 },
    { name: '19:50', value: 700, bar: 142 },
    { name: '20:00', value: 12000, bar: 144 },
    { name: '20:10', value: 600, bar: 146 },
    { name: '20:20', value: 13000, bar: 148 },
    { name: '20:30', value: 400, bar: 150 },
    { name: '20:40', value: 9000, bar: 152 },
    { name: '20:50', value: 2000, bar: 154 },
    { name: '21:00', value: 11000, bar: 156 },
    { name: '21:10', value: 1200, bar: 158 },
    { name: '21:20', value: 14000, bar: 160 },
    { name: '21:30', value: 1300, bar: 162 },
    { name: '21:40', value: 10000, bar: 164 },
    { name: '21:50', value: 900, bar: 166 },
    { name: '22:00', value: 8000, bar: 168 },
    { name: '22:10', value: 700, bar: 170 },
    { name: '22:20', value: 12000, bar: 172 },
    { name: '22:30', value: 600, bar: 174 },
    { name: '22:40', value: 14000, bar: 176 },
    { name: '22:50', value: 500, bar: 178 },
    { name: '23:00', value: 13000, bar: 180 },
];

// Simulación de datos diarios para 1 semana
const weekData = [
    { name: 'Mon', value: 32000, bar: 10 },
    { name: 'Tue', value: 35000, bar: 18 },
    { name: 'Wed', value: 30000, bar: 10 },
    { name: 'Thu', value: 42000, bar: 18 },
    { name: 'Fri', value: 39000, bar: 16 },
    { name: 'Sat', value: 37000, bar: 14 },
    { name: 'Sun', value: 41000, bar: 15 },
];

const monthData = [
    { name: 'S1', value: 32000, bar: 10 },
    { name: 'S2', value: 35000, bar: 18 },
    { name: 'S3', value: 30000, bar: 10 },
    { name: 'S4', value: 42000, bar: 18 },
];

// Simulación de tasas de cambio
const USD_TO_EUR = 1.3; // Ejemplo de tasa de cambio USD a EUR

const Maincharts = () => {
    const [range, setRange] = useState<'1h' | '3h' | '1d' | '1w' | '1m'>('1h');
    const [currency, setCurrency] = useState<'USD' | 'EUR'>('USD');

    let filteredData = data;
    if (range === '1h') {
        filteredData = data.slice(0, 6); // Primera hora (6 datos de 10min)
    } else if (range === '3h') {
        filteredData = data.slice(0, 18); // Tres horas (18 datos de 10min)
    } else if (range === '1d') {
        // Cada 3 horas (cada 18 datos si cada dato es 10 minutos)
        filteredData = [];
        for (let i = 0; i < data.length; i += 18) {
            filteredData.push(data[i]);
        }
    } else if (range === '1w') {
        filteredData = weekData;
    } else if (range === '1m') {
        filteredData = monthData;
    }

    // Ajustar los valores para la moneda seleccionada
    filteredData = filteredData.map(item => ({
        ...item,
        value: currency === 'USD' ? item.value : Math.round(item.value / USD_TO_EUR),
        bar: currency === 'USD' ? item.bar : Math.round(item.bar / USD_TO_EUR),
    }));

    // Ejemplo de balance
    const balanceUSD = 50000;
    const balance = currency === 'USD' ? balanceUSD : Math.round(balanceUSD * USD_TO_EUR);

    return (
        <div className="chart-card">
            <div className="chart-header-row">
                <span>Chart</span>
                <select
                    className="chart-currency"
                    value={currency}
                    onChange={e => setCurrency(e.target.value as 'USD' | 'EUR')}
                >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                </select>
            </div>
            <div className="chart-title">
                <div className="chart-controls">
                    <button className={`chart-btn${range === '1h' ? ' active' : ''}`} onClick={() => setRange('1h')}>1h</button>
                    <button className={`chart-btn${range === '3h' ? ' active' : ''}`} onClick={() => setRange('3h')}>3h</button>
                    <button className={`chart-btn${range === '1d' ? ' active' : ''}`} onClick={() => setRange('1d')}>1d</button>
                    <button className={`chart-btn${range === '1w' ? ' active' : ''}`} onClick={() => setRange('1w')}>1w</button>
                    <button className={`chart-btn${range === '1m' ? ' active' : ''}`} onClick={() => setRange('1m')}>1m</button>
                </div>
                <div className="chart-subheader">
                    <span>Solana/SOL</span>
                    <span className="chart-balance">
                        {currency === 'USD' ? '$' : '€'}
                        {balance.toLocaleString()}
                    </span>
                </div>
            </div>

            <ResponsiveContainer width="100%" height="90%" >
                <LineChart data={filteredData}>
                    <defs>
                        <linearGradient id="shadowAreaS" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#00ffb9" stopOpacity="0.35" />
                            <stop offset="70%" stopColor="#00ffb9" stopOpacity="0.10" />
                            <stop offset="100%" stopColor="#232323" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#232323" vertical={false} />
                    <XAxis dataKey="name" stroke="#bdbdbd" tick={{ fontSize: 12 }} />
                    <YAxis stroke="#bdbdbd" tick={{ fontSize: 12 }} />
                    <Tooltip
                        formatter={(value: number) =>
                            `$${value.toLocaleString()}`
                        }
                    />
                    <Bar dataKey="bar" barSize={8} fill="#232323" />
                    <Area
                        type="monotone"
                        dataKey="value"
                        stroke="none"
                        fill="url(#shadowAreaS)"
                        fillOpacity={1}
                        isAnimationActive={false}
                    />
                    <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#00ffb9"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 5, fill: "#00ffb9", stroke: "#fff", strokeWidth: 2 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default Maincharts;