/**
 * =========================================================
 * LINE Response Builder
 * =========================================================
 *
 * 負責：
 * - 產生 LINE 使用者看得到的文字內容
 * - 統一回覆格式
 * - 讓 Controller 不需要負責組文字
 *
 * 不負責：
 * - 不判斷 Intent
 * - 不操作 Supabase
 * - 不呼叫 LINE API
 * - 不建立提醒或 Dashboard
 * =========================================================
 */

/**
 * 建立追問訊息
 *
 * @param {Object} brainResult
 * @returns {string}
 */
function buildConfirmationMessage(brainResult) {
  return brainResult.question || "我還不太確定你的意思，可以再說明一下嗎？";
}

/**
 * 建立未知指令訊息
 *
 * @returns {string}
 */
function buildUnknownMessage() {
  return [
    "我還不太確定你的意思。",
    "",
    "你可以試試：",
    "- 提醒我 7/5 20:00 到巴國小",
    "- 今天工作",
  ].join("\n");
}

/**
 * 建立提醒成功訊息
 *
 * @param {Object} input
 * @param {string} input.title
 * @returns {string}
 */
function buildReminderCreatedMessage(input) {
  return ["✅ 已建立提醒", "", `📝 ${input.title}`].join("\n");
}

/**
 * 建立 Dashboard 訊息
 *
 * @param {Object} d
 * @returns {string}
 */
function buildDashboardMessage(d) {
  let msg = "";

  msg += "📅 今天任務\n";

  if (!d.todayTasks || d.todayTasks.length === 0) {
    msg += "無\n";
  } else {
    d.todayTasks.forEach((t) => {
      msg += `- ${t.title}\n`;
    });
  }

  msg += "\n⏰ 即將到期\n";

  if (!d.dueSoon || d.dueSoon.length === 0) {
    msg += "無\n";
  } else {
    d.dueSoon.forEach((t) => {
      msg += `- ${t.title}\n`;
    });
  }

  msg += "\n⚠️ 衝突\n";

  if (!d.conflicts || d.conflicts.length === 0) {
    msg += "無\n";
  } else {
    d.conflicts.forEach((c) => {
      msg += `- ${c.a} vs ${c.b}\n`;
    });
  }

  msg += "\n📊 負載\n";
  msg += d.load || "unknown";

  msg += "\n\n💡 建議\n";
  msg += d.aiHint || "目前沒有特別建議。";

  return msg;
}

/**
 * 建立錯誤訊息
 *
 * @returns {string}
 */
function buildErrorMessage() {
  return "系統處理時發生問題，請稍後再試。";
}

module.exports = {
  buildConfirmationMessage,
  buildUnknownMessage,
  buildReminderCreatedMessage,
  buildDashboardMessage,
  buildErrorMessage,
};
