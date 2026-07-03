# Database Design

## Overview

Work Assistant 使用 Supabase PostgreSQL 作為主要資料庫。

資料庫的目標不是只儲存提醒，而是逐步支援提醒、行程、待辦、每日 Dashboard 與 AI 摘要。

目前系統已建立第一張資料表：

- reminders

---

## Current Table

### reminders

`reminders` 是目前 v0.1 使用的提醒資料表。

目前用途：

- 儲存 LINE 使用者建立的提醒
- 記錄提醒時間
- 記錄提醒是否已完成或已推播

目前欄位：

| 欄位         | 型別        | 說明                      |
| ------------ | ----------- | ------------------------- |
| id           | uuid        | 提醒唯一識別碼            |
| line_user_id | text        | LINE 使用者 ID            |
| title        | text        | 提醒內容                  |
| remind_at    | timestamptz | 提醒時間                  |
| status       | text        | 狀態，例如 pending / sent |
| created_at   | timestamptz | 建立時間                  |

---

## Current Limitation

目前 `reminders` 表可以支援基本提醒功能，但未來若要加入 Google Calendar、AI 摘要、Dashboard，會遇到限制。

主要限制：

- 只能表示提醒，無法表示一般待辦事項
- 沒有分類欄位
- 沒有優先級
- 沒有來源欄位，例如 line / google / ai
- 沒有完成時間
- 不容易整合 Google Calendar event id
- 不容易支援 Daily Dashboard

## 因此，未來資料模型會逐步從 `reminders` 演進為更通用的 `tasks` 模型。

## Future Table: tasks

未來 Work Assistant 會逐步從 `reminders` 演進到 `tasks`。

`tasks` 是更通用的任務模型，可以表示：

- 提醒
- 待辦事項
- Google Calendar 行程
- AI 建立的工作項目
- Daily Dashboard 中顯示的工作

### tasks 欄位設計

| 欄位            | 型別        | 說明                                       |
| --------------- | ----------- | ------------------------------------------ |
| id              | uuid        | 任務唯一識別碼                             |
| line_user_id    | text        | LINE 使用者 ID                             |
| title           | text        | 任務標題                                   |
| description     | text        | 任務詳細內容                               |
| type            | text        | 類型，例如 reminder / task / calendar      |
| source          | text        | 資料來源，例如 line / google / ai          |
| status          | text        | 狀態，例如 pending / completed / cancelled |
| priority        | text        | 優先級，例如 low / medium / high           |
| due_at          | timestamptz | 到期或提醒時間                             |
| completed_at    | timestamptz | 完成時間                                   |
| google_event_id | text        | 對應 Google Calendar Event ID              |
| created_at      | timestamptz | 建立時間                                   |
| updated_at      | timestamptz | 更新時間                                   |

---

## Why tasks?

`tasks` 的設計目標是讓不同來源的工作資訊可以被統一管理。

例如：

| 來源            | 原始資料                  | 轉換後               |
| --------------- | ------------------------- | -------------------- |
| LINE            | 提醒我 7/5 20:00 到巴國小 | task type = reminder |
| Google Calendar | 教師會議                  | task type = calendar |
| AI              | 從會議摘要產生待辦        | task type = task     |
| 手動輸入        | 今天要回覆主任            | task type = task     |

這樣 Dashboard 就不需要知道資料來自哪裡，只需要查詢 `tasks`，即可整理今日工作。
---

## Data Flow

Work Assistant 採用 `tasks` 作為核心資料模型。

不管資料來源是 LINE、Google Calendar、AI 或未來其他服務，最終都會轉換為 `tasks`。
1.LINE Reminder
      ↓
tasks

2.Google Calendar Event
      ↓
tasks

3.AI Generated Action Item
      ↓
tasks

4.Manual Input
      ↓
tasks

Dashboard、Scheduler 與 AI Summary 不直接依賴原始資料來源，而是統一查詢 `tasks`。

tasks
  ↓
Dashboard

tasks
  ↓
Scheduler

tasks
  ↓
AI Summary

---

## Single Source of Truth

`tasks` 是 Work Assistant 的 Single Source of Truth。

這代表：

- Dashboard 只查詢 `tasks`
- Scheduler 只查詢 `tasks`
- AI Summary 只查詢 `tasks`
- Google Calendar 同步後，也會轉換為 `tasks`
- LINE 建立的提醒，也會轉換為 `tasks`

這樣可以避免不同模組各自查詢不同資料來源，造成資料不一致或維護困難。

---

## Design Decision

本專案曾考慮讓 Dashboard 直接查詢不同資料來源，例如：

- 直接查 Supabase reminders
- 直接查 Google Calendar API
- 直接查 AI 產生的暫存資料

最後決定採用 `tasks` 作為統一資料模型。

原因：

- 降低 Dashboard 複雜度
- 減少各模組之間的耦合
- 方便未來加入 Google Calendar、AI、Gmail、Meeting Notes 等資料來源
- 讓 Scheduler、Dashboard、AI Summary 都能共用同一份資料
- 提升系統長期維護性

此設計是 Work Assistant 的核心資料架構決策。
