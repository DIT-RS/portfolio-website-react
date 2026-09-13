import { useEffect, useRef, useState, useCallback } from 'react';
import { SudokuGame } from './SudokuGame';
import { useTheme } from '../context/ThemeContext';

// ─── Constants ────────────────────────────────────────────────────────────────

const CELL = 16;
const COLS = 14;   // 224px wide
const ROWS = 24;   // 384px tall
const IDLE_TICK_MS = 200;
const TICK_START   = 200;  // ms per tick at score 0
const TICK_MIN     = 65;   // fastest possible tick
const TICK_STEP    = 20;   // ms reduction per 5 points
function tickMs(score: number) {
  return Math.max(TICK_MIN, TICK_START - Math.floor(score / 5) * TICK_STEP);
}

type Dir   = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type Phase = 'idle' | 'countdown' | 'playing' | 'dead';
interface Pt { x: number; y: number }

// ─── Helpers ──────────────────────────────────────────────────────────────────

function randCell(snake: Pt[]): Pt {
  const occ = new Set(snake.map(p => `${p.x},${p.y}`));
  let pt: Pt;
  do { pt = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) }; }
  while (occ.has(`${pt.x},${pt.y}`));
  return pt;
}
function ptEq(a: Pt, b: Pt) { return a.x === b.x && a.y === b.y; }
function step(h: Pt, d: Dir): Pt {
  if (d === 'UP')   return { x: h.x,     y: h.y - 1 };
  if (d === 'DOWN') return { x: h.x,     y: h.y + 1 };
  if (d === 'LEFT') return { x: h.x - 1, y: h.y };
  return                   { x: h.x + 1, y: h.y };
}
function aiMove(from: Pt, to: Pt, snake: Pt[]): Dir {
  const blocked = new Set(snake.slice(0, -1).map(p => `${p.x},${p.y}`));
  const all: Dir[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
  const queue: { pt: Pt; first: Dir }[] = [];
  const seen = new Set<string>([`${from.x},${from.y}`]);
  for (const d of all) {
    const n = step(from, d);
    if (n.x < 0 || n.x >= COLS || n.y < 0 || n.y >= ROWS) continue;
    if (blocked.has(`${n.x},${n.y}`)) continue;
    queue.push({ pt: n, first: d }); seen.add(`${n.x},${n.y}`);
  }
  while (queue.length) {
    const { pt, first } = queue.shift()!;
    if (ptEq(pt, to)) return first;
    for (const d of all) {
      const n = step(pt, d); const k = `${n.x},${n.y}`;
      if (n.x < 0 || n.x >= COLS || n.y < 0 || n.y >= ROWS) continue;
      if (blocked.has(k) || seen.has(k)) continue;
      seen.add(k); queue.push({ pt: n, first });
    }
  }
  for (const d of all) {
    const n = step(from, d);
    if (n.x >= 0 && n.x < COLS && n.y >= 0 && n.y < ROWS && !blocked.has(`${n.x},${n.y}`)) return d;
  }
  return 'RIGHT';
}

// ─── Game hook ────────────────────────────────────────────────────────────────

const S0: Pt[] = [{ x: 5, y: 12 }, { x: 4, y: 12 }, { x: 3, y: 12 }];
const F0: Pt   = { x: 7, y: 7 };
const HS_KEY   = 'snake_high_score';

function useSnake() {
  const [phase,     setPhase]     = useState<Phase>('idle');
  const [snake,     setSnake]     = useState<Pt[]>(S0);
  const [food,      setFood]      = useState<Pt>(F0);
  const [dir,       setDir]       = useState<Dir>('RIGHT');
  const [score,     setScore]     = useState(0);
  const [countdown, setCountdown] = useState(3);
  const [flash,     setFlash]     = useState(false);
  const [highScore, setHighScore] = useState<number>(() => {
    try { return parseInt(localStorage.getItem(HS_KEY) || '0', 10) || 0; } catch { return 0; }
  });
  const [newRecord, setNewRecord] = useState(false);

  const rP = useRef<Phase>('idle');
  const rS = useRef<Pt[]>(S0);
  const rF = useRef<Pt>(F0);
  const rD = useRef<Dir>('RIGHT');

  const commit = (p: Phase, s: Pt[], f: Pt, d: Dir) => {
    rP.current = p; setPhase(p);
    rS.current = s; setSnake(s);
    rF.current = f; setFood(f);
    rD.current = d; setDir(d);
  };

  useEffect(() => {
    if (phase !== 'idle') return;
    const id = setInterval(() => {
      if (rP.current !== 'idle') return;
      const s = rS.current, f = rF.current;
      const d = aiMove(s[0], f, s);
      const nh = { x: (step(s[0], d).x + COLS) % COLS, y: (step(s[0], d).y + ROWS) % ROWS };
      let ns = [nh, ...s];
      if (ptEq(nh, f)) { const nf = randCell(ns); rF.current = nf; setFood(nf); }
      else ns = ns.slice(0, -1);
      rS.current = ns; setSnake(ns);
    }, IDLE_TICK_MS);
    return () => clearInterval(id);
  }, [phase]);

  const startGame = useCallback(() => {
    rP.current = 'countdown'; setPhase('countdown'); setCountdown(3);
    let c = 3;
    const id = setInterval(() => {
      c--; setCountdown(c);
      if (c <= 0) {
        clearInterval(id);
        const s = [...S0], f = randCell(s);
        commit('playing', s, f, 'RIGHT'); setScore(0);
      }
    }, 750);
  }, []);

  const rScore = useRef(0);
  useEffect(() => { rScore.current = score; }, [score]);

  useEffect(() => {
    if (phase !== 'playing') return;
    const ms = tickMs(score);
    const id = setInterval(() => {
      if (rP.current !== 'playing') return;
      const nh = step(rS.current[0], rD.current);
      if (nh.x < 0 || nh.x >= COLS || nh.y < 0 || nh.y >= ROWS) {
        rP.current = 'dead'; setPhase('dead');
        setHighScore(prev => {
          const final = rScore.current;
          if (final > prev) {
            setNewRecord(true);
            try { localStorage.setItem(HS_KEY, String(final)); } catch {}
            return final;
          }
          return prev;
        });
        return;
      }
      if (rS.current.slice(0, -1).some(p => ptEq(p, nh))) {
        rP.current = 'dead'; setPhase('dead');
        setHighScore(prev => {
          const final = rScore.current;
          if (final > prev) {
            setNewRecord(true);
            try { localStorage.setItem(HS_KEY, String(final)); } catch {}
            return final;
          }
          return prev;
        });
        return;
      }
      let ns = [nh, ...rS.current];
      if (ptEq(nh, rF.current)) {
        const nf = randCell(ns); rF.current = nf; setFood(nf);
        setScore(sc => { rScore.current = sc + 1; return sc + 1; });
        setFlash(true); setTimeout(() => setFlash(false), 180);
      } else ns = ns.slice(0, -1);
      rS.current = ns; setSnake(ns);
    }, ms);
    return () => clearInterval(id);
  }, [phase, score]);

  const onKey = useCallback((e: KeyboardEvent) => {
    if (rP.current !== 'playing') return;
    const map: Record<string, Dir> = { ArrowUp:'UP',w:'UP',W:'UP', ArrowDown:'DOWN',s:'DOWN',S:'DOWN', ArrowLeft:'LEFT',a:'LEFT',A:'LEFT', ArrowRight:'RIGHT',d:'RIGHT',D:'RIGHT' };
    const nd = map[e.key]; if (!nd) return;
    e.preventDefault();
    const opp: Record<Dir,Dir> = { UP:'DOWN', DOWN:'UP', LEFT:'RIGHT', RIGHT:'LEFT' };
    if (nd !== opp[rD.current]) { rD.current = nd; setDir(nd); }
  }, []);
  useEffect(() => { window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey); }, [onKey]);

  const resetToIdle = useCallback(() => {
    commit('idle', [...S0], F0, 'RIGHT');
    setScore(0);
    setNewRecord(false);
  }, []);
  return { phase, snake, food, dir, score, highScore, newRecord, countdown, flash, startGame, resetToIdle };
}

// ─── Canvas ───────────────────────────────────────────────────────────────────

function GameCanvas({ snake, food, phase, flash, light }: { snake: Pt[]; food: Pt; phase: Phase; flash: boolean; light: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const W = COLS * CELL, H = ROWS * CELL;
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext('2d'); if (!ctx) return;
    ctx.clearRect(0, 0, W, H);

    // Grid lines
    ctx.strokeStyle = light ? 'rgba(0,0,0,0.07)' : 'rgba(255,255,255,0.028)';
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= COLS; x++) { ctx.beginPath(); ctx.moveTo(x*CELL,0); ctx.lineTo(x*CELL,H); ctx.stroke(); }
    for (let y = 0; y <= ROWS; y++) { ctx.beginPath(); ctx.moveTo(0,y*CELL); ctx.lineTo(W,y*CELL); ctx.stroke(); }

    // Food
    const fx = food.x*CELL+CELL/2, fy = food.y*CELL+CELL/2;
    const fg = ctx.createRadialGradient(fx,fy,0,fx,fy,CELL);
    fg.addColorStop(0, flash ? 'rgba(255,255,255,0.95)' : 'rgba(59,130,246,0.9)');
    fg.addColorStop(1, 'rgba(59,130,246,0)');
    ctx.fillStyle = fg; ctx.beginPath(); ctx.arc(fx,fy,CELL,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(fx,fy,CELL*0.28,0,Math.PI*2);
    ctx.fillStyle = flash ? '#ffffff' : '#93c5fd'; ctx.fill();

    // Snake
    const len = snake.length;
    snake.forEach((seg, i) => {
      const t = i / Math.max(len-1,1);
      const dim = phase === 'idle';
      const alpha = light
        ? (dim ? 0.15+(1-t)*0.1 : 0.55+(1-t)*0.35)
        : (dim ? 0.22+(1-t)*0.18 : 0.6+(1-t)*0.38);
      const r  = Math.round(59  + t*(20-59));
      const g2 = Math.round(130 + t*(35-130));
      const b  = Math.round(246 + t*(70-246));
      const pad = 1.5+t*1.5, cr = Math.max(2,CELL/2-pad);
      ctx.fillStyle = `rgba(${r},${g2},${b},${alpha})`;
      ctx.beginPath(); ctx.roundRect(seg.x*CELL+pad,seg.y*CELL+pad,CELL-pad*2,CELL-pad*2,cr); ctx.fill();
      if (i===0 && !dim) {
        ctx.fillStyle = `rgba(147,197,253,${alpha*0.6})`;
        ctx.beginPath(); ctx.arc(seg.x*CELL+CELL/2,seg.y*CELL+CELL/2,CELL*0.18,0,Math.PI*2); ctx.fill();
      }
    });
  }, [snake, food, phase, flash, light, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ display: 'block', imageRendering: 'pixelated', background: light ? '#f0f2f8' : '#0a0b10' }} />;
}

// ─── D-pad ────────────────────────────────────────────────────────────────────

function DPad({ onDir, light, large }: { onDir: (d: Dir) => void; light: boolean; large?: boolean }) {
  const sz = large ? 48 : 32;
  const B = ({ d, lbl }: { d: Dir; lbl: string }) => (
    <button
      onPointerDown={e => { e.preventDefault(); onDir(d); }}
      style={{
        width: sz, height: sz, display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: large ? 12 : 8,
        background: light ? '#e8eaf4' : '#151820',
        border: `1px solid ${light ? '#cdd0e0' : '#252a3a'}`,
        color: light ? '#6070a0' : '#555d75',
        fontSize: large ? 16 : 10, cursor: 'pointer', userSelect: 'none',
      }}
    >{lbl}</button>
  );
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(3, ${sz}px)`, gap: large ? 6 : 4, width: 'fit-content', margin: '0 auto' }}>
      <div /><B d="UP" lbl="▲" /><div />
      <B d="LEFT" lbl="◀" /><B d="DOWN" lbl="▼" /><B d="RIGHT" lbl="▶" />
    </div>
  );
}

// ─── Game registry ────────────────────────────────────────────────────────────

const GAMES = [
  { id: 'snake',  label: 'Snake',  pw: COLS * CELL },
  { id: 'sudoku', label: 'Sudoku', pw: 236 },
];

const TAB_MS = 300;
const TAB_EASE = 'cubic-bezier(0.4,0,0.2,1)';

// ─── Main export ──────────────────────────────────────────────────────────────

export function SnakeGame() {
  const { theme } = useTheme();
  const light = theme === 'light';

  const { phase, snake, food, score, highScore, newRecord, countdown, flash, startGame, resetToIdle } = useSnake();
  const [open,    setOpen]    = useState(false);
  const [gameIdx, setGameIdx] = useState(0);
  const rDir = useRef<Dir>('RIGHT');

  const handleMobileDir = useCallback((d: Dir) => {
    const opp: Record<Dir,Dir> = { UP:'DOWN', DOWN:'UP', LEFT:'RIGHT', RIGHT:'LEFT' };
    if (d === opp[rDir.current]) return;
    rDir.current = d;
    const keys: Record<Dir,string> = { UP:'ArrowUp', DOWN:'ArrowDown', LEFT:'ArrowLeft', RIGHT:'ArrowRight' };
    window.dispatchEvent(new KeyboardEvent('keydown', { key: keys[d] }));
  }, []);

  const handleClose = () => { setOpen(false); resetToIdle(); };
  const prevGame = () => { resetToIdle(); setGameIdx(i => (i - 1 + GAMES.length) % GAMES.length); };
  const nextGame = () => { resetToIdle(); setGameIdx(i => (i + 1) % GAMES.length); };

  const currentGame = GAMES[gameIdx];
  const isPlaying = phase === 'playing';
  const PW = currentGame.pw;

  // Layout mode — desktop keeps right-edge panel, mobile uses bottom sheet
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // ── Theme tokens ─────────────────────────────────────────────────────────────
  const T = {
    panelBg:      light ? '#f0f2f8' : '#0d0f1a',
    headerBg:     light ? '#e8eaf4' : '#10121e',
    headerBorder: light ? '#cdd0e4' : '#1e2235',
    panelBorder:  isPlaying ? 'rgba(59,130,246,0.4)' : (light ? 'rgba(59,130,246,0.25)' : 'rgba(27,30,44,0.9)'),
    panelShadow:  isPlaying
      ? '-8px 0 32px -4px rgba(59,130,246,0.22)'
      : (light ? '-6px 0 24px -4px rgba(100,120,180,0.18)' : '-6px 0 24px -4px rgba(0,0,0,0.7)'),
    arrowBg:      light ? 'rgba(59,130,246,0.07)' : 'rgba(59,130,246,0.06)',
    arrowBorder:  light ? '#b8c4e0' : '#2e3a55',
    arrowColor:   GAMES.length > 1 ? (light ? '#4060a0' : '#6080c0') : (light ? '#b0bcd8' : '#2e3a55'),
    closeBorder:  light ? '#c0cadf' : '#2e3a55',
    closeColor:   light ? '#6070a0' : '#5a6a90',
    labelColor:   light ? '#5060a0' : '#7a90c0',
    dotInactive:  light ? '#a0b4d8' : '#2a3a60',
    footerBg:     light ? '#e8eaf4' : '#0c0d14',
    footerBorder: light ? '#cdd0e0' : '#141720',
    kbdBg:        light ? '#dde0ee' : '#0e1018',
    kbdBorder:    light ? '#c0c8df' : '#181c28',
    kbdColor:     light ? '#5060a0' : '#2e3650',
    scoreLabel:   light ? '#8090b8' : '#3b4c70',
    scoreValue:   light ? '#2a50c0' : '#7aa2e0',
    spdLabel:     light ? '#9090b0' : '#2e3a55',
    tabBg:        open ? (light ? '#dde2f0' : '#111828') : (light ? '#e8eaf4' : '#0e1220'),
    tabBorderColor: open ? 'rgba(59,130,246,0.55)' : (light ? 'rgba(59,130,246,0.3)' : 'rgba(59,130,246,0.3)'),
    tabChevron:   open ? (light ? '#3060b0' : '#7aa2e0') : (light ? '#5070a8' : '#5a7ab8'),
    tabDotBase:   open ? '#3b82f6' : (light ? '#6090cc' : '#4060a0'),
    tabLabel:     open ? (light ? '#3060b0' : '#6a90d0') : (light ? '#5878b0' : '#4a6aaa'),
  };

  // ── Shared panel content (same for both layouts) ─────────────────────────────
  const panelContent = (
    <>
      {/* ── Game selector header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', borderBottom: `1px solid ${T.headerBorder}`, background: T.headerBg }}>
        <button onClick={prevGame} title="Previous game" style={{ fontFamily: 'monospace', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6, background: T.arrowBg, border: `1px solid ${T.arrowBorder}`, color: T.arrowColor, fontSize: 11, cursor: GAMES.length > 1 ? 'pointer' : 'default', transition: 'border-color 200ms, color 200ms' }}>‹</button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', display: 'inline-block', background: isPlaying ? '#3b82f6' : T.dotInactive, boxShadow: isPlaying ? '0 0 7px #3b82f6' : 'none', transition: 'all 300ms' }} />
          <span style={{ fontFamily: 'monospace', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: T.labelColor, fontWeight: 600 }}>{currentGame.label}</span>
          {GAMES.length > 1 && (
            <div style={{ display: 'flex', gap: 3, marginLeft: 2 }}>
              {GAMES.map((_, i) => (
                <span key={i} style={{ width: i === gameIdx ? 12 : 5, height: 4, borderRadius: 2, display: 'inline-block', background: i === gameIdx ? '#3b82f6' : T.dotInactive, transition: 'all 250ms ease' }} />
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button onClick={nextGame} title="Next game" style={{ fontFamily: 'monospace', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6, background: T.arrowBg, border: `1px solid ${T.arrowBorder}`, color: T.arrowColor, fontSize: 11, cursor: GAMES.length > 1 ? 'pointer' : 'default', transition: 'border-color 200ms, color 200ms' }}>›</button>
          <button onClick={handleClose} style={{ width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6, background: 'none', border: `1px solid ${T.closeBorder}`, color: T.closeColor, fontSize: 11, cursor: 'pointer', lineHeight: 1, transition: 'color 200ms' }}>✕</button>
        </div>
      </div>

      {/* ── Game content ── */}
      {currentGame.id === 'sudoku' ? (
        <SudokuGame panelWidth={isMobile ? Math.min(window.innerWidth - 32, 360) : PW} light={light} active={open} />
      ) : (
        <>
          {/* Canvas wrapper — centres canvas and adds a visible border on mobile */}
          <div style={{
            display: 'flex', justifyContent: 'center',
            padding: isMobile ? '8px 0' : 0,
            background: isMobile ? (light ? '#e4e6f2' : '#080910') : undefined,
          }}>
          <div style={{
            position: 'relative',
            border: isMobile ? `2px solid ${light ? '#8090c0' : '#2a3a60'}` : undefined,
            borderRadius: isMobile ? 8 : 0,
            overflow: 'hidden',
            boxShadow: isMobile ? (light ? '0 2px 16px rgba(80,100,180,0.15)' : '0 2px 20px rgba(0,0,0,0.6)') : undefined,
          }}>
            <GameCanvas snake={snake} food={food} phase={phase} flash={flash} light={light} />
            {phase === 'idle' && (
              <button onClick={startGame} style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, background: light ? 'rgba(230,233,245,0.6)' : 'rgba(10,11,16,0.52)', backdropFilter: 'blur(1px)', border: 'none', cursor: 'pointer', width: '100%' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', border: '1px solid rgba(59,130,246,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(59,130,246,0.08)' }}>
                  <span style={{ color: '#3b82f6', fontSize: 14, marginLeft: 2 }}>▶</span>
                </div>
                <span style={{ fontFamily: 'monospace', fontSize: 9, color: light ? '#7080b0' : '#3b4c70', textTransform: 'uppercase', letterSpacing: '0.12em' }}>tap to play</span>
              </button>
            )}
            {phase === 'countdown' && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, background: light ? 'rgba(220,225,240,0.82)' : 'rgba(10,11,16,0.78)' }}>
                <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 52, color: light ? '#1a2a60' : '#fff', lineHeight: 1, textShadow: '0 0 32px rgba(59,130,246,0.9)' }}>{countdown}</span>
                <span style={{ fontFamily: 'monospace', fontSize: 9, color: light ? '#8090b8' : '#3b4260', textTransform: 'uppercase', letterSpacing: '0.1em' }}>get ready</span>
              </div>
            )}
            {phase === 'dead' && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, background: light ? 'rgba(220,225,240,0.88)' : 'rgba(10,11,16,0.84)' }}>
                {newRecord && score > 0 ? (
                  <div className="snake-new-best-label" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                    <span className="snake-trophy" style={{ fontSize: 18, lineHeight: 1 }}>🏆</span>
                    <span style={{ fontFamily: 'monospace', fontSize: 10, fontWeight: 700, color: light ? '#b45309' : '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.14em', textShadow: light ? 'none' : '0 0 12px rgba(251,191,36,0.7)' }}>new best!</span>
                  </div>
                ) : (
                  <span style={{ fontFamily: 'monospace', fontSize: 9, color: 'rgba(248,113,113,0.85)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>game over</span>
                )}
                <span className={newRecord && score > 0 ? 'snake-new-best' : ''} style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 40, color: newRecord && score > 0 ? (light ? '#b45309' : '#fbbf24') : (light ? '#1a2a60' : '#fff'), lineHeight: 1, textShadow: newRecord && score > 0 && !light ? '0 0 24px rgba(251,191,36,0.5)' : 'none' }}>{score}</span>
                <span style={{ fontFamily: 'monospace', fontSize: 9, color: light ? '#8090b8' : '#3b4060' }}>pts</span>
                {highScore > 0 && (
                  <span style={{ fontFamily: 'monospace', fontSize: 8, color: light ? '#7080a8' : '#4a5878', letterSpacing: '0.08em' }}>
                    best <span style={{ color: newRecord && score > 0 ? (light ? '#b45309' : '#fbbf24') : (light ? '#3060a0' : '#6080b0'), fontWeight: 700 }}>{highScore}</span>
                  </span>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4, width: '100%', padding: '0 20px' }}>
                  <button onClick={startGame} style={{ fontFamily: 'monospace', padding: '5px 0', borderRadius: 8, fontSize: 9, background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.28)', color: light ? '#2050c0' : '#93c5fd', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.1em' }}>retry</button>
                  <button onClick={handleClose} style={{ fontFamily: 'monospace', padding: '5px 0', borderRadius: 8, fontSize: 9, background: light ? '#dde0ee' : '#13151e', border: `1px solid ${light ? '#c0cadf' : '#1e2232'}`, color: light ? '#7080a8' : '#3b4060', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.1em' }}>exit</button>
                </div>
              </div>
            )}
          </div>
          </div>
          <div style={{ padding: '7px 10px', borderTop: `1px solid ${T.footerBorder}`, background: T.footerBg }}>
            {phase === 'playing' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: 8, color: T.scoreLabel, letterSpacing: '0.08em' }}>
                    score <span style={{ color: T.scoreValue, fontWeight: 700 }}>{score}</span>
                  </span>
                  {highScore > 0 && (
                    <span style={{ fontFamily: 'monospace', fontSize: 8, color: T.scoreLabel, letterSpacing: '0.08em' }}>
                      best <span style={{ color: light ? '#3060a0' : '#6080b0', fontWeight: 700 }}>{highScore}</span>
                    </span>
                  )}
                  <span style={{ fontFamily: 'monospace', fontSize: 8, color: T.spdLabel, letterSpacing: '0.06em' }}>
                    spd{' '}<span style={{ color: score >= 30 ? '#f87171' : score >= 15 ? (light ? '#b45309' : '#fbbf24') : '#3b82f6' }}>{Math.round((TICK_START - tickMs(score)) / (TICK_START - TICK_MIN) * 100)}%</span>
                  </span>
                </div>
                <p style={{ fontFamily: 'monospace', fontSize: 8, color: light ? '#9090b8' : '#1e2438', textAlign: 'center', letterSpacing: '0.05em', margin: 0 }}>
                  {isMobile ? 'use d-pad below' : '↑↓←→ · W A S D'}
                </p>
                <DPad onDir={handleMobileDir} light={light} large={isMobile} />
              </div>
            )}
            {(phase === 'idle' || phase === 'dead') && (
              <div style={{ display: 'flex', gap: 3, justifyContent: 'space-between' }}>
                {(['↑/W','↓/S','←/A','→/D'] as const).map(k => (
                  <span key={k} style={{ fontFamily: 'monospace', fontSize: 8, color: T.kbdColor, background: T.kbdBg, padding: '2px 5px', borderRadius: 4, border: `1px solid ${T.kbdBorder}` }}>{k}</span>
                ))}
              </div>
            )}
            {phase === 'countdown' && (
              <p style={{ fontFamily: 'monospace', fontSize: 8, color: light ? '#9090b8' : '#1e2438', textAlign: 'center', margin: 0, letterSpacing: '0.05em' }}>starting…</p>
            )}
          </div>
        </>
      )}
    </>
  );

  return (
    <>
      {/* Shared by both layouts; the hover rules below are desktop-only */}
      <style>{`
        @keyframes dot-pulse {
          0%, 100% { opacity: 0.3;  box-shadow: 0 0 2px rgba(59,130,246,0.15); }
          50%       { opacity: 1;   box-shadow: 0 0 12px rgba(59,130,246,1), 0 0 4px #fff; }
        }
        .game-tab-dot-pulse { animation: dot-pulse 2.0s ease-in-out infinite; }
      `}</style>

      {/* ════════════════════════════════════════════════════════════
          MOBILE — bottom sheet
      ════════════════════════════════════════════════════════════ */}
      {isMobile && (
        <>
          {/* Lock page scroll while sheet is open */}
          {open && (
            <style>{`body { overflow: hidden !important; touch-action: none; }`}</style>
          )}

          {/* Backdrop */}
          {open && (
            <div
              onClick={handleClose}
              style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)' }}
            />
          )}

          {/* Bottom sheet */}
          <div style={{
            position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9999,
            transform: open ? 'translateY(0)' : 'translateY(100%)',
            transition: 'transform 340ms cubic-bezier(0.4,0,0.2,1)',
            pointerEvents: open ? 'auto' : 'none',
          }}>
            <div style={{
              background: T.panelBg,
              borderTop: `1px solid ${T.panelBorder}`,
              borderLeft: `1px solid ${T.panelBorder}`,
              borderRight: `1px solid ${T.panelBorder}`,
              borderRadius: '16px 16px 0 0',
              maxHeight: '88vh', overflowY: 'auto', scrollbarWidth: 'none',
              boxShadow: '0 -8px 40px rgba(0,0,0,0.4)',
            }}>
              {/* Drag handle */}
              <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 4px' }}>
                <div style={{ width: 36, height: 4, borderRadius: 2, background: light ? '#c8cce0' : '#2a3050' }} />
              </div>
              {/* Centre-constrain content on mobile */}
              <div style={{ maxWidth: 380, margin: '0 auto' }}>
                {panelContent}
              </div>
            </div>
          </div>

          {/* Floating trigger — pill when closed, dot-circle when open */}
          <button
            onClick={() => setOpen(o => !o)}
            aria-label={open ? 'Close games' : 'Open games'}
            aria-expanded={open}
            className="game-tab"
            style={{
              position: 'fixed',
              bottom: open ? 10 : 20,
              right: open ? 10 : 16,
              zIndex: 10000,
              pointerEvents: 'auto',
              display: 'flex', flexDirection: 'row', alignItems: 'center',
              justifyContent: 'center',
              gap: open ? 0 : 8,
              // Explicit height keeps the open state a true circle: the collapsed
              // label is still in flow and is taller than the dot.
              boxSizing: 'border-box',
              height: open ? 40 : 46,
              padding: open ? '0 14px' : '0 20px',
              background: open ? 'rgba(59,130,246,0.15)' : T.tabBg,
              border: `1px solid ${open ? 'rgba(59,130,246,0.5)' : T.tabBorderColor}`,
              borderRadius: 40, cursor: 'pointer', outline: 'none',
              boxShadow: open ? '0 2px 12px rgba(59,130,246,0.35)' : '0 4px 16px rgba(0,0,0,0.25)',
              transition: `padding ${TAB_MS}ms ${TAB_EASE}, gap ${TAB_MS}ms ${TAB_EASE}, height ${TAB_MS}ms ${TAB_EASE}, bottom ${TAB_MS}ms ${TAB_EASE}, right ${TAB_MS}ms ${TAB_EASE}, background 280ms ease, border-color 280ms ease, box-shadow 280ms ease`,
              overflow: 'hidden',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <span className={`game-tab-dot${open ? '' : ' game-tab-dot-pulse'}`} style={{
              display: 'block', flexShrink: 0,
              width: 10, height: 10,
              borderRadius: '50%',
              background: open ? '#3b82f6' : T.tabDotBase,
              boxShadow: open ? '0 0 10px rgba(59,130,246,0.9)' : '0 0 5px rgba(59,130,246,0.3)',
              transition: 'background 280ms ease, box-shadow 280ms ease',
            }} />
            {/* 0fr/1fr collapses to the label's exact width, which max-width cannot do */}
            <span style={{
              display: 'grid',
              gridTemplateColumns: open ? '0fr' : '1fr',
              transition: `grid-template-columns ${TAB_MS}ms ${TAB_EASE}`,
            }}>
              <span style={{
                display: 'flex', alignItems: 'center', gap: 6,
                minWidth: 0, overflow: 'hidden',
                opacity: open ? 0 : 1,
                transition: `opacity ${open ? 140 : 220}ms ease`,
              }}>
                <span className="game-tab-label" style={{ fontFamily: 'monospace', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: T.tabLabel, whiteSpace: 'nowrap', transition: 'color 300ms' }}>games</span>
                <span className="game-tab-chevron" style={{ color: T.tabChevron, fontSize: 13, lineHeight: 1, transform: 'rotate(-90deg)', transition: 'color 300ms' }}>‹</span>
              </span>
            </span>
          </button>
        </>
      )}

      {/* ════════════════════════════════════════════════════════════
          DESKTOP — right-edge slide-out panel (unchanged)
      ════════════════════════════════════════════════════════════ */}
      {!isMobile && (
    <div
      style={{
        position: 'fixed', right: 0, top: '50%', transform: 'translateY(-50%)',
        zIndex: 9999, pointerEvents: 'none', display: 'flex', alignItems: 'center',
      }}
    >
      {/* ── Sliding panel ── */}
      <div style={{ pointerEvents: 'auto', overflow: 'hidden', width: open ? PW + 8 : 0, transition: 'width 320ms cubic-bezier(0.4,0,0.2,1)', flexShrink: 0 }}>
        <div style={{ width: PW, opacity: open ? 1 : 0, transform: open ? 'translateX(0)' : 'translateX(16px)', transition: 'opacity 260ms ease, transform 320ms cubic-bezier(0.4,0,0.2,1)' }}>
          <div style={{
            background: T.panelBg,
            borderTop: `1px solid ${T.panelBorder}`,
            borderBottom: `1px solid ${T.panelBorder}`,
            borderLeft: `1px solid ${T.panelBorder}`,
            borderRight: '0px solid transparent',
            borderRadius: '12px 0 0 12px',
            overflow: 'hidden', maxHeight: 'calc(100vh - 120px)', overflowY: 'auto',
            scrollbarWidth: 'none', boxShadow: T.panelShadow,
            transition: 'border-color 300ms ease, box-shadow 300ms ease, background 180ms ease',
          }}>

            {panelContent}
          </div>
        </div>
      </div>


      {/* Hover styles */}
      <style>{`
        .game-tab:hover {
          background: ${light ? '#d8dcee' : '#141c30'} !important;
          border-top-color: rgba(59,130,246,0.75) !important;
          border-bottom-color: rgba(59,130,246,0.75) !important;
          border-left-color: rgba(59,130,246,0.75) !important;
          box-shadow: -6px 0 22px rgba(59,130,246,0.28) !important;
        }
        .game-tab:hover .game-tab-label { color: ${light ? '#2050c0' : '#93c5fd'} !important; }
        .game-tab:hover .game-tab-chevron { color: ${light ? '#2050c0' : '#93c5fd'} !important; }
        .game-tab:hover .game-tab-dot {
          background: #3b82f6 !important;
          box-shadow: 0 0 10px rgba(59,130,246,0.9) !important;
        }
      `}</style>

      {/* ── Collapsed tab ── */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label={open ? 'Close game panel' : 'Open game panel'}
        className="game-tab"
        style={{
          pointerEvents: 'auto', flexShrink: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer',
          width: 30, height: 96,
          background: T.tabBg,
          borderTop: `1px solid ${T.tabBorderColor}`,
          borderBottom: `1px solid ${T.tabBorderColor}`,
          borderLeft: `1px solid ${T.tabBorderColor}`,
          borderRight: '0px solid transparent',
          borderRadius: '8px 0 0 8px', outline: 'none',
          boxShadow: open ? '-6px 0 20px rgba(59,130,246,0.18)' : '-3px 0 14px rgba(59,130,246,0.08)',
          transition: 'background 300ms, box-shadow 300ms',
        }}
      >
        <span className="game-tab-chevron" style={{ color: T.tabChevron, fontSize: 12, lineHeight: 1, transition: 'transform 300ms ease, color 300ms', transform: open ? 'rotate(0deg)' : 'rotate(180deg)' }}>‹</span>
        <span className={`game-tab-dot${open ? '' : ' game-tab-dot-pulse'}`} style={{ display: 'block', width: 5, height: 5, borderRadius: '50%', background: T.tabDotBase, boxShadow: open ? '0 0 8px rgba(59,130,246,0.8)' : '0 0 5px rgba(59,130,246,0.3)', transition: 'background 300ms ease, box-shadow 300ms ease' }} />
        <span className="game-tab-label" style={{ fontFamily: 'monospace', fontSize: 8, letterSpacing: '0.16em', textTransform: 'uppercase', writingMode: 'vertical-rl', transform: 'rotate(180deg)', color: T.tabLabel, transition: 'color 300ms' }}>games</span>
      </button>
    </div>
      )}
    </>
  );
}
