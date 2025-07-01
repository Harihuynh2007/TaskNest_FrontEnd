
import API from './apiClient';

export const fetchWorkspaces = () => API.get('/workspaces/');

/**
 * Tạo workspace mới
 * @param {Object} data - Dữ liệu workspace
 * @param {string} data.name - Tên workspace
 * @returns Promise
 */
export const createWorkspace = (data) => API.post('/workspaces/', data);
