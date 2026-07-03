# Project Charter

## Project Name

Work Assistant

## Mission

每天只需要打開 LINE，即可掌握今天所有重要工作。

## Project Positioning

Work Assistant 是一個以 LINE 為入口的個人工作助理系統。

它不是一般聊天機器人，而是協助使用者管理提醒、行程、Google Calendar 與工作摘要的個人工作中樞。

## Target User

目前主要使用者為系統開發者本人。

第一階段不以多人共用、商業化或團隊協作為目標，而是先聚焦在個人日常工作管理。

## Core Value

- 簡單：所有操作盡量透過 LINE 完成。
- 穩定：提醒與行程功能必須可靠。
- 節省時間：減少在多個 App 之間切換。
- 可擴充：未來可以加入 Google Calendar、AI 摘要、每日簡報等功能。
- 可維護：程式架構與文件要清楚，方便長期修改。

## Initial Scope

第一階段優先完成：

- LINE Bot 基礎互動
- 建立提醒
- Scheduler 自動提醒
- LINE Push Message
- 查詢今日提醒
- 查詢全部未完成提醒

## Future Scope

後續可能加入：

- Google Calendar 整合
- 每日行程摘要
- AI 工作摘要
- 會議摘要
- 工作 Inbox
- 系統狀態查詢

## Out of Scope

目前不優先開發：

- 股票交易
- 記帳系統
- 社群聊天
- 多人共用
- 複雜權限管理
- 商業收費功能

## Development Principle

不要為了技術而增加功能。

只開發真正能節省時間、減少遺漏、提升工作管理效率的功能。

## Success Criteria

本專案成功的標準不是功能數量，而是是否能真正成為每日工作流程的一部分。

初期成功標準：

- 每天至少使用一次 LINE Bot
- 可以穩定建立提醒
- 可以準時收到提醒
- 可以快速查詢今天重要事項
- 可以減少開啟多個 App 查詢行程的時間
