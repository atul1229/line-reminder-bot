/**
 * Intent Parser
 *
 * 負責：
 * - 將使用者自然語言轉換為 Intent
 *
 * 未來可升級：
 * - NLP
 * - AI classification
 */

function parseIntent(text) {
  const t = text.trim();

  // =========================
  // Create Reminder
  // =========================
  if (t.startsWith("提醒我")) {
    return {
      intent: "CREATE_REMINDER",
      confidence: 1.0,
    };
  }

  // =========================
  // Today Dashboard
  // =========================
  if (
    t.includes("今天工作") ||
    t.includes("今天要做什麼") ||
    t.includes("今天提醒")
  ) {
    return {
      intent: "TODAY_DASHBOARD",
      confidence: 1.0,
    };
  }

  // =========================
  // Unknown Intent
  // =========================
  return {
    intent: "UNKNOWN",
    confidence: 0.5,
  };
}

module.exports = {
  parseIntent,
};
