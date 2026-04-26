"use client";

import { useEffect, useRef } from "react";

export default function BloodCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    const particles: any[] = [];

    const mouse = {
      x: w / 2,
      y: h / 2,
    };

    // resize
    const handleResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };

    // track mouse
    const handleMouse = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;

      // spawn blood particles
      for (let i = 0; i < 4; i++) {
        particles.push({
          x: mouse.x,
          y: mouse.y,
          vx: (Math.random() - 0.5) * 3,
          vy: (Math.random() - 0.5) * 3,
          life: 1,
          size: Math.random() * 6 + 2,
        });
      }
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouse);

    function drawHeart(x: number, y: number, size: number) {
      ctx.save();
      ctx.translate(x, y);
      ctx.fillStyle = "rgba(255, 0, 60, 0.9)";
      ctx.shadowColor = "red";
      ctx.shadowBlur = 20;

      ctx.beginPath();
      ctx.moveTo(0, size / 4);

      ctx.bezierCurveTo(-size, -size / 2, -size, size / 2, 0, size);
      ctx.bezierCurveTo(size, size / 2, size, -size / 2, 0, size / 4);

      ctx.fill();
      ctx.restore();
    }

    function animate() {
      ctx.clearRect(0, 0, w, h);

      // draw particles (blood drops)
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.02;
        p.size *= 0.98;

        ctx.beginPath();
        ctx.fillStyle = `rgba(180, 0, 30, ${p.life})`;
        ctx.shadowColor = "darkred";
        ctx.shadowBlur = 10;
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        if (p.life <= 0) {
          particles.splice(i, 1);
          i--;
        }
      }

      // heart cursor
      drawHeart(mouse.x, mouse.y, 18);

      requestAnimationFrame(animate);
    }

    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouse);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-50"
    />
  );
}