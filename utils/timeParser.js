function parseReminderText(text) {
  const t = text.replace("提醒我", "").trim();

  // ====== 最簡單 fallback ======
  if (!t) {
    return null;
  }

  // ====== 原始格式：7/5 20:00 到巴國小 ======
  const match = t.match(/(\d{1,2})\/(\d{1,2})\s+(\d{1,2}):(\d{2})\s+(.+)/);

  if (match) {
    const year = new Date().getFullYear();

    return {
      remindAt: `${year}-${match[1].padStart(2, "0")}-${match[2].padStart(2, "0")}T${match[3]}:${match[4]}:00+08:00`,
      title: match[5],
    };
  }

  // ====== fallback（避免直接報錯） ======
  return {
    remindAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    title: t,
  };
}

module.exports = {
  parseReminderText,
};
