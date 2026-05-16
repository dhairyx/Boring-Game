import React, { useEffect, useRef, useState } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'preview' | 'docs'>('preview');
  const [theme, setTheme] = useState({ hex: '#00F2FF', rgb: '0, 242, 255' });

  const THEMES = [
    { name: 'Cyan', hex: '#00F2FF', rgb: '0, 242, 255' },
    { name: 'Pink', hex: '#FF3366', rgb: '255, 51, 102' },
    { name: 'Green', hex: '#39FF14', rgb: '57, 255, 20' },
    { name: 'Orange', hex: '#FF9900', rgb: '255, 153, 0' },
    { name: 'Purple', hex: '#B026FF', rgb: '176, 38, 255' },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-[#E0E0E0] font-sans flex flex-col md:flex-row overflow-hidden relative" style={{ '--brand': theme.hex, '--brand-rgb': theme.rgb } as React.CSSProperties}>
      <aside className="w-[60px] bg-black border-r border-[#222] flex flex-col justify-between items-center py-5 shrink-0 hidden md:flex h-screen z-20">
        <div 
          className="text-[11px] font-bold tracking-[4px] uppercase text-[var(--brand)] opacity-80 transition-colors" 
          style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
        >
          TECHNICAL ARCHITECTURE
        </div>
        <div className="flex flex-col gap-3 mt-auto mb-10">
            {THEMES.map(t => (
                <button 
                  key={t.name}
                  onClick={() => setTheme(t)}
                  className="w-4 h-4 rounded-full border border-white/20 transition-all hover:scale-125"
                  style={{ backgroundColor: t.hex, boxShadow: theme.hex === t.hex ? `0 0 10px ${t.hex}` : 'none' }}
                  title={`${t.name} Theme`}
                />
            ))}
        </div>
        <div className="text-[20px] text-[var(--brand)] transition-colors">⬡</div>
      </aside>

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-[80px] border-b border-[#222] flex flex-wrap gap-4 items-center justify-between px-4 md:px-[30px] shrink-0 z-10 bg-[#050505]">
          <div className="flex items-center">
            <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-white m-0">LUMEN DRIFT</h1>
            <span className="text-[10px] bg-[#1A1A1A] px-2.5 py-1 rounded-full border border-[#333] ml-[15px] text-[var(--brand)] uppercase font-mono tracking-wider transition-colors">Godot 4.x</span>
            <span className="text-[10px] bg-[#1A1A1A] px-2.5 py-1 rounded-full border border-[#333] ml-[10px] text-[var(--brand)] uppercase font-mono tracking-wider transition-colors hidden sm:block">GLES3 Compatibility</span>
          </div>
          
          <div className="flex items-center gap-6">
            
            {/* Mobile Color Picker inline */}
            <div className="flex gap-2 md:hidden">
              {THEMES.map(t => (
                <button 
                  key={t.name}
                  onClick={() => setTheme(t)}
                  className="w-4 h-4 rounded-full border border-white/20"
                  style={{ backgroundColor: t.hex }}
                />
              ))}
            </div>

            <div className="flex bg-[#1A1A1A] p-1 rounded border border-[#333]">
              <button 
                onClick={() => setActiveTab('preview')}
                className={cn("px-3 md:px-4 py-1.5 rounded text-[10px] md:text-[11px] font-bold uppercase transition tracking-wider", 
                             activeTab === 'preview' ? "bg-[#333] text-[var(--brand)] shadow-[inset_0_-2px_0_var(--brand)]" : "text-gray-400 hover:text-white")}
              >
                Preview
              </button>
              <button 
                onClick={() => setActiveTab('docs')}
                className={cn("px-3 md:px-4 py-1.5 rounded text-[10px] md:text-[11px] font-bold uppercase transition tracking-wider", 
                             activeTab === 'docs' ? "bg-[#333] text-[var(--brand)] shadow-[inset_0_-2px_0_var(--brand)]" : "text-gray-400 hover:text-white")}
              >
                Nodes
              </button>
            </div>
            <div className="text-[12px] opacity-50 font-mono hidden lg:block">v0.4.2-ALPHA // SENIOR_DEV_MODE</div>
          </div>
        </header>

        <main className="flex-1 overflow-hidden flex flex-col">
          {activeTab === 'preview' ? <GamePreview theme={theme} setTheme={setTheme} themes={THEMES} /> : <GodotResources />}
        </main>
      </div>
    </div>
  );
}

const GamePreview = ({ theme = { hex: '#00F2FF', rgb: '0, 242, 255' }, setTheme, themes }: { theme?: any, setTheme?: any, themes?: any[] }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [gameState, setGameState] = useState<'mainmenu' | 'playing' | 'gameover' | 'paused' | 'settings' | 'won' | 'levelcomplete'>('mainmenu');
    const [previousGameState, setPreviousGameState] = useState<'mainmenu' | 'paused'>('mainmenu');
    const [gameMode, setGameMode] = useState<'story' | 'challenge'>('story');
    const [collectorShape, setCollectorShape] = useState<'square' | 'circle' | 'triangle'>('square');
    const [dashColor, setDashColor] = useState<'white' | 'brand' | 'red' | 'blue' | 'yellow'>('white');
    const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [graphicsQual, setGraphicsQual] = useState<'low' | 'medium' | 'high'>('high');
    const [bloomEnabled, setBloomEnabled] = useState(true);
    const [particleDensity, setParticleDensity] = useState<'low' | 'medium' | 'high'>('high');
    const [postProcessingShader, setPostProcessingShader] = useState(false);
    const [hasSave, setHasSave] = useState(false);

    useEffect(() => {
        setHasSave(!!localStorage.getItem('lumen_drift_save'));
    }, []);

    const themeRef = useRef(theme);
    const shapeRef = useRef(collectorShape);
    const dashColorRef = useRef(dashColor);
    const difficultyRef = useRef(difficulty);
    const graphicsRef = useRef(graphicsQual);
    const gameModeRef = useRef(gameMode);
    const bloomRef = useRef(bloomEnabled);
    const particleDensityRef = useRef(particleDensity);
    const postProcessingRef = useRef(postProcessingShader);
    
    // Persistent state for game
    const currentLevelRef = useRef<number>(0);
    const totalLumensRef = useRef<number>(0);
    const challengeTimerRef = useRef<number>(60.0);
    const levelTimeRef = useRef<number>(0);
    
    // So that player and trail state isn't lost on pause
    const playerStateRef = useRef<any>(null);
    const trailStateRef = useRef<any>(null);
    const particlesStateRef = useRef<any>(null);

    const DASH_COLORS = [
        { id: 'white', hex: '#ffffff' },
        { id: 'brand', hex: theme.hex },
        { id: 'red', hex: '#ff3333' },
        { id: 'blue', hex: '#3366ff' },
        { id: 'yellow', hex: '#ffcc00' }
    ] as const;
    
    useEffect(() => {
        themeRef.current = theme;
    }, [theme]);

    useEffect(() => {
        shapeRef.current = collectorShape;
    }, [collectorShape]);

    useEffect(() => {
        dashColorRef.current = dashColor;
    }, [dashColor]);

    useEffect(() => {
        difficultyRef.current = difficulty;
    }, [difficulty]);

    useEffect(() => {
        graphicsRef.current = graphicsQual;
    }, [graphicsQual]);

    useEffect(() => {
        bloomRef.current = bloomEnabled;
    }, [bloomEnabled]);

    useEffect(() => {
        particleDensityRef.current = particleDensity;
    }, [particleDensity]);

    useEffect(() => {
        postProcessingRef.current = postProcessingShader;
    }, [postProcessingShader]);

    useEffect(() => {
        gameModeRef.current = gameMode;
    }, [gameMode]);

    // Persist mutable game state across UI renders cleanly
    const gameControl = useRef<any>({
      reset: () => {},
      restartGame: () => {},
      resumeGame: () => {},
      nextLevel: () => {},
      mainMenu: () => setGameState('mainmenu'),
      startGame: () => {},
      startChallenge: () => {},
      loadGame: () => {}
    });

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
  
      let GRAVITY = 1200;
      let SPEED = 250;
      const MAX_FALL_SPEED = 800;
      const WALL_SLIDE_SPEED = 120;
      let JUMP_VELOCITY = -450;
      const DASH_SPEED = 700;
      const DASH_DURATION = 0.2;
      const FRICTION = 1000;
      const ACCELERATION = 1400;
  
      const player = playerStateRef.current || {
        x: 50, y: 300, width: 24, height: 24, vx: 0, vy: 0,
        isDashing: false, dashTimer: 0, dashFade: 0, canDash: true, facingRight: true, momentumMult: 1.3,
        maxJumps: 3, jumpsLeft: 3,
        dead: false, deathTimer: 0
      };
      const screenShake = { timer: 0, magnitude: 0 };
      const keys = { ArrowLeft: false, ArrowRight: false, ArrowUp: false, Space: false, w: false, a: false, d: false };
      const trail: { x: number, y: number, alpha: number }[] = trailStateRef.current || [];
      const particles: { x: number, y: number, vx: number, vy: number, life: number, maxLife: number, color?: string, size?: number }[] = particlesStateRef.current || [];
      
      const stars: {x: number, y: number, r: number, isAccent: boolean, speed: number}[] = [];
      for(let i=0; i<60; i++) {
        stars.push({
          x: Math.random() * 800,
          y: Math.random() * 450,
          r: 0.5 + Math.random() * 2,
          isAccent: Math.random() > 0.85,
          speed: 0.05 + Math.random() * 0.15
        });
      }

      const pillars: {x: number, w: number, h: number, speed: number, alpha: number}[] = [];
      for(let i=0; i<10; i++) {
          pillars.push({
              x: Math.random() * 1200 - 200,
              w: 50 + Math.random() * 150,
              h: 100 + Math.random() * 300,
              speed: 0.1 + Math.random() * 0.2, // Faster than stars, slower than foreground
              alpha: 0.1 + Math.random() * 0.15
          });
      }
  
      let currentLevel = currentLevelRef.current;
      let totalLumens = totalLumensRef.current;

      type Enemy = { x: number, y: number, w: number, h: number, vx: number, vy: number, startX: number, startY: number, state: 'patrol'|'chase'|'attack'|'idle', dir: number, timer: number, startWidth: number };

      const levels: { spawn: any, goal: any, lumens: any[], blocks: any[], enemies: Enemy[], hazards?: any[], pads?: any[] }[] = [
        // Level 1: Basics
        {
          spawn: { x: 50, y: 300 },
          goal: { x: 740, y: 300, w: 40, h: 40 },
          lumens: [
            { x: 340, y: 220, w: 15, h: 15, collected: false },
            { x: 560, y: 120, w: 15, h: 15, collected: false }
          ],
          blocks: [
            { x: 0, y: 350, w: 800, h: 50 },
            { x: 300, y: 250, w: 100, h: 20 },
            { x: 500, y: 150, w: 150, h: 200 },
            { x: -20, y: 0, w: 40, h: 400 },
            { x: 780, y: 0, w: 40, h: 400 },
          ],
          enemies: [],
          hazards: [
            { x: 100, y: 330, w: 150, h: 20 },
            { x: 420, y: 330, w: 60, h: 20 }
          ]
        },
        // Level 2: Double Jump Required
        {
          spawn: { x: 50, y: 300 },
          goal: { x: 740, y: 50, w: 40, h: 40 },
          lumens: [
            { x: 340, y: 170, w: 15, h: 15, collected: false },
            { x: 700, y: 80, w: 15, h: 15, collected: false }
          ],
          blocks: [
            { x: 0, y: 350, w: 800, h: 50 },
            { x: 300, y: 200, w: 100, h: 20 },
            { x: 650, y: 110, w: 150, h: 20 },
            { x: -20, y: 0, w: 40, h: 400 },
            { x: 780, y: 0, w: 40, h: 400 },
          ],
          enemies: [
             { x: 450, y: 326, w: 24, h: 24, startWidth: 24, vx: 0, vy: 0, startX: 450, startY: 326, state: 'patrol', dir: 1, timer: 0 }
          ],
          pads: [
            { x: 230, y: 335, w: 30, h: 15, boost: -800 }
          ],
          hazards: [
            { x: 150, y: 340, w: 100, h: 10 },
            { x: 450, y: 100, w: 150, h: 10 },
            { x: 600, y: 340, w: 150, h: 10 }
          ]
        },
        // Level 3: Dash + Double Jump Mastery
        {
          spawn: { x: 50, y: 250 },
          goal: { x: 720, y: 100, w: 40, h: 40 },
          lumens: [
            { x: 100, y: 200, w: 15, h: 15, collected: false },
            { x: 550, y: 80, w: 15, h: 15, collected: false },
            { x: 420, y: 300, w: 15, h: 15, collected: false }
          ],
          blocks: [
            { x: 0, y: 350, w: 200, h: 50 },
            { x: 350, y: 100, w: 40, h: 250 },
            { x: 650, y: 160, w: 150, h: 250 },
            { x: -20, y: 0, w: 40, h: 400 },
            { x: 780, y: 0, w: 40, h: 400 },
          ],
          enemies: [
             { x: 250, y: 326, w: 24, h: 24, startWidth: 24, vx: 0, vy: 0, startX: 250, startY: 326, state: 'patrol', dir: 1, timer: 0 }
          ],
          pads: [
            { x: 100, y: 380, w: 30, h: 10, boost: -750 },
            { x: 670, y: 380, w: 30, h: 10, boost: -900 }
          ],
          hazards: [
            { x: 200, y: 380, w: 450, h: 20 }, // Bottom pit
            { x: 390, y: 220, w: 40, h: 40 } // Wall spikes
          ]
        },
        // Level 4: The Ascent
        {
          spawn: { x: 50, y: 350 },
          goal: { x: 380, y: 40, w: 40, h: 40 },
          lumens: [
            { x: 250, y: 220, w: 15, h: 15, collected: false },
            { x: 600, y: 200, w: 15, h: 15, collected: false }
          ],
          blocks: [
            { x: 0, y: 400, w: 800, h: 50 },
            { x: 200, y: 150, w: 40, h: 250 },
            { x: 550, y: 150, w: 40, h: 250 },
            { x: -20, y: 0, w: 40, h: 450 },
            { x: 780, y: 0, w: 40, h: 450 },
          ],
          enemies: [],
          hazards: [
            { x: 60, y: 380, w: 100, h: 20 },
            { x: 300, y: 380, w: 200, h: 20 },
            { x: 630, y: 380, w: 130, h: 20 },
            { x: 240, y: 250, w: 20, h: 20 },
            { x: 530, y: 200, w: 20, h: 20 }
          ]
        },
        // Level 5: Precision Dash
        {
          spawn: { x: 50, y: 100 },
          goal: { x: 720, y: 350, w: 40, h: 40 },
          lumens: [
            { x: 450, y: 160, w: 15, h: 15, collected: false },
            { x: 200, y: 350, w: 15, h: 15, collected: false }
          ],
          blocks: [
            { x: 0, y: 150, w: 150, h: 20 },
            { x: 300, y: 200, w: 80, h: 20 },
            { x: 550, y: 250, w: 80, h: 20 },
            { x: 650, y: 400, w: 150, h: 50 },
            { x: -20, y: -50, w: 40, h: 500 },
            { x: 780, y: -50, w: 40, h: 500 },
          ],
          enemies: [
              { x: 190, y: 376, w: 24, h: 24, startWidth: 24, vx: 0, vy: 0, startX: 190, startY: 376, state: 'patrol', dir: 1, timer: 0 }
          ],
          hazards: [
            { x: 0, y: 430, w: 600, h: 40 }, // Giant lava floor
            { x: 160, y: 170, w: 120, h: 10 },
            { x: 400, y: 220, w: 130, h: 10 }
          ]
        }
      ];

      const resetLevel = () => {
        levelTimeRef.current = 0;
        const lvl = levels[currentLevel];
        player.x = lvl.spawn.x;
        player.y = lvl.spawn.y;
        player.vx = 0;
        player.vy = 0;
        player.dashFade = 0;
        player.isDashing = false;
        player.dead = false;
        player.deathTimer = 0;
        trail.length = 0;
        particles.length = 0;
        
        // Reset enemies
        lvl.enemies.forEach(e => {
            e.x = e.startX; e.y = e.startY;
            e.state = 'patrol'; e.timer = 0; e.dir = 1; e.w = e.startWidth;
        });
      };
      if (!playerStateRef.current) resetLevel();
      
      gameControl.current.reset = () => {
          resetLevel();
          setGameState('playing');
      };

      gameControl.current.restartGame = () => {
          currentLevel = 0;
          totalLumens = 0;
          levels.forEach(l => l.lumens.forEach(lum => lum.collected = false));
          resetLevel();
          setGameState('playing');
      };
      
      gameControl.current.resumeGame = () => {
          setGameState('playing');
      };
      
      gameControl.current.startGame = () => {
          setGameMode('story');
          currentLevel = 0;
          totalLumens = 0;
          levels.forEach(l => l.lumens.forEach(lum => lum.collected = false));
          playerStateRef.current = null;
          resetLevel();
          setGameState('playing');
          localStorage.setItem('lumen_drift_save', JSON.stringify({ currentLevel, totalLumens, lumensState: levels.map(l => l.lumens.map(lum => lum.collected)) }));
          setHasSave(true);
      };

      gameControl.current.startChallenge = () => {
          setGameMode('challenge');
          challengeTimerRef.current = 60.0;
          currentLevel = 0;
          totalLumens = 0;
          levels.forEach(l => l.lumens.forEach(lum => lum.collected = false));
          playerStateRef.current = null;
          resetLevel();
          setGameState('playing');
      };
      
      gameControl.current.nextLevel = () => {
          currentLevel = (currentLevel + 1) % levels.length;
          playerStateRef.current = null;
          resetLevel();
          localStorage.setItem('lumen_drift_save', JSON.stringify({ currentLevel, totalLumens, lumensState: levels.map(l => l.lumens.map(lum => lum.collected)) }));
          setHasSave(true);
          setGameState('playing');
      };

      gameControl.current.loadGame = () => {
          try {
              const dataStr = localStorage.getItem('lumen_drift_save');
              if (dataStr) {
                  const data = JSON.parse(dataStr);
                  currentLevel = data.currentLevel || 0;
                  totalLumens = data.totalLumens || 0;
                  if (data.lumensState && Array.isArray(data.lumensState)) {
                      levels.forEach((l, i) => {
                          if (data.lumensState[i]) {
                              l.lumens.forEach((lum, j) => {
                                  lum.collected = data.lumensState[i][j] || false;
                              });
                          }
                      });
                  }
                  resetLevel();
                  setGameState('playing');
              }
          } catch (e) {
              console.error("Failed to load save format.");
          }
      }
  
      const keyDownHandler = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            if (gameState === 'playing') setGameState('paused');
            else if (gameState === 'paused') setGameState('playing');
            else if (gameState === 'settings') setGameState(previousGameState);
            return;
        }
        
        if (e.key === 'Enter') {
            if (gameState === 'mainmenu') gameControl.current.startGame();
            else if (gameState === 'gameover') gameControl.current.reset();
            else if (gameState === 'won') gameControl.current.startChallenge();
            else if (gameState === 'levelcomplete') gameControl.current.nextLevel();
            else if (gameState === 'paused') gameControl.current.resumeGame();
            return;
        }

        if (keys.hasOwnProperty(e.key) || e.code === 'Space') {
            e.preventDefault();
            if (e.code === 'Space') keys.Space = true;
            else (keys as any)[e.key] = true;
        }
      };
  
      const keyUpHandler = (e: KeyboardEvent) => {
          if (keys.hasOwnProperty(e.key) || e.code === 'Space') {
              if (e.code === 'Space') keys.Space = false;
              else (keys as any)[e.key] = false;
          }
      };
  
      window.addEventListener('keydown', keyDownHandler, { passive: false });
      window.addEventListener('keyup', keyUpHandler, { passive: false });
  
      let lastTime = performance.now();
      let animationFrameId: number;
  
      const AABB = (r1: any, r2: any) => {
        return (r1.x < r2.x + r2.w && r1.x + r1.width > r2.x && r1.y < r2.y + r2.h && r1.y + r1.height > r2.y);
      }

      const spawnParticles = (x: number, y: number, count: number, speedMult: number = 1, color?: string, size: number = 3) => {
          let adjustedCount = count;
          if (particleDensityRef.current === 'low') adjustedCount = 0;
          else if (particleDensityRef.current === 'medium') adjustedCount = Math.floor(count / 2);
          
          for (let i = 0; i < adjustedCount; i++) {
              particles.push({
                  x, y,
                  vx: (Math.random() - 0.5) * 400 * speedMult,
                  vy: (Math.random() - 0.5) * 400 * speedMult,
                  life: 1.0, maxLife: 1.0, color, size
              });
          }
      };

      const triggerShake = (mag: number, duration: number) => {
          if (screenShake.timer < duration || screenShake.magnitude < mag) {
              screenShake.magnitude = mag;
              screenShake.timer = duration;
          }
      };
  
      // Initialize Canvas Patterns once to avoid memory leaks
      const bCanvas = document.createElement('canvas');
      bCanvas.width = 16; bCanvas.height = 16;
      const bpCtx = bCanvas.getContext('2d');
      if (bpCtx) {
          bpCtx.fillStyle = '#141414'; bpCtx.fillRect(0, 0, 16, 16);
          bpCtx.strokeStyle = '#1e1e1e'; bpCtx.lineWidth = 2;
          bpCtx.beginPath(); bpCtx.moveTo(-4, 20); bpCtx.lineTo(20, -4); bpCtx.moveTo(12, 28); bpCtx.lineTo(28, 12); bpCtx.stroke();
      }
      const blockPattern = ctx.createPattern(bCanvas, 'repeat');

      const hCanvas = document.createElement('canvas');
      hCanvas.width = 20; hCanvas.height = 20;
      const hpCtx = hCanvas.getContext('2d');
      if (hpCtx) {
          hpCtx.fillStyle = '#1a0505'; hpCtx.fillRect(0, 0, 20, 20);
          hpCtx.fillStyle = '#ff2222'; hpCtx.beginPath(); hpCtx.moveTo(10, 0); hpCtx.lineTo(20, 20); hpCtx.lineTo(0, 20); hpCtx.fill();
      }
      const hazardPattern = ctx.createPattern(hCanvas, 'repeat');

      const triggerDeath = () => {
          if (player.dead) return;
          player.dead = true;
          player.deathTimer = 1.0;
          
          triggerShake(15, 0.4);
          
          // Geometry shatter: lots of sharp glass-like fragments
          for (let i = 0; i < 40; i++) {
              particles.push({
                  x: player.x + player.width/2,
                  y: player.y + player.height/2,
                  vx: (Math.random() - 0.5) * 800 + player.vx * 0.3,
                  vy: (Math.random() - 0.5) * 800 + player.vy * 0.3,
                  life: 1.0 + Math.random() * 0.5,
                  maxLife: 1.5,
                  color: themeRef.current.hex,
                  size: 4 + Math.random() * 6
              });
              
              // Also add some white 'core' fragments
              particles.push({
                  x: player.x + player.width/2,
                  y: player.y + player.height/2,
                  vx: (Math.random() - 0.5) * 600,
                  vy: (Math.random() - 0.5) * 600,
                  life: 0.8 + Math.random() * 0.4,
                  maxLife: 1.2,
                  color: '#ffffff',
                  size: 2 + Math.random() * 3
              });
          }
      };

      const gameLoop = (time: number) => {
        const delta = Math.min((time - lastTime) / 1000, 0.1);
        lastTime = time;
        levelTimeRef.current += delta;

        const diffSetup = difficultyRef.current;
        if (diffSetup === 'hard') {
            GRAVITY = 1400; SPEED = 220; JUMP_VELOCITY = -485;
        } else if (diffSetup === 'easy') {
            GRAVITY = 900; SPEED = 280; JUMP_VELOCITY = -390;
        } else {
            GRAVITY = 1200; SPEED = 250; JUMP_VELOCITY = -450;
        }
        
        if (player.dead) {
            player.deathTimer -= delta;
            if (player.deathTimer <= 0) {
                setGameState('gameover');
                return;
            }
        }
        
        const currentBlocks = levels[currentLevel].blocks;
        const currentHazards = levels[currentLevel].hazards || [];
        const currentPads = levels[currentLevel].pads || [];

        if (!player.dead) {
            // Out of Bounds logic (Fall Death)
            if (player.y > 600) {
                triggerDeath();
            }
      
            const dirX = (keys.ArrowRight || keys.d ? 1 : 0) - (keys.ArrowLeft || keys.a ? 1 : 0);
            const jumpPressed = keys.ArrowUp || keys.w;
        
        if (keys.Space && player.canDash && !player.isDashing) {
            player.isDashing = true;
            player.dashTimer = DASH_DURATION;
            player.canDash = false;
            const dashDir = dirX !== 0 ? dirX : (player.facingRight ? 1 : -1);
            player.vx = dashDir * DASH_SPEED * player.momentumMult;
            spawnParticles(player.x + player.width/2, player.y + player.height/2, 10, 0.5, '#ffffff'); // Dash burst
        }
  
        if (player.isDashing) {
            player.dashTimer -= delta;
            player.vy = 0;
            if (player.dashTimer <= 0) {
                player.isDashing = false;
                player.dashFade = 1.0;
                player.vx = Math.sign(player.vx) * SPEED;
            }
        } else if (player.dashFade > 0) {
            player.dashFade = Math.max(0, player.dashFade - delta * 3);
        }
  
        let prevVy = player.vy;
        let onFloor = false; let onWallRight = false; let onWallLeft = false;
  
        if (!player.isDashing) {
          player.vy += GRAVITY * delta;
          if (player.vy > MAX_FALL_SPEED) player.vy = MAX_FALL_SPEED;
        }
        player.y += player.vy * delta;
  
        for (const block of currentBlocks) {
          if (AABB(player, block)) {
              if (player.vy > 0) {
                  if (player.vy > 600 && !onFloor) { 
                      triggerShake(4, 0.1); 
                      spawnParticles(player.x + player.width/2, block.y, 8, 0.6, '#444', 2); // Hard landing dust
                  }
                  player.y = block.y - player.height; player.vy = 0; onFloor = true; player.canDash = true; player.jumpsLeft = player.maxJumps;
              } else if (player.vy < 0) {
                  player.y = block.y + block.h; player.vy = 0;
              }
          }
        }
  
        if (!player.isDashing) {
            if (dirX !== 0) {
                player.vx += dirX * ACCELERATION * delta;
                if (Math.abs(player.vx) > SPEED) player.vx = Math.sign(player.vx) * SPEED;
                player.facingRight = dirX > 0;
            } else {
                if (player.vx > 0) player.vx = Math.max(0, player.vx - FRICTION * delta);
                else if (player.vx < 0) player.vx = Math.min(0, player.vx + FRICTION * delta);
            }
        }
  
        player.x += player.vx * delta;
  
        for (const block of currentBlocks) {
          if (AABB(player, block)) {
              if (player.vx > 0) {
                  if (player.vx > 400 && !onWallRight) {
                      triggerShake(3, 0.1);
                      spawnParticles(block.x, player.y + player.height/2, 5, 0.4, '#444', 2);
                  }
                  player.x = block.x - player.width; player.vx = 0; onWallRight = true;
              } else if (player.vx < 0) {
                  if (player.vx < -400 && !onWallLeft) {
                      triggerShake(3, 0.1);
                      spawnParticles(block.x + block.w, player.y + player.height/2, 5, 0.4, '#444', 2);
                  }
                  player.x = block.x + block.w; player.vx = 0; onWallLeft = true;
              }
          }
        }

        // Hazard checks
        for (const hazard of currentHazards) {
            // Give a slight leniency to the hitbox for spikes
            const hazardAABB = { x: hazard.x + 5, y: hazard.y + 5, w: hazard.w - 10, h: hazard.h - 5};
            if (AABB(player, hazardAABB)) {
                triggerDeath();
            }
        }

        // Pad checks (Geometry Dash Orbs/Pads)
        for (const pad of currentPads) {
            if (AABB(player, pad) && player.vy >= 0) {
                player.vy = pad.boost;
                player.isDashing = false;
                player.jumpsLeft = player.maxJumps;
                triggerShake(4, 0.15);
                spawnParticles(player.x + player.width/2, player.y + player.height, 20, 1.5, themeRef.current.hex, 4);
            }
        }
  
        const onWall = onWallLeft || onWallRight;
  
        if (!onFloor && onWall && player.vy > 0 && dirX !== 0) {
            player.jumpsLeft = player.maxJumps; // Wall slide resets jumps
            if (player.vy > WALL_SLIDE_SPEED) player.vy = WALL_SLIDE_SPEED;
        }
  
        if (jumpPressed) {
            if (onFloor) {
                player.isDashing = false;
                player.vy = JUMP_VELOCITY; keys.ArrowUp = false; keys.w = false;
                player.jumpsLeft--;
                spawnParticles(player.x + player.width/2, player.y + player.height, 5, 0.3, '#333', 2); // Jump dust
            } else if (onWall) {
                player.isDashing = false;
                player.vy = JUMP_VELOCITY * 1.1; 
                player.vx = onWallRight ? -SPEED * 2.5 : SPEED * 2.5; 
                keys.ArrowUp = false; keys.w = false;
                player.jumpsLeft--;
            } else if (player.jumpsLeft > 0) {
                player.isDashing = false;
                player.vy = JUMP_VELOCITY * 0.9; // Double jump
                keys.ArrowUp = false; keys.w = false;
                player.jumpsLeft--;
                spawnParticles(player.x + player.width/2, player.y + player.height, 8, 0.3, themeRef.current.hex, 2); // Double jump burst
            }
        }
        
        // Level Transition
        const allLumensCollected = levels[currentLevel].lumens.every(l => l.collected);
        if (AABB(player, levels[currentLevel].goal) && allLumensCollected) {
            if (gameModeRef.current === 'challenge') {
                currentLevel++;
                if (currentLevel >= levels.length) {
                    setGameState('won' as any);
                    return;
                }
                currentLevel = currentLevel % levels.length;
                resetLevel();
                return requestAnimationFrame(gameLoop);
            } else {
                setGameState('levelcomplete');
                return;
            }
        }

        // Lumen Collection
        let madeLumenProgress = false;
        for (const lumen of levels[currentLevel].lumens) {
            if (!lumen.collected && AABB(player, lumen)) {
                lumen.collected = true;
                totalLumens += 1;
                madeLumenProgress = true;
                triggerShake(2, 0.1);
                spawnParticles(lumen.x + lumen.w/2, lumen.y + lumen.h/2, 15, 1.0, undefined, 3);
            }
        }
        if (madeLumenProgress) {
            localStorage.setItem('lumen_drift_save', JSON.stringify({ currentLevel, totalLumens, lumensState: levels.map(l => l.lumens.map(lum => lum.collected)) }));
            setHasSave(true);
        }
        
        // Enemy AI Update
        const diffMult = diffSetup === 'hard' ? 1.5 : (diffSetup === 'easy' ? 0.7 : 1.0);
        for (const enemy of levels[currentLevel].enemies) {
            const ENEMY_PATROL_SPEED = 60 * diffMult;
            const ENEMY_CHASE_SPEED = 130 * diffMult;
            const DETECT_RADIUS = 250;
            const ATTACK_RADIUS = 35;
            
            const pxCenter = player.x + player.width/2;
            const pyCenter = player.y + player.height/2;
            const exCenter = enemy.x + enemy.w/2;
            const eyCenter = enemy.y + enemy.h/2;
            const dist = Math.sqrt(Math.pow(pxCenter - exCenter, 2) + Math.pow(pyCenter - eyCenter, 2));

            if (enemy.state === 'idle') {
                enemy.vx = 0;
                enemy.timer -= delta;
                if (enemy.timer <= 0) enemy.state = 'patrol';
                if (dist < DETECT_RADIUS) enemy.state = 'chase'; // Wake up if player is near
            } else if (enemy.state === 'patrol') {
                enemy.vx = enemy.dir * ENEMY_PATROL_SPEED;
                if (dist < DETECT_RADIUS) enemy.state = 'chase';
            } else if (enemy.state === 'chase') {
                if (dist > DETECT_RADIUS * 1.3) enemy.state = 'patrol';
                else if (dist <= ATTACK_RADIUS) {
                    enemy.state = 'attack';
                    enemy.timer = 0.3; // windup
                } else {
                    enemy.dir = Math.sign(pxCenter - exCenter);
                    if (enemy.dir !== 0) enemy.vx = enemy.dir * ENEMY_CHASE_SPEED;
                }
            } else if (enemy.state === 'attack') {
                enemy.vx *= 0.8; // decelerate fast
                enemy.timer -= delta;
                if (enemy.timer <= 0) {
                    enemy.timer = 1.0; // cooldown
                    // Hit detection
                    if (dist <= ATTACK_RADIUS * 1.5) {
                        if (!player.dead) triggerDeath();
                    } else {
                        enemy.state = 'chase';
                    }
                }
            }

            enemy.vy += GRAVITY * delta;
            if (enemy.vy > MAX_FALL_SPEED) enemy.vy = MAX_FALL_SPEED;
            enemy.y += enemy.vy * delta;

            for (const block of currentBlocks) {
                if (AABB(enemy, block)) {
                    if (enemy.vy > 0) { enemy.y = block.y - enemy.h; enemy.vy = 0; }
                    else if (enemy.vy < 0) { enemy.y = block.y + block.h; enemy.vy = 0; }
                }
            }

            enemy.x += enemy.vx * delta;

            // Wall/Obstacle bounce for patrol to maintain linearity
            const bounceEnemy = (obstacle: any) => {
                if (AABB(enemy, obstacle)) {
                    if (enemy.vx > 0) { 
                        enemy.x = obstacle.x - enemy.w; enemy.dir = -1; enemy.vx = 0; 
                        if (enemy.state === 'patrol') { enemy.state = 'idle'; enemy.timer = 1.0; }
                    }
                    else if (enemy.vx < 0) { 
                        enemy.x = obstacle.x + obstacle.w; enemy.dir = 1; enemy.vx = 0; 
                        if (enemy.state === 'patrol') { enemy.state = 'idle'; enemy.timer = 1.0; }
                    }
                }
            }

            for (const block of currentBlocks) bounceEnemy(block);
            for (const hazard of currentHazards) {
                const hazardAABB = { x: hazard.x + 5, y: hazard.y + 5, w: hazard.w - 10, h: hazard.h - 5};
                bounceEnemy(hazardAABB);
            }
            for (const pad of currentPads) {
                 if (AABB(enemy, pad) && enemy.vy >= 0) {
                     enemy.vy = pad.boost * 0.7; // Enemies bounce on pads too!
                 }
            }
            
            // Player vs Enemy physical intersection death logic
            if (!player.dead) {
                if (AABB(player, enemy) && !player.isDashing) {
                    spawnParticles(player.x, player.y, 30, 2.0, '#ff1111');
                    triggerDeath();
                } else if (AABB(player, enemy) && player.isDashing) {
                    // If the player hits them mid-dash, knock enemy out of the way for flair
                    enemy.w = 0; 
                    spawnParticles(enemy.x, enemy.y, 20, 1.5, themeRef.current.hex);
                    triggerShake(8, 0.2);
                }
            }
        } // End of enemy loop
    } // END OF if (!player.dead) BLOCK

        if (!player.dead && (Math.abs(player.vx) > 10 || Math.abs(player.vy) > 10)) {
            trail.push({ x: player.x + player.width/2, y: player.y + player.height/2, alpha: 1 });
        }
        for (let i = trail.length - 1; i >= 0; i--) {
            trail[i].alpha -= delta * 3;
            if (trail[i].alpha <= 0) trail.splice(i, 1);
        }

        // Particle System update
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx * delta;
            p.y += p.vy * delta;
            p.life -= delta * 2;
            if (p.life <= 0) particles.splice(i, 1);
        }

        if (screenShake.timer > 0) {
            screenShake.timer -= delta;
        }

        // DRAWING
        ctx.fillStyle = '#050505';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.save(); // Context push for global camera modifiers (Shake)
        if (screenShake.timer > 0) {
            const dx = (Math.random() - 0.5) * screenShake.magnitude;
            const dy = (Math.random() - 0.5) * screenShake.magnitude;
            ctx.translate(dx, dy);
        }

        // Update Pattern Colors Dynamically on frame to match UI Theme
        const activeThemeRgb = themeRef.current.rgb;
        const activeThemeHex = themeRef.current.hex;
        
        // Big Center Lumen HUD
        const levelLumens = levels[currentLevel].lumens;
        const colCount = levelLumens.filter(l => l.collected).length;
        ctx.fillStyle = `rgba(${activeThemeRgb}, 0.08)`; 
        ctx.font = 'bold 160px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${colCount}/${levelLumens.length}`, canvas.width / 2, canvas.height / 2);
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';

        // Parallax Background Simulation (Moves relative to player pos to simulate depth)
        for (const s of stars) {
            ctx.fillStyle = s.isAccent ? themeRef.current.hex : '#ffffff';
            ctx.globalAlpha = s.isAccent ? 0.4 : 0.7;
            ctx.beginPath();
            
            // Apply motion offset based on player pos, wrapped seamlessly
            const px = (s.x - player.x * s.speed) % canvas.width;
            const py = (s.y - player.y * s.speed) % canvas.height;
            const drawX = px < 0 ? px + canvas.width : px;
            const drawY = py < 0 ? py + canvas.height : py;
            
            ctx.arc(drawX, drawY, s.r, 0, Math.PI * 2);
            ctx.fill();
        }

        // Midground Parallax (Pillars)
        for (const p of pillars) {
            ctx.fillStyle = `rgba(${activeThemeRgb}, ${p.alpha})`;
            
            // Apply motion offset
            const px = (p.x - player.x * p.speed) % (canvas.width + p.w * 2);
            const drawX = px < -p.w ? px + canvas.width + p.w * 2 : px;
            
            ctx.fillRect(drawX, canvas.height - p.h, p.w, p.h);
        }
        ctx.globalAlpha = 1.0;
  
        ctx.fillStyle = '#111'; ctx.strokeStyle = '#222'; ctx.lineWidth = 1;
        for (let i=0; i<canvas.width; i+=40) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke(); }
        for (let i=0; i<canvas.height; i+=40) { ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); ctx.stroke(); }
  
        // Draw Blocks with Custom Textured Map Pattern + UI Theme overlayer
        ctx.fillStyle = blockPattern || '#141414'; ctx.strokeStyle = `rgba(${activeThemeRgb}, 0.3)`; ctx.lineWidth = 2;
        for (const block of currentBlocks) {
            ctx.beginPath(); ctx.rect(block.x, block.y, block.w, block.h); ctx.fill(); ctx.stroke();
            
            // Grid Theme Overlayer for Blocks
            ctx.fillStyle = `rgba(${activeThemeRgb}, 0.05)`;
            ctx.fill();

            // Inner rim lighting matching UI
            ctx.strokeStyle = `rgba(${activeThemeRgb}, 0.15)`; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.rect(block.x + 2, block.y + 2, block.w - 4, block.h - 4); ctx.stroke();
        }

        // Draw Hazards as Geometry Dash style spikes matched to UI Theme
        const hzQual = graphicsRef.current;
        const hzShadowMult = bloomRef.current ? (hzQual === 'high' ? 1.0 : (hzQual === 'medium' ? 0.4 : 0.0)) : 0.0;

        for (const hazard of currentHazards) {
            ctx.fillStyle = `rgba(${activeThemeRgb}, 0.2)`;
            ctx.strokeStyle = activeThemeHex;
            ctx.lineWidth = 2;
            
            ctx.shadowBlur = 10 * hzShadowMult;
            ctx.shadowColor = activeThemeHex;
            
            const spikeWidth = 20; 
            const numSpikes = Math.max(1, Math.floor(hazard.w / spikeWidth));
            const actualSpikeWidth = hazard.w / numSpikes;
            
            ctx.beginPath();
            if (hazard.w > hazard.h) {
                // Horizontal spikes pointing up
                ctx.moveTo(hazard.x, hazard.y + hazard.h);
                for(let i=0; i<numSpikes; i++) {
                     ctx.lineTo(hazard.x + i*actualSpikeWidth + actualSpikeWidth/2, hazard.y);
                     ctx.lineTo(hazard.x + (i+1)*actualSpikeWidth, hazard.y + hazard.h);
                }
                ctx.lineTo(hazard.x, hazard.y + hazard.h);
            } else {
                // Vertical wall spikes (fallback)
                ctx.rect(hazard.x, hazard.y, hazard.w, hazard.h);
            }
            ctx.fill();
            ctx.stroke();
            
            ctx.shadowBlur = 0;
        }

        // Draw Jump Pads (Geometry Dash Orbs/Pads)
        for (const pad of currentPads) {
            ctx.fillStyle = `rgba(${activeThemeRgb}, 0.8)`;
            ctx.shadowBlur = 15 * hzShadowMult;
            ctx.shadowColor = activeThemeHex;
            
            // Draw a glowing arched pad
            ctx.beginPath();
            ctx.moveTo(pad.x, pad.y + pad.h);
            ctx.quadraticCurveTo(pad.x + pad.w/2, pad.y - pad.h/2, pad.x + pad.w, pad.y + pad.h);
            ctx.fill();
            
            ctx.fillStyle = '#ffffff';
            ctx.shadowBlur = bloomRef.current ? 5 : 0;
            ctx.beginPath();
            ctx.moveTo(pad.x + pad.w * 0.2, pad.y + pad.h);
            ctx.quadraticCurveTo(pad.x + pad.w/2, pad.y + pad.h * 0.2, pad.x + pad.w * 0.8, pad.y + pad.h);
            ctx.fill();
            
            ctx.shadowBlur = 0;
        }
        
        // Draw Goal
        const goal = levels[currentLevel].goal;
        const allColl = levels[currentLevel].lumens.every(l => l.collected);
        if (allColl) {
            ctx.fillStyle = `rgba(${themeRef.current.rgb}, ${0.1 + Math.sin(time / 150) * 0.05})`;
            ctx.strokeStyle = themeRef.current.hex; 
        } else {
            ctx.fillStyle = `rgba(100, 100, 100, 0.1)`;
            ctx.strokeStyle = '#666';
        }
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.rect(goal.x, goal.y, goal.w, goal.h); ctx.fill(); ctx.stroke();
        // Draw Lumens
        for (const lumen of levels[currentLevel].lumens) {
            if (!lumen.collected) {
                ctx.fillStyle = activeThemeHex; ctx.shadowBlur = bloomRef.current ? 10 : 0; ctx.shadowColor = activeThemeHex;
                ctx.beginPath();
                ctx.translate(lumen.x + lumen.w/2, lumen.y + lumen.h/2);
                ctx.rotate(time / 500);
                ctx.rect(-lumen.w/2, -lumen.h/2, lumen.w, lumen.h);
                ctx.fill();
                ctx.rotate(-time / 500);
                ctx.translate(-(lumen.x + lumen.w/2), -(lumen.y + lumen.h/2));
                ctx.shadowBlur = 0;
            }
        }

        // Draw Lumen Collection Particles
        for (const p of particles) {
            ctx.fillStyle = p.color || `rgba(${activeThemeRgb}, ${p.life})`;
            ctx.globalAlpha = p.life / p.maxLife;
            ctx.beginPath();
            ctx.arc(p.x, p.y, (p.size || 3) * (p.life / p.maxLife), 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1.0;
        
        // Draw Enemies
        for (const enemy of levels[currentLevel].enemies) {
            if (enemy.w <= 0) continue; // dead
            
            let drawColor = '#666666';
            if (enemy.state === 'chase') drawColor = '#ccaa00';
            else if (enemy.state === 'attack') drawColor = enemy.timer > 0 && enemy.timer < 0.1 ? '#ffffff' : '#ff2222';
            
            ctx.fillStyle = drawColor;
            ctx.fillRect(enemy.x, enemy.y, enemy.w, enemy.h);
            
            // Draw Eye
            ctx.fillStyle = enemy.state === 'attack' ? '#ffffff' : themeRef.current.hex;
            const eyeOffset = enemy.dir > 0 ? enemy.w - 6 : 2;
            ctx.fillRect(enemy.x + eyeOffset, enemy.y + 4, 4, 4);
        }
  
        if (trail.length > 1) {
            ctx.lineCap = 'round'; ctx.lineJoin = 'round';
            for (let i = 0; i < trail.length - 1; i++) {
                ctx.beginPath();
                ctx.moveTo(trail[i].x, trail[i].y);
                ctx.lineTo(trail[i+1].x, trail[i+1].y);
                ctx.lineWidth = 8 + (trail[i].alpha * 6);
                ctx.strokeStyle = `rgba(${themeRef.current.rgb}, ${trail[i].alpha})`;
                ctx.stroke();
            }
        }
  
        if (!player.dead) {
            ctx.save();
            ctx.translate(player.x + player.width/2, player.y + player.height/2);
            const sx = 1 + Math.abs(player.vx) * 0.0002;
            const sy = 1 + Math.abs(player.vy) * 0.0003;
            ctx.scale(1/sy, Math.max(0.5, 1/sx)); 
    
            const gQual = graphicsRef.current;
            const shadowMult = bloomRef.current ? (gQual === 'high' ? 1.0 : (gQual === 'medium' ? 0.4 : 0.0)) : 0.0;

            if (player.isDashing) {
                let colorHex = '#ffffff';
                if (dashColorRef.current === 'brand') colorHex = themeRef.current.hex;
                else if (dashColorRef.current === 'red') colorHex = '#ff3333';
                else if (dashColorRef.current === 'blue') colorHex = '#3366ff';
                else if (dashColorRef.current === 'yellow') colorHex = '#ffcc00';

                ctx.fillStyle = colorHex; 
                ctx.shadowBlur = 30 * shadowMult; 
                ctx.shadowColor = colorHex;
            } else if (player.dashFade > 0) {
                const glow = player.dashFade;
                
                let targetHex = '#ffffff';
                if (dashColorRef.current === 'brand') targetHex = themeRef.current.hex;
                else if (dashColorRef.current === 'red') targetHex = '#ff3333';
                else if (dashColorRef.current === 'blue') targetHex = '#3366ff';
                else if (dashColorRef.current === 'yellow') targetHex = '#ffcc00';

                // Very simple hex to rgb fade approximation toward grey base
                ctx.fillStyle = targetHex;
                ctx.globalAlpha = glow;
                ctx.shadowBlur = 30 * glow * shadowMult;
                ctx.shadowColor = targetHex;
            } else { 
                ctx.fillStyle = '#E0E0E0'; 
                ctx.shadowBlur = 0;
                ctx.globalAlpha = 1.0;
            }
            
            ctx.beginPath();
            if (shapeRef.current === 'circle') {
                ctx.arc(0, 0, player.width / 2, 0, Math.PI * 2);
                ctx.fill();
            } else if (shapeRef.current === 'triangle') {
                ctx.moveTo(0, -player.height / 2);
                ctx.lineTo(player.width / 2, player.height / 2);
                ctx.lineTo(-player.width / 2, player.height / 2);
                ctx.closePath();
                ctx.fill();
            } else {
                ctx.fillRect(-player.width/2, -player.height/2, player.width, player.height);
            }
            ctx.restore(); // Restore Player Transform
        }
        
        ctx.restore(); // Restore Global Camera Shake Transform

        ctx.globalAlpha = 1.0; // Reset alpha explicitly
        ctx.shadowBlur = 0; // Reset shadow for text rendering
  
        ctx.fillStyle = '#666'; ctx.font = '11px monospace';
        ctx.fillText(`WASD/Arrows: MOVE  Space: DASH  Wall: SLIDE/JUMP  --- LEVEL ${currentLevel + 1}/${levels.length} ---`, 20, 30);
        
        ctx.fillStyle = themeRef.current.hex; ctx.font = 'bold 24px monospace';
        ctx.shadowBlur = 4 * (bloomRef.current && graphicsRef.current === 'high' ? 1 : 0); ctx.shadowColor = '#000000';
        ctx.fillText(`LUMENS: ${totalLumens}`, 20, 70);
        
        if (gameModeRef.current === 'challenge') {
            challengeTimerRef.current -= delta;
            
            // Check for challenge game over
            if (challengeTimerRef.current <= 0 && !player.dead) {
                challengeTimerRef.current = 0;
                setGameState('gameover');
            }

            ctx.fillStyle = challengeTimerRef.current < 10 ? '#ff3333' : themeRef.current.hex;
            ctx.fillText(`TIME: ${challengeTimerRef.current.toFixed(1)}s`, canvas.width - 200, 70);
        }

        ctx.shadowBlur = 0;

        if (postProcessingRef.current) {
            // Apply a simple CRT / Scanline pass
            ctx.fillStyle = 'rgba(0,0,0,0.15)';
            for(let scan = 0; scan < canvas.height; scan += 4) {
                ctx.fillRect(0, scan, canvas.width, 1);
            }
            
            // Apply vignette
            const grad = ctx.createRadialGradient(canvas.width/2, canvas.height/2, canvas.height/3, canvas.width/2, canvas.height/2, canvas.height);
            grad.addColorStop(0, 'rgba(0,0,0,0)');
            grad.addColorStop(1, 'rgba(0,0,0,0.6)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        
        currentLevelRef.current = currentLevel;
        totalLumensRef.current = totalLumens;
        if (playerStateRef) {
            playerStateRef.current = player;
            trailStateRef.current = trail;
            particlesStateRef.current = particles;
        }

        animationFrameId = requestAnimationFrame(gameLoop);
      };
      
      if (gameState === 'playing') {
        animationFrameId = requestAnimationFrame(gameLoop);
      }
  
      return () => {
          window.removeEventListener('keydown', keyDownHandler);
          window.removeEventListener('keyup', keyUpHandler);
          cancelAnimationFrame(animationFrameId);
      };
    }, [gameState, previousGameState]);
  
    return (
      <div className="flex-1 flex flex-col bg-[#0A0A0A]">
        <div className="flex-1 flex items-center justify-center p-2 sm:p-4 w-full h-full relative min-h-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] max-w-[800px] aspect-square rounded-full blur-[120px] pointer-events-none transition-colors duration-1000" style={{ backgroundColor: `${theme.hex}15` }}></div>
          <div 
            className="relative z-10 border p-1 md:p-2 bg-[#1A1A1A] rounded-xl shadow-2xl overflow-hidden transition-colors flex items-center justify-center w-full max-w-[1400px] aspect-[2/1] max-h-full" 
            style={{ 
              borderColor: `${theme.hex}40`,
              maxWidth: 'min(1400px, calc((100vh - 100px) * 2))' 
            }}
          >
            <canvas 
              ref={canvasRef} 
              width={800} 
              height={400} 
              className="bg-[#050505] rounded block outline-none ring-0 focus:ring-1 w-full h-full object-contain"
              style={{ '--tw-ring-color': theme.hex } as any}
              tabIndex={0}
            />
            
            {gameState === 'paused' && (
                <div className="absolute inset-0 bg-[#050505]/90 flex flex-col items-center justify-center z-20 backdrop-blur-sm">
                    <h2 className="text-white text-5xl mb-8 font-black tracking-widest drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]">PAUSED</h2>
                    <div className="flex flex-col gap-3 w-64">
                        <button 
                            onClick={() => gameControl.current.resumeGame()}
                            className="bg-[#0f0f0f] border text-white py-3 transition-all font-mono font-bold tracking-wider cursor-pointer"
                            style={{ borderColor: `${theme.hex}50`, color: theme.hex, boxShadow: `0 0 10px ${theme.hex}20` }}
                        >RESUME</button>
                        <button 
                            onClick={() => gameControl.current.reset()}
                            className="bg-[#0f0f0f] border border-[#333] text-gray-300 py-3 hover:bg-[#222] hover:text-white transition-all font-mono font-bold tracking-wider cursor-pointer"
                        >RESTART LEVEL</button>
                        <button 
                            onClick={gameControl.current.mainMenu}
                            className="bg-[#0f0f0f] border border-[#333] text-gray-500 py-3 hover:bg-[#222] hover:text-white transition-all font-mono font-bold tracking-wider cursor-pointer"
                        >MAIN MENU</button>
                        <button 
                            onClick={() => { setPreviousGameState('paused'); setGameState('settings'); }}
                            className="bg-[#0f0f0f] border border-[#333] text-gray-500 py-3 hover:bg-[#222] hover:text-white transition-all font-mono font-bold tracking-wider cursor-pointer"
                        >SETTINGS</button>
                    </div>
                </div>
            )}

            {gameState === 'settings' && (
                <div className="absolute inset-0 bg-[#050505]/95 flex flex-col items-center justify-center z-40 backdrop-blur-md">
                    <button 
                        onClick={() => setGameState(previousGameState)}
                        className="absolute top-6 left-6 text-gray-500 hover:text-white transition-colors flex items-center gap-2"
                        title="Back (Esc)"
                    >
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"></path><polyline points="12 19 5 12 12 5"></polyline></svg>
                        <span className="font-mono text-sm tracking-widest hidden sm:inline-block">ESC</span>
                    </button>

                    <h2 className="text-white text-5xl mb-10 font-black tracking-[8px] uppercase" style={{ color: theme.hex }}>SYSTEM SETTINGS</h2>
                    
                    <div className="flex flex-col gap-8 w-[350px] font-mono">
                        {/* Outlay Color */}
                        <div className="flex flex-col gap-3">
                            <div className="text-[12px] text-white uppercase tracking-widest opacity-80">Outlay Color Protocol</div>
                            <div className="flex justify-between items-center bg-[#111] border border-[#333] p-3 rounded">
                                {themes?.map((t: any) => (
                                    <button
                                        key={t.name}
                                        onClick={() => setTheme(t)}
                                        className={`w-8 h-8 rounded-full border transition-all ${theme.name === t.name ? 'border-white' : 'border-[#444]'}`}
                                        style={{ 
                                            background: t.hex, 
                                            transform: theme.name === t.name ? 'scale(1.2)' : 'scale(1)',
                                            boxShadow: theme.name === t.name ? `0 0 20px ${t.hex}, inset 0 0 10px rgba(255,255,255,0.5)` : 'none'
                                        }}
                                        title={t.name}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Sounds */}
                        <div className="flex flex-col gap-3">
                            <div className="text-[12px] text-white uppercase tracking-widest opacity-80">Audio Subsystem</div>
                            <button 
                                onClick={() => setSoundEnabled(!soundEnabled)}
                                className="w-full py-3 bg-[#111] border border-[#333] text-white font-bold tracking-widest uppercase transition-all hover:bg-[#222]"
                                style={{ color: soundEnabled ? theme.hex : '#666', borderColor: soundEnabled ? theme.hex : '#333' }}
                            >
                                {soundEnabled ? 'ENABLED' : 'DISABLED'}
                            </button>
                        </div>

                        {/* Simulation Hardness */}
                        <div className="flex flex-col gap-3">
                            <div className="text-[12px] text-white uppercase tracking-widest opacity-80">Simulation Hardness</div>
                            <div className="flex bg-[#111] border border-[#333] p-1 rounded gap-1">
                                {(['easy', 'medium', 'hard'] as const).map(diff => (
                                    <button
                                        key={diff}
                                        onClick={() => setDifficulty(diff)}
                                        className={`flex-1 py-3 rounded capitalize text-[13px] font-bold transition-all ${difficulty === diff ? 'bg-[#222] text-white border' : 'text-gray-500 hover:text-gray-300 hover:bg-[#1a1a1a] border border-transparent'}`}
                                        style={{ 
                                            color: difficulty === diff ? theme.hex : undefined,
                                            borderColor: difficulty === diff ? theme.hex : 'transparent',
                                            boxShadow: difficulty === diff ? `0 0 12px ${theme.hex}50, inset 0 0 8px ${theme.hex}30` : 'none'
                                        }}
                                    >
                                        {diff}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Graphics Quality */}
                        <div className="flex flex-col gap-3">
                            <div className="text-[12px] text-white uppercase tracking-widest opacity-80">Graphics Quality</div>
                            <div className="flex bg-[#111] border border-[#333] p-1 rounded gap-1">
                                {(['low', 'medium', 'high'] as const).map(qual => (
                                    <button
                                        key={qual}
                                        onClick={() => setGraphicsQual(qual)}
                                        className={`flex-1 py-3 rounded capitalize text-[13px] font-bold transition-all ${graphicsQual === qual ? 'bg-[#222] text-white border' : 'text-gray-500 hover:text-gray-300 hover:bg-[#1a1a1a] border border-transparent'}`}
                                        style={{ 
                                            color: graphicsQual === qual ? theme.hex : undefined,
                                            borderColor: graphicsQual === qual ? theme.hex : 'transparent',
                                            boxShadow: graphicsQual === qual ? `0 0 12px ${theme.hex}50, inset 0 0 8px ${theme.hex}30` : 'none'
                                        }}
                                    >
                                        {qual}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Visual Adjustments */}
                        <div className="flex flex-col gap-3 mt-2 border-t border-[#333] pt-4">
                            <div className="text-[12px] text-white uppercase tracking-widest opacity-80">Particle Density</div>
                            <div className="flex bg-[#111] border border-[#333] p-1 rounded gap-1">
                                {(['low', 'medium', 'high'] as const).map(qual => (
                                    <button
                                        key={`particle-${qual}`}
                                        onClick={() => setParticleDensity(qual)}
                                        className={`flex-1 py-2 rounded capitalize text-[13px] font-bold transition-all ${particleDensity === qual ? 'bg-[#222] text-white border' : 'text-gray-500 hover:text-gray-300 hover:bg-[#1a1a1a] border border-transparent'}`}
                                        style={{ 
                                            color: particleDensity === qual ? theme.hex : undefined,
                                            borderColor: particleDensity === qual ? theme.hex : 'transparent',
                                            boxShadow: particleDensity === qual ? `0 0 12px ${theme.hex}50, inset 0 0 8px ${theme.hex}30` : 'none'
                                        }}
                                    >
                                        {qual}
                                    </button>
                                ))}
                            </div>
                            
                            <div className="flex items-center justify-between mt-2">
                                <span className="text-[12px] text-white uppercase tracking-widest opacity-80">Bloom Effect</span>
                                <button
                                    onClick={() => setBloomEnabled(!bloomEnabled)}
                                    className={`w-12 h-6 rounded-full transition-colors relative flex items-center ${bloomEnabled ? 'bg-[#222] border' : 'bg-[#111] border border-[#333]'}`}
                                    style={{ borderColor: bloomEnabled ? theme.hex : undefined }}
                                >
                                    <div 
                                        className={`w-4 h-4 rounded-full absolute bg-white transition-all transform ${bloomEnabled ? 'translate-x-7' : 'translate-x-1'}`}
                                        style={{ boxShadow: bloomEnabled ? `0 0 10px ${theme.hex}` : 'none' }}
                                    />
                                </button>
                            </div>

                            <div className="flex items-center justify-between mt-2">
                                <span className="text-[12px] text-white uppercase tracking-widest opacity-80">Retro Shader</span>
                                <button
                                    onClick={() => setPostProcessingShader(!postProcessingShader)}
                                    className={`w-12 h-6 rounded-full transition-colors relative flex items-center ${postProcessingShader ? 'bg-[#222] border' : 'bg-[#111] border border-[#333]'}`}
                                    style={{ borderColor: postProcessingShader ? theme.hex : undefined }}
                                >
                                    <div 
                                        className={`w-4 h-4 rounded-full absolute bg-white transition-all transform ${postProcessingShader ? 'translate-x-7' : 'translate-x-1'}`}
                                        style={{ boxShadow: postProcessingShader ? `0 0 10px ${theme.hex}` : 'none' }}
                                    />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {gameState === 'mainmenu' && (
                <div className="absolute inset-0 bg-[#050505] flex flex-col items-center justify-center z-30">
                    <h1 className="text-white text-6xl md:text-7xl mb-12 font-black tracking-[10px] uppercase text-center" style={{ color: theme.hex, textShadow: `0 0 20px ${theme.hex}80` }}>Lumen Drift</h1>
                    
                    <div className="bg-[#0A0A0A] border p-6 rounded-lg mb-10 max-w-sm w-full font-mono flex flex-col gap-8" style={{ borderColor: `${theme.hex}50` }}>
                        <div className="flex flex-col gap-3">
                            <div className="text-[12px] text-white uppercase tracking-widest text-center opacity-80">Lumen Collector Shape</div>
                            <div className="flex justify-between items-center bg-[#111] border border-[#333] p-1 rounded gap-1">
                                {(['square', 'circle', 'triangle'] as const).map(shape => (
                                    <button
                                        key={shape}
                                        onClick={() => setCollectorShape(shape)}
                                        className={`flex-1 py-3 rounded capitalize text-sm font-bold transition-all ${collectorShape === shape ? 'bg-[#222] text-white border' : 'text-gray-500 hover:text-gray-300 hover:bg-[#1a1a1a] border border-transparent'}`}
                                        style={{ 
                                            color: collectorShape === shape ? theme.hex : undefined,
                                            borderColor: collectorShape === shape ? theme.hex : 'transparent',
                                            boxShadow: collectorShape === shape ? `0 0 12px ${theme.hex}50, inset 0 0 8px ${theme.hex}30` : 'none'
                                        }}
                                    >
                                        {shape}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <div className="text-[12px] text-white uppercase tracking-widest text-center opacity-80">Dash Afterglow Engine</div>
                            <div className="flex justify-between items-center bg-[#111] border border-[#333] p-2 rounded gap-2">
                                {DASH_COLORS.map(c => (
                                    <button
                                        key={c.id}
                                        onClick={() => setDashColor(c.id as any)}
                                        className="w-10 h-10 rounded-full border border-[#333] transition-all"
                                        style={{ 
                                            background: c.hex, 
                                            transform: dashColor === c.id ? 'scale(1.15)' : 'scale(1)',
                                            boxShadow: dashColor === c.id ? `0 0 15px ${c.hex}` : 'none',
                                            borderColor: dashColor === c.id ? '#fff' : '#333'
                                        }}
                                        title={c.id}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        {hasSave && (
                            <button 
                                onClick={gameControl.current.loadGame}
                                className="bg-[#0f0f0f] border py-4 px-10 transition-all font-mono font-bold tracking-[6px] text-lg hover:bg-[#111]"
                                style={{ borderColor: theme.hex, color: theme.hex, boxShadow: `0 0 15px ${theme.hex}30` }}
                            >CONTINUE</button>
                        )}
                        <button 
                            onClick={gameControl.current.startGame}
                            className={`bg-[#0f0f0f] border py-4 px-10 transition-all font-mono font-bold tracking-[6px] text-lg hover:bg-[#111] ${hasSave ? 'opacity-60 hover:opacity-100' : ''}`}
                            style={{ borderColor: theme.hex, color: theme.hex, boxShadow: hasSave ? 'none' : `0 0 15px ${theme.hex}30` }}
                        >NEW STORY</button>
                        
                        <button 
                            onClick={gameControl.current.startChallenge}
                            className="bg-[#0f0f0f] border border-[#ff3333]/50 py-4 px-8 transition-all font-mono font-bold tracking-[6px] text-lg text-[#ff3333] hover:bg-[#ff3333]/10 hover:border-[#ff3333]"
                            style={{ boxShadow: `0 0 15px rgba(255,51,51,0.2)` }}
                        >CHALLENGE</button>
                        
                        <button 
                            onClick={() => { setPreviousGameState('mainmenu'); setGameState('settings'); }}
                            className="bg-[#111] border border-[#333] p-4 text-gray-500 hover:text-white hover:bg-[#222] transition-colors"
                            title="Open Settings"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                        </button>
                    </div>
                </div>
            )}

            {gameState === 'gameover' && (
                <div className="absolute inset-0 bg-[#0a0000]/90 flex flex-col items-center justify-center z-20 backdrop-blur-sm">
                    <h2 className="text-[#ff3333] text-5xl mb-8 font-black tracking-widest drop-shadow-[0_0_15px_rgba(255,0,0,0.8)]">SYSTEM FAILURE</h2>
                    <div className="flex flex-col gap-3 w-64">
                        <button 
                            onClick={() => gameControl.current.reset()}
                            className="bg-[#0f0f0f] border border-[#ff3333]/30 text-white py-3 hover:bg-[#ff3333]/10 hover:border-[#ff3333] hover:text-[#ff3333] transition-all font-mono font-bold tracking-wider cursor-pointer shadow-[0_0_10px_rgba(255,51,51,0.1)] hover:shadow-[0_0_20px_rgba(255,51,51,0.4)]"
                        >RETRY LEVEL</button>
                        <button 
                            onClick={() => gameControl.current.restartGame()}
                            className="bg-[#0f0f0f] border border-[#ff3333]/30 text-white py-3 hover:bg-[#ff3333]/10 hover:border-[#ff3333] hover:text-[#ff3333] transition-all font-mono font-bold tracking-wider cursor-pointer"
                        >NEW GAME</button>
                        <button 
                            onClick={gameControl.current.mainMenu}
                            className="bg-[#0f0f0f] border border-[#333] text-gray-500 py-3 hover:bg-[#222] hover:text-white transition-all font-mono font-bold tracking-wider cursor-pointer"
                        >MAIN MENU</button>
                    </div>
                </div>
            )}

            {gameState === 'won' && (
                <div className="absolute inset-0 bg-[#050505]/90 flex flex-col items-center justify-center z-20 backdrop-blur-sm">
                    <h2 className="text-[#00F2FF] text-5xl mb-2 font-black tracking-widest drop-shadow-[0_0_15px_rgba(0,242,255,0.8)]" style={{ color: theme.hex }}>CHALLENGE CLEARED</h2>
                    <p className="text-white mb-8 font-mono text-xl">TIME LEFT: {challengeTimerRef.current.toFixed(2)}s</p>
                    <div className="flex flex-col gap-3 w-64">
                        <button 
                            onClick={gameControl.current.startChallenge}
                            className="bg-[#0f0f0f] border text-white py-3 transition-all font-mono font-bold tracking-wider cursor-pointer"
                            style={{ borderColor: theme.hex, color: theme.hex, boxShadow: `0 0 10px ${theme.hex}30` }}
                        >PLAY AGAIN</button>
                        <button 
                            onClick={gameControl.current.mainMenu}
                            className="bg-[#0f0f0f] border border-[#333] text-gray-500 py-3 hover:bg-[#222] hover:text-white transition-all font-mono font-bold tracking-wider cursor-pointer"
                        >MAIN MENU</button>
                    </div>
                </div>
            )}

            {gameState === 'levelcomplete' && (
                <div className="absolute inset-0 bg-[#050505]/90 flex flex-col items-center justify-center z-20 backdrop-blur-sm">
                    <h2 className="text-5xl mb-2 font-black tracking-widest drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]" style={{ color: theme.hex }}>LEVEL CLEARED</h2>
                    <div className="text-white mb-8 font-mono text-xl flex flex-col items-center gap-2">
                        <p>TIME: {levelTimeRef.current.toFixed(2)}s</p>
                        <p>LUMENS: {totalLumensRef.current}</p>
                    </div>
                    <div className="flex flex-col gap-3 w-64">
                        <button 
                            onClick={gameControl.current.nextLevel}
                            className="bg-[#0f0f0f] border text-white py-3 transition-all font-mono font-bold tracking-wider cursor-pointer shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                            style={{ borderColor: theme.hex, color: theme.hex, boxShadow: `0 0 10px ${theme.hex}30` }}
                        >NEXT LEVEL</button>
                        <button 
                            onClick={gameControl.current.mainMenu}
                            className="bg-[#0f0f0f] border border-[#333] text-gray-500 py-3 hover:bg-[#222] hover:text-white transition-all font-mono font-bold tracking-wider cursor-pointer"
                        >MAIN MENU</button>
                    </div>
                </div>
            )}
            {gameState === 'playing' && (
                <button
                    onClick={() => setGameState('paused')}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white z-20 bg-[#050505]/50 p-2 rounded-full border border-[#333] backdrop-blur-sm transition-all"
                    title="Pause Game"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
                </button>
            )}
            
          </div>
        </div>
        <div className="h-auto py-4 md:h-[120px] md:py-0 border-t border-[#222] bg-[#050505] flex flex-wrap md:flex-nowrap items-center px-[30px] shrink-0 gap-[40px]">
          <div className="flex flex-col gap-2 shrink-0">
            <div className="text-[10px] uppercase tracking-[1px] text-[#666] font-bold">Visual Trail Render</div>
            <div className="w-[180px] h-[60px] border border-dashed border-[#333] relative flex items-center justify-center bg-[#0A0A0A]">
              <div className="w-[140px] h-[2px] transition-all" style={{ background: `linear-gradient(90deg, transparent, ${theme.hex})`, boxShadow: `0 0 10px ${theme.hex}` }}></div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <div className="bg-black/50 text-[11px] px-3.5 py-1.5 border rounded transition-colors" style={{ borderColor: `${theme.hex}50`, color: theme.hex }}>Coyote Time: 0.15s</div>
            <div className="bg-black/50 text-[11px] px-3.5 py-1.5 border rounded transition-colors" style={{ borderColor: `${theme.hex}50`, color: theme.hex }}>Buffer: 8 frames</div>
            <div className="bg-black/50 text-[11px] px-3.5 py-1.5 border rounded transition-colors" style={{ borderColor: `${theme.hex}50`, color: theme.hex }}>Bloom: Fast Filter</div>
          </div>
          <div className="md:ml-auto md:text-right shrink-0">
              <div className="text-[10px] uppercase tracking-[1px] text-[#666] font-bold mb-1">Deployment Status</div>
              <div className="text-[12px] text-white">Ready for Virtual Env Migration</div>
          </div>
        </div>
      </div>
    )
  }

const GodotResources = () => (
    <div className="flex flex-col lg:flex-row h-full">
      {/* Left Tree */}
      <div className="w-full lg:w-[300px] border-b lg:border-b-0 lg:border-r border-[#222] p-[25px] flex flex-col font-sans text-[12px] overflow-y-auto shrink-0 bg-[#050505] min-h-[300px]">
          <div className="text-[10px] uppercase tracking-[1px] text-[#666] mb-5 font-bold">Scene Tree</div>
          
          <div className="flex items-center mb-3 opacity-100 text-[#00F2FF] font-medium">
              <div className="w-2 h-2 rounded-full mr-2.5 border border-current"></div>
              Player (CharacterBody2D)
          </div>
          <div className="flex items-center mb-3 opacity-70 ml-5 text-white">
              <div className="w-2 h-2 rounded-full mr-2.5 border border-current"></div>
              Sprite2D (Neon_Core)
          </div>
          <div className="flex items-center mb-3 opacity-70 ml-5 text-white">
              <div className="w-2 h-2 rounded-full mr-2.5 border border-current"></div>
              Line2D (Motion_Trail)
          </div>
          <div className="flex items-center mb-3 opacity-70 ml-5 text-white">
              <div className="w-2 h-2 rounded-full mr-2.5 border border-current"></div>
              CollisionShape2D
          </div>
  
          <div className="flex items-center mb-3 opacity-100 text-[#00F2FF] font-medium mt-10">
              <div className="w-2 h-2 rounded-full mr-2.5 border border-current"></div>
              GameManager (Singleton)
          </div>
          <div className="flex items-center mb-3 opacity-70 text-white">
              <div className="w-2 h-2 rounded-full mr-2.5 border border-current"></div>
              WorldEnvironment (Bloom)
          </div>
          <div className="flex items-center mb-3 opacity-70 text-white">
              <div className="w-2 h-2 rounded-full mr-2.5 border border-current"></div>
              ChimeSystem (Signals)
          </div>
          
          <div className="mt-8 p-4 bg-[#0A0A0A] border border-[#222] rounded flex flex-col gap-2">
             <div className="text-[10px] uppercase tracking-wider text-[#666] font-bold">Local File Access</div>
             <p className="text-[11px] text-[#999] leading-relaxed">
               Select <span className="bg-[#111] px-1 py-0.5 border border-[#333] rounded text-[#E0E0E0] mx-0.5">Export as ZIP</span> in the AI Studio environment sidebar to obtain the raw .gd files.
             </p>
          </div>
      </div>
  
      {/* Center Code Editor */}
      <div className="flex-1 bg-[#0A0A0A] p-5 md:p-[30px] flex flex-col relative min-h-0">
          <div className="flex justify-between mb-5 font-mono text-[11px] opacity-50 text-white shrink-0">
              <span>Player.gd</span>
              <span>GDScript</span>
          </div>
          <div className="flex-1 overflow-auto font-mono text-[12px] md:text-[13px] leading-[1.6] text-[#D4D4D4] whitespace-pre scrollbar-thin">
  {`# Excerpt displaying friction and momentum math

extends CharacterBody2D
  
var velocity = Vector2.ZERO
var drift_momentum = 1.24
var friction = 0.92
  
func _physics_process(delta):
  var input = Input.get_vector("ui_left", "ui_right", "ui_up", "ui_down")
  
  if input != Vector2.ZERO:
    velocity += input * drift_momentum
  else:
    velocity *= friction
  
  move_and_slide()
  update_trail_points()`}
          </div>
      </div>
  
      {/* Right Sidebar Stats */}
      <div className="w-full lg:w-[220px] border-t lg:border-t-0 lg:border-l border-[#222] p-[20px] bg-[#050505] flex flex-col shrink-0 overflow-y-auto font-sans min-h-[250px]">
          <div className="mb-[30px]">
             <div className="text-[10px] uppercase tracking-[1px] text-[#666] mb-2 font-bold">V-Sync</div>
             <div className="text-[18px] font-light text-white">Disabled</div>
          </div>
          <div className="mb-[30px]">
             <div className="text-[10px] uppercase tracking-[1px] text-[#666] mb-2 font-bold">Memory Overhead</div>
             <div className="text-[18px] font-light text-[#00F2FF]">12.4 MB</div>
          </div>
          <div className="mb-[30px]">
             <div className="text-[10px] uppercase tracking-[1px] text-[#666] mb-2 font-bold">Target Platform</div>
             <div className="text-[18px] font-light text-white">Old-Gen Laptop</div>
          </div>
          <div className="mb-[30px]">
             <div className="text-[10px] uppercase tracking-[1px] text-[#666] mb-2 font-bold">Physics Tick</div>
             <div className="text-[18px] font-light text-white">60 Hz</div>
          </div>
      </div>
    </div>
  );
