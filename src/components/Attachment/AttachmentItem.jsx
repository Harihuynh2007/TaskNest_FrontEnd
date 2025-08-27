import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { MoreVertical } from 'lucide-react';

const AttachmentWrapper = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 0;
  border-top: 1px solid #dfe1e6;
  position: relative;
`;

const ImagePreview = styled.img`
  width: 80px;
  height: 56px;
  object-fit: cover;
  border-radius: 3px;
  border: 1px solid #ccc;
`;

const FileIcon = styled.div`
  width: 80px;
  height: 56px;
  border: 1px solid #ccc;
  border-radius: 3px;
  background-color: #f4f5f7;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const AttachmentContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const AttachmentName = styled.a`
  font-weight: 500;
  font-size: 14px;
  color: #172b4d;
  text-decoration: none;
  display: block;
  &:hover {
    text-decoration: underline;
  }
`;

const MetaLine = styled.div`
  font-size: 12px;
  color: #6b778c;
  margin-top: 4px;
`;

const MoreButton = styled.button`
  background: none;
  border: none;
  color: #6b778c;
  cursor: pointer;
  padding: 4px;
  border-radius: 3px;
  &:hover {
    background-color: #091e4214;
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  right: 0;
  top: 32px;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  z-index: 100;
  min-width: 180px;
  padding: 6px 0;

  & > div {
    padding: 8px 12px;
    font-size: 14px;
    cursor: pointer;
    color: #172b4d;

    &:hover {
      background-color: #f4f5f7;
    }
  }

  .danger {
    color: #b04632;
    font-weight: 500;
  }
`;

export default function AttachmentItem({ attachment, onSetCover, onRemoveCover, onDelete }) {
  const [openMenu, setOpenMenu] = useState(false);
  const menuRef = useRef(null);

  // Auto-close menu when click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = attachment.file_url;
    link.download = attachment.name;
    link.click();
  };

  return (
    <AttachmentWrapper ref={menuRef}>
      {attachment.is_image ? (
        <ImagePreview src={attachment.file_url} alt={attachment.name} />
      ) : (
        <FileIcon>
          <span>📄</span>
        </FileIcon>
      )}

      <AttachmentContent>
        <AttachmentName href={attachment.file_url} target="_blank" rel="noopener noreferrer">
          {attachment.name}
        </AttachmentName>
        <MetaLine>
          Added just now {attachment.is_cover && <span>• 📌 Cover</span>}
        </MetaLine>
      </AttachmentContent>

      <MoreButton onClick={() => setOpenMenu((prev) => !prev)}>
        <MoreVertical size={16} />
      </MoreButton>

      {openMenu && (
        <DropdownMenu>
          <div>Edit</div>
          <div>Comment</div>
          <div onClick={handleDownload}>Download</div>
          {attachment.is_cover ? (
            <div onClick={() => onRemoveCover(attachment.id)}>Remove cover</div>
          ) : (
            <div onClick={() => onSetCover(attachment.id)}>Make cover</div>
          )}
          <div className="danger" onClick={() => onDelete(attachment.id)}>Remove</div>
        </DropdownMenu>
      )}
    </AttachmentWrapper>
  );
}
