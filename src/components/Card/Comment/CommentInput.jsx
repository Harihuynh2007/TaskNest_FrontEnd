// components/Comment/CommentInput.jsx
import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { createComment } from '../../../api/cardApi';
import toast from 'react-hot-toast';

export default function CommentInput({ 
  cardId, 
  onCommentAdded, 
  onCommentReplaced, 
  onCommentRemove,
  currentUser,
  placeholder = "Write a comment..." ,
  replyingTo = null,
  parentId = null,
  onCancelReply
}) {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (parentId && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [parentId]);

  const handleSubmit = async () => {
    const text = content.trim();
    if (!text) return;

    setIsLoading(true);
    const tempId = `temp-${Date.now()}`;
    const optimisticComment = {
      id: null,
      temp_id: tempId,
      card: cardId,
      content: text,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      parent_id: parentId || null,
      author: {
        id: currentUser?.id ?? null,
        name: currentUser?.name || currentUser?.username || 'You',
        username: currentUser?.username,
        avatar: currentUser?.avatar || null
      }
    };

    onCommentAdded?.(optimisticComment);

    try {
      const real = await createComment(cardId, content.trim(), parentId);
      onCommentReplaced?.(tempId, real);

      setContent('');
      setIsFocused(false);
      toast.success('Comment added');
      if (onCancelReply) onCancelReply();
    } catch (error) {
      console.error('Failed to add comment:', error);
      toast.error('Failed to add comment');
      onCommentRemove?.(tempId);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === 'Escape') {
      setIsFocused(false);
      setContent('');
      if (onCancelReply) onCancelReply();
    }
  };

  const handleCancel = () => {
    setContent('');
    setIsFocused(false);
    if (onCancelReply) onCancelReply();
  };

  return (
    <CommentInputWrapper>
      <Avatar>
        {currentUser?.avatar ? (
          <img src={currentUser.avatar} alt={currentUser.name} />
        ) : (
          <div>{currentUser?.name?.charAt(0) || 'U'}</div>
        )}
      </Avatar>
      
      <InputContainer>
        {replyingTo && (
          <ReplyChip>
            Đang trả lời <strong>@{replyingTo.author?.name || replyingTo.author?.username || 'user'}</strong>
            {onCancelReply && (
              <CancelReplyBtn type="button" onClick={onCancelReply}>
                Cancel
              </CancelReplyBtn>
            )}
          </ReplyChip>
        )}

        <CommentTextarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onKeyDown={handleKeyDown}
          placeholder={
            replyingTo
              ? `Trả lời @${replyingTo.author?.name || replyingTo.author?.username || ''}...`
              : placeholder
          }
          disabled={isLoading}
          $focused={isFocused || content}
        />
        
        {(isFocused || content) && (
          <ButtonContainer>
            <SubmitButton 
              onClick={handleSubmit}
              disabled={!content.trim() || isLoading}
            >
              {isLoading ? 'Saving...' : 'Save'}
            </SubmitButton>
            <CancelButton onClick={handleCancel} disabled={isLoading}>
              Cancel
            </CancelButton>
            <KeyboardHint>
              Press Ctrl+Enter to save
            </KeyboardHint>
          </ButtonContainer>
        )}
      </InputContainer>
    </CommentInputWrapper>
  );
}

// ========================= Styles =========================

const CommentInputWrapper = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
`;

const Avatar = styled.div`
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

  img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
  }
`;

const InputContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ReplyChip = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  background: #f1f2f4;
  color: #44546f;
  border-radius: 999px;
  padding: 4px 10px;
  width: fit-content;
`;

const CancelReplyBtn = styled.button`
  background: none;
  border: none;
  color: #0c66e4;
  cursor: pointer;
  padding: 0;
  font-size: 12px;
  text-decoration: underline;
  &:hover {
    color: #0055cc;
  }
`;

const CommentTextarea = styled.textarea`
  width: 100%;
  min-height: ${(props) => (props.$focused ? '80px' : '36px')};
  padding: 8px 12px;
  font-size: 14px;
  border: 1px solid ${(props) => (props.$focused ? '#0c66e4' : '#dfe1e6')};
  border-radius: 3px;
  resize: vertical;
  font-family: inherit;
  transition: all 0.2s ease;
  background: ${(props) => (props.$focused ? 'white' : '#fafbfc')};

  &:focus {
    outline: none;
    border-color: #0c66e4;
    box-shadow: 0 0 0 2px rgba(12, 102, 228, 0.2);
  }

  &::placeholder {
    color: #6b778c;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SubmitButton = styled.button`
  background: #28a745;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 3px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover:not(:disabled) {
    background: #218838;
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
  color: #6b778c;
  cursor: pointer;
  border-radius: 3px;
  font-size: 14px;

  &:hover {
    color: #172b4d;
    background: #ebecf0;
  }
`;

const KeyboardHint = styled.span`
  font-size: 12px;
  color: #6b778c;
  margin-left: auto;
`;
