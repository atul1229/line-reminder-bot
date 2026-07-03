/**
 * reminderService.js
 *
 * 這個檔案負責處理「提醒事項」相關的資料庫操作。
 *
 * Service 的角色：
 * - 不處理 LINE 訊息
 * - 不負責回覆使用者
 * - 不處理 Webhook 路由
 * - 只專心處理「提醒資料」的新增、查詢、修改、刪除
 *
 * 目前功能：
 * - createReminder：新增一筆提醒到 Supabase 的 reminders 資料表
 */

const supabase = require("../config/supabase");

/**
 * 建立一筆提醒事項
 *
 * @param {string} userId - LINE 使用者 ID，用來知道這筆提醒是誰建立的
 * @param {string} remindAt - 提醒時間，格式建議為 ISO 時間字串，例如 2026-07-05T20:00:00+08:00
 * @param {string} title - 提醒內容，例如「到巴國小」
 *
 * @returns {Promise<boolean>} 建立成功時回傳 true
 *
 * @throws {Error} 如果 Supabase 新增失敗，會拋出錯誤，讓呼叫端處理
 */
async function createReminder(userId, remindAt, title) {
  const { error } = await supabase.from("reminders").insert({
    line_user_id: userId,
    title: title,
    remind_at: remindAt,
    status: "pending",
  });

  if (error) {
    throw error;
  }

  return true;
}

/**
 * 將提醒標記為已送出
 *
 * @param {string} reminderId - reminders 資料表的 id
 * @returns {Promise<boolean>}
 */
async function markReminderAsSent(reminderId) {
  const { error } = await supabase
    .from("reminders")
    .update({
      status: "sent",
    })
    .eq("id", reminderId);

  if (error) {
    throw error;
  }

  return true;
}

module.exports = {
  createReminder,
  markReminderAsSent,
};
