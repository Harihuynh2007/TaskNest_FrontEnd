
// Component phụ để render thông tin user, giúp code chính sạch hơn
const UserInfo = ({ user }) => {
  // Lấy tên hiển thị từ 'display_name', nếu không có thì trích xuất từ username/email
  const displayName = user?.display_name || user?.username?.split('@')[0] || 'User';

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <strong>{displayName}</strong>
      <small style={{ fontSize: '11px', color: '#5e6c84' }}>{user?.email}</small>
    </div>
  );
};

// src/components/userMenuConfig.js
export function getUserMenuConfig({ user, logout, openModal, onToggleTheme }) {
  const p = user?.profile || {};
  const accountName = p.display_name || p.display_name_computed || user?.email || 'User';
  const accountEmail = user?.email || '';

  return [
    // ===== Account section =====
    { section: 'Account', key: 'sec-account' },
    {
      type: 'accountHeader',
      key: 'accountHeader',
      name: accountName,
      email: accountEmail,
      avatar:
        p.avatar_url ||
        p.avatar_thumbnail_url ||
        `https://placehold.co/40x40/28a745/FFFFFF?text=${encodeURIComponent(
          (p.initials || accountEmail?.[0] || 'U').toUpperCase()
        )}`,
    },
    {
      key: 'switch-accounts',
      label: 'Switch accounts',
      href: '/auth/switch-accounts', // TODO: route thật của bạn
    },
    {
      key: 'manage-account',
      label: 'Manage account',
      href: '/account', // TODO: route thật của bạn / trang hồ sơ
      target: '_blank',
    },
    { divider: true, key: 'd1' },

    { section: 'Tasknest', key: 'sec-tasknest' },
    { key: 'profile', label: 'Profile and visibility', href: '/u/me/profile' },
    { key: 'activity', label: 'Activity', href: '/u/me/activity' },
    { key: 'cards', label: 'Cards', href: '/u/me/cards' },
    { key: 'settings', label: 'Settings', href: '/u/me/account' },
    {
      key: 'theme',
      label: 'Theme',
      onClick: () => onToggleTheme?.(), // toggle dark/light
    },

    // ===== Workspace creation =====
    { divider: true, key: 'd2' },
    {
      key: 'create-workspace',
      label: 'Create Workspace',
      onClick: () => openModal?.('CreateWorkspaceModal'),
      icon: 'org',
    },

    // ===== Help =====
    { divider: true, key: 'd3' },
    { key: 'help', label: 'Help', href: '/help', target: '_blank' },
    { key: 'shortcuts', label: 'Shortcuts', onClick: () => openModal?.('ShortcutsModal') },

    // ===== Logout =====
    { divider: true, key: 'd4' },
    { key: 'logout', label: 'Log out', onClick: logout },
  ];
}
