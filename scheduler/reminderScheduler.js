/**
 * reminderScheduler.js
 *
 * 負責提醒系統的背景排程。
 *
 * 目前階段：
 * - 每分鐘執行一次檢查流程
 *
 * 未來會負責：
 * - 每分鐘檢查到期提醒
 * - 發送 LINE Push Message
 * - 更新提醒狀態
 */

const cron = require("node-cron");
const supabase = require("../config/supabase");
const { lineClient } = require("../config/line");
const reminderService = require("../services/reminderService");
/**
 * 啟動 Reminder Scheduler
 */
function startReminderScheduler() {
  console.log("Reminder Scheduler started.");

  cron.schedule("* * * * *", async () => {
    console.log("Checking pending reminders...");
    await checkPendingReminders();
  });
}

/**
 * 檢查是否有到期提醒
 *
 * 目前先只印出訊息。
 * 下一步才會連接 Supabase 查詢 pending reminders。
 */
/**
 * 檢查是否有到期提醒
 */
async function checkPendingReminders() {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("reminders")
    .select("*")
    .eq("status", "pending")
    .lte("remind_at", now)
    .order("remind_at", { ascending: true })
    .limit(20);

  if (error) {
    console.error("Failed to fetch pending reminders:", error);
    return;
  }

  console.log(`Found ${data.length} pending reminders.`);

  for (const reminder of data) {
    await processReminder(reminder);
  }
}

/**
 * 處理單一到期提醒
 *
 * 目前先只印出提醒內容。
 * 下一步才會加入 LINE Push Message。
 */
async function processReminder(reminder) {
  console.log(`Processing reminder: ${reminder.title}`);

  await lineClient.pushMessage({
    to: reminder.line_user_id,
    messages: [
      {
        type: "text",
        text: `⏰ 提醒你：${reminder.title}`,
      },
    ],
  });

  console.log(`Reminder pushed: ${reminder.title}`);
  await reminderService.markReminderAsSent(reminder.id);
}

module.exports = {
  startReminderScheduler,
};
