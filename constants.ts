
import { CourtItem, ItemType, PlayerColor, LineType } from "./types";

export const MAX_PLAYERS = 4;
export const MAX_MARKERS = 10;
export const MAX_SHUTTLES = 1;

export const LINE_COLORS = [
  '#facc15', // Yellow (Default)
  '#ffffff', // White
  '#ef4444', // Red (Primitive)
  '#3b82f6', // Blue (Primitive)
  '#f97316', // Orange
  '#a855f7', // Purple
  '#4ade80', // Green
  '#9ca3af', // Gray
];

// Strictly map P1, P2, P3, P4 to these colors
export const PLAYER_ORDER_COLORS = [
  PlayerColor.RED,    // P1
  PlayerColor.BLUE,   // P2
  PlayerColor.YELLOW, // P3
  PlayerColor.ORANGE  // P4
];

export const DEFAULT_LINE_COLOR = LINE_COLORS[0];
export const DEFAULT_LINE_TYPE = LineType.SOLID;

export const INITIAL_ITEMS: CourtItem[] = [
  {
    id: 'p1',
    type: ItemType.PLAYER,
    position: { x: 25, y: 80 },
    color: PlayerColor.RED,
    label: 'P1'
  },
  {
    id: 'p2',
    type: ItemType.PLAYER,
    position: { x: 75, y: 80 },
    color: PlayerColor.BLUE,
    label: 'P2'
  },
  {
    id: 'p3',
    type: ItemType.PLAYER,
    position: { x: 50, y: 20 },
    color: PlayerColor.YELLOW,
    label: 'P3'
  },
  {
    id: 'm1',
    type: ItemType.MARKER,
    position: { x: 20, y: 38 },
    label: '1'
  }
];

export const INITIAL_FOCUS_POINTS = [
  { id: '1', text: 'Control the front court area to force lifting.', completed: true },
  { id: '2', text: 'Target the backhand corner of the opponent.', completed: true },
];

export const GRID_BG = `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`;

// 1 Grid Unit ≈ 1.666% (100 / 60)
// 4 Grids ≈ 6.67% shift towards center of service box
const SHIFT_4_GRIDS = 6.67;

export const PRESET_LAYOUTS = {
  // SINGLES
  SINGLES_SERVE_RIGHT: [
    { label: 'P1', color: PlayerColor.RED, position: { x: 55, y: 75 }, withShuttle: true }, // Server (Right)
    // Receiver (Left box): Standard T pos ~45. Shift 8 grids left total ~31.66
    { label: 'P2', color: PlayerColor.BLUE, position: { x: 45 - (SHIFT_4_GRIDS * 2), y: 25 } }, 
  ],
  SINGLES_SERVE_LEFT: [
    { label: 'P1', color: PlayerColor.RED, position: { x: 45, y: 75 }, withShuttle: true }, // Server (Left)
    // Receiver (Right box): Standard T pos ~55. Shift 8 grids right total ~68.33
    { label: 'P2', color: PlayerColor.BLUE, position: { x: 55 + (SHIFT_4_GRIDS * 2), y: 25 } }, 
  ],
  SINGLES_RECV_RIGHT: [
    // Opponent Server (Left box from top)
    { label: 'P2', color: PlayerColor.BLUE, position: { x: 45, y: 25 }, withShuttle: true }, 
    // User Receiver P1 (Right box from bottom). Shift 8 grids right total
    { label: 'P1', color: PlayerColor.RED, position: { x: 55 + (SHIFT_4_GRIDS * 2), y: 75 } }, 
  ],
  SINGLES_RECV_LEFT: [
    // Opponent Server (Right box from top)
    { label: 'P2', color: PlayerColor.BLUE, position: { x: 55, y: 25 }, withShuttle: true },
    // User Receiver P1 (Left box from bottom). Shift 8 grids left total
    { label: 'P1', color: PlayerColor.RED, position: { x: 45 - (SHIFT_4_GRIDS * 2), y: 75 } },
  ],

  // DOUBLES
  MD_SERVE_ODD: [ // Bottom Left Serving
    { label: 'P1', color: PlayerColor.RED, position: { x: 42, y: 68 }, withShuttle: true },    // Server (Near T, Left)
    { label: 'P2', color: PlayerColor.BLUE, position: { x: 53.5, y: 80 } },   // Partner (Shifted Right, Moved Up)
    { label: 'P3', color: PlayerColor.YELLOW, position: { x: 72, y: 32 } }, // Receiver (Centered in Top Right Box)
    { label: 'P4', color: PlayerColor.ORANGE, position: { x: 46.5, y: 20 } }, // Partner (Shifted Left, Moved Down)
  ],
  MD_SERVE_EVEN: [ // Bottom Right Serving (Mirror)
    { label: 'P1', color: PlayerColor.RED, position: { x: 58, y: 68 }, withShuttle: true },    // Server (Near T, Right)
    { label: 'P2', color: PlayerColor.BLUE, position: { x: 46.5, y: 80 } },   // Partner (Shifted Left, Moved Up)
    { label: 'P3', color: PlayerColor.YELLOW, position: { x: 28, y: 32 } }, // Receiver (Centered in Top Left Box)
    { label: 'P4', color: PlayerColor.ORANGE, position: { x: 53.5, y: 20 } }, // Partner (Shifted Right, Moved Down)
  ],
  MD_RECV_ODD: [ // Bottom Left Receiving (Opponent Serves from Top Right)
    { label: 'P1', color: PlayerColor.RED, position: { x: 28, y: 68 } },    // Receiver (Centered in Bottom Left Box)
    { label: 'P2', color: PlayerColor.BLUE, position: { x: 53.5, y: 80 } },   // Partner (Back Right - Mirror of P4 in Serve Odd)
    { label: 'P3', color: PlayerColor.YELLOW, position: { x: 58, y: 32 }, withShuttle: true }, // Server (Top Right - Mirror of P1 in Serve Odd)
    { label: 'P4', color: PlayerColor.ORANGE, position: { x: 46.5, y: 20 } }, // Partner (Top Left - Mirror of P2 in Serve Odd)
  ],
  MD_RECV_EVEN: [ // Bottom Right Receiving (Opponent Serves from Top Left)
    { label: 'P1', color: PlayerColor.RED, position: { x: 72, y: 68 } },    // Receiver (Centered in Bottom Right Box)
    { label: 'P2', color: PlayerColor.BLUE, position: { x: 46.5, y: 80 } },   // Partner (Back Left - Mirror of P4 in Serve Even)
    { label: 'P3', color: PlayerColor.YELLOW, position: { x: 42, y: 32 }, withShuttle: true }, // Server (Top Left - Mirror of P1 in Serve Even)
    { label: 'P4', color: PlayerColor.ORANGE, position: { x: 53.5, y: 20 } }, // Partner (Top Right - Mirror of P2 in Serve Even)
  ],
};
