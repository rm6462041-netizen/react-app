import React from "react";

/* =======================
   FIXED SYMBOL ICONS (CASE 2)
   ======================= */
const fixedSymbolIcons = {
  XAUUSD: "/assets/commodities/xauusd.svg",
  XAGUSD: "/assets/commodities/xagusd.svg",
  BTCUSD: "/assets/crypto/color/btc.svg",
  ETHUSD: "/assets/crypto/color/eth.svg",
  US500: "/assets/commodities/us500.svg",
  NAS100: "/assets/commodities/usd.svg",
};

/* =======================
   STABLECOINS (CASE 1)
   ======================= */
const STABLES = ["USDT", "USDC"];

/* =======================
   HELPERS
   ======================= */
const getCapitalLetters = (str) => (str.match(/[A-Z0-9]/g) || []).join('');

/* =======================
   COMPONENT
   ======================= */
function SymbolWithIcon({ symbol }) {
  const uiSymbol = symbol; // text as-is
  const capitalOnly = getCapitalLetters(symbol); // sirf capital letters

  /* =======================
     🥇 CASE 1a : STABLECOIN AT START (EXISTING)
     ======================= */
  for (const s of STABLES) {
    if (capitalOnly.startsWith(s)) {
      const stable = s;
      const coin = capitalOnly.slice(s.length, s.length + 3); // next 3 letters

      const stableIcon = `/assets/crypto/color/${stable.toLowerCase()}.svg`;
      const coinPaths = [
        `/assets/flags/4x3/${coin.toLowerCase()}.svg`,   // primary
        `/assets/crypto/color/${coin.toLowerCase()}.svg` // fallback
      ];

      return (
        <div className="symbol-tv">
          <div className="flags">
            {coinPaths.map((src, i) => (
              <img
                key={`coin-${i}`}
                className="flag base"
                src={src}
                alt={coin}
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
            ))}
            <img className="flag quote" src={stableIcon} alt={stable} />
          </div>
          <span className="symbol-text">{uiSymbol}</span>
        </div>
      );
    }
  }

  /* =======================
     🥇 CASE 1b : STABLECOIN AT END (NEW)
     ======================= */
  for (const s of STABLES) {
    if (capitalOnly.endsWith(s)) {
      const stable = s;
      const coin = capitalOnly.slice(0, capitalOnly.length - s.length); // pehle ke letters

      const stableIcon = `/assets/crypto/color/${stable.toLowerCase()}.svg`;
      const coinPaths = [
        `/assets/flags/4x3/${coin.toLowerCase()}.svg`,   // primary
        `/assets/crypto/color/${coin.toLowerCase()}.svg` // fallback
      ];

      return (
        <div className="symbol-tv">
          <div className="flags">
            {coinPaths.map((src, i) => (
              <img
                key={`coin-${i}`}
                className="flag base"
                src={src}
                alt={coin}
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
            ))}
            <img className="flag quote" src={stableIcon} alt={stable} />
          </div>
          <span className="symbol-text">{uiSymbol}</span>
        </div>
      );
    }
  }

  /* =======================
     🥈 CASE 2 : FIXED SYMBOL ICON (EXACT CAPITAL LETTER MATCH)
     ======================= */
  for (const key in fixedSymbolIcons) {
    if (capitalOnly === key) {
      return (
        <div className="symbol-tv">
          <div className="flags">
            <img
              className="single-icon"
              src={fixedSymbolIcons[key]}
              alt={key}
            />
          </div>
          <span className="symbol-text">{uiSymbol}</span>
        </div>
      );
    }
  }

  /* =======================
     🥉 CASE 3 : NORMAL 6 LETTER SPLIT
     ======================= */
  if (capitalOnly.length === 6) {
    const base = capitalOnly.slice(0, 3).toLowerCase();
    const quote = capitalOnly.slice(3, 6).toLowerCase();

    const basePaths = [
      `/assets/crypto/color/${base}.svg`,
      `/assets/flags/4x3/${base}.svg`,
    ];
    const quotePaths = [
      `/assets/crypto/color/${quote}.svg`,
      `/assets/flags/4x3/${quote}.svg`,
    ];

    return (
      <div className="symbol-tv">
        <div className="flags">
          {basePaths.map((src, i) => (
            <img
              key={`base-${i}`}
              className="flag base"
              src={src}
              alt={base}
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
          ))}
          {quotePaths.map((src, i) => (
            <img
              key={`quote-${i}`}
              className="flag quote"
              src={src}
              alt={quote}
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
          ))}
        </div>
        <span className="symbol-text">{uiSymbol}</span>
      </div>
    );
  }

  /* =======================
     FALLBACK : JUST TEXT
     ======================= */
  return <span className="symbol-text">{uiSymbol}</span>;
}

export default SymbolWithIcon;
