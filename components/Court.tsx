
import React, { useRef, useState, useEffect, useMemo, forwardRef, useImperativeHandle, useLayoutEffect } from 'react';
import { CourtItem, ItemType, LineItem, LineType, PlayerPath, Position } from '../types';
import { LINE_COLORS } from '../constants';

interface CourtProps {
  items: CourtItem[];
  lines: LineItem[];
  paths?: PlayerPath[]; 
  onDropItem: (type: ItemType, xPercent: number, yPercent: number) => void;
  onMoveItem: (id: string, xPercent: number, yPercent: number) => void;
  onMoveItems?: (updates: {id: string, x: number, y: number}[]) => void;
  onDeleteItem: (id: string) => void;
  onCreateLine: (start: {x: number, y: number}, end: {x: number, y: number}) => void;
  onUpdateLine: (id: string, updates: Partial<LineItem>) => void;
  onDeleteLine: (id: string) => void;
  onUpdateItem: (id: string, updates: Partial<CourtItem>) => void;
  onCreatePath?: (sourceId: string, sourceType: 'PLAYER' | 'PATH', endPosition: {x: number, y: number}) => void;
  onUpdatePath?: (id: string, endPosition: {x: number, y: number}) => void;
  onDeletePath?: (id: string) => void;
  activeLineColor: string;
  activeLineType: LineType;
  isLocked: boolean;
}

type InteractionMode = 
  | { type: 'IDLE' }
  | { type: 'DRAG_ITEM'; id: string; initialItemPos: Position; initialMousePos: Position }
  | { type: 'DRAW_LINE'; start: {x: number, y: number} }
  | { type: 'MOVE_LINE'; id: string; startRef: {x: number, y: number}; endRef: {x: number, y: number}; mouseRef: {x: number, y: number} }
  | { type: 'RESIZE_LINE_START'; id: string }
  | { type: 'RESIZE_LINE_END'; id: string }
  | { type: 'AWAITING_LONG_PRESS'; id: string; sourceType: 'PLAYER' | 'PATH'; startX: number; startY: number }
  | { type: 'CREATING_PATH'; sourceId: string; sourceType: 'PLAYER' | 'PATH'; currentEnd: {x: number, y: number} }
  | { type: 'DRAG_PATH_END'; pathId: string; initialEndPos: Position; initialMousePos: Position };

// Standard Badminton Court Dimensions (BWF)
const COURT_WIDTH_M = 6.10;
const COURT_LENGTH_M = 13.40;

// Percentage Calculations for exact BWF positioning
const PCT_SINGLES_SIDE = 7.541;
const PCT_DOUBLES_LONG_SVC = 5.672;
const PCT_SHORT_SVC = 35.224;

const GRID_COLS = 60; 
const GRID_SIZE_X = 100 / GRID_COLS; 
const GRID_SIZE_Y = GRID_SIZE_X * (COURT_WIDTH_M / COURT_LENGTH_M); 

const GHOST_SPACING = 11.25; 

const getColorClass = (bgClass?: string) => {
    return bgClass?.replace('bg-', 'text-') || 'text-blue-600';
};

const getHexColor = (bgClass?: string) => {
    if (bgClass?.includes('red')) return '#ef4444';
    if (bgClass?.includes('blue')) return '#3b82f6';
    if (bgClass?.includes('yellow')) return '#facc15';
    if (bgClass?.includes('orange')) return '#f97316';
    return '#2563eb';
};

// Returns pixel width for line stroke based on court width
const getLineStrokeWidth = (start: Position, end: Position, courtWidthPx: number): number => {
    const dx = (end.x - start.x) * 0.061;
    const dy = (end.y - start.y) * 0.134; 
    const distMeters = Math.sqrt(dx*dx + dy*dy);
    const maxDist = 14; 
    const normalizedDist = Math.min(distMeters / maxDist, 1);
    const intensity = Math.pow(normalizedDist, 0.8);
    
    // Base width related to court width (e.g., 0.4% to 1.2% of court width)
    const minPct = 0.004; 
    const maxPct = 0.012;
    const pct = minPct + (intensity * (maxPct - minPct));
    
    return Math.max(1, courtWidthPx * pct);
};

const EditableLabel = ({ value, onChange, className, style, disabled }: { value: string, onChange: (val: string) => void, className?: string, style?: React.CSSProperties, disabled?: boolean }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [tempValue, setTempValue] = useState(value);
    const inputRef = useRef<HTMLInputElement>(null);
  
    useEffect(() => { setTempValue(value); }, [value]);
  
    useEffect(() => {
      if (isEditing && inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
      }
    }, [isEditing]);
  
    const handleBlur = () => {
        setIsEditing(false);
        if (tempValue !== value) onChange(tempValue);
    };
  
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleBlur();
        }
    };
  
    // Removed flex, using inline-block for better text alignment/wrapping support in screenshots
    const baseClasses = `font-bold font-display text-center m-0 border-0 outline-none appearance-none`;
    
    const commonStyle = {
        ...style,
        pointerEvents: 'auto' as const,
        minWidth: '1.5em',
        display: 'inline-block',
        padding: '1px 4px', // Tight padding
        borderRadius: '4px',
        lineHeight: '1.2', 
        boxSizing: 'border-box' as const,
        verticalAlign: 'middle',
    };

    if (isEditing && !disabled) {
        return (
            <input
              ref={inputRef}
              value={tempValue}
              onChange={e => setTempValue(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              className={`${baseClasses} bg-transparent text-white ${className}`}
              style={{
                  ...commonStyle,
                  width: `${Math.max(2, tempValue.length + 1)}ch`,
              }}
              onClick={e => e.stopPropagation()} 
              onDoubleClick={e => e.stopPropagation()}
              onMouseDown={e => e.stopPropagation()}
            />
        );
    }
  
    return (
        <span 
          onClick={(e) => { 
              if (!disabled) {
                  e.stopPropagation(); 
                  setIsEditing(true); 
              }
          }}
          className={`${baseClasses} transition-all border border-transparent ${!disabled ? 'cursor-text hover:bg-black/20' : 'cursor-default'} ${className}`}
          style={{
              ...commonStyle,
              whiteSpace: 'nowrap'
          }}
        >
            {value}
        </span>
    );
};

export const Court = forwardRef<HTMLDivElement, CourtProps>(({ 
    items, 
    lines,
    paths = [],
    onDropItem, 
    onMoveItem, 
    onMoveItems,
    onDeleteItem,
    onCreateLine,
    onUpdateLine,
    onDeleteLine,
    onUpdateItem,
    onCreatePath,
    onUpdatePath,
    onDeletePath,
    activeLineColor,
    activeLineType,
    isLocked,
}, ref) => {
  // Internal ref for the play area (grid)
  const internalRef = useRef<HTMLDivElement>(null);
  // Wrapper ref for screenshot (includes stands)
  const wrapperRef = useRef<HTMLDivElement>(null);
  
  // Expose the wrapper ref to the parent for screenshots
  useImperativeHandle(ref, () => wrapperRef.current!);

  const [interaction, setInteraction] = useState<InteractionMode>({ type: 'IDLE' });
  const [drawingLine, setDrawingLine] = useState<{start: {x: number, y: number}, end: {x: number, y: number}} | null>(null);
  const [courtWidth, setCourtWidth] = useState(0);

  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const attachedShuttlesRef = useRef<{id: string, initialPos: Position}[]>([]);

  // Measure court width for dynamic sizing
  useLayoutEffect(() => {
      const updateWidth = () => {
          if (internalRef.current) {
              setCourtWidth(internalRef.current.getBoundingClientRect().width);
          }
      };
      
      const observer = new ResizeObserver(updateWidth);
      if (internalRef.current) {
          updateWidth(); // Initial
          observer.observe(internalRef.current);
      }
      return () => observer.disconnect();
  }, []);

  // Dynamic Sizing based on court width
  // Base scaling factor: 400px wide court -> 1.0
  const scale = courtWidth > 0 ? courtWidth / 400 : 1;

  const itemSizePx = Math.max(24, 40 * scale);
  const shuttleSizePx = Math.max(14, 22 * scale);
  const markerSizePx = Math.max(14, 23 * scale);
  const ghostSizePx = Math.max(24, 40 * scale);
  
  const markerFontSizePx = Math.max(8, 10 * scale);
  const labelFontSizePx = Math.max(10, 12 * scale);
  const lineHandleSizePx = Math.max(12, 20 * scale);

  const pathMetadata = useMemo(() => {
    const meta: Record<string, { depth: number, rootPlayerId: string }> = {};
    const resolvePath = (path: PlayerPath, depth: number, rootId: string) => {
        meta[path.id] = { depth, rootPlayerId: rootId };
        const children = paths.filter(p => p.sourceId === path.id && p.sourceType === 'PATH');
        children.forEach(child => resolvePath(child, depth + 1, rootId));
    };
    const rootPaths = paths.filter(p => p.sourceType === 'PLAYER');
    rootPaths.forEach(p => resolvePath(p, 1, p.sourceId));
    return meta;
  }, [paths]);

  const getPercentagePos = (e: MouseEvent | React.MouseEvent) => {
      if (!internalRef.current) return { x: 0, y: 0 };
      const rect = internalRef.current.getBoundingClientRect();
      let x = ((e.clientX - rect.left) / rect.width) * 100;
      let y = ((e.clientY - rect.top) / rect.height) * 100;
      return {
          x: Math.max(0, Math.min(100, x)),
          y: Math.max(0, Math.min(100, y))
      };
  };

  const snapToGrid = (val: number, isY: boolean = false) => {
      const size = isY ? GRID_SIZE_Y : GRID_SIZE_X;
      return Math.round(val / size) * size;
  };

  // Check if position is near a player's hand and return snap coordinates
  const getSnapPosition = (x: number, y: number) => {
    // Default grid snap
    let finalX = snapToGrid(x, false);
    let finalY = snapToGrid(y, true);
    
    const SNAP_RADIUS = 5; // % of court proximity to trigger snap
    const HAND_OFFSET_X = 4; // distance from center to hand
    const HAND_OFFSET_Y = -1.5; // slightly up to visually sit on the icon's hands

    let minDist = SNAP_RADIUS;
    let foundSnap = false;

    // Check Players
    items.forEach(item => {
        if (item.type === ItemType.PLAYER) {
            // Left Hand Target
            const lhX = item.position.x - HAND_OFFSET_X;
            const lhY = item.position.y + HAND_OFFSET_Y;
            const distL = Math.sqrt(Math.pow(lhX - x, 2) + Math.pow(lhY - y, 2));

            if (distL < minDist) {
                minDist = distL;
                finalX = lhX;
                finalY = lhY;
                foundSnap = true;
            }

            // Right Hand Target
            const rhX = item.position.x + HAND_OFFSET_X;
            const rhY = item.position.y + HAND_OFFSET_Y;
            const distR = Math.sqrt(Math.pow(rhX - x, 2) + Math.pow(rhY - y, 2));

            if (distR < minDist) {
                minDist = distR;
                finalX = rhX;
                finalY = rhY;
                foundSnap = true;
            }
        }
    });

    // Check Ghost Players (Path Ends)
    paths.forEach(path => {
        // Snapping allowed only for leaf paths (last ghost player in chain)
        const isParent = paths.some(p => p.sourceId === path.id);
        if (isParent) return;

        // Left Hand Target (Ghost)
        const lhX = path.endPosition.x - HAND_OFFSET_X;
        const lhY = path.endPosition.y + HAND_OFFSET_Y;
        const distL = Math.sqrt(Math.pow(lhX - x, 2) + Math.pow(lhY - y, 2));

        if (distL < minDist) {
            minDist = distL;
            finalX = lhX;
            finalY = lhY;
            foundSnap = true;
        }

        // Right Hand Target (Ghost)
        const rhX = path.endPosition.x + HAND_OFFSET_X;
        const rhY = path.endPosition.y + HAND_OFFSET_Y;
        const distR = Math.sqrt(Math.pow(rhX - x, 2) + Math.pow(rhY - y, 2));

        if (distR < minDist) {
            minDist = distR;
            finalX = rhX;
            finalY = rhY;
            foundSnap = true;
        }
    });

    return { x: finalX, y: finalY };
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isLocked) {
        e.dataTransfer.dropEffect = 'copy';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (isLocked) return;
    const data = e.dataTransfer.getData('application/react-dnd-type');
    const type = data as ItemType;
    if (type) {
      const pos = getPercentagePos(e);
      let finalX = snapToGrid(pos.x, false);
      let finalY = snapToGrid(pos.y, true);

      // Snap logic for Shuttles dropping onto Players
      if (type === ItemType.SHUTTLE) {
          const snap = getSnapPosition(pos.x, pos.y);
          finalX = snap.x;
          finalY = snap.y;
      }

      onDropItem(type, finalX, finalY);
    }
  };

  const handleItemMouseDown = (e: React.MouseEvent, id: string, type: ItemType) => {
    if (isLocked) return;
    e.stopPropagation(); 
    
    const item = items.find(i => i.id === id);
    if (!item) return;

    const initialMousePos = { x: e.clientX, y: e.clientY };
    const initialItemPos = { ...item.position };

    // Reset attached shuttles
    attachedShuttlesRef.current = [];

    if (type === ItemType.PLAYER) {
        const pos = getPercentagePos(e);
        longPressTimerRef.current = setTimeout(() => {
            setInteraction({ type: 'CREATING_PATH', sourceId: id, sourceType: 'PLAYER', currentEnd: pos });
        }, 1000); 
        setInteraction({ type: 'AWAITING_LONG_PRESS', id, sourceType: 'PLAYER', startX: e.clientX, startY: e.clientY });

        // Find attached shuttles to move together
        // We define "attached" as being very close to the snap positions of this player
        const HAND_OFFSET_X = 4;
        const HAND_OFFSET_Y = -1.5;
        const ATTACH_THRESHOLD = 1; // Strict threshold for attachment

        const lhX = item.position.x - HAND_OFFSET_X;
        const lhY = item.position.y + HAND_OFFSET_Y;
        const rhX = item.position.x + HAND_OFFSET_X;
        const rhY = item.position.y + HAND_OFFSET_Y;

        items.forEach(otherItem => {
            if (otherItem.type === ItemType.SHUTTLE) {
                const distL = Math.sqrt(Math.pow(lhX - otherItem.position.x, 2) + Math.pow(lhY - otherItem.position.y, 2));
                const distR = Math.sqrt(Math.pow(rhX - otherItem.position.x, 2) + Math.pow(rhY - otherItem.position.y, 2));
                
                if (distL < ATTACH_THRESHOLD || distR < ATTACH_THRESHOLD) {
                    attachedShuttlesRef.current.push({
                        id: otherItem.id,
                        initialPos: { ...otherItem.position }
                    });
                }
            }
        });

    } else {
        setInteraction({ type: 'DRAG_ITEM', id, initialItemPos, initialMousePos });
    }
  };

  const handlePathEndMouseDown = (e: React.MouseEvent, pathId: string) => {
      if (isLocked) return;
      e.stopPropagation();
      const pos = getPercentagePos(e);
      const path = paths.find(p => p.id === pathId);
      if (!path) return;
      
      const initialMousePos = { x: e.clientX, y: e.clientY };
      const initialEndPos = { ...path.endPosition };

      // Find attached shuttles for Ghost Player
      attachedShuttlesRef.current = [];
      const HAND_OFFSET_X = 4;
      const HAND_OFFSET_Y = -1.5;
      const ATTACH_THRESHOLD = 1;

      const lhX = path.endPosition.x - HAND_OFFSET_X;
      const lhY = path.endPosition.y + HAND_OFFSET_Y;
      const rhX = path.endPosition.x + HAND_OFFSET_X;
      const rhY = path.endPosition.y + HAND_OFFSET_Y;

      items.forEach(otherItem => {
          if (otherItem.type === ItemType.SHUTTLE) {
              const distL = Math.sqrt(Math.pow(lhX - otherItem.position.x, 2) + Math.pow(lhY - otherItem.position.y, 2));
              const distR = Math.sqrt(Math.pow(rhX - otherItem.position.x, 2) + Math.pow(rhY - otherItem.position.y, 2));

              if (distL < ATTACH_THRESHOLD || distR < ATTACH_THRESHOLD) {
                  attachedShuttlesRef.current.push({
                      id: otherItem.id,
                      initialPos: { ...otherItem.position }
                  });
              }
          }
      });

      longPressTimerRef.current = setTimeout(() => {
        setInteraction({ type: 'CREATING_PATH', sourceId: pathId, sourceType: 'PATH', currentEnd: pos });
      }, 1000); 

      setInteraction({ type: 'AWAITING_LONG_PRESS', id: pathId, sourceType: 'PATH', startX: e.clientX, startY: e.clientY });
  };

  const handleLineBodyMouseDown = (e: React.MouseEvent, line: LineItem) => {
    if (isLocked) return;
    e.stopPropagation();
    const pos = getPercentagePos(e);
    setInteraction({ 
        type: 'MOVE_LINE', 
        id: line.id, 
        startRef: { ...line.start }, 
        endRef: { ...line.end },
        mouseRef: pos
    });
  };

  const handleLineHandleMouseDown = (e: React.MouseEvent, id: string, handle: 'start' | 'end') => {
      if (isLocked) return;
      e.stopPropagation();
      setInteraction({ type: handle === 'start' ? 'RESIZE_LINE_START' : 'RESIZE_LINE_END', id });
  };

  const handleBackgroundMouseDown = (e: React.MouseEvent) => {
      if (isLocked) return;
      const pos = getPercentagePos(e);
      setInteraction({ type: 'DRAW_LINE', start: pos });
      setDrawingLine({ start: pos, end: pos });
  };

  const getGhostPositions = (start: {x: number, y: number}, end: {x: number, y: number}) => {
      const dx = end.x - start.x;
      const dy = end.y - start.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      const count = Math.floor(dist / GHOST_SPACING);
      const ghosts = [];
      for (let i = 1; i <= count; i++) {
          const ratio = i / (count + 1);
          ghosts.push({ x: start.x + dx * ratio, y: start.y + dy * ratio });
      }
      return ghosts;
  };

  const resolvePosition = (sourceId: string, sourceType: 'PLAYER' | 'PATH'): Position | null => {
      if (sourceType === 'PLAYER') {
          return items.find(i => i.id === sourceId)?.position || null;
      } else {
          return paths.find(p => p.id === sourceId)?.endPosition || null;
      }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
        if (!internalRef.current || isLocked) return;
        const pos = getPercentagePos(e);

        if (interaction.type !== 'IDLE') {
             e.preventDefault(); 
        }

        if (interaction.type === 'AWAITING_LONG_PRESS') {
             const dist = Math.sqrt(Math.pow(e.clientX - interaction.startX, 2) + Math.pow(e.clientY - interaction.startY, 2));
             if (dist > 10) {
                 if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
                 if (interaction.sourceType === 'PATH') {
                    const path = paths.find(p => p.id === interaction.id);
                    if (path) {
                        setInteraction({ 
                            type: 'DRAG_PATH_END', 
                            pathId: interaction.id, 
                            initialEndPos: path.endPosition,
                            initialMousePos: { x: interaction.startX, y: interaction.startY }
                        });
                    }
                 } else {
                    const item = items.find(i => i.id === interaction.id);
                    if (item) {
                        setInteraction({ 
                            type: 'DRAG_ITEM', 
                            id: interaction.id,
                            initialItemPos: item.position,
                            initialMousePos: { x: interaction.startX, y: interaction.startY }
                        });
                    }
                 }
             }
             return;
        }

        if (interaction.type === 'CREATING_PATH') {
            setInteraction(prev => ({ ...prev, currentEnd: pos } as InteractionMode));
        }
        else if (interaction.type === 'DRAG_PATH_END') {
            const rect = internalRef.current.getBoundingClientRect();
            const deltaX = (e.clientX - interaction.initialMousePos.x) / rect.width * 100;
            const deltaY = (e.clientY - interaction.initialMousePos.y) / rect.height * 100;
            const newPos = {
                x: snapToGrid(interaction.initialEndPos.x + deltaX, false),
                y: snapToGrid(interaction.initialEndPos.y + deltaY, true)
            };
            if (onUpdatePath) onUpdatePath(interaction.pathId, newPos);

            // Update attached shuttles
            if (attachedShuttlesRef.current.length > 0 && onMoveItems) {
                 const actualDeltaX = newPos.x - interaction.initialEndPos.x;
                 const actualDeltaY = newPos.y - interaction.initialEndPos.y;
                 const updates = attachedShuttlesRef.current.map(att => ({
                     id: att.id,
                     x: att.initialPos.x + actualDeltaX,
                     y: att.initialPos.y + actualDeltaY
                 }));
                 onMoveItems(updates);
            }
        }
        else if (interaction.type === 'DRAG_ITEM') {
            const rect = internalRef.current.getBoundingClientRect();
            const deltaX = (e.clientX - interaction.initialMousePos.x) / rect.width * 100;
            const deltaY = (e.clientY - interaction.initialMousePos.y) / rect.height * 100;
            
            // Calculate raw target position without snapping yet
            const rawX = interaction.initialItemPos.x + deltaX;
            const rawY = interaction.initialItemPos.y + deltaY;

            let finalX = snapToGrid(rawX, false);
            let finalY = snapToGrid(rawY, true);

            const item = items.find(i => i.id === interaction.id);

            // Handle moving connected items if player is moved
            if (item && item.type === ItemType.PLAYER && attachedShuttlesRef.current.length > 0 && onMoveItems) {
                 const updates = [];
                 
                 // Update the main player
                 updates.push({ id: interaction.id, x: finalX, y: finalY });
                 
                 // Calculate the ACTUAL delta applied to the player after snapping
                 const actualDeltaX = finalX - interaction.initialItemPos.x;
                 const actualDeltaY = finalY - interaction.initialItemPos.y;

                 // Update all attached shuttles by the same delta
                 attachedShuttlesRef.current.forEach(att => {
                     updates.push({
                         id: att.id,
                         x: att.initialPos.x + actualDeltaX,
                         y: att.initialPos.y + actualDeltaY
                     });
                 });
                 
                 onMoveItems(updates);
            } else {
                 // Standard single item move
                 // Check if dragging a shuttle, check for player hand snaps
                if (item && item.type === ItemType.SHUTTLE) {
                    const snap = getSnapPosition(rawX, rawY);
                    finalX = snap.x;
                    finalY = snap.y;
                }
                onMoveItem(interaction.id, finalX, finalY);
            }
        } 
        else if (interaction.type === 'DRAW_LINE') {
            setDrawingLine({ start: interaction.start, end: pos });
        }
        else if (interaction.type === 'MOVE_LINE') {
            const dx = pos.x - interaction.mouseRef.x;
            const dy = pos.y - interaction.mouseRef.y;
            onUpdateLine(interaction.id, {
                start: { x: interaction.startRef.x + dx, y: interaction.startRef.y + dy },
                end: { x: interaction.endRef.x + dx, y: interaction.endRef.y + dy }
            });
        }
        else if (interaction.type === 'RESIZE_LINE_START') {
            onUpdateLine(interaction.id, { start: pos });
        }
        else if (interaction.type === 'RESIZE_LINE_END') {
            onUpdateLine(interaction.id, { end: pos });
        }
    };

    const handleMouseUp = (e: MouseEvent) => {
        if (isLocked) {
             setInteraction({ type: 'IDLE' });
             setDrawingLine(null);
             return;
        }

        if (longPressTimerRef.current) {
            clearTimeout(longPressTimerRef.current);
            longPressTimerRef.current = null;
        }
        
        // Clear attached items
        attachedShuttlesRef.current = [];

        if (interaction.type === 'DRAG_ITEM' || interaction.type === 'MOVE_LINE') {
            const trashBin = document.getElementById('trash-bin-zone');
            if (trashBin) {
                const rect = trashBin.getBoundingClientRect();
                if (
                    e.clientX >= rect.left && e.clientX <= rect.right && 
                    e.clientY >= rect.top && e.clientY <= rect.bottom
                ) {
                    if (interaction.type === 'DRAG_ITEM') onDeleteItem(interaction.id);
                    if (interaction.type === 'MOVE_LINE') onDeleteLine(interaction.id);
                }
            }
        }
        
        if (interaction.type === 'DRAG_PATH_END') {
             const trashBin = document.getElementById('trash-bin-zone');
             if (trashBin && onDeletePath) {
                 const rect = trashBin.getBoundingClientRect();
                 if (
                     e.clientX >= rect.left && e.clientX <= rect.right && 
                     e.clientY >= rect.top && e.clientY <= rect.bottom
                 ) {
                     onDeletePath(interaction.pathId);
                 }
             }
        }

        if (interaction.type === 'DRAW_LINE' && drawingLine) {
            const dx = drawingLine.start.x - drawingLine.end.x;
            const dy = drawingLine.start.y - drawingLine.end.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist > 1) onCreateLine(drawingLine.start, drawingLine.end);
        }

        if (interaction.type === 'CREATING_PATH' && onCreatePath) {
             onCreatePath(interaction.sourceId, interaction.sourceType, interaction.currentEnd);
        }

        setInteraction({ type: 'IDLE' });
        setDrawingLine(null);
    };

    if (interaction.type !== 'IDLE') {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [interaction, drawingLine, onMoveItem, onMoveItems, onDeleteItem, onCreateLine, onUpdateLine, onDeleteLine, onCreatePath, onUpdatePath, onDeletePath, isLocked, items, paths]);


  return (
    <div className="flex-1 relative flex items-center justify-center p-2 overflow-hidden bg-[#0d120f] transition-all duration-500 w-full h-full">
        {/* Wrapper for capturing Screenshot (Includes Stands) */}
        <div 
            ref={wrapperRef}
            className="relative flex items-center justify-center bg-court-green shadow-2xl @container"
            style={{ 
                // Aspect Ratio including Stands
                aspectRatio: '7.564/14.74',
                height: '95%',
                maxHeight: '95%',
                maxWidth: '90%',
                // Padding simulates the stands area
                padding: '4.55% 9.68%'
            }}
        >
            <div 
                ref={internalRef}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onMouseDown={handleBackgroundMouseDown}
                className={`relative w-full h-full z-10 court-lines select-none touch-none transition-all duration-500 origin-center ${isLocked ? 'cursor-default' : ''}`}
            >
                <div 
                    className="absolute inset-0 pointer-events-none z-0 bg-court-green" 
                    style={{
                        backgroundImage: `
                            linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), 
                            linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)
                        `,
                        backgroundSize: `${GRID_SIZE_X}% ${GRID_SIZE_Y}%`
                    }}
                ></div>

                <div className="absolute top-0 left-0 right-0 h-[3px] bg-white/90 z-20 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/90 z-20 pointer-events-none"></div>
                <div className="absolute top-0 bottom-0 left-0 w-[3px] bg-white/90 z-20 pointer-events-none"></div>
                <div className="absolute top-0 bottom-0 right-0 w-[3px] bg-white/90 z-20 pointer-events-none"></div>
                <div className="absolute top-0 bottom-0 w-[3px] bg-white/90 z-0 pointer-events-none" style={{ left: `${PCT_SINGLES_SIDE}%` }}></div>
                <div className="absolute top-0 bottom-0 w-[3px] bg-white/90 z-0 pointer-events-none" style={{ right: `${PCT_SINGLES_SIDE}%` }}></div>
                <div className="absolute left-0 right-0 h-[3px] bg-white/90 z-0 pointer-events-none" style={{ top: `${PCT_DOUBLES_LONG_SVC}%` }}></div>
                <div className="absolute left-0 right-0 h-[3px] bg-white/90 z-0 pointer-events-none" style={{ bottom: `${PCT_DOUBLES_LONG_SVC}%` }}></div>
                <div className="absolute left-0 right-0 h-[3px] bg-white/90 z-0 pointer-events-none" style={{ top: `${PCT_SHORT_SVC}%` }}></div>
                <div className="absolute left-0 right-0 h-[3px] bg-white/90 z-0 pointer-events-none" style={{ bottom: `${PCT_SHORT_SVC}%` }}></div>
                <div className="absolute w-[3px] bg-white/90 left-1/2 -translate-x-1/2 z-0 pointer-events-none" style={{ top: 0, height: `${PCT_SHORT_SVC}%` }}></div>
                <div className="absolute w-[3px] bg-white/90 left-1/2 -translate-x-1/2 z-0 pointer-events-none" style={{ bottom: 0, height: `${PCT_SHORT_SVC}%` }}></div>
                
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full z-40 shadow-sm -translate-x-1/2"></div>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full z-40 shadow-sm translate-x-1/2"></div>
                
                {/* NET VISUALIZATION: Lowered Z-Index to allow lines to be drawn on top */}
                <div className="absolute left-0 right-0 top-1/2 flex items-center justify-between z-15 pointer-events-none -translate-y-1/2">
                    <div className="absolute right-[100%] flex items-center justify-end h-8 md:h-10 w-[12%]">
                        <div className="w-[80%] h-full bg-[#003366] rounded-sm shadow-xl relative z-10 flex items-center justify-center border-t border-blue-400/20">
                            <div className="w-1/2 h-1 bg-white/20 rounded-full"></div>
                        </div>
                        <div className="w-[20%] h-2 bg-[#004e8a] relative z-10"></div>
                    </div>
                    <div className="w-full h-[6px] bg-white/95 shadow-sm relative z-30"
                        style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)' }}
                    ></div>
                    <div className="absolute left-[100%] flex items-center justify-start h-8 md:h-10 w-[12%]">
                        <div className="w-[20%] h-2 bg-[#004e8a] relative z-10"></div>
                        <div className="w-[80%] h-full bg-[#003366] rounded-sm shadow-xl relative z-10 flex items-center justify-center border-t border-blue-400/20">
                            <div className="w-1/2 h-1 bg-white/20 rounded-full"></div>
                        </div>
                    </div>
                </div>

                {/* SVG Layer: Raised Z-Index to appear ABOVE the Net (z-20 vs Net's z-15) */}
                <svg className="absolute inset-0 w-full h-full z-20 overflow-visible pointer-events-none">
                    <defs>
                        {LINE_COLORS.map(color => (
                            <marker key={color} id={`arrowhead-${color}`} markerHeight="4" markerWidth="6" orient="auto" refX="5" refY="2">
                                <polygon fill={color} points="0 0, 6 2, 0 4"></polygon>
                            </marker>
                        ))}
                    </defs>
                    
                    {paths.map(path => {
                        const startPos = resolvePosition(path.sourceId, path.sourceType);
                        if (!startPos) return null;
                        const meta = pathMetadata[path.id];
                        const player = items.find(i => i.id === meta?.rootPlayerId);
                        const strokeColor = player ? getHexColor(player.color) : '#4b5563';

                        return (
                            <g key={path.id}>
                                <line 
                                    x1={`${startPos.x}%`} y1={`${startPos.y}%`} 
                                    x2={`${path.endPosition.x}%`} y2={`${path.endPosition.y}%`}
                                    stroke={strokeColor} 
                                    strokeWidth={3 * scale}
                                    strokeDasharray={`${6 * scale}, ${6 * scale}`}
                                    markerEnd={`url(#arrowhead-${strokeColor})`}
                                    opacity="0.9"
                                />
                            </g>
                        );
                    })}

                    {interaction.type === 'CREATING_PATH' && (() => {
                        const startPos = resolvePosition(interaction.sourceId, interaction.sourceType);
                        if (!startPos) return null;
                        let strokeColor = '#ffffff';
                        if (interaction.sourceType === 'PLAYER') {
                            const player = items.find(i => i.id === interaction.sourceId);
                            if (player) strokeColor = getHexColor(player.color);
                        } else {
                            const meta = pathMetadata[interaction.sourceId];
                            const player = items.find(i => i.id === meta?.rootPlayerId);
                            if (player) strokeColor = getHexColor(player.color);
                        }

                        return (
                            <g>
                                <line 
                                    x1={`${startPos.x}%`} y1={`${startPos.y}%`} 
                                    x2={`${interaction.currentEnd.x}%`} y2={`${interaction.currentEnd.y}%`}
                                    stroke={strokeColor} 
                                    strokeWidth={3 * scale}
                                    strokeDasharray={`${6 * scale}, ${6 * scale}`}
                                    markerEnd={`url(#arrowhead-${strokeColor})`}
                                    opacity="0.9"
                                />
                            </g>
                        );
                    })()}

                    {lines.map(line => {
                        const strokeColor = line.color || '#4b5563';
                        const dashArray = line.type === LineType.DASHED ? `${12 * scale}, ${12 * scale}` : "none";
                        const strokeWidth = getLineStrokeWidth(line.start, line.end, courtWidth);
                        return (
                            <g key={line.id} className={!isLocked ? "pointer-events-auto" : "pointer-events-none"}>
                                <line 
                                    x1={`${line.start.x}%`} y1={`${line.start.y}%`} 
                                    x2={`${line.end.x}%`} y2={`${line.end.y}%`}
                                    stroke={strokeColor} 
                                    strokeWidth={strokeWidth} 
                                    strokeDasharray={dashArray}
                                    strokeLinecap="round"
                                    markerEnd={`url(#arrowhead-${strokeColor})`} 
                                    pointerEvents="none"
                                />
                                <circle cx={`${line.start.x}%`} cy={`${line.start.y}%`} r={6 * scale} fill={strokeColor} pointerEvents="none" />
                                {!isLocked && (
                                    <>
                                        <line 
                                            x1={`${line.start.x}%`} y1={`${line.start.y}%`} 
                                            x2={`${line.end.x}%`} y2={`${line.end.y}%`}
                                            stroke="transparent" strokeWidth={lineHandleSizePx} className="cursor-move"
                                            onMouseDown={(e) => handleLineBodyMouseDown(e, line)}
                                            onDoubleClick={(e) => { e.stopPropagation(); onDeleteLine(line.id); }}
                                        />
                                        <circle cx={`${line.start.x}%`} cy={`${line.start.y}%`} r={12 * scale} fill="transparent" className="cursor-grab active:cursor-grabbing"
                                            onMouseDown={(e) => handleLineHandleMouseDown(e, line.id, 'start')} />
                                        <circle cx={`${line.end.x}%`} cy={`${line.end.y}%`} r={12 * scale} fill="transparent" className="cursor-grab active:cursor-grabbing"
                                            onMouseDown={(e) => handleLineHandleMouseDown(e, line.id, 'end')} />
                                    </>
                                )}
                            </g>
                        );
                    })}

                    {drawingLine && (() => {
                        const strokeWidth = getLineStrokeWidth(drawingLine.start, drawingLine.end, courtWidth);
                        return (
                            <g pointerEvents="none">
                                <line 
                                    x1={`${drawingLine.start.x}%`} y1={`${drawingLine.start.y}%`} 
                                    x2={`${drawingLine.end.x}%`} y2={`${drawingLine.end.y}%`}
                                    stroke={activeLineColor} 
                                    strokeWidth={strokeWidth} 
                                    strokeOpacity="0.8" 
                                    strokeLinecap="round"
                                    strokeDasharray={activeLineType === LineType.DASHED ? `${12 * scale}, ${12 * scale}` : "none"}
                                />
                                <circle cx={`${drawingLine.start.x}%`} cy={`${drawingLine.start.y}%`} r={6 * scale} fill={activeLineColor} opacity="0.5" />
                            </g>
                        );
                    })()}
                </svg>

                {paths.map(path => {
                    const startPos = resolvePosition(path.sourceId, path.sourceType);
                    if (!startPos) return null;
                    const meta = pathMetadata[path.id];
                    const player = items.find(i => i.id === meta?.rootPlayerId);
                    if (!player) return null;
                    const ghosts = getGhostPositions(startPos, path.endPosition);

                    return (
                        <React.Fragment key={path.id}>
                            {ghosts.map((pos, idx) => (
                                <div
                                    key={`ghost-${path.id}-${idx}`}
                                    className="absolute z-20 pointer-events-none flex items-center justify-center opacity-50 transition-transform duration-500"
                                    style={{
                                        left: `${pos.x}%`,
                                        top: `${pos.y}%`,
                                        transform: `translate(-50%, -50%)`,
                                        width: ghostSizePx,
                                        height: ghostSizePx,
                                    }}
                                >
                                    <span 
                                        className={`material-symbols-outlined drop-shadow-sm filter ${getColorClass(player.color)}`}
                                        style={{ fontVariationSettings: "'FILL' 1", fontSize: itemSizePx }}
                                    >
                                        accessibility_new
                                    </span>
                                </div>
                            ))}
                            <div
                                className={`absolute z-30 flex items-center justify-center opacity-90 transition-transform duration-500 ${!isLocked ? 'cursor-move hover:scale-110' : ''} ${interaction.type === 'DRAG_PATH_END' && interaction.pathId === path.id ? 'scale-110 cursor-grabbing' : ''}`}
                                style={{
                                    left: `${path.endPosition.x}%`,
                                    top: `${path.endPosition.y}%`,
                                    transform: `translate(-50%, -50%)`,
                                    width: ghostSizePx,
                                    height: ghostSizePx,
                                }}
                                onMouseDown={(e) => !isLocked && handlePathEndMouseDown(e, path.id)}
                                onDoubleClick={(e) => { if (!isLocked) { e.stopPropagation(); onDeletePath && onDeletePath(path.id); } }}
                            >
                                <div className="relative flex items-center justify-center">
                                    <span 
                                        className={`material-symbols-outlined drop-shadow-xl filter ${getColorClass(player.color)}`}
                                        style={{ fontVariationSettings: "'FILL' 1", fontSize: itemSizePx }}
                                    >
                                        accessibility_new
                                    </span>
                                    <span 
                                        className="absolute text-white font-bold drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] pointer-events-none"
                                        style={{ fontSize: labelFontSizePx * 0.8 }}
                                    >
                                        {meta?.depth}
                                    </span>
                                </div>
                            </div>
                        </React.Fragment>
                    );
                })}

                {interaction.type === 'CREATING_PATH' && (() => {
                    const startPos = resolvePosition(interaction.sourceId, interaction.sourceType);
                    if (!startPos) return null;
                    let colorClass = 'text-white';
                    if (interaction.sourceType === 'PLAYER') {
                        const player = items.find(i => i.id === interaction.sourceId);
                        if (player) colorClass = getColorClass(player.color);
                    } else {
                        const meta = pathMetadata[interaction.sourceId];
                        const player = items.find(i => i.id === meta?.rootPlayerId);
                        if (player) colorClass = getColorClass(player.color);
                    }
                    const ghosts = getGhostPositions(startPos, interaction.currentEnd);
                    return (
                        <>
                            {ghosts.map((pos, idx) => (
                                <div key={`ghost-creating-${idx}`} className="absolute z-20 pointer-events-none flex items-center justify-center opacity-50 transition-transform duration-500"
                                    style={{
                                        left: `${pos.x}%`,
                                        top: `${pos.y}%`,
                                        transform: `translate(-50%, -50%)`,
                                        width: ghostSizePx,
                                        height: ghostSizePx,
                                    }}>
                                    <span className={`material-symbols-outlined drop-shadow-sm filter ${colorClass}`} style={{ fontVariationSettings: "'FILL' 1", fontSize: itemSizePx }}>accessibility_new</span>
                                </div>
                            ))}
                            <div className="absolute z-20 pointer-events-none flex items-center justify-center opacity-80 transition-transform duration-500"
                                style={{
                                    left: `${interaction.currentEnd.x}%`,
                                    top: `${interaction.currentEnd.y}%`,
                                    transform: `translate(-50%, -50%)`,
                                    width: ghostSizePx,
                                    height: ghostSizePx,
                                }}>
                                <span className={`material-symbols-outlined drop-shadow-sm filter ${colorClass}`} style={{ fontVariationSettings: "'FILL' 1", fontSize: itemSizePx }}>accessibility_new</span>
                            </div>
                        </>
                    );
                })()}

                {lines.map(line => {
                    const midX = (line.start.x + line.end.x) / 2;
                    const midY = (line.start.y + line.end.y) / 2;
                    return (
                        <div key={`label-${line.id}`} className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20"
                            style={{ left: `${midX}%`, top: `${midY}%` }}
                            onDoubleClick={(e) => { if (!isLocked) { e.stopPropagation(); onDeleteLine(line.id); } }}>
                            <EditableLabel 
                                value={line.label} 
                                onChange={(val) => onUpdateLine(line.id, { label: val })} 
                                className="text-white font-bold whitespace-nowrap block bg-[#1c2620] border border-gray-600 rounded-md shadow-sm"
                                style={{ fontSize: labelFontSizePx, padding: '2px 4px' }}
                                disabled={isLocked} 
                            />
                        </div>
                    );
                })}

                {items.map(item => {
                    const hasPaths = paths.some(p => p.sourceId === item.id && p.sourceType === 'PLAYER');
                    
                    let content = null;
                    // Markers and Players are z-30, Shuttles are z-40 to appear "in hand" or on top
                    const zIndexClass = item.type === ItemType.SHUTTLE ? 'z-40' : 'z-30';

                    if (item.type === ItemType.PLAYER) {
                        content = (
                            <div className="flex flex-col items-center justify-center h-full w-full relative">
                                <div className="relative flex items-center justify-center">
                                    <span 
                                        className={`material-symbols-outlined filter drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] ${getColorClass(item.color)}`} 
                                        style={{ fontVariationSettings: "'FILL' 1", fontSize: itemSizePx }}
                                    >
                                        accessibility_new
                                    </span>
                                    {hasPaths && ( 
                                        <span 
                                            className="absolute text-white font-bold drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] pointer-events-none"
                                            style={{ fontSize: labelFontSizePx * 0.8 }}
                                        >
                                            0
                                        </span> 
                                    )}
                                </div>
                                {item.label && (
                                    <div style={{ position: 'absolute', top: '100%', marginTop: '4px' }}>
                                        <EditableLabel 
                                            value={item.label} 
                                            onChange={(val) => onUpdateItem(item.id, { label: val })} 
                                            className="bg-black/80 text-white whitespace-nowrap shadow-md font-bold" 
                                            style={{ fontSize: labelFontSizePx }}
                                            disabled={isLocked} 
                                        />
                                    </div>
                                )}
                            </div>
                        );
                    } else if (item.type === ItemType.MARKER) {
                        content = (
                            <div className="relative flex flex-col items-center">
                                <div 
                                    className="rounded-full bg-white flex items-center justify-center shadow-[0_4px_6px_rgba(0,0,0,0.4)] select-none group font-bold text-black border border-gray-300"
                                    style={{ width: markerSizePx, height: markerSizePx, fontSize: markerFontSizePx }}
                                >
                                    {item.label}
                                </div>
                            </div>
                        );
                    } else if (item.type === ItemType.SHUTTLE) {
                        content = (
                            <div className="relative flex flex-col items-center justify-center drop-shadow-lg filter rotate-45" style={{ width: shuttleSizePx, height: shuttleSizePx }}>
                                <svg viewBox="0 0 24 24" className="w-full h-full fill-white">
                                    <path d="M8 19C8 21.2 9.8 23 12 23C14.2 23 16 21.2 16 19H8Z" />
                                    <path d="M16 18L19.5 4L16.5 4L14.5 12L13.5 4L10.5 4L9.5 12L7.5 4L4.5 4L8 18H16Z" />
                                    <path d="M6 10H18" stroke="black" strokeWidth="1" strokeOpacity="0.3" />
                                    <path d="M7 14H17" stroke="black" strokeWidth="1" strokeOpacity="0.3" />
                                </svg>
                            </div>
                        );
                    }

                    return (
                        <div
                            key={item.id}
                            className={`absolute ${zIndexClass} transition-transform duration-500 flex flex-col items-center justify-center 
                                ${!isLocked ? 'cursor-move' : ''} 
                                ${interaction.type === 'DRAG_ITEM' && interaction.id === item.id ? 'scale-110 cursor-grabbing' : (!isLocked ? 'hover:scale-110' : '')}
                            `}
                            style={{
                                left: `${item.position.x}%`,
                                top: `${item.position.y}%`,
                                transform: `translate(-50%, -50%)`, 
                                width: item.type === ItemType.SHUTTLE ? shuttleSizePx : itemSizePx,
                                height: item.type === ItemType.SHUTTLE ? shuttleSizePx : itemSizePx,
                            }}
                            onMouseDown={(e) => handleItemMouseDown(e, item.id, item.type)}
                            onDoubleClick={(e) => { if (!isLocked) { e.stopPropagation(); onDeleteItem(item.id); } }}
                        >
                            {content}
                        </div>
                    );
                })}
            </div>
        </div>
    </div>
  );
});
