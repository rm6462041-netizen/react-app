import React, { useEffect, useRef, useState, useCallback } from "react";
import { createChart, CandlestickSeries } from "lightweight-charts";
import "./Markets.css";

const TF_MAP = {
  "1m": "1m",
  "5m": "5m",
  "15m": "15m",
  "1h": "1h",
};

function Chart({ darkMode, symbol = "BTCUSDT", tradeDate, tradeTime, showFullDay = false }) {
  const chartRef = useRef(null);
  const chartApiRef = useRef(null);
  const candleSeriesRef = useRef(null);
  const socketRef = useRef(null);

  const [tf, setTf] = useState("5m");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // ✅ CSS Variables को state में store करें
  const [cssVariables, setCssVariables] = useState({
    bgCard: "",
    textMuted: "",
    borderLight: "",
    borderMedium: "",
    pnlPositive: "",
    pnlNegative: ""
  });

  // ✅ Clean symbol - सिर्फ trailing lowercase letters remove करें
  const cleanSymbol = useCallback((sym) => {
    if (!sym) return "BTCUSDT";
    
    // सिर्फ trailing lowercase letters remove करें
    // BTCUSDTc → BTCUSDT
    // ETHUSDT.pi → ETHUSDT.
    const cleaned = sym.replace(/[a-z]+$/g, '').toUpperCase();
    
    return cleaned;
  }, []);

  // ✅ Get cleaned symbol for current use
  const cleanedSymbol = cleanSymbol(symbol);

  // ✅ Calculate start and end time for specific date
  const getDateRange = useCallback(() => {
    if (!tradeDate || !showFullDay) return null;
    
    const startDate = new Date(tradeDate);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(tradeDate);
    endDate.setHours(23, 59, 59, 999);
    
    return {
      startTime: startDate.getTime(),
      endTime: endDate.getTime()
    };
  }, [tradeDate, showFullDay]);

  // ✅ Format timestamp for Binance API
  const formatTimeForBinance = (timestamp) => {
    return Math.floor(timestamp / 1000) * 1000;
  };

  // ✅ CSS Variables को sync में update करें
  useEffect(() => {
    const updateCssVariables = () => {
      const getCssVar = (name) => 
        getComputedStyle(document.body).getPropertyValue(name).trim();
      
      setCssVariables({
        bgCard: getCssVar("--bg-card"),
        textMuted: getCssVar("--text-muted"),
        borderLight: getCssVar("--border-light"),
        borderMedium: getCssVar("--border-medium"),
        pnlPositive: getCssVar("--pnl-positive"),
        pnlNegative: getCssVar("--pnl-negative")
      });
    };

    updateCssVariables();
    
    const observer = new MutationObserver(() => {
      updateCssVariables();
    });
    
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => observer.disconnect();
  }, []);

  // ✅ DarkMode change पर force CSS variables update
  useEffect(() => {
    const timer = setTimeout(() => {
      const getCssVar = (name) => 
        getComputedStyle(document.body).getPropertyValue(name).trim();
      
      setCssVariables({
        bgCard: getCssVar("--bg-card"),
        textMuted: getCssVar("--text-muted"),
        borderLight: getCssVar("--border-light"),
        borderMedium: getCssVar("--border-medium"),
        pnlPositive: getCssVar("--pnl-positive"),
        pnlNegative: getCssVar("--pnl-negative")
      });
    }, 50);
    
    return () => clearTimeout(timer);
  }, [darkMode]);

  // 🔹 Chart init
  useEffect(() => {
    const chart = createChart(chartRef.current, {
      width: chartRef.current.clientWidth,
      height: 350,
      layout: {
        background: { color: cssVariables.bgCard },
        textColor: cssVariables.textMuted,
      },
      grid: {
        vertLines: { color: cssVariables.borderLight },
        horzLines: { color: cssVariables.borderLight },
      },
      rightPriceScale: {
        borderColor: cssVariables.borderMedium,
      },
      timeScale: {
        borderColor: cssVariables.borderMedium,
        timeVisible: true,
      },
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: cssVariables.pnlPositive,
      downColor: cssVariables.pnlNegative,
      borderUpColor: cssVariables.pnlPositive,
      borderDownColor: cssVariables.pnlNegative,
      wickUpColor: cssVariables.pnlPositive,
      wickDownColor: cssVariables.pnlNegative,
    });

    chartApiRef.current = chart;
    candleSeriesRef.current = candleSeries;

    // Handle window resize
    const handleResize = () => {
      if (chartApiRef.current) {
        chartApiRef.current.applyOptions({
          width: chartRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      socketRef.current?.close();
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  // 🔥 CSS VARIABLES CHANGE → UPDATE CHART COLORS
  useEffect(() => {
    if (!chartApiRef.current || !candleSeriesRef.current) return;
    if (!cssVariables.bgCard) return;

    chartApiRef.current.applyOptions({
      layout: {
        background: { color: cssVariables.bgCard },
        textColor: cssVariables.textMuted,
      },
      grid: {
        vertLines: { color: cssVariables.borderLight },
        horzLines: { color: cssVariables.borderLight },
      },
      rightPriceScale: {
        borderColor: cssVariables.borderMedium,
      },
      timeScale: {
        borderColor: cssVariables.borderMedium,
      },
    });

    candleSeriesRef.current.applyOptions({
      upColor: cssVariables.pnlPositive,
      downColor: cssVariables.pnlNegative,
      borderUpColor: cssVariables.pnlPositive,
      borderDownColor: cssVariables.pnlNegative,
      wickUpColor: cssVariables.pnlPositive,
      wickDownColor: cssVariables.pnlNegative,
    });
    
    chartApiRef.current.timeScale().fitContent();
  }, [cssVariables]);

  // 🔹 FETCH DATA FOR SPECIFIC DATE
  useEffect(() => {
    if (!candleSeriesRef.current) return;

    setLoading(true);
    setError(null);
    socketRef.current?.close();

    const fetchDataForDate = async () => {
      try {
        // ✅ Use cleaned symbol for API call
        const apiSymbol = cleanedSymbol;
        let url = `https://api.binance.com/api/v3/klines?symbol=${apiSymbol}&interval=${TF_MAP[tf]}&limit=500`;
        
        if (showFullDay && tradeDate) {
          const dateRange = getDateRange();
          if (dateRange) {
            url += `&startTime=${formatTimeForBinance(dateRange.startTime)}`;
            url += `&endTime=${formatTimeForBinance(dateRange.endTime)}`;
          }
        }

        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }
        
        const data = await response.json();

        // Binance error check
        if (data.code && data.msg) {
          throw new Error(`Symbol ${apiSymbol} not found: ${data.msg}`);
        }

        if (data.length === 0) {
          setError(`No data found for ${apiSymbol} on selected date`);
          return;
        }

        const formattedData = data.map(d => ({
          time: d[0] / 1000,
          open: +d[1],
          high: +d[2],
          low: +d[3],
          close: +d[4],
          volume: +d[5]
        }));

        candleSeriesRef.current.setData(formattedData);
        
        if (showFullDay && tradeDate && formattedData.length > 0) {
          const firstCandle = formattedData[0];
          const lastCandle = formattedData[formattedData.length - 1];
          
          chartApiRef.current.timeScale().setVisibleRange({
            from: firstCandle.time,
            to: lastCandle.time + (24 * 60 * 60)
          });
        } else {
          chartApiRef.current.timeScale().fitContent();
        }

      } catch (err) {
        console.error('Error fetching chart data:', err);
        setError(`Error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchDataForDate();

    // Real-time updates (only for current data, not historical)
    if (!showFullDay) {
      try {
        socketRef.current = new WebSocket(
          `wss://stream.binance.com:9443/ws/${cleanedSymbol.toLowerCase()}@kline_${TF_MAP[tf]}`
        );

        socketRef.current.onmessage = (e) => {
          try {
            const data = JSON.parse(e.data);
            if (data.k) {
              const k = data.k;
              candleSeriesRef.current.update({
                time: k.t / 1000,
                open: +k.o,
                high: +k.h,
                low: +k.l,
                close: +k.c,
              });
            }
          } catch (err) {
            console.error('Error parsing WebSocket data:', err);
          }
        };

        socketRef.current.onerror = (error) => {
          console.error('WebSocket error:', error);
        };
      } catch (wsErr) {
        console.error('WebSocket connection error:', wsErr);
      }
    }

    return () => {
      socketRef.current?.close();
    };
  }, [tf, cleanedSymbol, tradeDate, showFullDay, getDateRange]);

  return (
    <div className="chart">
      <div className="chart-header">
        <h3 className="markets-title">
          {cleanedSymbol}
          {tradeDate && ` · ${tradeDate.toLocaleDateString()}`}
          {tradeTime && ` · ${tradeTime}`}
        </h3>

        <div className="timeframes">
          {["1m", "5m", "15m", "1h"].map(t => (
            <button
              key={t}
              className={`timeframe-btn ${tf === t ? "active" : ""}`}
              onClick={() => setTf(t)}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="chart-loading">
          Loading {cleanedSymbol} data...
        </div>
      )}

      {error && (
        <div className="chart-error">
          {error}
        </div>
      )}

      <div className="chart-wrapper" ref={chartRef}></div>
    </div>
  );
}

export default Chart;