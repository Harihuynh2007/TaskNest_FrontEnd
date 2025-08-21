// src/components/ChecklistCard/ChecklistSection.jsx
import React, {useState,useRef, useEffect} from "react";
import styled from "styled-components";

export default function ChecklistSection({ 
  checklist, 
  onChangeTitle, 
  onAddItem, 
  onToggleItem, 
  onDeleteItem,
  onDeleteChecklist,
 }) {
  const total = checklist.items?.length || 0;
  const done = checklist.items?.filter(i => i.completed).length || 0; // ✅ dùng 'completed'
  const pct = total ? Math.round((done / total) * 100) : 0;

  // ✅ state cho form Add item
  const [showAdd, setShowAdd] = useState(false);
  const [newText, setNewText] = useState("");
  const textareaRef = useRef(null);

  useEffect(() => {
    if (showAdd) {
      textareaRef.current?.focus();
    }
  }, [showAdd]);

  const submitAdd = () => {
    const text = newText.trim();
    if (!text) return;
    onAddItem(checklist.id, text); 
    setNewText("");                
    textareaRef.current?.focus();
  };

  const cancelAdd = () => {
    setShowAdd(false);
    setNewText("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submitAdd();
    }
    if (e.key === "Escape") cancelAdd();
  };

  return (
    <ChecklistSectionWrapper>
      <ChecklistGrid>
        <ChecklistIconWrapper>
          {/* Icon/checkbox đại diện cho section, KHÔNG dùng 'item' ở đây */}
          <SectionCheckbox type="checkbox" checked={pct === 100} disabled />
        </ChecklistIconWrapper>

        <div>
          <TitleRow>
            <ChecklistTitleInput
              value={checklist.title}
              onChange={(e) => onChangeTitle(checklist.id, e.target.value)}
            />
            <DeleteChecklistBtn
              type="button"
              onClick={() => onDeleteChecklist?.(checklist.id)}
              aria-label="Delete checklist"
            >
              Delete
            </DeleteChecklistBtn>
          </TitleRow>


          <ProgressRow>
            <ProgressLabel>{pct}%</ProgressLabel>
            <ProgressBar>
              <ProgressFill pct={pct} />
            </ProgressBar>
          </ProgressRow>

          <ChecklistItems>
            {(checklist.items || []).map(item => (
              <ChecklistItemRow key={item.id}>
                <ChecklistItemCheckbox
                  type="checkbox"
                  checked={!!item.completed}                                
                  onChange={() => onToggleItem(checklist.id, item.id)}       
                />
                <ChecklistItemText $done={item.completed}>                  
                  {item.text}                                                
                </ChecklistItemText>
                <DeleteItemBtn onClick={() => onDeleteItem(checklist.id, item.id)}>×</DeleteItemBtn>
              </ChecklistItemRow>
            ))}
          </ChecklistItems>

          {/* ✅ Khu vực Add item kiểu Trello */}  
          {showAdd ? (
            <AddItemForm onSubmit={(e) => { e.preventDefault(); submitAdd(); }}>
              <AddItemTextarea
                ref={textareaRef}
                rows={1}
                placeholder="Add an item"
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <AddRow>
                <PrimaryBtn type="submit" disabled={!newText.trim()}>Add</PrimaryBtn>
                <GhostBtn type="button" onClick={cancelAdd}>Cancel</GhostBtn>
              </AddRow>
            </AddItemForm>
          ) : (
            <AddItemBtn type="button" onClick={() => setShowAdd(true)}>Add an item</AddItemBtn>
          )}
        </div>
      </ChecklistGrid>
    </ChecklistSectionWrapper>
  );
}

/* ========== styled-components ========== */

const AddItemForm = styled.form`
  margin-top: 8px;
`;

const AddItemTextarea = styled.textarea`
  width: 100%;
  min-height: 36px;
  resize: vertical;
  border: 1px solid #091e420f;
  border-radius: 6px;
  padding: 8px 10px;
  font-size: 14px;
  outline: none;
  &:focus { border-color: #0c66e4; box-shadow: 0 0 0 1px #0c66e4; }
`;

const AddRow = styled.div`
  margin-top: 8px;
  display: flex;
  gap: 8px;
`;

const PrimaryBtn = styled.button`
  padding: 6px 12px;
  background: #0c66e4;
  color: #fff;
  border: 1px solid #0c66e4;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  &:disabled { opacity: .5; cursor: not-allowed; }
`;
const GhostBtn = styled.button`
  padding: 6px 12px;
  background: #f4f5f7;
  border: 1px solid #dfe1e6;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  &:hover { background: #e9f2ff; }
`;

const ChecklistSectionWrapper = styled.section`
  margin-bottom: 24px;
`;

const ChecklistGrid = styled.div`
  display: grid;
  grid-template-columns: 36px 1fr;
  column-gap: 12px;
`;

const ChecklistIconWrapper = styled.div`
  padding-top: 6px;
`;

const SectionCheckbox = styled.input`
  width: 18px;
  height: 18px;
`;

const ChecklistTitleInput = styled.input`
  width: 100%;
  border: 1px solid #091e420f;
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 14px;
  outline: none;
  font-weight: 600;
  color: #172b4d;

  &:focus {
    border-color: #0c66e4;
    box-shadow: 0 0 0 1px #0c66e4;
  }
`;

const ProgressRow = styled.div`
  margin-top: 10px;
  display: grid;
  grid-template-columns: 36px 1fr;
  column-gap: 12px;
  align-items: center;
`;

const ProgressLabel = styled.div`
  font-size: 12px;
  color: #6b778c;
  text-align: right;
`;

const ProgressBar = styled.div`
  height: 6px;
  background: #091e420f;
  border-radius: 4px;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  width: ${({ pct }) => pct}%;
  background: #0c66e4;
  border-radius: 4px;
  transition: width 0.2s ease;
`;

const ChecklistItems = styled.ul`
  list-style: none;
  padding: 0;
  margin-top: 12px;
`;

const ChecklistItemRow = styled.li`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
`;

const ChecklistItemCheckbox = styled.input`
  width: 16px;
  height: 16px;
  cursor: pointer;
`;

const ChecklistItemText = styled.span`
  flex: 1;
  font-size: 14px;
  ${({ $done }) => $done && `
    text-decoration: line-through;
    color: #6b778c;
  `}
`;

const DeleteItemBtn = styled.button`
  border: none;
  background: transparent;
  color: #6b778c;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;

  &:hover {
    color: #172b4d;
  }
`;

const AddItemBtn = styled.button`
  margin-top: 8px;
  padding: 6px 12px;
  background: #f4f5f7;
  border: 1px solid #dfe1e6;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  &:hover {
    background: #e9f2ff;
  }
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: space-between;
`;

const DeleteChecklistBtn = styled.button`
  padding: 6px 10px;
  background: #f4f5f7;
  border: 1px solid #dfe1e6;
  border-radius: 6px;
  font-size: 13px;
  color: #172b4d;
  cursor: pointer;
  white-space: nowrap;
  &:hover { background: #e9f2ff; }
`;
