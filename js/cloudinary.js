/**
 * Knot & Thread Tales — Cloudinary Helper
 */
const CloudinaryImg = (() => {
  function isCloudinaryAsset(publicIdOrUrl) {
    return typeof publicIdOrUrl === 'string' && !publicIdOrUrl.startsWith('http');
  }

  function url(publicIdOrUrl, { width = null, height = null, crop = 'fill', gravity = 'auto', quality = 'auto', format = 'auto', dpr = 'auto' } = {}) {
    if (!publicIdOrUrl) return '';
    if (!isCloudinaryAsset(publicIdOrUrl)) return publicIdOrUrl;

    const transforms = [`f_${format}`, `q_${quality}`, `dpr_${dpr}`];
    if (width) transforms.push(`w_${width}`);
    if (height) transforms.push(`h_${height}`);
    if (width || height) transforms.push(`c_${crop}`, `g_${gravity}`);

    return `${CONFIG.CLOUDINARY_BASE()}/${transforms.join(',')}/${publicIdOrUrl}`;
  }

  function srcset(publicIdOrUrl, widths = [320, 480, 640, 768, 1024, 1280, 1600]) {
    if (!isCloudinaryAsset(publicIdOrUrl)) return '';
    return widths
      .map((w) => `${url(publicIdOrUrl, { width: w })} ${w}w`)
      .join(', ');
  }

  function thumb(publicIdOrUrl, size = 400) {
    return url(publicIdOrUrl, { width: size, height: size, crop: 'fill' });
  }

  function placeholder(publicIdOrUrl) {
    if (!isCloudinaryAsset(publicIdOrUrl)) return publicIdOrUrl;
    return url(publicIdOrUrl, { width: 24, quality: 30 });
  }

  return { url, srcset, thumb, placeholder };
})();
