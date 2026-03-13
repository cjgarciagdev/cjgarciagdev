import React, { useState } from "react";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Bar, Area
} from 'recharts';
import '../styles/ChartSM.css';
import { lightIcon } from "../icons";

const data = [
    { name: '00:00', value: 10234, bar: 120 },
    { name: '00:10', value: 5432, bar: 200 },
    { name: '00:20', value: 13456, bar: 50 },
    { name: '00:30', value: 8765, bar: 180 },
    { name: '00:40', value: 12098, bar: 90 },
    { name: '00:50', value: 2345, bar: 220 },
    { name: '01:00', value: 13987, bar: 60 },
    { name: '01:10', value: 4567, bar: 140 },
    { name: '01:20', value: 9876, bar: 170 },
    { name: '01:30', value: 1234, bar: 80 },
    { name: '01:40', value: 14000, bar: 130 },
    { name: '01:50', value: 876, bar: 170 },
    { name: '02:00', value: 13579, bar: 80 },
    { name: '02:10', value: 2468, bar: 200 },
    { name: '02:20', value: 11234, bar: 120 },
    { name: '02:30', value: 5678, bar: 160 },
    { name: '02:40', value: 8901, bar: 50 },
    { name: '02:50', value: 3210, bar: 230 },
    { name: '03:00', value: 1400, bar: 150 },
    { name: '03:10', value: 13000, bar: 70 },
    { name: '03:20', value: 7000, bar: 180 },
    { name: '03:30', value: 4000, bar: 100 },
    { name: '03:40', value: 12000, bar: 210 },
    { name: '03:50', value: 9000, bar: 140 },
    { name: '04:00', value: 10000, bar: 90 },
    { name: '04:10', value: 8000, bar: 190 },
    { name: '04:20', value: 6000, bar: 60 },
    { name: '04:30', value: 3000, bar: 220 },
    { name: '04:40', value: 14000, bar: 110 },
    { name: '04:50', value: 2000, bar: 170 },
    { name: '05:00', value: 11000, bar: 80 },
    { name: '05:10', value: 5000, bar: 200 },
    { name: '05:20', value: 9000, bar: 120 },
    { name: '05:30', value: 13000, bar: 160 },
    { name: '05:40', value: 7000, bar: 50 },
    { name: '05:50', value: 1400, bar: 230 },
    { name: '06:00', value: 12000, bar: 150 },
    { name: '06:10', value: 8000, bar: 70 },
    { name: '06:20', value: 6000, bar: 180 },
    { name: '06:30', value: 4000, bar: 100 },
    { name: '06:40', value: 2000, bar: 210 },
    { name: '06:50', value: 1000, bar: 140 },
    { name: '07:00', value: 14000, bar: 90 },
    { name: '07:10', value: 12000, bar: 190 },
    { name: '07:20', value: 10000, bar: 60 },
    { name: '07:30', value: 8000, bar: 220 },
    { name: '07:40', value: 6000, bar: 110 },
    { name: '07:50', value: 4000, bar: 170 },
    { name: '08:00', value: 2000, bar: 80 },
    { name: '08:10', value: 1000, bar: 200 },
    { name: '08:20', value: 14000, bar: 120 },
    { name: '08:30', value: 12000, bar: 160 },
    { name: '08:40', value: 10000, bar: 50 },
    { name: '08:50', value: 8000, bar: 230 },
    { name: '09:00', value: 6000, bar: 150 },
    { name: '09:10', value: 4000, bar: 70 },
    { name: '09:20', value: 2000, bar: 180 },
    { name: '09:30', value: 1000, bar: 100 },
    { name: '09:40', value: 14000, bar: 210 },
    { name: '09:50', value: 12000, bar: 140 },
    { name: '10:00', value: 10000, bar: 90 },
    { name: '10:10', value: 8000, bar: 190 },
    { name: '10:20', value: 6000, bar: 60 },
    { name: '10:30', value: 4000, bar: 220 },
    { name: '10:40', value: 2000, bar: 110 },
    { name: '10:50', value: 1000, bar: 170 },
    { name: '11:00', value: 14000, bar: 80 },
    { name: '11:10', value: 12000, bar: 200 },
    { name: '11:20', value: 10000, bar: 120 },
    { name: '11:30', value: 8000, bar: 160 },
    { name: '11:40', value: 6000, bar: 50 },
    { name: '11:50', value: 4000, bar: 230 },
    { name: '12:00', value: 2000, bar: 150 },
    { name: '12:10', value: 1000, bar: 70 },
    { name: '12:20', value: 14000, bar: 180 },
    { name: '12:30', value: 12000, bar: 100 },
    { name: '12:40', value: 10000, bar: 210 },
    { name: '12:50', value: 8000, bar: 140 },
    { name: '13:00', value: 6000, bar: 90 },
    { name: '13:10', value: 4000, bar: 190 },
    { name: '13:20', value: 2000, bar: 60 },
    { name: '13:30', value: 1000, bar: 220 },
    { name: '13:40', value: 14000, bar: 110 },
    { name: '13:50', value: 12000, bar: 170 },
    { name: '14:00', value: 10000, bar: 80 },
    { name: '14:10', value: 8000, bar: 200 },
    { name: '14:20', value: 6000, bar: 120 },
    { name: '14:30', value: 4000, bar: 160 },
    { name: '14:40', value: 2000, bar: 50 },
    { name: '14:50', value: 1000, bar: 230 },
    { name: '15:00', value: 14000, bar: 150 },
    { name: '15:10', value: 12000, bar: 70 },
    { name: '15:20', value: 10000, bar: 180 },
    { name: '15:30', value: 8000, bar: 100 },
    { name: '15:40', value: 6000, bar: 210 },
    { name: '15:50', value: 4000, bar: 140 },
    { name: '16:00', value: 2000, bar: 90 },
    { name: '16:10', value: 1000, bar: 190 },
    { name: '16:20', value: 14000, bar: 60 },
    { name: '16:30', value: 12000, bar: 220 },
    { name: '16:40', value: 10000, bar: 110 },
    { name: '16:50', value: 8000, bar: 170 },
    { name: '17:00', value: 6000, bar: 80 },
    { name: '17:10', value: 4000, bar: 200 },
    { name: '17:20', value: 2000, bar: 120 },
    { name: '17:30', value: 1000, bar: 160 },
    { name: '17:40', value: 14000, bar: 50 },
    { name: '17:50', value: 12000, bar: 230 },
    { name: '18:00', value: 10000, bar: 150 },
    { name: '18:10', value: 8000, bar: 70 },
    { name: '18:20', value: 6000, bar: 180 },
    { name: '18:30', value: 4000, bar: 100 },
    { name: '18:40', value: 2000, bar: 210 },
    { name: '18:50', value: 1000, bar: 140 },
    { name: '19:00', value: 14000, bar: 90 },
    { name: '19:10', value: 12000, bar: 190 },
    { name: '19:20', value: 10000, bar: 60 },
    { name: '19:30', value: 8000, bar: 220 },
    { name: '19:40', value: 6000, bar: 110 },
    { name: '19:50', value: 4000, bar: 170 },
    { name: '20:00', value: 2000, bar: 80 },
    { name: '20:10', value: 1000, bar: 200 },
    { name: '20:20', value: 14000, bar: 120 },
    { name: '20:30', value: 12000, bar: 160 },
    { name: '20:40', value: 10000, bar: 50 },
    { name: '20:50', value: 8000, bar: 230 },
    { name: '21:00', value: 6000, bar: 150 },
    { name: '21:10', value: 4000, bar: 70 },
    { name: '21:20', value: 2000, bar: 180 },
    { name: '21:30', value: 1000, bar: 100 },
    { name: '21:40', value: 14000, bar: 210 },
    { name: '21:50', value: 12000, bar: 140 },
    { name: '22:00', value: 10000, bar: 90 },
    { name: '22:10', value: 8000, bar: 190 },
    { name: '22:20', value: 6000, bar: 60 },
    { name: '22:30', value: 4000, bar: 220 },
    { name: '22:40', value: 2000, bar: 110 },
    { name: '22:50', value: 1000, bar: 170 },
    { name: '23:00', value: 14000, bar: 80 },
];

// Simulación de datos diarios para 1 semana
const weekData = [
    { name: 'Mon', value: 32000, bar: 5 },
    { name: 'Tue', value: 35000, bar: 11 },
    { name: 'Wed', value: 30000, bar: 18 },
    { name: 'Thu', value: 42000, bar: 22 },
    { name: 'Fri', value: 39000, bar: 12 },
    { name: 'Sat', value: 37000, bar: 17 },
    { name: 'Sun', value: 41000, bar: 23 },
];

const monthData = [
    { name: 'S1', value: 30000, bar: 10 },
    { name: 'S2', value: 10000, bar: 18 },
    { name: 'S3', value: 21000, bar: 10 },
    { name: 'S4', value: 24000, bar: 18 },
];

// Simulación de tasas de cambio
const USD_TO_EUR = 1.3; // Ejemplo de tasa de cambio USD a EUR

const Mainchartl = () => {
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
            <img className="imgl" src={lightIcon} alt="lightcoin Icon" />
            <div className="chard-title">
                <div className="chard-controls">
                    <button className={`chard-btn${range === '1h' ? ' active' : ''}`} onClick={() => setRange('1h')}>1h</button>
                    <button className={`chard-btn${range === '3h' ? ' active' : ''}`} onClick={() => setRange('3h')}>3h</button>
                    <button className={`chard-btn${range === '1d' ? ' active' : ''}`} onClick={() => setRange('1d')}>1d</button>
                    <button className={`chart-btn${range === '1m' ? ' active' : ''}`} onClick={() => setRange('1m')}>1m</button>
                </div>
                <div className="chard-subheader">
                    <span>Litecoin/LTC</span>
                    <span className="chard-balance">
                        {currency === 'USD' ? '$' : '€'}
                        {balance.toLocaleString()}
                    </span>
                </div>
            </div>

            <ResponsiveContainer width="100%" height="80%" >
                <LineChart data={displayData}>
                    <defs>
                        <linearGradient id="shadowAreaL" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#bdbdbd" stopOpacity="0.35" />
                            <stop offset="70%" stopColor="#bdbdbd" stopOpacity="0.10" />
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
                        fill="url(#shadowAreaL)"
                        fillOpacity={1}
                        isAnimationActive={false}
                    />
                    <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#bdbdbd"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 5, fill: "#bdbdbd", stroke: "#fff", strokeWidth: 2 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default Mainchartl;