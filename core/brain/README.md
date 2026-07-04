# Brain Module

## Purpose

Brain 是 Life Assistant 的核心協調層。

它負責接收使用者輸入後的解析結果，判斷下一步應該執行什麼動作。

Brain 不直接處理 LINE、不直接操作資料庫，也不直接建立提醒或行程。

它的角色是協調各模組之間的流程。

---

## Responsibility

Brain 負責：

- 接收使用者輸入
- 呼叫 Conversation 模組解析 Intent
- 呼叫 Entity Extractor 取得必要資訊
- 判斷是否需要向使用者確認
- 決定要呼叫哪一個 Service
- 將結果交給 Response 模組產生回覆

---

## Not Responsibility

Brain 不負責：

- 直接操作 Supabase
- 直接呼叫 LINE API
- 直接建立 Reminder
- 直接同步 Google Calendar
- 直接產生最終文字格式

---

## Input

Brain 預期接收：

```json
{
  "userId": "LINE_USER_ID",
  "text": "提醒我明天下午三點開會"
}

Output

Brain 預期輸出：

{
  "action": "CREATE_REMINDER",
  "needConfirmation": false,
  "entities": {
    "title": "開會",
    "datetime": "2026-07-05T15:00:00+08:00"
  }
}
```

Design Principle

Brain 是協調者，不是執行者。

所有實際工作應交給 Service 或其他 Core 模組處理。
