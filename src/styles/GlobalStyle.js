// src/styles/GlobalStyle.js
import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  /* ======= Design Tokens (default = Dark) ======= */
  :root {
    /* Header */
    --header-height: 56px;               /* đã khai báo ở App.css nhưng giữ ở đây để đồng bộ theme */
    --header-bg: #121725;                /* nền header */
    --header-bg-elev: #171c26;           /* tấm nâng nhẹ khi scroll/hover */
    --header-border: #2a3040;            /* đường phân tách dưới */
    --header-text: #e1e3e6;              /* chữ chính */
    --header-muted: #8a93a2;             /* chữ phụ / icon mờ */
    --header-hover: #1c2232;             /* hover cho nút/icon */
    --header-active: #2a3144;            /* active state */

    /* Brand */
    --brand-primary: #58aff6;
    --brand-primary-600: #3a7bd5;
    --brand-gradient: linear-gradient(135deg, #58aff6 0%, #3a7bd5 100%);

    /* Accent */
    --accent-success: #33c481;

    /* Search */
    --search-bg: #1a2030;
    --search-border: #2c3341;
    --search-placeholder: #9aa3b2;
    --search-ring: rgba(88, 175, 246, 0.35);
  }

  /* ======= Optional: Light Mode tokens =======
     Kích hoạt bằng cách đặt data-theme="light" trên <body> (sau này nếu muốn) */
  [data-theme="light"] {
    --header-bg: #ffffff;
    --header-bg-elev: #f7f8fb;
    --header-border: #e6e8ee;
    --header-text: #1b2430;
    --header-muted: #6b7280;
    --header-hover: #eef2f7;
    --header-active: #e6edf7;

    --search-bg: #f7f8fb;
    --search-border: #e6e8ee;
    --search-placeholder: #8b93a4;
  }

  /* ======= Shadow strip phía trên (đã dùng trong Header.jsx) ======= */
  .tn-header-shadow {
    position: sticky;
    top: 0;
    height: 0px; /* chỉ dùng để giữ layer */
    z-index: 1029;
    pointer-events: none;
  }
  .tn-header-shadow::after {
    content: "";
    position: fixed;
    top: 0; left: 0; right: 0;
    height: 16px;
    background: linear-gradient(to bottom, rgba(0,0,0,0.28), rgba(0,0,0,0));
    z-index: -1;
  }

  /* ======= Header container ======= */
  .tn-header.navbar {
    background-color: var(--header-bg) !important;
    border-bottom: 1px solid var(--header-border);
    height: var(--header-height);
    min-height: var(--header-height);
    backdrop-filter: saturate(120%) blur(8px);
  }

  /* ======= Brand (logo + text + workspace badge) ======= */
  .tn-brand {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 6px 10px;
    border-radius: 10px;
    border: 1px solid transparent;
    background: transparent;
    color: var(--header-text);
    font-weight: 700;
    letter-spacing: 0.2px;
    transition: background-color .15s ease, border-color .15s ease, transform .05s ease;
  }
  .tn-brand:hover {
    background-color: var(--header-hover);
    border-color: var(--header-border);
  }
  .tn-brand:active { transform: scale(0.98); }

  .tn-brand-glyph {
    width: 18px; height: 18px; border-radius: 4px;
    background: var(--brand-gradient);
    display: inline-block;
  }
  .tn-brand-text {
    font-size: 15px; line-height: 1; user-select: none;
  }
  .tn-ws-badge.badge {
    border: 1px solid var(--header-border);
    background: var(--header-bg-elev) !important;
    color: var(--header-muted) !important;
    font-weight: 600;
  }

  /* ======= Search ======= */
  .tn-search-wrap {
    flex: 1 1 auto;
    max-width: 560px;
    padding: 0 12px;
  }
  .tn-search.input-group {
    background: var(--search-bg);
    border: 1px solid var(--search-border);
    border-radius: 10px;
    transition: box-shadow .15s ease, border-color .15s ease;
  }
  .tn-search.focused {
    box-shadow: 0 0 0 3px var(--search-ring);
    border-color: transparent;
  }
  .tn-search .form-control {
    color: var(--header-text);
    background: transparent;
    border: none;
  }
  .tn-search .form-control::placeholder { color: var(--search-placeholder); }
  .tn-search .form-control:focus { box-shadow: none; }
  .tn-search-icon.input-group-text {
    background: transparent;
    border: none;
    color: var(--header-muted);
  }

  /* ======= Create Button ======= */
  .tn-create-btn.btn {
    display: inline-flex; align-items: center; gap: 6px;
    border: none;
    background: var(--brand-gradient);
    color: #fff;
    font-weight: 700;
    padding: 6px 12px;
    border-radius: 9px;
    box-shadow: 0 2px 10px rgba(58,123,213,0.26);
    transition: transform .08s ease, box-shadow .15s ease, filter .15s ease;
  }
  .tn-create-btn .tn-plus { font-size: 16px; line-height: 1; transform: translateY(-1px); }
  .tn-create-btn:hover { filter: brightness(1.02); box-shadow: 0 4px 14px rgba(58,123,213,0.36); }
  .tn-create-btn:active { transform: translateY(1px) scale(0.99); }

  /* ======= Icon buttons (Help, Globe, Feedback) ======= */
  .tn-icon-btn {
    display: inline-flex; align-items: center; justify-content: center;
    width: 32px; height: 32px;
    border: none; border-radius: 8px;
    color: var(--header-muted);
    background: transparent;
    transition: background-color .12s ease, color .12s ease, transform .05s ease;
  }
  .tn-icon-btn:hover { background-color: var(--header-hover); color: var(--header-text); }
  .tn-icon-btn:active { transform: scale(0.96); }
  .tn-icon-btn:focus-visible { outline: 2px solid var(--brand-primary); outline-offset: 2px; }

  /* ======= Apps dropdown trigger alignment (nếu có) ======= */
  .tn-apps-trigger { color: var(--header-muted); }
  .tn-apps-trigger:hover { color: var(--header-text); }

  /* ======= Utility: container spacing in header ======= */
  .tn-header .navbar-nav { gap: 6px; }

  --surface-1: #171c26;      /* app bg */
  --surface-2: #222834;      /* card bg / tile bg */
  --surface-3: #2c3341;      /* hover bg */
  --panel-border: #3a414f;

  --text-primary: #e1e3e6;
  --text-secondary: #8a93a2;

  --brand-primary: #58aff6;
  --brand-gradient: linear-gradient(135deg,#58aff6 0%, #3a7bd5 100%);

  --chip-bg: rgba(0,0,0,.35);

  

`;
