
import { Level } from './types';

export const COMMAND_LIST = [
  'move_up()',
  'move_down()',
  'move_left()',
  'move_right()',
  'jump_up()',
  'jump_down()',
  'jump_left()',
  'jump_right()',
  'loop(3)',
  'scan_perimeter()',
];

export const LEVELS: Level[] = [
  {
    id: 1,
    title: "Project Alpha: Vector Calibration",
    description: "Welcome to Nexus Operating System. Your objective is to calibrate the Nexus-1 unit by reaching the energy beacon. This sequence introduces the core syntax of modern Python programming.",
    objective: "Maneuver to Energy Beacon at coordinate (3, 3).",
    lesson: {
      concept: "Syntactic Structure",
      explanation: "Programming is the art of communicating specific instructions to a machine. In Python, function calls are the most fundamental building blocks. 'move_right()' invokes a predefined method within the robot's logic core.",
      pythonSnippet: "# This is a comment. The next line is a function call.\nmove_right()"
    },
    initialCode: "# Nexus-1 Calibration Sequence\n# Author: Nexus Systems Administrator\n",
    solutionKeywords: ["move_right", "move_down"],
    gridSize: [5, 5],
    startPos: [1, 1],
    goalPos: [3, 3],
    obstacles: [[2, 2]],
    enemies: [],
    hints: ["Utilize two longitudinal and two lateral adjustments."]
  },
  {
    id: 2,
    title: "Debris Protocol: Spatial Navigation",
    description: "Surface scans indicate significant spatial interference. You must navigate the Nexus-1 unit through the debris field while maintaining optimal power levels.",
    objective: "Bypass static debris to interface with the objective node.",
    lesson: {
      concept: "Instruction Pipelining",
      explanation: "Computers process logic in a strictly linear pipeline. Each line of Python code is parsed and executed sequentially. Mastering the order of operations is vital for complex spatial navigation.",
      pythonSnippet: "move_up()\nmove_left()  # Instructions execute in descending order"
    },
    initialCode: "# Mission 02: Spatial Pipeling\n",
    solutionKeywords: ["move"],
    gridSize: [6, 6],
    startPos: [0, 0],
    goalPos: [5, 5],
    obstacles: [[1, 1], [2, 2], [3, 3], [4, 4]],
    enemies: [],
    hints: ["Consider a non-linear approach to bypass the diagonal debris field."]
  },
  {
    id: 3,
    title: "Security Grid: Dynamic Interception",
    description: "Warning: Sector-4 Security Droids have been deployed. Standard movement patterns are insufficient. Deploy the JUMP sub-routines to leap past interception points.",
    objective: "Execute high-velocity jump maneuvers to skip past droids.",
    lesson: {
      concept: "Logic Abstraction",
      explanation: "Advanced functions like 'jump' abstract complex movement patterns into single calls. A jump skips one coordinate point entirely, allowing for rapid repositioning and threat avoidance.",
      pythonSnippet: "jump_down()  # Moves 2 squares in 1 logical step"
    },
    initialCode: "# Mission 03: Velocity Abstraction\n",
    solutionKeywords: ["jump"],
    gridSize: [6, 6],
    startPos: [0, 0],
    goalPos: [4, 4],
    obstacles: [[1, 1], [3, 3]],
    enemies: [[2, 2], [0, 2], [2, 0]],
    hints: ["Use Jumps to traverse 2 units of distance instantly."]
  },
  {
    id: 4,
    title: "Iterative Patterns: The Loop Module",
    description: "Efficiency is paramount. To navigate long corridors, manual command entry is inefficient. Use 'loops' to repeat operations and minimize instruction overhead.",
    objective: "Traverse the long corridor using 3 consecutive moves.",
    lesson: {
      concept: "Iteration (Loops)",
      explanation: "A loop allows you to execute the same instruction multiple times without repeating code. This is fundamental for processing large data sets or long-distance movement.",
      pythonSnippet: "for i in range(3):\n    move_right()  # Repeats 3 times"
    },
    initialCode: "# Mission 04: Iterative Optimization\n",
    solutionKeywords: ["loop"],
    gridSize: [7, 7],
    startPos: [0, 0],
    goalPos: [0, 6],
    obstacles: [[1, 0], [1, 1], [1, 2]],
    enemies: [],
    hints: ["A single loop(3) command can replace three move_right() calls."]
  },
  {
    id: 5,
    title: "Data Variables: Storing States",
    description: "Units must now store positional data. This mission requires precise coordinate management to navigate a moving energy field.",
    objective: "Sync with the fluctuating energy node at (5, 1).",
    lesson: {
      concept: "Variables & Memory",
      explanation: "Variables act as containers for data. You can store positions, health, or item counts. In high-level logic, we use variables to track the state of the environment.",
      pythonSnippet: "target_x = 5\nmove_to(target_x) # Using a variable to decide movement"
    },
    initialCode: "# Mission 05: Memory Allocation\n",
    solutionKeywords: ["move"],
    gridSize: [7, 7],
    startPos: [1, 5],
    goalPos: [5, 1],
    obstacles: [[3, 3], [3, 2], [2, 3]],
    enemies: [[4, 4]],
    hints: ["Plan your vector around the central obstacle cluster."]
  },
  {
    id: 6,
    title: "Conditional Logic: Branching Paths",
    description: "Final evaluation. You must adapt to environment obstacles. If a path is blocked, the unit must intelligently decide to jump.",
    objective: "Reach the core exit at (6, 6) through the heavy security wall.",
    lesson: {
      concept: "Conditionals (If/Else)",
      explanation: "Conditional logic allows programs to make decisions based on specific criteria. If an obstacle is detected, the program can branch into a 'jump' sub-routine instead of a standard move.",
      pythonSnippet: "if obstacle_detected():\n    jump_over()\nelse:\n    move_forward()"
    },
    initialCode: "# Mission 06: Logic Branching\n",
    solutionKeywords: ["jump", "move"],
    gridSize: [8, 8],
    startPos: [0, 0],
    goalPos: [7, 7],
    obstacles: [[1, 1], [3, 3], [5, 5]],
    enemies: [[2, 2], [4, 4], [6, 6]],
    hints: ["Combining move and jump is the only way to breach the defense layer."]
  }
];
