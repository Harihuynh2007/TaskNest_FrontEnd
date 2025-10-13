import { useEffect, useState } from 'react';

export default function useInboxThemeColor(initialColor) {
  const defaultColor = initialColor || '#171c26'; 
  const [inboxColor, setInboxColor] = useState(() => {
    return localStorage.getItem('inbox_theme_color') || defaultColor;
  });

  const [previewColor, setPreviewColor] = useState(null);

  const effectiveColor = previewColor || inboxColor;

  const applyPreview = (color) => setPreviewColor(color);
  const clearPreview = () => setPreviewColor(null);

  const saveInboxColor = (color) => {
    setInboxColor(color);
    localStorage.setItem('inbox_theme_color', color);
    window.dispatchEvent(new CustomEvent('inbox-theme-change', { detail: color }));
  };

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'inbox_theme_color') setInboxColor(e.newValue || defaultColor);
    };
    const onBus = (e) => { if (e.detail) setInboxColor(e.detail); };
    window.addEventListener('storage', onStorage);
    window.addEventListener('inbox-theme-change', onBus);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('inbox-theme-change', onBus);
    };
  }, []);

  return {
    inboxColor,
    previewColor,
    effectiveColor,
    setInboxColor: saveInboxColor,
    applyPreview,
    clearPreview,
  };
}
