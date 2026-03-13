import React from "react";
import "../styles/ChartHorizontal.css";

interface BarData {
    value: number;
    color: string;
}

interface ChartHorizontalProps {
    data: BarData[];
}

const ChartHorizontal: React.FC<ChartHorizontalProps> = ({ data }) => {
    const maxValue = Math.max(...data.map(d => d.value), 1);

    return (
        <div className="chart-horizontal-container">
            <div className="chart-horizontal-bars">
                {data.map((bar, idx) => (
                    <div className="chart-horizontal-bar-row" key={idx}>
                        <div
                            className="chart-horizontal-bar"
                            style={{
                                width: `${(bar.value / maxValue) * 100}%`,
                                background: bar.color,
                            }}
                        />
                        <span className="chart-horizontal-bar-value">{bar.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ChartHorizontal;