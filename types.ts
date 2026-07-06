
export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export interface LessonContent {
  concept: string;
  explanation: string;
  pythonSnippet: string;
}

export interface Level {
  id: number;
  title: string;
  description: string;
  objective: string;
  lesson: LessonContent;
  initialCode: string;
  solutionKeywords: string[];
  gridSize: [number, number]; // [rows, cols]
  startPos: [number, number]; // [y, x]
  goalPos: [number, number];  // [y, x]
  obstacles: [number, number][];
  enemies: [number, number][];
  hints: string[];
}

export interface UserState {
  completedLevels: number[];
  xp: number;
  rank: string;
}

export type Command = 
  | 'MOVE_UP' | 'MOVE_DOWN' | 'MOVE_LEFT' | 'MOVE_RIGHT' 
  | 'JUMP_UP' | 'JUMP_DOWN' | 'JUMP_LEFT' | 'JUMP_RIGHT'
  | 'PICKUP';

export interface GameState {
  playerPos: [number, number];
  isSuccess: boolean;
  isError: boolean;
  isJumping: boolean;
  message: string;
  executionHistory: Command[];
}
