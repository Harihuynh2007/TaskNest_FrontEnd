// src/features/boards/panes/inbox-menu/InboxMenu.jsx
import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import styled from "styled-components";
import { ChevronRight, Brain, Filter, Settings, SortAsc } from "lucide-react";
import ReactDOM from "react-dom";

export default function InboxMenu({ position, onClose, onSelect }) {
  const menuRef = useRef(null);

  // Đóng menu khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose?.();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const items = [
    { key: "sort", label: "Sort cards", icon: <SortAsc size={18} /> },
    { key: "filter", label: "Filter cards", icon: <Filter size={18} /> },
    { key: "ai", label: "AI Smart Assistant", icon: <Brain size={18} /> },
    { key: "settings", label: "Settings", icon: <Settings size={18} /> },
  ];

  const menuEl = (
    <MenuContainer
      ref={menuRef}
      as={motion.section}
      initial={{ opacity: 0, scale: 0.95, y: -4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -6 }}
      transition={{ duration: 0.18 }}
      style={{
        position: "absolute",
        top: position?.top || 100,
        left: position?.left || 100,
      }}
      role="menu"
      aria-label="Inbox options"
    >
      <ul>
        {items.map((item) => (
          <MenuItem
            key={item.key}
            onClick={() => {
              onSelect?.(item.key);
              onClose?.();
            }}
          >
            <div className="left">
              {item.icon}
              <span>{item.label}</span>
            </div>
            <ChevronRight size={16} className="arrow" />
          </MenuItem>
        ))}
      </ul>
    </MenuContainer>
  );

  return ReactDOM.createPortal(menuEl, document.body);
}

const MenuContainer = styled.div`
  position: fixed;
  width: 260px;
  background: rgba(23, 28, 38, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(16px);
  color: #e5eaf2;
  z-index: 9999;
  overflow: hidden;

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }
`;


const MenuItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  gap: 10px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.1s ease;

  .left {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .arrow {
    opacity: 0.5;
  }

  &:hover {
    background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%);
    transform: translateY(-1px);
  }

  &:active {
    transform: scale(0.97);
  }
`;
