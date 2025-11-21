import React, { useEffect, useMemo, useRef, useCallback } from "react";
import styled from "styled-components";
import { createPortal } from "react-dom"; // ⭐ ADD PORTAL
import { FiEdit3, FiTrash2, FiUsers, FiClock, FiMaximize2 } from "react-icons/fi";
import { BiLabel } from "react-icons/bi";
import { MdChecklist } from "react-icons/md";
import { FiPaperclip } from "react-icons/fi";


export default function CardEditPopup({
  card,
  anchorRect,
  onClose,
  onOpenFullCard,
  onDelete,
  onRename,
  onSelect,
  onEditMembers,
  onEditDueDate,
  onEditLabels,
  onAddChecklist,
  onAddAttachment,
}) {
  const popupRef = useRef(null);
  const itemRefs = useRef([]);

  const items = useMemo(
    () => [
      { key: "open", icon: <FiMaximize2 />, label: "Open card", sub: "View full details" },
      { key: "rename", icon: <FiEdit3 />, label: "Rename", sub: "Quick edit title" },
      { key: "labels", icon: <BiLabel />, label: "Labels", sub: "Organize & prioritize" },
      { key: "checklist", icon: <MdChecklist />, label: "Checklist", sub: "Add subtasks" },
      { key: "attachment", icon: <FiPaperclip />, label: "Attachment", sub: "Attach links & files" },
      { key: "members", icon: <FiUsers />, label: "Members", sub: "Assign members" },
      { key: "dates", icon: <FiClock />, label: "Dates", sub: "Start/due & reminders" },
      { key: "delete", icon: <FiTrash2 />, label: "Delete", sub: "Move card to trash", danger: true },
    ],
    []
  );

  // ⭐ FIX: Dùng `position: fixed` và tính theo viewport
  const positionStyle = useMemo(() => {
    const GAP = 8;
    const width = 280;

    if (!anchorRect) return { top: 200, left: 200, width };

    let top = anchorRect.bottom + GAP;
    let left = anchorRect.left;

    const maxLeft = window.innerWidth - width - GAP;
    if (left > maxLeft) left = maxLeft;
    if (left < GAP) left = GAP;

    const approxHeight = 360;
    const fitsBelow = top + approxHeight < window.innerHeight - GAP;

    if (!fitsBelow) {
      top = anchorRect.top - approxHeight - GAP;
      if (top < GAP) top = GAP;
    }

    return { top, left, width };
  }, [anchorRect]);

  /** CLICK OUTSIDE */
  useEffect(() => {
    const onDown = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        onClose?.();
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [onClose]);

  const callOrToast = useCallback(
    (fn) => {
      if (typeof fn === "function") return fn(card);
      if (window?.toast?.info) window.toast.info("Tính năng sắp có");
    },
    [card]
  );

  const handleSelect = useCallback(
    async (key) => {
      if (typeof onSelect === "function") {
        onSelect(key, card);
        onClose?.();
        return;
      }

      switch (key) {
        case "open":
          onOpenFullCard?.(card);
          break;
        case "rename":
          callOrToast(onRename);
          break;
        case "labels":
          callOrToast(onEditLabels);
          break;
        case "checklist":
          callOrToast(onAddChecklist);
          break;
        case "attachment":
          callOrToast(onAddAttachment);
          break;
        case "members":
          callOrToast(onEditMembers);
          break;
        case "dates":
          callOrToast(onEditDueDate);
          break;
        case "delete":
          if (typeof onDelete === "function") await onDelete(card);
          break;
        default:
          break;
      }
      onClose?.();
    },
    [
      card,
      onSelect,
      onOpenFullCard,
      onRename,
      onEditLabels,
      onAddChecklist,
      onAddAttachment,
      onEditMembers,
      onEditDueDate,
      onDelete,
      onClose,
      callOrToast,
    ]
  );

  const onKeyDownMenu = useCallback(
    (e) => {
      const idx = itemRefs.current.findIndex((el) => el === document.activeElement);

      if (e.key === "Escape") {
        e.preventDefault();
        onClose?.();
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        const next = idx === -1 ? 0 : (idx + 1) % items.length;
        itemRefs.current[next]?.focus?.();
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        const prev = idx === -1 ? items.length - 1 : (idx - 1 + items.length) % items.length;
        itemRefs.current[prev]?.focus?.();
        return;
      }
    },
    [items.length, onClose]
  );

  // ⭐ FIX: Render bằng Portal → KHÔNG còn bị ảnh hưởng bởi overflow/transform của InboxPane
  return createPortal(
    <Wrap
      ref={popupRef}
      role="menu"
      aria-label="Card quick actions"
      style={positionStyle}
      onKeyDown={onKeyDownMenu}
    >
      <Hdr>Quick actions</Hdr>
      <List>
        {items.map((it, i) => (
          <Item
            key={it.key}
            ref={(el) => (itemRefs.current[i] = el)}
            role="menuitem"
            tabIndex={0}
            data-danger={it.danger ? "true" : "false"}
            onClick={() => handleSelect(it.key)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleSelect(it.key);
              }
            }}
            title={it.label}
          >
            <IconWrap>{it.icon}</IconWrap>
            <Txt>
              <b>{it.label}</b>
              <small>{it.sub}</small>
            </Txt>
          </Item>
        ))}
      </List>
    </Wrap>,
    document.body
  );
}

/* ================= Styled ================= */

const Wrap = styled.div`
  position: fixed; /* ⭐ FIXED, không còn absolute */
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
  padding: 8px 0;
  z-index: 3000; /* ⭐ cao hơn overlay của Inbox */
  backdrop-filter: saturate(120%) blur(6px);
`;

const Hdr = styled.div`
  font-weight: 600;
  font-size: 14px;
  color: #0f172a;
  padding: 10px 16px;
  border-bottom: 1px solid #e2e8f0;
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  padding: 4px 0;
`;

const Item = styled.button`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 14px;
  width: 100%;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  color: #0f172a;
  border-radius: 10px;
  margin: 2px 8px;

  &[data-danger="true"] {
    color: #b42318;
  }

  &:hover,
  &:focus-visible {
    outline: none;
    background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
    color: #fff;
  }
`;

const IconWrap = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-top: 2px;
  svg {
    width: 18px;
    height: 18px;
    color: currentColor;
    opacity: 0.9;
  }
`;

const Txt = styled.div`
  display: flex;
  flex-direction: column;
  b {
    font-size: 14px;
    font-weight: 600;
    line-height: 1.15;
  }
  small {
    font-size: 12px;
    opacity: 0.8;
  }
`;
