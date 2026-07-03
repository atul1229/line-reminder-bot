/**
 * =========================================================
 * Time Parser Utility
 * =========================================================
 *
 * 負責：
 * - 將使用者輸入的自然語言轉換成結構化時間
 * - 不處理 LINE / DB / business logic
 *
 * 輸出：
 * {
 *   remindAt: ISO string,
 *   title: string
 * }
 * =========================================================
 */

function parseReminderText(text) {
  const t = text.replace("提醒我", "").trim();

  if (!t) return null;

  /**
   * ======================
   * ① 標準格式解析
   * 7/5 20:00 到巴國小
   * ======================
   */
  const match = t.match(/(\d{1,2})\/(\d{1,2})\s+(\d{1,2}):(\d{2})\s+(.+)/);

  if (match) {
    const year = new Date().getFullYear();

    return {
      remindAt: `${year}-${match[1].padStart(2, "0")}-${match[2].padStart(2, "0")}T${match[3]}:${match[4]}:00+08:00`,
      title: match[5],
    };
  }

  /**
   * ======================
   * ② 自然語言 fallback
   * ======================
   */

  const now = new Date();

  // 明天
  if (t.includes("明天")) {
    const date = new Date(now);
    date.setDate(date.getDate() + 1);

    return {
      remindAt: date.toISOString(),
      title: t.replace("明天", "").trim(),
    };
  }

  // 今天（+1 小時）
  if (t.includes("今天")) {
    return {
      remindAt: new Date(now.getTime() + 60 * 60 * 1000).toISOString(),
      title: t.replace("今天", "").trim(),
    };
  }

  /**
   * ======================
   * ③ fallback（避免 crash）
   * ======================
   */
  return {
    remindAt: new Date(now.getTime() + 60 * 60 * 1000).toISOString(),
    title: t,
  };
}

module.exports = {
  parseReminderText,
};
