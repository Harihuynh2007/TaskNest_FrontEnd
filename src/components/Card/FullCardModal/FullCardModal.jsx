import React, { useState, useEffect, useRef, useCallback, useMemo, lazy, Suspense } from 'react';
import { BiLabel } from 'react-icons/bi';
import { BsClock } from 'react-icons/bs';
import { HiOutlineUserAdd } from 'react-icons/hi';
import { MdChecklist } from 'react-icons/md';
import { IoCloseOutline, IoChevronDown } from 'react-icons/io5';
import toast from 'react-hot-toast';
import client from '../../../api/apiClient';

import * as cardApi from '../../../api/apiClient';
import {
  getCardComments,
  updateCardDescription,
} from '../../../api/cardApi';

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
    checklists: card.checklists || [],
    attachments: card.attachments || []
  });

  const [title, setTitle] = useState(card.name || card.title || '');
  const [description, setDescription] = useState(card.description || '');
  const [tempDesc, setTempDesc] = useState(description);
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [isComplete, setIsComplete] = useState(!!card.completed);

  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [activityRefreshTick, setActivityRefreshTick] = useState(0);

  const [attachments, setAttachments] = useState([]);
  const [saveState, setSaveState] = useState({ saving: false, error: null });

  // Popup states
  const [showChecklistPopup, setShowChecklistPopup] = useState(false);
  const [showAttachmentPopup, setShowAttachmentPopup] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showMembersPopup, setShowMembersPopup] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Anchor refs for popups
  const [checklistAnchor, setChecklistAnchor] = useState(null);
  const [attachmentAnchor, setAttachmentAnchor] = useState(null);
  const [addMenuAnchor, setAddMenuAnchor] = useState(null);
  const [membersAnchor, setMembersAnchor] = useState(null);

  // Refs
  const overlayRef = useRef();
  const modalRef = useRef();
  const checklistPopupRef = useRef();

  // ============= HELPER FUNCTIONS =============
  const setCardAndBubble = useCallback((updater) => {
    setLocalCard(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      onCardUpdate?.(next);
      return next;
    });
  }, [onCardUpdate]);

  // ============= FETCH DATA =============
  const fetchAttachments = useCallback(async () => {
    try {
      const res = await getCardAttachments(card.id);
      setAttachments(res);
      setLocalCard(prev => ({
        ...prev,
        attachments: res
      }));
      // Chỉ cập nhật parent khi thật sự cần và đảm bảo không tạo loop
      // Ví dụ, nếu chỉ muốn thông báo cho parent rằng attachments đã được tải lần đầu hoặc thay đổi
      // if (onCardUpdate && JSON.stringify(card.attachments) !== JSON.stringify(res)) {
      //   onCardUpdate?.({ ...card, attachments: res });
      // }
    } catch (err) {
      console.error('Failed to load attachments:', err);
    }
  }, [card.id, onCardUpdate]); // Giữ onCardUpdate nếu bạn cần nó như một dependency ổn định

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
    setLocalCard(prev => ({ 
      ...prev, 
      ...card, 
      checklists: card.checklists || prev.checklists || [] 
    }));
  }, [card]);

  useEffect(() => {
    if (card?.id) fetchAttachments();
  }, [card?.id, fetchAttachments]);

  useEffect(() => {
    if (card?.id) loadComments();
  }, [card?.id, loadComments]);

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

  useEffect(() => {
    if (card) {
      setTitle(card.name || card.title || '');
      setDescription(card.description || '');
      setTempDesc(card.description || '');
      setIsComplete(!!card.completed);
    }
  }, [card]);

  // ============= CARD ACTIONS =============
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

  // ============= CHECKLIST HANDLERS =============
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
      console.error('update checklist title failed', e);
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
      console.error('create item failed', e.response?.data || e);
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
      console.error('delete item failed', e);
      setLocalCard(backup);
      onCardUpdate?.(backup);
    }
  };

  const handleToggleItem = async (clId, itemId) => {
    const current = localCard.checklists
      .find(c => c.id === clId)?.items
      ?.find(i => i.id === itemId);
    if (!current) return;

    const newCompleted = !current.completed;

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
      await toggleChecklistItem(itemId, newCompleted);
    } catch (e) {
      console.error("toggle item failed", e);
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
    setCardAndBubble(prev => ({
      ...prev,
      checklists: (prev.checklists || []).filter(cl => cl.id !== clId),
    }));
    try {
      await deleteChecklist(clId);
    } catch (e) {
      console.error("delete checklist failed", e.response?.data || e);
      setLocalCard(backup);
      onCardUpdate?.(backup);
    }
  };

  // ============= ATTACHMENT HANDLERS =============
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
      await updateAttachment(id, { is_cover: false });
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
      await deleteAttachment(id);
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

  // ============= COMMENT HANDLERS =============
  const handleReply = (parentId, author) => {
    setReplyingTo({ id: parentId, author });
  };

  const handleCancelReply = () => setReplyingTo(null);

  const handleCommentAdded = (c) => {
    setComments(prev => [c, ...prev]);
  };

  const handleCommentReplaced = (tempId, real) => {
    setComments(prev => {
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

  // ============= COMPUTED VALUES =============
  const roots = useMemo(
    () => comments.filter((c) => !c.parent_id),
    [comments]
  );

  const childrenMap = useMemo(() => {
    const map = {};
    for (const c of comments) {
      if (c.parent_id) {
        (map[c.parent_id] ||= []).push(c);
      }
    }
    Object.values(map).forEach((arr) =>
      arr.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    );
    return map;
  }, [comments]);

  // ============= CLICK OUTSIDE HANDLER =============
  const handleClickOutside = useCallback((e) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

  // ============= RENDER =============
  return (
    <S.Overlay ref={overlayRef}>
      <S.ModalContainer ref={modalRef}>
        {/* Header */}
        <S.HeaderBar>
          <S.HeaderLeft>
            <S.TitleButton aria-label="Open card menu">
              <S.CardTitle>{title}</S.CardTitle>
              <S.DropIcon aria-hidden="true">
                <IoChevronDown size={20} />
              </S.DropIcon>
            </S.TitleButton>
          </S.HeaderLeft>
          <S.HeaderRight>
            <S.IconBtn title="Feedback" aria-label="Feedback">📢</S.IconBtn>
            <S.IconBtn title="Cover" aria-label="Cover">🖼️</S.IconBtn>
            <S.IconBtn title="Actions" aria-label="Actions">⋯</S.IconBtn>
            <S.CloseBtn onClick={onClose} aria-label="Close">
              <IoCloseOutline size={24} />
            </S.CloseBtn>
          </S.HeaderRight>
        </S.HeaderBar>
        
        {/* Meta Bar */}
        <CardMetaBar
          labels={localCard?.labels || []}
          dueDate={localCard?.due_date || null}
          members={localCard?.members || []}
          onClickLabels={undefined}
          onClickDueDate={undefined}
          onClickMembers={undefined}
        />

        {/* Content */}
        <S.ContentBody>
          <S.MainColumn>
            {/* Title Section */}
            <S.TitleSection>
              <S.TitleCheckboxWrapper>
                <S.CompleteCheckbox
                  type="checkbox"
                  checked={isComplete}
                  onChange={handleToggleComplete}
                  aria-label={`Mark "${title}" complete`}
                />
              </S.TitleCheckboxWrapper>
              <S.TitleContent>
                <S.EditableTitle
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onKeyDown={handleTitleKeyDown}
                  onBlur={handleTitleSave}
                  placeholder="Card title"
                  aria-label="Card title"
                />
              </S.TitleContent>
            </S.TitleSection>

            {/* Action Buttons */}
            <S.ActionSectionGrid>
              <S.EmptyIconSpace />
              <S.ActionSectionBody>
                <S.ActionButton
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setAddMenuAnchor(rect);
                    setShowAddMenu((prev) => !prev);
                  }}
                  aria-label="Add to card"
                >
                  + Add
                </S.ActionButton>

                <S.ActionButton aria-label="Add labels">
                  <BiLabel /> Labels
                </S.ActionButton>
                
                <S.ActionButton aria-label="Add dates">
                  <BsClock /> Dates
                </S.ActionButton>
                
                <S.ActionButton
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setChecklistAnchor(rect);        
                    setShowChecklistPopup(true);
                  }}
                  aria-label="Add checklist"
                >
                  <MdChecklist /> Checklist
                </S.ActionButton>
                
                <S.ActionButton aria-label="Add members">
                  <HiOutlineUserAdd /> Members
                </S.ActionButton>

                <S.ActionButton
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setAttachmentAnchor(rect);
                    setShowAttachmentPopup(true);
                  }}
                  aria-label="Add attachment"
                >
                  📎 Attachment
                </S.ActionButton>
              </S.ActionSectionBody>
            </S.ActionSectionGrid>

            {/* Description */}
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

            {/* Attachments */}
            <CardAttachments
              attachments={attachments}
              onAddClick={() => setShowAttachmentPopup(true)}
              onSetCover={handleSetCover}
              onRemoveCover={handleRemoveCover}
              onDelete={handleDeleteAttachment}
            />

            {/* Checklists */}
            <CardChecklists
              checklists={localCard.checklists || []}
              onChangeTitle={handleChecklistTitle}
              onAddItem={handleAddItem}
              onToggleItem={handleToggleItem}
              onDeleteItem={handleDeleteItem}
              onDeleteChecklist={handleDeleteChecklist}
            />
          </S.MainColumn>

          {/* Sidebar */}
          <S.Sidebar>
            {/* Comments */}
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

            {/* Activity */}
            <S.Section>
              <S.ActivityHeader>
                <S.SectionLabel>Activity</S.SectionLabel>
                <S.ShowDetailsButton 
                  onClick={() => setShowDetails(!showDetails)}
                  aria-expanded={showDetails}
                >
                  {showDetails ? 'Hide details' : 'Show details'}
                </S.ShowDetailsButton>
              </S.ActivityHeader>
              
              {showDetails && (
                <Suspense fallback={
                  <div style={{color:'#94a3b8', fontStyle:'italic'}}>
                    Loading activity…
                  </div>
                }>
                  <ActivityList cardId={card.id} />
                </Suspense>
              )}
            </S.Section>
          </S.Sidebar>
        </S.ContentBody>
      </S.ModalContainer>

      {/* Popups */}
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
        <S.PopupOverlay>
          <AttachmentPopup
            cardId={card.id}
            onClose={() => setShowAttachmentPopup(false)}
            onAttachmentAdded={handleAttachmentAdded}
          />
        </S.PopupOverlay>
      )}
      
      {showAddMenu && addMenuAnchor && (
        <AddToCardMenu
          anchorRect={addMenuAnchor}
          onClose={() => setShowAddMenu(false)}
          onSelect={async (type) => {
            setShowAddMenu(false);
            switch (type) {
              case 'labels':
                toast('Labels coming soon');
                break;
              case 'dates':
                toast('Dates coming soon');
                break;
              case 'checklist':
                setChecklistAnchor(addMenuAnchor);
                setShowChecklistPopup(true);
                break;
              case 'members':
                setMembersAnchor(addMenuAnchor);
                setShowMembersPopup(true);
                break;
              case 'attachment':
                setAttachmentAnchor(addMenuAnchor);
                setShowAttachmentPopup(true);
                break;
              case 'custom_fields':
                toast('Custom fields coming soon');
                break;
              default:
                break;
            }
          }}
        />
      )}
    </S.Overlay>
  );
}