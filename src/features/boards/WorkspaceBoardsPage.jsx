import React, { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import { WorkspaceContext } from "../../contexts/WorkspaceContext";
import api from "../../api/apiClient";
import { fetchBoardsInWorkspace } from "../../api/workspaceApi";
import { AuthContext } from "../../contexts/AuthContext";

// ===================== ICONS (SVG) =====================
const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
);
const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);
const XIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);
const LockIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
);
const GlobeIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
);

// ===================== STYLED COMPONENTS =====================

const Page = styled.div`
  padding: 32px 40px;
  color: #e5e7eb;
  min-height: calc(100vh - 64px);
  background: #0f1117;
  font-family: "Inter", sans-serif;
`;

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 32px;
  border-bottom: 1px solid #2d3748;
  padding-bottom: 20px;
`;

const HeaderLeft = styled.div``;

const Title = styled.h2`
  font-size: 28px;
  font-weight: 700;
  color: #f9fafb;
  margin: 0 0 8px 0;
`;

const SubTitle = styled.div`
  font-size: 14px;
  color: #9ca3af;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const RoleBadge = styled.span`
  background: #1f2937;
  color: #60a5fa;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ControlsRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  gap: 16px;
`;

const SearchContainer = styled.div`
  position: relative;
  width: 300px;
`;

const SearchInput = styled.input`
  width: 100%;
  background: #1f2937;
  border: 1px solid #374151;
  color: #e5e7eb;
  padding: 10px 10px 10px 36px;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
`;

const SearchIconWrapper = styled.div`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  display: flex;
`;

const TabsContainer = styled.div`
  display: flex;
  background: #1f2937;
  padding: 4px;
  border-radius: 8px;
`;

const Tab = styled.button`
  background: ${props => props.$active ? '#374151' : 'transparent'};
  color: ${props => props.$active ? '#f3f4f6' : '#9ca3af'};
  border: none;
  padding: 6px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    color: #f3f4f6;
  }
`;

const BoardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 24px;
`;

const BoardCard = styled.div`
  position: relative;
  height: 140px;
  border-radius: 8px;
  cursor: pointer;
  overflow: hidden;
  background: #1c1f26;
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 16px;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5);
  }
`;

const BoardBg = styled.div`
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  opacity: 0.6;
  transition: opacity 0.2s;
  
  ${BoardCard}:hover & {
    opacity: 0.4;
  }
`;

const BoardContent = styled.div`
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: space-between;
`;

const BoardName = styled.h3`
  font-size: 16px;
  font-weight: 700;
  color: white;
  margin: 0;
  text-shadow: 0 1px 2px rgba(0,0,0,0.8);
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const BoardMetaRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const VisibilityBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 1px 2px rgba(0,0,0,0.8);
`;

const OwnerAvatar = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #374151;
  color: #fff;
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(255,255,255,0.2);
  font-weight: bold;
`;

const CreateCard = styled.button`
  height: 140px;
  border-radius: 8px;
  background: #1f2937;
  border: 2px dashed #374151;
  color: #9ca3af;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  gap: 8px;
  font-size: 14px;

  &:hover {
    border-color: #60a5fa;
    color: #60a5fa;
    background: #262b35;
  }
`;

const EmptyState = styled.div`
  padding: 40px;
  text-align: center;
  color: #6b7280;
  background: rgba(31, 41, 55, 0.5);
  border-radius: 12px;
  border: 1px dashed #374151;
`;

// ===================== MODAL STYLES =====================
const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  z-index: 50;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ModalBox = styled.div`
  background: #1f2937;
  border-radius: 12px;
  width: 400px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  border: 1px solid #374151;
`;

const ModalHeader = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid #374151;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ModalTitle = styled.h3`
  margin: 0;
  color: #f3f4f6;
  font-size: 16px;
  font-weight: 600;
`;

const CloseBtn = styled.button`
  background: transparent;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  &:hover { color: #fff; background: #374151; }
`;

const ModalBody = styled.div`
  padding: 20px;
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: #d1d5db;
  margin-bottom: 6px;
`;

const Input = styled.input`
  width: 100%;
  background: #111827;
  border: 1px solid #374151;
  color: white;
  padding: 10px;
  border-radius: 6px;
  font-size: 14px;
  &:focus { border-color: #3b82f6; outline: none; }
`;

const Select = styled.select`
  width: 100%;
  background: #111827;
  border: 1px solid #374151;
  color: white;
  padding: 10px;
  border-radius: 6px;
  font-size: 14px;
  &:focus { border-color: #3b82f6; outline: none; }
`;

const ColorGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
`;

const ColorOption = styled.button`
  width: 100%;
  aspect-ratio: 16/9;
  border-radius: 4px;
  border: 2px solid ${props => props.$selected ? '#60a5fa' : 'transparent'};
  background: ${props => props.$bg};
  background-size: cover;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover { transform: scale(1.05); }
`;

const ModalFooter = styled.div`
  padding: 16px 20px;
  background: #111827;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`;

const Button = styled.button`
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid transparent;
  
  &.secondary {
    background: transparent;
    color: #9ca3af;
    &:hover { color: #fff; }
  }
  
  &.primary {
    background: #2563eb;
    color: white;
    &:hover { background: #1d4ed8; }
    &:disabled { opacity: 0.5; cursor: not-allowed; }
  }
`;

// ===================== BACKGROUND PRESETS =====================
const BG_PRESETS = [
  { id: 'grad1', val: 'linear-gradient(135deg, #0079bf, #5067c5)' },
  { id: 'grad2', val: 'linear-gradient(135deg, #d29034, #b04632)' },
  { id: 'grad3', val: 'linear-gradient(135deg, #519839, #4bbf6b)' },
  { id: 'grad4', val: 'linear-gradient(135deg, #89609e, #cd5a91)' },
  { id: 'grad5', val: 'linear-gradient(135deg, #2d3748, #1a1f2c)' },
];

// ===================== COMPONENT =====================

export default function WorkspaceBoardsPage() {
  const { user, loading: authLoading } = useContext(AuthContext);

  
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const { workspaces } = useContext(WorkspaceContext);

  // --- State ---
  const [boards, setBoards] = useState([]);
  const [closedBoards, setClosedBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'closed'
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBoardData, setNewBoardData] = useState({
    name: '',
    visibility: 'private',
    background: BG_PRESETS[0].val
  });
  const [creating, setCreating] = useState(false);

  // Derived
  const ws = useMemo(
    () => workspaces.find((w) => String(w.id) === String(workspaceId)),
    [workspaces, workspaceId]
  );

  const canCreate = ws?.can_create_board;

  // --- Effects ---
  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      setLoading(true);
      try {
        // 1. Fetch active boards (theo workspace)
        const resActive = await fetchBoardsInWorkspace(workspaceId);
        
        // 2. Fetch closed boards (theo user -> filter client side nếu API trả về tất cả)
        // Nếu chưa có hàm fetchClosedBoards trong api/workspaceApi, dùng axios trực tiếp:
        const resClosed = await api.get('/boards/closed/'); 
        
        if (mounted) {
          setBoards(resActive.data || []);
          
          // Lọc closed boards thuộc workspace này
          const closedInWs = (resClosed.data || []).filter(
            b => String(b.workspace?.id || b.workspace) === String(workspaceId)
          );
          setClosedBoards(closedInWs);
        }
      } catch (err) {
        console.error("Failed to load boards", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    
    if (ws) loadData();
    return () => { mounted = false; };
  }, [workspaceId, ws]);

  // --- Handlers ---
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!newBoardData.name.trim()) return;

    setCreating(true);
    try {
      // API endpoint: /workspaces/:id/boards/
      const res = await api.post(`/workspaces/${workspaceId}/boards/`, newBoardData);
      setBoards([...boards, res.data]);
      setIsModalOpen(false);
      setNewBoardData({ name: '', visibility: 'private', background: BG_PRESETS[0].val });
      navigate(`/workspaces/${workspaceId}/boards/${res.data.id}`);
    } catch (error) {
      alert(error.response?.data?.detail || "Could not create board");
    } finally {
      setCreating(false);
    }
  };

  const filteredBoards = useMemo(() => {
    const source = activeTab === 'active' ? boards : closedBoards;
    if (!searchQuery) return source;
    return source.filter(b => b.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [activeTab, boards, closedBoards, searchQuery]);

  // --- Render ---

  if (!ws) return <Page><EmptyState>Workspace not found</EmptyState></Page>;
  
  return (
    <Page>
      {/* Header */}
      <HeaderRow>
        <HeaderLeft>
          <Title>{ws.name}</Title>
          <SubTitle>
            {ws.effective_role === 'owner' && <GlobeIcon />} 
            <span>Workspace • <RoleBadge>{ws.effective_role}</RoleBadge></span>
          </SubTitle>
        </HeaderLeft>
      </HeaderRow>

      {/* Controls: Search & Tabs & Create */}
      <ControlsRow>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <TabsContainer>
                <Tab 
                $active={activeTab === 'active'} 
                onClick={() => setActiveTab('active')}
                >
                Active Boards ({boards.length})
                </Tab>
                <Tab 
                $active={activeTab === 'closed'} 
                onClick={() => setActiveTab('closed')}
                >
                Closed Boards ({closedBoards.length})
                </Tab>
            </TabsContainer>

            <SearchContainer>
            <SearchIconWrapper><SearchIcon /></SearchIconWrapper>
            <SearchInput 
                placeholder="Search boards..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
            />
            </SearchContainer>
        </div>

        {activeTab === 'active' && canCreate && (
          <Button 
            className="primary" 
            onClick={() => setIsModalOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <PlusIcon /> Create Board
          </Button>
        )}
      </ControlsRow>

      {/* Content Grid */}
      {loading ? (
        <EmptyState>Loading...</EmptyState>
      ) : (
        <BoardsGrid>
          {/* Create Button Card (Only in active tab) */}
          {activeTab === 'active' && canCreate && !searchQuery && (
            <CreateCard onClick={() => setIsModalOpen(true)}>
              <PlusIcon />
              <span>Create new board</span>
            </CreateCard>
          )}

          {/* Board Cards */}
          {filteredBoards.map((b) => (
            <BoardCard
              key={b.id}
              onClick={() => navigate(`/workspaces/${workspaceId}/boards/${b.id}`)}
            >
              <BoardBg style={{ background: b.background || '#2d3748' }} />
              
              <BoardContent>
                <BoardName>{b.name}</BoardName>
                
                <BoardMetaRow>
                  <VisibilityBadge>
                    {b.visibility === 'private' ? <LockIcon /> : <GlobeIcon />}
                    {b.visibility}
                  </VisibilityBadge>
                  
                  {/* Display Owner Avatar/Initials */}
                  {(b.current_owner || b.owned_by) && (
                    <OwnerAvatar title={`Owner: ${(b.current_owner || b.owned_by).username}`}>
                      {(b.current_owner || b.owned_by).initials || (b.current_owner || b.owned_by).username.slice(0,2).toUpperCase()}
                    </OwnerAvatar>
                  )}
                </BoardMetaRow>
              </BoardContent>
            </BoardCard>
          ))}

          {filteredBoards.length === 0 && searchQuery && (
            <div style={{ gridColumn: '1 / -1', color: '#9ca3af', textAlign: 'center', padding: '20px' }}>
                No boards match your search.
            </div>
          )}
        </BoardsGrid>
      )}

      {/* Create Board Modal */}
      {isModalOpen && (
        <Overlay onClick={() => setIsModalOpen(false)}>
          <ModalBox onClick={e => e.stopPropagation()}>
            <form onSubmit={handleCreateSubmit}>
              <ModalHeader>
                <ModalTitle>Create Board</ModalTitle>
                <CloseBtn type="button" onClick={() => setIsModalOpen(false)}><XIcon /></CloseBtn>
              </ModalHeader>
              
              <ModalBody>
                <FormGroup>
                    <Label>Board Title</Label>
                    <Input 
                        autoFocus
                        placeholder="e.g. Web Design Project"
                        value={newBoardData.name}
                        onChange={e => setNewBoardData({...newBoardData, name: e.target.value})}
                        required
                    />
                </FormGroup>

                <FormGroup>
                    <Label>Visibility</Label>
                    <Select
                        value={newBoardData.visibility}
                        onChange={e => setNewBoardData({...newBoardData, visibility: e.target.value})}
                    >
                        <option value="private">Private (Members only)</option>
                        <option value="workspace">Workspace (All workspace members)</option>
                        <option value="public">Public (Anyone with link)</option>
                    </Select>
                </FormGroup>

                <FormGroup>
                    <Label>Background</Label>
                    <ColorGrid>
                        {BG_PRESETS.map(bg => (
                            <ColorOption
                                key={bg.id}
                                type="button"
                                $bg={bg.val}
                                $selected={newBoardData.background === bg.val}
                                onClick={() => setNewBoardData({...newBoardData, background: bg.val})}
                            />
                        ))}
                    </ColorGrid>
                </FormGroup>
              </ModalBody>

              <ModalFooter>
                <Button type="button" className="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" className="primary" disabled={creating || !newBoardData.name}>
                    {creating ? 'Creating...' : 'Create Board'}
                </Button>
              </ModalFooter>
            </form>
          </ModalBox>
        </Overlay>
      )}
    </Page>
  );
}