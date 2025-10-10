import React from 'react';
import styled from 'styled-components';

export default function BoardTitle({ title }) {
  return <StyledTile>{title}</StyledTile>;
}

const StyledTile = styled.div`
  background-color: var(--surface-2, #222834);
  border: 1px solid var(--panel-border, #3a414f);
  color: var(--text-primary, #e1e3e6);

  border-radius: 3px;
  width: 200px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  &:hover { background-color: var(--surface-3, #2c3341); }
`;