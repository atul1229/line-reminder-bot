/**
 * scheduler/index.js
 *
 * 所有背景排程的統一入口。
 *
 * 目前啟動：
 * - Reminder Scheduler
 *
 * 未來可加入：
 * - Daily Brief Scheduler
 * - Google Calendar Sync Scheduler
 * - Cleanup Scheduler
 */

const { startReminderScheduler } = require("./reminderScheduler");

function startSchedulers() {
  console.log("Starting all schedulers...");
  startReminderScheduler();
}

module.exports = {
  startSchedulers,
};
