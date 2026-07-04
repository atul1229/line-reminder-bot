# Planner Module

## Purpose

Planner 模組是 Life Assistant Core 中負責「決策」的模組。

Conversation 模組負責理解使用者輸入，而 Planner 模組負責根據理解結果，決定下一步該怎麼做。

簡單來說：

```text
Conversation = 理解
Planner = 決策
Service = 執行
Response = 回覆
```

---

## Position in System

Planner 位於 Conversation 之後、Service 之前。

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
Response Builder
    ↓
LINE / Web / App
```

Planner 不直接接收原始文字，而是接收 Conversation 模組產生的結構化結果。

---

## Responsibility

Planner 模組負責：

- 判斷目前資訊是否足夠執行
- 判斷是否需要向使用者確認
- 判斷應該執行哪一個 action
- 判斷應該呼叫哪一個 Service
- 建立標準化 Decision Object
- 避免在資訊不足時直接執行危險操作

---

## Not Responsibility

Planner 模組不負責：

- 解析自然語言
- 擷取日期、時間或標題
- 操作 Supabase
- 呼叫 LINE API
- 建立提醒或行程
- 產生最終回覆文字

這些工作應由 Conversation、Service 或 Response 模組處理。

---

## Input Format

Planner 接收 Conversation 模組的輸出。

範例：

```json
{
  "intent": "CREATE_REMINDER",
  "entities": {
    "title": "開會",
    "datetimeText": "明天下午三點"
  },
  "needConfirmation": false
}
```

---

## Output Format

Planner 輸出 Decision Object。

範例：

```json
{
  "action": "CREATE_REMINDER",
  "canExecute": true,
  "needConfirmation": false,
  "service": "ReminderService",
  "entities": {
    "title": "開會",
    "datetimeText": "明天下午三點"
  }
}
```

若資訊不足：

```json
{
  "action": "ASK_CONFIRMATION",
  "canExecute": false,
  "needConfirmation": true,
  "reason": "Missing datetime",
  "question": "請問什麼時候提醒你？"
}
```

若語意不明確：

```json
{
  "action": "ASK_CONFIRMATION",
  "canExecute": false,
  "needConfirmation": true,
  "reason": "Ambiguous intent",
  "options": ["CREATE_REMINDER", "CREATE_EVENT", "CREATE_TASK"]
}
```

---

## Decision Rules

### Rule 1：明確且資訊完整 → 執行

例如：

```text
提醒我明天下午三點開會
```

Conversation 結果：

```json
{
  "intent": "CREATE_REMINDER",
  "entities": {
    "title": "開會",
    "datetimeText": "明天下午三點"
  },
  "needConfirmation": false
}
```

Planner 決策：

```json
{
  "action": "CREATE_REMINDER",
  "canExecute": true
}
```

---

### Rule 2：Intent 明確但資訊不足 → 追問

例如：

```text
提醒我開會
```

缺少提醒時間。

Planner 不應直接建立提醒，而應追問：

```text
請問什麼時候提醒你？
```

---

### Rule 3：Intent 不明確 → 提供選項

例如：

```text
明天教育處
```

Planner 不應猜測使用者要做什麼，而應要求確認：

```text
我理解你提到「明天教育處」。

你想要我怎麼處理？

1️⃣ 建立提醒
2️⃣ 建立行程
3️⃣ 建立待辦
```

---

### Rule 4：危險或不可逆操作 → 必須確認

未來若支援刪除、取消、修改等操作，Planner 必須要求確認。

例如：

```text
刪除今天所有提醒
```

不應直接執行，必須先詢問：

```text
你確定要刪除今天所有提醒嗎？
```

---

## Example: Create Reminder

Conversation 輸出：

```json
{
  "intent": "CREATE_REMINDER",
  "entities": {
    "title": "開會",
    "datetimeText": "明天下午三點"
  },
  "needConfirmation": false
}
```

Planner 輸出：

```json
{
  "action": "CREATE_REMINDER",
  "canExecute": true,
  "needConfirmation": false,
  "service": "ReminderService",
  "entities": {
    "title": "開會",
    "datetimeText": "明天下午三點"
  }
}
```

---

## Example: Missing Time

Conversation 輸出：

```json
{
  "intent": "CREATE_REMINDER",
  "entities": {
    "title": "開會"
  },
  "needConfirmation": true
}
```

Planner 輸出：

```json
{
  "action": "ASK_CONFIRMATION",
  "canExecute": false,
  "needConfirmation": true,
  "reason": "Missing datetime",
  "question": "請問什麼時候提醒你？"
}
```

---

## Example: Ambiguous Input

Conversation 輸出：

```json
{
  "intent": "UNKNOWN",
  "entities": {
    "text": "明天教育處"
  },
  "needConfirmation": true,
  "options": ["CREATE_REMINDER", "CREATE_EVENT", "CREATE_TASK"]
}
```

Planner 輸出：

```json
{
  "action": "ASK_CONFIRMATION",
  "canExecute": false,
  "needConfirmation": true,
  "reason": "Ambiguous intent",
  "options": ["CREATE_REMINDER", "CREATE_EVENT", "CREATE_TASK"]
}
```

---

## Future Files

Planner 模組未來可能包含：

```text
core/planner/
├── README.md
├── decisionEngine.js
├── actionMapper.js
└── riskChecker.js
```

---

### decisionEngine.js

負責根據 Conversation 結果做主要決策。

---

### actionMapper.js

負責將 Intent 對應到具體 Action 與 Service。

例如：

```text
CREATE_REMINDER → ReminderService.createReminder
TODAY_DASHBOARD → DashboardService.getTodayDashboard
```

---

### riskChecker.js

負責判斷某個操作是否需要額外確認。

例如：

- 刪除資料
- 修改大量資料
- 覆蓋原有行程
- 取消提醒

---

## Design Principle

Planner 只負責決策，不負責執行。

它的核心任務是：

```text
Structured Understanding
    ↓
Decision
```

真正執行由 Service 完成。

---

## Product Principle

Life Assistant 採用助理型互動。

因此 Planner 的最高原則是：

```text
明確 → 執行
不足 → 追問
模糊 → 提供選項
危險 → 確認
```

這可以避免系統亂猜，也能讓使用者感覺像是在和真人助理互動。
