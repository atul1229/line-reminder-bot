# Brain Flow

## Purpose

Brain Flow 定義 Life Assistant 在收到使用者輸入後的完整思考流程。

所有新的能力（Reminder、Calendar、Gmail、Weather、Decision Engine…）都必須遵循此流程。

---

# Overall Flow

```
User Input
    │
    ▼
Conversation
    │
    ▼
Intent Parser
    │
    ▼
Entity Extractor
    │
    ▼
Decision Engine
    │
    ▼
Need Confirmation ?
    │
 ┌──┴────────────┐
 │               │
Yes             No
 │               │
 ▼               ▼
Ask User     Execute Action
 │               │
 └──────┬────────┘
        ▼
Response Builder
        │
        ▼
LINE / Web / App
```

---

# Step 1：Conversation

負責接收所有使用者輸入。

Input：

- LINE
- Web
- Mobile App
- API（未來）

Output：

```json
{
  "userId": "...",
  "text": "提醒我明天下午三點開會"
}
```

---

# Step 2：Intent Parser

回答：

> 使用者想做什麼？

例如：

```
提醒我開會
```

↓

```
CREATE_REMINDER
```

---

# Step 3：Entity Extractor

回答：

> 使用者提供了哪些資訊？

例如：

```
提醒我明天下午三點開會
```

↓

```json
{
  "datetime": "...",
  "title": "開會"
}
```

---

# Step 4：Decision Engine

回答：

> 可以直接執行嗎？

Decision Engine 必須判斷：

- 資訊是否完整
- 是否需要再次確認
- 是否可能有歧義
- 是否需要查詢其他模組（Calendar、Gmail…）

---

# Step 5：Confirmation

如果資訊不足：

例如：

```
提醒我開會
```

缺少時間。

Brain 不應直接建立提醒。

應回覆：

```
請問什麼時間提醒您？
```

另一個例子：

```
明天教育處
```

可能是：

- 建立提醒
- 建立行程
- 建立待辦

Brain 必須詢問。

---

# Step 6：Execute Action

當資訊完整後：

Brain 將工作交給對應 Service。

例如：

- Reminder Service
- Calendar Service
- Gmail Service
- Task Service

---

# Step 7：Response Builder

最後由 Response Builder 決定如何回覆使用者。

例如：

```
✅ 已建立提醒

時間：
2026/07/05 15:00

事項：
開會
```

Response Builder 負責：

- LINE 格式
- Web 格式
- App 格式

Brain 不直接產生文字。

---

# Brain Principle

Brain 不做任何實際工作。

Brain 只負責：

Understand

↓

Think

↓

Decide

↓

Delegate

↓

Respond

Brain 是協調者（Orchestrator），不是執行者（Executor）。
