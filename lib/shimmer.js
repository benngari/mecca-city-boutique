// Generates a small animated shimmer SVG as a base64 data URI, used as
// next/image's blurDataURL so product photos fade in smoothly instead of
// popping in abruptly once loaded.
function shimmer(w, h) {
  return `
<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#1e293b" offset="20%" />
      <stop stop-color="#334155" offset="50%" />
      <stop stop-color="#1e293b" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#1e293b" />
  <rect width="${w}" height="${h}" fill="url(#g)" />
</svg>`;
}

function toBase64(str) {
  if (typeof window === 'undefined') {
    return Buffer.from(str).toString('base64');
  }
  return window.btoa(str);
}

export function shimmerDataUrl(w = 400, h = 500) {
  return `data:image/svg+xml;base64,${toBase64(shimmer(w, h))}`;
}
