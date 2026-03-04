import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence, type PanInfo } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DealCard } from './DealCard';
import type { SponsoredPost, DealStatus } from '../../types';

interface DealCarouselProps {
  deals: SponsoredPost[];
}

const SWIPE_THRESHOLD = 80;

export const DealCarousel: React.FC<DealCarouselProps> = ({ deals: initialDeals }) => {
  const [deals, setDeals] = useState(initialDeals);
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [dragX, setDragX] = useState(0);

  const updateStatus = useCallback((id: string, status: DealStatus) => {
    setDeals(prev => prev.map(d => d.id === id ? { ...d, status } : d));
  }, []);

  const handleAccept = useCallback((id: string) => {
    updateStatus(id, 'accepted');
    setDirection(1);
    setCurrent(prev => Math.min(prev + 1, deals.length - 1));
  }, [updateStatus, deals.length]);

  const handleReject = useCallback((id: string) => {
    updateStatus(id, 'rejected');
    setDirection(1);
    setCurrent(prev => Math.min(prev + 1, deals.length - 1));
  }, [updateStatus, deals.length]);

  const goTo = useCallback((idx: number) => {
    setDirection(idx > current ? 1 : -1);
    setCurrent(idx);
  }, [current]);

  const handleDragEnd = useCallback((_: unknown, info: PanInfo) => {
    setDragX(0);
    if (info.offset.x < -SWIPE_THRESHOLD && current < deals.length - 1) {
      setDirection(1);
      setCurrent(c => c + 1);
    } else if (info.offset.x > SWIPE_THRESHOLD && current > 0) {
      setDirection(-1);
      setCurrent(c => c - 1);
    }
  }, [current, deals.length]);

  const deal = deals[current];
  if (!deal) return null;

  const variants = {
    enter: (dir: number) => ({ x: dir * 340, opacity: 0, scale: 0.92 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (dir: number) => ({ x: dir * -340, opacity: 0, scale: 0.92 }),
  };

  return (
    <div className="deal-carousel">
      <div className="deal-carousel__header">
        <h2 className="card__title">Brand Deals</h2>
        <span className="deal-carousel__count">
          {current + 1} / {deals.length}
        </span>
      </div>

      <div className="deal-carousel__hint" data-drag={dragX < -20 ? 'left' : dragX > 20 ? 'right' : 'idle'}>
        {dragX < -20 ? '← Pass' : dragX > 20 ? 'Accept →' : 'Swipe to decide'}
      </div>

      <div className="deal-carousel__track">
        <AnimatePresence custom={direction} mode="popLayout">
          <motion.div
            key={deal.id}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            drag="x"
            dragConstraints={{ left: -200, right: 200 }}
            dragElastic={0.2}
            onDrag={(_, info) => setDragX(info.offset.x)}
            onDragEnd={handleDragEnd}
            className="deal-carousel__card-wrapper"
            whileTap={{ cursor: 'grabbing' }}
          >
            <DealCard
              deal={deal}
              onAccept={handleAccept}
              onReject={handleReject}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dot + arrow navigation */}
      <div className="deal-carousel__nav">
        <button
          className="carousel-nav-btn"
          onClick={() => goTo(Math.max(0, current - 1))}
          disabled={current === 0}
          aria-label="Previous deal"
        >
          <ChevronLeft size={18} />
        </button>

        <div className="carousel-dots">
          {deals.map((d, i) => (
            <button
              key={d.id}
              className={`carousel-dot ${i === current ? 'carousel-dot--active' : ''}`}
              data-status={d.status}
              onClick={() => goTo(i)}
              aria-label={`Go to deal ${i + 1}`}
            />
          ))}
        </div>

        <button
          className="carousel-nav-btn"
          onClick={() => goTo(Math.min(deals.length - 1, current + 1))}
          disabled={current === deals.length - 1}
          aria-label="Next deal"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};
