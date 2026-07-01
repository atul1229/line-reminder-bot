require("dotenv").config();

const express = require("express");
const { line, lineConfig, lineClient } = require("./config/line");
const supabase = require("./config/supabase");

const app = express();

app.get("/", (req, res) => {
  res.send("Life Assistant LINE Bot is running.");
});

app.post("/webhook", line.middleware(lineConfig), async (req, res) => {
  try {
    const events = req.body.events || [];
    await Promise.all(events.map(handleEvent));
    res.status(200).end();
  } catch (error) {
    console.error(error);
    res.status(200).end();
  }
});

async function handleEvent(event) {
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

  const { error } = await supabase.from("reminders").insert({
    line_user_id: userId,
    title: title,
    remind_at: remindAt,
    status: "pending",
  });

  if (error) {
    console.error(error);
    return replyText(replyToken, "建立提醒失敗，請稍後再試。");
  }

  return replyText(
    replyToken,
    `✅ 已建立提醒\n\n📅 時間：${year}/${month}/${day} ${hour}:${minute}\n📝 事項：${title}`,
  );
}

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

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
