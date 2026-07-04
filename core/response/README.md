# Response Module

## Purpose

Response 模組是 Life Assistant Core 中負責「回覆呈現」的模組。

它的任務是將 Brain、Planner 或 Service 執行後的結果，轉換成使用者可以理解的回覆內容。

Response 模組不負責理解使用者輸入，也不負責決策或執行功能。

簡單來說：

```text
Conversation = 理解
Planner = 決策
Service = 執行
Response = 回覆
```

---

## Position in System

Response 模組位於整個流程的最後階段。

整體流程如下：

```text
User Input
    ↓
Conversation Module
    ↓
Planner Module
    ↓
Assistant Brain
    ↓
Service
    ↓
Response Module
    ↓
LINE / Web / App
```

Response 模組負責將系統結果轉換成適合不同介面的輸出格式。

目前主要輸出目標為 LINE。

未來可能支援：

- Web
- Mobile App
- Email
- Desktop Notification

---

## Responsibility

Response 模組負責：

- 產生 LINE 回覆文字
- 產生 Dashboard 顯示內容
- 產生提醒建立成功訊息
- 產生錯誤訊息
- 產生追問訊息
- 統一系統回覆風格
- 讓回覆清楚、簡潔、可行動

---

## Not Responsibility

Response 模組不負責：

- 判斷使用者 Intent
- 擷取 Entity
- 決定是否執行功能
- 操作 Supabase
- 呼叫 LINE API
- 建立提醒
- 查詢 Dashboard 資料

Response 模組只負責「內容怎麼呈現」。

真正發送訊息仍由 Controller 或 Interface Layer 處理。

---

## Response Principles

### Principle 1：清楚

每一次回覆都要讓使用者知道：

- 發生了什麼事
- 系統做了什麼
- 接下來可以做什麼

---

### Principle 2：簡潔

LINE 是聊天介面，不適合太長的內容。

回覆應避免過度冗長。

必要時可以分段，或未來使用 Flex Message。

---

### Principle 3：一致

相同類型的功能應使用一致格式。

例如建立提醒成功時，應固定包含：

- 狀態
- 時間
- 事項

---

### Principle 4：可行動

回覆不只是告知結果，也應引導下一步。

例如：

```text
✅ 已建立提醒

📅 時間：2026/07/05 20:00
📝 事項：到巴國小

你也可以輸入「今天工作」查看今日任務。
```

---

### Principle 5：不確定時要誠實

如果系統不理解使用者輸入，不應假裝理解。

應該回覆：

```text
我還不太確定你的意思。

你是想要：

1️⃣ 建立提醒
2️⃣ 建立行程
3️⃣ 建立待辦
```

---

## Output Types

Response 模組主要處理以下回覆類型：

```text
REMINDER_CREATED
REMINDER_SENT
TODAY_DASHBOARD
ASK_CONFIRMATION
ERROR
UNKNOWN_INTENT
```

---

## Example: Reminder Created

Input：

```json
{
  "type": "REMINDER_CREATED",
  "data": {
    "title": "到巴國小",
    "remindAt": "2026-07-05T20:00:00+08:00"
  }
}
```

Output：

```text
✅ 已建立提醒

📅 時間：2026/07/05 20:00
📝 事項：到巴國小
```

---

## Example: Reminder Sent

Input：

```json
{
  "type": "REMINDER_SENT",
  "data": {
    "title": "到巴國小"
  }
}
```

Output：

```text
⏰ 提醒你：到巴國小
```

---

## Example: Today Dashboard

Input：

```json
{
  "type": "TODAY_DASHBOARD",
  "data": {
    "todayTasks": [
      {
        "title": "教師會議",
        "time": "09:00"
      }
    ],
    "dueSoon": [],
    "conflicts": [],
    "load": "medium",
    "aiHint": "今天工作量正常。"
  }
}
```

Output：

```text
📅 今天任務
- 教師會議

⏰ 即將到期
無

⚠️ 衝突
無

📊 負載
medium

💡 建議
今天工作量正常。
```

---

## Example: Ask Confirmation

Input：

```json
{
  "type": "ASK_CONFIRMATION",
  "data": {
    "text": "明天教育處",
    "options": ["CREATE_REMINDER", "CREATE_EVENT", "CREATE_TASK"]
  }
}
```

Output：

```text
我理解你提到「明天教育處」。

你想要我怎麼處理？

1️⃣ 建立提醒
2️⃣ 建立行程
3️⃣ 建立待辦
```

---

## Example: Unknown Intent

Input：

```json
{
  "type": "UNKNOWN_INTENT"
}
```

Output：

```text
我還不太確定你的意思。

你可以試試：

- 提醒我 7/5 20:00 到巴國小
- 今天工作
```

---

## Future Files

Response 模組未來可能包含：

```text
core/response/
├── README.md
├── responseBuilder.js
├── lineResponseBuilder.js
├── dashboardFormatter.js
└── errorResponseBuilder.js
```

---

### responseBuilder.js

負責統一建立標準回覆物件。

---

### lineResponseBuilder.js

負責將標準回覆轉換成 LINE 文字或 Flex Message。

---

### dashboardFormatter.js

負責格式化 Dashboard 顯示內容。

---

### errorResponseBuilder.js

負責統一錯誤訊息格式。

---

## Design Principle

Response 模組只負責呈現，不負責理解、不負責決策、不負責執行。

它的核心任務是：

```text
System Result
    ↓
Human-readable Response
```

---

## Product Principle

Life Assistant 的回覆風格應該像真人助理：

```text
清楚
簡潔
不亂猜
可行動
有一致格式
```

回覆不應只是技術結果，而應該讓使用者感覺：

> 系統已經理解我，並且清楚告訴我下一步。
