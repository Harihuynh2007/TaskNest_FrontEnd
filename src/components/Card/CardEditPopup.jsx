import React, { useEffect, useMemo, useRef, useCallback } from "react";
import styled from "styled-components";
import { FiEdit3, FiTrash2, FiUsers, FiClock, FiMaximize2 } from "react-icons/fi";
import { BiLabel } from "react-icons/bi";
import { MdChecklist } from "react-icons/md";
import { FiPaperclip } from "react-icons/fi";

/**
 * CardEditPopup
 *
 * Props (giữ tương thích, có thể bớt/đổi theo dự án của bạn):
 * - card: object (bắt buộc)
 * - anchorRect: DOMRect của nút mở popup (bắt buộc)
 * - onClose: () => void (bắt buộc)
 * - onOpenFullCard: (card) => void
 * - onDelete: (card) => Promise|void
 * - onRename: (card) => void   // nếu bạn có flow rename nhanh
 *
 * - onEditMembers?: (card) => void
 * - onEditDueDate?: (card) => void
 * - onEditLabels?: (card) => void
 * - onAddChecklist?: (card) => void
 * - onAddAttachment?: (card) => void
 *
 * Lưu ý:
 * - Không đổi pixel layout tổng của container xung quanh (đặt tuyệt đối theo anchorRect).
 * - Nếu thiếu callback, tự fallback toast: window.toast?.info('Tính năng sắp có')
 */
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

  // Tính vị trí và clamp viewport (không đổi pixel container cha)
  const positionStyle = useMemo(() => {
    const GAP = 8;
    const width = 280;
    let top = anchorRect?.bottom + window.scrollY + GAP;
    let left = (anchorRect?.left ?? 0);

    const maxLeft = window.innerWidth - width - GAP;
    if (left > maxLeft) left = Math.max(GAP, maxLeft);

    const approxHeight = 360;
    const fitsBelow = top + approxHeight < window.scrollY + window.innerHeight;
    if (!fitsBelow) {
      top = (anchorRect?.top ?? 0) + window.scrollY - approxHeight - GAP;
      if (top < window.scrollY + GAP) top = window.scrollY + GAP;
    }
    return { top, left, width };
  }, [anchorRect]);

  // Click outside để đóng
  useEffect(() => {
    const onDown = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) onClose?.();
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [onClose]);

  // Không auto-focus item đầu → tránh auto highlight; chỉ highlight khi :hover hoặc :focus-visible
  const callOrToast = useCallback((fn) => {
    if (typeof fn === "function") return fn(card);
    if (window?.toast?.info) window.toast.info("Tính năng sắp có");
  }, [card]);

  const handleSelect = useCallback(async (key) => {
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
  }, [card, onSelect, onOpenFullCard, onRename, onEditLabels, onAddChecklist, onAddAttachment, onEditMembers, onEditDueDate, onDelete, onClose, callOrToast]);

  // Keyboard trên toàn menu: ESC đóng, ↑/↓ di chuyển focus (focus item đầu nếu chưa focus)
  const onKeyDownMenu = useCallback((e) => {
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
  }, [items.length, onClose]);

  return (
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
    </Wrap>
  );
}

/* ================= Styled ================= */

const Wrap = styled.div`
  position: absolute;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0,0,0,.18);
  z-index: 2000;
  padding: 8px 0;
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

  &:hover, &:focus-visible {
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
  b { font-size: 14px; font-weight: 600; line-height: 1.15; }
  small { font-size: 12px; color: currentColor; opacity: 0.8; }
`;
