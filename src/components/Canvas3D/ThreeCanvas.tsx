import React, { useEffect, useRef } from 'react';
import { WorldEngine } from './WorldEngine';
import type { Destination } from '../../types/game';

interface ThreeCanvasProps {
  onSpeedUpdate: (speedKmH: number) => void;
  onDestinationEnter: (destination: Destination) => void;
  onDestinationLeave: () => void;
  onProgressUpdate: (discoveredIds: string[], currentRoadT: number) => void;
  onNitroChange?: (isNitro: boolean) => void;
  onEngineReady?: (engine: WorldEngine) => void;
  isPaused: boolean;
  activeModalOpen: boolean;
}

export const ThreeCanvas: React.FC<ThreeCanvasProps> = ({
  onSpeedUpdate,
  onDestinationEnter,
  onDestinationLeave,
  onProgressUpdate,
  onNitroChange,
  onEngineReady,
  isPaused,
  activeModalOpen
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<WorldEngine | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    try {
      const engine = new WorldEngine(containerRef.current, {
        onSpeedUpdate,
        onDestinationEnter,
        onDestinationLeave,
        onProgressUpdate,
        onNitroChange
      });

      engineRef.current = engine;
      if (onEngineReady) {
        onEngineReady(engine);
      }

      return () => {
        engine.destroy();
        engineRef.current = null;
      };
    } catch (err) {
      console.error('Failed to initialize 3D WorldEngine:', err);
    }
  }, []);

  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setPaused(isPaused || activeModalOpen);
    }
  }, [isPaused, activeModalOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        activeModalOpen ||
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement).isContentEditable
      ) {
        return;
      }

      const key = e.key.toLowerCase();
      if (['arrowup', 'w'].includes(key)) {
        engineRef.current?.updateControls({ forward: true });
        e.preventDefault();
      } else if (['arrowdown', 's'].includes(key)) {
        engineRef.current?.updateControls({ backward: true });
        e.preventDefault();
      } else if (['arrowleft', 'a'].includes(key)) {
        engineRef.current?.updateControls({ left: true });
        e.preventDefault();
      } else if (['arrowright', 'd'].includes(key)) {
        engineRef.current?.updateControls({ right: true });
        e.preventDefault();
      } else if ([' ', 'space'].includes(key)) {
        engineRef.current?.updateControls({ brake: true });
        e.preventDefault();
      } else if (key === 'shift') {
        engineRef.current?.updateControls({ nitro: true });
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (['arrowup', 'w'].includes(key)) {
        engineRef.current?.updateControls({ forward: false });
      } else if (['arrowdown', 's'].includes(key)) {
        engineRef.current?.updateControls({ backward: false });
      } else if (['arrowleft', 'a'].includes(key)) {
        engineRef.current?.updateControls({ left: false });
      } else if (['arrowright', 'd'].includes(key)) {
        engineRef.current?.updateControls({ right: false });
      } else if ([' ', 'space'].includes(key)) {
        engineRef.current?.updateControls({ brake: false });
      } else if (key === 'shift') {
        engineRef.current?.updateControls({ nitro: false });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [activeModalOpen]);

  return (
    <div
      ref={containerRef}
      className="three-canvas-container"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        touchAction: 'none'
      }}
    />
  );
};
