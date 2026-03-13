import React, { useState } from "react";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Bar, Area
} from 'recharts';
import '../styles/MainchartDB.css';

const data = [
    { name: '00:00', value: 1234, bar: 150 },
    { name: '00:10', value: 8765, bar: 200 },
    { name: '00:20', value: 4321, bar: 50 },
    { name: '00:30', value: 1357, bar: 100 },
    { name: '00:40', value: 9876, bar: 250 },
    { name: '00:50', value: 2468, bar: 80 },
    { name: '01:00', value: 7531, bar: 170 },
    { name: '01:10', value: 3692, bar: 90 },
    { name: '01:20', value: 14000, bar: 300 },
    { name: '01:30', value: 5821, bar: 60 },
    { name: '01:40', value: 11999, bar: 220 },
    { name: '01:50', value: 1000, bar: 140 },
    { name: '02:00', value: 7000, bar: 140 },
    { name: '02:10', value: 12000, bar: 180 },
    { name: '02:20', value: 500, bar: 90 },
    { name: '02:30', value: 13999, bar: 210 },
    { name: '02:40', value: 8000, bar: 70 },
    { name: '02:50', value: 2500, bar: 160 },
    { name: '03:00', value: 13500, bar: 120 },
    { name: '03:10', value: 4000, bar: 200 },
    { name: '03:20', value: 9000, bar: 130 },
    { name: '03:30', value: 2000, bar: 80 },
    { name: '03:40', value: 11000, bar: 300 },
    { name: '03:50', value: 300, bar: 60 },
    { name: '04:00', value: 1400, bar: 250 },
    { name: '04:10', value: 13000, bar: 100 },
    { name: '04:20', value: 700, bar: 170 },
    { name: '04:30', value: 1200, bar: 90 },
    { name: '04:40', value: 13500, bar: 200 },
    { name: '04:50', value: 6000, bar: 50 },
    { name: '05:00', value: 800, bar: 120 },
    { name: '05:10', value: 14000, bar: 300 },
    { name: '05:20', value: 900, bar: 80 },
    { name: '05:30', value: 10000, bar: 210 },
    { name: '05:40', value: 5000, bar: 60 },
    { name: '05:50', value: 12000, bar: 250 },
    { name: '06:00', value: 3000, bar: 110 },
    { name: '06:10', value: 11000, bar: 140 },
    { name: '06:20', value: 200, bar: 180 },
    { name: '06:30', value: 13000, bar: 90 },
    { name: '06:40', value: 400, bar: 210 },
    { name: '06:50', value: 10000, bar: 70 },
    { name: '07:00', value: 500, bar: 160 },
    { name: '07:10', value: 12000, bar: 120 },
    { name: '07:20', value: 8000, bar: 200 },
    { name: '07:30', value: 3000, bar: 130 },
    { name: '07:40', value: 9000, bar: 80 },
    { name: '07:50', value: 1000, bar: 300 },
    { name: '08:00', value: 14000, bar: 60 },
    { name: '08:10', value: 7000, bar: 250 },
    { name: '08:20', value: 6000, bar: 100 },
    { name: '08:30', value: 13000, bar: 170 },
    { name: '08:40', value: 2000, bar: 90 },
    { name: '08:50', value: 12000, bar: 200 },
    { name: '09:00', value: 100, bar: 50 },
    { name: '09:10', value: 8000, bar: 120 },
    { name: '09:20', value: 9000, bar: 300 },
    { name: '09:30', value: 4000, bar: 80 },
    { name: '09:40', value: 11000, bar: 210 },
    { name: '09:50', value: 500, bar: 60 },
    { name: '10:00', value: 14000, bar: 250 },
    { name: '10:10', value: 7000, bar: 110 },
    { name: '10:20', value: 12000, bar: 140 },
    { name: '10:30', value: 3000, bar: 180 },
    { name: '10:40', value: 9000, bar: 90 },
    { name: '10:50', value: 10000, bar: 210 },
    { name: '11:00', value: 5000, bar: 70 },
    { name: '11:10', value: 11000, bar: 160 },
    { name: '11:20', value: 2000, bar: 120 },
    { name: '11:30', value: 13000, bar: 200 },
    { name: '11:40', value: 400, bar: 130 },
    { name: '11:50', value: 12000, bar: 80 },
    { name: '12:00', value: 14000, bar: 300 },
    { name: '12:10', value: 7000, bar: 60 },
    { name: '12:20', value: 6000, bar: 250 },
    { name: '12:30', value: 13000, bar: 100 },
    { name: '12:40', value: 2000, bar: 170 },
    { name: '12:50', value: 12000, bar: 90 },
    { name: '13:00', value: 100, bar: 200 },
    { name: '13:10', value: 8000, bar: 50 },
    { name: '13:20', value: 9000, bar: 120 },
    { name: '13:30', value: 4000, bar: 300 },
    { name: '13:40', value: 11000, bar: 80 },
    { name: '13:50', value: 500, bar: 210 },
    { name: '14:00', value: 14000, bar: 60 },
    { name: '14:10', value: 7000, bar: 250 },
    { name: '14:20', value: 12000, bar: 110 },
    { name: '14:30', value: 3000, bar: 140 },
    { name: '14:40', value: 9000, bar: 180 },
    { name: '14:50', value: 10000, bar: 90 },
    { name: '15:00', value: 5000, bar: 210 },
    { name: '15:10', value: 11000, bar: 70 },
    { name: '15:20', value: 2000, bar: 160 },
    { name: '15:30', value: 13000, bar: 120 },
    { name: '15:40', value: 400, bar: 200 },
    { name: '15:50', value: 12000, bar: 130 },
    { name: '16:00', value: 14000, bar: 80 },
    { name: '16:10', value: 7000, bar: 300 },
    { name: '16:20', value: 6000, bar: 60 },
    { name: '16:30', value: 13000, bar: 250 },
    { name: '16:40', value: 2000, bar: 100 },
    { name: '16:50', value: 12000, bar: 170 },
    { name: '17:00', value: 100, bar: 90 },
    { name: '17:10', value: 8000, bar: 200 },
    { name: '17:20', value: 9000, bar: 50 },
    { name: '17:30', value: 4000, bar: 120 },
    { name: '17:40', value: 11000, bar: 300 },
    { name: '17:50', value: 500, bar: 80 },
    { name: '18:00', value: 14000, bar: 210 },
    { name: '18:10', value: 7000, bar: 60 },
    { name: '18:20', value: 12000, bar: 250 },
    { name: '18:30', value: 3000, bar: 110 },
    { name: '18:40', value: 9000, bar: 140 },
    { name: '18:50', value: 10000, bar: 180 },
    { name: '19:00', value: 5000, bar: 90 },
    { name: '19:10', value: 11000, bar: 210 },
    { name: '19:20', value: 2000, bar: 70 },
    { name: '19:30', value: 13000, bar: 160 },
    { name: '19:40', value: 400, bar: 120 },
    { name: '19:50', value: 12000, bar: 200 },
    { name: '20:00', value: 14000, bar: 130 },
    { name: '20:10', value: 7000, bar: 80 },
    { name: '20:20', value: 6000, bar: 300 },
    { name: '20:30', value: 13000, bar: 60 },
    { name: '20:40', value: 2000, bar: 250 },
    { name: '20:50', value: 12000, bar: 100 },
    { name: '21:00', value: 100, bar: 170 },
    { name: '21:10', value: 8000, bar: 90 },
    { name: '21:20', value: 9000, bar: 200 },
    { name: '21:30', value: 4000, bar: 50 },
    { name: '21:40', value: 11000, bar: 120 },
    { name: '21:50', value: 500, bar: 300 },
    { name: '22:00', value: 14000, bar: 80 },
    { name: '22:10', value: 7000, bar: 210 },
    { name: '22:20', value: 12000, bar: 60 },
    { name: '22:30', value: 3000, bar: 250 },
    { name: '22:40', value: 9000, bar: 110 },
    { name: '22:50', value: 10000, bar: 140 },
    { name: '23:00', value: 5000, bar: 180 },
];

// Simulación de datos diarios para 1 semana
const weekData = [
    { name: 'Mon', value: 32000, bar: 12 },
    { name: 'Tue', value: 35000, bar: 8 },
    { name: 'Wed', value: 30000, bar: 10 },
    { name: 'Thu', value: 42000, bar: 16 },
    { name: 'Fri', value: 39000, bar: 16 },
    { name: 'Sat', value: 37000, bar: 14 },
    { name: 'Sun', value: 41000, bar: 14 },
];

const monthData = [
    { name: 'S1', value: 3000, bar: 10 },
    { name: 'S2', value: 10000, bar: 18 },
    { name: 'S3', value: 20000, bar: 10 },
    { name: 'S4', value: 25000, bar: 18 },
];
// Simulación de tasas de cambio
const USD_TO_EUR = 1.3; // Ejemplo de tasa de cambio USD a EUR

const Mainchartm = () => {
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
                    <span>Mochocoin/MCC</span>
                    <span className="chart-balance">
                        {currency === 'USD' ? '$' : '€'}
                        {balance.toLocaleString()}
                    </span>
                </div>
            </div>

            <ResponsiveContainer width="100%" height="90%" >
                <LineChart data={filteredData}>
                    <defs>
                        <linearGradient id="shadowAreaM" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#2962ff" stopOpacity="0.35" />
                            <stop offset="70%" stopColor="#2962ff" stopOpacity="0.10" />
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
                        fill="url(#shadowAreaM)"
                        fillOpacity={1}
                        isAnimationActive={false}
                    />
                    <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#2962ff"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 5, fill: "#2962ff", stroke: "#fff", strokeWidth: 2 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default Mainchartm;