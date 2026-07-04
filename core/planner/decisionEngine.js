/**
 * =========================================================
 * Decision Engine
 * =========================================================
 *
 * 負責：
 * - 根據 Intent 與 Entities 決定下一步動作
 * - 判斷是否可以執行
 * - 判斷是否需要追問
 *
 * 不負責：
 * - 不解析自然語言
 * - 不操作資料庫
 * - 不呼叫 LINE API
 * - 不建立提醒
 * - 不產生最終回覆文字
 * =========================================================
 */

const { INTENTS } = require("../conversation/intentParser");

/**
 * 建立決策結果
 *
 * @param {Object} input
 * @param {Object} input.intentResult
 * @param {Object} input.entities
 * @returns {Object}
 */
function makeDecision(input) {
  const { intentResult, entities } = input;

  switch (intentResult.intent) {
    case INTENTS.CREATE_REMINDER:
      return decideCreateReminder(entities);

    case INTENTS.TODAY_DASHBOARD:
      return {
        action: "TODAY_DASHBOARD",
        canExecute: true,
        needConfirmation: false,
        service: "DashboardService",
        entities,
      };

    case INTENTS.UNKNOWN:
    default:
      return {
        action: "ASK_CONFIRMATION",
        canExecute: false,
        needConfirmation: true,
        reason: "Unknown intent",
        question:
          "我還不太確定你的意思。你是想建立提醒、查看今天工作，還是記錄待辦？",
        entities,
      };
  }
}

/**
 * 建立提醒的決策
 *
 * @param {Object} entities
 * @returns {Object}
 */
function decideCreateReminder(entities) {
  if (!entities.title) {
    return {
      action: "ASK_CONFIRMATION",
      canExecute: false,
      needConfirmation: true,
      reason: "Missing title",
      question: "你想提醒我什麼事情？",
      entities,
    };
  }

  if (!entities.datetimeText) {
    return {
      action: "ASK_CONFIRMATION",
      canExecute: false,
      needConfirmation: true,
      reason: "Missing datetime",
      question: `請問「${entities.title}」要在什麼時候提醒你？`,
      entities,
    };
  }

  return {
    action: "CREATE_REMINDER",
    canExecute: true,
    needConfirmation: false,
    service: "ReminderService",
    entities,
  };
}

module.exports = {
  makeDecision,
};
