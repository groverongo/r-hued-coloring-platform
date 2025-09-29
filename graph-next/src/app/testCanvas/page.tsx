'use client'
import React, { useRef, useEffect, useCallback, FC } from 'react';

// Define a type for a single point (click location)
interface Point {
  x: number;
  y: number;
}

// Define props for the component (optional, but good practice)
interface ClickCanvasProps {
  width?: number;
  height?: number;
  circleRadius?: number;
  circleColor?: string;
}

const ClickCanvas: FC<ClickCanvasProps> = ({
  width = 800,
  height = 600,
  circleRadius = 10,
  circleColor = 'red',
}) => {
  // 1. Get a reference to the canvas element
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // 2. State to store all the points where the user has clicked
  const pointsRef = useRef<Point[]>([]);

  // 3. Drawing logic: a memoized function to draw all stored circles
  const drawCircles = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear the entire canvas before redrawing
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = circleColor;

    // Draw each stored point
    pointsRef.current.forEach((point) => {
      ctx.beginPath();
      // arc(x, y, radius, startAngle, endAngle)
      ctx.arc(point.x, point.y, circleRadius, 0, Math.PI * 2);
      ctx.fill();
    });
  }, [circleRadius, circleColor]); // Redraw when these props change

  // 4. Click handler: adds a new point and triggers a redraw
  const handleCanvasClick = useCallback((event: MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Calculate click position relative to the canvas
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Add the new point to our list
    pointsRef.current.push({ x, y });

    // Draw all the circles (including the new one)
    drawCircles();
  }, [drawCircles]);

  // 5. Effect for setup and cleanup
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set up the click listener
    canvas.addEventListener('click', handleCanvasClick as unknown as EventListener);
    
    // Initial draw (in case props change or on mount)
    drawCircles();

    // Cleanup: remove the event listener when the component unmounts
    return () => {
      canvas.removeEventListener('click', handleCanvasClick as unknown as EventListener);
    };
  }, [handleCanvasClick, drawCircles]); // Dependencies ensure we use the latest functions

  // 6. Component rendering
  return (
    <div>
      <h3 style={{ fontFamily: 'sans-serif' }}>Click on the Canvas to Draw a Circle 🔴</h3>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{ border: '2px solid #333', display: 'block' }}
      >
        Your browser does not support the HTML canvas tag.
      </canvas>
      <p style={{ fontFamily: 'sans-serif', fontSize: 'small', color: '#666' }}>
        Current circles: {pointsRef.current.length}
      </p>
    </div>
  );
};

export default ClickCanvas;