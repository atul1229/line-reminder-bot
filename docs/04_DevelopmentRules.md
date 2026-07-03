# Development Rules

## Purpose

本文件定義 Work Assistant 專案的開發規範。

目標是讓專案在功能逐漸增加後，仍然保持清楚、穩定、容易維護。

---

## Core Principle

本專案遵守以下核心原則：

> 每個檔案只負責一件事情。

如果某個檔案開始處理太多責任，就應該拆分。

---

## Folder Responsibility

### config/

放置外部服務設定與初始化。

例如：

- LINE Client
- Supabase Client
- 未來的 Google Calendar Client
- 未來的 OpenAI Client

`config/` 不處理商業邏輯。

---

### controllers/

負責接收使用者輸入，判斷使用者想做什麼，並呼叫對應的 Service。

Controller 可以：

- 解析 LINE 訊息
- 判斷指令類型
- 呼叫 Service
- 回覆使用者

Controller 不可以：

- 直接操作資料庫
- 寫複雜商業邏輯
- 處理排程任務

---

### services/

負責商業邏輯。

例如：

- 建立提醒
- 查詢提醒
- 完成提醒
- 同步 Google Calendar
- 產生 AI 摘要

Service 可以操作資料庫。

Service 不應該直接處理 LINE Webhook。

---

### scheduler/

負責背景排程任務。

例如：

- 每分鐘檢查到期提醒
- 每天早上產生 Daily Brief
- 每天晚上產生工作摘要

Scheduler 不處理使用者即時輸入。

---

### routes/

負責定義 HTTP 路由。

例如：

- /webhook
- /health
- /api/status

Route 不寫商業邏輯，只負責把 request 交給 Controller。

---

### utils/

放置通用工具函式。

例如：

- 時間格式化
- 文字格式化
- 日期解析
- 錯誤處理工具

Utility 不應該依賴 Controller 或 Service。

---

## Coding Rules

### 1. 單一責任原則

每個檔案與函式都應該有明確目的。

如果一個函式開始做兩件以上的事情，應考慮拆分。

---

### 2. 檔案長度

原則上單一檔案盡量不超過 300 行。

超過時應檢查是否需要拆分。

---

### 3. 函式命名

函式名稱應清楚表達用途。

建議使用動詞開頭，例如：

- createReminder
- getTodayTasks
- sendPushMessage
- syncGoogleCalendar
- generateDailyBrief

---

### 4. 註解規範

重要函式應加入 JSDoc 註解。

範例：

```js
/**
 * 建立一筆提醒事項
 *
 * @param {string} userId - LINE 使用者 ID
 * @param {string} remindAt - 提醒時間
 * @param {string} title - 提醒內容
 * @returns {Promise<boolean>}
 */
async function createReminder(userId, remindAt, title) {
  // ...
}
```

Git Workflow

每次完成一個可測試的小功能後，才進行 commit。

Commit message 應簡短但清楚。

範例：

git commit -m "add reminder scheduler"
git commit -m "refactor line controller"
git commit -m "add database documentation"

避免使用：

git commit -m "update"
git commit -m "fix"
git commit -m "test"

Development Flow

每個功能開發流程如下：

確認需求
更新文件
設計資料流
實作 Controller / Service / Scheduler
本機測試
Commit
Push
Render Deploy
LINE 實測
Testing Rule

每次修改程式後，至少執行：

npm start

確認伺服器能正常啟動。

涉及 LINE 功能時，需實際傳訊息測試。

涉及資料庫功能時，需確認 Supabase 資料是否正確新增或更新。

Architecture Rule

Controller 不直接操作 Supabase。

正確流程：

Controller
↓
Service
↓
Supabase

錯誤流程：

Controller
↓
Supabase
Product Rule

不要為了技術而增加功能。

每新增功能前，需回答：

它是否能減少工作管理成本？
它是否能減少 App 切換？
它是否會被每天或每週使用？

如果答案多數是否，則不列入優先開發。

Current Priority

目前優先順序：

Reminder Scheduler
LINE Push Message
Today Tasks / Today Reminders
Google Calendar Integration
Daily Work Dashboard
AI Summary