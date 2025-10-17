import React, { useEffect, useMemo, useRef, useState } from "react";
import styled, { css } from "styled-components";
import axiosClient from "../../../../api/apiClient";
import { useNavigate,useLocation } from "react-router-dom";
import AvatarChangeModal from "./AvatarChangeModal";
/** ===================== Design Tokens ===================== */
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
  },
};

/** Utility */
const focusRing = css`
  outline: none;
  box-shadow: 0 0 0 3px ${tokens.color.accentRing}33, 0 0 0 1px ${tokens.color.accentRing};
`;

/** ===================== Styled Components ===================== */
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

const PageHeader = styled.header` margin-bottom: 24px; `;
const Title = styled.h1` font-size: 28px; line-height: 1.2; margin: 0 0 8px; `;
const Subtitle = styled.p` margin: 0; color: ${tokens.color.textMuted}; `;

const Card = styled.section`
  background: linear-gradient(180deg, ${tokens.color.surface} 0%, ${tokens.color.surfaceAlt} 100%);
  border: 1px solid ${tokens.color.line};
  border-radius: ${tokens.radius.lg};
  box-shadow: ${tokens.shadow.md};
  overflow: visible; 
  position: relative; 
  z-index: 1;
  backdrop-filter: saturate(130%) blur(6px);
  margin-bottom: 20px;
`;

const CardHeader = styled.div`
  padding: 18px 20px;
  border-bottom: 1px solid ${tokens.color.line};
`;

const CardTitle = styled.h2` font-size: 16px; margin: 0 0 6px; font-weight: 700; `;
const CardDesc = styled.p` margin: 0; color: ${tokens.color.textMuted}; font-size: 14px; `;
const CardBody = styled.div` padding: 20px; `;

const Banner = styled.div`
  position: relative;
  z-index: 1;
  overflow: visible; 
  height: 140px;
  background: linear-gradient(135deg, ${tokens.color.accent} 0%, ${tokens.color.accentHover} 100%);
  display: grid;
  place-items: center;
  img { width: 100%; height: 100%; object-fit: cover; }
`;


const BannerOverlay = styled.div`
  position: absolute; 
  inset: 0; 
  background: linear-gradient(180deg, #0000, #0006);
`;

const BannerAction = styled.label`
  position: absolute; top: 10px; right: 10px;
  padding: 6px 12px; font-size: 12px; cursor: pointer;
  border-radius: ${tokens.radius.sm};
  color: white; background: #0008; border: 1px solid ${tokens.color.line};
  backdrop-filter: blur(2px);
  input { display: none; }
  &:hover { background: #000b; }
  &:focus-visible { ${focusRing} }
`;

const BannerPlaceholder = styled.div` 
  color: #ffffffcc; 
  font-size: 14px; 
  z-index: 1; 
`;

const AvatarRow = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: -32px; /* nhẹ nhàng nổi lên từ banner */
  position: relative;
  z-index: 3; 
`;

const Avatar = styled.div`
  width: 80px; height: 80px; border-radius: ${tokens.radius.full};
  border: 3px solid ${tokens.color.bg};
  background: ${tokens.color.line};
  overflow: hidden; display: grid; place-items: center;
  img { width: 100%; height: 100%; object-fit: cover; }
`;

const AvatarInitial = styled.span` color: ${tokens.color.textMuted}; font-weight: 700; font-size: 28px; `;

const UploadBtn = styled.label`
  padding: 8px 14px; font-size: 14px; cursor: pointer; border: 1px solid ${tokens.color.line};
  border-radius: ${tokens.radius.sm}; background: ${tokens.color.surfaceAlt};
  transition: .15s ease;
  input{ display:none; }
  &:hover{ background: ${tokens.color.surface}; }
  &:focus-visible{ ${focusRing} }
`;

const Grid = styled.div`
  display: grid; gap: 16px; grid-template-columns: 1fr 1fr;
  @media (max-width: 720px){ grid-template-columns: 1fr; }
`;

const Field = styled.div` display: flex; flex-direction: column; gap: 6px; `;
const Label = styled.label` font-size: 12px; text-transform: uppercase; letter-spacing: .06em; color: ${tokens.color.textMuted}; `;

const Input = styled.input`
  padding: 10px 12px; font-size: 14px; color: ${tokens.color.text};
  background: ${tokens.color.surfaceAlt}; border: 1px solid ${tokens.color.line};
  border-radius: ${tokens.radius.sm};
  &:focus{ ${focusRing} }
  &::placeholder{ color: ${tokens.color.textMuted}; }
`;

const Textarea = styled.textarea`
  padding: 10px 12px; min-height: 96px; resize: vertical; font-size: 14px; color: ${tokens.color.text};
  background: ${tokens.color.surfaceAlt}; border: 1px solid ${tokens.color.line};
  border-radius: ${tokens.radius.sm}; font-family: inherit; &:focus{ ${focusRing} }
  &::placeholder{ color: ${tokens.color.textMuted}; }
`;

const CheckList = styled.div` display: grid; gap: 12px; `;
const CheckItem = styled.label`
  display: grid; grid-template-columns: 18px 1fr; align-items: start; gap: 10px; cursor: pointer;
  input{ accent-color: ${tokens.color.accent}; width: 18px; height: 18px; margin-top: 2px; }
`;

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

const GhostButton = styled(Button)`
  --bg: ${tokens.color.surface}; --bgH: ${tokens.color.surfaceAlt};
  color: ${tokens.color.text}; border: 1px solid ${tokens.color.line};
`;

const Helper = styled.p` margin: 6px 0 0; font-size: 12px; color: ${tokens.color.textMuted}; `;

const InlineMsg = styled.div`
  font-size: 13px; margin-left: 8px;
  color: ${(p) => (p.$type === "success" ? tokens.color.success : p.$type === "error" ? tokens.color.danger : tokens.color.textMuted)};
`;

const SRLive = styled.div.attrs({ role: "status", "aria-live": "polite" })`
  position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0);
`;

/** ===================== Component ===================== */
export default function ProfileAndVisibility() {
  const navigate = useNavigate();
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  const [form, setForm] = useState({
    display_name: "",
    bio: "",
    is_discoverable: true,
    show_boards_on_profile: false,
    avatar_url: "",
    banner_url: "",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const liveRef = useRef(null);

  const location = useLocation();
  const isSettings = location.pathname.startsWith('/settings');
  const isProfile  = location.pathname.startsWith('/u/me/profile');
  // Derived initial for avatar fallback
  const avatarInitial = useMemo(() => (form.display_name?.trim()?.[0] || "U").toUpperCase(), [form.display_name]);

  useEffect(() => {
    let mounted = true;
    axiosClient
      .get("/auth/me/profile/")
      .then(({ data }) => {
        if (!mounted) return;
        setForm((prev) => ({
          ...prev,
          display_name: data.display_name || "",
          bio: data.bio || "",
          is_discoverable: Boolean(data.is_discoverable),
          show_boards_on_profile: Boolean(data.show_boards_on_profile),
          avatar_url: data.avatar_url || "",
          banner_url: data.banner_url || "",
        }));
      })
      .catch((err) => {
        console.error("Error loading profile:", err);
        setError("Không tải được hồ sơ. Vui lòng thử lại.");
      });
    return () => { mounted = false; };
  }, []);

  const handleInputChange = (field, value) => {
    setSaved(false);
    setError("");
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const fileOk = (file) => file && file.size <= 5 * 1024 * 1024; // 5MB guard

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!fileOk(file)) { setError("Ảnh đại diện vượt quá 5MB."); return; }
    setAvatarFile(file);
    const preview = URL.createObjectURL(file);
    setForm((p) => ({ ...p, avatar_url: preview }));
  };

  const handleBannerChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!fileOk(file)) { setError("Ảnh banner vượt quá 5MB."); return; }
    setBannerFile(file);
    const preview = URL.createObjectURL(file);
    setForm((p) => ({ ...p, banner_url: preview }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      const fd = new FormData();
      fd.append("display_name", String(form.display_name || ""));
      fd.append("bio", String(form.bio || ""));
      fd.append("is_discoverable", form.is_discoverable ? "true" : "false");
      fd.append("show_boards_on_profile", form.show_boards_on_profile ? "true" : "false");
      if (avatarFile) fd.append("avatar", avatarFile);
      if (bannerFile) fd.append("banner", bannerFile);

      const res = await axiosClient.patch("/auth/me/profile/", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setForm((prev) => ({
        ...prev,
        ...res.data,
        avatar_url: res.data.avatar_url || prev.avatar_url,
        banner_url: res.data.banner_url || prev.banner_url,
      }));
      setAvatarFile(null);
      setBannerFile(null);

      // Refresh header user (keeps your existing approach)
      try {
        await axiosClient.get("/auth/me");
        window.dispatchEvent(new Event("auth:user-updated"));
      } catch (e) {
        console.warn("Could not refresh /auth/me after profile save", e);
      }

      setSaved(true);
      liveRef.current && (liveRef.current.textContent = "Lưu hồ sơ thành công");
    } catch (err) {
      console.error("Error saving profile:", err);
      setError(err?.response?.data?.error || "Không thể lưu thay đổi. Vui lòng thử lại.");
      liveRef.current && (liveRef.current.textContent = "Lỗi khi lưu hồ sơ");
    } finally {
      setSaving(false);
      setTimeout(() => liveRef.current && (liveRef.current.textContent = ""), 2000);
    }
  };

  return (
    <Container>
      <SRLive ref={liveRef} />
      <Sidebar aria-label="Profile navigation">
        <SidebarSection>
          <SectionTitle>Personal Settings</SectionTitle>
          <NavButton
            type="button"
            $active={isProfile}
            aria-current={isProfile ? 'page' : undefined}
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

      <Main>
        <Content>
          <PageHeader>
            <Title>Profile & visibility</Title>
            <Subtitle>Quản lý thông tin cá nhân và quyền hiển thị của bạn.</Subtitle>
          </PageHeader>

          {/* Avatar + Banner */}
          <Card>
            <Banner>
              {form.banner_url ? (
                <img src={form.banner_url} alt="Profile banner" />
              ) : (
                <BannerPlaceholder>Thêm banner cho hồ sơ của bạn</BannerPlaceholder>
              )}
              <BannerOverlay />
              <BannerAction>
                <input type="file" accept="image/*" onChange={handleBannerChange} />
                Đổi banner
              </BannerAction>
            </Banner>

            <CardBody>
              <AvatarRow>
                <Avatar aria-label="Avatar">
                  {form.avatar_url ? (
                    <img src={form.avatar_url} alt="Profile avatar" />
                  ) : (
                    <AvatarInitial>{avatarInitial}</AvatarInitial>
                  )}
                </Avatar>
                <Row>
                  <UploadBtn onClick={() => setShowAvatarModal(true)}>Đổi avatar</UploadBtn>
                  {showAvatarModal && (
                    <AvatarChangeModal
                      onClose={() => setShowAvatarModal(false)}
                      onUpdated={() => setSaved(true)}
                    />
                  )}
                  {saved && <InlineMsg $type="success">Đã lưu</InlineMsg>}
                  {error && <InlineMsg $type="error">{error}</InlineMsg>}
                </Row>
              </AvatarRow>

            </CardBody>
          </Card>

          {/* About */}
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
              <CardDesc>Thông tin này sẽ xuất hiện trên hồ sơ công khai của bạn.</CardDesc>
            </CardHeader>
            <CardBody>
              <Field>
                <Label htmlFor="display_name">Display name *</Label>
                <Input
                  id="display_name"
                  type="text"
                  placeholder="Tên hiển thị"
                  value={form.display_name}
                  onChange={(e) => handleInputChange("display_name", e.target.value)}
                />
              </Field>
              <Field style={{ marginTop: 12 }}>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Giới thiệu ngắn gọn về bạn..."
                  value={form.bio}
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                />
                <Helper>Gợi ý: 1-2 câu về vai trò, kỹ năng và sở thích.</Helper>
              </Field>
            </CardBody>
          </Card>

          {/* Privacy */}
          <Card>
            <CardHeader>
              <CardTitle>Privacy</CardTitle>
              <CardDesc>Kiểm soát ai có thể xem và tìm thấy hồ sơ của bạn.</CardDesc>
            </CardHeader>
            <CardBody>
              <CheckList>
                <CheckItem>
                  <input
                    id="discoverable"
                    type="checkbox"
                    checked={form.is_discoverable}
                    onChange={(e) => handleInputChange("is_discoverable", e.target.checked)}
                  />
                  <div>
                    <label htmlFor="discoverable"><strong>Public profile</strong></label>
                    <Helper>Cho phép người khác tìm kiếm và xem hồ sơ của bạn.</Helper>
                  </div>
                </CheckItem>
                <CheckItem>
                  <input
                    id="show_boards"
                    type="checkbox"
                    checked={form.show_boards_on_profile}
                    onChange={(e) => handleInputChange("show_boards_on_profile", e.target.checked)}
                  />
                  <div>
                    <label htmlFor="show_boards"><strong>Hiển thị boards trên hồ sơ</strong></label>
                    <Helper>Hiển thị danh sách board công khai trên trang hồ sơ.</Helper>
                  </div>
                </CheckItem>
              </CheckList>
              <Row style={{ marginTop: 18 }}>
                <Button onClick={handleSave} disabled={saving} aria-busy={saving} aria-label="Save profile">
                  {saving ? "Đang lưu..." : "Lưu thay đổi"}
                </Button>
                <GhostButton type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                  Lên đầu trang
                </GhostButton>
                {!saving && saved && <InlineMsg $type="success">Lưu thành công.</InlineMsg>}
                {!saving && error && <InlineMsg $type="error">{error}</InlineMsg>}
              </Row>
            </CardBody>
          </Card>
        </Content>
      </Main>
    </Container>
  );
}
