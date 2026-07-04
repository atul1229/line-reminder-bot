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
/**
 * 將時間文字轉換成提醒時間 ISO 字串
 *
 * @param {string} datetimeText - 時間文字，例如：明天、今天、7/5 20:00
 * @returns {string|null}
 */
function parseDateTimeText(datetimeText) {
  if (!datetimeText) return null;

  const text = datetimeText.trim();
  const now = new Date();

  /**
   * ======================
   * 標準格式
   * 7/5 20:00
   * ======================
   */
  const standardMatch = text.match(/(\d{1,2})\/(\d{1,2})\s*(\d{1,2}):(\d{2})/);

  if (standardMatch) {
    const year = now.getFullYear();

    return `${year}-${standardMatch[1].padStart(2, "0")}-${standardMatch[2].padStart(2, "0")}T${standardMatch[3].padStart(2, "0")}:${standardMatch[4]}:00+08:00`;
  }

  /**
   * ======================
   * 明天
   * 目前先預設為 09:00
   * ======================
   */
  if (text.includes("明天")) {
    const date = new Date(now);
    date.setDate(date.getDate() + 1);
    date.setHours(9, 0, 0, 0);

    return date.toISOString();
  }

  /**
   * ======================
   * 今天
   * 目前先預設為 1 小時後
   * ======================
   */
  if (text.includes("今天")) {
    return new Date(now.getTime() + 60 * 60 * 1000).toISOString();
  }

  /**
   * ======================
   * 後天
   * 目前先預設為 09:00
   * ======================
   */
  if (text.includes("後天")) {
    const date = new Date(now);
    date.setDate(date.getDate() + 2);
    date.setHours(9, 0, 0, 0);

    return date.toISOString();
  }

  return null;
}

module.exports = {
  parseReminderText,
  parseDateTimeText,
};
