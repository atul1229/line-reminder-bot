# Conversation Module

## Purpose

Conversation 模組是 Life Assistant Core 中負責「理解使用者輸入」的模組。

它的任務不是直接執行功能，而是將使用者輸入的自然語言，轉換成系統可以理解的結構化資訊。

簡單來說，Conversation 模組回答兩個問題：

1. 使用者想做什麼？
2. 使用者提供了哪些資訊？

---

## Position in System

Conversation 模組位於 Brain 之前。

整體流程如下：

```text
User Input
    ↓
Conversation Module
    ↓
Assistant Brain
    ↓
Planner / Decision Engine
    ↓
Service
    ↓
Response Builder
    ↓
LINE / Web / App
```

Conversation 模組負責理解輸入，Brain 則負責根據理解結果決定下一步。

---

## Responsibility

Conversation 模組負責：

- 判斷使用者意圖 Intent
- 擷取使用者提供的資訊 Entities
- 判斷資訊是否足夠
- 判斷是否需要向使用者追問
- 將自然語言轉換成結構化資料
- 提供 Brain 做下一步決策

---

## Not Responsibility

Conversation 模組不負責：

- 操作 Supabase
- 呼叫 LINE API
- 建立提醒
- 建立 Google Calendar 行程
- 發送 LINE 訊息
- 產生最終回覆文字
- 決定是否真的要執行某項動作

這些工作應由 Brain、Service 或 Response 模組處理。

---

## Core Concepts

### Intent

Intent 表示使用者想做什麼。

例如：

```text
提醒我明天下午三點開會
```

可能被解析為：

```text
CREATE_REMINDER
```

---

```text
今天工作
```

可能被解析為：

```text
TODAY_DASHBOARD
```

---

```text
明天教育處
```

可能無法明確判斷，因此會回傳：

```text
UNKNOWN
```

或需要進一步確認。

---

### Entity

Entity 表示使用者提供的關鍵資訊。

例如：

```text
提醒我明天下午三點開會
```

可以擷取出：

```json
{
  "datetimeText": "明天下午三點",
  "title": "開會"
}
```

---

另一個例子：

```text
下週一提醒我交研究所作業
```

可以擷取出：

```json
{
  "datetimeText": "下週一",
  "title": "交研究所作業",
  "category": "study"
}
```

---

### Need Confirmation

當使用者輸入不夠明確時，Conversation 模組應該標示需要確認。

例如：

```text
明天教育處
```

這句話可能代表：

- 建立提醒
- 建立行程
- 建立待辦
- 單純備忘

此時不應直接執行，而應交給 Brain 判斷是否追問使用者。

---

## Output Format

Conversation 模組應輸出標準化物件。

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

若語意不明確，則輸出：

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

---

## Example: Clear Reminder

使用者輸入：

```text
提醒我明天下午三點開會
```

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

Brain 可以根據此結果決定建立提醒。

---

## Example: Today Dashboard

使用者輸入：

```text
今天工作
```

Conversation 輸出：

```json
{
  "intent": "TODAY_DASHBOARD",
  "entities": {},
  "needConfirmation": false
}
```

Brain 可以根據此結果呼叫 Dashboard Service。

---

## Example: Ambiguous Input

使用者輸入：

```text
明天教育處
```

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

Brain 不應直接執行，而應要求使用者確認。

可能回覆：

```text
我理解你提到「明天教育處」。

你想要我怎麼處理？

1️⃣ 建立提醒
2️⃣ 建立行程
3️⃣ 建立待辦
```

---

## Current Implementation

目前 Conversation 模組仍處於早期階段。

現階段主要使用：

- Rule-based intent parsing
- Simple text parsing
- Basic time parser fallback

未來會逐步演進為：

```text
Rule-based Parser
    ↓
Hybrid Parser
    ↓
AI / LLM Parser
```

---

## Future Files

Conversation 模組未來可能包含：

```text
core/conversation/
├── README.md
├── intentParser.js
├── entityExtractor.js
├── confirmationManager.js
└── conversationContext.js
```

---

### intentParser.js

負責判斷使用者意圖。

例如：

```text
提醒我明天開會
```

轉換成：

```text
CREATE_REMINDER
```

---

### entityExtractor.js

負責擷取使用者提供的關鍵資訊。

例如：

```text
明天下午三點
開會
教育處
主任
```

---

### confirmationManager.js

負責判斷是否需要追問。

例如：

```text
明天教育處
```

需要詢問使用者是要建立提醒、行程，還是待辦。

---

### conversationContext.js

未來若支援多輪對話，可用來保存上下文。

例如：

使用者：

```text
提醒我開會
```

Bot：

```text
請問什麼時候提醒你？
```

使用者：

```text
明天下午三點
```

系統需要知道這句話是補充上一句的時間資訊。

---

## Design Principle

Conversation 模組只負責理解，不負責執行。

它不應該直接建立提醒、不應該直接寫入資料庫，也不應該直接回覆 LINE。

它的核心任務是：

```text
Natural Language
    ↓
Structured Understanding
```

真正是否執行、如何執行，應交由 Brain 和 Service 決定。

---

## Product Principle

Life Assistant 採用助理型互動，而不是純指令型互動。

因此，當輸入不明確時，系統不應該亂猜，而應該確認。

原則：

```text
明確 → 執行
模糊 → 詢問
未知 → 引導
```

這樣可以避免錯誤建立提醒、行程或待辦，也讓系統更像真人助理。
