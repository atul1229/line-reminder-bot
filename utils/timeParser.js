/**
 * =========================================================
 * Time Parser Utility
 * =========================================================
 *
 * 負責：
 * - 將時間文字轉換成 ISO 時間
 * - 保留舊版 parseReminderText，避免舊功能壞掉
 *
 * 不負責：
 * - 不判斷 Intent
 * - 不操作資料庫
 * - 不呼叫 LINE API
 * =========================================================
 */

/**
 * 舊版提醒文字解析器
 *
 * 目前保留，避免其他地方仍然引用時出錯。
 *
 * @param {string} text
 * @returns {Object|null}
 */
function parseReminderText(text) {
  const t = text.replace("提醒我", "").trim();

  if (!t) return null;

  const match = t.match(/(\d{1,2})\/(\d{1,2})\s+(\d{1,2}):(\d{2})\s+(.+)/);

  if (match) {
    const year = new Date().getFullYear();

    return {
      remindAt: `${year}-${match[1].padStart(2, "0")}-${match[2].padStart(
        2,
        "0",
      )}T${match[3].padStart(2, "0")}:${match[4]}:00+08:00`,
      title: match[5],
    };
  }

  const now = new Date();

  if (t.includes("明天")) {
    const date = new Date(now);
    date.setDate(date.getDate() + 1);
    date.setHours(9, 0, 0, 0);

    return {
      remindAt: date.toISOString(),
      title: t.replace("明天", "").trim(),
    };
  }

  if (t.includes("今天")) {
    return {
      remindAt: new Date(now.getTime() + 60 * 60 * 1000).toISOString(),
      title: t.replace("今天", "").trim(),
    };
  }

  if (t.includes("後天")) {
    const date = new Date(now);
    date.setDate(date.getDate() + 2);
    date.setHours(9, 0, 0, 0);

    return {
      remindAt: date.toISOString(),
      title: t.replace("後天", "").trim(),
    };
  }

  return {
    remindAt: new Date(now.getTime() + 60 * 60 * 1000).toISOString(),
    title: t,
  };
}

/**
 * 將時間文字轉換成提醒時間 ISO 字串
 *
 * @param {string} datetimeText - 時間文字，例如：明天、今天、後天、7/5 20:00
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

    return `${year}-${standardMatch[1].padStart(2, "0")}-${standardMatch[2].padStart(
      2,
      "0",
    )}T${standardMatch[3].padStart(2, "0")}:${standardMatch[4]}:00+08:00`;
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
