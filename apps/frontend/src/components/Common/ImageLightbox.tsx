import { useEffect } from 'react';

interface ImageLightboxProps {
  imageUrl: string;
  onClose: () => void;
  allImages?: string[];
  currentIndex?: number;
  onNavigate?: (direction: 'prev' | 'next') => void;
}

export function ImageLightbox({ imageUrl, onClose, allImages = [], currentIndex = 0, onNavigate }: ImageLightboxProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && onNavigate && currentIndex > 0) onNavigate('prev');
      if (e.key === 'ArrowRight' && onNavigate && currentIndex < allImages.length - 1) onNavigate('next');
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [onClose, onNavigate, currentIndex, allImages.length]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Image Container - Centered */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <img
          src={imageUrl}
          alt="Full size preview"
          onClick={(e) => e.stopPropagation()}
          className="max-w-full max-h-full object-contain rounded-lg shadow-2xl border-2 border-accent-primary/50"
        />
      </div>

      {/* Close button */}
      <button
        onClick={onClose}
        className="fixed top-6 right-6 p-3 text-white hover:text-accent-primary transition-colors rounded-full hover:bg-white/10 z-10"
        title="Close (Esc)"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Navigation arrows */}
      {allImages.length > 1 && onNavigate && (
        <>
          {currentIndex > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onNavigate('prev');
              }}
              className="fixed left-6 top-1/2 -translate-y-1/2 p-3 text-white hover:text-accent-primary transition-colors rounded-full hover:bg-white/10 z-10"
              title="Previous (←)"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          {currentIndex < allImages.length - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onNavigate('next');
              }}
              className="fixed right-6 top-1/2 -translate-y-1/2 p-3 text-white hover:text-accent-primary transition-colors rounded-full hover:bg-white/10 z-10"
              title="Next (→)"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </>
      )}

      {/* Image counter */}
      {allImages.length > 1 && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/60 backdrop-blur-sm text-white rounded-full text-sm font-mono z-10">
          {currentIndex + 1} / {allImages.length}
        </div>
      )}
    </div>
  );
}
