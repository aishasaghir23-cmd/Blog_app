import React from 'react';

export default function Gallery({ images, onSelect, onDelete }) {
  if (!images.length) {
    return <p className="no-images">No images uploaded yet.</p>;
  }

  return (
    <div className="gallery-grid">
      {images.map((img, index) => (
        <div key={img._id} className="gallery-card">
          <img
            src={img.imageUrl}
            alt="Gallery item"
            onClick={() => onSelect(index)}
          />
          <div className="card-footer">
            <small>{new Date(img.createdAt).toLocaleDateString()}</small>
            <button
              className="delete-btn"
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm('Delete this image?')) {
                  onDelete(img._id);
                }
              }}
            >
              🗑️
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}