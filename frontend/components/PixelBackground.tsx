"use client";
import React, { useEffect, useRef } from 'react';

export default function PixelBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Non-null references for use inside the Particle class closure
    const c = canvas;
    const cx = ctx;

    let animationFrameId: number;
    let particles: any[] = [];
    const mouse = { x: -100, y: -100 };

    const gridSize = 10;      // tight grid — small pixels
    const particleCount = 600; // many of them

    const resize = () => {
      c.width = window.innerWidth;
      c.height = window.innerHeight;
    };

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    resize();

    class Particle {
      x: number;
      y: number;
      size: number;
      speedY: number;
      color: string;
      opacity: number;

      constructor() {
        this.x = Math.floor(Math.random() * (c.width / gridSize)) * gridSize;
        this.y = Math.random() * c.height;
        this.size = gridSize - 1;
        this.speedY = -(Math.random() * 0.6 + 0.2);
        const silver = Math.floor(Math.random() * 60 + 180);
        this.color = `rgb(${silver}, ${silver + 5}, ${silver + 15})`;
        this.opacity = Math.random() * 0.18 + 0.04;
      }

      update() {
        this.y += this.speedY;

        if (this.y < -this.size) {
          this.y = c.height + this.size;
          this.x = Math.floor(Math.random() * (c.width / gridSize)) * gridSize;
        }

        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 120) {
          const force = (120 - distance) / 120;
          this.opacity = Math.min(0.85, this.opacity + force * 0.6);
          this.y -= (dy / distance) * force * 2;
          this.x -= (dx / distance) * force * 1.5;
        } else {
          this.opacity = Math.max(Math.random() * 0.08 + 0.03, this.opacity - 0.008);
        }
      }

      draw() {
        cx.globalAlpha = this.opacity;
        cx.fillStyle = this.color;
        cx.shadowBlur = this.opacity > 0.4 ? 6 : 0;
        cx.shadowColor = this.color;
        cx.fillRect(this.x, this.y, this.size, this.size);
      }
    }

    const init = () => {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    };

    const animate = () => {
      cx.fillStyle = 'rgb(8, 12, 28)';
      cx.globalAlpha = 1;
      cx.shadowBlur = 0;
      cx.fillRect(0, 0, c.width, c.height);
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    init();
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none"
      style={{ background: 'rgb(8, 12, 28)' }}
    />
  );
}