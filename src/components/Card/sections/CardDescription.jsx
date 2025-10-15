import React from 'react';
import styled from 'styled-components';
import { HiOutlineMenuAlt2 } from 'react-icons/hi';

export default function CardDescription({
  description,
  isEditing,
  tempDesc,
  onTempChange,
  onSave,
  onCancel,
  saving,
  onStartEdit
}) {
  return (
    <DescriptionSection>
      <DescriptionIconWrapper>
        <HiOutlineMenuAlt2 size={20} />
      </DescriptionIconWrapper>

      <DescriptionContent>
        <SectionHeading>Description</SectionHeading>

        {isEditing ? (
          <EditorBox>
            <Textarea
              value={tempDesc}
              onChange={(e) => onTempChange(e.target.value)}
              placeholder="Add a more detailed description..."
              disabled={saving}
            />
            <ButtonRow>
              <SaveBtn onClick={onSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </SaveBtn>
              <CancelBtn onClick={onCancel} disabled={saving}>
                Cancel
              </CancelBtn>
            </ButtonRow>
          </EditorBox>
        ) : (
          <PreviewBox onClick={onStartEdit}>
            {description
              ? <DescriptionText>{description}</DescriptionText>
              : <PlaceholderText>Add a more detailed description...</PlaceholderText>}
          </PreviewBox>
        )}
      </DescriptionContent>
    </DescriptionSection>
  );
}

/* --- Styled: copy nguyên bản để giữ layout/pixel --- */
const DescriptionSection = styled.section`
  display: grid;
  grid-template-columns: 36px 1fr;
  column-gap: 12px;
  margin-bottom: 32px;
`;

const DescriptionIconWrapper = styled.div`
  padding-top: 4px;
  color: #44546f;
`;

const DescriptionContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SectionHeading = styled.h3`
  font-size: 14px;
  font-weight: 600;
  color: #172b4d;
  margin: 0;
  min-height: 32px;
  display: flex;
  align-items: center;
`;

const PreviewBox = styled.div`
  background: #f4f5f7;
  border-radius: 6px;
  padding: 12px;
  min-height: 40px;
  cursor: pointer;
  font-size: 14px;
  color: #172b4d;

  &:hover { background: #ebecf0; }
`;

const DescriptionText = styled.p`
  margin: 0;
  line-height: 1.4;
  white-space: pre-wrap;
`;

const PlaceholderText = styled.em`
  color: #6b778c;
`;

const EditorBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Textarea = styled.textarea`
  width: 100%;
  min-height: 80px;
  padding: 10px;
  font-size: 14px;
  border-radius: 6px;
  border: 1px solid #dfe1e6;
  resize: vertical;
  font-family: inherit;

  &:focus { outline: none; border-color: #28a745; }
`;

const ButtonRow = styled.div`
  display: flex; gap: 8px;
`;

const SaveBtn = styled.button`
  background: #28a745;
  color: white;
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;

  &:disabled { background: #a5adba; cursor: not-allowed; }
`;

const CancelBtn = styled.button`
  background: transparent;
  border: none;
  color: #5e6c84;
  font-weight: 500;
  cursor: pointer;
  padding: 6px 12px;

  &:hover { color: #172b4d; }
`;
