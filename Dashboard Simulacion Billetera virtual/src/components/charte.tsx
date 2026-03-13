import React, { useState } from "react";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Bar, Area
} from 'recharts';
import { EthereumIcon } from '../icons';
import '../styles/ChartSM.css';

const data = [
    { name: '00:00', value: 30000, bar: 1 },
    { name: '00:10', value: 32000, bar: 12 },
    { name: '00:20', value: 28000, bar: 16 },
    { name: '00:30', value: 35000, bar: 12 },
    { name: '00:40', value: 37000, bar: 10 },
    { name: '00:50', value: 40000, bar: 20 },
    { name: '01:00', value: 32000, bar: 19 },
    { name: '01:10', value: 35000, bar: 22 },
    { name: '01:20', value: 30000, bar: 13 },
    { name: '01:30', value: 42000, bar: 24 },
    { name: '01:40', value: 39000, bar: 13 },
    { name: '01:50', value: 37000, bar: 19 },
    { name: '02:00', value: 41000, bar: 20 },
    { name: '02:10', value: 43000, bar: 24 },
    { name: '02:20', value: 45000, bar: 28 },
    { name: '02:30', value: 48000, bar: 30 },
    { name: '02:40', value: 47000, bar: 22 },
    { name: '02:50', value: 49000, bar: 32 },
    { name: '03:00', value: 50000, bar: 34 },
    { name: '03:10', value: 52000, bar: 36 },
    { name: '03:20', value: 54000, bar: 35 },
    { name: '03:30', value: 56000, bar: 41 }, // corregido
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
    { name: '05:40', value: 82000, bar: 66 }, // corregido
    { name: '05:50', value: 84000, bar: 68 }, // corregido
    { name: '06:00', value: 86000, bar: 70 }, // corregido
    { name: '06:10', value: 88000, bar: 72 }, // corregido
    { name: '06:20', value: 90000, bar: 74 }, // corregido
    { name: '06:30', value: 92000, bar: 76 }, // corregido
    { name: '06:40', value: 94000, bar: 78 }, // corregido
    { name: '06:50', value: 96000, bar: 80 }, // corregido
    { name: '07:00', value: 98000, bar: 82 },
    { name: '07:10', value: 100000, bar: 84 },
    { name: '07:20', value: 102000, bar: 86 },
    { name: '07:30', value: 104000, bar: 88 },
    { name: '07:40', value: 106000, bar: 90 },
    { name: '07:50', value: 108000, bar: 92 },
    { name: '08:00', value: 110000, bar: 94 },
    { name: '08:10', value: 112000, bar: 96 },
    { name: '08:20', value: 114000, bar: 98 }, // corregido
    { name: '08:30', value: 116000, bar: 100 }, // corregido
    { name: '08:40', value: 118000, bar: 102 }, // corregido
    { name: '08:50', value: 120000, bar: 104 }, // corregido
    { name: '09:00', value: 122000, bar: 106 }, // corregido
    { name: '09:10', value: 124000, bar: 108 }, // corregido
    { name: '09:20', value: 126000, bar: 110 }, // corregido
    { name: '09:30', value: 128000, bar: 112 }, // corregido
    { name: '09:40', value: 130000, bar: 114 }, // corregido
    { name: '09:50', value: 132000, bar: 116 }, // corregido
    { name: '10:00', value: 134000, bar: 118 }, // corregido
    { name: '10:10', value: 136000, bar: 120 }, // corregido
    { name: '10:20', value: 138000, bar: 122 }, // corregido
    { name: '10:30', value: 140000, bar: 124 }, // corregido
    { name: '10:40', value: 142000, bar: 126 }, // corregido
    { name: '10:50', value: 144000, bar: 128 }, // corregido
    { name: '11:00', value: 146000, bar: 130 }, // corregido
    { name: '11:10', value: 148000, bar: 132 }, // corregido
    { name: '11:20', value: 150000, bar: 134 }, // corregido
    { name: '11:30', value: 152000, bar: 136 },
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
    { name: '13:30', value: 176000, bar: 160 }, // corregido
    { name: '13:40', value: 178000, bar: 162 }, // corregido
    { name: '13:50', value: 180000, bar: 164 }, // corregido
    { name: '14:00', value: 182000, bar: 166 }, // corregido
    { name: '14:10', value: 184000, bar: 168 }, // corregido
    { name: '14:20', value: 186000, bar: 170 }, // corregido
    { name: '14:30', value: 188000, bar: 172 }, // corregido
    { name: '14:40', value: 190000, bar: 174 }, // corregido
    { name: '14:50', value: 192000, bar: 176 }, // corregido
    { name: '15:00', value: 194000, bar: 178 }, // corregido
    { name: '15:10', value: 196000, bar: 180 }, // corregido
    { name: '15:20', value: 198000, bar: 182 }, // corregido
    { name: '15:30', value: 200000, bar: 184 }, // corregido
    { name: '15:40', value: 202000, bar: 186 }, // corregido
    { name: '15:50', value: 204000, bar: 188 }, // corregido
    { name: '16:00', value: 206000, bar: 190 }, // corregido
    { name: '16:10', value: 208000, bar: 192 }, // corregido
    { name: '16:20', value: 210000, bar: 194 }, // corregido
    { name: '16:30', value: 212000, bar: 196 },
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
    { name: 'Mon', value: 32000, bar: 10 },
    { name: 'Tue', value: 35000, bar: 18 },
    { name: 'Wed', value: 30000, bar: 14 },
    { name: 'Thu', value: 42000, bar: 22 },
    { name: 'Fri', value: 39000, bar: 16 },
    { name: 'Sat', value: 37000, bar: 11 },
    { name: 'Sun', value: 41000, bar: 20 },
];
const monthData = [
    { name: 'S1', value: 20000, bar: 10 },
    { name: 'S2', value: 10000, bar: 18 },
    { name: 'S3', value: 21000, bar: 10 },
    { name: 'S4', value: 22000, bar: 18 },
];

// Simulación de tasas de cambio
const USD_TO_EUR = 1.3; // Ejemplo de tasa de cambio USD a EUR

const Maincharte = () => {
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
            </div>
            <img className="imge" src={EthereumIcon} alt="Ethereum Icon" />
            <div className="chard-title">
                <div className="chard-controls">
                    <button className={`chard-btn${range === '1h' ? ' active' : ''}`} onClick={() => setRange('1h')}>1h</button>
                    <button className={`chard-btn${range === '3h' ? ' active' : ''}`} onClick={() => setRange('3h')}>3h</button>
                    <button className={`chard-btn${range === '1d' ? ' active' : ''}`} onClick={() => setRange('1d')}>1d</button>
                    <button className={`chard-btn${range === '1w' ? ' active' : ''}`} onClick={() => setRange('1w')}>1w</button>
                    <button className={`chart-btn${range === '1m' ? ' active' : ''}`} onClick={() => setRange('1m')}>1m</button>
                </div>
                <div className="chard-subheader">
                    <span>Ethereum/ETH</span>
                    <span className="chard-balance">
                        {currency === 'USD' ? '$' : '€'}
                        {balance.toLocaleString()}
                    </span>
                </div>
            </div>

            <ResponsiveContainer width="100%" height="80%" >
                <LineChart data={displayData}>
                    <defs>
                        <linearGradient id="shadowAreaE" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#627eea" stopOpacity="0.35" />
                            <stop offset="70%" stopColor="#627eea" stopOpacity="0.10" />
                            <stop offset="100%" stopColor="#232323" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#232323" vertical={false} />
                    <XAxis dataKey="name" stroke="#bdbdbd" tick={{ fontSize: 12 }} />
                    <YAxis stroke="#bdbdbd" tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="bar" barSize={8} fill="#232323" />
                    <Area
                        type="monotone"
                        dataKey="value"
                        stroke="none"
                        fill="url(#shadowAreaE)"
                        fillOpacity={1}
                        isAnimationActive={false}
                    />
                    <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#627eea"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 5, fill: "#627eea", stroke: "#fff", strokeWidth: 2 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default Maincharte;