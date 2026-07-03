# Conversation Design

## Purpose

Work Assistant 採用自然語言互動，而非傳統固定指令模式。

使用者不需要記住每一個指令，只需要用平常說話的方式表達需求。

系統的工作，是理解使用者真正的意圖（Intent），並完成對應的工作。

---

# Conversation Principles

## Principle 1

理解意圖，而不是比對文字。

例如：

提醒我明天九點開會

明天九點提醒我開會

記得明天九點開會

不要忘記明天九點開會

以上四句，

都代表同一個 Intent：

**CreateReminder**

---

## Principle 2

優先接受自然語言。

除非必要，不要求使用者輸入固定格式。

---

## Principle 3

回覆必須清楚。

每一次成功或失敗，

都要讓使用者知道：

- 發生什麼事情
- 下一步可以做什麼

---

## Principle 4

保持一致的回覆風格。

所有回覆：

應該簡潔、

容易閱讀、

資訊完整。

避免不同功能出現完全不同的回覆格式。

---

## Principle 5

Conversation 優先於 Command。

Work Assistant 是對話系統，

不是指令系統。

因此，

Conversation Design 的優先順序，

高於固定 Command Design。
