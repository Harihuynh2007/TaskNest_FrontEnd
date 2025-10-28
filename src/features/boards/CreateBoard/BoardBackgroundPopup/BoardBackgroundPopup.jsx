import React, { useEffect, useRef, useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import {
  Popup,
  PopupHeader,
  PopupTitle,
  CloseBtn,
  PopupSection,
  SectionHeader,
  SectionTitle,
  ViewMoreLink,
  Grid,
  ImageBox,
  ColorBox,
  ColorLabel,
  BackButton,
  Divider,
} from './BoardBackgroundPopup.styles';
import {
  PHOTO_PRESETS as photoPresets,
  GRADIENT_PRESETS as gradientPresets,
  FLAT_PRESETS as flatPresets,
} from './BoardBackgroundPopup.presets';

/**
 * Popup chọn background cho Board
 * - Nằm bên phải Drawer
 * - Có chế độ "View more" mở rộng màu sắc
 */
export default function BoardBackgroundPopup({ onClose, onSelectBackground, anchorRef }) {
  const popupRef = useRef(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [viewMode, setViewMode] = useState('basic'); // 'basic' | 'extended'

  // ====================== 🧭 Tính vị trí popup (bên phải Drawer) ======================
  useEffect(() => {
    if (!anchorRef?.current) return;

    const updatePosition = () => {
      const rect = anchorRef.current.getBoundingClientRect();
      const popupWidth = 360;
      const popupHeight = popupRef.current?.offsetHeight || 400;
      const margin = 12;

      // 🔹 Vị trí cố định theo viewport
      let top = Math.max(16, rect.top);
      let left = rect.right + margin;

      // 🔹 Nếu tràn phải → ép sang trái
      if (left + popupWidth > window.innerWidth - margin) {
        left = Math.max(16, rect.left - popupWidth - margin);
      }
      // 🔹 Nếu tràn dưới → đẩy lên trên
      if (top + popupHeight > window.innerHeight - margin) {
        top = Math.max(16, window.innerHeight - popupHeight - margin);
      }

      setPosition({ top, left });
    };

    // Gọi ban đầu
    updatePosition();

    // Cập nhật khi resize hoặc Drawer reflow
    window.addEventListener('resize', updatePosition);
    const observer = new ResizeObserver(updatePosition);
    observer.observe(document.body);

    return () => {
      window.removeEventListener('resize', updatePosition);
      observer.disconnect();
    };
  }, [anchorRef]);


  // ====================== ⌨️ ESC + Click outside ======================
  useEffect(() => {
    const handleEsc = (e) => e.key === 'Escape' && onClose?.();
    const handleClick = (e) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(e.target) &&
        !anchorRef?.current?.contains(e.target)
      ) {
        onClose?.();
      }
    };
    document.addEventListener('keydown', handleEsc);
    document.addEventListener('mousedown', handleClick);
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.removeEventListener('mousedown', handleClick);
    };
  }, [onClose, anchorRef]);

  // ====================== 🎨 Chọn màu / ảnh ======================
  const handleSelect = (value) => {
    onSelectBackground?.(value);
    onClose?.();
  };

  // ====================== 🧱 Render ======================
  return (
    <Popup
      ref={popupRef}
      style={{ top: position.top, left: position.left }}
      initial={{ opacity: 0, scale: 0.95, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      <PopupHeader>
        {viewMode === 'extended' ? (
          <>
            <BackButton onClick={() => setViewMode('basic')}>← Back</BackButton>
            <PopupTitle>All colors</PopupTitle>
            <CloseBtn onClick={onClose}>
              <FaTimes size={14} />
            </CloseBtn>
          </>
        ) : (
          <>
            <PopupTitle>Board background</PopupTitle>
            <CloseBtn onClick={onClose}>
              <FaTimes size={14} />
            </CloseBtn>
          </>
        )}
      </PopupHeader>

      {viewMode === 'basic' ? (
        <>
          {/* Photos Section */}
          <PopupSection>
            <SectionHeader>
              <SectionTitle>Photos</SectionTitle>
              <ViewMoreLink onClick={() => window.open('https://unsplash.com', '_blank')}>
                View more
              </ViewMoreLink>
            </SectionHeader>
            <Grid>
              {photoPresets.slice(0, 6).map((src, i) => (
                <ImageBox key={i} onClick={() => handleSelect(`url(${src})`)}>
                  <img src={src} alt={`Photo ${i + 1}`} />
                </ImageBox>
              ))}
            </Grid>
          </PopupSection>

          {/* Colors Section */}
          <PopupSection>
            <SectionHeader>
              <SectionTitle>Colors</SectionTitle>
              <ViewMoreLink onClick={() => setViewMode('extended')}>View more</ViewMoreLink>
            </SectionHeader>
            <Grid>
              {gradientPresets.slice(0, 9).map((g, i) => (
                <ColorBox
                  key={i}
                  $color={g.value}
                  onClick={() => handleSelect(g.value)}
                  title={g.name}
                >
                  <ColorLabel>{g.name}</ColorLabel>
                </ColorBox>
              ))}
            </Grid>
          </PopupSection>
        </>
      ) : (
        <>
          {/* Extended Color Palette */}
          <PopupSection>
            <SectionHeader>
              <SectionTitle>All Gradients</SectionTitle>
            </SectionHeader>
            <Grid>
              {gradientPresets.map((g, i) => (
                <ColorBox
                  key={i}
                  $color={g.value}
                  onClick={() => handleSelect(g.value)}
                  title={g.name}
                >
                  <ColorLabel>{g.name}</ColorLabel>
                </ColorBox>
              ))}
            </Grid>
          </PopupSection>

          <Divider />

          <PopupSection>
            <SectionHeader>
              <SectionTitle>Flat Colors</SectionTitle>
            </SectionHeader>
            <Grid>
              {flatPresets.map((c, i) => (
                <ColorBox
                  key={i}
                  $color={c}
                  onClick={() => handleSelect(c)}
                  title={c}
                />
              ))}
            </Grid>
          </PopupSection>
        </>
      )}
    </Popup>
  );
}
