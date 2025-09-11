import React, { useState } from 'react';
import styled from 'styled-components';
import { X } from 'lucide-react';
import { createAttachmentFile, createAttachmentLink } from '../../api/cardApi';

const AttachmentPopup = ({ cardId, onClose, onAttachmentAdded }) => {
  const [file, setFile] = useState(null);
  const [linkUrl, setLinkUrl] = useState('');
  const [displayText, setDisplayText] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = (event) => {
    const selected = event.target.files[0];
    if (selected) setFile(selected);
  };

  const handleInsert = async () => {
    if (isUploading) return;
    setIsUploading(true);

    try {
      let newAttachment;
      if (file) {
        newAttachment = await createAttachmentFile(cardId, file);
      } else if (linkUrl) {
        newAttachment = await createAttachmentLink(cardId, linkUrl, displayText);
      } else {
        return;
      }
      onAttachmentAdded?.(newAttachment);
      onClose();
    } catch (err) {
      console.error('Insert attachment failed:', err);
      alert('Failed to attach.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <PopupWrapper onMouseDown={(e) => e.stopPropagation()}i>
      <PopupHeader>
        <Title>Attach</Title>
        <CloseButton onClick={onClose}><X size={18} /></CloseButton>
      </PopupHeader>

      <Section>
        <Label>Attach a file</Label>
        <FileInput id="file-upload" type="file" onChange={handleFileUpload} />
        <ChooseFileButton htmlFor="file-upload">{file ? file.name : 'Choose a file'}</ChooseFileButton>
        <Hint>Or drag and drop a file</Hint>
      </Section>

      <Section>
        <Label>Attach a link</Label>
        <TextInput
          type="text"
          placeholder="Paste a link"
          value={linkUrl}
          onChange={(e) => setLinkUrl(e.target.value)}
        />
        <TextInput
          type="text"
          placeholder="Display text (optional)"
          value={displayText}
          onChange={(e) => setDisplayText(e.target.value)}
        />
      </Section>

      <Footer>
        <CancelButton onClick={onClose}>Cancel</CancelButton>
        <InsertButton onClick={handleInsert} disabled={isUploading || (!file && !linkUrl)}>
          {isUploading ? 'Uploading...' : 'Insert'}
        </InsertButton>
      </Footer>
    </PopupWrapper>
  );
};

export default AttachmentPopup;

const PopupWrapper = styled.div`
  width: 400px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  padding: 20px;
  font-family: 'Segoe UI', sans-serif;
`;

const PopupHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #172b4d;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #6b778c;
`;

const Section = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.div`
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
  color: #172b4d;
`;

const FileInput = styled.input`
  display: none;
`;

const ChooseFileButton = styled.label`
  display: inline-block;
  padding: 8px 12px;
  background: #f4f5f7;
  border: 1px solid #dfe1e6;
  border-radius: 4px;
  font-size: 14px;
  color: #172b4d;
  cursor: pointer;
  margin-bottom: 6px;
`;

const Hint = styled.div`
  font-size: 12px;
  color: #6b778c;
`;

const TextInput = styled.input`
  width: 100%;
  padding: 8px;
  font-size: 14px;
  border: 1px solid #dfe1e6;
  border-radius: 4px;
  margin-top: 4px;
  margin-bottom: 8px;
`;

const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`;

const CancelButton = styled.button`
  background: none;
  border: none;
  color: #6b778c;
  font-size: 14px;
  cursor: pointer;
`;

const InsertButton = styled.button`
  background: #0c66e4;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  font-weight: 500;

  &:disabled {
    background: #a5adba;
    cursor: not-allowed;
  }
`;
