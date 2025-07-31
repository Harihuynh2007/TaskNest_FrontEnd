import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { addMemberToBoard, fetchBoardMembers } from '../../api/boardApi';
import { toast } from 'react-toastify';

import {
  mockFetchBoardMembers,
  mockFetchUsers,
  mockAddMemberToBoard,
} from '../../api/mockApi';

export default function ShareBoardPopup({ boardId, onClose }) {
  const [users, setUsers] = useState([]);
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('member');
  const [activeTab, setActiveTab] = useState('members');

  useEffect(() => {
    mockFetchUsers().then((res) => setUsers(res.data));
    mockFetchBoardMembers(boardId).then((res) => setMembers(res.data));
  }, [boardId]);

  const handleInvite = async () => {
    const target = users.find(u => u.username === search || u.email === search);
    if (!target) return toast.error('User not found');
    try {
      await mockAddMemberToBoard(boardId, target.id);
      toast.success('User added');
      setSearch('');
      const res = await mockFetchBoardMembers(boardId);
      setMembers(res.data);
    } catch (err) {
      toast.error('Failed to add');
    }
  };

  const handleChangeRole = (userId, newRole) => {
    // Chưa có API nên chỉ toast
    toast.info(`Changed role of user ${userId} to ${newRole}`);
    // Sau này sẽ gọi API PATCH để update role thật
  };

  return (
    <Wrapper>
      <Header>
        <Title>Share board</Title>
        <CloseBtn onClick={onClose}>×</CloseBtn>
      </Header>

      <InviteRow>
        <Input
          placeholder="Email address or name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="member">Member</option>
          <option value="admin">Admin</option>
        </Select>
        <ShareBtn onClick={handleInvite}>Share</ShareBtn>
      </InviteRow>

      <LinkSection>
        <Left><strong>Anyone with the link can join as a member</strong></Left>
        <Right>
          <SmallBtn>Copy link</SmallBtn>
          <SmallBtn>Delete link</SmallBtn>
        </Right>

      </LinkSection>

      <Tabs>
        <Tab active={activeTab === 'members'} onClick={() => setActiveTab('members')}>
          Board members ({members.length})
        </Tab>
        <Tab active={activeTab === 'requests'} onClick={() => setActiveTab('requests')}>
          Join requests
        </Tab>
      </Tabs>

      {activeTab === 'members' && (
        <MemberList>
          {members.map((m) => (
            <MemberRow key={m.id}>
              <Avatar src="https://i.imgur.com/4ZQZ4Zl.png" />
              <div>
                <strong>{m.username}</strong> {m.is_you && '(you)'}
                <Sub>{m.email}</Sub>
              </div>
              <RoleBtn>{m.role || 'Member'} ▾</RoleBtn>
            </MemberRow>
          ))}
        </MemberList>
      )}

      {activeTab === 'requests' && (
        <EmptyState>
          There are no requests to join this board.
        </EmptyState>
      )}
    </Wrapper>
  );
}

const Wrapper = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 584px;
  background: white;
  border-radius: 12px;
  padding: 20px 24px 0;
  box-shadow: 0 12px 32px rgba(0,0,0,0.2);
  display: flex;
  flex-direction: column;
  gap: 16px;
  z-index: 999;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 16px;
  color: #172B4D;
`;

const CloseBtn = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  color: #44546F;
  cursor: pointer;
`;

const InviteRow = styled.div`
  display: flex;
  gap: 8px;
`;

const Input = styled.input`
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #dfe1e6;
  border-radius: 6px;
  font-size: 14px;
`;

const Select = styled.select`
  padding: 8px;
  border-radius: 6px;
  border: 1px solid #dfe1e6;
  font-size: 14px;
`;

const ShareBtn = styled.button`
  background: #0c66e4;
  color: white;
  padding: 8px 16px;
  font-weight: 500;
  border: none;
  border-radius: 6px;
  cursor: pointer;
`;

const LinkSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Left = styled.div`
  font-size: 14px;
  color: #44546F;
`;

const Right = styled.div`
  display: flex;
  gap: 8px;
`;

const SmallBtn = styled.button`
  padding: 6px 12px;
  font-size: 13px;
  background: #f4f5f7;
  border: 1px solid #ccc;
  border-radius: 6px;
  cursor: pointer;
`;

const ChangePermsBtn = styled.button`
  font-size: 13px;
  text-align: left;
  color: #0c66e4;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
`;

const Tabs = styled.div`
  display: flex;
  gap: 16px;
  border-bottom: 1px solid #dfe1e6;
`;

const Tab = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: ${({ active }) => (active ? '#0c66e4' : '#44546F')};
  padding-bottom: 4px;
  border-bottom: ${({ active }) => (active ? '2px solid #0c66e4' : 'none')};
  cursor: pointer;
`;

const MemberList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const MemberRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Avatar = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
`;

const Sub = styled.div`
  font-size: 12px;
  color: #626f86;
`;

const RoleBtn = styled.button`
  margin-left: auto;
  background: #f4f5f7;
  border: 1px solid #ccc;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 13px;
  cursor: pointer;
`;

const EmptyState = styled.div`
  font-size: 14px;
  color: #626f86;
  padding: 16px;
  text-align: center;
`;
const SelectRole = styled.select`
  margin-left: auto;
  background: #f4f5f7;
  border: 1px solid #ccc;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 13px;
  cursor: pointer;
`;
