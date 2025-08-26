// src/components/ChecklistCard/CheckListPopup.jsx
import React, { useState, useRef, useEffect, forwardRef, useMemo } from "react";
import styled from "styled-components";
import { X } from "lucide-react";

const CheckListPopup = forwardRef(function CheckListPopup(
  { onClose, onSubmit, existingChecklists = [], anchorRect },
  ref
) {
  const [title, setTitle] = useState("Checklist");
  const [copyFrom, setCopyFrom] = useState("");
  const [loading, setLoading] = useState(false);
  const titleInputRef = useRef();

  useEffect(() => {
    titleInputRef.current?.focus();
    titleInputRef.current?.select();
  }, []);

  const stylePos = useMemo(() => {
    if (!anchorRect) return {};
    const popupWidth = 304;   
    const popupHeight = 200;  
    const gap = 8;
    

    // mặc định mở dưới nút
    let top = anchorRect.bottom + gap;
    let left = anchorRect.left;

    // nếu tràn phải → dịch sang trái
    if (left + popupWidth + 8 > window.innerWidth) {
      left = Math.max(8, anchorRect.right - popupWidth);
    }

    // nếu thiếu chiều cao bên dưới → flip lên trên
    const spaceBelow = window.innerHeight - anchorRect.bottom;
    if (spaceBelow < popupHeight + gap) {
      top = anchorRect.top - popupHeight - gap;
    }

    // chặn âm
    top = Math.max(8, top);
    left = Math.max(8, left);

    return { top: `${top}px`, left: `${left}px` };
  }, [anchorRect]);

  const handleSubmit = () => {
    if (!title.trim()) return;
    setLoading(true);
    Promise.resolve(onSubmit?.({ title, copyFrom }))
      .finally(() => {
        setLoading(false);
        onClose();
      });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === "Escape") onClose();
  };

  return (
    <PopupContainer ref={ref} style={stylePos} onClick={(e) => e.stopPropagation()}>
      <PopupHeader>
        <PopupTitle>Add checklist</PopupTitle>
        <CloseButton onClick={onClose}><X size={14} /></CloseButton>
      </PopupHeader>

      <PopupContent>
        <FieldGroup>
          <FieldLabel>Title</FieldLabel>
          <TitleInput
            ref={titleInputRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
          />
        </FieldGroup>

        <FieldGroup>
          <FieldLabel>Copy items from…</FieldLabel>
          <CopySelect
            value={copyFrom}
            onChange={(e) => setCopyFrom(e.target.value)}
            disabled={loading}
          >
            <option value="">(none)</option>
            {existingChecklists.map((cl) => (
              <option key={cl.id} value={cl.id}>{cl.title}</option>
            ))}
          </CopySelect>
        </FieldGroup>

        <AddButton onClick={handleSubmit} disabled={loading || !title.trim()}>
          {loading ? "Adding..." : "Add"}
        </AddButton>
      </PopupContent>
    </PopupContainer>
  );
});

export default CheckListPopup;

/* Styles giữ nguyên, chỉ chắc chắn có width và z-index cao */
const PopupContainer = styled.div`
  width: 304px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0px 8px 12px rgba(9, 30, 66, 0.15), 0px 0px 1px rgba(9, 30, 66, 0.3);
  display: flex;
  flex-direction: column;
  position: absolute;
  z-index: 2000;
`;
/* ... các style khác giữ nguyên ... */


const PopupHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px;
  border-bottom: 1px solid #dfe1e6;
`;

const PopupTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #5e6c84;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #6b778c;
  padding: 4px;
  border-radius: 3px;

  &:hover {
    background: #f1f2f4;
    color: #172b4d;
  }
`;

const PopupContent = styled.div`
  padding: 12px;
  display: flex;
  flex-direction: column;
`;

const FieldGroup = styled.div`
  margin-bottom: 12px;
`;

const FieldLabel = styled.label`
  font-size: 12px;
  font-weight: 700;
  color: #5e6c84;
  margin-bottom: 4px;
  display: block;
  text-transform: uppercase;
`;

const TitleInput = styled.input`
  width: 100%;
  padding: 6px 8px;
  border: 2px solid #dfe1e6;
  border-radius: 3px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #0c66e4;
    box-shadow: 0 0 0 1px #0c66e4;
  }
`;

const CopySelect = styled.select`
  width: 100%;
  padding: 6px 8px;
  border: 2px solid #dfe1e6;
  border-radius: 3px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #0c66e4;
    box-shadow: 0 0 0 1px #0c66e4;
  }
`;

const AddButton = styled.button`
  width: 100%;
  padding: 6px 12px;
  background: #0c66e4;
  color: #fff;
  border: none;
  border-radius: 3px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;

  &:hover:not(:disabled) {
    background: #0055cc;
  }

  &:disabled {
    background: #a5adba;
    cursor: not-allowed;
  }
`;
