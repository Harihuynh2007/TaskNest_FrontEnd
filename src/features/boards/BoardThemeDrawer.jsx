import React, { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { Form, Button } from "react-bootstrap";
import { FaLock, FaUsers, FaGlobe, FaTimes, FaCheck } from "react-icons/fa";
import styled, { keyframes, css } from "styled-components";
import { AnimatePresence, motion } from "framer-motion";

// ==================== DESIGN TOKENS ====================
const tokens = {
  // Colors
  surface: {
    1: '#0f172a',
    2: '#1e293b',
    3: '#334155',
    4: '#475569',
  },
  brand: {
    primary: '#3b82f6',
    secondary: '#06b6d4',
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
  },
  text: {
    primary: '#f1f5f9',
    secondary: '#94a3b8',
    tertiary: '#64748b',
  },
  border: {
    subtle: 'rgba(148, 163, 184, 0.1)',
    default: 'rgba(148, 163, 184, 0.2)',
    strong: 'rgba(148, 163, 184, 0.3)',
  },
  shadow: {
    sm: '0 1px 3px rgba(0, 0, 0, 0.12)',
    md: '0 4px 12px rgba(0, 0, 0, 0.15)',
    lg: '0 12px 36px rgba(0, 0, 0, 0.25)',
    xl: '0 20px 48px rgba(0, 0, 0, 0.35)',
  },
  radius: {
    sm: '6px',
    md: '10px',
    lg: '14px',
    xl: '18px',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
  },
  transition: {
    fast: '0.15s cubic-bezier(0.4, 0, 0.2, 1)',
    base: '0.25s cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '0.35s cubic-bezier(0.4, 0, 0.2, 1)',
  },
};

// ==================== PRESET DATA ====================
const visibilityOptions = [
  {
    key: "private",
    label: "Private",
    icon: FaLock,
    description: "Only board members can see this board. Workspace admins can close or remove members.",
  },
  {
    key: "workspace",
    label: "Workspace",
    icon: FaUsers,
    description: "All workspace members can see and edit this board.",
  },
  {
    key: "public",
    label: "Public",
    icon: FaGlobe,
    description: "Anyone on the internet can view this board. Only members can edit.",
  },
];

const colorPresets = [
  { name: 'Ocean', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { name: 'Sunset', value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { name: 'Forest', value: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  { name: 'Peach', value: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
  { name: 'Sky', value: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)' },
  { name: 'Cherry', value: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)' },
];

const gradientPresets = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
  'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)',
  'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
];

const photoPresets = [
  'https://images.unsplash.com/photo-1557683316-973673baf926?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1520034475321-cbe63696469a?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1557682224-5b8590cd9ec5?w=800&h=450&fit=crop',
];

const defaultWeekPalette = ['#8E9AAF', '#58AFF6', '#6EE7B7', '#FBBF24', '#F472B6', '#A78BFA', '#F87171'];

// ==================== ANIMATIONS ====================
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideUp = keyframes`
  from { 
    opacity: 0;
    transform: translateY(20px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
`;

const scaleIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.96);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

// ==================== BACKDROP ====================
const Backdrop = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(4px);
  z-index: 9998;
  display: grid;
  place-items: center;
  padding: ${tokens.spacing.lg};
  
  @media (max-width: 768px) {
    padding: ${tokens.spacing.md};
  }
`;

// ==================== DRAWER STYLES ====================
const DrawerWrapper = styled(motion.div)`
  position: relative;
  width: min(420px, calc(100vw - 32px));
  max-height: calc(100vh - 80px);
  background: ${tokens.surface[2]};
  border: 1px solid ${tokens.border.default};
  border-radius: ${tokens.radius.xl};
  color: ${tokens.text.primary};
  box-shadow: ${tokens.shadow.xl};
  overflow: hidden;
  display: flex;
  flex-direction: column;
  
  @media (max-width: 768px) {
    width: calc(100vw - 24px);
    max-height: calc(100vh - 40px);
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${tokens.spacing.lg};
  font-weight: 700;
  font-size: 18px;
  border-bottom: 1px solid ${tokens.border.default};
  background: linear-gradient(180deg, 
    ${tokens.surface[2]} 0%, 
    ${tokens.surface[1]} 100%
  );
  flex-shrink: 0;
`;

const CloseBtn = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: ${tokens.surface[3]};
  color: ${tokens.text.secondary};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all ${tokens.transition.fast};
  
  &:hover {
    background: ${tokens.surface[4]};
    color: ${tokens.text.primary};
    transform: rotate(90deg);
  }
  
  &:active {
    transform: rotate(90deg) scale(0.95);
  }
`;

const ScrollContent = styled.div`
  padding: ${tokens.spacing.lg};
  overflow-y: auto;
  flex: 1;
  
  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${tokens.surface[1]};
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${tokens.surface[3]};
    border-radius: 4px;
    
    &:hover {
      background: ${tokens.surface[4]};
    }
  }
`;

const PreviewBox = styled.div`
  height: 120px;
  border-radius: ${tokens.radius.lg};
  color: white;
  font-weight: 700;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: ${tokens.spacing.xl};
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  position: relative;
  overflow: hidden;
  border: 1px solid ${tokens.border.subtle};
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.1) 0%,
      transparent 100%
    );
    pointer-events: none;
  }
  
  @media (max-width: 768px) {
    height: 100px;
    font-size: 14px;
  }
`;

const FormGroup = styled.div`
  margin-bottom: ${tokens.spacing.lg};
`;

const Label = styled.label`
  display: block;
  font-weight: 600;
  font-size: 14px;
  margin-bottom: ${tokens.spacing.sm};
  color: ${tokens.text.primary};
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 14px;
  background: ${tokens.surface[1]};
  border: 1px solid ${tokens.border.default};
  border-radius: ${tokens.radius.md};
  color: ${tokens.text.primary};
  font-size: 14px;
  transition: all ${tokens.transition.fast};
  
  &::placeholder {
    color: ${tokens.text.tertiary};
  }
  
  &:focus {
    outline: none;
    border-color: ${tokens.brand.primary};
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
  }
  
  ${props => props.$error && css`
    border-color: #ef4444;
    
    &:focus {
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15);
    }
  `}
`;

const Select = styled.select`
  width: 100%;
  padding: 12px 14px;
  background: ${tokens.surface[1]};
  border: 1px solid ${tokens.border.default};
  border-radius: ${tokens.radius.md};
  color: ${tokens.text.primary};
  font-size: 14px;
  cursor: pointer;
  transition: all ${tokens.transition.fast};
  
  &:focus {
    outline: none;
    border-color: ${tokens.brand.primary};
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Hint = styled.p`
  font-size: 13px;
  color: ${tokens.text.secondary};
  margin-top: ${tokens.spacing.sm};
  line-height: 1.5;
`;

const ErrorText = styled.div`
  color: #ef4444;
  font-size: 13px;
  margin-top: ${tokens.spacing.sm};
  display: flex;
  align-items: center;
  gap: ${tokens.spacing.xs};
`;

const SwitchRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${tokens.spacing.md};
  padding: ${tokens.spacing.md};
  background: ${tokens.surface[1]};
  border-radius: ${tokens.radius.md};
  margin-bottom: ${tokens.spacing.md};
`;

const SwitchLabel = styled.label`
  flex: 1;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  user-select: none;
`;

// ==================== COLOR PICKER ====================
const ColorPickerWrapper = styled.div`
  position: relative;
`;

const ScrollArea = styled.div`
  overflow-x: auto;
  padding: ${tokens.spacing.sm} 0;
  
  /* Hide scrollbar but keep functionality */
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const ColorRow = styled.div`
  display: flex;
  gap: ${tokens.spacing.sm};
  width: max-content;
`;

const ColorDot = styled.button`
  width: 48px;
  height: 40px;
  border-radius: ${tokens.radius.md};
  border: 2px solid ${props => props.$active ? tokens.brand.primary : 'transparent'};
  background: ${props => props.color};
  cursor: pointer;
  transition: all ${tokens.transition.fast};
  position: relative;
  overflow: hidden;
  
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.1);
    opacity: 0;
    transition: opacity ${tokens.transition.fast};
  }
  
  &:hover::after {
    opacity: 1;
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${tokens.shadow.md};
  }
  
  &:active {
    transform: translateY(0);
  }
  
  ${props => props.$active && css`
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2);
  `}
`;

const MoreButton = styled.button`
  width: 48px;
  height: 40px;
  border-radius: ${tokens.radius.md};
  background: ${tokens.surface[3]};
  color: ${tokens.text.primary};
  border: 1px solid ${tokens.border.default};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  cursor: pointer;
  transition: all ${tokens.transition.fast};
  
  &:hover {
    background: ${tokens.surface[4]};
    transform: translateY(-2px);
    box-shadow: ${tokens.shadow.md};
  }
  
  &:active {
    transform: translateY(0);
  }
`;

// ==================== WEEK PALETTE ====================
const WeekGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: ${tokens.spacing.sm};
  margin-top: ${tokens.spacing.md};
  
  @media (max-width: 480px) {
    grid-template-columns: repeat(4, 1fr);
  }
`;

const WeekCell = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${tokens.spacing.xs};
  padding: ${tokens.spacing.sm};
  background: ${tokens.surface[1]};
  border-radius: ${tokens.radius.md};
  border: 1px solid ${tokens.border.subtle};
`;

const WeekLabel = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: ${tokens.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const WeekColor = styled.input`
  width: 100%;
  height: 32px;
  border-radius: ${tokens.radius.sm};
  border: 1px solid ${tokens.border.default};
  cursor: pointer;
  
  &::-webkit-color-swatch-wrapper {
    padding: 0;
  }
  
  &::-webkit-color-swatch {
    border: none;
    border-radius: ${tokens.radius.sm};
  }
`;

// ==================== BACKGROUND POPUP ====================
const PopupWrapper = styled(motion.div)`
  position: fixed;
  width: min(360px, calc(100vw - 32px));
  max-height: calc(100vh - 100px);
  background: ${tokens.surface[2]};
  border: 1px solid ${tokens.border.default};
  border-radius: ${tokens.radius.lg};
  box-shadow: ${tokens.shadow.xl};
  padding: ${tokens.spacing.lg};
  z-index: 9999;
  color: ${tokens.text.primary};
  overflow-y: auto;
  
  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${tokens.surface[1]};
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${tokens.surface[3]};
    border-radius: 3px;
  }
`;

const PopupHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${tokens.spacing.lg};
  padding-bottom: ${tokens.spacing.md};
  border-bottom: 1px solid ${tokens.border.default};
`;

const PopupTitle = styled.h3`
  font-size: 16px;
  font-weight: 700;
  margin: 0;
`;

const PopupSection = styled.div`
  margin-bottom: ${tokens.spacing.xl};
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${tokens.spacing.md};
`;

const SectionTitle = styled.h4`
  font-size: 14px;
  font-weight: 600;
  margin: 0;
  color: ${tokens.text.primary};
`;

const ViewMoreLink = styled.button`
  background: none;
  border: none;
  font-size: 12px;
  color: ${tokens.brand.primary};
  cursor: pointer;
  text-decoration: underline;
  transition: color ${tokens.transition.fast};
  
  &:hover {
    color: ${tokens.brand.secondary};
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${tokens.spacing.sm};
`;

const ImageBox = styled.button`
  width: 100%;
  aspect-ratio: 16/9;
  border-radius: ${tokens.radius.md};
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  padding: 0;
  transition: all ${tokens.transition.fast};
  position: relative;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: all ${tokens.transition.fast};
  }
  
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.2);
    opacity: 0;
    transition: opacity ${tokens.transition.fast};
  }
  
  &:hover {
    transform: translateY(-2px);
    border-color: ${tokens.brand.primary};
    box-shadow: ${tokens.shadow.md};
    
    &::after {
      opacity: 1;
    }
    
    img {
      transform: scale(1.05);
    }
  }
`;

const ColorBox = styled.button`
  width: 100%;
  aspect-ratio: 1;
  border-radius: ${tokens.radius.md};
  border: 2px solid transparent;
  cursor: pointer;
  transition: all ${tokens.transition.fast};
  background: ${props => props.color};
  padding: 0;
  position: relative;
  overflow: hidden;
  
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.2) 0%,
      transparent 100%
    );
    opacity: 0;
    transition: opacity ${tokens.transition.fast};
  }
  
  &:hover {
    transform: scale(1.08);
    border-color: ${tokens.brand.primary};
    box-shadow: ${tokens.shadow.md};
    
    &::after {
      opacity: 1;
    }
  }
`;

const PrimaryButton = styled.button`
  width: 100%;
  padding: 14px;
  background: ${tokens.brand.gradient};
  color: white;
  border: none;
  border-radius: ${tokens.radius.md};
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
  transition: all ${tokens.transition.fast};
  box-shadow: ${tokens.shadow.md};
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.2) 0%,
      transparent 100%
    );
    opacity: 0;
    transition: opacity ${tokens.transition.fast};
  }
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: ${tokens.shadow.lg};
    
    &::before {
      opacity: 1;
    }
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// ==================== BACKGROUND POPUP COMPONENT ====================
function BoardBackgroundPopup({ onClose, onSelectBackground, anchorRef }) {
  const popupRef = useRef(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!anchorRef?.current) return;
    
    const updatePosition = () => {
      const rect = anchorRef.current.getBoundingClientRect();
      const spaceRight = window.innerWidth - rect.right;
      const spaceLeft = rect.left;
      
      let left, top;
      
      // Position to the right if there's space, otherwise to the left
      if (spaceRight > 380) {
        left = rect.right + 12;
      } else if (spaceLeft > 380) {
        left = rect.left - 372;
      } else {
        left = Math.max(16, (window.innerWidth - 360) / 2);
      }
      
      top = Math.max(16, rect.top + window.scrollY);
      
      setPosition({ top, left });
    };
    
    updatePosition();
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, [anchorRef]);

  useEffect(() => {
    const handleEsc = (e) => e.key === 'Escape' && onClose();
    const handleClick = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target) && 
          anchorRef.current && !anchorRef.current.contains(e.target)) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEsc);
    document.addEventListener('mousedown', handleClick);
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.removeEventListener('mousedown', handleClick);
    };
  }, [onClose, anchorRef]);

  const handleSelect = (bg) => {
    onSelectBackground(bg);
    onClose();
  };

  return (
    <PopupWrapper
      ref={popupRef}
      style={{ top: position.top, left: position.left }}
      initial={{ opacity: 0, scale: 0.95, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      <PopupHeader>
        <PopupTitle>Board background</PopupTitle>
        <CloseBtn onClick={onClose} aria-label="Close">
          <FaTimes size={14} />
        </CloseBtn>
      </PopupHeader>

      <PopupSection>
        <SectionHeader>
          <SectionTitle>Photos</SectionTitle>
          <ViewMoreLink onClick={() => window.open('https://unsplash.com', '_blank')}>
            View more
          </ViewMoreLink>
        </SectionHeader>
        <Grid>
          {photoPresets.map((src, i) => (
            <ImageBox key={i} onClick={() => handleSelect(`url(${src})`)}>
              <img src={src} alt={`Background ${i + 1}`} />
            </ImageBox>
          ))}
        </Grid>
      </PopupSection>

      <PopupSection>
        <SectionHeader>
          <SectionTitle>Colors</SectionTitle>
        </SectionHeader>
        <Grid>
          {gradientPresets.map((color, i) => (
            <ColorBox
              key={i}
              color={color}
              onClick={() => handleSelect(color)}
              aria-label={`Gradient preset ${i + 1}`}
            />
          ))}
        </Grid>
      </PopupSection>
    </PopupWrapper>
  );
}

// ==================== MAIN DRAWER COMPONENT ====================
export default function BoardThemeDrawer({ show, onClose, onCreate, isOwner = true }) {
  const [title, setTitle] = useState("");
  const [visibility, setVisibility] = useState("workspace");
  const [error, setError] = useState("");
  const [background, setBackground] = useState(colorPresets[0].value);
  const [autoWeekday, setAutoWeekday] = useState(false);
  const [weekPalette, setWeekPalette] = useState(defaultWeekPalette);
  const [showBgPopup, setShowBgPopup] = useState(false);
  
  const drawerRef = useRef();
  const moreButtonRef = useRef();

  const todayIndex = new Date().getDay();
  const resolvedBackground = useMemo(
    () => (autoWeekday ? weekPalette[todayIndex] : background),
    [autoWeekday, background, weekPalette, todayIndex]
  );

  // Persist theme preferences
  useEffect(() => {
    const state = { autoWeekday, weekPalette, background };
    localStorage.setItem("tasknest_board_theme", JSON.stringify(state));
  }, [autoWeekday, weekPalette, background]);

  // Load saved preferences
  useEffect(() => {
    try {
      const saved = localStorage.getItem("tasknest_board_theme");
      if (saved) {
        const state = JSON.parse(saved);
        if (state.autoWeekday !== undefined) setAutoWeekday(state.autoWeekday);
        if (state.weekPalette) setWeekPalette(state.weekPalette);
        if (state.background) setBackground(state.background);
      }
    } catch (e) {
      console.error('Failed to load theme preferences:', e);
    }
  }, []);

  // ESC key handler
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") {
        if (showBgPopup) {
          setShowBgPopup(false);
        } else {
          onClose();
        }
      }
    };
    if (show) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [show, showBgPopup, onClose]);

  const handleVisibilityChange = (value) => {
    if (value === "public") {
      const ok = window.confirm("This board will be public. Are you sure?");
      if (!ok) return;
    }
    setVisibility(value);
  };

  const handleCreate = () => {
    const trimmed = title.trim();
    if (!trimmed) {
      setError("Board title is required");
      return;
    }
    if (trimmed.length > 100) {
      setError("Title is too long (max 100 characters)");
      return;
    }

    onCreate({ 
      title: trimmed, 
      visibility, 
      background: resolvedBackground 
    });
    
    // Reset form
    setTitle("");
    setVisibility("workspace");
    setError("");
  };

  if (!show) return null;

  return createPortal(
    <AnimatePresence>
      <Backdrop
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => {
          if (e.target === e.currentTarget && !showBgPopup) {
            onClose();
          }
        }}
      >
        <DrawerWrapper
          ref={drawerRef}
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 15, scale: 0.97 }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          onClick={(e) => e.stopPropagation()}
        >
          <Header>
            <span>Create board</span>
            <CloseBtn onClick={onClose} aria-label="Close drawer">
              <FaTimes size={16} />
            </CloseBtn>
          </Header>

          <ScrollContent>
            {/* Preview */}
            <PreviewBox style={{ background: resolvedBackground }}>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                {title || 'Board Preview'}
              </motion.div>
            </PreviewBox>

            {/* Background Section */}
            <FormGroup>
              <Label>Background</Label>
              
              {/* Auto Weekday Toggle */}
              <SwitchRow>
                <Form.Check
                  type="switch"
                  id="auto-weekday-switch"
                  checked={autoWeekday}
                  onChange={(e) => setAutoWeekday(e.target.checked)}
                  style={{ marginRight: '8px' }}
                />
                <SwitchLabel htmlFor="auto-weekday-switch">
                  Auto change by weekday
                </SwitchLabel>
              </SwitchRow>
              
              {autoWeekday && (
                <Hint>
                  The board background uses today's color from the 7-day palette.
                </Hint>
              )}

              {/* Color Picker or Week Palette */}
              {!autoWeekday ? (
                <ColorPickerWrapper>
                  <ScrollArea>
                    <ColorRow>
                      {colorPresets.map((preset, idx) => (
                        <ColorDot
                          key={idx}
                          color={preset.value}
                          $active={background === preset.value}
                          onClick={() => setBackground(preset.value)}
                          aria-label={`Select ${preset.name} background`}
                          title={preset.name}
                        />
                      ))}
                      <MoreButton
                        ref={moreButtonRef}
                        onClick={() => setShowBgPopup(true)}
                        aria-label="More background options"
                        title="More options"
                      >
                        ⋯
                      </MoreButton>
                    </ColorRow>
                  </ScrollArea>
                </ColorPickerWrapper>
              ) : (
                <WeekGrid role="group" aria-label="Weekday color palette">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, i) => (
                    <WeekCell key={day}>
                      <WeekLabel>{day}</WeekLabel>
                      <WeekColor
                        type="color"
                        value={weekPalette[i]}
                        onChange={(e) => {
                          const next = [...weekPalette];
                          next[i] = e.target.value;
                          setWeekPalette(next);
                        }}
                        aria-label={`Select color for ${day}`}
                      />
                    </WeekCell>
                  ))}
                </WeekGrid>
              )}
            </FormGroup>

            {/* Board Title */}
            <FormGroup>
              <Label htmlFor="board-title">
                Board title <span style={{ color: '#ef4444' }}>*</span>
              </Label>
              <Input
                id="board-title"
                type="text"
                placeholder="e.g., Marketing Campaign"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setError("");
                }}
                $error={!!error}
                maxLength={100}
                aria-invalid={!!error}
                aria-describedby={error ? "title-error" : undefined}
              />
              {error && (
                <ErrorText id="title-error" role="alert">
                  <span>⚠️</span>
                  {error}
                </ErrorText>
              )}
              <Hint>
                {title.length}/100 characters
              </Hint>
            </FormGroup>

            {/* Visibility */}
            <FormGroup>
              <Label htmlFor="board-visibility">Visibility</Label>
              <Select
                id="board-visibility"
                value={visibility}
                onChange={(e) => handleVisibilityChange(e.target.value)}
                disabled={!isOwner}
                aria-label="Board visibility setting"
              >
                {visibilityOptions.map((opt) => (
                  <option key={opt.key} value={opt.key}>
                    {opt.label}
                  </option>
                ))}
              </Select>
              <Hint>
                {visibilityOptions.find((opt) => opt.key === visibility)?.description}
              </Hint>
            </FormGroup>

            {/* Create Button */}
            <PrimaryButton
              onClick={handleCreate}
              disabled={!title.trim()}
              aria-label="Create board"
            >
              Create board
            </PrimaryButton>
          </ScrollContent>
        </DrawerWrapper>

        {/* Background Popup - rendered via Portal */}
        <AnimatePresence>
          {showBgPopup && (
            <BoardBackgroundPopup
              onClose={() => setShowBgPopup(false)}
              onSelectBackground={setBackground}
              anchorRef={moreButtonRef}
            />
          )}
        </AnimatePresence>
      </Backdrop>
    </AnimatePresence>,
    document.body
  );
}