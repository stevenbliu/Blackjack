import React from 'react';
import { typeEmojiMap } from '../assets/temp_assets';

type StructureType = 'core' | 'spire' | null;

type HexTileProps = {
  size?: number;
  type: keyof typeof typeEmojiMap;
  number: number | null;
  structure: StructureType;
  onClick?: () => void;
};

// Terrain color mapping
const terrainColors: Record<keyof typeof typeEmojiMap, string> = {
  fire: '#ff9999',
  water: '#99ccff',
  earth: '#cc9966',
  air: '#f0f0f0',
  aether: '#cc99ff',
  desert: '#ffcc99'
};

function getHexPoints(size: number) {
  const width = size * 2;
  const height = Math.sqrt(3) * size;
  const centerX = size;
  const centerY = height / 2;

  return Array.from({ length: 6 }, (_, i) => {
    const angle_deg = 60 * i - 30; // -30° rotation for flat-top hexes
    const angle_rad = (Math.PI / 180) * angle_deg;
    const x = centerX + size * Math.cos(angle_rad);
    const y = centerY + size * Math.sin(angle_rad);
    return `${x},${y}`;
  }).join(' ');
}

export function HexTile({
  size = 46,
  type,
  number,
  structure,
  onClick,
}: HexTileProps) {
  const points = getHexPoints(size);
  const fillColor = terrainColors[type] || '#ddd';
  const emoji = typeEmojiMap[type] || '❓';
  const hexHeight = Math.sqrt(3) * size;
  const centerY = hexHeight / 2;

  return (
    <svg
      width={size * 2}
      height={hexHeight}
      onClick={onClick}
      style={{ 
        cursor: onClick ? 'pointer' : 'default', 
        userSelect: 'none',
        transition: 'transform 0.2s',
      }}
      className="hex-tile"
    >
      {/* Hexagon background */}
      <polygon 
        points={points} 
        fill={fillColor} 
        stroke="#555" 
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
        shapeRendering="geometricPrecision"
      />
      
      {/* Terrain emoji (centered) */}
      <text
        x={size}
        y={centerY}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={size / 2}
        pointerEvents="none"
      >
        {emoji}
      </text>

      {/* Number token (bottom center) */}
      {number !== null && (
        <g>
          <circle
            cx={size}
            cy={centerY + size * 0.4}
            r={size * 0.3}
            fill="white"
            stroke="#333"
            strokeWidth={1}
          />
          <text
            x={size}
            y={centerY + size * 0.4}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={size * 0.3}
            fill="#333"
            fontWeight="bold"
            pointerEvents="none"
          >
            {number}
          </text>
        </g>
      )}

      {/* Structure (top center) */}
      {structure && (
        <text
          x={size}
          y={centerY - size * 0.3}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={size * 0.4}
          pointerEvents="none"
        >
          {structure === 'core' ? '🏠' : '🏰'}
        </text>
      )}

      {/* Optional hover effect */}
      <polygon
        points={points}
        fill="transparent"
        stroke="transparent"
        strokeWidth={15}
        style={{ cursor: 'pointer' }}
      />
    </svg>
  );
}