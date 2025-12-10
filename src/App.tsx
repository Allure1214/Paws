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
  const [loaded, setLoaded] = useState(false);
  let animatingOut = false;

  const flingOut = (dir: SwipeDecision) => {
    const el = cardRef.current;
    if (!el || animatingOut) return;
    animatingOut = true;
    if (dir === 'like') {
      el.classList.add('swipe-right');
    } else {
      el.classList.add('swipe-left');
    }
    setTimeout(() => {
      el.classList.remove('swipe-right', 'swipe-left');
      onDecision(dir);
    }, 350);
  };

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

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
    flingOut(dir);
  };

  const zIndex = 100 - index;

  return (
    <div className="card" ref={cardRef} style={{ zIndex }} aria-label={cat.alt}>
      {!loaded && <div className="loader">🐾 Loading...</div>}
      <img
        src={cat.url}
        alt={cat.alt}
        loading="eager"
        onLoad={() => setLoaded(true)}
        style={{ display: loaded ? 'block' : 'none' }}
      />
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
  const [, setDisliked] = useState<string[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [collapsed, setCollapsed] = useState(true);
  const [selectedCat, setSelectedCat] = useState<CatItem | null>(null);

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

  // ESC + Arrow key navigation for modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedCat) return;
      if (e.key === 'Escape') {
        setSelectedCat(null);
      }
      if (e.key === 'ArrowRight') {
        const idx = likedCats.findIndex(c => c.id === selectedCat.id);
        if (idx < likedCats.length - 1) setSelectedCat(likedCats[idx + 1]);
      }
      if (e.key === 'ArrowLeft') {
        const idx = likedCats.findIndex(c => c.id === selectedCat.id);
        if (idx > 0) setSelectedCat(likedCats[idx - 1]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCat, likedCats]);

  return (
    <div className="app">
      <div className="header">Paws & Preferences
        <button className="theme-toggle" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
          {theme === 'dark' ? '🌞 Switch to Light' : '🌙 Switch to Dark'}
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
          <div className="footer mobile">
            Swipe right to like, left to dislike. Tap buttons if you prefer.
          </div>
                    <div className="footer desktop">
            Use the Like / Dislike buttons below to choose your cats.
          </div>
        </>
      ) : (
        <div className="summary">
          <h2>You liked {liked.length} out of {cats.length}</h2>

          <div className="grid">
            {(collapsed && likedCats.length > 4 ? likedCats.slice(0, 4) : likedCats).map(c => (
              <div key={c.id} className="cat-card">
                <img
                  src={c.url}
                  alt={c.alt}
                  loading="lazy"
                  onClick={() => setSelectedCat(c)} // open modal
                  style={{ cursor: 'pointer' }}
                />
              </div>
            ))}
          </div>

          {likedCats.length > 6 && (
            <button
              className="button"
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? 'Show all liked cats' : 'Collapse list'}
            </button>
          )}

          <button className="button" onClick={reset}>Start over</button>
        </div>
      )}

      {/* Modal for selected cat */}
      {selectedCat && (
        <div className="modal-overlay" onClick={() => setSelectedCat(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-content">
              <img src={selectedCat.url} alt={selectedCat.alt} />
            </div>
            <div className="modal-actions">
              <button className="button" onClick={() => setSelectedCat(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}