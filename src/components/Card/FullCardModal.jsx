import React, { useState, useEffect, useRef, useCallback,useMemo,  lazy, Suspense } from 'react';
import styled from 'styled-components';
import { BiLabel } from 'react-icons/bi';
import { BsClock } from 'react-icons/bs';
import { HiOutlineUserAdd } from 'react-icons/hi';
import { MdChecklist } from 'react-icons/md';
import { IoCloseOutline } from 'react-icons/io5';
import { IoChevronDown } from 'react-icons/io5';
import { HiOutlineMenuAlt2 } from 'react-icons/hi';
import toast from 'react-hot-toast';
import axios from '../../api/apiClient';
import api from '../../api/apiClient'; 

import * as cardApi from '../../api/cardApi'; // ✅ Fixed import

// Import new components
import Comment from './Comment/Comment';
import CommentInput from './Comment/CommentInput';

import AttachmentPopup from '../Attachment/AttachmentPopup';
import AttachmentItem from '../Attachment/AttachmentItem';

import ActivityList from './activity/ActivityList';

import AddToCardMenu from './AddToCardMenu';

import CardDescription from './sections/CardDescription';
import CardAttachments from './sections/CardAttachments';
import CardChecklists from './sections/CardChecklists';
import CardComments from './sections/CardComments';
import CardActivity from './sections/CardActivity';
import CardMetaBar from './sections/CardMetaBar';

import { getCardComments, updateCardDescription } from '../../api/cardApi';
import {
  getCardChecklists,
  createChecklist,
  updateChecklist,
  deleteChecklist,
  createChecklistItem,
  updateChecklistItem,
  deleteChecklistItem,
  toggleChecklistItem,
} from '../../api/checklistApi';

import CheckListPopup from '../ChecklistCard/CheckListPopup';
import ChecklistSection from '../ChecklistCard/ChecklistSection';
import { Button } from 'react-bootstrap';

export default function FullCardModal({ 
  card, 
  onClose, 
  onCardUpdate,
  currentUser // Thêm prop currentUser
}) {
  const [title, setTitle] = useState(card.name || card.title || '');
  const [description, setDescription] = useState(card.description || '');
  const [comments, setComments] = useState([]);
  const [isComplete, setIsComplete] = useState(false);
  const [showChecklistPopup, setShowChecklistPopup] = useState(false);
  const [checklistAnchor, setChecklistAnchor] = useState(null);
  const [attachmentAnchor, setAttachmentAnchor] = useState(null); // ✅ Added missing state
  const overlayRef = useRef();
  const modalRef = useRef();
  const checklistPopupRef = useRef();    

  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [tempDesc, setTempDesc] = useState(description);
  const [loadingComments, setLoadingComments] = useState(false);
  const [saveState, setSaveState] = useState({ saving: false, error: null });

  const [showAttachmentPopup, setShowAttachmentPopup] = useState(false);
  const [attachments, setAttachments] = useState([]);

  const [showAddMenu, setShowAddMenu] = useState(false);
  const [addMenuAnchor, setAddMenuAnchor] = useState(null);
  const [showMembersPopup, setShowMembersPopup] = useState(false);
  const [membersAnchor, setMembersAnchor] = useState(null);

  const [replyingTo, setReplyingTo] = useState(null); // { id, author } | null
  const [activityRefreshTick, setActivityRefreshTick] = useState(0);

  const [showDetails, setShowDetails] = useState(false);

  const ActivityList = lazy(() => import('./activity/ActivityList'));

  const fetchAttachments = async () => {
    try {
      const res = await cardApi.getCardAttachments(card.id);
      setAttachments(res);
      setCardAndBubble(prev => ({
        ...prev,
        attachments: res
      }));
    } catch (err) {
      console.error('Failed to load attachments:', err);
    }
  };

  const [localCard, setLocalCard] = useState({
    ...card,
    checklists: card.checklists || [],
    attachments: card.attachments || []
  });

  useEffect(() => {
    setLocalCard(prev => ({ ...prev, ...card, checklists: card.checklists || prev.checklists || [] }));
  }, [card]);

  // ✅ Load attachments when modal opens
  useEffect(() => {
    if (card?.id) {
      fetchAttachments();
    }
  }, [card?.id]);

  const setCardAndBubble = (updater) => {
    setLocalCard(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      onCardUpdate?.(next);
      return next;
    });
  };

  // Nếu card ban đầu chưa có checklists, load 1 lần
  useEffect(() => {
    if (!card.checklists || card.checklists.length === 0) {
      (async () => {
        try {
          const data = await getCardChecklists(card.id);
          setCardAndBubble(prev => ({ ...prev, checklists: data }));
        } catch (e) {
          console.error('fetch checklists failed', e);
        }
      })();
    }
  }, [card.id]);

  // Tạo checklist từ popup
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

  // 2) Đổi tên checklist
  const handleChecklistTitle = async (clId, newTitle) => {
    const backup = localCard;
    setCardAndBubble(prev => ({
      ...prev,
      checklists: (prev.checklists || []).map(cl => cl.id === clId ? { ...cl, title: newTitle } : cl)
    }));
    try {
      await updateChecklist(clId, { title: newTitle });
    } catch (e) {
      console.error('update checklist title failed', e);
      setLocalCard(backup); onCardUpdate?.(backup);
    }
  };

  // 3) Thêm item
  const handleAddItem = async (clId, text) => {
    const name = (text || "").trim();
    if (!name) return;

    const tempId = `tmp_${Date.now()}`;
    const optimistic = { id: tempId, text: name, completed: false };

    setCardAndBubble(prev => ({
      ...prev,
      checklists: prev.checklists.map(cl => 
        cl.id === clId ? { ...cl, items: [...(cl.items || []), optimistic] } : cl)
    }));

    try {
      const real = await createChecklistItem(clId, { text: name });
      setCardAndBubble(prev => ({
        ...prev,
        checklists: prev.checklists.map(cl => {
          if (cl.id !== clId) return cl;
          return { ...cl, items: (cl.items || []).map(it => it.id === tempId ? real : it) };
        })
      }));
    } catch (e) {
      console.error('create item failed', e.response?.data || e);
      setCardAndBubble(prev => ({
        ...prev,
        checklists: prev.checklists.map(cl => 
          cl.id === clId 
          ? { ...cl, items: (cl.items || []).filter(it => it.id !== tempId) } 
          : cl)
      }));
    }
  };

  // 5) Xoá item
  const handleDeleteItem = async (clId, itemId) => {
    const backup = localCard;
    setCardAndBubble(prev => ({
      ...prev,
      checklists: prev.checklists.map(cl => cl.id === clId ? { ...cl, items: (cl.items || []).filter(it => it.id !== itemId) } : cl)
    }));
    try {
      await deleteChecklistItem(itemId);
    } catch (e) {
      console.error('delete item failed', e);
      setLocalCard(backup); onCardUpdate?.(backup);
    }
  };

  // Toggle trạng thái item (completed true/false)
  const handleToggleItem = async (clId, itemId) => {
    const current = localCard.checklists
      .find(c => c.id === clId)?.items
      ?.find(i => i.id === itemId);
    if (!current) return;

    const newCompleted = !current.completed;

    // Optimistic update
    setCardAndBubble(prev => ({
      ...prev,
      checklists: prev.checklists.map(cl =>
        cl.id === clId
          ? {
              ...cl,
              items: cl.items.map(it =>
                it.id === itemId ? { ...it, completed: newCompleted } : it
              ),
            }
          : cl
      ),
    }));

    try {
      await toggleChecklistItem(itemId, newCompleted); // gọi API ở checklistApi.js
    } catch (e) {
      console.error("toggle item failed", e);
      // Rollback khi lỗi
      setCardAndBubble(prev => ({
        ...prev,
        checklists: prev.checklists.map(cl =>
          cl.id === clId
            ? {
                ...cl,
                items: cl.items.map(it =>
                  it.id === itemId ? { ...it, completed: !newCompleted } : it
                ),
              }
            : cl
        ),
      }));
    }
  };

  const handleDeleteChecklist = async (clId) => {
    const backup = localCard;
    // optimistic remove
    setCardAndBubble(prev => ({
      ...prev,
      checklists: (prev.checklists || []).filter(cl => cl.id !== clId),
    }));
    try {
      await deleteChecklist(clId);
    } catch (e) {
      console.error("delete checklist failed", e.response?.data || e);
      // rollback
      setLocalCard(backup); onCardUpdate?.(backup);
    }
  };
  // Load comments khi modal mở
  useEffect(() => {
    if (card?.id) {
      loadComments();
    }
  }, [card?.id]);

  const loadComments = async () => {
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
  };

  const handleReply = (parentId, author) => {
    setReplyingTo({ id: parentId, author });
  };
  const handleCancelReply = () => setReplyingTo(null);

  const handleCommentAdded = (c) => {
    setComments(prev => [c, ...prev]);
  };

  const handleCommentReplaced = (tempId, real) => {
    setComments(prev =>{
      const next = prev.map((c) => (c.temp_id === tempId ? real : c));
      next.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      return next;
    });
    setActivityRefreshTick(t => t + 1);
  };
  

  const handleCommentRemove = (tempId) => {
    setComments(prev => prev.filter(c => c.temp_id !== tempId));
  };

  const handleCommentUpdated = (commentId, updated) => {
    setComments((prev) => {
      const next = prev.map((c) => (c.id === commentId ? { ...c, ...updated } : c));
      return next;
    });
    setActivityRefreshTick(t => t + 1);
  };

  const handleCommentDeleted = (commentId) => {
    setComments(prev => prev.filter(comment => comment.id !== commentId));
  };

  // roots: comment gốc (parent_id null/undefined)
  const roots = useMemo(
    () => comments.filter((c) => !c.parent_id),
    [comments]
  );
  // map root_id -> replies[]
  const childrenMap = useMemo(() => {
    const map = {};
    for (const c of comments) {
      if (c.parent_id) {
        (map[c.parent_id] ||= []).push(c);
      }
    }
    // reply hiển thị từ cũ -> mới để đọc mạch lạc
    Object.values(map).forEach((arr) =>
      arr.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    );
    return map;
  }, [comments]);
  const handleToggleComplete = async () => {
    const updated = !isComplete;
    setIsComplete(updated);
    try {
      await axios.patch(`/cards/${card.id}/`, { completed: updated });
      onCardUpdate({ ...card, completed: updated });
    } catch (err) {
      console.error('Failed to update card completion:', err);
      setIsComplete(!updated); // Revert on error
    }
  };

  const handleTitleSave = async () => {
    if (!title || title === card.name) return;
    
    const originalTitle = card.name;
    setSaveState({ saving: true, error: null });
    
    try {
      // Optimistic update
      onCardUpdate({ ...card, name: title });
      await axios.patch(`/cards/${card.id}/`, { name: title });
    } catch (err) {
      // Rollback on error
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
      console.error('❌ Failed to save description:', err);
      toast.error('Failed to save description');
    } finally {
      setSaveState({ saving: false, error: null });
    }
  };

  const handleCancelDescription = () => {
    setTempDesc(description);
    setIsEditingDesc(false);
  };

  useEffect(() => {
    if (card) {
      setTitle(card.name || card.title || '');
      setDescription(card.description || '');
      setTempDesc(card.description || '');
      setIsComplete(!!card.completed);
    }
  }, [card]);

  // ✅ Attachment handlers
  const handleAttachmentAdded = (attachment) => {
    setCardAndBubble((prev) => ({
      ...prev,
      attachments: [attachment, ...(prev.attachments || [])]
    }));
    // Also update local attachments state
    setAttachments(prev => [attachment, ...prev]);
  };

  const handleSetCover = async (id) => {
    try {
      await cardApi.updateAttachment(id, { is_cover: true });
      setCardAndBubble((prev) => ({
        ...prev,
        attachments: prev.attachments.map((att) => ({
          ...att,
          is_cover: att.id === id
        }))
      }));
      setAttachments(prev => prev.map(att => ({
        ...att,
        is_cover: att.id === id
      })));
      toast.success('Cover set successfully');
    } catch (err) {
      console.error('Failed to set cover:', err);
      toast.error('Failed to set cover');
    }
  };


  const handleRemoveCover = async (id) => {
    try {
      await cardApi.updateAttachment(id, { is_cover: false });
      setCardAndBubble((prev) => ({
        ...prev,
        attachments: prev.attachments.map((att) => ({
          ...att,
          is_cover: att.id === id ? false : att.is_cover
        }))
      }));
      setAttachments(prev => prev.map(att => ({
        ...att,
        is_cover: att.id === id ? false : att.is_cover
      })));
      toast.success('Cover removed successfully');
    } catch (err) {
      console.error('Failed to remove cover:', err);
      toast.error('Failed to remove cover');
    }
  };


  const handleDeleteAttachment = async (id) => {
    try {
      await cardApi.deleteAttachment(id);
      setCardAndBubble((prev) => ({
        ...prev,
        attachments: prev.attachments.filter((att) => att.id !== id)
      }));
      setAttachments(prev => prev.filter(att => att.id !== id));
      toast.success('Attachment deleted successfully');
    } catch (err) {
      console.error('Failed to delete attachment:', err);
      toast.error('Failed to delete attachment');
    }
  };

  const handleOpenAttachmentPopup = () => {
    setShowAttachmentPopup(true);
  };

  const handleCloseAttachmentPopup = () => {
    setShowAttachmentPopup(false);
  };

  const handleClickOutside = useCallback((e) => {
   // Chỉ đóng khi click TRỰC TIẾP lên overlay (nền mờ)
   if (e.target === overlayRef.current) {
     onClose();
   }
  }, [onClose]);
  
  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

  // Mock current user nếu chưa có
  const mockCurrentUser = currentUser || {
    id: 1,
    name: 'You',
    avatar: null
  };

  return (
  <Overlay ref={overlayRef}>
    <ModalContainer ref={modalRef}>
      <HeaderBar>
        <HeaderLeft>
          <TitleButton aria-label="Open card menu">
            <CardTitle>{title}</CardTitle>
            <DropIcon aria-hidden="true">
              <IoChevronDown size={20} />
            </DropIcon>
          </TitleButton>
        </HeaderLeft>
        <HeaderRight>
          <IconBtn title="Feedback" aria-label="Feedback">📢</IconBtn>
          <IconBtn title="Cover" aria-label="Cover">🖼️</IconBtn>
          <IconBtn title="Actions" aria-label="Actions">⋯</IconBtn>
          <CloseBtn onClick={onClose} aria-label="Close">
            <IoCloseOutline size={24} />
          </CloseBtn>
        </HeaderRight>
      </HeaderBar>
      
      <CardMetaBar
        labels={localCard?.labels || []}
        dueDate={localCard?.due_date || null}
        members={localCard?.members || []}
        onClickLabels={undefined}   // để null/undefined: render-only
        onClickDueDate={undefined}
        onClickMembers={undefined}
      />

      <ContentBody>
        <MainColumn>
          <TitleSection>
            <TitleCheckboxWrapper>
              <CompleteCheckbox
                type="checkbox"
                checked={isComplete}
                onChange={handleToggleComplete}
                aria-label={`Mark this card complete (${title})`}
              />
            </TitleCheckboxWrapper>
            <TitleContent>
              <EditableTitle
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={handleTitleKeyDown}
                onBlur={handleTitleSave}
                placeholder="Card title"
              />
            </TitleContent>
          </TitleSection>

          <ActionSectionGrid>
            <EmptyIconSpace />
            <ActionSectionBody>
              <ActionButton
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setAddMenuAnchor(rect);
                  setShowAddMenu((prev) => !prev);
                }}
              >
                + Add
              </ActionButton>

              <ActionButton><BiLabel /> Labels</ActionButton>
              <ActionButton><BsClock /> Dates</ActionButton>
              <ActionButton
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setChecklistAnchor(rect);         // ✅ lưu anchorRect của nút
                  setShowChecklistPopup(true);
                }}
              >
                <MdChecklist /> Checklist
              </ActionButton>
              <ActionButton><HiOutlineUserAdd /> Members</ActionButton>

              <ActionButton
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setAttachmentAnchor(rect);
                  setShowAttachmentPopup(true);
                }}
                >
                📎 Attachment
              </ActionButton>
            </ActionSectionBody>
          </ActionSectionGrid>

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

          <CardAttachments
            attachments={attachments}
            onAddClick={handleOpenAttachmentPopup}
            onSetCover={handleSetCover}
            onRemoveCover={handleRemoveCover}
            onDelete={handleDeleteAttachment}
          />

          <CardChecklists
            checklists={localCard.checklists || []}
            onChangeTitle={handleChecklistTitle}
            onAddItem={handleAddItem}
            onToggleItem={handleToggleItem}
            onDeleteItem={handleDeleteItem}
            onDeleteChecklist={handleDeleteChecklist}
          />

        </MainColumn>

        <Sidebar>
          <CardComments
            cardId={card.id}
            currentUser={currentUser}
            comments={comments}
            loading={loadingComments}
            replyingTo={replyingTo}
            onReply={handleReply}
            onCancelReply={() => setReplyingTo(null)}
            onCommentAdded={handleCommentAdded}
            onCommentReplaced={handleCommentReplaced}
            onCommentRemove={handleCommentRemove}
            onCommentUpdated={handleCommentUpdated}
            onCommentDeleted={handleCommentDeleted}
          />

           <Section>
              <ActivityHeader>
                <SectionLabel>Activity</SectionLabel>
                <ShowDetailsButton onClick={() => setShowDetails(!showDetails)}>
                  {showDetails ? 'Hide details' : 'Show details'}
                </ShowDetailsButton>
              </ActivityHeader>
              
              {showDetails && (
                <Suspense fallback={<div style={{color:'#6b778c', fontStyle:'italic'}}>Loading activity…</div>}>
                  <ActivityList cardId={card.id} />
                </Suspense>
              )}
            </Section>
        </Sidebar>
      </ContentBody>
    </ModalContainer>

    {showChecklistPopup && (
      <CheckListPopup
        ref={checklistPopupRef}
        anchorRect={checklistAnchor}
        onClose={() => setShowChecklistPopup(false)}
        onSubmit={handleCreateChecklist}            
        existingChecklists={localCard.checklists || []}
      />
    )}

    {showAttachmentPopup && (
      <PopupOverlay>
        <AttachmentPopup
          cardId={card.id}
          onClose={() => setShowAttachmentPopup(false)}
          onAttachmentAdded={handleAttachmentAdded}
        />
      </PopupOverlay>
    )}
    
    {showAddMenu && addMenuAnchor && (
      <AddToCardMenu
        anchorRect={addMenuAnchor}
        onClose={() => setShowAddMenu(false)}
        onSelect={async (type) => {
          setShowAddMenu(false);
          switch (type) {
            case 'checklist': {
              setChecklistAnchor(addMenuAnchor);
              setShowChecklistPopup(true);
              break;
            }
            case 'members': {
              setMembersAnchor(addMenuAnchor);
              setShowMembersPopup(true);
              break;
            }
            case 'attachment': {
              setAttachmentAnchor(addMenuAnchor);
              setShowAttachmentPopup(true);
              break;
            }
            case 'custom_fields': {
              toast('Custom fields coming soon');
              break;
            }
            default:
              break;
          }
        }}
      />
    )}

  </Overlay>
);

}


const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(9, 30, 66, 0.48);
  backdrop-filter: blur(2px);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 48px;
  z-index: 1000;
`;

const ModalContainer = styled.div`
  background: white;
  border-radius: 12px;
  width: 960px;
  max-height: 90vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  position: relative;
  box-shadow: 0 8px 12px rgba(9, 30, 66, 0.15), 0 0 1px rgba(9, 30, 66, 0.3);
`;

const HeaderBar = styled.header`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #dfe1e6;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
`;

const TitleButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 20px;
  font-weight: 600;
  color: #172b4d;
  padding: 4px 8px;
  border-radius: 4px;

  &:hover {
    background-color: #f1f2f4;
  }
`;

const CardTitle = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const DropIcon = styled.span`
  font-size: 18px;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const IconBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
`;

const CloseBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #172b4d;
`;

const ContentBody = styled.div`
  display: flex;
  flex-direction: row;
`;

const MainColumn = styled.div`
  flex: 2;
  padding: 24px 20px 16px;
`;

const Sidebar = styled.div`
  flex: 1;
  padding: 24px 20px;
  border-left: 1px solid #dfe1e6;
`;

const TitleSection = styled.section`
  display: grid;
  grid-template-columns: 36px 1fr;
  column-gap: 12px;
  padding: 24px 20px 16px;
  margin-bottom: 32px;
`;

const TitleCheckboxWrapper = styled.div`
  padding-top: 4px;
`;

const TitleContent = styled.div`
  display: flex;
  align-items: center;
`;

const EditableTitle = styled.input`
  font-size: 20px;
  font-weight: 600;
  border: none;
  outline: none;
  background: transparent;
  width: 100%;
`;

const CompleteCheckbox = styled.input`
  width: 20px;
  height: 20px;
  accent-color: #61bd4f;
  cursor: pointer;
`;

const ActionSectionGrid = styled.section`
  display: grid;
  grid-template-columns: 36px 1fr;
  column-gap: 12px;
  margin-bottom: 32px;
`;

const ActionSectionBody = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const EmptyIconSpace = styled.div``;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
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

const DescriptionSection = styled.section`
  display: grid;
  grid-template-columns: 36px 1fr;
  column-gap: 12px;
  margin-bottom: 32px;
`;

const DescriptionIconWrapper = styled.div`
  padding-top: 4px;
  color: #44546f;
`;

const DescriptionContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SectionHeading = styled.h3`
  font-size: 14px;
  font-weight: 600;
  color: #172b4d;
  margin: 0;
  min-height: 32px;
  display: flex;
  align-items: center;
`;

const PreviewBox = styled.div`
  background: #f4f5f7;
  border-radius: 6px;
  padding: 12px;
  min-height: 40px;
  cursor: pointer;
  font-size: 14px;
  color: #172b4d;

  &:hover {
    background: #ebecf0;
  }
`;

const DescriptionText = styled.p`
  margin: 0;
  line-height: 1.4;
  white-space: pre-wrap;
`;

const PlaceholderText = styled.em`
  color: #6b778c;
`;

const EditorBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Textarea = styled.textarea`
  width: 100%;
  min-height: 80px;
  padding: 10px;
  font-size: 14px;
  border-radius: 6px;
  border: 1px solid #dfe1e6;
  resize: vertical;
  font-family: inherit;
  
  &:focus {
    outline: none;
    border-color: #28a745 
  }
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 8px;
`;

const SaveBtn = styled.button`
  background: #28a745;
  color: white;
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  
  &:disabled {
    background: #a5adba;
    cursor: not-allowed;
  }
`;

const CancelBtn = styled.button`
  background: transparent;
  border: none;
  color: #5e6c84;
  font-weight: 500;
  cursor: pointer;
  padding: 6px 12px;
  
  &:hover {
    color: #172b4d;
  }
`;

const Section = styled.div`
  margin-bottom: 24px;
`;

const SectionLabel = styled.h4`
  font-size: 14px;
  font-weight: 600;
  color: #172b4d;
  margin: 0 0 8px 0;
`;

const ActivityHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const ShowDetailsButton = styled.button`
  background: none;
  border: none;
  color: #44546f;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 3px;
  text-decoration: underline;
  transition: all 0.15s ease;

  &:hover {
    color: #172b4d;
    background: #091e4214;
  }
`;

const CommentList = styled.div`
  display: flex;
  flex-direction: column;
`;

const LoadingText = styled.div`
  color: #6b778c;
  font-style: italic;
  text-align: center;
  padding: 20px;
`;

const EmptyState = styled.div`
  color: #6b778c;
  font-style: italic;
  text-align: center;
  padding: 20px;
  background: #fafbfc;
  border-radius: 6px;
`;

const ActivityItem = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f1f2f4;
`;

const ActivityAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #dfe1e6;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  color: #172b4d;
  flex-shrink: 0;
`;

const ActivityContent = styled.div`
  flex: 1;
`;

const ActivityText = styled.div`
  font-size: 14px;
  color: #172b4d;
  margin-bottom: 4px;
`;

const ActivityTime = styled.div`
  font-size: 12px;
  color: #6b778c;
`;

const PopupOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
`;

const SectionHeader = styled.div`
  font-weight: 600;
  margin-bottom: 12px;
  color: #172b4d;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const AddButton = styled.button`
  background: none;
  border: none;
  color: #42526e;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 3px;

  &:hover {
    background-color: #091e4214;
    text-decoration: underline;
  }
`;

const ReplyRow = styled.div`
  margin-left: 32px;
  margin-top: 8px;
`;

