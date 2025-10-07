import React, { useEffect, useRef } from "react";
import styled from "styled-components";
import { BiLabel } from "react-icons/bi";
import { BsClock } from "react-icons/bs";
import { MdChecklist } from "react-icons/md";
import { HiOutlineUserAdd } from "react-icons/hi";
import { FiPaperclip } from "react-icons/fi";
import { TbListDetails } from "react-icons/tb";

export default function AddToCardMenu({ anchorRect, onClose, onSelect }) {
  const menuRef = useRef(null);

  useEffect(() => {
    const h = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [onClose]);

  return (
    <Menu ref={menuRef} style={{ top: anchorRect.bottom + window.scrollY + 8, left: anchorRect.left }}>
      <Hdr>Add to card</Hdr>
      <List>
        <Item onClick={() => onSelect("labels")}><BiLabel/><Txt><b>Labels</b><small>Organize, categorize, and prioritize</small></Txt></Item>
        <Item onClick={() => onSelect("dates")}><BsClock/><Txt><b>Dates</b><small>Start date, due date, reminders</small></Txt></Item>
        <Item onClick={() => onSelect("checklist")}><MdChecklist/><Txt><b>Checklist</b><small>Add subtasks</small></Txt></Item>
        <Item onClick={() => onSelect("members")}><HiOutlineUserAdd/><Txt><b>Members</b><small>Assign members</small></Txt></Item>
        <Item onClick={() => onSelect("attachment")}><FiPaperclip/><Txt><b>Attachment</b><small>Attach links & files</small></Txt></Item>
        <Item onClick={() => onSelect("custom_fields")}><TbListDetails/><Txt><b>Custom Fields</b><small>Create your own fields</small></Txt></Item>
      </List>
    </Menu>
  );
}

const Menu = styled.div`
  position:absolute; width:280px; background:#fff; border-radius:8px;
  box-shadow:0 8px 20px rgba(0,0,0,.2); z-index:2000; padding:8px 0;
`;
const Hdr = styled.div`font-weight:600;font-size:14px;color:#172b4d;padding:8px 16px;border-bottom:1px solid #dfe1e6;`;
const List = styled.div`display:flex;flex-direction:column;padding:4px 0;`;
const Item = styled.button`
  display:flex;align-items:flex-start;gap:10px;padding:10px 16px;width:100%;
  background:none;border:none;text-align:left;cursor:pointer;color:#172b4d;
  &:hover{background:#f4f5f7;} svg{width:18px;height:18px;color:#44546f;margin-top:2px;}
`;
const Txt = styled.div`
  display:flex;flex-direction:column;
  b{font-size:14px;font-weight:500;} small{font-size:12px;color:#6b778c;}
`;
