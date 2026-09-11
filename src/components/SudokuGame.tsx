import { useState, useCallback, useEffect, useRef } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

type Board      = (number | null)[][];
type Fixed      = boolean[][];
type Status     = 'playing' | 'submitted' | 'solved' | 'revealed';

// ─── Puzzle generator ─────────────────────────────────────────────────────────

function emptyBoard(): Board {
  return Array.from({ length: 9 }, () => Array(9).fill(null));
}

function isValid(board: Board, row: number, col: number, num: number): boolean {
  for (let i = 0; i < 9; i++) {
    if (board[row][i] === num) return false;
    if (board[i][col] === num) return false;
  }
  const br = Math.floor(row / 3) * 3;
  const bc = Math.floor(col / 3) * 3;
  for (let r = br; r < br + 3; r++)
    for (let c = bc; c < bc + 3; c++)
      if (board[r][c] === num) return false;
  return true;
}

function solve(board: Board, randomise = false): boolean {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] !== null) continue;
      const nums = [1,2,3,4,5,6,7,8,9];
      if (randomise) nums.sort(() => Math.random() - 0.5);
      for (const n of nums) {
        if (isValid(board, row, col, n)) {
          board[row][col] = n;
          if (solve(board, randomise)) return true;
          board[row][col] = null;
        }
      }
      return false;
    }
  }
  return true;
}

function countSolutions(board: Board, limit = 2): number {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] !== null) continue;
      let count = 0;
      for (let n = 1; n <= 9; n++) {
        if (isValid(board, row, col, n)) {
          board[row][col] = n;
          count += countSolutions(board, limit - count);
          board[row][col] = null;
          if (count >= limit) return count;
        }
      }
      return count;
    }
  }
  return 1;
}

type Difficulty = 'easy' | 'medium' | 'hard';
const CLUES: Record<Difficulty, number> = { easy: 38, medium: 30, hard: 24 };

function generatePuzzle(difficulty: Difficulty): { puzzle: Board; solution: Board } {
  const solution = emptyBoard();
  solve(solution, true);
  const puzzle: Board = solution.map(r => [...r]);
  const cells = Array.from({ length: 81 }, (_, i) => i).sort(() => Math.random() - 0.5);
  let filled = 81;
  const target = CLUES[difficulty];
  for (const idx of cells) {
    if (filled <= target) break;
    const row = Math.floor(idx / 9), col = idx % 9;
    const backup = puzzle[row][col];
    puzzle[row][col] = null;
    const copy: Board = puzzle.map(r => [...r]);
    if (countSolutions(copy) !== 1) puzzle[row][col] = backup;
    else filled--;
  }
  return { puzzle, solution };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function deepCopy(b: Board): Board { return b.map(r => [...r]); }

function isBoardComplete(board: Board): boolean {
  return board.every(row => row.every(v => v !== null));
}

function isBoardCorrect(board: Board, solution: Board): boolean {
  for (let r = 0; r < 9; r++)
    for (let c = 0; c < 9; c++)
      if (board[r][c] !== solution[r][c]) return false;
  return true;
}

function hasConflict(board: Board, row: number, col: number): boolean {
  const v = board[row][col];
  if (v === null) return false;
  for (let i = 0; i < 9; i++) {
    if (i !== col && board[row][i] === v) return true;
    if (i !== row && board[i][col] === v) return true;
  }
  const br = Math.floor(row / 3) * 3, bc = Math.floor(col / 3) * 3;
  for (let r = br; r < br + 3; r++)
    for (let c = bc; c < bc + 3; c++)
      if ((r !== row || c !== col) && board[r][c] === v) return true;
  return false;
}

function countErrors(board: Board, solution: Board, fixed: Fixed): number {
  let n = 0;
  for (let r = 0; r < 9; r++)
    for (let c = 0; c < 9; c++)
      if (!fixed[r][c] && board[r][c] !== null && board[r][c] !== solution[r][c]) n++;
  return n;
}

// ─── Confetti burst ───────────────────────────────────────────────────────────

interface ConfettiProps { width: number; height: number; light: boolean; }

function ConfettiBurst({ width, height, light }: ConfettiProps) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext('2d'); if (!ctx) return;

    const COLORS = light
      ? ['#2563eb','#7c3aed','#0891b2','#059669','#d97706','#dc2626']
      : ['#60a5fa','#a78bfa','#34d399','#fbbf24','#f87171','#38bdf8'];

    type Particle = {
      x: number; y: number; vx: number; vy: number;
      r: number; color: string; rot: number; rv: number; life: number;
    };

    // Spawn from the centre of the grid
    const cx = width / 2, cy = height / 2;
    const particles: Particle[] = Array.from({ length: 72 }, () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2.5 + Math.random() * 4.5;
      return {
        x: cx, y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,   // slight upward bias
        r: 3 + Math.random() * 4,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        rot: Math.random() * Math.PI * 2,
        rv: (Math.random() - 0.5) * 0.25,
        life: 1,
      };
    });

    const GRAVITY = 0.12;
    let raf: number;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      let alive = false;
      for (const p of particles) {
        p.vy += GRAVITY;
        p.x  += p.vx;
        p.y  += p.vy;
        p.rot += p.rv;
        p.life -= 0.018;
        if (p.life <= 0) continue;
        alive = true;
        ctx.save();
        ctx.globalAlpha = Math.min(1, p.life * 2);   // fade in fast, out slow
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.r / 2, -p.r * 1.4, p.r, p.r * 2.8);  // narrow rectangle
        ctx.restore();
      }
      if (alive) raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [width, height, light]);

  return (
    <canvas
      ref={ref}
      width={width}
      height={height}
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10 }}
    />
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props { panelWidth: number; light?: boolean; active?: boolean; }

export function SudokuGame({ panelWidth, light = false, active = true }: Props) {
  const [difficulty,  setDifficulty]  = useState<Difficulty>('medium');
  const [solution,    setSolution]    = useState<Board>(() => emptyBoard());
  const [board,       setBoard]       = useState<Board>(() => emptyBoard());
  const [fixed,       setFixed]       = useState<Fixed>(() => Array.from({ length: 9 }, () => Array(9).fill(false)));
  const [selected,    setSelected]    = useState<[number,number] | null>(null);
  const [status,      setStatus]      = useState<Status>('playing');
  const [errorCount,  setErrorCount]  = useState(0);
  const [generating,  setGenerating]  = useState(false);

  const locked = status === 'solved' || status === 'revealed';

  const startNew = useCallback((diff: Difficulty) => {
    setGenerating(true);
    setSelected(null);
    setStatus('playing');
    setErrorCount(0);
    setTimeout(() => {
      const { puzzle: p, solution: s } = generatePuzzle(diff);
      setSolution(s);
      setBoard(deepCopy(p));
      setFixed(p.map(r => r.map(v => v !== null)));
      setGenerating(false);
    }, 10);
  }, []);

  useEffect(() => { startNew('medium'); }, []);

  const handleRefresh   = () => startNew(difficulty);
  const handleDiffChange = (d: Difficulty) => { setDifficulty(d); startNew(d); };

  const handleCellClick = (r: number, c: number) => {
    if (fixed[r][c] || locked) return;
    setSelected([r, c]);
    // Revert to playing if they click after a failed submit
    if (status === 'submitted') setStatus('playing');
  };

  const handleInput = useCallback((num: number | null) => {
    if (!selected || locked) return;
    const [r, c] = selected;
    if (fixed[r][c]) return;
    const next = deepCopy(board);
    next[r][c] = num;
    setBoard(next);
    // Revert submitted state on any edit so errors hide again
    if (status === 'submitted') setStatus('playing');
  }, [selected, board, fixed, locked, status]);

  // ── Erase all ───────────────────────────────────────────────────────────────
  const handleEraseAll = () => {
    setBoard(prev => prev.map((row, r) => row.map((val, c) => fixed[r][c] ? val : null)));
    setSelected(null);
    if (status === 'submitted') setStatus('playing');
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = () => {
    if (!isBoardComplete(board)) {
      // Incomplete — highlight what's filled in that's wrong
      const errs = countErrors(board, solution, fixed);
      setErrorCount(errs);
      setStatus('submitted'); // shows errors but not "solved"
      return;
    }
    if (isBoardCorrect(board, solution)) {
      setErrorCount(0);
      setStatus('solved');
    } else {
      const errs = countErrors(board, solution, fixed);
      setErrorCount(errs);
      setStatus('submitted');
    }
  };

  const [showConfetti, setShowConfetti] = useState(false);

  // Fire confetti once on solve, auto-clear after animation (~3 s)
  useEffect(() => {
    if (status === 'solved') {
      setShowConfetti(true);
      const t = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(t);
    }
  }, [status]);

  // ── Reveal answer ───────────────────────────────────────────────────────────
  const handleReveal = () => {
    setBoard(deepCopy(solution));
    setStatus('revealed');
    setSelected(null);
  };

  // Clear selection when panel closes so no stale state lingers
  useEffect(() => {
    if (!active) setSelected(null);
  }, [active]);

  // Keyboard input — only active when the panel is open
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (!selected || locked) return;
      const isArrow = e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight';
      if (isArrow) e.preventDefault();
      const n = parseInt(e.key);
      if (n >= 1 && n <= 9) handleInput(n);
      if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') handleInput(null);
      const [r, c] = selected;
      if (e.key === 'ArrowUp'    && r > 0) setSelected([r-1, c]);
      if (e.key === 'ArrowDown'  && r < 8) setSelected([r+1, c]);
      if (e.key === 'ArrowLeft'  && c > 0) setSelected([r, c-1]);
      if (e.key === 'ArrowRight' && c < 8) setSelected([r, c+1]);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, selected, handleInput, locked]);

  // ── Layout ──────────────────────────────────────────────────────────────────
  const PADDING   = 12;
  const CELL_SIZE = Math.floor((panelWidth - PADDING * 2) / 9);
  const GRID_SIZE = CELL_SIZE * 9;

  // ── Cell colour logic ───────────────────────────────────────────────────────
  const isSel     = (r: number, c: number) => selected?.[0] === r && selected?.[1] === c;
  const isSameNum = (r: number, c: number) => selected !== null && board[selected[0]][selected[1]] !== null && board[r][c] === board[selected[0]][selected[1]];
  const isRelated = (r: number, c: number) => selected !== null && (r === selected[0] || c === selected[1] || (Math.floor(r/3) === Math.floor(selected[0]/3) && Math.floor(c/3) === Math.floor(selected[1]/3)));
  // Errors only show after submit
  const isError   = (r: number, c: number) => (status === 'submitted') && !fixed[r][c] && board[r][c] !== null && hasConflict(board, r, c);
  const isWrong   = (r: number, c: number) => (status === 'submitted') && !fixed[r][c] && board[r][c] !== null && board[r][c] !== solution[r][c];
  const isBlank   = (r: number, c: number) => (status === 'submitted') && !fixed[r][c] && board[r][c] === null;

  const cellBg = (r: number, c: number): string => {
    if (status === 'solved')    return 'rgba(59,130,246,0.12)';
    if (status === 'revealed')  return light ? 'rgba(59,130,246,0.07)' : 'rgba(59,130,246,0.06)';
    if (isSel(r, c))            return light ? 'rgba(59,130,246,0.18)' : 'rgba(59,130,246,0.22)';
    if (isError(r, c) || isWrong(r, c)) return 'rgba(239,68,68,0.18)';
    if (isBlank(r, c))          return light ? 'rgba(239,68,68,0.07)' : 'rgba(239,68,68,0.09)';
    if (isSameNum(r, c))        return light ? 'rgba(59,130,246,0.09)' : 'rgba(59,130,246,0.1)';
    if (isRelated(r, c))        return light ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.03)';
    return 'transparent';
  };

  const cellColor = (r: number, c: number): string => {
    if (status === 'revealed' && !fixed[r][c]) return light ? 'rgba(50,100,200,0.65)' : 'rgba(99,150,224,0.7)';
    if (fixed[r][c])            return light ? '#2a3a70' : '#c8d0e8';
    if (isError(r, c) || isWrong(r, c)) return '#e53e3e';
    if (status === 'solved')    return '#2563eb';
    if (board[r][c] !== null && board[r][c] === solution[r][c]) return light ? '#1d4ed8' : '#6496e0';
    return light ? '#4060a8' : '#8898c0';
  };

  const M = { fontFamily: 'monospace' } as React.CSSProperties;

  // Status bar message
  const statusMsg = () => {
    if (status === 'solved')   return { text: 'solved ✓', color: '#3b82f6' };
    if (status === 'revealed') return { text: 'answer shown', color: '#7a9ad0' };
    if (status === 'submitted' && errorCount > 0) return { text: `${errorCount} error${errorCount > 1 ? 's' : ''}`, color: '#f87171' };
    if (status === 'submitted' && !isBoardComplete(board)) return { text: 'incomplete', color: '#f59e0b' };
    return null;
  };
  const msg = statusMsg();

  // ── Sudoku theme tokens ──────────────────────────────────────────────────────
  const T = {
    bg:           light ? '#f0f2f8' : '#0d0f1a',
    headerBg:     light ? '#e8eaf4' : '#10121e',
    headerBorder: light ? '#cdd0e4' : '#1e2235',
    statusBorder: light ? '#d0d4e8' : '#181c2e',
    statusMuted:  light ? '#9090b8' : '#2e3a4e',
    gridBorder:   light ? '#8090c0' : '#3a4a70',
    cellThin:     light ? '#c8d0e8' : '#1e2440',
    numpadBorder: light ? '#b8c4e0' : '#2e3a55',
    numpadColor:  light ? '#2a50c0' : '#7a9ad0',
    numpadBg:     light ? 'rgba(59,130,246,0.07)' : 'rgba(59,130,246,0.06)',
    eraseBg:      light ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.03)',
    eraseBorder:  light ? '#c0c8e0' : '#2a3350',
    eraseColor:   light ? '#5060a0' : '#4a6080',
    submitColor:  light ? '#1d4ed8' : '#93c5fd',
    revealBorder: light ? '#c0c8e0' : '#2a3350',
    revealColor:  light ? '#5060a0' : '#4a6080',
    hintColor:    light ? '#8090b8' : '#3a4e6a',
    solvedColor:  light ? '#1d4ed8' : '#3b82f6',
    revealedColor: light ? '#5060a0' : '#5a7090',
    newBorder:    light ? '#b8c4e0' : '#2e3a55',
    newColor:     light ? '#2a50c0' : '#6a90c0',
    diffInactive: light ? '#b0bcd8' : '#5a7090',
    diffBorder:   light ? '#c8d0e8' : '#2a3350',
    refreshColor: light ? '#3050a0' : '#6080c0',
    refreshBorder: light ? '#b8c4e0' : '#2e3a55',
    generating:   light ? '#6070a8' : '#4a6080',
    gridShadow:   light ? '0 0 12px rgba(100,120,200,0.1)' : '0 0 20px rgba(0,0,0,0.5)',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', background: T.bg }}>

      {/* ── Difficulty + refresh bar ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', borderBottom: `1px solid ${T.headerBorder}`, background: T.headerBg, gap: 6 }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {(['easy','medium','hard'] as Difficulty[]).map(d => (
            <button key={d} onClick={() => handleDiffChange(d)} style={{
              ...M, fontSize: 9, padding: '3px 7px', borderRadius: 5, cursor: 'pointer',
              textTransform: 'uppercase', letterSpacing: '0.08em',
              background: difficulty === d ? 'rgba(59,130,246,0.15)' : T.eraseBg,
              border: `1px solid ${difficulty === d ? 'rgba(59,130,246,0.55)' : T.diffBorder}`,
              color: difficulty === d ? T.submitColor : T.diffInactive,
              transition: 'all 200ms',
            }}>{d}</button>
          ))}
        </div>
        <button onClick={handleRefresh} title="New puzzle" style={{
          width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: 6, background: T.numpadBg, border: `1px solid ${T.refreshBorder}`,
          color: T.refreshColor, fontSize: 14, cursor: 'pointer', transition: 'all 200ms',
          animation: generating ? 'spin 0.6s linear infinite' : 'none',
        }}>↻</button>
      </div>

      {/* ── Status bar ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px 12px', borderBottom: `1px solid ${T.statusBorder}`, minHeight: 28 }}>
        <span style={{ ...M, fontSize: 9, color: T.statusMuted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {status === 'playing' ? 'in progress' : ''}
        </span>
        {msg && (
          <span style={{ ...M, fontSize: 9, color: msg.color, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>
            {msg.text}
          </span>
        )}
      </div>

      {/* ── Sudoku grid ── */}
      {generating ? (
        <div style={{ height: GRID_SIZE + PADDING * 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ ...M, fontSize: 9, color: T.generating, textTransform: 'uppercase', letterSpacing: '0.1em' }}>generating…</span>
        </div>
      ) : (
        <div style={{ padding: PADDING, paddingBottom: 8, position: 'relative' }}>
          {/* Confetti overlay — fires on solve */}
          {showConfetti && (
            <ConfettiBurst width={GRID_SIZE} height={GRID_SIZE} light={light} />
          )}
          <div style={{
            width: GRID_SIZE, height: GRID_SIZE,
            display: 'grid', gridTemplateColumns: `repeat(9, ${CELL_SIZE}px)`,
            border: `1px solid ${T.gridBorder}`,
            borderRadius: 6, overflow: 'hidden',
            boxShadow: T.gridShadow,
          }}>
            {board.map((row, r) =>
              row.map((val, c) => {
                const borderRight  = (c + 1) % 3 === 0 && c < 8 ? `1px solid ${T.gridBorder}` : `1px solid ${T.cellThin}`;
                const borderBottom = (r + 1) % 3 === 0 && r < 8 ? `1px solid ${T.gridBorder}` : `1px solid ${T.cellThin}`;
                return (
                  <div
                    key={`${r}-${c}`}
                    onClick={() => handleCellClick(r, c)}
                    style={{
                      width: CELL_SIZE, height: CELL_SIZE,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      borderRight, borderBottom,
                      background: cellBg(r, c),
                      cursor: fixed[r][c] || locked ? 'default' : 'pointer',
                      transition: 'background 120ms',
                      userSelect: 'none',
                      outline: isSel(r,c) ? '1px solid rgba(59,130,246,0.6)' : 'none',
                      outlineOffset: '-1px',
                    }}
                  >
                    <span style={{
                      ...M,
                      fontSize: CELL_SIZE * 0.52,
                      fontWeight: fixed[r][c] ? 600 : 400,
                      color: cellColor(r, c),
                      lineHeight: 1,
                    }}>
                      {val ?? ''}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ── Number pad ── */}
      {!locked && (
        <div style={{ padding: '0 10px 8px', display: 'flex', flexDirection: 'column', gap: 5 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(9, 1fr)', gap: 3 }}>
            {[1,2,3,4,5,6,7,8,9].map(n => (
              <button key={n} onClick={() => handleInput(n)} style={{
                ...M, fontSize: 11, height: 28, borderRadius: 5,
                background: T.numpadBg, border: `1px solid ${T.numpadBorder}`,
                color: T.numpadColor, cursor: 'pointer', transition: 'all 150ms',
              }}>{n}</button>
            ))}
          </div>
          <button onClick={handleEraseAll} style={{
            ...M, fontSize: 9, height: 24, borderRadius: 5,
            background: T.eraseBg, border: `1px solid ${T.eraseBorder}`,
            color: T.eraseColor, cursor: 'pointer', textTransform: 'uppercase',
            letterSpacing: '0.1em', transition: 'all 150ms',
          }}>erase all</button>
        </div>
      )}

      {/* ── Action buttons ── */}
      {!locked && (
        <div style={{ padding: '0 10px 10px', display: 'flex', gap: 6 }}>
          <button onClick={handleSubmit} style={{
            ...M, flex: 1, height: 30, borderRadius: 7, fontSize: 9,
            background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.5)',
            color: T.submitColor, cursor: 'pointer', textTransform: 'uppercase',
            letterSpacing: '0.1em', fontWeight: 600, transition: 'all 200ms',
          }}>submit</button>
          <button onClick={handleReveal} style={{
            ...M, flex: 1, height: 30, borderRadius: 7, fontSize: 9,
            background: T.eraseBg, border: `1px solid ${T.revealBorder}`,
            color: T.revealColor, cursor: 'pointer', textTransform: 'uppercase',
            letterSpacing: '0.1em', transition: 'all 200ms',
          }}>show answer</button>
        </div>
      )}

      {/* ── Solved / Revealed footer ── */}
      {locked && (
        <div style={{ padding: '8px 10px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <span style={{ ...M, fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.12em', color: status === 'solved' ? T.solvedColor : T.revealedColor }}>
            {status === 'solved' ? '✓ puzzle solved!' : 'answer revealed'}
          </span>
          <button onClick={handleRefresh} style={{
            ...M, width: '100%', height: 30, borderRadius: 7, fontSize: 9,
            background: T.numpadBg, border: `1px solid ${T.newBorder}`,
            color: T.newColor, cursor: 'pointer', textTransform: 'uppercase',
            letterSpacing: '0.1em', transition: 'all 200ms',
          }}>new puzzle</button>
        </div>
      )}

      {/* Hint */}
      {!locked && (
        <p style={{ ...M, fontSize: 8, color: T.hintColor, textAlign: 'center', paddingBottom: 8, margin: 0, letterSpacing: '0.08em' }}>
          type 1–9 · backspace to erase · arrows to navigate
        </p>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
