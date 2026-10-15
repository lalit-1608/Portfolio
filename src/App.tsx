import { useState, useEffect, useRef } from 'react';
import type { Destination, DestinationId, ViewMode, GameControls } from './types/game';
import { portfolioData } from './data/portfolio';
import { ThreeCanvas } from './components/Canvas3D/ThreeCanvas';
import { WorldEngine } from './components/Canvas3D/WorldEngine';
import { Navbar } from './components/HUD/Navbar';
import { Minimap } from './components/HUD/Minimap';
import { Speedometer } from './components/HUD/Speedometer';
import { JourneyProgress } from './components/HUD/JourneyProgress';
import { ControlsTutorial } from './components/HUD/ControlsTutorial';
import { MobileControls } from './components/HUD/MobileControls';
import { DestinationModal } from './components/Modals/DestinationModal';
import { HeroOverlay } from './components/Hero/HeroOverlay';
import { RecruiterView } from './components/RecruiterMode/RecruiterView';
import { WebGLFallback } from './components/Fallback/WebGLFallback';
import { sounds } from './audio/soundEffects';

export function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('game');
  const [heroActive, setHeroActive] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isNitro, setIsNitro] = useState<boolean>(false);
  const [speedKmH, setSpeedKmH] = useState<number>(0);
  const [roadProgress, setRoadProgress] = useState<number>(0.05);
  const [discoveredIds, setDiscoveredIds] = useState<string[]>(['about']);
  const [nearbyDestination, setNearbyDestination] = useState<Destination | null>(null);
  const [activeModalDestination, setActiveModalDestination] = useState<Destination | null>(null);
  const [webGLSupported, setWebGLSupported] = useState<boolean>(true);

  const engineRef = useRef<WorldEngine | null>(null);
  const lastOpenedStationRef = useRef<string | null>(null);

  // Check WebGL availability
  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setWebGLSupported(false);
      }
    } catch {
      setWebGLSupported(false);
    }
  }, []);

  const handleToggleMute = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
  };

  const handleResetRide = () => {
    if (engineRef.current) {
      engineRef.current.resetToStart();
    }
    setActiveModalDestination(null);
  };

  const handleNavigateSection = (id: DestinationId) => {
    const dest = portfolioData.destinations.find((d) => d.id === id);
    if (!dest) return;

    if (viewMode === 'game') {
      if (engineRef.current) {
        engineRef.current.teleportToDestination(id);
      }
      lastOpenedStationRef.current = id;
      setActiveModalDestination(dest);
    } else {
      const elem = document.getElementById(`recruiter-${id}`);
      if (elem) {
        elem.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleStartJourney = () => {
    setHeroActive(false);
    sounds.playClick();
  };

  const handleExploreProjectsDirect = () => {
    setHeroActive(false);
    handleNavigateSection('projects');
  };

  const handleMobileControls = (controls: Partial<GameControls>) => {
    if (engineRef.current) {
      engineRef.current.updateControls(controls);
    }
    if (controls.nitro !== undefined) {
      setIsNitro(controls.nitro);
    }
  };

  if (!webGLSupported) {
    return (
      <WebGLFallback
        onSwitchToRecruiterView={() => {
          setWebGLSupported(true);
          setViewMode('recruiter');
        }}
      />
    );
  }

  return (
    <div className={`portfolio-app-root ${isNitro ? 'nitro-mode' : ''}`}>
      {/* 2D Recruiter View */}
      {viewMode === 'recruiter' ? (
        <RecruiterView
          onBackToRide={() => {
            setViewMode('game');
            setHeroActive(false);
          }}
        />
      ) : (
        /* 3D Game & Cycling World View */
        <main className="game-world-wrapper">
          {/* Nitro speed lines overlay */}
          {isNitro && <div className="nitro-speed-lines-overlay" />}

          {/* 3D WebGL Canvas Engine */}
          <ThreeCanvas
            onSpeedUpdate={setSpeedKmH}
            onDestinationEnter={(destination) => {
              setNearbyDestination(destination);
              // Automatic pop-up showing all information when arriving at any station!
              if (lastOpenedStationRef.current !== destination.id) {
                lastOpenedStationRef.current = destination.id;
                setActiveModalDestination(destination);
              }
            }}
            onDestinationLeave={() => {
              setNearbyDestination(null);
              lastOpenedStationRef.current = null;
            }}
            onProgressUpdate={(ids, t) => {
              setDiscoveredIds(ids);
              setRoadProgress(t);
            }}
            onNitroChange={setIsNitro}
            onEngineReady={(engine) => {
              engineRef.current = engine;
            }}
            isPaused={heroActive}
            activeModalOpen={Boolean(activeModalDestination)}
          />

          {/* Floating Navigation Header */}
          <Navbar
            viewMode={viewMode}
            onToggleViewMode={() => setViewMode(viewMode === 'game' ? 'recruiter' : 'game')}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
            onResetRide={handleResetRide}
            onNavigateSection={handleNavigateSection}
            activeDestinationId={activeModalDestination?.id || nearbyDestination?.id}
          />

          {/* HUD Overlay Elements */}
          {!heroActive && (
            <>
              {/* Minimap */}
              <Minimap
                engine={engineRef.current}
                discoveredIds={discoveredIds}
                activeDestinationId={activeModalDestination?.id || nearbyDestination?.id}
                onSelectDestination={handleNavigateSection}
              />

              {/* Speedometer & Gear (With Nitro indicator) */}
              <Speedometer speedKmH={speedKmH} roadProgress={roadProgress} isNitro={isNitro} />

              {/* Journey Checkpoints & Nearby Alert */}
              <JourneyProgress
                discoveredIds={discoveredIds}
                nearbyDestination={nearbyDestination}
                onOpenDestination={(dest) => setActiveModalDestination(dest)}
              />

              {/* Keyboard Controls Guide */}
              <ControlsTutorial />

              {/* Mobile Touch Controls */}
              <MobileControls onUpdateControls={handleMobileControls} />
            </>
          )}

          {/* Fullscreen Hero Opening Screen */}
          {heroActive && (
            <HeroOverlay
              onStartJourney={handleStartJourney}
              onExploreProjects={handleExploreProjectsDirect}
              onOpenRecruiterView={() => {
                setHeroActive(false);
                setViewMode('recruiter');
              }}
            />
          )}

          {/* Destination Detail Modal (Auto pop-up when reaching station) */}
          {activeModalDestination && (
            <DestinationModal
              destination={activeModalDestination}
              onClose={() => setActiveModalDestination(null)}
              onSwitchDestination={(id) => {
                const target = portfolioData.destinations.find((d) => d.id === id);
                if (target) {
                  lastOpenedStationRef.current = id;
                  setActiveModalDestination(target);
                  engineRef.current?.teleportToDestination(id);
                }
              }}
            />
          )}
        </main>
      )}
    </div>
  );
}

export default App;
