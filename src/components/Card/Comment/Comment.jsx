// components/Comment/Comment.jsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { updateComment, deleteComment } from '../../../api/cardApi';
import toast from 'react-hot-toast';

function Comment({
  comment,
  onUpdate,
  onDelete,
  currentUserId,
  onReply
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content || '');
  const [isLoading, setIsLoading] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const canEdit = currentUserId === comment.author?.id;
  const isOptimistic = !comment.id || comment.temp_id; // Comment chưa save thành công
  const isEdited =
    comment.updated_at &&
    new Date(comment.updated_at).getTime() > new Date(comment.created_at).getTime();

  // Sync nội dung khi comment được replace (optimistic -> real)
  useEffect(() => {
    if (!isEditing) {
      setEditContent(comment.content || '');
    }
  }, [comment.content, isEditing]);

  const formatTime = (date) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true, locale: vi });
    } catch {
      return 'Không rõ thời gian';
    }
  };

  const handleSave = async () => {
    const payload = editContent?.trim();
    if (!payload) {
      toast.error('Bình luận không được để trống');
      return;
    }
    
    if (payload === comment.content) {
      setIsEditing(false);
      return;
    }

    setIsLoading(true);
    try {
      const updated = await updateComment(comment.id, payload);
      const merged = {
        ...comment,
        ...updated,
        content: updated?.content ?? payload,
        updated_at: updated?.updated_at ?? new Date().toISOString()
      };
      onUpdate?.(comment.id, merged);
      setIsEditing(false);
      toast.success('Đã cập nhật bình luận');
    } catch (err) {
      console.error('Failed to update comment', err);
      toast.error('Cập nhật bình luận thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bình luận này?')) return;

    setIsLoading(true);
    try {
      await deleteComment(comment.id);
      onDelete?.(comment.id);
      toast.success('Đã xóa bình luận');
    } catch (err) {
      console.error('Failed to delete comment', err);
      toast.error('Xóa bình luận thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditContent(comment.content || '');
  };

  const handleCopyLink = async () => {
    const url = `${window.location.origin}${window.location.pathname}#comment-${comment.id}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Đã sao chép link');
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        toast.success('Đã sao chép link');
      } catch (e) {
        toast.error('Không thể sao chép link');
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <CommentItem
      id={`comment-${comment.id || comment.temp_id}`}
      onMouseEnter={() => canEdit && setShowActions(true)}
      onMouseLeave={() => !isEditing && setShowActions(false)}
      $isOptimistic={isOptimistic}
    >
      <AvatarContainer>
        <Avatar aria-hidden>
          {comment.author?.avatar ? (
            <img src={comment.author.avatar} alt={comment.author.name} />
          ) : (
            <AvatarText>{comment.author?.name?.charAt(0) || 'U'}</AvatarText>
          )}
        </Avatar>
      </AvatarContainer>

      <CommentContent>
        <CommentHeader>
          <AuthorInfo>
            <AuthorName title={comment.author?.username || comment.author?.name}>
              {comment.author?.name || comment.author?.username || 'Unknown User'}
            </AuthorName>
            <CommentTime
              href={`#comment-${comment.id || comment.temp_id}`}
              title={new Date(comment.created_at).toLocaleString('vi-VN')}
            >
              {formatTime(comment.created_at)}
            </CommentTime>
            {isEdited && <EditedTag>(Edited)</EditedTag>}
            {isOptimistic && <OptimisticTag>(Editing...)</OptimisticTag>}
          </AuthorInfo>
        </CommentHeader>

        <CommentBody>
          {isEditing ? (
            <EditForm>
              <EditTextarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="Viết bình luận..."
                disabled={isLoading}
                autoFocus
                aria-label="Chỉnh sửa bình luận"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    handleSave();
                  }
                  if (e.key === 'Escape') {
                    handleCancel();
                  }
                }}
              />
              <EditActions>
                <SaveButton
                  onClick={handleSave}
                  disabled={isLoading || !editContent.trim()}
                >
                  {isLoading ? 'Saving...' : 'Save'}
                </SaveButton>
                <CancelButton onClick={handleCancel} disabled={isLoading}>
                  Cancel
                </CancelButton>
                <KeyboardHint>Ctrl+Enter để lưu</KeyboardHint>
              </EditActions>
            </EditForm>
          ) : (
            <>
              <CommentText>
                {comment.content || <EmptyComment>(Bình luận trống)</EmptyComment>}
              </CommentText>

              <CommentActions $visible={showActions || isLoading}>
                {/* Copy link - ai cũng thấy được */}
                {!isOptimistic && (
                  <>
                    <ActionButton
                      onClick={handleCopyLink}
                      disabled={isLoading}
                      aria-label="Sao chép link bình luận"
                      title="Sao chép link"
                    >
                      Copy Link
                    </ActionButton>
                    {canEdit && <ActionDivider>•</ActionDivider>}
                  </>
                )}

                {/* Reply - bất kỳ ai có quyền comment (FE: xuất hiện khi parent truyền onReply) */}
                {!isOptimistic && onReply && (
                  <>
                    <ActionButton
                      onClick={() => onReply?.(comment.id, comment.author)}
                      disabled={isLoading}
                      aria-label="Trả lời bình luận"
                      title="Trả lời"
                    >
                      Reply
                    </ActionButton>
                    {canEdit && <ActionDivider>•</ActionDivider>}
                  </>
                )}  

                {/* Edit/Delete - chỉ author thấy */}
                {canEdit && (
                  <>
                    <ActionButton
                      onClick={() => setIsEditing(true)}
                      disabled={isLoading || isOptimistic}
                      aria-label="Chỉnh sửa bình luận"
                    >
                      Edit
                    </ActionButton>
                    <ActionDivider>•</ActionDivider>
                    <ActionButton
                      onClick={handleDelete}
                      disabled={isLoading || isOptimistic}
                      aria-label="Xóa bình luận"
                    >
                      Delete
                    </ActionButton>
                  </>
                )}
              </CommentActions>
            </>
          )}
        </CommentBody>
      </CommentContent>
    </CommentItem>
  );
}

export default Comment;

// ============================================
// Styled Components
// ============================================

const CommentItem = styled.li`
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  padding: 8px;
  border-radius: 8px;
  transition: background-color 0.15s ease;
  opacity: ${props => props.$isOptimistic ? 0.6 : 1};

  &:hover {
    background-color: #f7f8f9;
  }
`;

const AvatarContainer = styled.div`
  flex-shrink: 0;
`;

const Avatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const AvatarText = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: white;
  text-transform: uppercase;
`;

const CommentContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const CommentHeader = styled.div`
  margin-bottom: 4px;
`;

const AuthorInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const AuthorName = styled.span`
  font-weight: 600;
  color: #172b4d;
  font-size: 14px;
  line-height: 20px;
`;

const CommentTime = styled.a`
  color: #5e6c84;
  font-size: 12px;
  line-height: 16px;
  text-decoration: none;

  &:hover {
    color: #172b4d;
    text-decoration: underline;
  }
`;

const EditedTag = styled.span`
  color: #8c9bab;
  font-size: 12px;
  line-height: 16px;
  font-style: italic;
`;

const OptimisticTag = styled.span`
  color: #0c66e4;
  font-size: 12px;
  line-height: 16px;
  font-style: italic;
`;

const CommentBody = styled.div`
  position: relative;
`;

const CommentText = styled.div`
  color: #172b4d;
  font-size: 14px;
  line-height: 20px;
  white-space: pre-wrap;
  word-wrap: break-word;
  word-break: break-word;
  padding: 8px 12px;
  background: #ffffff;
  border: 1px solid transparent;
  border-radius: 8px;
  margin-bottom: 4px;
`;

const EmptyComment = styled.span`
  color: #8c9bab;
  font-style: italic;
`;

const CommentActions = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding-left: 12px;
  opacity: ${(props) => (props.$visible ? 1 : 0)};
  transition: opacity 0.15s ease;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  color: #5e6c84;
  font-size: 12px;
  line-height: 16px;
  padding: 4px 8px;
  cursor: pointer;
  border-radius: 3px;
  transition: all 0.15s ease;
  font-family: inherit;
  text-decoration: underline;

  &:hover:not(:disabled) {
    color: #172b4d;
    background: #091e4224;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
    text-decoration: none;
  }
`;

const ActionDivider = styled.span`
  color: #5e6c84;
  font-size: 12px;
  padding: 0 4px;
  user-select: none;
`;

const EditForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const EditTextarea = styled.textarea`
  width: 100%;
  min-height: 80px;
  padding: 8px 12px;
  font-size: 14px;
  line-height: 20px;
  border: 2px solid #0c66e4;
  border-radius: 8px;
  resize: vertical;
  font-family: inherit;
  background: #ffffff;
  color: #172b4d;
  box-shadow: 0 1px 2px rgba(9, 30, 66, 0.08);

  &:focus {
    outline: none;
    border-color: #0c66e4;
    box-shadow: 0 0 0 3px rgba(12, 102, 228, 0.16);
  }

  &::placeholder {
    color: #8c9bab;
  }
`;

const EditActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SaveButton = styled.button`
  background: #0c66e4;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 3px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s ease;
  font-family: inherit;

  &:hover:not(:disabled) {
    background: #0055cc;
  }

  &:disabled {
    background: #a5adba;
    cursor: not-allowed;
  }
`;

const CancelButton = styled.button`
  background: none;
  border: none;
  padding: 6px 12px;
  color: #44546f;
  cursor: pointer;
  border-radius: 3px;
  font-size: 14px;
  font-family: inherit;
  transition: background 0.15s ease;

  &:hover:not(:disabled) {
    background: #091e4224;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

const KeyboardHint = styled.span`
  font-size: 12px;
  color: #8c9bab;
  margin-left: auto;
  font-style: italic;
`;