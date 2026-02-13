import React from 'react';
import './StatsCards.css';


function StatsCards({ stats }) {
  // Helper function: safe number formatting
  const formatNumber = (value) => {
    const num = Number(value);       // convert to number
    if (isNaN(num)) return '-';      // if not a number, show "-"
    return num.toFixed(2);           // else show 2 decimals
  };

  return (



    <div className="stats-cards">
      <div className="stat-card">
        <div
          className={`stat-value ${
            Number(stats.totalPnL) >= 0 ? 'positive' : 'negative'
          }`}
        >
          ${formatNumber(stats.totalPnL)}
        </div>
        <div className="stat-label">Total P&L</div>
      </div>

      <div className="stat-card">
        <div className="stat-value">{stats.winRate ?? '-' }%</div>
        <div className="stat-label">Win Rate</div>
      </div>

      <div className="stat-card">
        <div
          className={`stat-value ${
            Number(stats.avgPnL) >= 0 ? 'positive' : 'negative'
          }`}
        >
          ${formatNumber(stats.avgPnL)}
        </div>
        <div className="stat-label">Avg P&L</div>
      </div>

      <div className="stat-card">
        <div className="stat-value">{stats.totalTrades ?? '-'}</div>
        <div className="stat-label">Total Trades</div>
      </div>
    </div>

  );
}

export default StatsCards;
