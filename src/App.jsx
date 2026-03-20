import { useState, useRef, useEffect, useCallback } from "react";

// --- Procedural Generation Engine ---
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const MOOD_COLORS = {
  warm: ["#FF6B35", "#F7931E", "#FFD700", "#FF4444", "#FF8C69"],
  cool: ["#00B4D8", "#0077B6", "#90E0EF", "#48CAE4", "#ADE8F4"],
  dark: ["#1a1a2e", "#16213e", "#0f3460", "#533483", "#e94560"],
  neon: ["#ff00ff", "#00ffff", "#ff3366", "#33ff33", "#ffff00"],
  sunset: ["#FF6B6B", "#FFA07A", "#FFD93D", "#FF8E53", "#E84393"],
  ocean: ["#006994", "#0077B6", "#00B4D8", "#48CAE4", "#023E8A"],
  forest: ["#2D6A4F", "#40916C", "#52B788", "#95D5B2", "#1B4332"],
  space: ["#0B0C10", "#1F2833", "#C5C6C7", "#66FCF1", "#45A29E"],
  pastel: ["#FFB5E8", "#B5DEFF", "#E7FFAC", "#FFC8A2", "#D5AAFF"],
  fire: ["#FF0000", "#FF4500", "#FF6600", "#FF8800", "#FFAA00"],
  lavender: ["#E6E6FA", "#9B59B6", "#8E44AD", "#D2B4DE", "#BB8FCE"],
  cyber: ["#0D0221", "#0F084B", "#26081C", "#FF3864", "#2DE2E6"],
  earth: ["#8B7355", "#A0522D", "#CD853F", "#DEB887", "#6B4423"],
  minimal: ["#FAFAFA", "#E0E0E0", "#BDBDBD", "#424242", "#212121"],
  retro: ["#FF6F61", "#FFD166", "#06D6A0", "#118AB2", "#073B4C"],
};

function derivePalette(text, rand) {
  const lower = text.toLowerCase();
  for (const [mood, colors] of Object.entries(MOOD_COLORS)) {
    if (lower.includes(mood)) return [...colors];
  }
  const keywords = {
    night: "dark", dream: "pastel", rain: "cool", sun: "warm",
    love: "warm", ice: "cool", galaxy: "space", city: "cyber",
    mountain: "earth", beach: "ocean", garden: "forest", pink: "pastel",
    purple: "lavender", red: "fire", blue: "ocean", green: "forest",
    gold: "warm", chill: "cool", calm: "pastel", energy: "neon",
    vintage: "retro", abstract: "neon", nature: "forest", sky: "cool",
    tropical: "sunset", midnight: "dark", aurora: "neon", zen: "minimal",
  };
  for (const [kw, mood] of Object.entries(keywords)) {
    if (lower.includes(kw)) return [...MOOD_COLORS[mood]];
  }
  const allMoods = Object.values(MOOD_COLORS);
  return [...allMoods[Math.floor(rand() * allMoods.length)]];
}

function generateWallpaper(canvas, text, variation = 0, size = "desktop") {
  const ctx = canvas.getContext("2d");
  const w = size === "phone" ? 390 : 800;
  const h = size === "phone" ? 844 : 500;
  canvas.width = w;
  canvas.height = h;

  const seed = hashString(text + variation.toString());
  const rand = seededRandom(seed);
  const palette = derivePalette(text, rand);

  const pick = () => palette[Math.floor(rand() * palette.length)];
  const randRange = (a, b) => a + rand() * (b - a);

  // Background gradient
  const bgGrad = ctx.createLinearGradient(
    rand() * w, 0, rand() * w, h
  );
  bgGrad.addColorStop(0, pick());
  bgGrad.addColorStop(0.5, pick());
  bgGrad.addColorStop(1, pick());
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  // Layer 1: Large soft blobs
  const blobCount = 3 + Math.floor(rand() * 5);
  for (let i = 0; i < blobCount; i++) {
    const x = rand() * w;
    const y = rand() * h;
    const r = randRange(w * 0.15, w * 0.5);
    const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
    const c = pick();
    grad.addColorStop(0, c + "CC");
    grad.addColorStop(0.6, c + "44");
    grad.addColorStop(1, c + "00");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  }

  // Layer 2: Pattern overlay (varies by seed)
  const patternType = Math.floor(rand() * 5);

  if (patternType === 0) {
    // Geometric circles
    const count = 8 + Math.floor(rand() * 15);
    for (let i = 0; i < count; i++) {
      ctx.beginPath();
      const x = rand() * w;
      const y = rand() * h;
      const r = randRange(10, w * 0.2);
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.strokeStyle = pick() + "66";
      ctx.lineWidth = randRange(1, 4);
      ctx.stroke();
    }
  } else if (patternType === 1) {
    // Flowing waves
    const waveCount = 5 + Math.floor(rand() * 8);
    for (let i = 0; i < waveCount; i++) {
      ctx.beginPath();
      const baseY = (h / (waveCount + 1)) * (i + 1);
      const amp = randRange(20, 80);
      const freq = randRange(0.005, 0.02);
      const phase = rand() * Math.PI * 2;
      ctx.moveTo(0, baseY);
      for (let x = 0; x <= w; x += 2) {
        const y = baseY + Math.sin(x * freq + phase) * amp;
        ctx.lineTo(x, y);
      }
      ctx.strokeStyle = pick() + "55";
      ctx.lineWidth = randRange(2, 6);
      ctx.stroke();
    }
  } else if (patternType === 2) {
    // Scattered triangles
    const count = 10 + Math.floor(rand() * 20);
    for (let i = 0; i < count; i++) {
      const cx = rand() * w;
      const cy = rand() * h;
      const s = randRange(15, 80);
      ctx.beginPath();
      ctx.moveTo(cx, cy - s);
      ctx.lineTo(cx - s * 0.866, cy + s * 0.5);
      ctx.lineTo(cx + s * 0.866, cy + s * 0.5);
      ctx.closePath();
      ctx.fillStyle = pick() + "33";
      ctx.fill();
      ctx.strokeStyle = pick() + "55";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  } else if (patternType === 3) {
    // Particle field
    const count = 80 + Math.floor(rand() * 200);
    for (let i = 0; i < count; i++) {
      const x = rand() * w;
      const y = rand() * h;
      const r = randRange(1, 5);
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = pick() + "88";
      ctx.fill();
    }
    // Connect some nearby particles with lines
    const pts = Array.from({ length: 30 }, () => [rand() * w, rand() * h]);
    ctx.strokeStyle = pick() + "22";
    ctx.lineWidth = 0.8;
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const d = Math.hypot(pts[i][0] - pts[j][0], pts[i][1] - pts[j][1]);
        if (d < w * 0.2) {
          ctx.beginPath();
          ctx.moveTo(pts[i][0], pts[i][1]);
          ctx.lineTo(pts[j][0], pts[j][1]);
          ctx.stroke();
        }
      }
    }
  } else {
    // Concentric rings
    const cx = randRange(w * 0.2, w * 0.8);
    const cy = randRange(h * 0.2, h * 0.8);
    const rings = 6 + Math.floor(rand() * 10);
    const maxR = Math.max(w, h) * 0.6;
    for (let i = rings; i >= 0; i--) {
      ctx.beginPath();
      const r = (maxR / rings) * (i + 1);
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = pick() + "44";
      ctx.lineWidth = randRange(1, 5);
      ctx.stroke();
    }
  }

  // Layer 3: Grain/noise overlay for texture
  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;
  const grainAmount = 15 + rand() * 20;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (rand() - 0.5) * grainAmount;
    data[i] += noise;
    data[i + 1] += noise;
    data[i + 2] += noise;
  }
  ctx.putImageData(imageData, 0, 0);

  // Layer 4: Subtle vignette
  const vigGrad = ctx.createRadialGradient(w / 2, h / 2, w * 0.2, w / 2, h / 2, w * 0.8);
  vigGrad.addColorStop(0, "transparent");
  vigGrad.addColorStop(1, "rgba(0,0,0,0.3)");
  ctx.fillStyle = vigGrad;
  ctx.fillRect(0, 0, w, h);
}

// --- Components ---
const StarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const DownloadIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const SparkleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0L14.59 8.41 23 11 14.59 13.59 12 22 9.41 13.59 1 11 9.41 8.41z" />
  </svg>
);

const ZapIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

// --- Main App ---
export default function VybeApp() {
  const [screen, setScreen] = useState("landing");
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [wallpapers, setWallpapers] = useState([]);
  const [selectedWp, setSelectedWp] = useState(null);
  const [showPricing, setShowPricing] = useState(false);
  const [freeDownloads, setFreeDownloads] = useState(3);
  const [previewSize, setPreviewSize] = useState("desktop");
  const canvasRefs = useRef([]);
  const hiddenCanvas = useRef(null);

  const generate = useCallback(() => {
    if (!prompt.trim()) return;
    setGenerating(true);
    setWallpapers([]);
    setSelectedWp(null);

    setTimeout(() => {
      const results = [];
      for (let i = 0; i < 6; i++) {
        const canvas = document.createElement("canvas");
        generateWallpaper(canvas, prompt.trim(), i, previewSize);
        results.push({
          id: i,
          dataUrl: canvas.toDataURL("image/png"),
          variation: i,
        });
      }
      setWallpapers(results);
      setGenerating(false);
    }, 800);
  }, [prompt, previewSize]);

  const handleDownload = (wp) => {
    if (freeDownloads <= 0) {
      setShowPricing(true);
      return;
    }
    const canvas = document.createElement("canvas");
    const isPhone = previewSize === "phone";
    generateWallpaper(canvas, prompt.trim(), wp.variation, previewSize);
    // For actual download, use full resolution
    const fullCanvas = document.createElement("canvas");
    fullCanvas.width = isPhone ? 1170 : 2560;
    fullCanvas.height = isPhone ? 2532 : 1440;
    generateWallpaper(fullCanvas, prompt.trim(), wp.variation, previewSize);
    const link = document.createElement("a");
    link.download = `vybe-${prompt.trim().replace(/\s+/g, "-").slice(0, 30)}-${wp.variation}.png`;
    link.href = fullCanvas.toDataURL("image/png");
    link.click();
    setFreeDownloads((d) => d - 1);
  };

  const styles = {
    app: {
      fontFamily: "'Syne', 'SF Pro Display', sans-serif",
      background: "#070709",
      color: "#F0EDE8",
      minHeight: "100vh",
      overflow: "hidden",
    },
    nav: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "20px 32px",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
    },
    logo: {
      fontSize: "28px",
      fontWeight: 800,
      letterSpacing: "-1px",
      background: "linear-gradient(135deg, #FF3CAC, #784BA0, #2B86C5)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
    },
    navBtn: {
      padding: "10px 24px",
      borderRadius: "100px",
      border: "1px solid rgba(255,255,255,0.15)",
      background: "transparent",
      color: "#F0EDE8",
      fontSize: "14px",
      fontWeight: 600,
      cursor: "pointer",
      transition: "all 0.2s",
      fontFamily: "inherit",
    },
    hero: {
      textAlign: "center",
      padding: "80px 24px 40px",
      maxWidth: "720px",
      margin: "0 auto",
    },
    h1: {
      fontSize: "clamp(40px, 7vw, 72px)",
      fontWeight: 800,
      lineHeight: 1.05,
      letterSpacing: "-3px",
      margin: "0 0 20px",
    },
    subtitle: {
      fontSize: "18px",
      color: "rgba(240,237,232,0.5)",
      lineHeight: 1.6,
      maxWidth: "480px",
      margin: "0 auto 40px",
      fontWeight: 400,
    },
    inputRow: {
      display: "flex",
      gap: "12px",
      maxWidth: "560px",
      margin: "0 auto",
      padding: "0 16px",
    },
    input: {
      flex: 1,
      padding: "16px 24px",
      borderRadius: "16px",
      border: "1px solid rgba(255,255,255,0.1)",
      background: "rgba(255,255,255,0.05)",
      color: "#F0EDE8",
      fontSize: "16px",
      outline: "none",
      fontFamily: "inherit",
      transition: "border-color 0.2s",
    },
    generateBtn: {
      padding: "16px 32px",
      borderRadius: "16px",
      border: "none",
      background: "linear-gradient(135deg, #FF3CAC, #784BA0)",
      color: "#fff",
      fontSize: "16px",
      fontWeight: 700,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      fontFamily: "inherit",
      whiteSpace: "nowrap",
      transition: "transform 0.15s, box-shadow 0.15s",
    },
    sizeToggle: {
      display: "flex",
      justifyContent: "center",
      gap: "8px",
      margin: "24px auto 0",
    },
    sizeBtn: (active) => ({
      padding: "8px 20px",
      borderRadius: "100px",
      border: `1px solid ${active ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.08)"}`,
      background: active ? "rgba(255,255,255,0.1)" : "transparent",
      color: active ? "#F0EDE8" : "rgba(240,237,232,0.4)",
      fontSize: "13px",
      fontWeight: 600,
      cursor: "pointer",
      fontFamily: "inherit",
      transition: "all 0.2s",
    }),
    grid: {
      display: "grid",
      gridTemplateColumns: previewSize === "phone" ? "repeat(3, 1fr)" : "repeat(2, 1fr)",
      gap: "16px",
      maxWidth: "840px",
      margin: "40px auto 0",
      padding: "0 24px",
    },
    card: (selected) => ({
      borderRadius: "16px",
      overflow: "hidden",
      cursor: "pointer",
      border: selected ? "2px solid #FF3CAC" : "2px solid rgba(255,255,255,0.06)",
      transition: "all 0.2s",
      position: "relative",
      background: "#111",
    }),
    cardImg: {
      width: "100%",
      display: "block",
      aspectRatio: previewSize === "phone" ? "9/19.5" : "16/10",
      objectFit: "cover",
    },
    cardOverlay: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      padding: "12px",
      background: "linear-gradient(transparent, rgba(0,0,0,0.8))",
      display: "flex",
      justifyContent: "flex-end",
    },
    dlBtn: {
      padding: "8px 16px",
      borderRadius: "10px",
      border: "none",
      background: "rgba(255,255,255,0.15)",
      backdropFilter: "blur(10px)",
      color: "#fff",
      fontSize: "13px",
      fontWeight: 600,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "6px",
      fontFamily: "inherit",
      transition: "background 0.2s",
    },
    badge: {
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
      padding: "6px 14px",
      borderRadius: "100px",
      background: "rgba(255,60,172,0.15)",
      color: "#FF3CAC",
      fontSize: "13px",
      fontWeight: 600,
      marginBottom: "20px",
    },
    freeCounter: {
      textAlign: "center",
      margin: "20px auto 0",
      fontSize: "13px",
      color: "rgba(240,237,232,0.35)",
    },
    // Examples
    examples: {
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "center",
      gap: "8px",
      margin: "20px auto 0",
      maxWidth: "560px",
    },
    exTag: {
      padding: "6px 14px",
      borderRadius: "100px",
      border: "1px solid rgba(255,255,255,0.08)",
      background: "rgba(255,255,255,0.03)",
      color: "rgba(240,237,232,0.5)",
      fontSize: "13px",
      cursor: "pointer",
      fontFamily: "inherit",
      transition: "all 0.2s",
    },
    // Pricing modal
    overlay: {
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.85)",
      backdropFilter: "blur(20px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      padding: "24px",
    },
    modal: {
      background: "#111114",
      borderRadius: "24px",
      padding: "40px",
      maxWidth: "800px",
      width: "100%",
      border: "1px solid rgba(255,255,255,0.08)",
      maxHeight: "90vh",
      overflow: "auto",
    },
    pricingGrid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "20px",
      marginTop: "32px",
    },
    priceCard: (featured) => ({
      padding: "32px",
      borderRadius: "20px",
      border: featured ? "2px solid #FF3CAC" : "1px solid rgba(255,255,255,0.08)",
      background: featured ? "rgba(255,60,172,0.05)" : "rgba(255,255,255,0.02)",
    }),
    priceAmount: {
      fontSize: "48px",
      fontWeight: 800,
      letterSpacing: "-2px",
      margin: "16px 0 4px",
    },
    priceLabel: {
      fontSize: "14px",
      color: "rgba(240,237,232,0.4)",
      marginBottom: "24px",
    },
    featureList: {
      listStyle: "none",
      padding: 0,
      margin: "0 0 28px",
      display: "flex",
      flexDirection: "column",
      gap: "12px",
    },
    featureItem: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      fontSize: "14px",
      color: "rgba(240,237,232,0.7)",
    },
    buyBtn: (featured) => ({
      width: "100%",
      padding: "14px",
      borderRadius: "14px",
      border: "none",
      background: featured ? "linear-gradient(135deg, #FF3CAC, #784BA0)" : "rgba(255,255,255,0.08)",
      color: "#fff",
      fontSize: "15px",
      fontWeight: 700,
      cursor: "pointer",
      fontFamily: "inherit",
      transition: "transform 0.15s",
    }),
    closeBtn: {
      position: "absolute",
      top: "16px",
      right: "16px",
      background: "rgba(255,255,255,0.08)",
      border: "none",
      color: "#F0EDE8",
      width: "36px",
      height: "36px",
      borderRadius: "50%",
      cursor: "pointer",
      fontSize: "18px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    loadingGrid: {
      display: "grid",
      gridTemplateColumns: previewSize === "phone" ? "repeat(3, 1fr)" : "repeat(2, 1fr)",
      gap: "16px",
      maxWidth: "840px",
      margin: "40px auto 0",
      padding: "0 24px",
    },
    skeleton: {
      borderRadius: "16px",
      background: "rgba(255,255,255,0.04)",
      aspectRatio: previewSize === "phone" ? "9/19.5" : "16/10",
      animation: "pulse 1.5s ease-in-out infinite",
    },
  };

  const exampleVibes = [
    "sunset over ocean",
    "dark cyberpunk city",
    "pastel dreamscape",
    "neon tokyo night",
    "minimal zen garden",
    "retro 80s synthwave",
    "deep space nebula",
    "forest morning mist",
  ];

  const renderLanding = () => (
    <>
      <div style={styles.hero}>
        <div style={styles.badge}>
          <SparkleIcon /> Generative AI Wallpapers
        </div>
        <h1 style={styles.h1}>
          Type a vibe.
          <br />
          <span style={{
            background: "linear-gradient(135deg, #FF3CAC, #784BA0, #2B86C5)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>
            Get a wallpaper.
          </span>
        </h1>
        <p style={styles.subtitle}>
          Describe any aesthetic, mood, or scene — VYBE generates unique wallpapers for your phone and desktop instantly.
        </p>
        <div style={styles.inputRow}>
          <input
            style={styles.input}
            placeholder="Describe your vibe..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && generate()}
            onFocus={(e) => (e.target.style.borderColor = "rgba(255,60,172,0.5)")}
            onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
          />
          <button
            style={{
              ...styles.generateBtn,
              opacity: generating ? 0.6 : 1,
              transform: generating ? "scale(0.97)" : "scale(1)",
            }}
            onClick={generate}
            disabled={generating}
            onMouseOver={(e) => !generating && (e.currentTarget.style.transform = "scale(1.03)")}
            onMouseOut={(e) => !generating && (e.currentTarget.style.transform = "scale(1)")}
          >
            <ZapIcon /> {generating ? "Creating..." : "Generate"}
          </button>
        </div>

        <div style={styles.sizeToggle}>
          {["desktop", "phone"].map((s) => (
            <button
              key={s}
              style={styles.sizeBtn(previewSize === s)}
              onClick={() => {
                setPreviewSize(s);
                if (wallpapers.length > 0) {
                  // Regenerate with new size
                  const results = [];
                  for (let i = 0; i < 6; i++) {
                    const canvas = document.createElement("canvas");
                    generateWallpaper(canvas, prompt.trim(), i, s);
                    results.push({
                      id: i,
                      dataUrl: canvas.toDataURL("image/png"),
                      variation: i,
                    });
                  }
                  setWallpapers(results);
                }
              }}
            >
              {s === "desktop" ? "Desktop" : "Phone"}
            </button>
          ))}
        </div>

        {!wallpapers.length && !generating && (
          <div style={styles.examples}>
            {exampleVibes.map((v) => (
              <button
                key={v}
                style={styles.exTag}
                onClick={() => { setPrompt(v); }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
                  e.currentTarget.style.color = "#F0EDE8";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                  e.currentTarget.style.color = "rgba(240,237,232,0.5)";
                }}
              >
                {v}
              </button>
            ))}
          </div>
        )}
      </div>

      {generating && (
        <div style={styles.loadingGrid}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{ ...styles.skeleton, animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      )}

      {wallpapers.length > 0 && (
        <>
          <div style={styles.grid}>
            {wallpapers.map((wp) => (
              <div
                key={wp.id}
                style={styles.card(selectedWp === wp.id)}
                onClick={() => setSelectedWp(wp.id)}
                onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
                onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
              >
                <img src={wp.dataUrl} alt="" style={styles.cardImg} />
                <div style={styles.cardOverlay}>
                  <button
                    style={styles.dlBtn}
                    onClick={(e) => { e.stopPropagation(); handleDownload(wp); }}
                    onMouseOver={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.25)")}
                    onMouseOut={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.15)")}
                  >
                    <DownloadIcon /> Download
                  </button>
                </div>
              </div>
            ))}
          </div>
          <p style={styles.freeCounter}>
            {freeDownloads > 0
              ? `${freeDownloads} free download${freeDownloads !== 1 ? "s" : ""} remaining`
              : ""}
            {freeDownloads <= 0 && (
              <button
                onClick={() => setShowPricing(true)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#FF3CAC",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontSize: "13px",
                  fontWeight: 600,
                  textDecoration: "underline",
                }}
              >
                Upgrade to Pro for unlimited downloads
              </button>
            )}
          </p>
        </>
      )}
    </>
  );

  const renderPricingModal = () => (
    <div style={styles.overlay} onClick={() => setShowPricing(false)}>
      <div style={{ ...styles.modal, position: "relative" }} onClick={(e) => e.stopPropagation()}>
        <button style={styles.closeBtn} onClick={() => setShowPricing(false)}>×</button>
        <div style={{ textAlign: "center", marginBottom: "8px" }}>
          <div style={styles.badge}><SparkleIcon /> Unlock VYBE Pro</div>
        </div>
        <h2 style={{ fontSize: "32px", fontWeight: 800, textAlign: "center", margin: "0 0 8px", letterSpacing: "-1px" }}>
          Unlimited wallpapers.
          <br />
          <span style={{ color: "rgba(240,237,232,0.4)" }}>Zero limits.</span>
        </h2>
        <div style={styles.pricingGrid}>
          {/* Free tier */}
          <div style={styles.priceCard(false)}>
            <span style={{ fontSize: "13px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: "rgba(240,237,232,0.4)" }}>Free</span>
            <div style={styles.priceAmount}>$0</div>
            <div style={styles.priceLabel}>forever</div>
            <ul style={styles.featureList}>
              {["3 downloads per day", "Standard resolution", "Desktop + Phone sizes", "Basic vibes"].map((f) => (
                <li key={f} style={styles.featureItem}>
                  <span style={{ color: "rgba(255,255,255,0.2)" }}><CheckIcon /></span> {f}
                </li>
              ))}
            </ul>
            <button style={styles.buyBtn(false)} onClick={() => setShowPricing(false)}>Current Plan</button>
          </div>
          {/* Pro tier */}
          <div style={styles.priceCard(true)}>
            <span style={{ fontSize: "13px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: "#FF3CAC" }}>Pro</span>
            <div style={styles.priceAmount}>
              $9<span style={{ fontSize: "24px", fontWeight: 600 }}>.99</span>
            </div>
            <div style={styles.priceLabel}>per month</div>
            <ul style={styles.featureList}>
              {["Unlimited downloads", "4K resolution", "All device sizes", "Advanced vibes + styles", "No watermark", "Priority generation"].map((f) => (
                <li key={f} style={styles.featureItem}>
                  <span style={{ color: "#FF3CAC" }}><CheckIcon /></span> {f}
                </li>
              ))}
            </ul>
            <button
              style={styles.buyBtn(true)}
              onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
              onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
              onClick={() => alert("🔗 This is where Stripe Checkout would open!\n\nTo set this up:\n1. Create a Stripe account\n2. Add a $9.99/mo subscription product\n3. Replace this with Stripe Checkout redirect")}
            >
              Upgrade to Pro
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={styles.app}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.15; }
        }
        ::selection { background: rgba(255,60,172,0.3); }
        input::placeholder { color: rgba(240,237,232,0.25); }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
      `}</style>

      {/* Nav */}
      <nav style={styles.nav}>
        <div style={styles.logo}>VYBE</div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button
            style={styles.navBtn}
            onClick={() => setShowPricing(true)}
            onMouseOver={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)")}
            onMouseOut={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)")}
          >
            Pricing
          </button>
          <button
            style={{
              ...styles.navBtn,
              background: "linear-gradient(135deg, #FF3CAC, #784BA0)",
              border: "none",
            }}
            onClick={() => setShowPricing(true)}
          >
            Get Pro
          </button>
        </div>
      </nav>

      {renderLanding()}

      {/* Footer */}
      <div style={{
        textAlign: "center",
        padding: "60px 24px 32px",
        fontSize: "12px",
        color: "rgba(240,237,232,0.2)",
      }}>
        VYBE © 2026 — All wallpapers are uniquely generated.
      </div>

      {showPricing && renderPricingModal()}
    </div>
  );
}
