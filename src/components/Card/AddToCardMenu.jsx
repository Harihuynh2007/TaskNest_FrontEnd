import React, { useEffect, useMemo, useRef, useCallback } from "react";
import styled from "styled-components";
import { BiLabel } from "react-icons/bi";
import { BsClock } from "react-icons/bs";
import { MdChecklist } from "react-icons/md";
import { HiOutlineUserAdd } from "react-icons/hi";
import { FiPaperclip } from "react-icons/fi";
import { TbListDetails } from "react-icons/tb";

export default function AddToCardMenu({
  anchorRect,
  onClose,
  onSelect,
}) {
  const menuRef = useRef(null);
  const itemRefs = useRef([]);

  const items = useMemo(
    () => [
      { key: "labels", icon: <BiLabel />, title: "Labels", sub: "Organize, categorize, and prioritize" },
      { key: "dates", icon: <BsClock />, title: "Dates", sub: "Start date, due date, reminders" },
      { key: "checklist", icon: <MdChecklist />, title: "Checklist", sub: "Add subtasks" },
      { key: "members", icon: <HiOutlineUserAdd />, title: "Members", sub: "Assign members" },
      { key: "attachment", icon: <FiPaperclip />, title: "Attachment", sub: "Attach links & files" },
      { key: "custom_fields", icon: <TbListDetails />, title: "Custom Fields", sub: "Create your own fields" },
    ],
    []
  );

  // Tính toán vị trí và clamp trong viewport
  const positionStyle = useMemo(() => {
    const GAP = 8;
    const width = 280;
    let top = anchorRect?.bottom + window.scrollY + GAP;
    let left = anchorRect?.left ?? 0;

    // Nếu vượt mép phải, đẩy vào trong
    const maxLeft = window.innerWidth - width - GAP;
    if (left > maxLeft) left = Math.max(GAP, maxLeft);

    // Nếu vượt mép dưới (không đủ chỗ), hiển thị phía trên anchor
    const approxHeight = 320; // ước lượng đủ dùng để clamp cơ bản
    const fitsBelow = top + approxHeight < window.scrollY + window.innerHeight;
    if (!fitsBelow) {
      top = (anchorRect?.top ?? 0) + window.scrollY - approxHeight - GAP;
      if (top < window.scrollY + GAP) top = window.scrollY + GAP;
    }

    return { top, left };
  }, [anchorRect]);

  // Click outside để đóng
  useEffect(() => {
    const handleMouseDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) onClose?.();
    };
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [onClose]);

  // Focus item đầu tiên khi mở
  useEffect(() => {
    const t = setTimeout(() => {
      itemRefs.current?.[0]?.focus?.();
    }, 0);
    return () => clearTimeout(t);
  }, []);

  // Keyboard: ESC để đóng, ↑/↓ để di chuyển focus
  const onKeyDownMenu = useCallback((e) => {
    const idx = itemRefs.current.findIndex((el) => el === document.activeElement);
    if (e.key === "Escape") {
      e.preventDefault();
      onClose?.();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = (idx + 1) % items.length;
      itemRefs.current[next]?.focus?.();
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev = (idx - 1 + items.length) % items.length;
      itemRefs.current[prev]?.focus?.();
      return;
    }
  }, [items.length, onClose]);

  const handleSelect = useCallback((key) => {
    onSelect?.(key);
    // đóng sau khi chọn
    onClose?.();
  }, [onSelect, onClose]);

  return (
    <Menu
      ref={menuRef}
      role="menu"
      aria-label="Add to card"
      style={positionStyle}
      onKeyDown={onKeyDownMenu}
    >
      <Hdr>Add to card</Hdr>
      <List>
        {items.map((it, i) => (
          <Item
            key={it.key}
            ref={(el) => (itemRefs.current[i] = el)}
            role="menuitem"
            tabIndex={0}
            onClick={() => handleSelect(it.key)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleSelect(it.key);
              }
            }}
            title={it.title}
          >
            <IconWrap>{it.icon}</IconWrap>
            <Txt>
              <b>{it.title}</b>
              <small>{it.sub}</small>
            </Txt>
          </Item>
        ))}
      </List>
    </Menu>
  );
}

/* ===================== Styled ===================== */

const Menu = styled.div`
  position: absolute;
  width: 280px;
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
