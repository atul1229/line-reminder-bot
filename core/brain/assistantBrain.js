/**
 * =========================================================
 * Assistant Brain
 * =========================================================
 *
 * Brain 是 Life Assistant 的核心協調層。
 *
 * 負責：
 * - 接收使用者輸入
 * - 呼叫 Conversation / Intent / Entity / Planner
 * - 決定下一步動作
 *
 * 不負責：
 * - 不直接操作資料庫
 * - 不直接呼叫 LINE API
 * - 不直接建立提醒
 * - 不直接產生最終回覆文字
 * =========================================================
 */

const { parseIntent } = require("../conversation/intentParser");
const { extractEntities } = require("../conversation/entityExtractor");
const { makeDecision } = require("../planner/decisionEngine");
/**
 * 處理使用者訊息
 *
 * @param {Object} input
 * @param {string} input.userId - 使用者 ID
 * @param {string} input.text - 使用者輸入文字
 *
 * @returns {Object}
 */
async function processMessage(input) {
  const { userId, text } = input;

  console.log("Assistant Brain received:", {
    userId,
    text,
  });

  /**
   * Step 1：交給 Conversation 模組判斷 Intent
   */
  const intentResult = parseIntent(text);
  const entities = extractEntities(text);
  const decision = makeDecision({
    intentResult,
    entities,
  });

  console.log("Decision Result:", decision);
  console.log("Entity Result:", entities);
  console.log("Intent Result:", intentResult);

  /**
   * Step 2：將 Intent 轉換成 Brain 的標準輸出
   */
  return {
    action: decision.action,
    canExecute: decision.canExecute,
    needConfirmation: decision.needConfirmation,
    confidence: intentResult.confidence,
    reason: decision.reason || null,
    question: decision.question || null,
    service: decision.service || null,
    entities,
    rawText: text,
  };
}

module.exports = {
  processMessage,
};
