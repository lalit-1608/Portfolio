import React, { useEffect, useRef } from 'react';
import { portfolioData } from '../../data/portfolio';
import type { DestinationId } from '../../types/game';
import { WorldEngine } from '../Canvas3D/WorldEngine';
import { sounds } from '../../audio/soundEffects';

interface MinimapProps {
  engine: WorldEngine | null;
  discoveredIds: string[];
  activeDestinationId?: DestinationId;
  onSelectDestination: (id: DestinationId) => void;
}

export const Minimap: React.FC<MinimapProps> = ({
  engine,
  discoveredIds,
  activeDestinationId,
  onSelectDestination
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let animId: number;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas || !engine) {
        animId = requestAnimationFrame(render);
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const size = canvas.width;
      const center = size / 2;
      const scale = size / 220; // 220 world units mapped to canvas

      ctx.clearRect(0, 0, size, size);

      // 1. Radar background circle
      ctx.beginPath();
      ctx.arc(center, center, center - 4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(234, 245, 255, 0.85)';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#7CCBFF';
      ctx.stroke();

      // 2. Island shape
      ctx.beginPath();
      ctx.arc(center, center, (140 * scale) / 2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(184, 220, 239, 0.5)';
      ctx.fill();

      // 3. Draw Road Curve
      if (engine.roadCurve) {
        ctx.beginPath();
        const roadPoints = engine.roadCurve.getSpacedPoints(100);
        roadPoints.forEach((pt, i) => {
          const mapX = center + pt.x * scale;
          const mapY = center + pt.z * scale;
          if (i === 0) ctx.moveTo(mapX, mapY);
          else ctx.lineTo(mapX, mapY);
        });
        ctx.closePath();
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#1E3A5F';
        ctx.stroke();

        ctx.lineWidth = 1.5;
        ctx.strokeStyle = '#FFFFFF';
        ctx.setLineDash([3, 3]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // 4. Draw Destination Markers
      portfolioData.destinations.forEach((dest) => {
        const destX = center + dest.position[0] * scale;
        const destY = center + dest.position[2] * scale;
        const isDiscovered = discoveredIds.includes(dest.id);
        const isActive = activeDestinationId === dest.id;

        // Outer glow for active
        if (isActive) {
          ctx.beginPath();
          ctx.arc(destX, destY, 8, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(37, 99, 235, 0.35)';
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(destX, destY, isDiscovered ? 5 : 4, 0, Math.PI * 2);
        ctx.fillStyle = isDiscovered ? dest.color : '#94A3B8';
        ctx.fill();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = '#FFFFFF';
        ctx.stroke();
      });

      // 5. Draw Cyclist Position & Heading
      const cyclist = engine.getCyclistState();
      const playerX = center + cyclist.x * scale;
      const playerY = center + cyclist.z * scale;

      ctx.save();
      ctx.translate(playerX, playerY);
      ctx.rotate(cyclist.rotationY - Math.PI / 2);

      // Player direction triangle
      ctx.beginPath();
      ctx.moveTo(0, -6);
      ctx.lineTo(4, 5);
      ctx.lineTo(-4, 5);
      ctx.closePath();
      ctx.fillStyle = '#2563EB';
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.strokeStyle = '#FFFFFF';
      ctx.stroke();

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [engine, discoveredIds, activeDestinationId]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !engine) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const size = canvas.width;
    const center = size / 2;
    const scale = size / 220;

    // Check click near any destination
    for (const dest of portfolioData.destinations) {
      const destX = center + dest.position[0] * scale;
      const destY = center + dest.position[2] * scale;
      if (Math.hypot(destX - clickX, destY - clickY) < 14) {
        sounds.playClick();
        onSelectDestination(dest.id);
        break;
      }
    }
  };

  return (
    <div className="minimap-container" title="Interactive Island Map — Click checkpoints to navigate">
      <div className="minimap-header">
        <span className="minimap-title">ISLAND MAP</span>
        <span className="minimap-count">{discoveredIds.length}/5 Discovered</span>
      </div>
      <canvas
        ref={canvasRef}
        width={140}
        height={140}
        className="minimap-canvas"
        onClick={handleCanvasClick}
      />
    </div>
  );
};
