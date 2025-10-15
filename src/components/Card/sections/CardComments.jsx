import React, { useMemo } from 'react';
import styled from 'styled-components';
import Comment from '../Comment/Comment';           // đường dẫn tùy cấu trúc của bạn
import CommentInput from '../Comment/CommentInput'; // idem

export default function CardComments({
  cardId,
  currentUser,
  comments,
  loading,
  replyingTo,
  onReply,
  onCancelReply,
  onCommentAdded,
  onCommentReplaced,
  onCommentRemove,
  onCommentUpdated,
  onCommentDeleted
}) {
  // roots & childrenMap giống logic cũ trong FullCardModal
  const roots = useMemo(() => comments.filter((c) => !c.parent_id), [comments]);
  const childrenMap = useMemo(() => {
    const map = {};
    for (const c of comments) {
      if (c.parent_id) (map[c.parent_id] ||= []).push(c);
    }
    Object.values(map).forEach((arr) =>
      arr.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    );
    return map;
  }, [comments]);

  return (
    <Section>
      <SectionLabel>Add a comment</SectionLabel>

      <CommentInput
        cardId={cardId}
        currentUser={currentUser}
        // optimistic flow
        onCommentAdded={onCommentAdded}
        onCommentReplaced={onCommentReplaced}
        onCommentRemove={onCommentRemove}
        // reply state
        parentId={replyingTo?.id || null}
        replyingTo={replyingTo}
        onCancelReply={onCancelReply}
        placeholder={
          replyingTo
            ? `Trả lời @${replyingTo.author?.name || replyingTo.author?.username || 'user'}...`
            : 'Write a comment...'
        }
      />

      {loading ? (
        <LoadingText>Loading comments...</LoadingText>
      ) : (
        <CommentList>
          {roots.map((root) => (
            <div key={root.id ?? root.temp_id}>
              <Comment
                comment={root}
                currentUserId={currentUser?.id}
                onUpdate={onCommentUpdated}
                onDelete={onCommentDeleted}
                onReply={onReply}
              />
              {(childrenMap[root.id] || []).map((rep) => (
                <ReplyRow key={rep.id ?? rep.temp_id}>
                  <Comment
                    comment={rep}
                    currentUserId={currentUser?.id}
                    onUpdate={onCommentUpdated}
                    onDelete={onCommentDeleted}
                    onReply={(parentId, author) => onReply(parentId, author)}
                  />
                </ReplyRow>
              ))}
            </div>
          ))}
        </CommentList>
      )}
    </Section>
  );
}

/* --- Styled: copy y hệt để đảm bảo no-visual-diff --- */
const Section = styled.div`
  margin-bottom: 24px;
`;
const SectionLabel = styled.h4`
  font-size: 14px;
  font-weight: 600;
  color: #172b4d;
  margin: 0 0 8px 0;
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
const ReplyRow = styled.div`
  margin-left: 32px;
  margin-top: 8px;
`;
