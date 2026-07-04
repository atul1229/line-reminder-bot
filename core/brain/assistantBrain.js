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

const { parseIntent, INTENTS } = require("../conversation/intentParser");
const { extractEntities } = require("../conversation/entityExtractor");
const { parseWithAI } = require("../conversation/aiConversationParser");
const { makeDecision } = require("../planner/decisionEngine");

/**
 * 處理使用者訊息
 *
 * @param {Object} input
 * @param {string} input.userId - 使用者 ID
 * @param {string} input.text - 使用者輸入文字
 *
 * @returns {Promise<Object>}
 */
async function processMessage(input) {
  const { userId, text } = input;

  console.log("Assistant Brain received:", {
    userId,
    text,
  });

  /**
   * Step 1：先使用 rule-based parser
   */
  const ruleIntentResult = parseIntent(text);
  const ruleEntities = extractEntities(text);

  console.log("Rule Intent Result:", ruleIntentResult);
  console.log("Rule Entity Result:", ruleEntities);

  /**
   * Step 2：先讓 Decision Engine 判斷 rule-based 結果是否足夠
   */
  const ruleDecision = makeDecision({
    intentResult: ruleIntentResult,
    entities: ruleEntities,
  });

  console.log("Rule Decision Result:", ruleDecision);

  /**
   * Step 3：如果 rule-based 已經可以執行，就直接採用
   */
  if (ruleDecision.canExecute === true) {
    return buildBrainResult({
      source: "RULE_BASED",
      intentResult: ruleIntentResult,
      decision: ruleDecision,
      entities: ruleEntities,
      rawText: text,
    });
  }

  /**
   * Step 4：如果 Intent 已經明確，但資訊不足，
   * 不要交給 AI Parser，直接採用 rule-based 的追問結果。
   *
   * 例如：
   * - 提醒我 開會
   *   → Intent 是 CREATE_REMINDER
   *   → 缺 datetime
   *   → 應該問「什麼時候提醒？」
   */
  if (ruleIntentResult.intent !== INTENTS.UNKNOWN) {
    return buildBrainResult({
      source: "RULE_BASED_INCOMPLETE",
      intentResult: ruleIntentResult,
      decision: ruleDecision,
      entities: ruleEntities,
      rawText: text,
    });
  }

  /**
   * Step 5：只有 rule-based 連 Intent 都判斷不出來，
   * 才交給 AI Parser。
   */
  const aiResult = await parseWithAI(text);

  console.log("AI Parser Result:", aiResult);

  const aiIntentResult = {
    intent: aiResult.intent || INTENTS.UNKNOWN,
    confidence: aiResult.confidence || 0,
    rawText: text,
  };

  const aiEntities = aiResult.entities || {
    rawText: text,
    title: null,
    datetimeText: null,
  };

  const aiDecision = makeDecision({
    intentResult: aiIntentResult,
    entities: aiEntities,
  });

  console.log("AI Decision Result:", aiDecision);

  /**
   * Step 5：回傳 AI Parser 後的決策結果
   */
  return buildBrainResult({
    source: "AI_PARSER",
    intentResult: aiIntentResult,
    decision: aiDecision,
    entities: aiEntities,
    rawText: text,
  });
}

/**
 * 建立 Brain 標準輸出
 *
 * @param {Object} input
 * @param {string} input.source
 * @param {Object} input.intentResult
 * @param {Object} input.decision
 * @param {Object} input.entities
 * @param {string} input.rawText
 * @returns {Object}
 */
function buildBrainResult(input) {
  const { source, intentResult, decision, entities, rawText } = input;

  return {
    source,
    action: decision.action,
    canExecute: decision.canExecute,
    needConfirmation: decision.needConfirmation,
    confidence: intentResult.confidence,
    reason: decision.reason || null,
    question: decision.question || null,
    service: decision.service || null,
    entities,
    rawText,
  };
}

module.exports = {
  processMessage,
};
