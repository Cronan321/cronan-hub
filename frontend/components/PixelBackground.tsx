"use client";
import React, { useEffect, useRef } from 'react';

export default function PixelBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: any[] = [];
    const mouse = { x: -100, y: -100 };

    const gridSize = 10;      // tight grid — small pixels
    const particleCount = 600; // many of them

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
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
        this.x = Math.floor(Math.random() * (canvas.width / gridSize)) * gridSize;
        this.y = Math.random() * canvas.height;
        this.size = gridSize - 1; // 1px gap between pixels
        this.speedY = -(Math.random() * 0.6 + 0.2); // slow drift upward
        // Silver tones — varying opacity for depth
        const silver = Math.floor(Math.random() * 60 + 180); // 180–240 range
        this.color = `rgb(${silver}, ${silver + 5}, ${silver + 15})`;
        this.opacity = Math.random() * 0.18 + 0.04; // mostly transparent
      }

      update() {
        this.y += this.speedY;

        if (this.y < -this.size) {
          this.y = canvas.height + this.size;
          this.x = Math.floor(Math.random() * (canvas.width / gridSize)) * gridSize;
        }

        // Mouse ripple — pixels near cursor brighten and scatter slightly
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
        if (!ctx) return;
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;
        ctx.shadowBlur = this.opacity > 0.4 ? 6 : 0;
        ctx.shadowColor = this.color;
        ctx.fillRect(this.x, this.y, this.size, this.size);
      }
    }

    const init = () => {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    };

    const animate = () => {
      // Metallic navy base — deep blue with a slight steel tone
      ctx.fillStyle = 'rgb(8, 12, 28)';
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
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