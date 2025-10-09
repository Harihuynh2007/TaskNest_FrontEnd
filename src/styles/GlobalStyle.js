// src/styles/GlobalStyle.js
import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background: #f7f8fa;
    color: #172b4d;
  }

  /* Smooth scrolling */
  html {
    scroll-behavior: smooth;
  }

  /* Custom scrollbar */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: #f1f2f4;
  }

  ::-webkit-scrollbar-thumb {
    background: #c1c7d0;
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: #a5adba;
  }

  /* Link styles */
  a {
    color: #0c66e4;
    text-decoration: none;
    transition: color 0.2s ease;
    
    &:hover {
      color: #0055cc;
    }
  }

  /* Button focus styles */
  button:focus,
  a:focus,
  input:focus,
  textarea:focus {
    outline: 2px solid #0c66e4;
    outline-offset: 2px;
  }
`;