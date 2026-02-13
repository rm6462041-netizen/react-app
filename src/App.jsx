import React, { useState, useEffect, useMemo, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import '@fontsource/roboto/400.css'; // normal
import '@fontsource/roboto/500.css'; // medium
import '@fontsource/roboto/700.css'; // bold



import './styles/style.css';

import Sidebar from './components/Sidebar/Sidebar';
import Dashboard from './components/dashboard/dashboard';
import { TradeManager } from './utils/tradeManager';

/* ---------------- PAGES ---------------- */
import AddTrade from './components/AddTrade/AddTrade';
import Analytics from "./components/Analytics/Analytics";
import TradeView from './components/Daily/TradeView';
import ThatTrade from './components/Daily/ThatTrade';

function Profile() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

  return (
    <div style={{ padding: '40px' }}>
      <h1>User Profile</h1>
      {currentUser ? (
        <>
          <p><strong>Name:</strong> {currentUser.firstName} {currentUser.lastName}</p>
          <p><strong>Email:</strong> {currentUser.email}</p>
        </>
      ) : (
        <p>Please login</p>
      )}
    </div>
  );
}

/* ---------------- APP ROOT ---------------- */

function App() {
  const [user, setUser] = useState(null);
  const [tradeMode, setTradeMode] = useState(() => localStorage.getItem('tradeMode') || 'all');
  const [trades, setTrades] = useState([]);
  const [stats, setStats] = useState({
    totalPnL: 0,
    winRate: 0,
    avgPnL: 0,
    totalTrades: 0
  });

  const tradeManager = useMemo(() => new TradeManager(), []);
  const ws = useRef(null);

  // Load current user
  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    setUser(currentUser);
  }, []);


  // Load trades whenever user or tradeMode changes
  useEffect(() => {
    if (user?.ID) {
      loadTradesData(user.ID, tradeMode);
    }
  }, [user, tradeMode]);

  const loadTradesData = async (userId, mode) => {
    try {
      const tradesData = await tradeManager.loadTrades(userId, mode);
      setTrades(tradesData);
      setStats(tradeManager.calculateStats(tradesData));
    } catch (err) {
      console.error('Error loading trades:', err);
      setTrades([]);
      setStats({ totalPnL: 0, winRate: 0, avgPnL: 0, totalTrades: 0 });
    }
  };

const updatingTrades = useRef(false);

//webscoket//

useEffect(() => {
  if (!user?.ID) return;

  if (!ws.current) {
    ws.current = new WebSocket("ws://localhost:5000");

    // ws.current.onopen = () => console.log("✅ WebSocket connected");

    ws.current.onmessage = async (event) => {
      const msg = JSON.parse(event.data);

      if (msg.type === "TRADE_UPDATED") {
        if (updatingTrades.current) return; // 🔥 already updating, skip

        updatingTrades.current = true; // mark start of update
        console.log("🔄 Trade update received:", msg);

        try {
          const tradesData = await tradeManager.loadTrades(user.ID, tradeMode);
          setTrades([...tradesData]);
          setStats(tradeManager.calculateStats(tradesData));
        } catch (err) {
          console.error("Error updating trades:", err);
        } finally {
          // reset flag after update
          setTimeout(() => {
            updatingTrades.current = false;
          }, 100); // 100ms delay to avoid super quick duplicate updates
        }
      }
    };

    // ws.current.onclose = () => 
    //   console.log("🔴 WebSocket disconnected");
  }

  return () => {
    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }
  };
}, [user, tradeMode]);



  const handleTradeModeChange = (mode) => {
    localStorage.setItem('tradeMode', mode);
    setTradeMode(mode);
  };

  return (
    <BrowserRouter>
      <div className="dashboard">
        <Sidebar />

        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" />} />

          <Route
            path="/dashboard"
            element={
              <Dashboard
                tradeMode={tradeMode}
                setTradeMode={handleTradeModeChange}
                stats={stats}
                trades={trades}
              />
            }
          />

          <Route path="/add-trade" element={<AddTrade />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/TradeView" element={<TradeView trades={trades} />} />
          <Route path="/trade/:tradeId" element={<ThatTrade />} />
          </Routes>


      </div>
    </BrowserRouter>
  );
}

export default App;    





