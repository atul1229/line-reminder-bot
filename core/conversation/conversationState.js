/**
 * =========================================================
 * Conversation State
 * =========================================================
 *
 * 負責：
 * - 暫時記住使用者上一輪未完成的對話
 * - 支援簡單多輪對話
 *
 * 不負責：
 * - 不操作 Supabase
 * - 不呼叫 LINE API
 * - 不建立提醒
 *
 * 注意：
 * - 目前先使用記憶體 Map
 * - Render 重啟後資料會消失
 * - 未來正式版可改存 Supabase / Redis
 * =========================================================
 */

const stateStore = new Map();

/**
 * 儲存使用者狀態
 *
 * @param {string} userId
 * @param {Object} state
 */
function setConversationState(userId, state) {
  stateStore.set(userId, {
    ...state,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * 取得使用者狀態
 *
 * @param {string} userId
 * @returns {Object|null}
 */
function getConversationState(userId) {
  return stateStore.get(userId) || null;
}

/**
 * 清除使用者狀態
 *
 * @param {string} userId
 */
function clearConversationState(userId) {
  stateStore.delete(userId);
}

module.exports = {
  setConversationState,
  getConversationState,
  clearConversationState,
};
