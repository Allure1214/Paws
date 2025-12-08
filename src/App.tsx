import { useEffect, useMemo, useRef, useState } from 'react';
import './index.css';
import { type CatItem } from './cats';

type SwipeDecision = 'like' | 'dislike';

// Generate a fresh batch of cats
const generateCats = (): CatItem[] => {
  const BASE = 'https://cataas.com/cat';
  return Array.from({ length: 16 }, (_, i) => ({
    id: `c${i}-${Date.now()}`, // unique id each reset
    url: `${BASE}?width=600&height=800&random=${Math.random()}`,
    alt: `Random cat ${i + 1}`,
  }));
};

function usePreload(urls: string[]) {
  const [loaded, setLoaded] = useState(0);
  useEffect(() => {
    let active = true;
    let count = 0;
    urls.forEach((u) => {
      const img = new Image();
      img.onload = () => { if (active) setLoaded(++count); };
      img.onerror = () => { if (active) setLoaded(++count); };
      img.src = u;
    });
    return () => { active = false; };
  }, [urls]);
  return loaded;
}

function TopCard({
  cat,
  onDecision,
  index,
}: {
  cat: CatItem;
  onDecision: (d: SwipeDecision) => void;
  index: number;
}) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const start = useRef<{ x: number; y: number } | null>(null);
  const current = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    let animatingOut = false;

    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      start.current = { x: t.clientX, y: t.clientY };
      current.current = { x: t.clientX, y: t.clientY };
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!start.current) return;
      const t = e.touches[0];
      current.current = { x: t.clientX, y: t.clientY };

      const dx = current.current.x - start.current.x;
      const dy = current.current.y - start.current.y * 0.2;
      const rot = Math.max(-12, Math.min(12, dx / 12));
      el.style.transform = `translate3d(${dx}px, ${dy}px, 0) rotate(${rot}deg)`;

      const likeBadge = el.querySelector<HTMLDivElement>('.badge.like');
      const dislikeBadge = el.querySelector<HTMLDivElement>('.badge.dislike');
      const intensity = Math.min(1, Math.abs(dx) / 120);
      if (likeBadge && dislikeBadge) {
        likeBadge.style.opacity = dx > 0 ? `${intensity}` : '0';
        dislikeBadge.style.opacity = dx < 0 ? `${intensity}` : '0';
      }
    };

    const flingOut = (dir: SwipeDecision) => {
      if (animatingOut) return;
      animatingOut = true;
      const offX = dir === 'like' ? window.innerWidth : -window.innerWidth;
      el.style.transition = 'transform 220ms cubic-bezier(0.22, 1, 0.36, 1)';
      el.style.transform = `translate3d(${offX}px, -40px, 0) rotate(${dir === 'like' ? 20 : -20}deg)`;
      setTimeout(() => onDecision(dir), 200);
    };

    const onTouchEnd = () => {
      if (!start.current || !current.current) return;
      const dx = current.current.x - start.current.x;
      const threshold = 120;
      if (dx > threshold) return flingOut('like');
      if (dx < -threshold) return flingOut('dislike');

      el.style.transition = 'transform 160ms ease';
      el.style.transform = 'translate3d(0,0,0)';
      setTimeout(() => { el.style.transition = ''; }, 160);
      start.current = null;
      current.current = null;
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: true });
    el.addEventListener('touchend', onTouchEnd);

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, [onDecision]);

  const handleButton = (dir: SwipeDecision) => {
    onDecision(dir);
  };

  
  const zIndex = 100 - index;

  return (
    <div className="card" ref={cardRef} style={{ zIndex }} aria-label={cat.alt}>
      <img src={cat.url} alt={cat.alt} loading="eager" />
      <div className="gradient" />
      <div className="badge like">LIKE</div>
      <div className="badge dislike">NOPE</div>
      <div style={{ position: 'absolute', bottom: 12, left: 12, right: 12, display: 'flex', gap: 8, justifyContent: 'space-between' }}>
        <button className="button dislike" onClick={() => handleButton('dislike')} aria-label="Dislike">Dislike</button>
        <button className="button like" onClick={() => handleButton('like')} aria-label="Like">Like</button>
      </div>
    </div>
  );
}

export default function App() {
  const [cats, setCats] = useState<CatItem[]>(generateCats());
  const [index, setIndex] = useState(0);
  const [liked, setLiked] = useState<string[]>([]);
  const [disliked, setDisliked] = useState<string[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const urls = useMemo(() => cats.map(c => c.url), [cats]);
  usePreload(urls);

  const onDecision = (d: SwipeDecision) => {
    const cat = cats[index];
    if (!cat) return;
    if (d === 'like') setLiked(prev => [...prev, cat.id]);
    else setDisliked(prev => [...prev, cat.id]);
    setIndex(i => i + 1);
  };

  const reset = () => {
    setCats(generateCats()); // regenerate cats
    setIndex(0);
    setLiked([]);
    setDisliked([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const likedCats: CatItem[] = useMemo(
    () => cats.filter(c => liked.includes(c.id)),
    [liked, cats]
  );

  return (
    <div className="app">
      <div className="header">Paws & Preferences
        <button className="theme-toggle" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
          {theme === 'dark' ? '🌞 Light Theme' : '🌙 Dark Theme'}
        </button>
      </div>
      {index < cats.length ? (
        <>
          <div className="footer">{index + 1} / {cats.length}</div>
          <div className="stack" role="group" aria-label="Swipe cat cards">
            {cats.slice(index).map((cat, i) => (
              <TopCard key={cat.id} cat={cat} onDecision={onDecision} index={i} />
            ))}
          </div>
        </>
      ) : (
        <div className="summary">
          <h2>You liked {liked.length} out of {cats.length}</h2>
          <div className="grid">
            {likedCats.map(c => (
              <img key={c.id} src={c.url} alt={c.alt} loading="lazy" />
            ))}
          </div>
        </div>
      )}
      {/* Floating reset button */}
      {index >= cats.length && (
        <button className="reset-button" onClick={reset}>↻</button>
      )}
      <div className="footer">Swipe right to like, left to dislike. Tap buttons if you prefer.</div>
    </div>
  );
}
