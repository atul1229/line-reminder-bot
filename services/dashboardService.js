/**
 * Dashboard Service（AI Assistant Style）
 *
 * 負責：
 * - 理解一天的任務
 * - 排序重要性
 * - 偵測風險
 * - 產出「可閱讀的工作狀態」
 */

const supabase = require("../config/supabase");

/**
 * 主入口：取得今日 Dashboard
 */
async function getTodayDashboard(userId) {
  const tasks = await getTodayTasks(userId);
  const dueSoon = await getDueSoonTasks(userId);
  const conflicts = detectConflicts(tasks);
  const load = analyzeLoad(tasks);

  return {
    todayTasks: sortTasks(tasks),
    dueSoon,
    conflicts,
    load,
    aiHint: generateAIHint(tasks, load),
  };
}

/**
 * 今日任務
 */
async function getTodayTasks(userId) {
  const now = new Date();

  const { data } = await supabase
    .from("reminders")
    .select("*")
    .eq("line_user_id", userId)
    .eq("status", "pending");

  return data || [];
}

/**
 * 即將到期（未來24小時）
 */
async function getDueSoonTasks(userId) {
  const now = new Date();
  const next24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const { data } = await supabase
    .from("reminders")
    .select("*")
    .eq("line_user_id", userId)
    .eq("status", "pending");

  return (data || []).filter((t) => {
    const time = new Date(t.remind_at);
    return time <= next24h;
  });
}

/**
 * 排序（重要性）
 */
function sortTasks(tasks) {
  return tasks.sort((a, b) => {
    return new Date(a.remind_at) - new Date(b.remind_at);
  });
}

/**
 * 衝突偵測（簡化版）
 */
function detectConflicts(tasks) {
  const sorted = sortTasks(tasks);
  const conflicts = [];

  for (let i = 0; i < sorted.length - 1; i++) {
    const a = new Date(sorted[i].remind_at);
    const b = new Date(sorted[i + 1].remind_at);

    const diff = Math.abs(a - b) / (1000 * 60);

    if (diff < 60) {
      conflicts.push({
        a: sorted[i].title,
        b: sorted[i + 1].title,
      });
    }
  }

  return conflicts;
}

/**
 * 工作負載分析
 */
function analyzeLoad(tasks) {
  if (tasks.length <= 3) return "light";
  if (tasks.length <= 6) return "medium";
  return "heavy";
}

/**
 * AI 建議（先 mock）
 */
function generateAIHint(tasks, load) {
  if (load === "heavy") {
    return "今天任務較多，建議優先處理重要事項";
  }

  if (load === "medium") {
    return "今天工作量正常";
  }

  return "今天很輕鬆，可以安排進階任務";
}

module.exports = {
  getTodayDashboard,
};
