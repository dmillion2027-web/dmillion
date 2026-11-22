import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function CustomCursor() {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [trail, setTrail] = useState([]);
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const pos = { x: e.clientX, y: e.clientY };
      setPosition(pos);
      setIsVisible(true);

      setTrail(prev => {
        const newTrail = [{ ...pos, id: `${Date.now()}-${Math.random().toString(36).slice(2)}` }, ...prev.slice(0, 6)];
        return newTrail;
      });
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    // Detect hoverable elements
    const handleElementHover = (e) => {
      const el = e.target;
      const isHoverable = el.tagName === 'BUTTON' ||
        el.tagName === 'A' ||
        el.tagName === 'INPUT' ||
        el.tagName === 'TEXTAREA' ||
        el.tagName === 'SELECT' ||
        el.closest('button') ||
        el.closest('a') ||
        el.classList.contains('cursor-pointer') ||
        el.closest('[role="button"]') ||
        window.getComputedStyle(el).cursor === 'pointer';
      setIsHovering(!!isHoverable);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousemove', handleElementHover);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousemove', handleElementHover);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, []);

  if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
    return null; // Don't show on touch devices
  }

  return (
    <>
      {/* Hide default cursor */}
      <style>{`* { cursor: none !important; }`}</style>

      {/* Trail particles */}
      <AnimatePresence>
        {isVisible && trail.map((point, index) => (
          <motion.div
            key={point.id}
            initial={{ opacity: 0.6, scale: 1 }}
            animate={{ opacity: 0, scale: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              left: point.x,
              top: point.y,
              pointerEvents: 'none',
              zIndex: 99998,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div
              style={{
                width: `${8 - index}px`,
                height: `${8 - index}px`,
                borderRadius: '50%',
                backgroundColor: `rgba(232, 213, 183, ${0.6 - index * 0.08})`,
              }}
            />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Outer ring */}
      {isVisible && (
        <motion.div
          animate={{
            x: position.x,
            y: position.y,
            scale: isHovering ? 1.8 : isClicking ? 0.8 : 1,
            opacity: isVisible ? 1 : 0,
          }}
          transition={{
            x: { type: 'spring', stiffness: 150, damping: 20, mass: 0.5 },
            y: { type: 'spring', stiffness: 150, damping: 20, mass: 0.5 },
            scale: { type: 'spring', stiffness: 300, damping: 20 },
          }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            pointerEvents: 'none',
            zIndex: 99999,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              border: `2px solid ${isHovering ? '#e8d5b7' : 'rgba(232, 213, 183, 0.6)'}`,
              backgroundColor: isHovering ? 'rgba(232, 213, 183, 0.1)' : 'transparent',
              transition: 'border-color 0.2s, background-color 0.2s',
            }}
          />
        </motion.div>
      )}

      {/* Inner dot */}
      {isVisible && (
        <motion.div
          animate={{
            x: position.x,
            y: position.y,
            scale: isClicking ? 2 : isHovering ? 0 : 1,
            opacity: isVisible ? 1 : 0,
          }}
          transition={{
            x: { type: 'spring', stiffness: 500, damping: 30, mass: 0.1 },
            y: { type: 'spring', stiffness: 500, damping: 30, mass: 0.1 },
            scale: { type: 'spring', stiffness: 400, damping: 20 },
          }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            pointerEvents: 'none',
            zIndex: 100000,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#e8d5b7',
            }}
          />
        </motion.div>
      )}
    </>
  );
}
