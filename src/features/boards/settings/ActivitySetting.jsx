import React, { useEffect, useState } from "react";
import styled, { css } from "styled-components";
import { useNavigate, useLocation, Link } from "react-router-dom";
import axiosClient from "../../../api/apiClient";

/** ===== Design Tokens ===== */
const tokens = {
  radius: { sm: "8px", md: "12px", lg: "16px", full: "9999px" },
  shadow: { sm: "0 1px 2px rgba(0,0,0,.2)", md: "0 6px 24px rgba(0,0,0,.25)" },
  color: {
    bg: "#0b0f19",
    surface: "#111827",
    surfaceAlt: "#0f172a",
    line: "#1f2937",
    text: "#e5e7eb",
    textMuted: "#9aa4b2",
    accent: "#8b5cf6",
    accentHover: "#7c3aed",
    accentRing: "#a78bfa",
    success: "#34d399",
    warning: "#f59e0b",
    danger: "#f43f5e",
    yellow: "#fbbf24",
    red: "#ef4444",
  },
};

const focusRing = css`
  outline: none;
  box-shadow: 0 0 0 3px ${tokens.color.accentRing}33, 0 0 0 1px ${tokens.color.accentRing};
`;

/** ===== Layout Components ===== */
const Container = styled.div`
  min-height: 100vh;
  background: ${tokens.color.bg};
  color: ${tokens.color.text};
  display: grid;
  grid-template-columns: 260px 1fr;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const Sidebar = styled.aside`
  border-right: 1px solid ${tokens.color.line};
  background: linear-gradient(180deg, ${tokens.color.surface} 0%, ${tokens.color.surfaceAlt} 100%);
  position: sticky;
  top: 0;
  height: 100vh;
  padding: 16px 0;

  @media (max-width: 1024px) {
    position: static;
    height: auto;
    border-right: none;
    border-bottom: 1px solid ${tokens.color.line};
  }
`;

const SidebarSection = styled.div`
  padding: 12px 0 16px;
  &:not(:last-of-type) { border-bottom: 1px dashed ${tokens.color.line}; }
`;

const SectionTitle = styled.h3`
  font-size: 11px;
  letter-spacing: .08em;
  text-transform: uppercase;
  color: ${tokens.color.textMuted};
  margin: 0 16px 8px;
`;

const NavButton = styled.button`
  width: 100%;
  text-align: left;
  padding: 10px 16px;
  background: transparent;
  border: 0;
  color: ${tokens.color.text};
  border-left: 3px solid transparent;
  cursor: pointer;
  border-radius: 0;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 10px;

  ${(p) => p.$active && css`
    background: linear-gradient(90deg, ${tokens.color.accent}14, transparent);
    border-left-color: ${tokens.color.accent};
    font-weight: 600;
  `}

  ${(p) => p.disabled && css`
    opacity: .5; cursor: not-allowed;
  `}

  &:hover { background: ${(p) => (p.disabled ? "transparent" : tokens.color.accent + "10")}; }
  &:focus-visible { ${focusRing} }
`;

const Main = styled.main`
  background: radial-gradient(100% 100% at 0% 0%, #0c1222 0%, ${tokens.color.bg} 60%);
`;

const Content = styled.div`
  max-width: 980px;
  margin: 0 auto;
  padding: 28px 20px 80px;
`;

const Title = styled.h1` 
  font-size: 28px; 
  margin: 0 0 8px; 
`;

const Subtitle = styled.p` 
  margin: 0 0 24px; 
  color: ${tokens.color.textMuted}; 
`;

/** ===== Workspace Section ===== */
const WorkspaceSection = styled.section`
  background: linear-gradient(180deg, ${tokens.color.surface} 0%, ${tokens.color.surfaceAlt} 100%);
  border: 1px solid ${tokens.color.line};
  border-radius: ${tokens.radius.lg};
  box-shadow: ${tokens.shadow.md};
  margin-bottom: 18px;
  padding: 20px;
`;

const WorkspaceHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid ${tokens.color.line};
`;

const WorkspaceTitle = styled.h2`
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: .06em;
  color: ${tokens.color.textMuted};
  margin: 0;
`;

const WorkspaceList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const WorkspaceItem = styled.li`
  a {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 12px;
    background: ${tokens.color.surfaceAlt};
    border: 1px solid ${tokens.color.line};
    border-radius: ${tokens.radius.sm};
    color: ${tokens.color.text};
    text-decoration: none;
    transition: all 0.15s ease;

    &:hover {
      background: ${tokens.color.surface};
      border-color: ${tokens.color.accent};
    }
  }
`;

const WorkspaceName = styled.span`
  font-size: 14px;
  font-weight: 500;
`;

const VisibilityBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  font-size: 11px;
  border-radius: ${tokens.radius.sm};
  background: ${(p) => (p.$type === 'private' ? tokens.color.red + '22' : tokens.color.yellow + '22')};
  color: ${(p) => (p.$type === 'private' ? tokens.color.red : tokens.color.yellow)};
`;

/** ===== Activity Feed ===== */
const ActivitySection = styled.section`
  background: linear-gradient(180deg, ${tokens.color.surface} 0%, ${tokens.color.surfaceAlt} 100%);
  border: 1px solid ${tokens.color.line};
  border-radius: ${tokens.radius.lg};
  box-shadow: ${tokens.shadow.md};
  overflow: hidden;
`;

const ActivityHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 18px 20px;
  border-bottom: 1px solid ${tokens.color.line};
`;

const ActivityTitle = styled.h2`
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: .06em;
  color: ${tokens.color.textMuted};
  margin: 0;
`;

const ActivityList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
`;

const ActivityItem = styled.li`
  display: flex;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid ${tokens.color.line};

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: ${tokens.color.surfaceAlt};
  }
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: ${tokens.radius.full};
  background: ${tokens.color.accent};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const AvatarInitial = styled.span`
  color: white;
  font-weight: 700;
  font-size: 16px;
`;

const ActivityContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const ActivityText = styled.p`
  margin: 0 0 6px;
  font-size: 14px;
  line-height: 1.5;

  strong {
    font-weight: 600;
    color: ${tokens.color.text};
  }

  a {
    color: ${tokens.color.accent};
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const ActivityMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  font-size: 12px;
  color: ${tokens.color.textMuted};
`;

const MetaItem = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
`;

const LoadMoreButton = styled.button`
  width: 100%;
  padding: 14px;
  background: ${tokens.color.surfaceAlt};
  border: 0;
  border-top: 1px solid ${tokens.color.line};
  color: ${tokens.color.accent};
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: ${tokens.color.surface};
  }

  &:focus-visible {
    ${focusRing}
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const EmptyState = styled.div`
  padding: 60px 20px;
  text-align: center;
  color: ${tokens.color.textMuted};
`;

const LoadingState = styled.div`
  padding: 40px 20px;
  text-align: center;
  color: ${tokens.color.textMuted};
`;

/** ===== Icons (SVG Components) ===== */
const IconPrivate = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" clipRule="evenodd" d="M5 11C5 9.89543 5.89543 9 7 9H17C18.1046 9 19 9.89543 19 11V19C19 20.1046 18.1046 21 17 21H7C5.89543 21 5 20.1046 5 19V11ZM10.3817 5.69846C10.0982 6.10344 10 6.63103 10 7V9H8V7C8 6.36897 8.15175 5.39656 8.74327 4.55154C9.37523 3.64874 10.4367 3 12 3C13.5633 3 14.6248 3.64874 15.2567 4.55154C15.8482 5.39656 16 6.36897 16 7V9H14V7C14 6.63103 13.9018 6.10344 13.6183 5.69846C13.3752 5.35126 12.9367 5 12 5C11.0633 5 10.6248 5.35126 10.3817 5.69846Z"/>
  </svg>
);

const IconOrganization = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" clipRule="evenodd" d="M12.5048 5.67168C11.9099 5.32669 11.2374 5.10082 10.5198 5.0267C11.2076 3.81639 12.5085 3 14 3C16.2092 3 18 4.79086 18 7C18 7.99184 17.639 8.89936 17.0413 9.59835C19.9512 10.7953 22 13.6584 22 17C22 17.5523 21.5523 18 21 18H18.777C18.6179 17.2987 18.3768 16.6285 18.0645 16H19.917C19.4892 13.4497 17.4525 11.445 14.8863 11.065C14.9608 10.7218 15 10.3655 15 10C15 9.58908 14.9504 9.18974 14.857 8.80763C15.5328 8.48668 16 7.79791 16 7C16 5.89543 15.1046 5 14 5C13.4053 5 12.8711 5.25961 12.5048 5.67168ZM10 12C11.1046 12 12 11.1046 12 10C12 8.89543 11.1046 8 10 8C8.89543 8 8 8.89543 8 10C8 11.1046 8.89543 12 10 12ZM14 10C14 10.9918 13.639 11.8994 13.0412 12.5984C15.9512 13.7953 18 16.6584 18 20C18 20.5523 17.5523 21 17 21H3C2.44772 21 2 20.5523 2 20C2 16.6584 4.04879 13.7953 6.95875 12.5984C6.36099 11.8994 6 10.9918 6 10C6 7.79086 7.79086 6 10 6C12.2091 6 14 7.79086 14 10Z"/>
  </svg>
);

/** ===== Utility Functions ===== */
const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Vừa xong';
  if (minutes < 60) return `${minutes} phút trước`;
  if (hours < 24) return `${hours} giờ trước`;
  if (days < 7) return `${days} ngày trước`;
  
  return date.toLocaleDateString('vi-VN', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric' 
  });
};

const getActionText = (action) => {
  const actions = {
    created: 'đã tạo',
    added: 'đã thêm',
    updated: 'đã cập nhật',
    deleted: 'đã xóa',
    archived: 'đã lưu trữ',
    moved: 'đã di chuyển',
  };
  return actions[action] || 'đã thao tác với';
};

/** ===== Main Component ===== */
export default function Activity() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // ✅ SỬA: Khớp với route trong App.js
  const isActivity = location.pathname.startsWith('/activitySettings');

  const [workspaces, setWorkspaces] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  // Load workspaces
  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        const { data } = await axiosClient.get("/workspaces/");
        setWorkspaces(data);
      } catch (error) {
        console.error("Error loading workspaces:", error);
      }
    };
    fetchWorkspaces();
  }, []);

  // Load activities
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        const { data } = await axiosClient.get("/activity/me/?page=1");
        setActivities(data.results || []);
        setHasMore(Boolean(data.next));
        setPage(1);
      } catch (error) {
        console.error("Error loading activities:", error);
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
  }, []);

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;

    try {
      setLoadingMore(true);
      const nextPage = page + 1;

      const { data } = await axiosClient.get(`/activity/me/?page=${nextPage}`);

      setActivities(prev => [...prev, ...(data.results || [])]);
      setHasMore(Boolean(data.next));
      setPage(nextPage);
    } catch (error) {
      console.error("Error loading more activities:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <Container>
      <Sidebar aria-label="Profile navigation">
        <SidebarSection>
          <SectionTitle>Personal Settings</SectionTitle>
          <NavButton
            type="button"
            onClick={() => navigate('/u/me/profile')}
          >
            Profile & visibility
          </NavButton>
          <NavButton
            type="button"
            onClick={() => navigate('/settings')}
          >
            Settings
          </NavButton>
          <NavButton 
            type="button" 
            $active={isActivity}
            onClick={() => navigate('/activitySettings')}
          >
            Activity
          </NavButton>
          <NavButton type="button" disabled>Cards</NavButton>
        </SidebarSection>

        <SidebarSection>
          <SectionTitle>Workspace</SectionTitle>
          <NavButton type="button" onClick={() => navigate("/boards")}>
            Boards
          </NavButton>
          <NavButton type="button" disabled>Members</NavButton>
          <NavButton type="button" disabled>Settings</NavButton>
          <NavButton type="button" disabled>Upgrade workspace</NavButton>
        </SidebarSection>
      </Sidebar>

      <Main>
        <Content>
          <Title>Activity</Title>
          <Subtitle>Xem tất cả hoạt động của bạn trên các workspace và board.</Subtitle>

          {/* Workspaces Section */}
          <WorkspaceSection>
            <WorkspaceHeader>
              <IconOrganization />
              <WorkspaceTitle>Workspaces</WorkspaceTitle>
            </WorkspaceHeader>
            <WorkspaceList>
              {workspaces.map(ws => (
                <WorkspaceItem key={ws.id}>
                  <Link to={`/w/${ws.slug}/boards`}>
                    <WorkspaceName>{ws.name}</WorkspaceName>
                    <VisibilityBadge $type={ws.visibility}>
                      {ws.visibility === 'private' ? <IconPrivate /> : <IconOrganization />}
                      {ws.visibility === 'private' ? 'Private' : 'Organization'}
                    </VisibilityBadge>
                  </Link>
                </WorkspaceItem>
              ))}
            </WorkspaceList>
          </WorkspaceSection>

          {/* Activity Feed Section */}
          <ActivitySection>
            <ActivityHeader>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 5C2.8955 5 2 5.89543 2 7C2 8.1045 2.89543 9 4 9C5.1045 9 6 8.10457 6 7C6 5.8955 5.10457 5 4 5Z"/>
                <path d="M4 13C2.8955 13 2 13.8954 2 15C2 16.1045 2.89543 17 4 17C5.1045 17 6 16.1046 6 15C6 13.8955 5.10457 13 4 13Z"/>
                <path d="M8 6C8 5.44772 8.44772 5 9 5H21C21.5523 5 22 5.44772 22 6C22 6.55228 21.5523 7 21 7H9C8.44772 7 8 6.55228 8 6Z"/>
                <path d="M9 9C8.44772 9 8 9.44772 8 10C8 10.5523 8.44771 11 9 11H18C18.5523 11 19 10.5523 19 10C19 9.44772 18.5523 9 18 9H9Z"/>
                <path d="M8 14C8 13.4477 8.44772 13 9 13H21C21.5523 13 22 13.4477 22 14C22 14.5523 21.5523 15 21 15H9C8.44772 15 8 14.5523 8 14Z"/>
                <path d="M9 17C8.44772 17 8 17.4477 8 18C8 18.5523 8.44771 19 9 19H18C18.5523 19 19 18.5523 19 18C19 17.4477 18.5523 17 18 17H9Z"/>
              </svg>
              <ActivityTitle>Activity</ActivityTitle>
            </ActivityHeader>

            {loading ? (
              <LoadingState>Đang tải hoạt động...</LoadingState>
            ) : activities.length === 0 ? (
              <EmptyState>
                <p>Chưa có hoạt động nào</p>
              </EmptyState>
            ) : (
              <>
                <ActivityList>
                  {activities.map((activity) => (
                    <ActivityItem key={activity.id}>
                      <Avatar>
                        {activity.user?.avatar_url ? (
                          <img src={activity.user.avatar_url} alt={activity.user.display_name} />
                        ) : (
                          <AvatarInitial>
                            {(activity.user?.display_name || 'U')[0].toUpperCase()}
                          </AvatarInitial>
                        )}
                      </Avatar>

                      <ActivityContent>
                        <ActivityText>
                            <strong>{activity.user?.display_name || "User"}</strong>{" "}
                            {getActionText(activity.action)}{" "}
                            {/* Card/Board target */}
                            {activity.target?.id && (
                                <Link to={`/b/${activity.target.id}`}>{activity.target.name}</Link>
                            )}
                            
                            {activity.workspace && (
                                <>
                                {" "}
                                in{" "}
                                <Link to={`/workspaces/${activity.workspace.id}`}>
                                    {activity.workspace.name}
                                </Link>
                                </>
                            )}
                        </ActivityText>

                        
                        <ActivityMeta>

                            <MetaItem>{formatTimestamp(activity.timestamp)}</MetaItem>

                            {/* Board */}
                            {activity.target?.id && (
                                <>
                                <span>•</span>
                                <MetaItem>
                                    on board{" "}
                                    <Link to={`/b/${activity.target.id}`}>{activity.target.name}</Link>
                                </MetaItem>
                                </>
                            )}

                            {/* Workspace */}
                            {activity.workspace && (
                                <>
                                <span>•</span>
                                <MetaItem>
                                    on workspace{" "}
                                    <Link to={`/workspaces/${activity.workspace.id}`}>
                                    {activity.workspace.name}
                                    </Link>
                                    {" "}
                                    {activity.workspace.visibility === "private" ? (
                                    <IconPrivate />
                                    ) : (
                                    <IconOrganization />
                                    )}
                                </MetaItem>
                            </>
                        )}
                        </ActivityMeta>

                      </ActivityContent>
                    </ActivityItem>
                  ))}
                </ActivityList>
                {hasMore && (
                  <LoadMoreButton onClick={loadMore} disabled={loadingMore}>
                    {loadingMore ? 'Đang tải...' : 'Tải thêm hoạt động'}
                  </LoadMoreButton>
                )}
              </>
            )}
          </ActivitySection>
        </Content>
      </Main>
    </Container>
  );
}