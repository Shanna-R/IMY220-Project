function Image({ src, alt = 'Post image' }) {
  if(!src) {
    return (
      <div className="post-image-placeholder">
        🏕️
      </div>
    );
  }

  return (
    <img
      className="post-image"
      src={src}
      alt={alt}
    />
  );
}

export default Image;