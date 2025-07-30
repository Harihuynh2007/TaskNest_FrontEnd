// ✅ BoardFilterPopup.jsx – Giao diện chuẩn Trello (có Keyword)

import React from 'react';
import styled from 'styled-components';
import { FaUser } from 'react-icons/fa';
import LabelFilterItem from './LabelFilterItem';
import MemberFilterItem from './MemberFilterItem';

export default function BoardFilterPopup({ 
    filter, 
    setFilter, 
    onClose, 
    position, 
    members = [], 
    toggleMemberFilter,
    labels = [], 
    toggleLabelFilter 
}) {
    console.log('🔍 Labels trong BoardFilterPopup:', labels);

    return (
        <Wrapper style={{ top: position.top, left: position.left }}>
        <Header>
            <Title>Filter</Title>
            <CloseBtn onClick={onClose}>×</CloseBtn>
        </Header>

        {/* 🔍 Keyword */}
        <Section>
            <KeywordInput
            type="text"
            placeholder="Enter a keyword..."
            value={filter.keyword}
            onChange={(e) => setFilter(prev => ({ ...prev, keyword: e.target.value }))}
            />
            <SubText>Search cards, members, labels, and more.</SubText>
        </Section>

        {/* 👤 Members */}
        <Section>
            <SectionLabel>Members</SectionLabel>
            <CheckboxGroup>
            {members.map((m) => (
                <CheckboxItem key={m.id}>
                <input
                    type="checkbox"
                    checked={filter.members.includes(m.id)}
                    onChange={() => toggleMemberFilter(m.id)}
                />
                <IconWrapper><FaUser size={16} /></IconWrapper>
                <span>{m.fullName || m.username}</span>
                </CheckboxItem>
            ))}
            </CheckboxGroup>
        </Section>

        {/* ✅ Card status */}
        <Section>
          <SectionLabel>Card status</SectionLabel>
          <CheckboxGroup>
            <CheckboxItem>
              <input
                type="checkbox"
                checked={filter.status === 'todo'}
                onChange={() => setFilter(prev => ({ ...prev, status: prev.status === 'todo' ? 'all' : 'todo' }))}
              />
              <span>To Do</span>
            </CheckboxItem>
            <CheckboxItem>
              <input
                type="checkbox"
                checked={filter.status === 'doing'}
                onChange={() => setFilter(prev => ({ ...prev, status: prev.status === 'doing' ? 'all' : 'doing' }))}
              />
              <span>Doing</span>
            </CheckboxItem>
            <CheckboxItem>
              <input
                type="checkbox"
                checked={filter.status === 'done'}
                onChange={() => setFilter(prev => ({ ...prev, status: prev.status === 'done' ? 'all' : 'done' }))}
              />
              <span>Done</span>
            </CheckboxItem>
          </CheckboxGroup>
        </Section>

        {/* ⏰ Due Date */}
       <Section>
        <SectionLabel>Due date</SectionLabel>
        <CheckboxGroup>
          <CheckboxItem>
            <input
              type="checkbox"
              checked={filter.due === 'none'}
              onChange={() => setFilter(prev => ({ ...prev, due: prev.due === 'none' ? 'all' : 'none' }))}
            />
            <span>No dates</span>
          </CheckboxItem>
          <CheckboxItem>
            <input
              type="checkbox"
              checked={filter.due === 'overdue'}
              onChange={() => setFilter(prev => ({ ...prev, due: prev.due === 'overdue' ? 'all' : 'overdue' }))}
            />
            <span>Overdue</span>
          </CheckboxItem>
          <CheckboxItem>
            <input
              type="checkbox"
              checked={filter.due === 'today'}
              onChange={() => setFilter(prev => ({ ...prev, due: prev.due === 'today' ? 'all' : 'today' }))}
            />
            <span>Due in the next day</span>
          </CheckboxItem>
          <CheckboxItem>
            <input
              type="checkbox"
              checked={filter.due === 'week'}
              onChange={() => setFilter(prev => ({ ...prev, due: prev.due === 'week' ? 'all' : 'week' }))}
            />
            <span>Due in the next week</span>
          </CheckboxItem>
          <CheckboxItem>
            <input
              type="checkbox"
              checked={filter.due === 'month'}
              onChange={() => setFilter(prev => ({ ...prev, due: prev.due === 'month' ? 'all' : 'month' }))}
            />
            <span>Due in the next month</span>
          </CheckboxItem>
        </CheckboxGroup>
      </Section>         

        {/* 🏷 Labels */}
        <Section>
            <SectionLabel>Labels</SectionLabel>
            <CheckboxGroup>
                {labels.map((label) => (
                <LabelFilterItem
                    key={label.id}
                    label={label}
                    checked={filter.labels.includes(label.id)}
                    onToggle={() => toggleLabelFilter(label.id)}
                    
                />
                ))}
            </CheckboxGroup>
        </Section>
        </Wrapper>
    );
}

const Wrapper = styled.div`
  position: absolute;
  background: white;
  width: 320px;
  padding: 16px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  box-shadow: 0px 8px 12px rgba(0, 0, 0, 0.12);
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
  font-weight: bold;
  color: #172b4d;
  margin: 0;
`;

const CloseBtn = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #5e6c84;
`;

const Section = styled.div`
  margin-bottom: 16px;
`;

const SectionLabel = styled.div`
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #172b4d;
`;

const SubText = styled.div`
  font-size: 12px;
  color: #5e6c84;
  margin-top: 4px;
`;

const KeywordInput = styled.input`
  width: 100%;
  padding: 8px 12px;
  font-size: 14px;
  border: 1px solid #dfe1e6;
  border-radius: 4px;
  outline: none;
  transition: all 0.2s ease;
  &:focus {
    border-color: #0c66e4;
    box-shadow: 0 0 0 2px rgba(0, 102, 228, 0.3);
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const CheckboxItem = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #172b4d;
  cursor: pointer;
  padding: 6px 8px;
  border-radius: 6px;
  transition: background 0.2s;
  &:hover {
    background: #f1f2f4;
  }

  input[type='checkbox'] {
    width: 16px;
    height: 16px;
    accent-color: #0c66e4;
  }
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: #5e6c84;
`;
