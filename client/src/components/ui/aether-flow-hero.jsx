'use client';

import { useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Zap } from 'lucide-react';
import { ButtonLink } from '@/components/ui/button';
import BrandMark from '@/components/common/BrandMark';

// Adapted from "Aether Flow" hero: particles now read as an electrical network
// (amber current, white near the cursor). Changes vs. the original:
//  - coordinates are relative to the canvas, so it works below a header
//  - animation pauses when off-screen or the tab is hidden
//  - prefers-reduced-motion draws one static frame
//  - particle count is capped for low-end devices
const PARTICLE_RGB = '251, 191, 36';
const LINE_RGB = '245, 158, 11';
const BG = '#09090b';
const MAX_PARTICLES = 140;

function useParticleNetwork(canvasRef, reduceMotion) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const mouse = { x: null, y: null, radius: 180 };
    let particles = [];
    let frame = null;
    let visible = true;

    class Particle {
      constructor(x, y, dx, dy, size) {
        Object.assign(this, { x, y, dx, dy, size });
      }

      update() {
        if (this.x > canvas.width || this.x < 0) this.dx = -this.dx;
        if (this.y > canvas.height || this.y < 0) this.dy = -this.dy;

        if (mouse.x !== null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const distance = Math.hypot(dx, dy);
          if (distance < mouse.radius + this.size && distance > 0) {
            const force = (mouse.radius - distance) / mouse.radius;
            this.x -= (dx / distance) * force * 5;
            this.y -= (dy / distance) * force * 5;
          }
        }

        this.x += this.dx;
        this.y += this.dy;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${PARTICLE_RGB}, 0.85)`;
        ctx.fill();
      }
    }

    const init = () => {
      const count = Math.min((canvas.width * canvas.height) / 9000, MAX_PARTICLES);
      particles = Array.from({ length: count }, () => {
        const size = Math.random() * 2 + 1;
        return new Particle(
          Math.random() * (canvas.width - size * 4) + size * 2,
          Math.random() * (canvas.height - size * 4) + size * 2,
          Math.random() * 0.4 - 0.2,
          Math.random() * 0.4 - 0.2,
          size,
        );
      });
    };

    const connect = () => {
      const threshold = (canvas.width / 7) * (canvas.height / 7);
      for (let a = 0; a < particles.length; a++) {
        for (let b = a + 1; b < particles.length; b++) {
          const dx = particles[a].x - particles[b].x;
          const dy = particles[a].y - particles[b].y;
          const distance = dx * dx + dy * dy;
          if (distance >= threshold) continue;

          const opacity = Math.max(1 - distance / 20000, 0);
          if (opacity === 0) continue;
          const nearMouse =
            mouse.x !== null && Math.hypot(particles[a].x - mouse.x, particles[a].y - mouse.y) < mouse.radius;

          ctx.strokeStyle = nearMouse ? `rgba(255, 255, 255, ${opacity})` : `rgba(${LINE_RGB}, ${opacity * 0.6})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(particles[a].x, particles[a].y);
          ctx.lineTo(particles[b].x, particles[b].y);
          ctx.stroke();
        }
      }
    };

    const render = () => {
      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        if (!reduceMotion) p.update();
        p.draw();
      }
      connect();
    };

    const loop = () => {
      render();
      frame = requestAnimationFrame(loop);
    };

    const start = () => {
      if (reduceMotion || frame !== null || !visible || document.hidden) return;
      frame = requestAnimationFrame(loop);
    };

    const stop = () => {
      if (frame !== null) cancelAnimationFrame(frame);
      frame = null;
    };

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      init();
      // Paint one frame immediately so the hero is never blank (reduced motion, background tab).
      render();
    };

    const onMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    const onMouseOut = () => {
      mouse.x = null;
      mouse.y = null;
    };
    const onVisibility = () => (document.hidden ? stop() : start());

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      visible ? start() : stop();
    });

    resize();
    start();
    observer.observe(canvas);
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseleave', onMouseOut);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      stop();
      observer.disconnect();
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseOut);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [canvasRef, reduceMotion]);
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.2 + 0.3, duration: 0.8, ease: 'easeInOut' },
  }),
};

export default function AetherFlowHero({
  badge = 'Electrical Products & Materials Supplier',
  title = 'Wired for Every Project',
  description = 'Switches, sockets, wires and cables, LED lighting, MCBs, distribution boards and installation accessories, supplied to homes, shops, offices, builders and electrical contractors.',
  primaryCta = { href: '/products', label: 'Browse Products' },
  secondaryCta = { href: '/quote', label: 'Request a Quote' },
  children,
}) {
  const canvasRef = useRef(null);
  const reduceMotion = useReducedMotion();
  useParticleNetwork(canvasRef, reduceMotion);

  const motionProps = (i) => ({ custom: i, variants: fadeUp, initial: reduceMotion ? false : 'hidden', animate: 'visible' });

  return (
    // Slightly shorter than the viewport on phones so the next section peeks in.
    <section className="relative flex min-h-[88svh] w-full flex-col items-center justify-center overflow-hidden bg-background sm:min-h-[100svh]">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgb(var(--background)/0.75)_70%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-background" />

      <div className="relative z-10 px-4 pb-12 pt-24 text-center sm:px-6 sm:pb-16 sm:pt-28">
        <motion.div {...motionProps(0)} className="mb-5 flex justify-center sm:mb-6">
          <BrandMark
            size={128}
            priority
            alt="Meca Trade Link logo"
            className="h-20 w-20 drop-shadow-[0_0_28px_rgba(245,158,11,0.35)] sm:h-28 sm:w-28"
          />
        </motion.div>

        <motion.div
          {...motionProps(0)}
          className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 backdrop-blur-sm sm:mb-6 sm:gap-2 sm:px-4 sm:py-1.5"
        >
          <Zap className="h-3.5 w-3.5 text-primary sm:h-4 sm:w-4" aria-hidden />
          <span className="text-xs font-medium text-zinc-200 sm:text-sm">{badge}</span>
        </motion.div>

        <motion.h1
          {...motionProps(1)}
          className="mb-4 bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-4xl font-bold tracking-tighter text-transparent sm:mb-6 sm:text-6xl md:text-8xl"
        >
          {title}
        </motion.h1>

        <motion.p {...motionProps(2)} className="mx-auto mb-7 max-w-2xl text-sm leading-relaxed text-zinc-400 sm:mb-10 sm:text-lg">
          {description}
        </motion.p>

        {/* Compact, side-by-side pills on phones; large buttons from sm up. */}
        <motion.div {...motionProps(3)} className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
          <ButtonLink
            href={primaryCta.href}
            variant="light"
            size="lg"
            className="h-11 rounded-full px-5 text-sm sm:h-14 sm:rounded-lg sm:px-8 sm:text-base"
          >
            {primaryCta.label}
            <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden />
          </ButtonLink>
          {secondaryCta && (
            <ButtonLink
              href={secondaryCta.href}
              variant="outline"
              size="lg"
              className="h-11 rounded-full px-5 text-sm backdrop-blur-sm sm:h-14 sm:rounded-lg sm:px-8 sm:text-base"
            >
              {secondaryCta.label}
            </ButtonLink>
          )}
        </motion.div>

        {children && <motion.div {...motionProps(4)}>{children}</motion.div>}
      </div>
    </section>
  );
}
