
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { SidebarLeft } from './components/SidebarLeft';
import { SidebarRight } from './components/SidebarRight';
import { Court } from './components/Court';
import { Auth } from './components/Auth';
import { FeedbackModal } from './components/FeedbackModal';
import { ConfirmModal } from './components/ConfirmModal';
import { TutorialModal } from './components/TutorialModal';
import { CourtItem, ItemType, LineItem, LineType, Note, PlayerColor, User, PlayerPath } from './types';
import { INITIAL_ITEMS, INITIAL_FOCUS_POINTS, MAX_PLAYERS, MAX_MARKERS, MAX_SHUTTLES, DEFAULT_LINE_COLOR, DEFAULT_LINE_TYPE, PLAYER_ORDER_COLORS, PRESET_LAYOUTS } from './constants';

const generateId = () => Math.random().toString(36).substr(2, 9);

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);

  // State for strategy metadata and locking
  const [strategyName, setStrategyName] = useState('Badminton Tactics');
  const [isLocked, setIsLocked] = useState(false);

  const [items, setItems] = useState<CourtItem[]>(() => {
    return INITIAL_ITEMS.map(item => ({...item, id: generateId()}));
  });
  
  const [lines, setLines] = useState<LineItem[]>([]);
  const [paths, setPaths] = useState<PlayerPath[]>([]);
  
  const [notes, setNotes] = useState<string>('');
  const [focusPoints, setFocusPoints] = useState<Note[]>(INITIAL_FOCUS_POINTS);
  const [draggedType, setDraggedType] = useState<ItemType | null>(null);
  
  // Active Line State
  const [activeLineColor, setActiveLineColor] = useState<string>(DEFAULT_LINE_COLOR);
  const [activeLineType, setActiveLineType] = useState<LineType>(DEFAULT_LINE_TYPE);

  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);
  
  // Right Sidebar (Commentary) State - Default Closed
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
  
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  
  const playerCount = items.filter(i => i.type === ItemType.PLAYER).length;
  const markerCount = items.filter(i => i.type === ItemType.MARKER).length;
  const shuttleCount = items.filter(i => i.type === ItemType.SHUTTLE).length;

  // Calculate the next available marker number for the sidebar
  const nextMarkerLabel = useMemo(() => {
    const existingNumbers = items
      .filter(i => i.type === ItemType.MARKER)
      .map(i => parseInt(i.label || '0', 10))
      .filter(n => !isNaN(n));
    
    // Find lowest missing number starting from 1
    let nextNum = 1;
    while (existingNumbers.includes(nextNum)) {
      nextNum++;
    }
    return String(nextNum);
  }, [items]);

  // Calculate the next available player color
  const nextPlayerColor = useMemo(() => {
    const currentPlayers = items.filter(i => i.type === ItemType.PLAYER);
    const usedSlots = currentPlayers.map(p => parseInt(p.label?.replace('P', '') || '0', 10));
    let nextSlot = 1;
    while (usedSlots.includes(nextSlot)) {
        nextSlot++;
    }
    // Limit to valid range to prevent index error
    const slotIndex = Math.min(Math.max(nextSlot, 1), MAX_PLAYERS) - 1;
    return PLAYER_ORDER_COLORS[slotIndex];
  }, [items]);

  useEffect(() => {
    const storedUser = localStorage.getItem('bsb_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    
    // Check if tutorial should be shown
    const tutorialSeen = localStorage.getItem('bsb_tutorial_seen');
    if (!tutorialSeen && storedUser) {
        setIsTutorialOpen(true);
    }
  }, []);

  const handleLogin = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem('bsb_user', JSON.stringify(newUser));
    
    // Check tutorial on login as well
    const tutorialSeen = localStorage.getItem('bsb_tutorial_seen');
    if (!tutorialSeen) {
        setIsTutorialOpen(true);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('bsb_user');
  };

  const handleDragStart = (e: React.DragEvent, type: ItemType) => {
    if (isLocked) {
      e.preventDefault();
      return;
    }
    if (type === ItemType.PLAYER && playerCount >= MAX_PLAYERS) {
      e.preventDefault();
      return;
    }
    if (type === ItemType.MARKER && markerCount >= MAX_MARKERS) {
      e.preventDefault();
      return;
    }
    if (type === ItemType.SHUTTLE && shuttleCount >= MAX_SHUTTLES) {
        e.preventDefault();
        return;
    }

    setDraggedType(type);
    e.dataTransfer.setData('application/react-dnd-type', type);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDropItem = useCallback((type: ItemType, x: number, y: number) => {
    if (isLocked) return;

    setItems(currentItems => {
        const currentPlayers = currentItems.filter(i => i.type === ItemType.PLAYER);
        const currentMarkers = currentItems.filter(i => i.type === ItemType.MARKER);
        const currentShuttles = currentItems.filter(i => i.type === ItemType.SHUTTLE);

        if (type === ItemType.PLAYER && currentPlayers.length >= MAX_PLAYERS) return currentItems;
        if (type === ItemType.MARKER && currentMarkers.length >= MAX_MARKERS) return currentItems;
        if (type === ItemType.SHUTTLE && currentShuttles.length >= MAX_SHUTTLES) return currentItems;

        let label = '';
        let color: string | undefined = undefined;

        if (type === ItemType.PLAYER) {
           // Find the first available Player slot (1-4)
           const usedSlots = currentPlayers.map(p => parseInt(p.label?.replace('P', '') || '0'));
           let nextSlot = 1;
           while (usedSlots.includes(nextSlot)) {
               nextSlot++;
           }
           label = 'P' + nextSlot;
           // Consistent color based on slot (0-indexed array)
           // Slot 1 -> Index 0 -> Red
           color = PLAYER_ORDER_COLORS[nextSlot - 1] || PlayerColor.RED;

        } else if (type === ItemType.MARKER) {
            const existingNumbers = currentMarkers
                .map(i => parseInt(i.label || '0', 10))
                .filter(n => !isNaN(n));
            let nextNum = 1;
            while (existingNumbers.includes(nextNum)) {
                nextNum++;
            }
            label = String(nextNum);
        }

        const newItem: CourtItem = {
            id: generateId(),
            type,
            position: { x, y },
            color: color,
            label: label
        };
        return [...currentItems, newItem];
    });
    setDraggedType(null);
  }, [isLocked]);

  const handleMoveItem = useCallback((id: string, x: number, y: number) => {
    if (isLocked) return;
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, position: { x, y } } : item
    ));
  }, [isLocked]);

  const handleMoveItems = useCallback((updates: {id: string, x: number, y: number}[]) => {
    if (isLocked) return;
    setItems(prev => prev.map(item => {
      const update = updates.find(u => u.id === item.id);
      if (update) {
          return { ...item, position: { x: update.x, y: update.y } };
      }
      return item;
    }));
  }, [isLocked]);

  const handleUpdateItem = useCallback((id: string, updates: Partial<CourtItem>) => {
    if (isLocked) return;
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  }, [isLocked]);

  const getDescendantPaths = (sourceId: string, allPaths: PlayerPath[]): string[] => {
    const directChildren = allPaths.filter(p => p.sourceId === sourceId);
    let descendants = directChildren.map(p => p.id);
    directChildren.forEach(child => {
        descendants = [...descendants, ...getDescendantPaths(child.id, allPaths)];
    });
    return descendants;
  };

  const handleDeleteItem = useCallback((id: string) => {
    if (isLocked) return;
    setItems(prev => prev.filter(item => item.id !== id));
    
    // Recursive delete paths starting from this player
    setPaths(prev => {
        const pathsToDelete = getDescendantPaths(id, prev);
        return prev.filter(p => !pathsToDelete.includes(p.id) && p.sourceId !== id);
    });
  }, [isLocked]);

  const handleCreateLine = useCallback((start: {x: number, y: number}, end: {x: number, y: number}) => {
    if (isLocked) return;
    setLines(prev => {
        const existingNumbers = prev.map(l => parseInt(l.label, 10)).filter(n => !isNaN(n));
        const nextNum = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;
        
        const newLine: LineItem = {
            id: generateId(),
            start,
            end,
            label: String(nextNum),
            color: activeLineColor, // Use the current active color
            type: activeLineType // Use current active type
        };
        return [...prev, newLine];
    });
  }, [activeLineColor, activeLineType, isLocked]);

  const handleUpdateLine = useCallback((id: string, updates: Partial<LineItem>) => {
      if (isLocked) return;
      setLines(prev => prev.map(line => 
          line.id === id ? { ...line, ...updates } : line
      ));
  }, [isLocked]);

  const handleDeleteLine = useCallback((id: string) => {
      if (isLocked) return;
      setLines(prev => prev.filter(line => line.id !== id));
  }, [isLocked]);

  // Path Handlers
  const handleCreatePath = useCallback((sourceId: string, sourceType: 'PLAYER' | 'PATH', endPosition: {x: number, y: number}) => {
    if (isLocked) return;
    setPaths(prev => [
      ...prev, 
      { id: generateId(), sourceId, sourceType, endPosition }
    ]);
  }, [isLocked]);

  const handleUpdatePath = useCallback((id: string, endPosition: {x: number, y: number}) => {
    if (isLocked) return;
    setPaths(prev => prev.map(path => 
      path.id === id ? { ...path, endPosition } : path
    ));
  }, [isLocked]);

  const handleDeletePath = useCallback((id: string) => {
    if (isLocked) return;
    setPaths(prev => {
        const pathsToDelete = getDescendantPaths(id, prev);
        return prev.filter(p => p.id !== id && !pathsToDelete.includes(p.id));
    });
  }, [isLocked]);

  const handleRequestClear = () => {
    if (isLocked) return;
    setIsClearConfirmOpen(true);
  };

  const handleConfirmClear = () => {
    setItems([]);
    setLines([]);
    setPaths([]);
    setIsClearConfirmOpen(false);
  };

  const handleClearPlayers = () => {
      if (isLocked) return;
      const players = items.filter(i => i.type === ItemType.PLAYER);
      // Clean up paths associated with these players
      const allPlayerIds = players.map(p => p.id);
      let pathsToRemove: string[] = [];
      allPlayerIds.forEach(pid => {
          pathsToRemove = [...pathsToRemove, ...getDescendantPaths(pid, paths)];
      });
      
      setItems(prev => prev.filter(i => i.type !== ItemType.PLAYER));
      setPaths(prev => prev.filter(p => !allPlayerIds.includes(p.sourceId) && !pathsToRemove.includes(p.id)));
  };

  const handleClearMarkers = () => {
      if (isLocked) return;
      setItems(prev => prev.filter(i => i.type !== ItemType.MARKER));
  };
  
  const handleApplyPreset = (presetKey: string) => {
     if (isLocked) return;
     
     // @ts-ignore
     const preset = PRESET_LAYOUTS[presetKey];
     if (!preset) return;

     const newItems: CourtItem[] = [];
     
     preset.forEach((p: any) => {
         newItems.push({
             id: generateId(),
             type: ItemType.PLAYER,
             position: p.position,
             color: p.color,
             label: p.label
         });

         if (p.withShuttle) {
             newItems.push({
                 id: generateId(),
                 type: ItemType.SHUTTLE,
                 position: { x: p.position.x + 4, y: p.position.y - 1.5 }
             });
         }
     });

     // Completely clear existing items (including markers) and replace with preset
     setItems(newItems);
     
     // Clear lines and paths
     setLines([]);
     setPaths([]);
  };

  const handleTrashDrop = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const toggleFocusPoint = (id: string) => {
    setFocusPoints(prev => prev.map(p => 
      p.id === id ? { ...p, completed: !p.completed } : p
    ));
  };

  // Add new Focus Point
  const handleAddFocusPoint = () => {
    setFocusPoints(prev => [...prev, { id: generateId(), text: 'New key point', completed: false }]);
  };

  // Update Focus Point Text
  const handleUpdateFocusPoint = (id: string, newText: string) => {
    setFocusPoints(prev => prev.map(p => 
        p.id === id ? { ...p, text: newText } : p
    ));
  };

  // Delete Focus Point
  const handleDeleteFocusPoint = (id: string) => {
      setFocusPoints(prev => prev.filter(p => p.id !== id));
  };

  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen w-full bg-[#0d120f] overflow-hidden">
      <SidebarLeft 
        onDragStart={handleDragStart} 
        onTrashDrop={handleTrashDrop}
        onClearAll={handleRequestClear}
        onClearPlayers={handleClearPlayers}
        onClearMarkers={handleClearMarkers}
        onOpenFeedback={() => setIsFeedbackOpen(true)}
        onToggleNotes={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
        onLogout={handleLogout}
        isNotesOpen={isRightSidebarOpen}
        playerCount={playerCount}
        markerCount={markerCount}
        shuttleCount={shuttleCount}
        nextMarkerLabel={nextMarkerLabel}
        nextPlayerColor={nextPlayerColor}
        activeLineColor={activeLineColor}
        setActiveLineColor={setActiveLineColor}
        activeLineType={activeLineType}
        setActiveLineType={setActiveLineType}
        isLocked={isLocked}
        onToggleLock={() => setIsLocked(!isLocked)}
        strategyName={strategyName}
        onUpdateStrategyName={setStrategyName}
        onOpenTutorial={() => setIsTutorialOpen(true)}
        onApplyPreset={handleApplyPreset}
      />
      
      <main className="flex-grow flex flex-col relative transition-all duration-300">
        <Court 
          items={items} 
          lines={lines}
          paths={paths}
          onDropItem={handleDropItem} 
          onMoveItem={handleMoveItem}
          onMoveItems={handleMoveItems}
          onDeleteItem={handleDeleteItem}
          onCreateLine={handleCreateLine}
          onUpdateLine={handleUpdateLine}
          onDeleteLine={handleDeleteLine}
          onUpdateItem={handleUpdateItem}
          onCreatePath={handleCreatePath}
          onUpdatePath={handleUpdatePath}
          onDeletePath={handleDeletePath}
          activeLineColor={activeLineColor}
          activeLineType={activeLineType}
          isLocked={isLocked}
        />
      </main>

      <SidebarRight 
        notes={notes}
        setNotes={setNotes}
        focusPoints={focusPoints}
        toggleFocusPoint={toggleFocusPoint}
        onAddPoint={handleAddFocusPoint}
        onUpdatePoint={handleUpdateFocusPoint}
        onDeletePoint={handleDeleteFocusPoint}
        isOpen={isRightSidebarOpen}
        onClose={() => setIsRightSidebarOpen(false)}
      />

      <FeedbackModal 
        isOpen={isFeedbackOpen} 
        onClose={() => setIsFeedbackOpen(false)} 
      />

      <TutorialModal 
        isOpen={isTutorialOpen} 
        onClose={() => setIsTutorialOpen(false)} 
      />

      <ConfirmModal 
        isOpen={isClearConfirmOpen}
        onClose={() => setIsClearConfirmOpen(false)}
        onConfirm={handleConfirmClear}
        title="Clear Court?"
        message="This will remove all players, markers, and lines from the court. This action cannot be undone."
      />
    </div>
  );
};

export default App;
