/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useMotionValue } from 'motion/react';
import { 
  Heart, 
  Sparkles, 
  Gift, 
  Music, 
  ChevronDown, 
  Star, 
  Moon,
  Volume2,
  VolumeX,
  Lock,
  Unlock,
  ExternalLink,
  Camera,
  Play
} from 'lucide-react';
import confetti from 'canvas-confetti';
import Lenis from 'lenis';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- Utils ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Components ---

const CustomCursor = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { damping: 20, stiffness: 250 });
  const springY = useSpring(mouseY, { damping: 20, stiffness: 250 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <motion.div
      className="fixed top-0 left-0 w-8 h-8 border-2 border-coral rounded-full pointer-events-none z-[9999] mix-blend-difference hidden md:block"
      style={{ x: springX, y: springY, translateX: '-50%', translateY: '-50%' }}
    />
  );
};

const Noise = () => <div className="noise-overlay" />;

const MeshBackground = () => (
  <div className="fixed inset-0 z-0 mesh-gradient opacity-40" />
);

const BentoItem = ({ children, className, delay = 0 }: { children: React.ReactNode, className?: string, delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20, scale: 0.95 }}
    whileInView={{ opacity: 1, y: 0, scale: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 0.8, delay, ease: [0.34, 1.56, 0.64, 1] }}
    whileHover={{ scale: 1.02, rotate: 1 }}
    className={cn("glass-2 rounded-3xl p-6 overflow-hidden relative group", className)}
  >
    {children}
  </motion.div>
);

// --- Sections ---

const EnvelopeSection = ({ onComplete }: { onComplete: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showCard, setShowCard] = useState(false);

  const handleOpen = () => {
    if (isOpen) return;
    
    // Confetti burst
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FEA38E', '#FBA2AB', '#F385A0'],
      shapes: ['circle', 'square']
    });

    setIsOpen(true);
    setTimeout(() => setShowCard(true), 1000);
    setTimeout(() => onComplete(), 7000);
  };

  return (
    <div className="h-[100dvh] w-full flex items-center justify-center relative overflow-hidden perspective-1000">
      <MeshBackground />
      <Noise />
      
      <div className={cn("envelope-wrapper relative", isOpen && "open")}>
        <div className="wing right"></div>
        <div className="wing left"></div>
        
        <motion.div 
          className="heart" 
          onClick={handleOpen}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        />
        
        <div id="envelope">
          <div className="top"></div>
          <div className="sides"></div>
          
          {/* The Card */}
          <AnimatePresence>
            {showCard && (
              <motion.div
                initial={{ y: 0, opacity: 0 }}
                animate={{ y: -150, opacity: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute inset-4 glass-2 rounded-2xl p-8 flex flex-col items-center justify-center text-center z-[1] shadow-[0_50px_100px_rgba(0,0,0,0.1)]"
              >
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="font-accent italic text-2xl text-hotpink mb-4"
                >
                  Special Delivery
                </motion.span>
                <h1 className="text-4xl md:text-5xl font-display font-bold leading-tight mb-6">
                  HAPPY<br />BIRTHDAY<br />
                  <span className="text-kinetic">TASYA</span>
                </h1>
                <div className="w-12 h-1 bg-coral/30 rounded-full" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        className="absolute bottom-12 text-xs font-display tracking-[0.3em] uppercase"
      >
        Tap the heart to begin
      </motion.div>
    </div>
  );
};

const MemoriesCarousel = () => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(50);
  const startXRef = useRef(0);
  const isDownRef = useRef(false);

  const memories = [
    { title: "Sweet Moments", img: "/photos/tasya/1.jpg" },
    { title: "Golden Days", img: "/photos/tasya/2.jpg" },
    { title: "Pure Joy", img: "/photos/tasya/3.jpg" },
    { title: "Dreamy Vibes", img: "/photos/tasya/4.jpg" },
  ];

  const speedWheel = 0.02;
  const speedDrag = -0.1;

  const getZindex = (array: any[], index: number) => 
    array.map((_, i) => (index === i) ? array.length : array.length - Math.abs(index - i));

  const displayItems = (item: HTMLElement, index: number, active: number) => {
    const zIndex = getZindex(memories, active)[index];
    item.style.setProperty('--zIndex', zIndex.toString());
    item.style.setProperty('--active', ((index - active) / memories.length).toString());
  };

  const animate = () => {
    const progress = Math.max(0, Math.min(progressRef.current, 100));
    const active = Math.floor(progress / 100 * (memories.length - 1));
    
    const items = carouselRef.current?.querySelectorAll<HTMLElement>('.carousel-item');
    items?.forEach((item, index) => displayItems(item, index, active));
  };

  useEffect(() => {
    animate();

    const autoScroll = setInterval(() => {
      if (!isDownRef.current) {
        const step = 100 / Math.max(1, memories.length - 1);
        const currentIndex = Math.round(progressRef.current / step);
        const nextIndex = (currentIndex + 1) % memories.length;
        progressRef.current = nextIndex * step;
        animate();
      }
    }, 3000);

    const handleWheel = (e: WheelEvent) => {
      // Only handle wheel if the mouse is over the carousel section
      const rect = carouselRef.current?.getBoundingClientRect();
      if (rect && e.clientY >= rect.top && e.clientY <= rect.bottom) {
        const wheelProgress = e.deltaY * speedWheel;
        progressRef.current = progressRef.current + wheelProgress;
        animate();
      }
    };

    const handleMouseMove = (e: MouseEvent | TouchEvent) => {
      if (!isDownRef.current) return;
      const x = 'clientX' in e ? e.clientX : e.touches[0].clientX;
      const mouseProgress = (x - startXRef.current) * speedDrag;
      progressRef.current = progressRef.current + mouseProgress;
      startXRef.current = x;
      animate();
    };

    const handleMouseDown = (e: MouseEvent | TouchEvent) => {
      isDownRef.current = true;
      startXRef.current = 'clientX' in e ? e.clientX : e.touches[0].clientX;
    };

    const handleMouseUp = () => {
      isDownRef.current = false;
    };

    document.addEventListener('wheel', handleWheel, { passive: false });
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchstart', handleMouseDown);
    document.addEventListener('touchmove', handleMouseMove);
    document.addEventListener('touchend', handleMouseUp);

    return () => {
      clearInterval(autoScroll);
      document.removeEventListener('wheel', handleWheel);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchstart', handleMouseDown);
      document.removeEventListener('touchmove', handleMouseMove);
      document.removeEventListener('touchend', handleMouseUp);
    };
  }, []);

  return (
    <section className="memories-carousel-section" ref={carouselRef}>
      <div className="carousel-layout">
        <div className="box">
          Photo Kenang-kenangan<br />
          Untuk Tasya Tersayang<br />
          Selamat Ulang Tahun ke-18
        </div>
      </div>

      <div className="carousel">
        {memories.map((memory, i) => (
          <div 
            key={i} 
            className="carousel-item"
            onClick={() => {
              progressRef.current = (i / memories.length) * 100 + 10;
              animate();
            }}
          >
            <div className="carousel-box">
              <img src={memory.img} alt={memory.title} referrerPolicy="no-referrer" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

const MainExperience = ({ isMuted, setIsMuted }: { isMuted: boolean, setIsMuted: (val: boolean) => void }) => {
  const [isBlown, setIsBlown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, []);

  return (
    <div ref={containerRef} className="relative bg-vanilla min-h-screen">
      <MeshBackground />
      <Noise />
      <CustomCursor />

      {/* Audio Pill */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] glass-2 px-6 py-3 rounded-full flex items-center gap-4 border-white/40"
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-hotpink rounded-full animate-pulse" />
          <span className="text-[10px] font-display uppercase tracking-widest opacity-60">Birthday Lo-fi</span>
        </div>
        <div className="w-[1px] h-4 bg-black/10" />
        <button 
          onClick={() => setIsMuted(!isMuted)}
          className="hover:scale-110 transition-transform"
        >
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
      </motion.div>

      <HeroSection 
        isBlown={isBlown} 
        onBlow={() => {
          setIsBlown(true);
          confetti({ 
            particleCount: 150, 
            spread: 80, 
            origin: { y: 0.6 },
            colors: ['#FEA38E', '#FBA2AB', '#F385A0']
          });
        }} 
      />

      {/* Memories Carousel Section */}
      <MemoriesCarousel />

      {/* Personal Message */}
      <section className="py-32 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="max-w-2xl mx-auto glass-2 p-12 rounded-[3rem] relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Sparkles size={100} />
          </div>
          
          <div className="relative z-10 space-y-8">
            <div className="space-y-2">
              <span className="font-display text-[10px] uppercase tracking-[0.4em] text-hotpink">A Letter for You</span>
              <h3 className="text-4xl font-display font-bold italic">Dear Tasya,</h3>
            </div>
            
            <div className="space-y-6 text-lg leading-relaxed font-light text-deeprose/80">
              <p>
                Watching you grow into the person you are today has been one of my favorite stories. 
                You have this rare ability to make the ordinary feel extraordinary.
              </p>
              <p>
                On your 18th birthday, I wish you a world of discovery. May you find beauty in the small things, 
                strength in your challenges, and endless reasons to keep that beautiful smile on your face.
              </p>
              <p>
                You are loved, you are valued, and you are absolutely one of a kind.
              </p>
            </div>

            <div className="pt-8 border-t border-deeprose/10 flex justify-between items-end">
              <div className="space-y-1">
                <p className="text-xs opacity-60 font-display uppercase tracking-widest">With Love,</p>
                <p className="text-3xl font-accent italic text-deeprose">Refan Maulana</p>
              </div>
              <div className="text-4xl">🌸</div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Special Link */}
      <section className="py-40 text-center px-6">
        <div className="max-w-xl mx-auto space-y-12">
          <motion.div
            whileHover={{ rotate: [0, -1, 1, 0] }}
            className="inline-block glass-2 px-4 py-2 rounded-full text-[10px] font-display uppercase tracking-widest text-hotpink"
          >
            Psst... ada sesuatu di sini 👀
          </motion.div>
          
          <h2 className="text-5xl md:text-7xl font-display font-bold tracking-tighter">
            READY FOR THE<br />
            <span className="text-kinetic">SURPRISE?</span>
          </h2>

          <motion.a
            href="https://link.dana.id/danakaget?c=smrm6tgx7&r=dBDbmy&orderId=20260319101214297415010300166927168900439"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group relative inline-flex items-center gap-4 glass-2 px-10 py-5 rounded-full overflow-hidden border-hotpink/20"
          >
            <div className="absolute inset-0 bg-hotpink translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            <span className="relative z-10 font-display font-bold uppercase tracking-widest text-sm text-deeprose group-hover:text-white transition-colors">
              Klik link ini Tasyaa
            </span>
            <ExternalLink size={18} className="relative z-10 text-hotpink group-hover:text-white transition-colors" />
          </motion.a>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 text-center border-t border-deeprose/5">
        <div className="space-y-4 opacity-40">
          <p className="font-display text-[10px] uppercase tracking-[0.8em] text-deeprose">Designed for Tasya's 18th</p>
          <div className="flex justify-center gap-6 text-hotpink">
            <Star size={14} />
            <Moon size={14} />
            <Sparkles size={14} />
          </div>
        </div>
      </footer>
    </div>
  );
};

const Cake = ({ isBlown, onBlow }: { isBlown: boolean, onBlow: () => void }) => {
  return (
    <div className="relative flex flex-col items-center justify-center scale-75 md:scale-100">
      {/* Plate */}
      <div className="w-64 h-4 bg-white/40 rounded-full glass-2 mb-[-2px] relative z-0" />
      
      {/* Cake Layers */}
      <div className="relative w-48 h-32 flex flex-col items-center z-10">
        {/* Top Layer */}
        <div className="w-full h-1/3 bg-softrose rounded-t-2xl relative overflow-hidden border-x border-t border-white/30">
          <div className="absolute top-0 left-0 w-full h-4 bg-hotpink/20" />
          {/* Drip Effect */}
          <div className="absolute bottom-0 left-0 w-full flex justify-around">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="w-4 h-6 bg-hotpink/40 rounded-full -mb-3" />
            ))}
          </div>
        </div>
        {/* Middle Layer */}
        <div className="w-[110%] h-1/3 bg-bubblegum/40 border-x border-white/30 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />
        </div>
        {/* Bottom Layer */}
        <div className="w-[120%] h-1/3 bg-hotpink/30 rounded-b-xl border-x border-b border-white/30 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent" />
        </div>
      </div>

      {/* Candle */}
      <div className="absolute top-[-40px] left-1/2 -translate-x-1/2 z-20">
        <div className="w-3 h-16 bg-gradient-to-b from-coral to-hotpink rounded-full relative">
          {/* Wick */}
          <div className="absolute top-[-4px] left-1/2 -translate-x-1/2 w-1 h-4 bg-deeprose/40 rounded-full" />
          
          {/* Flame */}
          <AnimatePresence>
            {!isBlown && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                  opacity: 1, 
                  scale: [1, 1.1, 1],
                  y: [0, -2, 0]
                }}
                exit={{ 
                  opacity: 0, 
                  scale: 2, 
                  filter: "blur(10px)",
                  transition: { duration: 0.5 }
                }}
                transition={{ 
                  duration: 0.5,
                  scale: { repeat: Infinity, duration: 0.6 },
                  y: { repeat: Infinity, duration: 0.8 }
                }}
                className="absolute top-[-25px] left-1/2 -translate-x-1/2 cursor-pointer"
                onClick={onBlow}
              >
                {/* Inner Flame */}
                <div className="w-6 h-10 bg-gradient-to-t from-orange-500 via-yellow-400 to-transparent rounded-full blur-[2px] relative">
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-3 h-5 bg-white/80 rounded-full blur-[1px]" />
                </div>
                {/* Glow */}
                <div className="absolute inset-0 bg-orange-400/30 blur-xl rounded-full scale-150" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Blow Button Trigger */}
      {!isBlown && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute -bottom-20"
        >
          <button
            onClick={onBlow}
            className="glass-2 px-6 py-2 rounded-full text-[10px] font-display uppercase tracking-widest text-deeprose hover:bg-hotpink hover:text-white transition-all"
          >
            Tap to Blow
          </button>
        </motion.div>
      )}
    </div>
  );
};

const HeroSection = ({ isBlown, onBlow }: { isBlown: boolean, onBlow: () => void }) => {
  return (
    <section className="h-screen flex flex-col items-center justify-center relative z-10">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
        className="text-center z-20"
      >
        <div className="relative">
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <Cake isBlown={isBlown} onBlow={onBlow} />
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export default function App() {
  const [showMain, setShowMain] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const attemptPlay = () => {
      if (audioRef.current && !isMuted) {
         audioRef.current.play().catch(e => console.log("Autoplay blocked. Need interaction."));
      }
    };
    attemptPlay();

    const handleFirstInteraction = () => {
      attemptPlay();
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
    };
    document.addEventListener('click', handleFirstInteraction);
    document.addEventListener('touchstart', handleFirstInteraction);

    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      if (isMuted) audioRef.current.pause();
      else audioRef.current.play().catch(e => console.log(e));
    }
  }, [isMuted]);

  return (
    <div className="relative">
      <audio ref={audioRef} src="/music/.love.mp3" loop />
      <AnimatePresence mode="wait">
        {!showMain ? (
          <motion.div key="envelope" exit={{ opacity: 0, scale: 1.1, filter: "blur(20px)" }} transition={{ duration: 1 }}>
            <EnvelopeSection onComplete={() => setShowMain(true)} />
          </motion.div>
        ) : (
          <motion.div key="main" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
            <MainExperience isMuted={isMuted} setIsMuted={setIsMuted} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
