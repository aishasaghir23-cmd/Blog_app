import React, { useEffect } from 'react';

export default function Viewer({ images, currentIndex, onClose, onPrev, onNext, onDelete }) {
  const currentImg = images[currentIndex];

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onPrev, onNext]);

  if (!currentImg) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>&times;</button>

        <div className="slider-wrapper">
          <button className="nav-btn prev" onClick={onPrev}>&#10094;</button>
          <img src={currentImg.imageUrl} alt="Enlarged view" />
          <button className="nav-btn next" onClick={onNext}>&#10095;</button>
        </div>

        <div className="modal-footer">
          <span>Image {currentIndex + 1} of {images.length}</span>
          <button
            className="delete-btn"
            onClick={() => {
              if (window.confirm('Delete this image?')) {
                onDelete(currentImg._id);
              }
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}