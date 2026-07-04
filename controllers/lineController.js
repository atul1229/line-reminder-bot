/**
 * =========================================================
 * LINE Controller
 * =========================================================
 *
 * 負責：
 * - 接收 LINE event
 * - 呼叫 Assistant Brain
 * - 根據 Brain 決策呼叫對應 Service
 * - 將回覆交給 LINE API 發送
 *
 * ❌ 不處理 DB
 * ❌ 不寫商業邏輯
 * ❌ 不負責組回覆文字
 * =========================================================
 */

const reminderService = require("../services/reminderService");
const dashboardService = require("../services/dashboardService");
const { lineClient } = require("../config/line");
const assistantBrain = require("../core/brain/assistantBrain");
const lineResponseBuilder = require("../core/response/lineResponseBuilder");
const { parseDateTimeText } = require("../utils/timeParser");

const {
  setConversationState,
  getConversationState,
  clearConversationState,
} = require("../core/conversation/conversationState");

/**
 * =========================================================
 * 主入口：LINE Event Handler
 * =========================================================
 */
async function handleEvent(event) {
  if (event.type !== "message" || event.message.type !== "text") {
    return;
  }

  const text = event.message.text.trim();
  const userId = event.source.userId;

  /**
   * ======================
   * Conversation State
   * ======================
   *
   * 如果使用者上一輪有未完成的對話，
   * 優先處理多輪對話狀態。
   */
  const pendingState = getConversationState(userId);

  if (pendingState) {
    /**
     * ======================
     * Conversation State: Cancel
     * ======================
     *
     * 如果使用者在多輪對話中輸入取消，
     * 則清除暫存狀態，不再建立提醒。
     */
    /**
     * =========================================================
     * Helper: Cancel Text
     * =========================================================
     *
     * 判斷使用者是否想取消目前的多輪對話狀態。
     *
     * @param {string} text
     * @returns {boolean}
     */
    function isCancelText(text) {
      const normalizedText = String(text || "")
        .replace(/\s+/g, "")
        .replace(/\u3000/g, "")
        .trim();

      const cancelWords = [
        "取消",
        "不用了",
        "算了",
        "不要",
        "先不要",
        "不用",
        "先不用",
        "停止",
      ];

      return cancelWords.includes(normalizedText);
    }

    /**
     * ======================
     * Conversation State: Pending Reminder
     * ======================
     *
     * 如果使用者上一輪有未完成的提醒，
     * 且目前缺的是 datetimeText，
     * 則把這一輪輸入當作時間補充。
     */
    if (
      pendingState.pendingAction === "CREATE_REMINDER" &&
      pendingState.missingField === "datetimeText"
    ) {
      const completedEntities = {
        ...pendingState.entities,
        datetimeText: text,
      };

      clearConversationState(userId);

      return createReminder(event.replyToken, userId, completedEntities);
    }
  }

  /**
   * ======================
   * Assistant Brain
   * ======================
   *
   * 將使用者輸入交給 Brain 判斷：
   * - 使用者想做什麼
   * - 資訊是否足夠
   * - 是否需要追問
   */
  const brainResult = await assistantBrain.processMessage({
    userId,
    text,
  });

  console.log("Brain Result:", brainResult);

  /**
   * ======================
   * Brain: Need Confirmation
   * ======================
   *
   * 如果 Brain 判斷資訊不足或語意不明確，
   * Controller 應該先回覆追問，而不是直接執行功能。
   */
  if (brainResult.needConfirmation === true) {
    /**
     * ======================
     * Conversation State: Store Pending Reminder
     * ======================
     *
     * 如果 Brain 判斷是建立提醒但缺少時間，
     * 先暫存目前的提醒內容，
     * 等待使用者下一輪補時間。
     */
    if (
      brainResult.action === "ASK_CONFIRMATION" &&
      brainResult.reason === "Missing datetime" &&
      brainResult.entities &&
      brainResult.entities.title
    ) {
      setConversationState(userId, {
        pendingAction: "CREATE_REMINDER",
        missingField: "datetimeText",
        entities: brainResult.entities,
      });
    }

    return replyText(
      event.replyToken,
      lineResponseBuilder.buildConfirmationMessage(brainResult),
    );
  }

  /**
   * ======================
   * Brain: Create Reminder
   * ======================
   *
   * 如果 Brain 判斷可以建立提醒，
   * Controller 就交給 Reminder Service 處理。
   */
  if (
    brainResult.action === "CREATE_REMINDER" &&
    brainResult.canExecute === true
  ) {
    return createReminder(event.replyToken, userId, brainResult.entities);
  }

  /**
   * ======================
   * Brain: Today Dashboard
   * ======================
   *
   * 如果 Brain 判斷使用者想查看今日工作，
   * Controller 就交給 Dashboard Service 處理。
   */
  if (
    brainResult.action === "TODAY_DASHBOARD" &&
    brainResult.canExecute === true
  ) {
    return handleTodayDashboard(event.replyToken, userId);
  }

  /**
   * ======================
   * Fallback
   * ======================
   */
  return replyText(event.replyToken, lineResponseBuilder.buildUnknownMessage());
}

/**
 * =========================================================
 * Action: Create Reminder
 * =========================================================
 *
 * 使用 Brain 解析好的 entities 建立提醒。
 *
 * @param {string} replyToken
 * @param {string} userId
 * @param {Object} entities
 */
async function createReminder(replyToken, userId, entities) {
  const { title, datetimeText } = entities;

  /**
   * 保險機制：
   * 如果使用者在補時間階段輸入取消，
   * 即使前面沒有攔截到，也不應該建立提醒。
   */
  if (isCancelText(datetimeText)) {
    return replyText(replyToken, "已取消這次操作。");
  }

  const remindAt = parseDateTimeText(datetimeText);

  if (!remindAt) {
    return replyText(
      replyToken,
      `我無法判斷「${datetimeText}」是什麼時間，請重新輸入，例如：明天、後天、7/5 20:00。`,
    );
  }

  try {
    await reminderService.createReminder(userId, remindAt, title);
  } catch (error) {
    console.error(error);

    return replyText(replyToken, lineResponseBuilder.buildErrorMessage());
  }

  return replyText(
    replyToken,
    lineResponseBuilder.buildReminderCreatedMessage({
      title,
    }),
  );
}

/**
 * =========================================================
 * Action: Today Dashboard
 * =========================================================
 *
 * 查詢今日 Dashboard 並回覆使用者。
 *
 * @param {string} replyToken
 * @param {string} userId
 */
async function handleTodayDashboard(replyToken, userId) {
  try {
    const dashboard = await dashboardService.getTodayDashboard(userId);

    const message = lineResponseBuilder.buildDashboardMessage(dashboard);

    return replyText(replyToken, message);
  } catch (error) {
    console.error(error);

    return replyText(replyToken, lineResponseBuilder.buildErrorMessage());
  }
}

/**
 * =========================================================
 * Helper: Cancel Text
 * =========================================================
 *
 * 判斷使用者是否想取消目前的多輪對話狀態。
 *
 * @param {string} text
 * @returns {boolean}
 */
function isCancelText(text) {
  const cancelWords = ["取消", "不用了", "算了", "不要", "先不要"];

  return cancelWords.some((word) => text.includes(word));
}

/**
 * =========================================================
 * LINE Reply Utility
 * =========================================================
 *
 * 統一處理 LINE replyMessage。
 *
 * @param {string} replyToken
 * @param {string} text
 */
async function replyText(replyToken, text) {
  return lineClient.replyMessage({
    replyToken,
    messages: [
      {
        type: "text",
        text,
      },
    ],
  });
}

module.exports = {
  handleEvent,
};
