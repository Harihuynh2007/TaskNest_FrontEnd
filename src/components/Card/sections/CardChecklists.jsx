import React from 'react';
import ChecklistSection from '../../ChecklistCard/ChecklistSection';

/**
 * Hiển thị toàn bộ danh sách checklist của card.
 * Chỉ là component trình bày, mọi API/logic giữ ở FullCardModal.
 */
export default function CardChecklists({
  checklists = [],
  onChangeTitle,
  onAddItem,
  onToggleItem,
  onDeleteItem,
  onDeleteChecklist
}) {
  if (!checklists || checklists.length === 0) return null;

  return (
    <>
      {checklists.map((cl) => (
        <ChecklistSection
          key={cl.id}
          checklist={cl}
          onChangeTitle={onChangeTitle}
          onAddItem={onAddItem}
          onToggleItem={onToggleItem}
          onDeleteItem={onDeleteItem}
          onDeleteChecklist={onDeleteChecklist}
        />
      ))}
    </>
  );
}
