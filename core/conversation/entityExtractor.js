/**
 * =========================================================
 * Entity Extractor
 * =========================================================
 *
 * 負責：
 * - 從使用者輸入中擷取關鍵資訊
 * - 例如：提醒內容、時間文字、原始文字
 *
 * 不負責：
 * - 不判斷 Intent
 * - 不轉換成真正 Date 物件
 * - 不操作資料庫
 * - 不呼叫 LINE API
 *
 * 目前採用 rule-based extractor。
 * 未來可替換或擴充為 AI / LLM extractor。
 * =========================================================
 */

/**
 * 擷取使用者輸入中的 Entities
 *
 * @param {string} text - 使用者輸入文字
 * @returns {Object}
 */
function extractEntities(text) {
  const normalizedText = text.trim();

  const datetimeText = extractDateTimeText(normalizedText);
  const title = extractTitle(normalizedText, datetimeText);

  return {
    rawText: text,
    title,
    datetimeText,
  };
}

/**
 * 擷取提醒內容
 *
 * @param {string} text
 * @param {string|null} datetimeText
 * @returns {string|null}
 */
function extractTitle(text, datetimeText) {
  let result = text;

  const removeWords = ["提醒我", "幫我提醒", "記得提醒", "不要忘記", "提醒"];

  removeWords.forEach((word) => {
    result = result.replace(word, "");
  });

  if (datetimeText) {
    result = result.replace(datetimeText, "");
  }

  result = cleanText(result);

  return result || null;
}

/**
 * 擷取時間文字
 *
 * 目前先抓常見時間關鍵字，不做精準日期解析。
 *
 * @param {string} text
 * @returns {string|null}
 */
function extractDateTimeText(text) {
  const patterns = [
    /\d{1,2}\/\d{1,2}\s*\d{1,2}:\d{2}/,
    /\d{1,2}:\d{2}/,
    /今天/,
    /明天/,
    /後天/,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);

    if (match) {
      return match[0];
    }
  }

  return null;
}

/**
 * 清理文字
 *
 * @param {string} text
 * @returns {string}
 */
function cleanText(text) {
  return text
    .replace(/\s+/g, " ")
    .replace(/[，,。]/g, "")
    .trim();
}

module.exports = {
  extractEntities,
};
