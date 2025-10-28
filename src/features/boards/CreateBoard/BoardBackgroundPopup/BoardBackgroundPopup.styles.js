import styled from 'styled-components';

/* ================================
   🎨 Popup Container
================================ */
export const Popup = styled.div`
  position: fixed;
  width: 340px;
  max-height: 80vh;
  background: #0f172a; /* Dark premium surface */
  border: 1px solid rgba(148, 163, 184, 0.15);
  border-radius: 14px;
  box-shadow: 0 20px 48px rgba(0, 0, 0, 0.4);
  padding: 16px;
  color: #f1f5f9;
  overflow-y: auto;
  z-index: 2000;
  animation: fadeSlideIn 0.2s ease-out;

  @keyframes fadeSlideIn {
    from {
      opacity: 0;
      transform: translateY(-8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-thumb {
    background: #334155;
    border-radius: 4px;
  }
`;

/* ================================
   🧭 Header
================================ */
export const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 12px;
  margin-bottom: 16px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.2);
`;

export const Title = styled.h3`
  font-size: 16px;
  font-weight: 700;
  margin: 0;
  color: #f8fafc;
`;

export const CloseBtn = styled.button`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  background: #1e293b;
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%);
    color: white;
    transform: rotate(90deg);
  }

  &:focus-visible {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
  }
`;

/* ================================
   🗂 Section
================================ */
export const Section = styled.div`
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
`;

export const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

export const SectionTitle = styled.h4`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #e2e8f0;
  margin: 0;
`;

export const ViewMore = styled.button`
  background: none;
  border: none;
  color: #3b82f6;
  font-size: 12px;
  cursor: pointer;
  text-decoration: underline;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: color 0.2s;

  &:hover {
    color: #06b6d4;
  }

  &:focus-visible {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
  }
`;

/* ================================
   🧱 Grid Layout
================================ */
export const Grid = styled.div`
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(3, 1fr);

  @media (max-width: 480px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

/* ================================
   🖼 Photo Item
================================ */
export const ImageBox = styled.button`
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid transparent;
  cursor: pointer;
  position: relative;
  transition: all 0.25s ease;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.25s ease;
  }

  &:hover {
    transform: translateY(-3px);
    border-color: #3b82f6;
  }

  &:hover img {
    transform: scale(1.05);
  }

  &:focus-visible {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
  }
`;

/* ================================
   🎨 Gradient Item
================================ */
export const ColorBox = styled.button`
  width: 100%;
  aspect-ratio: 1;
  border-radius: 8px;
  border: 2px solid transparent;
  background: ${({ $color }) => $color};
  cursor: pointer;
  position: relative;
  transition: all 0.25s ease;

  &:hover {
    transform: scale(1.07);
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
  }

  &:focus-visible {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
  }
`;

export const ColorLabel = styled.div`
  position: absolute;
  bottom: 6px;
  left: 6px;
  right: 6px;
  background: rgba(0, 0, 0, 0.75);
  color: #f1f5f9;
  font-size: 10px;
  padding: 3px 6px;
  border-radius: 4px;
  text-align: center;
  opacity: 0;
  transform: translateY(4px);
  transition: all 0.25s ease;
  pointer-events: none;

  ${ColorBox}:hover & {
    opacity: 1;
    transform: translateY(0);
  }
`;

export const PopupHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 16px 0 12px 0;
`;

export const PopupTitle = styled.h4`
  font-size: 15px;
  font-weight: 700;
  color: #f8fafc;
  margin: 0;
`;

export const PopupSection = styled.div`
  margin-bottom: 20px;
`;

export const ViewMoreLink = styled.button`
  background: none;
  border: none;
  color: #3b82f6;
  font-size: 12px;
  cursor: pointer;
  text-decoration: underline;
  &:hover { color: #06b6d4; }
`;

export const BackButton = styled.button`
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 13px;
  cursor: pointer;
  &:hover { color: #f1f5f9; }
`;

export const Divider = styled.div`
  width: 100%;
  height: 1px;
  background: rgba(148, 163, 184, 0.2);
  margin: 12px 0;
`;
