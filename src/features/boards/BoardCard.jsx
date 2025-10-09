import React from 'react';
import styled from 'styled-components';

export default function BoardCard({ title, background, children }) {
  return (
    <Card style={{ background: background || '#f4f5f7' }}>
      <span className="title">{title}</span>
      {children}
    </Card>
  );
}

const Card = styled.div`
  height: 100px; border-radius: 6px; display: flex; align-items: center; justify-content: center;
  position: relative; cursor: pointer; transition: .2s;
  .title { color: #172b4d; font-weight: 600; background: rgba(255,255,255,.85); padding: 2px 6px; border-radius: 4px; }
  &:hover { transform: scale(1.03); box-shadow: 0 6px 14px rgba(0,0,0,.12); }
`;
