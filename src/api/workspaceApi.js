import api from './axiosClient';

export const fetchWorkspaces = () => {
  const token = localStorage.getItem('token');
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
  return api.get('/workspaces/');
};

export const createWorkspace = (data) => {
  const token = localStorage.getItem('token');
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
  return api.post('/workspaces/', data);
};
