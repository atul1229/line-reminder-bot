# System Architecture

## Overview

Work Assistant 採用分層架構（Layered Architecture），將系統拆分為不同職責的模組。

每個模組只負責自己的工作，以降低耦合度，提升維護性與擴充性。

系統目前部署於 Render，資料儲存在 Supabase，並透過 LINE Messaging API 與使用者互動。

---

# High Level Architecture

```
                    User
                      │
                      │ LINE
                      ▼
             LINE Official Account
                      │
                      ▼
                Render Webhook
                      │
                      ▼
                 Express Server
                      │
                      ▼
               LINE Controller
                      │
        ┌─────────────┼─────────────┐
        │             │             │
 Reminder Service  Calendar Service Dashboard Service
        │
        ▼
     Supabase
        │
        ▼
 Reminder Scheduler
        │
        ▼
 LINE Push Message
```

---

# Layer Responsibility

## Presentation Layer

負責所有使用者互動。

目前包含：

- LINE Official Account
- Webhook
- Controller

主要工作：

- 接收 LINE 訊息
- 驗證 Request
- 回覆使用者
- 呼叫 Service

不負責商業邏輯。

---

## Business Layer

包含所有 Service。

例如：

- Reminder Service
- Calendar Service
- Dashboard Service

主要工作：

- 建立提醒
- 查詢提醒
- Google Calendar 同步
- AI 摘要

Service 不直接處理 LINE 回覆。

---

## Data Layer

目前使用：

Supabase PostgreSQL

負責：

- Reminder
- User Settings
- Future Dashboard Data

所有資料都集中管理。

---

## Background Job

Scheduler 為背景工作。

負責：

- 定期檢查提醒
- 推播 LINE
- 更新 Reminder 狀態

Scheduler 不接受使用者 Request。

---

# Request Flow

建立提醒流程：

```
User

↓

LINE

↓

Webhook

↓

Controller

↓

Reminder Service

↓

Supabase

↓

Reply Message
```

---

提醒推播流程：

```
Scheduler

↓

Supabase

↓

Reminder Service

↓

LINE Push API

↓

User
```

---

# Design Principles

## Single Responsibility

每個模組只負責一件事情。

例如：

Controller：

只處理 Request。

Service：

只處理 Business Logic。

Database：

只負責資料儲存。

---

## Low Coupling

Controller 不直接操作資料庫。

所有資料操作皆透過 Service。

---

## High Cohesion

相同功能集中於同一個 Service。

例如：

Reminder 相關功能全部放在 Reminder Service。

---

## Easy to Extend

未來新增：

- AI
- Weather
- Gmail

只需新增新的 Service。

不用修改既有 Reminder Service。

---

# Future Architecture

目前：

Controller

↓

Service

↓

Supabase

未來若系統規模增加，可加入：

Repository Layer

形成：

Controller

↓

Service

↓

Repository

↓

Database

以降低資料來源耦合。

目前因專案規模仍小，因此暫不加入 Repository。

---

# Technology Stack

Frontend

- LINE Official Account

Backend

- Node.js
- Express

Database

- Supabase (PostgreSQL)

Deployment

- Render

Version Control

- Git
- GitHub

---

# Architecture Decision

目前採用 Layered Architecture。

原因：

- 容易理解
- 適合中小型專案
- 容易擴充
- 維護成本低

未來若功能增加，可逐步演進為 Clean Architecture，而不需要重寫整個系統。
