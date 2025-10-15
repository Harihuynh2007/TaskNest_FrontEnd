import React from 'react';
import styled from 'styled-components';
import AttachmentItem from '../../Attachment/AttachmentItem';

export default function CardAttachments({
  attachments = [],
  onAddClick,
  onSetCover,
  onRemoveCover,
  onDelete
}) {
  if (!attachments?.length) return null;

  return (
    <Section>
      <SectionHeader>
        <span>📎 Attachments</span>
        <AddButton onClick={onAddClick}>Add</AddButton>
      </SectionHeader>

      <div>
        {attachments.map((att) => (
          <AttachmentItem
            key={att.id}
            attachment={att}
            onSetCover={() => onSetCover(att.id)}
            onRemoveCover={() => onRemoveCover(att.id)}
            onDelete={() => onDelete(att.id)}
          />
        ))}
      </div>
    </Section>
  );
}

/* --- Styled: copy nguyên bản để đảm bảo no-visual-diff --- */
const Section = styled.div`
  margin-bottom: 24px;
`;

const SectionHeader = styled.div`
  font-weight: 600;
  margin-bottom: 12px;
  color: #172b4d;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const AddButton = styled.button`
  background: none;
  border: none;
  color: #42526e;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 3px;

  &:hover {
    background-color: #091e4214;
    text-decoration: underline;
  }
`;
