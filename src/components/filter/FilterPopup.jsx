
import React from 'react';
import styled from 'styled-components';


export default function FilterPopup({ filter, setFilter, onClose,position  }) {
  return (
    <Wrapper  style={{ top: position.top, left: position.left }}>
      <Header>
        <Title>Filter</Title>
        <CloseBtn onClick={onClose}>×</CloseBtn>
      </Header>

      <Section>
        <SectionLabel>Keyword</SectionLabel>
        <KeywordInput
          type="text"
          placeholder="Enter keyword..."
          value={filter.keyword}
          onChange={(e) => setFilter((prev) => ({ ...prev, keyword: e.target.value }))}
        />
      </Section>

      <Section>
        <SectionLabel>Status</SectionLabel>
        <CheckboxGroup>
          <CheckboxItem>
            <input
              type="checkbox"
              checked={filter.status === 'all'}
              onChange={() => setFilter(prev => ({ ...prev, status: prev.status === 'all' ? '' : 'all' }))}
            />
            <span>All</span>
          </CheckboxItem>
          <CheckboxItem>
            <input
              type="checkbox"
              checked={filter.status === 'completed'}
              onChange={() => setFilter(prev => ({ ...prev, status: prev.status === 'completed' ? '' : 'completed' }))}
            />
            <span>Completed</span>
          </CheckboxItem>
          <CheckboxItem>
            <input
              type="checkbox"
              checked={filter.status === 'incomplete'}
              onChange={() => setFilter(prev => ({ ...prev, status: prev.status === 'incomplete' ? '' : 'incomplete' }))}
            />
            <span>Incomplete</span>
          </CheckboxItem>
        </CheckboxGroup>
      </Section>

      <Section>
        <SectionLabel>Due Date</SectionLabel>
        <CheckboxGroup>
            <CheckboxItem>
            <input
                type="checkbox"
                checked={filter.due === 'overdue'}
                onChange={() => setFilter(prev => ({
                ...prev,
                due: prev.due === 'overdue' ? 'all' : 'overdue'
                }))}
            />
            <span>Overdue</span>
            </CheckboxItem>
            <CheckboxItem>
            <input
                type="checkbox"
                checked={filter.due === 'today'}
                onChange={() => setFilter(prev => ({
                ...prev,
                due: prev.due === 'today' ? 'all' : 'today'
                }))}
            />
            <span>Due Today</span>
            </CheckboxItem>
            <CheckboxItem>
            <input
                type="checkbox"
                checked={filter.due === 'week'}
                onChange={() => setFilter(prev => ({
                ...prev,
                due: prev.due === 'week' ? 'all' : 'week'
                }))}
            />
            <span>This Week</span>
            </CheckboxItem>
            <CheckboxItem>
            <input
                type="checkbox"
                checked={filter.due === 'none'}
                onChange={() => setFilter(prev => ({
                ...prev,
                due: prev.due === 'none' ? 'all' : 'none'
                }))}
            />
            <span>No due date</span>
            </CheckboxItem>
        </CheckboxGroup>
    </Section>

    </Wrapper>
  );
}

const Wrapper = styled.div`
  position: absolute;
  top: 56px;
  right: 12px;
  background: #fff;
  border: 1px solid rgba(9, 30, 66, 0.1);
  border-radius: 8px;
  box-shadow: 0px 8px 12px rgba(9, 30, 66, 0.15);
  width: 300px;
  padding: 16px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  z-index: 999;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const Title = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: #172b4d;
  margin: 0;
`;

const CloseBtn = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  font-weight: bold;
  cursor: pointer;
  color: #44546f;
  line-height: 1;

  &:hover {
    color: #172b4d;
  }
`;

const Section = styled.div`
  margin-bottom: 16px;
`;

const SectionLabel = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #172b4d;
  margin-bottom: 6px;
`;

const KeywordInput = styled.input`
  width: 100%;
  padding: 8px 10px;
  font-size: 14px;
  border: 1px solid #dfe1e6;
  border-radius: 4px;
  outline: none;
  box-shadow: inset 0 0 0 1px transparent;
  transition: all 0.2s ease;

  &:focus {
    border-color: #0c66e4;
    box-shadow: inset 0 0 0 2px #0c66e4;
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const CheckboxItem = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: var(--ds-background-neutral-hovered, #f0f0f0);
  }

  input[type='checkbox'] {
    width: 16px;
    height: 16px;
    accent-color: #0c66e4; /* Trello blue */
  }

  span {
    color: var(--ds-text, #172b4d);
  }
`;
