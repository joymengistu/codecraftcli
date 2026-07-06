
import React, { useEffect, useState } from 'react';
import { Level } from '../types';

interface GameCanvasProps {
  level: Level;
  playerPos: [number, number];
  isJumping: boolean;
  isError: boolean;
  isSuccess: boolean;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ level, playerPos, isJumping, isError, isSuccess }) => {
  const [rows, cols] = level.gridSize;
  const cellSize = 45; // Reduced from 60
  const width = cols * cellSize;
  const height = rows * cellSize;
  const [showBing, setShowBing] = useState(false);

  useEffect(() => {
    setShowBing(true);
    const timer = setTimeout(() => setShowBing(false), 500);
    return () => clearTimeout(timer);
  }, [playerPos]);

  return (
    <div className={`relative flex justify-center items-center rounded-xl overflow-hidden transition-all duration-500 ${isError ? 'scale-[0.98]' : ''}`}>
      <div className="absolute inset-0 pointer-events-none z-10 opacity-[0.03]" style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 1px, #fff 1px, #fff 2px)', backgroundSize: '100% 2px' }}></div>
      
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="overflow-visible drop-shadow-xl"
      >
        <rect width={width} height={height} fill="#020617" />
        
        {Array.from({ length: rows }).map((_, r) => (
          Array.from({ length: cols }).map((_, c) => (
            <rect
              key={`${r}-${c}`}
              x={c * cellSize}
              y={r * cellSize}
              width={cellSize}
              height={cellSize}
              fill="none"
              stroke="rgba(255, 255, 255, 0.02)"
              strokeWidth="0.5"
            />
          ))
        ))}

        <g className="animate-pulse">
          <circle
            cx={level.goalPos[1] * cellSize + cellSize / 2}
            cy={level.goalPos[0] * cellSize + cellSize / 2}
            r={cellSize / 3.5}
            fill="rgba(251, 191, 36, 0.05)"
            stroke="#fbbf24"
            strokeWidth="1"
            strokeDasharray="3 1"
          />
          <text
            x={level.goalPos[1] * cellSize + cellSize / 2}
            y={level.goalPos[0] * cellSize + cellSize / 2 + 5}
            textAnchor="middle"
            fontSize="18"
            className="drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]"
          >
            ✧
          </text>
        </g>

        {level.obstacles.map(([y, x], i) => (
          <text key={`o-${i}`} x={x * cellSize + cellSize/2} y={y * cellSize + cellSize/2 + 5} textAnchor="middle" fontSize="16" className="opacity-40">
            ◈
          </text>
        ))}
        {level.enemies?.map(([y, x], i) => (
          <g key={`e-${i}`} className="animate-pulse">
            <circle cx={x * cellSize + cellSize/2} cy={y * cellSize + cellSize/2} r={cellSize/2.8} fill="rgba(239, 68, 68, 0.05)" stroke="#ef4444" strokeWidth="0.5" />
            <text x={x * cellSize + cellSize/2} y={y * cellSize + cellSize/2 + 6} textAnchor="middle" fontSize="18" fill="#ef4444">
              ⬟
            </text>
          </g>
        ))}

        <g 
          className="player-move"
          style={{ transform: `translate(${playerPos[1] * cellSize}px, ${playerPos[0] * cellSize}px)`, transition: 'transform 0.4s ease-out' }}
        >
          {showBing && (
            <circle cx={cellSize / 2} cy={cellSize / 2} r={cellSize / 2} fill="none" stroke={isError ? "#ef4444" : "#6366f1"} strokeWidth="1.5" className="animate-bing" />
          )}

          <g 
            className={isError ? '' : 'animate-hover-bob'}
            style={{ 
              transition: 'transform 0.3s ease-out',
              transform: `scale(${isJumping ? 1.3 : 1})`,
              transformOrigin: 'center'
            }}
          >
            <circle
              cx={cellSize / 2}
              cy={cellSize / 2}
              r={cellSize / 4.5}
              fill={isError ? "#ef4444" : "#6366f1"}
              className="drop-shadow-[0_0_10px_rgba(99,102,241,0.5)]"
            />
            <circle cx={cellSize / 2} cy={cellSize / 2} r={cellSize / 10} fill="rgba(255,255,255,0.15)" />
          </g>

          {isError && (
            <text x={cellSize/2} y={cellSize/2 + 5} textAnchor="middle" fontSize="20" className="animate-bounce">
              ⚠
            </text>
          )}
        </g>
      </svg>
    </div>
  );
};

export default GameCanvas;
