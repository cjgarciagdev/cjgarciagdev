import React, { useState } from "react";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Bar, Area
} from 'recharts';
import { BitcoinIcon } from '../icons';
import '../styles/ChartSM.css';

const data = [
    { name: '00:00', value: 30000, bar: 10 },
    { name: '00:10', value: 32000, bar: 12 },
    { name: '00:20', value: 28000, bar: 8 },
    { name: '00:30', value: 35000, bar: 18 },
    { name: '00:40', value: 37000, bar: 14 },
    { name: '00:50', value: 40000, bar: 20 },
    { name: '01:00', value: 32000, bar: 12 },
    { name: '01:10', value: 35000, bar: 18 },
    { name: '01:20', value: 30000, bar: 10 },
    { name: '01:30', value: 42000, bar: 22 },
    { name: '01:40', value: 39000, bar: 16 },
    { name: '01:50', value: 37000, bar: 14 },
    { name: '02:00', value: 41000, bar: 20 },
    { name: '02:10', value: 43000, bar: 24 },
    { name: '02:20', value: 45000, bar: 28 },
    { name: '02:30', value: 48000, bar: 30 },
    { name: '02:40', value: 47000, bar: 26 },
    { name: '02:50', value: 49000, bar: 32 },
    { name: '03:00', value: 50000, bar: 34 },
    { name: '03:10', value: 52000, bar: 36 },
    { name: '03:20', value: 54000, bar: 38 },
    { name: '03.30', value: 5600, bar: 40 },
    { name: '03:40', value: 58000, bar: 42 },
    { name: '03:50', value: 60000, bar: 44 },
    { name: '04:00', value: 62000, bar: 46 },
    { name: '04:10', value: 64000, bar: 48 },
    { name: '04:20', value: 66000, bar: 50 },
    { name: '04:30', value: 68000, bar: 52 },
    { name: '04:40', value: 70000, bar: 54 },
    { name: '04:50', value: 72000, bar: 56 },
    { name: '05:00', value: 74000, bar: 58 },
    { name: '05:10', value: 76000, bar: 60 },
    { name: '05:20', value: 78000, bar: 62 },
    { name: '05:30', value: 80000, bar: 64 },
    { name: '05.40', value: 8200, bar: 66 },
    { name: '05.50', value: 8400, bar: 68 },
    { name: '06.00', value: 8600, bar: 70 },
    { name: '06.10', value: 8800, bar: 72 },
    { name: '06.20', value: 9000, bar: 74 },
    { name: '06.30', value: 9200, bar: 76 },
    { name: '06.40', value: 9400, bar: 78 },
    { name: '06.50', value: 9600, bar: 80 },
    { name: '07:00', value: 98000, bar: 82 },
    { name: '07:10', value: 100000, bar: 84 },
    { name: '07:20', value: 102000, bar: 86 },
    { name: '07:30', value: 104000, bar: 88 },
    { name: '07:40', value: 106000, bar: 90 },
    { name: '07:50', value: 108000, bar: 92 },
    { name: '08:00', value: 110000, bar: 94 },
    { name: '08:10', value: 112000, bar: 96 },
    { name: '08.20', value: 1140, bar: 98 },
    { name: '08.30', value: 1160, bar: 100 },
    { name: '08.40', value: 1180, bar: 102 },
    { name: '08.50', value: 1200, bar: 104 },
    { name: '09.00', value: 1220, bar: 106 },
    { name: '09.10', value: 1240, bar: 108 },
    { name: '09.20', value: 1260, bar: 110 },
    { name: '09.30', value: 1280, bar: 112 },
    { name: '09.40', value: 1300, bar: 114 },
    { name: '09.50', value: 1320, bar: 116 },
    { name: '10.00', value: 1340, bar: 118 },
    { name: '10.10', value: 1360, bar: 120 },
    { name: '10.20', value: 1380, bar: 122 },
    { name: '10.30', value: 1400, bar: 124 },
    { name: '10.40', value: 1420, bar: 126 },
    { name: '10.50', value: 1440, bar: 128 },
    { name: '11.00', value: 1460, bar: 130 },
    { name: '11.10', value: 1480, bar: 132 },
    { name: '11.20', value: 1500, bar: 134 },
    { name: '11.30', value: 152000, bar: 136 },
    { name: '11:40', value: 154000, bar: 138 },
    { name: '11:50', value: 156000, bar: 140 },
    { name: '12:00', value: 158000, bar: 142 },
    { name: '12:10', value: 160000, bar: 144 },
    { name: '12:20', value: 162000, bar: 146 },
    { name: '12:30', value: 164000, bar: 148 },
    { name: '12:40', value: 166000, bar: 150 },
    { name: '12:50', value: 168000, bar: 152 },
    { name: '13:00', value: 170000, bar: 154 },
    { name: '13:10', value: 172000, bar: 156 },
    { name: '13:20', value: 174000, bar: 158 },
    { name: '13.30', value: 1760, bar: 160 },
    { name: '13.40', value: 1780, bar: 162 },
    { name: '13.50', value: 1800, bar: 164 },
    { name: '14.00', value: 1820, bar: 166 },
    { name: '14.10', value: 1840, bar: 168 },
    { name: '14.20', value: 1860, bar: 170 },
    { name: '14.30', value: 1880, bar: 172 },
    { name: '14.40', value: 1900, bar: 174 },
    { name: '14.50', value: 1920, bar: 176 },
    { name: '15.00', value: 1940, bar: 178 },
    { name: '15.10', value: 1960, bar: 180 },
    { name: '15.20', value: 1980, bar: 182 },
    { name: '15.30', value: 2000, bar: 184 },
    { name: '15.40', value: 2020, bar: 186 },
    { name: '15.50', value: 2040, bar: 188 },
    { name: '16.00', value: 2060, bar: 190 },
    { name: '16.10', value: 2080, bar: 192 },
    { name: '16.20', value: 2100, bar: 194 },
    { name: '16.30', value: 212000, bar: 196 },
    { name: '16:40', value: 214000, bar: 198 },
    { name: '16:50', value: 216000, bar: 200 },
    { name: '17:00', value: 218000, bar: 202 },
    { name: '17:10', value: 220000, bar: 204 },
    { name: '17:20', value: 222000, bar: 206 },
    { name: '17:30', value: 224000, bar: 208 },
    { name: '17:40', value: 226000, bar: 210 },
    { name: '17:50', value: 228000, bar: 212 },
    { name: '18:00', value: 230000, bar: 214 },
    { name: '18:10', value: 232000, bar: 216 },
    { name: '18:20', value: 234000, bar: 218 },
    { name: '18:30', value: 236000, bar: 220 },
    { name: '18:40', value: 238000, bar: 222 },
    { name: '18:50', value: 240000, bar: 224 },
    { name: '19:00', value: 30000, bar: 10 },
    { name: '19:10', value: 32000, bar: 12 },
    { name: '19:20', value: 28000, bar: 8 },
    { name: '19:30', value: 35000, bar: 18 },
    { name: '19:40', value: 37000, bar: 14 },
    { name: '19:50', value: 40000, bar: 20 },
    { name: '20:00', value: 32000, bar: 12 },
    { name: '20:10', value: 35000, bar: 18 },
    { name: '20:20', value: 30000, bar: 10 },
    { name: '20:30', value: 42000, bar: 22 },
    { name: '20:40', value: 39000, bar: 16 },
    { name: '20:50', value: 37000, bar: 14 },
    { name: '21:00', value: 41000, bar: 20 },
    { name: '21:10', value: 43000, bar: 24 },
    { name: '21:20', value: 45000, bar: 28 },
    { name: '21:30', value: 48000, bar: 30 },
    { name: '21:40', value: 47000, bar: 26 },
    { name: '21:50', value: 49000, bar: 32 },
    { name: '22:00', value: 50000, bar: 34 },
    { name: '22:10', value: 52000, bar: 36 },
    { name: '22:20', value: 54000, bar: 38 },
    { name: '22:30', value: 56000, bar: 40 },
    { name: '22:40', value: 58000, bar: 42 },
    { name: '22:50', value: 60000, bar: 44 },
    { name: '23:00', value: 62000, bar: 46 },
];

// Simulación de datos diarios para 1 semana
const weekData = [
    { name: 'Mon', value: 32000, bar: 12 },
    { name: 'Tue', value: 35000, bar: 18 },
    { name: 'Wed', value: 30000, bar: 10 },
    { name: 'Thu', value: 42000, bar: 22 },
    { name: 'Fri', value: 39000, bar: 16 },
    { name: 'Sat', value: 37000, bar: 14 },
    { name: 'Sun', value: 41000, bar: 20 },
];
//simulación de datos mensuales
const monthData = [
    { name: 'S1', value: 32000, bar: 12 },
    { name: 'S2', value: 35000, bar: 18 },
    { name: 'S3', value: 30000, bar: 10 },
    { name: 'S4', value: 33000, bar: 22 },
];

// Simulación de tasas de cambio
const USD_TO_EUR = 1.3; // Ejemplo de tasa de cambio USD a EUR

const Mainchartb = () => {
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
    }
    else if (range === '1m') {
        filteredData = monthData;
    }

    // Convertir valores si es EUR
    const displayData = filteredData.map(d => ({
        ...d,
        value: currency === 'USD' ? d.value : Math.round(d.value * USD_TO_EUR),
        bar: d.bar
    }));

    // Ejemplo de balance
    const balanceUSD = 50000;
    const balance = currency === 'USD' ? balanceUSD : Math.round(balanceUSD * USD_TO_EUR);

    return (
        <div className="chard-card">
            <div className="chard-header-row">
                <span>Chart</span>
                <select
                    className="chard-currency"
                    value={currency}
                    onChange={e => setCurrency(e.target.value as 'USD' | 'EUR')}
                >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                </select>
                <img className="imgb" src={BitcoinIcon} alt="Bitcoin Icon" />
            </div>
            <div className="chard-title">
                <div className="chard-controls">
                    <button className={`chard-btn${range === '1h' ? ' active' : ''}`} onClick={() => setRange('1h')}>1h</button>
                    <button className={`chard-btn${range === '3h' ? ' active' : ''}`} onClick={() => setRange('3h')}>3h</button>
                    <button className={`chard-btn${range === '1d' ? ' active' : ''}`} onClick={() => setRange('1d')}>1d</button>
                    <button className={`chard-btn${range === '1w' ? ' active' : ''}`} onClick={() => setRange('1w')}>1w</button>
                    <button className={`chard-btn${range === '1m' ? ' active' : ''}`} onClick={() => setRange('1m')}>1m</button>
                </div>
                <div className="chard-subheader">
                    <span>Bitcoin/BTC</span>
                    <span className="char-balance">
                        {currency === 'USD' ? '$' : '€'}
                        {balance.toLocaleString()}
                    </span>
                </div>
            </div>

            <ResponsiveContainer width="100%" height="80%" >
                <LineChart data={displayData}>
                    <defs>
                        <linearGradient id="shadowArea" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#ffe066" stopOpacity="0.35" />
                            <stop offset="70%" stopColor="#ffe066" stopOpacity="0.10" />
                            <stop offset="100%" stopColor="#232323" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#232323" vertical={false} />
                    <XAxis dataKey="name" stroke="#bdbdbd" tick={{ fontSize: 12 }} />
                    <YAxis stroke="#bdbdbd" tick={{ fontSize: 12 }} />
                    <Tooltip
                        formatter={(value: number) =>
                            `${currency === 'USD' ? '$' : '€'}${value.toLocaleString()}`
                        }
                    />
                    <Bar dataKey="bar" barSize={8} fill="#232323" />
                    <Area
                        type="monotone"
                        dataKey="value"
                        stroke="none"
                        fill="url(#shadowArea)"
                        fillOpacity={1}
                        isAnimationActive={false}
                    />
                    <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#ffe066"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 5, fill: "#ffe066", stroke: "#fff", strokeWidth: 2 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default Mainchartb;