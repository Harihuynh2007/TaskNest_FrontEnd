import React from 'react';
import styled from 'styled-components';

export default function BoardCard({ title, background, children }) {
  return (
    <Card style={{ background: background || 'var(--surface-2, #1f2635)' }}>
      <span className="title">{title}</span>
      {children}
    </Card>
  );

}

const Card = styled.div`
  height: 100px; border-radius: 6px; display: flex; align-items: center; justify-content: center;
  position: relative; cursor: pointer; transition: .2s;
  .title {
    color: var(--text-primary, #e1e3e6);
    font-weight: 600;
    background: var(--chip-bg, rgba(0,0,0,.35));
    padding: 2px 6px; border-radius: 4px;
    backdrop-filter: blur(2px);
  }
  &:hover { transform: scale(1.03); box-shadow: 0 6px 14px rgba(0,0,0,.25); }
`;

