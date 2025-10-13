// src/components/InboxSubHeader.jsx
import React, { useId } from 'react';
import styled from 'styled-components';
import {
  MdOutlineFeedback,
  MdFilterList,
  MdMoreHoriz,
  MdInbox,
  MdCheckCircle,
} from 'react-icons/md';

/**
 * InboxSubHeader (Enhanced UX/UI)
 * - Premium dark theme with glassmorphism effects
 * - Smooth micro-animations and hover states
 * - Enhanced visual hierarchy and spacing
 * - Better contrast and accessibility
 * - Active state indicators for filter
 * - All original props and logic preserved
 */
export default function InboxSubHeader({
  setShowFeedback,
  setShowFilter,
  filterButtonRef,
  onOpenMenu,
  subtitle,
  count,
}) {
  const liveId = useId();

  return (
    <HeaderWrapper role="region" aria-label="Inbox toolbar">
      <GlowEffect />
      <Bar>
        <Left>
          <TitleGroup>
            <InboxIconWrapper>
              <MdInbox size={22} aria-hidden="true" focusable="false" />
            </InboxIconWrapper>
            <TitleWrapper>
              <Title aria-label="Inbox">Inbox</Title>
              {subtitle && (
                <SubtitleWrapper>
                  <SubtitleDot />
                  <Subtitle title={subtitle}>{subtitle}</Subtitle>
                </SubtitleWrapper>
              )}
            </TitleWrapper>
            {typeof count === 'number' && (
              <CountBadge aria-describedby={liveId}>
                <CountNumber>{count}</CountNumber>
              </CountBadge>
            )}
          </TitleGroup>
          <LiveStatus id={liveId} aria-live="polite">
            {typeof count === 'number' ? `${count} items` : ''}
          </LiveStatus>
        </Left>

        <Right>
          <IconButton
            type="button"
            title="Feedback"
            aria-label="Open feedback form"
            onClick={() => setShowFeedback?.(true)}
          >
            <MdOutlineFeedback size={20} />
            <ButtonRipple />
          </IconButton>

          <IconButton
            type="button"
            ref={filterButtonRef}
            title="Filter"
            aria-label="Toggle inbox filters"
            data-testid="inbox-filter-button"
            onClick={() => setShowFilter?.((prev) => !prev)}
            className="filter-btn"
          >
            <MdFilterList size={20} />
            <ButtonRipple />
          </IconButton>

          <IconButton
            type="button"
            title="More options"
            aria-label="More options"
            data-testid="inbox-menu-button"
            onClick={() => onOpenMenu?.()}
          >
            <MdMoreHoriz size={22} />
            <ButtonRipple />
          </IconButton>
        </Right>
      </Bar>
    </HeaderWrapper>
  );
}

// ===================== Enhanced Styles =====================

const HeaderWrapper = styled.div`
  position: sticky;
  z-index: 100;
  width: 100%;
  backdrop-filter: blur(12px) saturate(180%);
  background: linear-gradient(
    180deg,
    color-mix(in oklab, var(--surface-elev, #0f1216) 75%, transparent) 0%,
    color-mix(in oklab, var(--surface-elev, #0f1216) 65%, transparent) 100%
  );
  border-bottom: 1px solid color-mix(in oklab, var(--stroke, #2a2f38) 60%, transparent);
  box-shadow: 
    0 4px 6px -1px rgba(0, 0, 0, 0.12),
    0 2px 4px -1px rgba(0, 0, 0, 0.08);
  position: relative;
  overflow: hidden;

  /* Smooth entrance animation */
  animation: slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1);

  @keyframes slideDown {
    from {
      transform: translateY(-8px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  --inbox-subheader-h: 56px;
  min-height: var(--inbox-subheader-h);
  margin-bottom: 8px; /* tạo “đệm” để Add card không bị dính sát */
`;

const GlowEffect = styled.div`
  position: absolute;
  top: 0;
  left: 20%;
  right: 20%;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    color-mix(in oklab, var(--brand-primary, #4aa8ff) 40%, transparent) 50%,
    transparent 100%
  );
  filter: blur(8px);
  opacity: 0.6;
`;

const Bar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 60px;
  padding: 10px 20px;
  gap: 16px;

  @media (max-width: 640px) {
    padding: 8px 16px;
    min-height: 56px;
  }
`;

const Left = styled.div`
  display: flex;
  align-items: center;
  min-width: 0;
  flex: 1;
`;

const TitleGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--ds-text, #e6edf3);

  @media (max-width: 640px) {
    gap: 10px;
  }
`;

const InboxIconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(
    135deg,
    color-mix(in oklab, var(--brand-primary, #4aa8ff) 20%, transparent) 0%,
    color-mix(in oklab, var(--brand-primary, #4aa8ff) 10%, transparent) 100%
  );
  color: var(--brand-primary, #4aa8ff);
  box-shadow: 
    inset 0 1px 0 0 rgba(255, 255, 255, 0.1),
    0 1px 3px rgba(0, 0, 0, 0.2);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: scale(1.05);
    box-shadow: 
      inset 0 1px 0 0 rgba(255, 255, 255, 0.15),
      0 2px 6px rgba(74, 168, 255, 0.3);
  }

  @media (max-width: 640px) {
    width: 32px;
    height: 32px;
    border-radius: 8px;
  }
`;

const TitleWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.02em;
  background: linear-gradient(
    135deg,
    var(--ds-text, #e6edf3) 0%,
    color-mix(in oklab, var(--ds-text, #e6edf3) 85%, transparent) 100%
  );
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;

  @media (max-width: 640px) {
    font-size: 16px;
  }
`;

const SubtitleWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const SubtitleDot = styled.div`
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: var(--ds-subtle, #94a3b8);
  opacity: 0.5;
`;

const Subtitle = styled.span`
  color: var(--ds-subtle, #94a3b8);
  font-weight: 500;
  font-size: 14px;
  max-width: 30vw;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  transition: color 0.2s ease;

  &:hover {
    color: color-mix(in oklab, var(--ds-subtle, #94a3b8) 100%, #fff 30%);
  }

  @media (max-width: 640px) {
    font-size: 13px;
    max-width: 25vw;
  }
`;

const CountBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 26px;
  height: 26px;
  padding: 0 8px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  background: linear-gradient(
    135deg,
    color-mix(in oklab, var(--brand-primary, #4aa8ff) 25%, #000) 0%,
    color-mix(in oklab, var(--brand-primary, #4aa8ff) 15%, #000) 100%
  );
  color: var(--badge-fg, #eaf2ff);
  border: 1px solid color-mix(in oklab, var(--brand-primary, #4aa8ff) 35%, transparent);
  box-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  animation: fadeInScale 0.3s cubic-bezier(0.16, 1, 0.3, 1);

  &:hover {
    transform: scale(1.08);
    box-shadow: 
      0 3px 8px rgba(74, 168, 255, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.15);
  }

  @keyframes fadeInScale {
    from {
      opacity: 0;
      transform: scale(0.8);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  @media (max-width: 640px) {
    min-width: 24px;
    height: 24px;
    font-size: 11px;
    padding: 0 6px;
  }
`;

const CountNumber = styled.span`
  position: relative;
  z-index: 1;
`;

const LiveStatus = styled.span`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;

const Right = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;

  @media (max-width: 480px) {
    gap: 4px;
  }
`;

const ButtonRipple = styled.span`
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: radial-gradient(
    circle,
    color-mix(in oklab, var(--brand-primary, #4aa8ff) 30%, transparent) 0%,
    transparent 70%
  );
  opacity: 0;
  transform: scale(0);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
`;

const IconButton = styled.button`
  --btn-size: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--btn-size);
  height: var(--btn-size);
  border: none;
  border-radius: 10px;
  background: transparent;
  color: var(--ds-icon, #9aa4b2);
  cursor: pointer;
  outline: none;
  position: relative;
  overflow: hidden;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  /* Icon transition */
  svg {
    position: relative;
    z-index: 1;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }

  &:hover {
    color: var(--ds-text, #e6edf3);
    background: color-mix(in oklab, #ffffff 14%, transparent);
    box-shadow: 
      inset 0 1px 0 0 rgba(255, 255, 255, 0.1),
      0 2px 6px rgba(0, 0, 0, 0.15);
    transform: translateY(-1px);

    svg {
      transform: scale(1.1);
    }
  }

  &:active {
    transform: translateY(0) scale(0.96);
    
    ${ButtonRipple} {
      opacity: 1;
      transform: scale(1);
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }
  }

  &:focus-visible {
    outline: 2px solid var(--brand-primary, #4aa8ff);
    outline-offset: 2px;
    box-shadow: 
      0 0 0 4px color-mix(in oklab, var(--brand-primary, #4aa8ff) 20%, transparent),
      0 2px 6px rgba(0, 0, 0, 0.15);
  }

  /* Active state for filter button */
  &.filter-btn[aria-expanded="true"] {
    background: color-mix(in oklab, var(--brand-primary, #4aa8ff) 18%, transparent);
    color: var(--brand-primary, #4aa8ff);
    box-shadow: 
      inset 0 1px 0 0 rgba(255, 255, 255, 0.1),
      0 2px 6px rgba(74, 168, 255, 0.25);
  }

  @media (max-width: 480px) {
    --btn-size: 32px;
    border-radius: 8px;

    svg {
      width: 18px;
      height: 18px;
    }
  }

  @media (max-width: 360px) {
    --btn-size: 30px;
  }
`;