import React, { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import { WorkspaceContext } from "../../contexts/WorkspaceContext";
import { fetchBoardsInWorkspace } from "../../api/workspaceApi";

// ===================== STYLED COMPONENTS =====================

const Page = styled.div`
  padding: 32px 40px;
  color: #e5e7eb;
  min-height: calc(100vh - 64px);
  background: #0f1117;
  font-family: "Inter", sans-serif;
`;

const HeaderRow = styled.div`
  margin-bottom: 28px;
`;

const Title = styled.h2`
  font-size: 26px;
  font-weight: 700;
  color: #f9fafb;
  margin-bottom: 6px;
`;

const SubTitle = styled.div`
  font-size: 14px;
  color: #9ca3af;
`;

const ActionsRow = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 24px;
`;

const ActionBtn = styled.button`
  background: #1f2937;
  color: #f3f4f6;
  font-size: 14px;
  padding: 9px 16px;
  border-radius: 8px;
  border: 1px solid #374151;
  cursor: pointer;
  transition: 0.2s ease;
  font-weight: 500;

  &:hover {
    background: #2b3545;
    border-color: #4b5563;
  }
`;

const BoardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
`;

const BoardCard = styled.div`
  position: relative;
  height: 150px;
  border-radius: 14px;
  cursor: pointer;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: #1c1f26;
  transition: 0.25s ease;
  display: flex;
  justify-content: flex-start;
  align-items: flex-end;
  padding: 18px;

  &:hover {
    transform: translateY(-4px);
    background: #23272f;
    box-shadow: 0 8px 22px rgba(0, 0, 0, 0.35);
  }
`;

const BoardBg = styled.div`
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  opacity: 0.32;
`;

const BoardOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0.1) 10%,
    rgba(0, 0, 0, 0.65) 100%
  );
`;

const BoardMeta = styled.div`
  position: absolute;
  top: 12px;
  left: 12px;
  font-size: 12px;
  padding: 3px 8px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  color: #e5e7eb;
  z-index: 2;
`;

const BoardName = styled.div`
  font-size: 16px;
  font-weight: 600;
  z-index: 3;
  color: white;
`;

const CreateCard = styled(BoardCard)`
  justify-content: center;
  align-items: center;
  color: #d1d5db;
  border-style: dashed;

  &:hover {
    background: #262b35;
    color: white;
  }
`;

const EmptyState = styled.div`
  margin-top: 10px;
  padding: 22px;
  background: #13161c;
  border: 1px dashed #374151;
  border-radius: 12px;
  font-size: 14px;
  color: #9ca3af;
`;

const ErrorState = styled(EmptyState)`
  border-color: #7f1d1d;
  color: #fecaca;
`;

// ===================== COMPONENT =====================

export default function WorkspaceBoardsPage() {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const { workspaces } = useContext(WorkspaceContext);

  const ws = useMemo(
    () => workspaces.find((w) => String(w.id) === String(workspaceId)),
    [workspaces, workspaceId]
  );

  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadBoards() {
      try {
        const res = await fetchBoardsInWorkspace(workspaceId);
        if (!mounted) return;
        setBoards(res.data || []);
      } catch (err) {
        setError(err?.response?.data?.detail || "Failed to load boards.");
      }
      setLoading(false);
    }

    loadBoards();
    return () => {
      mounted = false;
    };
  }, [workspaceId]);

  if (!ws) {
    return (
      <Page>
        <Title>Workspace not found</Title>
      </Page>
    );
  }

  const canCreate = ws.can_create_board;

  return (
    <Page>
      <HeaderRow>
        <Title>Your boards</Title>
        <SubTitle>
          Workspace: <b>{ws.name}</b> • Role: {ws.effective_role}
        </SubTitle>
      </HeaderRow>

      <ActionsRow>
        {canCreate && (
          <ActionBtn onClick={() => navigate(`/w/${workspaceId}/create-board`)}>
            Create board
          </ActionBtn>
        )}
      </ActionsRow>

      {loading && <EmptyState>Loading boards...</EmptyState>}
      {!loading && error && <ErrorState>{error}</ErrorState>}

      {!loading && !error && (
        <BoardsGrid>
          {boards.map((b) => (
            <BoardCard
              key={b.id}
              onClick={() =>
                navigate(`/workspaces/${workspaceId}/boards/${b.id}`)
              }
            >
              {b.background ? (
                <BoardBg
                  style={{
                    backgroundImage: `url(${b.background})`,
                  }}
                />
              ) : (
                <BoardBg
                  style={{
                    background:
                      "linear-gradient(135deg, #2d3748, #1a1f2c, #111316)",
                  }}
                />
              )}

              <BoardOverlay />
              <BoardMeta>{b.visibility}</BoardMeta>
              <BoardName>{b.name}</BoardName>
            </BoardCard>
          ))}

          {canCreate && (
            <CreateCard
              onClick={() => navigate(`/w/${workspaceId}/create-board`)}
            >
              + Create new board
            </CreateCard>
          )}
        </BoardsGrid>
      )}
    </Page>
  );
}
