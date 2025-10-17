export const ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  EDITOR: 'editor',
  VIEWER: 'viewer',
};

export const LOADING_STATES = {
  INITIAL: 'initial',
  SEARCH: 'search',
  MEMBER_ACTION: 'memberAction',
  LINK_ACTION: 'linkAction',
};

export const ERROR_TYPES = {
  GENERAL: 'general',
  SEARCH: 'search',
  MEMBER_ACTION: 'memberAction',
  LINK_ACTION: 'linkAction',
};

export const initialState = {
  members: [],
  searchQuery: '',
  searchResults: [],
  inviteToken: null,
  selectedRole: ROLES.EDITOR,
  loading: {
    [LOADING_STATES.INITIAL]: true,
    [LOADING_STATES.SEARCH]: false,
    [LOADING_STATES.MEMBER_ACTION]: false,
    [LOADING_STATES.LINK_ACTION]: false,
  },
  errors: {
    [ERROR_TYPES.GENERAL]: null,
    [ERROR_TYPES.SEARCH]: null,
    [ERROR_TYPES.MEMBER_ACTION]: null,
    [ERROR_TYPES.LINK_ACTION]: null,
  },
  ui: {
    openDropdowns: new Set(),
  },
};

export function stateReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: { ...state.loading, [action.loadingType]: action.value } };
    case 'SET_ERROR':
      return { ...state, errors: { ...state.errors, [action.errorType]: action.error } };
    case 'CLEAR_ERROR':
      return { ...state, errors: { ...state.errors, [action.errorType]: null } };
    case 'SET_MEMBERS':
      return { ...state, members: action.members };
    case 'ADD_MEMBER':
      return { ...state, members: [...state.members, action.member] };
    case 'UPDATE_MEMBER':
      return {
        ...state,
        members: state.members.map((member) =>
          member.user.id === action.userId ? { ...member, role: action.newRole } : member
        ),
      };
    case 'REMOVE_MEMBER':
      return { ...state, members: state.members.filter((m) => m.user.id !== action.userId) };
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.query };
    case 'SET_SEARCH_RESULTS':
      return { ...state, searchResults: action.results };
    case 'CLEAR_SEARCH':
      return { ...state, searchQuery: '', searchResults: [] };
    case 'SET_INVITE_TOKEN':
      return { ...state, inviteToken: action.token };
    case 'SET_SELECTED_ROLE':
      return { ...state, selectedRole: action.role };
    case 'TOGGLE_DROPDOWN': {
      const dropdowns = new Set(state.ui.openDropdowns);
      dropdowns.has(action.dropdownId) ? dropdowns.delete(action.dropdownId) : dropdowns.clear() || dropdowns.add(action.dropdownId);
      return { ...state, ui: { ...state.ui, openDropdowns: dropdowns } };
    }
    case 'CLOSE_ALL_DROPDOWNS':
      return { ...state, ui: { ...state.ui, openDropdowns: new Set() } };
    default:
      return state;
  }
}
