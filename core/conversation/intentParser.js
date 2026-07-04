/**
 * =========================================================
 * Intent Parser
 * =========================================================
 *
 * 負責：
 * - 判斷使用者輸入的主要意圖
 * - 將自然語言轉換成系統可理解的 Intent
 *
 * 不負責：
 * - 不擷取日期時間
 * - 不操作資料庫
 * - 不呼叫 LINE API
 * - 不建立提醒
 *
 * 目前採用 rule-based parser。
 * 未來可替換或擴充為 AI / LLM parser。
 * =========================================================
 */

/**
 * 系統支援的 Intent
 */
const INTENTS = {
  CREATE_REMINDER: "CREATE_REMINDER",
  TODAY_DASHBOARD: "TODAY_DASHBOARD",
  UNKNOWN: "UNKNOWN",
};

/**
 * 解析使用者輸入的 Intent
 *
 * @param {string} text - 使用者輸入文字
 * @returns {Object}
 */
function parseIntent(text) {
  const normalizedText = normalizeText(text);

  if (isCreateReminder(normalizedText)) {
    return {
      intent: INTENTS.CREATE_REMINDER,
      confidence: 0.9,
      rawText: text,
    };
  }

  if (isTodayDashboard(normalizedText)) {
    return {
      intent: INTENTS.TODAY_DASHBOARD,
      confidence: 0.9,
      rawText: text,
    };
  }

  return {
    intent: INTENTS.UNKNOWN,
    confidence: 0,
    rawText: text,
  };
}

/**
 * 正規化文字
 *
 * @param {string} text
 * @returns {string}
 */
function normalizeText(text) {
  return text.trim().replace(/\s+/g, "");
}

/**
 * 判斷是否為建立提醒
 *
 * @param {string} text
 * @returns {boolean}
 */
function isCreateReminder(text) {
  const keywords = ["提醒我", "幫我提醒", "記得提醒", "不要忘記", "提醒"];

  return keywords.some((keyword) => text.includes(keyword));
}

/**
 * 判斷是否為今日 Dashboard
 *
 * @param {string} text
 * @returns {boolean}
 */
function isTodayDashboard(text) {
  const keywords = [
    "今天工作",
    "今天要做什麼",
    "今天提醒",
    "今日工作",
    "今日任務",
    "今天任務",
  ];

  return keywords.some((keyword) => text.includes(keyword));
}

module.exports = {
  INTENTS,
  parseIntent,
};
