
export enum ItemType {
  PLAYER = 'PLAYER',
  MARKER = 'MARKER',
  SHUTTLE = 'SHUTTLE'
}

export enum PlayerColor {
  RED = 'bg-red-600',
  BLUE = 'bg-blue-600',
  YELLOW = 'bg-yellow-400',
  ORANGE = 'bg-orange-500'
}

export enum LineType {
  SOLID = 'solid',
  DASHED = 'dashed'
}

export interface Position {
  x: number;
  y: number;
}

export interface CourtItem {
  id: string;
  type: ItemType;
  position: Position; // Percentage relative to court container (0-100)
  color?: string;
  label?: string;
}

export interface LineItem {
  id: string;
  start: Position;
  end: Position;
  label: string;
  color: string;
  type: LineType;
}

export interface PlayerPath {
  id: string;
  sourceId: string; // The ID of the source (Player or another Path)
  sourceType: 'PLAYER' | 'PATH';
  endPosition: Position; // The end of the path
}

export interface Note {
  id: string;
  text: string;
  completed: boolean;
}

export interface User {
  email: string;
  name?: string;
}
