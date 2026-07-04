/**
 * =========================================================
 * AI Conversation Parser
 * =========================================================
 *
 * 負責：
 * - 使用 AI 協助理解較自然、模糊、複雜的使用者輸入
 * - 將自然語言轉換成標準化 Conversation Result
 *
 * 不負責：
 * - 不直接建立提醒
 * - 不操作 Supabase
 * - 不呼叫 LINE API
 * - 不決定是否執行
 *
 * 注意：
 * - 目前先不串接真正 AI API
 * - 先建立穩定介面
 * - 未來可接 OpenAI / Gemini / Claude / Local LLM
 * =========================================================
 */

/**
 * AI Parser 的標準輸出格式
 *
 * @typedef {Object} AIConversationResult
 * @property {string} intent - 使用者意圖
 * @property {Object} entities - 擷取出的關鍵資訊
 * @property {boolean} needConfirmation - 是否需要追問
 * @property {number} confidence - AI 對判斷的信心分數
 * @property {string} rawText - 原始輸入文字
 */

/**
 * 使用 AI 解析使用者輸入
 *
 * 目前為 mock 版本。
 * 未來會在這裡串接真正的 AI API。
 *
 * @param {string} text - 使用者輸入文字
 * @returns {Promise<AIConversationResult>}
 */
async function parseWithAI(text) {
  console.log("AI Conversation Parser received:", text);

  /**
   * 目前先回傳 UNKNOWN。
   * 目的：
   * - 先建立介面
   * - 確認 Brain 可以安全呼叫 AI Parser
   * - 避免還沒接 API 時影響正式功能
   */
  return {
    intent: "UNKNOWN",
    entities: {
      rawText: text,
      title: null,
      datetimeText: null,
    },
    needConfirmation: true,
    confidence: 0,
    rawText: text,
  };
}

module.exports = {
  parseWithAI,
};
