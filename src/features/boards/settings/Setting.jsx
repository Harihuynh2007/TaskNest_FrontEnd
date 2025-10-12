import React, { useEffect, useRef, useState } from "react";
import styled, { css } from "styled-components";
import { useNavigate, useLocation } from "react-router-dom";
import axiosClient from "../../../api/apiClient";

/** ===== Design Tokens (khớp Profile) ===== */
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
    danger: "#f43f5e",
  },
};

const focusRing = css`
  outline: none;
  box-shadow: 0 0 0 3px ${tokens.color.accentRing}33, 0 0 0 1px ${tokens.color.accentRing};
`;

/** ===== Layout (copy từ Profile) ===== */
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

  &:hover { background: ${tokens.color.accent + "10"}; }
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

const Title = styled.h1` font-size: 28px; margin: 0 0 8px; `;
const Subtitle = styled.p` margin: 0 0 24px; color: ${tokens.color.textMuted}; `;

const Group = styled.section`
  background: linear-gradient(180deg, ${tokens.color.surface} 0%, ${tokens.color.surfaceAlt} 100%);
  border: 1px solid ${tokens.color.line};
  border-radius: ${tokens.radius.lg};
  box-shadow: ${tokens.shadow.md};
  overflow: clip;
  margin-bottom: 18px;
`;
const GroupHead = styled.header`
  padding: 18px 20px; border-bottom: 1px solid ${tokens.color.line};
`;
const GroupTitle = styled.h2` font-size: 16px; margin: 0 0 4px; `;
const GroupDesc = styled.p` margin: 0; color: ${tokens.color.textMuted}; font-size: 14px; `;
const GroupBody = styled.div` padding: 18px 20px; `;

const Grid = styled.div`
  display: grid; gap: 14px; grid-template-columns: 1fr 1fr;
  @media (max-width: 760px){ grid-template-columns: 1fr; }
`;

const Field = styled.div` display: grid; gap: 6px; `;
const Label = styled.label`
  font-size: 12px; text-transform: uppercase; letter-spacing: .06em; color: ${tokens.color.textMuted};
`;
const Select = styled.select`
  padding: 10px 12px; font-size: 14px; color: ${tokens.color.text};
  background: ${tokens.color.surfaceAlt}; border: 1px solid ${tokens.color.line}; border-radius: ${tokens.radius.sm};
  &:focus{ ${focusRing} }
`;
const CheckRow = styled.label`
  display: grid; grid-template-columns: 20px 1fr; gap: 10px; align-items: start; cursor: pointer;
  input{ accent-color: ${tokens.color.accent}; width: 18px; height: 18px; margin-top: 1px; }
`;
const Helper = styled.p` margin: 4px 0 0; font-size: 12px; color: ${tokens.color.textMuted}; `;
const Row = styled.div` display: flex; gap: 12px; flex-wrap: wrap; align-items: center; `;

const Button = styled.button`
  --bg: ${tokens.color.accent}; --bgH: ${tokens.color.accentHover};
  padding: 10px 16px; color: white; background: var(--bg);
  border: 0; border-radius: ${tokens.radius.sm}; cursor: pointer; font-weight: 600; font-size: 14px;
  transition: .15s ease; box-shadow: ${tokens.shadow.sm};
  &:hover{ background: var(--bgH); }
  &:disabled{ opacity: .6; cursor: not-allowed; }
  &:focus-visible{ ${focusRing} }
`;
const GhostButton = styled(Button)` --bg: ${tokens.color.surface}; --bgH: ${tokens.color.surfaceAlt}; color: ${tokens.color.text}; border: 1px solid ${tokens.color.line}; `;
const InlineMsg = styled.div`
  font-size: 13px; color: ${(p) => (p.$type === 'success' ? tokens.color.success : tokens.color.textMuted)};
`;

/** ===== Prefs helpers ===== */
const loadPrefs = () => {
  try { return JSON.parse(localStorage.getItem('user:prefs') || '{}'); } catch { return {}; }
};
const savePrefs = (prefs) => localStorage.setItem('user:prefs', JSON.stringify(prefs));

/** ===== Component ===== */
export default function Settings() {
  const navigate = useNavigate();
  const location = useLocation();
  const isSettings = location.pathname.startsWith('/settings'); // đổi nếu bạn dùng /me/settings
  const [prefs, setPrefs] = useState(() => ({
    emailFrequency: 'hourly', // 'instant' | 'hourly' | 'never'
    notifyDesktop: false,
    reducedMotion: false,
    colorBlindMode: false,
    compactMode: false,
  }));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = loadPrefs();
    setPrefs((p) => ({ ...p, ...stored }));
  }, []);

  const handleChange = (k, v) => {
    setSaved(false);
    setPrefs((p) => ({ ...p, [k]: v }));
  };

  const applyDocumentFlags = (next) => {
    document.documentElement.dataset.compact = next.compactMode ? '1' : '';
    document.documentElement.dataset.colorBlind = next.colorBlindMode ? '1' : '';
    document.documentElement.dataset.rm = next.reducedMotion ? '1' : '';
  };

  const requestDesktopPermission = async () => {
    if (!('Notification' in window)) return;
    const p = await Notification.requestPermission();
    if (p === 'granted') handleChange('notifyDesktop', true);
  };

  const handleSave = async () => {
    setSaving(true); setSaved(false);
    try {
      savePrefs(prefs);
      applyDocumentFlags(prefs);
      try { await axiosClient.patch('/auth/me/settings/', prefs); } catch {}
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  const signOutOthers = async () => {
    try {
      await axiosClient.post('/auth/logout/others/');
      alert('Đã đăng xuất khỏi các thiết bị khác.');
    } catch {
      alert('Không thể đăng xuất thiết bị khác (endpoint chưa khả dụng).');
    }
  };

  return (
    <Container>
      {/* ===== Sidebar giữ nguyên như Profile ===== */}
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
            $active={isSettings}
            aria-current={isSettings ? 'page' : undefined}
            onClick={() => navigate('/settings')}
          >
            Settings
          </NavButton>
          <NavButton type="button" disabled aria-disabled>Activity</NavButton>
          <NavButton type="button" disabled aria-disabled>Cards</NavButton>
        </SidebarSection>

        <SidebarSection>
          <SectionTitle>Workspace</SectionTitle>
          <NavButton type="button" onClick={() => navigate("/boards")}>Boards</NavButton>
          <NavButton type="button" disabled aria-disabled>Members</NavButton>
          <NavButton type="button" disabled aria-disabled>Settings</NavButton>
          <NavButton type="button" disabled aria-disabled>Upgrade workspace</NavButton>
        </SidebarSection>
      </Sidebar>

      {/* ===== Main content của Settings ===== */}
      <Main>
        <Content>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12}}>
            <div>
              <Title>Settings</Title>
              <Subtitle>Các tuỳ chọn gọn nhẹ, tập trung vào hiệu năng và chuẩn UX web.</Subtitle>
            </div>
            <GhostButton type="button" onClick={() => navigate('/u/me/profile')}>
              ← Profile & visibility
            </GhostButton>
          </div>

          {/* Notifications */}
          <Group>
            <GroupHead>
              <GroupTitle>Notifications</GroupTitle>
              <GroupDesc>Điều khiển email và thông báo desktop.</GroupDesc>
            </GroupHead>
            <GroupBody>
              <Grid>
                <Field>
                  <Label htmlFor="emailFrequency">Email frequency</Label>
                  <Select id="emailFrequency" value={prefs.emailFrequency} onChange={(e) => handleChange('emailFrequency', e.target.value)}>
                    <option value="instant">Instant</option>
                    <option value="hourly">Hourly</option>
                    <option value="never">Never</option>
                  </Select>
                  <Helper>Áp dụng cho các mục bạn đang theo dõi (cards/boards).</Helper>
                </Field>
                <Field>
                  <CheckRow>
                    <input type="checkbox" checked={prefs.notifyDesktop} onChange={(e) => handleChange('notifyDesktop', e.target.checked)} />
                    <div>
                      <strong>Allow desktop notifications</strong>
                      <Helper>Bật thông báo đẩy trên thiết bị này.</Helper>
                    </div>
                  </CheckRow>
                </Field>
              </Grid>
              {!prefs.notifyDesktop && (
                <Row style={{ marginTop: 10 }}>
                  <GhostButton type="button" onClick={requestDesktopPermission}>Request permission</GhostButton>
                  <InlineMsg>Trình duyệt sẽ hỏi quyền hiển thị thông báo.</InlineMsg>
                </Row>
              )}
            </GroupBody>
          </Group>

          {/* Accessibility & Performance */}
          <Group>
            <GroupHead>
              <GroupTitle>Accessibility & Performance</GroupTitle>
              <GroupDesc>Tuỳ chỉnh giúp giao diện nhẹ hơn và dễ tiếp cận.</GroupDesc>
            </GroupHead>
            <GroupBody>
              <Grid>
                <Field>
                  <CheckRow>
                    <input type="checkbox" checked={prefs.reducedMotion} onChange={(e) => handleChange('reducedMotion', e.target.checked)} />
                    <div>
                      <strong>Reduce motion</strong>
                      <Helper>Giảm animation/transition để mượt hơn trên máy yếu.</Helper>
                    </div>
                  </CheckRow>
                </Field>
                <Field>
                  <CheckRow>
                    <input type="checkbox" checked={prefs.colorBlindMode} onChange={(e) => handleChange('colorBlindMode', e.target.checked)} />
                    <div>
                      <strong>Color-blind friendly</strong>
                      <Helper>Tăng tương phản, họa tiết viền giúp phân biệt trạng thái.</Helper>
                    </div>
                  </CheckRow>
                </Field>
                <Field>
                  <CheckRow>
                    <input type="checkbox" checked={prefs.compactMode} onChange={(e) => handleChange('compactMode', e.target.checked)} />
                    <div>
                      <strong>Compact mode</strong>
                      <Helper>Giảm padding, hiển thị nhiều nội dung hơn/viewport.</Helper>
                    </div>
                  </CheckRow>
                </Field>
              </Grid>
            </GroupBody>
          </Group>

          {/* Security */}
          <Group>
            <GroupHead>
              <GroupTitle>Security</GroupTitle>
              <GroupDesc>Quản lý phiên đăng nhập.</GroupDesc>
            </GroupHead>
            <GroupBody>
              <Row>
                <Button type="button" onClick={signOutOthers}>Sign out from other devices</Button>
                <InlineMsg>Khuyến nghị nếu bạn vừa đổi mật khẩu hoặc mất thiết bị.</InlineMsg>
              </Row>
            </GroupBody>
          </Group>

          <Row>
            <Button type="button" onClick={handleSave} disabled={saving}>{saving ? 'Đang lưu…' : 'Lưu cài đặt'}</Button>
            {saved && <InlineMsg $type="success">Đã lưu.</InlineMsg>}
          </Row>
        </Content>
      </Main>
    </Container>
  );
}
