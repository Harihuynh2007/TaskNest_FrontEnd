

export const getUserMenuConfig = ({ user, logout, openModal }) => [
  { section: 'ACCOUNT' },
  {
    label: (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <strong>{user?.name || 'User'}</strong>
        <small style={{ fontSize: '11px', color: '#5e6c84' }}>{user?.email}</small>
      </div>
    ),
    avatar: user?.avatarUrl || 'https://via.placeholder.com/32',
    disabled: true,
  },
  {
    label: 'Switch accounts',
    onClick: () => openModal('switchAccounts', { onSwitch: () => console.log('Account switched') }),
  },
  {
    label: 'Manage account',
    href: '/manage-account',
  },
  { divider: true },
  { section: 'TASKNEST' },
  {
    label: 'Profile and visibility',
    href: '/profile',
  },
  {
    label: 'Activity',
    href: '/activity',
  },
  {
    label: 'Cards',
    href: '/cards',
  },
  {
    label: 'Settings',
    href: '/settings',
  },
  {
    label: 'Theme',
    href: '#theme',
  },
  { divider: true },
  {
    label: 'Create Workspace',
    onClick: () => openModal('createWorkspace', { onCreate: () => console.log('Workspace created') }),
  },
  {
    label: 'Help',
    href: '/help',
  },
  {
    label: 'Shortcuts',
    href: '#shortcuts',
  },
  {
    label: 'Log out',
    onClick: logout,
  },
];
