import React, { useState, useEffect, useRef, useCallback, useMemo, lazy, Suspense } from 'react';
import { BiLabel } from 'react-icons/bi';
import { BsClock } from 'react-icons/bs';
import { HiOutlineUserAdd } from 'react-icons/hi';
import { MdChecklist } from 'react-icons/md';
import { IoCloseOutline, IoChevronDown } from 'react-icons/io5';
import toast from 'react-hot-toast';
import client from '../../../api/apiClient'; // Đảm bảo import đúng đường dẫn
import DueDatePopup from '../Due/DueDatePopup';
import InlineDateBlock from '../Due/InlineDateBlock';

import { createPortal } from "react-dom";

import {
  getCardComments,
  updateCardDescription,
  updateCard,
} from '../../../api/cardApi';

import {
  fetchBoardLabels,
  createBoardLabel,
  updateBoardLabel,    
  deleteBoardLabel,  
} from '../../../api/boardApi'

import {
   getCardAttachments,
   updateAttachment,
   deleteAttachment
 } from '../../../api/attachmentApi';

import {
  getCardChecklists,
  createChecklist,
  updateChecklist,
  deleteChecklist,
  createChecklistItem,
  updateChecklistItem,
  deleteChecklistItem,
  toggleChecklistItem,
} from '../../../api/checklistApi';

// Components
import AttachmentPopup from '../Attachment/AttachmentPopup';
import AddToCardMenu from '../AddToCardMenu'
import CardDescription from '../sections/CardDescription';
import CardAttachments from '../sections/CardAttachments';
import CardChecklists from '../sections/CardChecklists';
import CardComments from '../sections/CardComments';
import CardMetaBar from '../sections/CardMetaBar';
import CheckListPopup from '../../ChecklistCard/CheckListPopup';
import MemberCardPopup from '../../member/MemberCardPopup';
import LabelPopup from '../../Label/LabelPopup';
// Styled Components
import * as S from './FullCardModal.styles';

const ActivityList = lazy(() => import('../activity/ActivityList'));

export default function FullCardModal({ 
  card, 
  onClose, 
  onCardUpdate,
  currentUser 
}) {
  // ============= STATE MANAGEMENT =============
  const [localCard, setLocalCard] = useState({
    ...card,
    labels: card.labels || [], 
    checklists: card.checklists || [],
    attachments: card.attachments || []
  });

  // --- LABEL STATE (MỚI) ---
  // Quản lý danh sách label có sẵn trong state để cập nhật tức thì
  const [availableLabels, setAvailableLabels] = useState([]);

  useEffect(() => {
    // Lấy danh sách label từ props khi mở modal
    const initialLabels = card.board_labels || card.labels_available || [];
    setAvailableLabels(initialLabels);
  }, [card.board_labels, card.labels_available]);

  // --- END LABEL STATE ---

  const [title, setTitle] = useState(card.name || card.title || '');
  const [description, setDescription] = useState(card.description || '');
  const [tempDesc, setTempDesc] = useState(description);
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [isComplete, setIsComplete] = useState(!!card.completed);

  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  
  const [attachments, setAttachments] = useState([]);
  const [saveState, setSaveState] = useState({ saving: false, error: null });

  // Popup states
  const [showChecklistPopup, setShowChecklistPopup] = useState(false);
  const [showAttachmentPopup, setShowAttachmentPopup] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showMembersPopup, setShowMembersPopup] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  
  // Label Popup State
  const [showLabelPopup, setShowLabelPopup] = useState(false);
  const [labelAnchor, setLabelAnchor] = useState(null);

  // Anchor refs for popups
  const [checklistAnchor, setChecklistAnchor] = useState(null);
  const [attachmentAnchor, setAttachmentAnchor] = useState(null);
  const [addMenuAnchor, setAddMenuAnchor] = useState(null);
  const [membersAnchor, setMembersAnchor] = useState(null);

  const [showDueDatePopup, setShowDueDatePopup] = useState(false);
  const [dueDateAnchor, setDueDateAnchor] = useState(null);

  // Refs
  const overlayRef = useRef();
  const modalRef = useRef();
  const checklistPopupRef = useRef();
 
  // 1. Chuẩn hóa boardId để dùng xuyên suốt
  const boardId = useMemo(() => {
    return card.board_id || card.list?.board_id || card.list?.board?.id || card.boardId;
  }, [card]);

  // ============= HELPER FUNCTIONS =============
  const setCardAndBubble = useCallback((updater) => {
    setLocalCard(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      onCardUpdate?.(next);
      return next;
    });
  }, [onCardUpdate]);

  const closeAllPopups = () => {
    setShowChecklistPopup(false);
    setShowAttachmentPopup(false);
    setShowAddMenu(false);
    setShowMembersPopup(false);
    setShowDueDatePopup(false);
    setShowLabelPopup(false); // Đóng cả Label popup
  };

  // ============= FETCH DATA =============
  const fetchAttachments = useCallback(async () => {
    try {
      const res = await getCardAttachments(card.id);
      setAttachments(res);
      setLocalCard(prev => ({ ...prev, attachments: res }));
    } catch (err) {
      console.error('Failed to load attachments:', err);
    }
  }, [card.id]);

  const loadComments = useCallback(async () => {
    setLoadingComments(true);
    try {
      const commentsData = await getCardComments(card.id);
      setComments(commentsData);
    } catch (error) {
      console.error('Failed to load comments:', error);
      toast.error('Failed to load comments');
    } finally {
      setLoadingComments(false);
    }
  }, [card.id]);

  // ============= EFFECTS =============
  useEffect(() => {
    // Sync local state when prop 'card' changes significantly
    setLocalCard(prev => ({ 
      ...prev, 
      ...card, 
      labels: card.labels || prev.labels || [], 
      checklists: card.checklists || prev.checklists || [] 
    }));
  }, [card]);

  useEffect(() => {
    if (card?.id) fetchAttachments();
    if (card?.id) loadComments();
  }, [card?.id, fetchAttachments, loadComments]);

  // FullCardModal.jsx - Line ~110
  useEffect(() => {
    const loadLabels = async () => {
      try {
        const boardId = card.board_id || card.list?.board_id;
        if (!boardId) return;
        
        const { data } = await fetchBoardLabels(boardId); // ✅ DÙNG API CÓ SẴN
        setAvailableLabels(data);
      } catch (err) {
        console.error('Failed to load labels:', err);
      }
    };
    loadLabels();
  }, [card.board_id, card.list?.board_id]);

  useEffect(() => {
    if (!card.checklists || card.checklists.length === 0) {
      (async () => {
        try {
          const data = await getCardChecklists(card.id);
          setLocalCard(prev => ({ ...prev, checklists: data }));
        } catch (e) {
          console.error('fetch checklists failed', e);
        }
      })();
    }
  }, [card.id, card.checklists]);

  
  // 2. Load danh sách Labels của Board
  useEffect(() => {
    if (!boardId) return;
    const loadLabels = async () => {
      try {
        const { data } = await fetchBoardLabels(boardId);
        setAvailableLabels(data);
      } catch (err) {
        console.error('Failed to load board labels:', err);
      }
    };
    loadLabels();
  }, [boardId]);


  // ============= LABEL HANDLERS (LOGIC MỚI) =============
  
  // 1. Toggle Label (Gắn/Gỡ)
  const handleToggleLabel = async (labelId, labelObj = null) => {
    // labelObj: Truyền vào nếu là label vừa mới tạo (để tránh lỗi chưa có trong state availableLabels)
    
    const currentLabels = localCard.labels || [];
    const isSelected = currentLabels.some(l => l.id === labelId);
    let nextLabels;

    if (isSelected) {
      // Gỡ label
      nextLabels = currentLabels.filter(l => l.id !== labelId);
    } else {
      // Gắn label
      // Nếu có labelObj (từ hành động Create) thì dùng luôn, không thì tìm trong availableLabels
      const labelToAdd = labelObj || availableLabels.find(l => l.id === labelId);
      
      if (!labelToAdd) {
         console.warn("Label not found to add:", labelId);
         return;
      }
      nextLabels = [...currentLabels, labelToAdd];
    }

    setCardAndBubble(prev => ({ ...prev, labels: nextLabels }));

    // API Call
    try {
      // Gửi lên server mảng chứa các ID
      const labelIds = nextLabels.map(l => l.id);
      await updateCard(card.id, { labels: labelIds });
    } catch (err) {
      console.error('Failed to update card labels', err);
      toast.error('Failed to update labels');
      // Revert UI nếu lỗi
      setCardAndBubble(prev => ({ ...prev, labels: currentLabels }));
    }
  };

  // 2. Create Label
  const handleCreateLabel = async (data) => {
    if (!boardId) {
      toast.error("Missing Board ID");
      return;
    }

    try {
      // Gọi API tạo Label trong Board
      const { data: newLabel } = await createBoardLabel(boardId, {
        name: data.name,
        color: data.color,
      });

      // 1. Cập nhật danh sách availableLabels
      setAvailableLabels((prev) => [...prev, newLabel]);

      // 2. Tự động gán Label mới này vào Card luôn
      // TRUYỀN TRỰC TIẾP newLabel vào hàm toggle để tránh lỗi state chưa kịp cập nhật
      await handleToggleLabel(newLabel.id, newLabel); 

      toast.success("Label created");
    } catch (err) {
      console.error("Create label failed:", err);
      toast.error("Failed to create label");
    }
  };

  // 3. Edit Label
  const handleEditLabel = async (labelId, data) => {
    try {
      const { data: updatedLabel } = await updateBoardLabel(boardId, labelId, data);

      // Cập nhật trong kho labels có sẵn
      setAvailableLabels((prev) =>
        prev.map((l) => (l.id === labelId ? updatedLabel : l))
      );

      // Cập nhật label trên card hiện tại (nếu card đang gắn label đó)
      setCardAndBubble((prev) => ({
        ...prev,
        labels: prev.labels.map((l) => (l.id === labelId ? updatedLabel : l)),
      }));

    } catch (err) {
      console.error("Edit label failed", err);
      toast.error("Failed to update label");
    }
  };

  // 4. Delete Label
  const handleDeleteLabel = async (labelId) => {
    if (!window.confirm("Delete this label permanently?")) return;
    
    try {
      await deleteBoardLabel(boardId, labelId);

      // Xóa khỏi kho labels
      setAvailableLabels((prev) => prev.filter((l) => l.id !== labelId));

      // Gỡ khỏi card hiện tại
      setCardAndBubble((prev) => ({
        ...prev,
        labels: prev.labels.filter((l) => l.id !== labelId),
      }));

      toast.success("Label deleted");
    } catch (err) {
      console.error("Delete label failed", err);
      toast.error("Failed to delete label");
    }
  };


  // ============= OTHER HANDLERS =============

  const handleToggleComplete = async () => {
    const updated = !isComplete;
    setIsComplete(updated);
    try {
      await client.patch(`/cards/${card.id}/`, { completed: updated });
      onCardUpdate({ ...card, completed: updated });
    } catch (err) {
      console.error('Failed to update card completion:', err);
      setIsComplete(!updated);
    }
  };

  const handleTitleSave = async () => {
    if (!title || title === card.name) return;
    const originalTitle = card.name;
    setSaveState({ saving: true, error: null });
    try {
      onCardUpdate({ ...card, name: title });
      await client.patch(`/cards/${card.id}/`, { name: title });
    } catch (err) {
      onCardUpdate({ ...card, name: originalTitle });
      setSaveState({ saving: false, error: err.message });
      toast.error('Failed to save title');
    }
  };

  const handleTitleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleTitleSave();
    }
  };

  const handleSaveDescription = async () => {
    if (tempDesc === description) {
      setIsEditingDesc(false);
      return;
    }
    setSaveState({ saving: true, error: null });
    try {
      await updateCardDescription(card.id, tempDesc);
      setDescription(tempDesc);
      onCardUpdate({ ...card, description: tempDesc });
      setIsEditingDesc(false);
      toast.success('Description updated');
    } catch (err) {
      console.error('Failed to save description:', err);
      toast.error('Failed to save description');
    } finally {
      setSaveState({ saving: false, error: null });
    }
  };

  const handleCancelDescription = () => {
    setTempDesc(description);
    setIsEditingDesc(false);
  };
  // Checklist Handlers
  const handleCreateChecklist = async ({ title }) => {
    try {
      const newCL = await createChecklist(card.id, { title });  
      setCardAndBubble(prev => ({
        ...prev,
        checklists: [...(prev.checklists || []), { ...newCL, items: newCL.items || [] }]
      }));
    } catch (e) {
      console.error('create checklist failed', e.response?.data || e);
    }
  };

  const handleChecklistTitle = async (clId, newTitle) => {
    const backup = localCard;
    setCardAndBubble(prev => ({
      ...prev,
      checklists: (prev.checklists || []).map(cl => 
        cl.id === clId ? { ...cl, title: newTitle } : cl
      )
    }));
    try {
      await updateChecklist(clId, { title: newTitle });
    } catch (e) {
      setLocalCard(backup);
      onCardUpdate?.(backup);
    }
  };

  const handleAddItem = async (clId, text) => {
    const name = (text || "").trim();
    if (!name) return;
    const tempId = `tmp_${Date.now()}`;
    const optimistic = { id: tempId, text: name, completed: false };

    setCardAndBubble(prev => ({
      ...prev,
      checklists: prev.checklists.map(cl => 
        cl.id === clId ? { ...cl, items: [...(cl.items || []), optimistic] } : cl
      )
    }));

    try {
      const real = await createChecklistItem(clId, { text: name });
      setCardAndBubble(prev => ({
        ...prev,
        checklists: prev.checklists.map(cl => {
          if (cl.id !== clId) return cl;
          return { 
            ...cl, 
            items: (cl.items || []).map(it => it.id === tempId ? real : it) 
          };
        })
      }));
    } catch (e) {
      setCardAndBubble(prev => ({
        ...prev,
        checklists: prev.checklists.map(cl => 
          cl.id === clId 
            ? { ...cl, items: (cl.items || []).filter(it => it.id !== tempId) } 
            : cl
        )
      }));
    }
  };

  const handleDeleteItem = async (clId, itemId) => {
    const backup = localCard;
    setCardAndBubble(prev => ({
      ...prev,
      checklists: prev.checklists.map(cl => 
        cl.id === clId 
          ? { ...cl, items: (cl.items || []).filter(it => it.id !== itemId) } 
          : cl
      )
    }));
    try {
      await deleteChecklistItem(itemId);
    } catch (e) {
      setLocalCard(backup);
      onCardUpdate?.(backup);
    }
  };

  const handleToggleItem = async (clId, itemId) => {
    const current = localCard.checklists.find(c => c.id === clId)?.items?.find(i => i.id === itemId);
    if (!current) return;
    const newCompleted = !current.completed;

    setCardAndBubble(prev => ({
      ...prev,
      checklists: prev.checklists.map(cl =>
        cl.id === clId
          ? { ...cl, items: cl.items.map(it => it.id === itemId ? { ...it, completed: newCompleted } : it) }
          : cl
      ),
    }));

    try {
      await toggleChecklistItem(itemId, newCompleted);
    } catch (e) {
      setCardAndBubble(prev => ({
        ...prev,
        checklists: prev.checklists.map(cl =>
          cl.id === clId
            ? { ...cl, items: cl.items.map(it => it.id === itemId ? { ...it, completed: !newCompleted } : it) }
            : cl
        ),
      }));
    }
  };

  const handleDeleteChecklist = async (clId) => {
    const backup = localCard;
    setCardAndBubble(prev => ({
      ...prev,
      checklists: (prev.checklists || []).filter(cl => cl.id !== clId),
    }));
    try {
      await deleteChecklist(clId);
    } catch (e) {
      setLocalCard(backup);
      onCardUpdate?.(backup);
    }
  };

  // Attachment & Comment handlers (giữ nguyên logic gốc của bạn)
  const handleAttachmentAdded = (attachment) => {
    setCardAndBubble((prev) => ({
      ...prev,
      attachments: [attachment, ...(prev.attachments || [])]
    }));
    setAttachments(prev => [attachment, ...prev]);
  };

  const handleSetCover = async (id) => {
    try {
      await updateAttachment(id, { is_cover: true });
      setCardAndBubble((prev) => ({
        ...prev,
        attachments: prev.attachments.map((att) => ({ ...att, is_cover: att.id === id }))
      }));
      setAttachments(prev => prev.map(att => ({ ...att, is_cover: att.id === id })));
      toast.success('Cover set successfully');
    } catch (err) {
      toast.error('Failed to set cover');
    }
  };

  const handleRemoveCover = async (id) => {
    try {
      await updateAttachment(id, { is_cover: false });
      setCardAndBubble((prev) => ({
        ...prev,
        attachments: prev.attachments.map((att) => ({ ...att, is_cover: att.id === id ? false : att.is_cover }))
      }));
      setAttachments(prev => prev.map(att => ({ ...att, is_cover: att.id === id ? false : att.is_cover })));
    } catch (err) {
      toast.error('Failed to remove cover');
    }
  };

  const handleDeleteAttachment = async (id) => {
    try {
      await deleteAttachment(id);
      setCardAndBubble((prev) => ({
        ...prev,
        attachments: prev.attachments.filter((att) => att.id !== id)
      }));
      setAttachments(prev => prev.filter(att => att.id !== id));
      toast.success('Attachment deleted');
    } catch (err) {
      toast.error('Failed to delete attachment');
    }
  };

  // Comment Handlers
  const handleReply = (parentId, author) => setReplyingTo({ id: parentId, author });
  const handleCancelReply = () => setReplyingTo(null);
  const handleCommentAdded = (c) => setComments(prev => [c, ...prev]);
  const handleCommentReplaced = (tempId, real) => {
    setComments(prev => {
      const next = prev.map((c) => (c.temp_id === tempId ? real : c));
      next.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      return next;
    });
  };
  const handleCommentRemove = (tempId) => setComments(prev => prev.filter(c => c.temp_id !== tempId));
  const handleCommentUpdated = (commentId, updated) => setComments((prev) => prev.map((c) => (c.id === commentId ? { ...c, ...updated } : c)));
  const handleCommentDeleted = (commentId) => setComments(prev => prev.filter(comment => comment.id !== commentId));

  // Click Outside
  const handleClickOutside = useCallback((e) => {
    if (e.target === overlayRef.current) {
      closeAllPopups();
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

  const isBoardCard = !!(card.board || card.board_id || card.list);

  const handleAddMenuSelect = useCallback((type) => {
    setShowAddMenu(false);
    closeAllPopups();

    switch (type) {
      case "labels":
        // Xử lý khi chọn label từ Add Menu (nếu cần, hiện tại dùng nút riêng)
        const rectLabel = addMenuAnchor;
        setLabelAnchor(rectLabel);
        setShowLabelPopup(true);
        break;
      case "dates":
        const rectDate = addMenuAnchor;
        setDueDateAnchor(rectDate);
        setShowDueDatePopup(true);
        break;
      case "checklist":
        const rectCL = addMenuAnchor;
        setChecklistAnchor(rectCL);
        setShowChecklistPopup(true);
        break;
      case "members":
        const rectMB = addMenuAnchor;
        setMembersAnchor(rectMB);
        setShowMembersPopup(true);
        break;
      case "attachment":
        const rectAT = addMenuAnchor;
        setAttachmentAnchor(rectAT);
        setShowAttachmentPopup(true);
        break;
      default: break;
    }
  }, [addMenuAnchor]);

  return createPortal(
  (
    <S.Overlay ref={overlayRef}>
      <S.ModalContainer ref={modalRef}>
        {/* Header */}
        <S.HeaderBar>
          <S.HeaderLeft>
            <S.TitleButton aria-label="Open card menu">
              <S.CardTitle>{title}</S.CardTitle>
              <S.DropIcon aria-hidden="true"><IoChevronDown size={20} /></S.DropIcon>
            </S.TitleButton>
          </S.HeaderLeft>

          <S.HeaderRight>
            <S.IconBtn title="Feedback">📢</S.IconBtn>
            <S.IconBtn title="Cover">🖼️</S.IconBtn>
            <S.IconBtn title="Actions">⋯</S.IconBtn>
            <S.CloseBtn onClick={onClose} aria-label="Close">
              <IoCloseOutline size={24} />
            </S.CloseBtn>
          </S.HeaderRight>
        </S.HeaderBar>
        
        {/* Meta Bar - Updated to toggle popups correctly */}
        <CardMetaBar
          labels={localCard?.labels || []}
          dueDate={localCard?.due_date || null}
          members={localCard?.members || []}

          onClickLabels={(e) => {
            e.stopPropagation(); // Ngăn chặn nổi bọt
            closeAllPopups();
            const rect = e.currentTarget.getBoundingClientRect();
            setLabelAnchor(rect);
            setShowLabelPopup(true);
          }}

          onClickDueDate={(e) => {
            e.stopPropagation();
            closeAllPopups();
            const rect = e.currentTarget.getBoundingClientRect();
            setDueDateAnchor(rect);
            setShowDueDatePopup(true);
          }}
          onClickMembers={(e) => {
            e.stopPropagation();
            closeAllPopups();
            if (isBoardCard) {
              const rect = e.currentTarget.getBoundingClientRect();
              setMembersAnchor(rect);
              setShowMembersPopup(true);
            }
          }}
        />

        {(localCard.start_date || localCard.due_date) && (
          <InlineDateBlock
            card={localCard}
            onUpdated={(patch) => setLocalCard((prev) => ({ ...prev, ...patch }))}
          />
        )}

        {/* BODY */}
        <S.ContentBody>
          <S.MainColumn>
            <S.TitleSection>
              <S.TitleCheckboxWrapper>
                <S.CompleteCheckbox
                  type="checkbox"
                  checked={isComplete}
                  onChange={handleToggleComplete}
                />
              </S.TitleCheckboxWrapper>

              <S.TitleContent>
                <S.EditableTitle
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onKeyDown={handleTitleKeyDown}
                  onBlur={handleTitleSave}
                  placeholder="Card title"
                />
              </S.TitleContent>
            </S.TitleSection>

            {/* ACTION BUTTONS */}
            <S.ActionSectionGrid>
              <S.EmptyIconSpace />
              <S.ActionSectionBody>
                <S.ActionButton
                  onClick={(e) => {
                    closeAllPopups();
                    const rect = e.currentTarget.getBoundingClientRect();
                    setAddMenuAnchor(rect);
                    setShowAddMenu((prev) => !prev);
                  }}
                >
                  + Add
                </S.ActionButton>

                <S.ActionButton
                  onClick={(e) => {
                    closeAllPopups();
                    const rect = e.currentTarget.getBoundingClientRect();
                    setLabelAnchor(rect);
                    setShowLabelPopup(true);
                  }}
                >
                  <BiLabel /> Labels
                </S.ActionButton>

                <S.ActionButton
                  onClick={(e) => {
                    closeAllPopups();
                    const rect = e.currentTarget.getBoundingClientRect();
                    setDueDateAnchor(rect);
                    setShowDueDatePopup(true);
                  }}
                >
                  <BsClock /> Dates
                </S.ActionButton>

                <S.ActionButton
                  onClick={(e) => {
                    closeAllPopups();
                    const rect = e.currentTarget.getBoundingClientRect();
                    setChecklistAnchor(rect);
                    setShowChecklistPopup(true);
                  }}
                >
                  <MdChecklist /> Checklist
                </S.ActionButton>

                <S.ActionButton
                  disabled={!isBoardCard}
                  onClick={(e) => {
                    if (!isBoardCard) return;
                    closeAllPopups();
                    const rect = e.currentTarget.getBoundingClientRect();
                    setMembersAnchor(rect);
                    setShowMembersPopup(true);
                  }}
                >
                  <HiOutlineUserAdd /> Members
                </S.ActionButton>

                <S.ActionButton
                  onClick={(e) => {
                    closeAllPopups();
                    const rect = e.currentTarget.getBoundingClientRect();
                    setAttachmentAnchor(rect);
                    setShowAttachmentPopup(true);
                  }}
                >
                  📎 Attachment
                </S.ActionButton>
              </S.ActionSectionBody>
            </S.ActionSectionGrid>

            {/* DESCRIPTION */}
            <CardDescription
              description={description}
              isEditing={isEditingDesc}
              tempDesc={tempDesc}
              onTempChange={setTempDesc}
              onSave={handleSaveDescription}
              onCancel={handleCancelDescription}
              saving={saveState.saving}
              onStartEdit={() => setIsEditingDesc(true)}
            />

            {/* ATTACHMENTS */}
            <CardAttachments
              attachments={attachments}
              onAddClick={() => setShowAttachmentPopup(true)}
              onSetCover={handleSetCover}
              onRemoveCover={handleRemoveCover}
              onDelete={handleDeleteAttachment}
            />

            {/* CHECKLISTS */}
            <CardChecklists
              checklists={localCard.checklists || []}
              onChangeTitle={handleChecklistTitle}
              onAddItem={handleAddItem}
              onToggleItem={handleToggleItem}
              onDeleteItem={handleDeleteItem}
              onDeleteChecklist={handleDeleteChecklist}
            />
          </S.MainColumn>

          {/* SIDEBAR */}
          <S.Sidebar>
            <CardComments
              cardId={card.id}
              currentUser={currentUser}
              comments={comments}
              loading={loadingComments}
              replyingTo={replyingTo}
              onReply={handleReply}
              onCancelReply={handleCancelReply}
              onCommentAdded={handleCommentAdded}
              onCommentReplaced={handleCommentReplaced}
              onCommentRemove={handleCommentRemove}
              onCommentUpdated={handleCommentUpdated}
              onCommentDeleted={handleCommentDeleted}
            />

            <S.Section>
              <S.ActivityHeader>
                <S.SectionLabel>Activity</S.SectionLabel>
                <S.ShowDetailsButton onClick={() => setShowDetails(!showDetails)}>
                  {showDetails ? 'Hide details' : 'Show details'}
                </S.ShowDetailsButton>
              </S.ActivityHeader>

              {showDetails && (
                <Suspense fallback={<div>Loading activity…</div>}>
                  <ActivityList cardId={card.id} />
                </Suspense>
              )}
            </S.Section>
          </S.Sidebar>
        </S.ContentBody>
      </S.ModalContainer>

      {/* POPUPS SECTION */}
      
      {/* 1. CHECKLIST POPUP */}
      {showChecklistPopup && (
        <CheckListPopup
          ref={checklistPopupRef}
          anchorRect={checklistAnchor}
          onClose={() => setShowChecklistPopup(false)}
          existingChecklists={localCard?.checklists || []}
          onSubmit={handleCreateChecklist}
        />
      )}

      {/* 2. ATTACHMENT POPUP */}
      {showAttachmentPopup && (
        <S.PopupOverlay>
          <AttachmentPopup
            cardId={card.id}
            onClose={() => setShowAttachmentPopup(false)}
            onAttachmentAdded={handleAttachmentAdded}
          />
        </S.PopupOverlay>
      )}

      {/* 3. DUE DATE POPUP */}
      {showDueDatePopup && dueDateAnchor && (
        <DueDatePopup
          anchorRect={dueDateAnchor}
          card={localCard}
          onClose={() => setShowDueDatePopup(false)}
          onUpdated={(fields) => {
            setCardAndBubble(prev => ({ ...prev, ...fields }));
            toast.success('Dates updated');
          }}
        />
      )}

      {/* 4. ADD MENU POPUP */}
      {showAddMenu && addMenuAnchor && (
        <AddToCardMenu
          anchorRect={addMenuAnchor}
          onClose={() => setShowAddMenu(false)}
          onSelect={handleAddMenuSelect}
        />
      )}

      {/* 5. LABEL POPUP (UPDATED) */}
      {showLabelPopup && labelAnchor && (
        <LabelPopup
          anchorRect={labelAnchor}
          labels={availableLabels} // Dùng state mới
          selectedLabelIds={localCard.labels?.map(l => l.id) || []}
          
          onToggleLabel={handleToggleLabel}
          onCreateLabel={handleCreateLabel}
          onEditLabel={handleEditLabel}
          onDeleteLabel={handleDeleteLabel}

          onClose={() => setShowLabelPopup(false)}
          boardId={boardId}
        />
      )}

      {/* 6. MEMBER POPUP */}
      {isBoardCard && showMembersPopup && membersAnchor && (
        <MemberCardPopup
          anchorRect={membersAnchor}
          cardId={card.id}
          boardId={card.board || card.board_id}
          assigned={localCard.members?.map(m => m.id) || []}
          onClose={() => setShowMembersPopup(false)}
          onUpdated={(members) => {
            setCardAndBubble(prev => ({ ...prev, members }));
            toast.success("Members updated");
          }}
        />
      )}
    </S.Overlay>
  ),
  document.body
);
}