import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./Markets.css";
import "../dashboard/dashboard.css"


function TradeView({ trades = [] }) {
  const navigate = useNavigate();
  
  // State for current month/year navigation
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());


  // State for filters
  const [filters, setFilters] = useState({
    symbol: "",
    tradeType: "",
    strategy: "",
    pnlFilter: "all", // "profit", "loss", "all"
    minPnl: "",
    maxPnl: ""
  });

  // 🔐 safe array
  const safeTrades = useMemo(
    () => (Array.isArray(trades) ? trades : []),
    [trades]
  );

  // Handle month navigation
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Apply filters and month filter
  const filteredTrades = useMemo(() => {
    return safeTrades.filter(trade => {
      // Month/Year filter
      if (trade.timestamp) {
        const tradeDate = new Date(trade.timestamp);
        if (tradeDate.getMonth() !== currentMonth || tradeDate.getFullYear() !== currentYear) {
          return false;
        }
      }

      // Symbol filter
      if (filters.symbol && !trade.symbol?.toLowerCase().includes(filters.symbol.toLowerCase())) {
        return false;
      }

      // Trade type filter
      if (filters.tradeType && trade.trade_type !== filters.tradeType) {
        return false;
      }

      // Strategy filter
      if (filters.strategy && trade.strategy !== filters.strategy) {
        return false;
      }

      // PnL amount filters
      const pnl = Number(trade.pnl) || 0;
      if (filters.minPnl && pnl < Number(filters.minPnl)) {
        return false;
      }
      if (filters.maxPnl && pnl > Number(filters.maxPnl)) {
        return false;
      }

      // PnL profit/loss filter
      if (filters.pnlFilter === "profit" && pnl <= 0) {
        return false;
      }
      if (filters.pnlFilter === "loss" && pnl >= 0) {
        return false;
      }

      return true;
    });
  }, [safeTrades, currentMonth, currentYear, filters]);

  // Get unique values for filter dropdowns
  const uniqueSymbols = useMemo(() => 
    [...new Set(safeTrades.map(t => t.symbol).filter(Boolean))].sort(),
    [safeTrades]
  );

  const uniqueTradeTypes = useMemo(() => 
    [...new Set(safeTrades.map(t => t.trade_type).filter(Boolean))].sort(),
    [safeTrades]
  );

  const uniqueStrategies = useMemo(() => 
    [...new Set(safeTrades.map(t => t.strategy).filter(Boolean))].sort(),
    [safeTrades]
  );

  // Handle row click for trade detail - Navigate to TradeDetail page
  const handleTradeClick = (trade) => {
    navigate(`/trade/${trade.unique_id || trade.id}`, {
      state: { tradeData: trade }
    });
  };

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      symbol: "",
      tradeType: "",
      strategy: "",
      pnlFilter: "all",
      minPnl: "",
      maxPnl: ""
    });
  };

  return (
    <div className="main-content">
      {/* NEW HEADER WITH MONTH NAVIGATION */}
      <div className="trade-view-header">
        <div className="month-navigation">
          <button onClick={handlePrevMonth} className="nav-btn">&lt;</button>
          <h3>{monthNames[currentMonth]} {currentYear}</h3>
          <button onClick={handleNextMonth} className="nav-btn">&gt;</button>
        </div>

        <div className="filters-section">
          <div className="filter-group">
            <select 
              value={filters.symbol}
              onChange={(e) => setFilters({...filters, symbol: e.target.value})}
              className="filter-select"
            >
              <option value="">All Symbols</option>
              {uniqueSymbols.map(symbol => (
                <option key={symbol} value={symbol}>{symbol}</option>
              ))}
            </select>

            <select 
              value={filters.tradeType}
              onChange={(e) => setFilters({...filters, tradeType: e.target.value})}
              className="filter-select"
            >
              <option value="">All Trade Types</option>
              {uniqueTradeTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            <select 
              value={filters.strategy}
              onChange={(e) => setFilters({...filters, strategy: e.target.value})}
              className="filter-select"
            >
              <option value="">All Strategies</option>
              {uniqueStrategies.map(strategy => (
                <option key={strategy} value={strategy}>{strategy}</option>
              ))}
            </select>

            <select 
              value={filters.pnlFilter}
              onChange={(e) => setFilters({...filters, pnlFilter: e.target.value})}
              className="filter-select"
            >
              <option value="all">All P&L</option>
              <option value="profit">Profit Only</option>
              <option value="loss">Loss Only</option>
            </select>
          </div>

          <div className="pnl-range-filter">
            <input 
              type="number"
              placeholder="Min P&L"
              value={filters.minPnl}
              onChange={(e) => setFilters({...filters, minPnl: e.target.value})}
              className="pnl-input"
            />
            <span>to</span>
            <input 
              type="number"
              placeholder="Max P&L"
              value={filters.maxPnl}
              onChange={(e) => setFilters({...filters, maxPnl: e.target.value})}
              className="pnl-input"
            />
          </div>

          <button onClick={resetFilters} className="reset-btn">
            Reset Filters
          </button>
        </div>
      </div>

      {/* TRADES TABLE */}
      {filteredTrades.length === 0 ? (
        <div className="no-trades">
          No trades found for {monthNames[currentMonth]} {currentYear}
        </div>
      ) : (
        <div className="trades-table-container">
          <table className="trades-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Symbol</th>
                <th>Type</th>
                <th>Qty</th>
                <th>Entry</th>
                <th>Exit</th>
                <th>P&L</th>
                <th>Strategy</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {filteredTrades.map((trade, i) => {
                const pnl = Number(trade.pnl) || 0;
                const tradeDate = trade.timestamp ? new Date(trade.timestamp) : null;

                return (
                  <tr 
                    key={trade.unique_id || trade.id || i}
                    onClick={() => handleTradeClick(trade)}
                    className="trade-row"
                  >
                    <td>
                      {tradeDate ? (
                        <>
                          {tradeDate.toLocaleDateString("en-GB")}<br/>
                          {tradeDate.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </>
                      ) : "--"}
                    </td>
                    <td>{trade.symbol || "--"}</td>
                    <td>{trade.trade_type || "--"}</td>
                    <td>{trade.quantity || "--"}</td>
                    <td>{trade.price || "--"}</td>
                    <td>{trade.exit_price || "--"}</td>
                    <td className={pnl >= 0 ? "profit" : "loss"}>
                      {pnl >= 0 ? "+" : "-"}${Math.abs(pnl).toFixed(2)}
                    </td>
                    <td>{trade.strategy || "--"}</td>
                    <td className="notes-cell">
                      {trade.notes ? 
                        (trade.notes.length > 20 ? `${trade.notes.substring(0, 20)}...` : trade.notes) 
                        : "--"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default TradeView;