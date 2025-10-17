import React from 'react';
import {
  LinkSectionWrapper,
  LinkHeader,
  LinkTitle,
  LinkControls,
  LinkDescription,
  LinkUrl,
  LinkActions,
  SecondaryButton,
  DangerButton,
} from './ShareBoardPopup.styles';
import { FaLink, FaCopy, FaTrash, FaSpinner } from 'react-icons/fa';

export default React.memo(function ShareLinkSection({
  inviteLink,
  onCopyLink,
  onCreateLink,
  onDeleteLink,
  isLoading,
}) {
  return (
    <LinkSectionWrapper>
      <LinkHeader>
        <FaLink size={14} />
        <LinkTitle>Share this board with a link</LinkTitle>
      </LinkHeader>

      {inviteLink ? (
        <LinkControls>
          <LinkDescription>Anyone with this link can join as a member</LinkDescription>
          <LinkUrl>{inviteLink}</LinkUrl>
          <LinkActions>
            <SecondaryButton onClick={onCopyLink} disabled={isLoading}>
              <FaCopy size={12} />
              Copy link
            </SecondaryButton>
            <DangerButton onClick={onDeleteLink} disabled={isLoading}>
              {isLoading ? <FaSpinner className="spin" size={12} /> : <FaTrash size={12} />}
              Delete
            </DangerButton>
          </LinkActions>
        </LinkControls>
      ) : (
        <LinkControls>
          <LinkDescription>
            Create a link that allows anyone to join this board
          </LinkDescription>
          <SecondaryButton onClick={onCreateLink} disabled={isLoading}>
            {isLoading ? <FaSpinner className="spin" size={12} /> : 'Create link'}
          </SecondaryButton>
        </LinkControls>
      )}
    </LinkSectionWrapper>
  );
});
