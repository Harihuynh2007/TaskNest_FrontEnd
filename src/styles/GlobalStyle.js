// src/styles/GlobalStyle.js
import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  /* ===== GlobalStyle.js - Styled Components Global Styles ===== */
  /* Note: Most tokens and base styles are in separate CSS files */
  /* This file is for styled-components specific global styles only */

  /* ===== Brand & Header Styles (Styled-components specific) ===== */
  
  .tn-brand {
    display: inline-flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius-lg);
    border: 1px solid transparent;
    background: transparent;
    color: var(--header-text);
    font-weight: 700;
    letter-spacing: 0.2px;
    transition: all var(--transition-base);
    text-decoration: none;
  }
  
  .tn-brand:hover {
    background-color: var(--header-hover);
    border-color: var(--header-border);
    color: var(--header-text);
  }
  
  .tn-brand:active {
    transform: scale(0.98);
  }

  .tn-brand-glyph {
    width: 18px;
    height: 18px;
    border-radius: var(--radius-sm);
    background: var(--brand-gradient);
    display: inline-block;
  }
  
  .tn-brand-text {
    font-size: 15px;
    line-height: 1;
    user-select: none;
  }
  
  .tn-ws-badge.badge {
    border: 1px solid var(--header-border);
    background: var(--header-bg-elevated) !important;
    color: var(--header-text-muted) !important;
    font-weight: 600;
    padding: var(--space-1) var(--space-2);
    border-radius: var(--radius-full);
  }

  /* ===== Header Specific Styles ===== */
  
  .tn-header.navbar {
    background-color: var(--header-bg) !important;
    border-bottom: 1px solid var(--header-border);
    height: var(--header-height);
    min-height: var(--header-height);
    z-index: var(--z-sticky);
  }

  /* Apply backdrop-filter only if supported */
  @supports (backdrop-filter: blur(8px)) or (-webkit-backdrop-filter: blur(8px)) {
    .tn-header.navbar {
      background-color: rgba(18, 23, 37, 0.95) !important;
      backdrop-filter: saturate(120%) blur(8px);
      -webkit-backdrop-filter: saturate(120%) blur(8px);
    }
  }

  .tn-header .navbar-nav {
    gap: var(--space-2);
  }

  /* ===== Apps Trigger ===== */
  
  .tn-apps-trigger {
    color: var(--header-text-muted);
    transition: color var(--transition-base);
  }
  
  .tn-apps-trigger:hover {
    color: var(--header-text);
  }

  /* ===== Workspace Selector ===== */

  .workspace-selector {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius-md);
    background: transparent;
    border: 1px solid transparent;
    color: var(--header-text);
    transition: all var(--transition-base);
    cursor: pointer;
  }

  .workspace-selector:hover {
    background: var(--header-hover);
    border-color: var(--header-border);
  }

  .workspace-selector:active {
    transform: scale(0.98);
  }

  .workspace-icon {
    width: 24px;
    height: 24px;
    border-radius: var(--radius-sm);
    background: var(--brand-gradient);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 700;
    color: white;
  }

  /* ===== Layout Helpers ===== */

  .content-wrapper {
    min-height: calc(100vh - var(--header-height));
    background: var(--surface-base);
  }

  .main-content {
    max-width: var(--max-content-width);
    margin: 0 auto;
    padding: var(--space-6);
  }

  /* ===== Animation Utilities ===== */

  @keyframes shimmer {
    0% {
      background-position: -1000px 0;
    }
    100% {
      background-position: 1000px 0;
    }
  }

  .skeleton {
    background: linear-gradient(
      90deg,
      var(--surface-raised) 0%,
      var(--surface-hover) 50%,
      var(--surface-raised) 100%
    );
    background-size: 1000px 100%;
    animation: shimmer 2s infinite;
    border-radius: var(--radius-md);
  }

  /* ===== Focus Trap ===== */

  .focus-trap:focus-within {
    outline: 2px solid var(--state-focus);
    outline-offset: 2px;
  }

  /* ===== Styled-components Theme Integration ===== */

  ${props => props.theme && `
    /* Theme-aware styles from styled-components theme */
    --theme-primary: ${props.theme.primary};
    --theme-secondary: ${props.theme.secondary};
  `}
`;