/**
 * =========================================================
 * LINE Controller
 * =========================================================
 *
 * 負責：
 * - 接收 LINE event
 * - Intent 判斷
 * - 呼叫 Service / Utils
 * - 回覆使用者
 *
 * ❌ 不處理 DB
 * ❌ 不寫商業邏輯
 * =========================================================
 */

const reminderService = require("../services/reminderService");
const dashboardService = require("../services/dashboardService");
const { parseReminderText } = require("../utils/timeParser");
const { lineClient } = require("../config/line");
const assistantBrain = require("../core/brain/assistantBrain");

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
   * Controller 應該先回覆追問，而不是直接執行舊流程。
   */
  if (brainResult.needConfirmation === true) {
    return replyText(
      event.replyToken,
      brainResult.question || "我還不太確定你的意思，可以再說明一下嗎？",
    );
  }
  /**
   * ======================
   * Intent: Create Reminder
   * ======================
   */
  if (text.startsWith("提醒我")) {
    return createReminder(event.replyToken, userId, text);
  }

  /**
   * ======================
   * Intent: Today Dashboard
   * ======================
   */
  if (
    text.includes("今天工作") ||
    text.includes("今天要做什麼") ||
    text.includes("今天提醒")
  ) {
    return handleTodayDashboard(event.replyToken, userId);
  }

  /**
   * ======================
   * Fallback
   * ======================
   */
  return replyText(
    event.replyToken,
    "請輸入：提醒我 7/5 20:00 到巴國小 或 今天工作",
  );
}

/**
 * =========================================================
 * Intent: Create Reminder
 * =========================================================
 */
async function createReminder(replyToken, userId, text) {
  const result = parseReminderText(text);

  if (!result) {
    return replyText(replyToken, "格式錯誤，請重新輸入提醒");
  }

  try {
    await reminderService.createReminder(userId, result.remindAt, result.title);
  } catch (error) {
    console.error(error);
    return replyText(replyToken, "建立提醒失敗，請稍後再試");
  }

  return replyText(replyToken, `✅ 已建立提醒\n\n📝 ${result.title}`);
}

/**
 * =========================================================
 * Intent: Today Dashboard
 * =========================================================
 */
async function handleTodayDashboard(replyToken, userId) {
  const dashboard = await dashboardService.getTodayDashboard(userId);

  const message = buildDashboardMessage(dashboard);

  return replyText(replyToken, message);
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

/**
 * =========================================================
 * Dashboard Formatter
 * =========================================================
 */
function buildDashboardMessage(d) {
  let msg = "";

  msg += "📅 今天任務\n";
  d.todayTasks.forEach((t) => {
    msg += `- ${t.title}\n`;
  });

  msg += "\n⏰ 即將到期\n";
  d.dueSoon.forEach((t) => {
    msg += `- ${t.title}\n`;
  });

  msg += "\n⚠️ 衝突\n";
  if (d.conflicts.length === 0) {
    msg += "無\n";
  } else {
    d.conflicts.forEach((c) => {
      msg += `- ${c.a} vs ${c.b}\n`;
    });
  }

  msg += "\n📊 負載\n";
  msg += d.load + "\n";

  msg += "\n💡 建議\n";
  msg += d.aiHint;

  return msg;
}

module.exports = {
  handleEvent,
};
