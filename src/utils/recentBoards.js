// src/utils/recentBoards.js
const KEY_PREFIX = 'recent_boards';
const MAX = 12;

/**
 * Get storage key for specific user
 * @param {number|string} userId 
 * @returns {string}
 */
function getStorageKey(userId) {
  if (!userId) return null;
  return `${KEY_PREFIX}_${userId}`;
}

/**
 * Get recent boards for current user
 * @param {number|string} userId 
 * @returns {Array}
 */
export function getRecentBoards(userId) {
  const key = getStorageKey(userId);
  if (!key) return [];

  try {
    const raw = localStorage.getItem(key);
    const arr = JSON.parse(raw || '[]');
    
    // Remove duplicates, keep latest
    const seen = new Set();
    const unique = [];
    
    for (const b of arr.sort((a, b) => b.viewed_at - a.viewed_at)) {
      if (seen.has(b.id)) continue;
      seen.add(b.id);
      unique.push(b);
    }
    
    return unique.slice(0, MAX);
  } catch (err) {
    console.error('Failed to get recent boards:', err);
    return [];
  }
}

/**
 * Add a board to recent list
 * @param {number|string} userId 
 * @param {object} board 
 */
export function addRecentBoard(userId, board) {
  const key = getStorageKey(userId);
  if (!key || !board?.id) return;

  const entry = {
    id: board.id,
    name: board.name || 'Untitled',
    workspaceId: board.workspace?.id ?? board.workspaceId ?? null,
    workspaceName: board.workspace?.name ?? board.workspaceName ?? null,
    background: board.background || null,
    viewed_at: Date.now()
  };

  try {
    const arr = getRecentBoards(userId);
    const filtered = arr.filter(b => b.id !== entry.id);
    const next = [entry, ...filtered].slice(0, MAX);
    localStorage.setItem(key, JSON.stringify(next));
  } catch (err) {
    console.error('Failed to add recent board:', err);
  }
}

/**
 * Remove a board from recent list (when deleted)
 * @param {number|string} userId 
 * @param {number|string} boardId 
 */
export function removeRecentBoard(userId, boardId) {
  const key = getStorageKey(userId);
  if (!key || !boardId) return;

  try {
    const arr = getRecentBoards(userId);
    const filtered = arr.filter(b => b.id !== boardId);
    localStorage.setItem(key, JSON.stringify(filtered));
  } catch (err) {
    console.error('Failed to remove recent board:', err);
  }
}

/**
 * Clear all recent boards for user (on logout)
 * @param {number|string} userId 
 */
export function clearRecentBoards(userId) {
  const key = getStorageKey(userId);
  if (!key) return;

  try {
    localStorage.removeItem(key);
  } catch (err) {
    console.error('Failed to clear recent boards:', err);
  }
}

/**
 * Get recent boards filtered by workspace
 * @param {number|string} userId 
 * @param {number|string} workspaceId 
 * @returns {Array}
 */
export function getRecentBoardsByWorkspace(userId, workspaceId) {
  if (!workspaceId) return getRecentBoards(userId);
  
  const allRecent = getRecentBoards(userId);
  return allRecent.filter(b => b.workspaceId === workspaceId);
}