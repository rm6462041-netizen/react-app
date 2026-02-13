import React from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import "./Markets.css";
import Chart from "./Chart";   // ✅ same folder import

function ThatTrade({ trades = [] }) {
  const { tradeId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const trade =
    location.state?.tradeData ||
    trades.find(t => t.id === tradeId || t.unique_id === tradeId);

  const goBack = () => navigate(-1);

  if (!trade) {
    return (
      <div className="main-content">
        <h2>Trade Not Found</h2>
        <button onClick={goBack} className="back-btn">Go Back</button>
      </div>
    );
  }

  const pnl = Number(trade.pnl) || 0;
  const isProfit = pnl >= 0;

  const formatDateTime = (timestamp) => {
    if (!timestamp) return { date: "--", time: "--" };
    const d = new Date(timestamp);
    return {
      date: d.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }),
      time: d.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit"
      }),
      // ✅ नया: Date object for chart
      dateObj: d,
      isoDate: d.toISOString().split('T')[0] // YYYY-MM-DD format
    };
  };

  const { date, time, dateObj, isoDate } = formatDateTime(trade.timestamp);

const getBinanceSymbol = (symbol) => {
  if (!symbol) return "BTCUSDT";
  // Just convert to uppercase, don't add USDT
  return symbol.toUpperCase();
};



  return (
    <div className="main-content">
      <div className="trade-page">

        {/* LEFT STATS PANEL */}
        <div className="trade-stats-panel">

          <div className="trade-top">
            <button onClick={goBack} className="back-btn">← Back</button>
            <h3>{trade.symbol} · {date}</h3>
          </div>

          <div className={`net-pnl ${isProfit ? "profit" : "loss"}`}>
            <p>Net P&amp;L</p>
            <h2>{isProfit ? "+" : "-"}${Math.abs(pnl).toFixed(2)}</h2>
          </div>

          <Stat label="Side" value={trade.trade_type} className="row-side" />
          <Stat label="Quantity" value={trade.quantity} className="row-qty" />
          <Stat label="Entry Price" value={trade.price} className="row-entry" />
          <Stat label="Exit Price" value={trade.exit_price} className="row-exit" />
          <Stat label="Strategy" value={trade.strategy || "--"} className="row-strategy" />
          <Stat label="Date" value={date} className="row-date" />
          <Stat label="Time" value={time} className="row-time" />

        </div>

        {/* RIGHT CONTENT */}
        <div className="trade-content">

          {/* ✅ CHART WITH PROPS */}
          <div className="trade-chart-box">
            <Chart 
              symbol={getBinanceSymbol(trade.symbol)} 
              tradeDate={dateObj}
              tradeTime={time}
              showFullDay={true}
            />
          </div>

          {/* NOTES */}
          <div className="trade-notes">
            <h4>Trade Note</h4>
            <textarea placeholder="Write your trade review..." />
          </div>

        </div>
      </div>
    </div>
  );
}

const Stat = ({ label, value, highlight, className }) => (
  <div className={`stat-row ${className}`}>
    <span className="stat-label">{label}</span>
    <span className={`stat-value ${highlight ? "highlight" : ""}`}>
      {value}
    </span>
  </div>
);

export default ThatTrade;