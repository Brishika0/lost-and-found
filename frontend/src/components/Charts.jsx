import './Charts.css';

// Simple Bar Chart Component
export function BarChart({ data, title, height = 200 }) {
    if (!data || data.length === 0) return <div className="chart-placeholder">No data available</div>;

    const maxValue = Math.max(...data.map(item => item.value));

    return (
        <div className="chart-container">
            <h4 className="chart-title">{title}</h4>
            <div className="bar-chart" style={{ height }}>
                {data.map((item, index) => (
                    <div key={index} className="bar-item">
                        <div
                            className="bar"
                            style={{
                                height: `${(item.value / maxValue) * 80}%`,
                                backgroundColor: item.color || '#007bff'
                            }}
                            title={`${item.label}: ${item.value}`}
                        ></div>
                        <span className="bar-label">{item.label}</span>
                        <span className="bar-value">{item.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Simple Pie Chart Component (using CSS)
export function PieChart({ data, title }) {
    if (!data || data.length === 0) return <div className="chart-placeholder">No data available</div>;

    const total = data.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = 0;

    return (
        <div className="chart-container">
            <h4 className="chart-title">{title}</h4>
            <div className="pie-chart-container">
                <div className="pie-chart">
                    {data.map((item, index) => {
                        const percentage = (item.value / total) * 100;
                        const angle = (item.value / total) * 360;
                        const startAngle = currentAngle;
                        currentAngle += angle;

                        return (
                            <div
                                key={index}
                                className="pie-slice"
                                style={{
                                    '--start-angle': `${startAngle}deg`,
                                    '--end-angle': `${currentAngle}deg`,
                                    '--color': item.color || `hsl(${index * 60}, 70%, 50%)`
                                }}
                                title={`${item.label}: ${item.value} (${percentage.toFixed(1)}%)`}
                            ></div>
                        );
                    })}
                </div>
                <div className="pie-legend">
                    {data.map((item, index) => (
                        <div key={index} className="legend-item">
                            <span
                                className="legend-color"
                                style={{ backgroundColor: item.color || `hsl(${index * 60}, 70%, 50%)` }}
                            ></span>
                            <span className="legend-label">{item.label}: {item.value}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// Line Chart Component
export function LineChart({ data, title, height = 200 }) {
    if (!data || data.length === 0) return <div className="chart-placeholder">No data available</div>;

    const maxValue = Math.max(...data.map(item => item.value));
    const minValue = Math.min(...data.map(item => item.value));
    const range = maxValue - minValue || 1;

    return (
        <div className="chart-container">
            <h4 className="chart-title">{title}</h4>
            <div className="line-chart" style={{ height }}>
                <svg width="100%" height="100%" viewBox="0 0 400 200">
                    {/* Grid lines */}
                    {[0, 1, 2, 3, 4].map(i => (
                        <line
                            key={i}
                            x1="0"
                            y1={i * 40}
                            x2="400"
                            y2={i * 40}
                            stroke="#e0e0e0"
                            strokeWidth="1"
                        />
                    ))}

                    {/* Data line */}
                    <polyline
                        fill="none"
                        stroke="#007bff"
                        strokeWidth="2"
                        points={data.map((item, index) => {
                            const x = (index / (data.length - 1)) * 380 + 10;
                            const y = 180 - ((item.value - minValue) / range) * 160;
                            return `${x},${y}`;
                        }).join(' ')}
                    />

                    {/* Data points */}
                    {data.map((item, index) => {
                        const x = (index / (data.length - 1)) * 380 + 10;
                        const y = 180 - ((item.value - minValue) / range) * 160;
                        return (
                            <circle
                                key={index}
                                cx={x}
                                cy={y}
                                r="4"
                                fill="#007bff"
                                title={`${item.label}: ${item.value}`}
                            />
                        );
                    })}
                </svg>
                <div className="line-chart-labels">
                    {data.map((item, index) => (
                        <span key={index} className="line-label">{item.label}</span>
                    ))}
                </div>
            </div>
        </div>
    );
}