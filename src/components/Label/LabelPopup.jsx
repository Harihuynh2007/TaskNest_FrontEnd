// LabelPopup.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { FaPen } from 'react-icons/fa';
import { IoMdCheckmark } from 'react-icons/io';
import { FiArrowLeft, FiX } from 'react-icons/fi';

// Trello Standard Colors
const COLORS = [
  '#61bd4f', '#f2d600', '#ff9f1a',
  '#eb5a46', '#c377e0', '#0079bf',
  '#00c2e0', '#51e898', '#ff78cb',
  '#344563', '#b3bac5', '#091e42'
];

export default function LabelPopup({
  anchorRect,
  labels = [],
  selectedLabelIds = [],
  onToggleLabel,
  onCreateLabel,
  onEditLabel,
  onDeleteLabel,
  onClose,
  boardId
}) {
  const popupRef = useRef(null);
  const inputRef = useRef(null);

  const [mode, setMode] = useState("list"); // list | create | edit
  const [search, setSearch] = useState("");
  const [editingLabel, setEditingLabel] = useState(null);

  const [formName, setFormName] = useState("");
  const [formColor, setFormColor] = useState(COLORS[0]);
  
  // Tính toán vị trí popup
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  const POPUP_WIDTH = 304;
  useEffect(() => {
    if (anchorRect) {
      const top = (anchorRect.bottom ?? 0) + window.scrollY + 8;
      // Đảm bảo không bị tràn màn hình bên phải
      const left = Math.min(anchorRect.left ?? 0, window.innerWidth - POPUP_WIDTH - 16); 
      setCoords({ top, left });
    }
  }, [anchorRect]);

  // Click outside to close
  useEffect(() => {
    const handler = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  // Lọc labels theo search
  const filteredLabels = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return labels;
    return labels.filter((l) =>
      (l.name || "").toLowerCase().includes(term)
    );
  }, [labels, search]);

  // --- Handlers ---
  const startCreate = () => {
    setMode("create");
    setFormName("");
    setFormColor(COLORS[0]);
    setEditingLabel(null);
  };

  const startEdit = (label) => {
    setMode("edit");
    setEditingLabel(label);
    setFormName(label.name);
    setFormColor(label.color);
  };

  const submitCreate = (e) => {
    e.preventDefault();

    if (!formName.trim()) return;

    // DEBUG để thấy giá trị thực
    console.log("CREATE LABEL PAYLOAD (POPUP):", {
      name: formName.trim(),
      color: formColor,
      boardId: boardId,
    });

    onCreateLabel({
      name: formName.trim(),
      color: formColor,
      boardId: boardId,   // <-- Nhận từ props, KHÔNG tự lấy
    });

    setMode("list");
  };


  const submitEdit = (e) => {
    e.preventDefault();
    if (!formName.trim() || !editingLabel) return;
    
    onEditLabel(editingLabel.id, {
      name: formName.trim(),
      color: formColor,
    });


    setMode("list");
  };

  const deleteLabel = () => {
    if (!editingLabel) return;
    onDeleteLabel(editingLabel.id);
    setMode("list");
  };

  const isSelected = (id) => selectedLabelIds.includes(id);
  const isSubmitDisabled = !formName.trim();

  return (
    <PopupContainer ref={popupRef} style={{ top: coords.top, left: coords.left }}>
      {/* HEADER */}
      <Header>
        {mode !== "list" ? (
          <BackBtn onClick={() => setMode("list")}>
            <FiArrowLeft size={16} />
          </BackBtn>
        ) : <div style={{width: 24}} />} {/* Spacer */}
        
        <Title>
          {mode === "list" && "Labels"}
          {mode === "create" && "Create label"}
          {mode === "edit" && "Edit label"}
        </Title>
        
        <CloseBtn onClick={onClose}>
          <FiX size={16} />
        </CloseBtn>
      </Header>

      <Divider />

      {/* MODE: LIST */}
      {mode === "list" && (
        <>
          <SearchInput
            autoFocus
            placeholder="Search labels..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <SectionTitle>Labels</SectionTitle>
          <LabelList>
            {filteredLabels.map((label) => (
              <LabelItem key={label.id}>
                <LabelClickable onClick={() => onToggleLabel(label.id)}>
                  <ColorBar $color={label.color}>
                    <LabelName>{label.name}</LabelName>
                    {isSelected(label.id) && <IoMdCheckmark size={16} />}
                  </ColorBar>
                </LabelClickable>

                <EditIconBtn onClick={(e) => {
                  e.stopPropagation();
                  startEdit(label);
                }}>
                  <FaPen size={12} />
                </EditIconBtn>
              </LabelItem>
            ))}
            {filteredLabels.length === 0 && (
              <EmptyText>No labels found.</EmptyText>
            )}
          </LabelList>

          <CreateBtn onClick={startCreate}>Create a new label</CreateBtn>
        </>
      )}

      {/* MODE: CREATE / EDIT */}
      {(mode === "create" || mode === "edit") && (
        <form onSubmit={mode === "create" ? submitCreate : submitEdit}>
          
          {/* Preview Section */}
          <SectionLabel>Preview</SectionLabel>
          <PreviewBox $color={formColor}>
            {formName || "Label Name"}
          </PreviewBox>

          <SectionLabel>Name</SectionLabel>
          <Input
            ref={inputRef}
            autoFocus
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            placeholder="Enter label name"
          />

          <SectionLabel>Select a color</SectionLabel>
          <ColorGrid>
            {COLORS.map((c) => (
              <ColorDot
                key={c}
                type="button" // Quan trọng: prevent submit form
                $color={c}
                $active={formColor === c}
                onClick={() => setFormColor(c)}
              >
                {formColor === c && <IoMdCheckmark size={14} />}
              </ColorDot>
            ))}
          </ColorGrid>

          <ActionRow>
            <PrimaryButton type="submit" disabled={isSubmitDisabled}>
              {mode === "create" ? "Create" : "Save"}
            </PrimaryButton>
            
            {mode === "edit" && (
              <DangerButton type="button" onClick={deleteLabel}>
                Delete
              </DangerButton>
            )}
          </ActionRow>
        </form>
      )}
    </PopupContainer>
  );
}

/* ============ Styled Components ============ */

const PopupContainer = styled.div`
  position: fixed;
  width: 304px;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 8px 16px -4px rgba(9, 30, 66, 0.25), 0 0 0 1px rgba(9, 30, 66, 0.08);
  padding: 0 12px 12px 12px;
  z-index: 9999;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
`;

const Header = styled.div`
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  color: #172b4d;
`;

const Title = styled.span`
  font-weight: 600;
  font-size: 14px;
  flex: 1;
  text-align: center;
`;

const CloseBtn = styled.button`
  background: none;
  border: none;
  color: #6b778c;
  cursor: pointer;
  padding: 4px;
  &:hover { color: #172b4d; }
`;

const BackBtn = styled(CloseBtn)``;

const Divider = styled.div`
  border-bottom: 1px solid rgba(9, 30, 66, 0.13);
  margin: 0 -12px 12px -12px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 8px 12px;
  border-radius: 3px;
  border: 2px solid #dfe1e6;
  background-color: #fafbfc;
  font-size: 14px;
  margin-bottom: 12px;
  outline: none;
  transition: all 0.2s;

  &:focus {
    background-color: #fff;
    border-color: #3b82f6;
  }
`;

const SectionTitle = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: #5e6c84;
  margin-bottom: 8px;
`;

const LabelList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 12px 0;
  max-height: 250px;
  overflow-y: auto;

  /* Scrollbar */
  &::-webkit-scrollbar { width: 8px; }
  &::-webkit-scrollbar-track { background: #f4f5f7; }
  &::-webkit-scrollbar-thumb { 
    background: #bfc4ce; 
    border-radius: 4px; 
  }
`;

const LabelItem = styled.li`
  display: flex;
  align-items: center;
  margin-bottom: 4px;
  padding-right: 4px; /* Space for edit icon */
`;

const LabelClickable = styled.div`
  flex-grow: 1;
  cursor: pointer;
  /* Hover effect handled inside ColorBar */
`;

const ColorBar = styled.div`
  background-color: ${p => p.$color};
  color: #fff;
  padding: 6px 12px;
  border-radius: 3px;
  font-weight: 600;
  font-size: 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 32px;
  position: relative;
  
  &:hover {
    opacity: 0.85;
    margin-left: 4px; /* Trello effect */
  }
  transition: opacity 0.2s, margin 0.1s ease-in;
`;
const LabelName = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 190px;
`;

const EditIconBtn = styled.button`
  background: transparent;
  border: none;
  padding: 8px;
  cursor: pointer;
  color: #42526e;
  border-radius: 3px;
  margin-left: 4px;
  
  &:hover {
    background-color: rgba(9, 30, 66, 0.08);
  }
`;

const EmptyText = styled.div`
  padding: 10px;
  text-align: center;
  color: #6b778c;
  font-size: 14px;
`;

const CreateBtn = styled.button`
  width: 100%;
  padding: 8px 12px;
  background: rgba(9, 30, 66, 0.04);
  color: #172b4d;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  font-weight: 500;
  font-size: 14px;
  transition: background 0.1s;

  &:hover {
    background: rgba(9, 30, 66, 0.08);
  }
`;

/* --- Create/Edit Styles --- */
const SectionLabel = styled.div`
  font-size: 12px;
  font-weight: 700;
  color: #5e6c84;
  margin-bottom: 4px;
  margin-top: 12px;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px 12px;
  border-radius: 3px;
  border: 2px solid #dfe1e6;
  background-color: #fafbfc;
  font-size: 14px;
  outline: none;

  &:focus {
    background-color: #fff;
    border-color: #3b82f6;
  }
`;

const PreviewBox = styled.div`
  background-color: ${p => p.$color};
  color: #fff;
  padding: 6px 12px;
  border-radius: 3px;
  font-weight: 600;
  font-size: 14px;
  min-height: 32px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-bottom: 8px;
`;

const ColorGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
  margin-bottom: 16px;
`;

const ColorDot = styled.button`
  width: 100%;
  padding-bottom: 80%; /* Rectangular ratio like Trello */
  background-color: ${p => p.$color};
  border: none;
  border-radius: 4px;
  cursor: pointer;
  position: relative;
  
  &:hover {
    opacity: 0.8;
  }

  svg {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: white;
  }
`;

const ActionRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
`;

const PrimaryButton = styled.button`
  background-color: #0c66e4;
  color: white;
  border: none;
  border-radius: 3px;
  padding: 6px 24px;
  font-weight: 600;
  cursor: pointer;
  
  &:hover { background-color: #0055cc; }
  &:disabled { 
    background-color: rgba(9, 30, 66, 0.04);
    color: #a5adba;
    cursor: not-allowed;
  }
`;

const DangerButton = styled.button`
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 3px;
  padding: 6px 12px;
  font-weight: 600;
  cursor: pointer;
  font-size: 13px;

  &:hover { background-color: #c82333; }
`;