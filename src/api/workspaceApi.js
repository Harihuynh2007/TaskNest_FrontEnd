
import api from './axiosClient';


export const fetchWorkspaces = () => api.get('/workspaces/');

/**
 * Tạo workspace mới
 * @param {Object} data - Dữ liệu workspace
 * @param {string} data.name - Tên workspace
 * @returns Promise
 */
export const createWorkspace = (data) => api.post('/workspaces/', data);
