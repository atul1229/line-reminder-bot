const reminderService = require("../services/reminderService");
const { lineClient } = require("../config/line");

/**
 * 處理 LINE 傳進來的單一事件
 *
 * Controller 的責任：
 * - 接收 LINE event
 * - 判斷使用者輸入
 * - 呼叫對應的 service
 * - 回覆使用者
 *
 * Controller 不直接操作資料庫。
 */
async function handleEvent(event) {
  // 下一步再搬 index.js 裡的 handleEvent 進來
  if (event.type !== "message" || event.message.type !== "text") {
    return;
  }

  const text = event.message.text.trim();
  const userId = event.source.userId;

  if (text.startsWith("提醒我")) {
    return createReminder(event.replyToken, userId, text);
  }

  return replyText(event.replyToken, "請輸入：提醒我 7/5 20:00 到巴國小");
}
/**
 * 解析使用者輸入，並建立提醒
 *
 * 支援格式：
 * 提醒我 7/5 20:00 到巴國小
 */
async function createReminder(replyToken, userId, text) {
  const content = text.replace("提醒我", "").trim();

  const match = content.match(
    /(\d{1,2})\/(\d{1,2})\s+(\d{1,2}):(\d{2})\s+(.+)/,
  );

  if (!match) {
    return replyText(replyToken, "格式錯誤，請輸入：提醒我 7/5 20:00 到巴國小");
  }

  const year = new Date().getFullYear();
  const month = match[1].padStart(2, "0");
  const day = match[2].padStart(2, "0");
  const hour = match[3].padStart(2, "0");
  const minute = match[4];
  const title = match[5];

  const remindAt = `${year}-${month}-${day}T${hour}:${minute}:00+08:00`;

  try {
    await reminderService.createReminder(userId, remindAt, title);
  } catch (error) {
    console.error(error);
    return replyText(replyToken, "建立提醒失敗，請稍後再試。");
  }

  return replyText(
    replyToken,
    `✅ 已建立提醒\n\n📅 時間：${year}/${month}/${day} ${hour}:${minute}\n📝 事項：${title}`,
  );
}

/**
 * 回覆 LINE 使用者文字訊息
 *
 * @param {string} replyToken - LINE 提供的一次性回覆 token
 * @param {string} text - 要回覆給使用者的文字
 */
async function replyText(replyToken, text) {
  return lineClient.replyMessage({
    replyToken,
    messages: [
      {
        type: "text",
        text: text,
      },
    ],
  });
}
module.exports = {
  handleEvent,
};
