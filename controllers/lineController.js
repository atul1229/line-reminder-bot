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
const { parseReminderText } = require("../utils/timeParser");
const { lineClient } = require("../config/line");
const assistantBrain = require("../core/brain/assistantBrain");
const lineResponseBuilder = require("../core/response/lineResponseBuilder");

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
    return createReminder(event.replyToken, userId, text);
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
 */
async function createReminder(replyToken, userId, text) {
  const result = parseReminderText(text);

  if (!result) {
    return replyText(replyToken, lineResponseBuilder.buildErrorMessage());
  }

  try {
    await reminderService.createReminder(userId, result.remindAt, result.title);
  } catch (error) {
    console.error(error);

    return replyText(replyToken, lineResponseBuilder.buildErrorMessage());
  }

  return replyText(
    replyToken,
    lineResponseBuilder.buildReminderCreatedMessage({
      title: result.title,
    }),
  );
}

/**
 * =========================================================
 * Action: Today Dashboard
 * =========================================================
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
 * LINE Reply Utility
 * =========================================================
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
