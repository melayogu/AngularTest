# 🚀 GitHub Actions 自動化部署流程

## 📋 流程概述

您的專案現在有兩個 GitHub Actions 工作流程：

### 1. `develop-to-master.yml` - 主要自動化流程
**觸發條件**: 當您推送到 `develop` 分支時

**執行步驟**:
```
develop 分支推送 → 執行測試 → 合併到 master → 部署到 gh-pages
```

**詳細流程**:
1. 🧪 **測試階段** - 在 develop 分支執行：
   - 單元測試 (Unit Tests)
   - E2E 測試 (Playwright)

2. 🔄 **合併階段** - 測試通過後：
   - 自動將 develop 合併到 master 分支

3. 🚀 **部署階段** - 合併完成後：
   - 在 master 分支構建 Angular 應用
   - 部署到 GitHub Pages (gh-pages 分支)

4. 🔔 **通知階段** - 部署完成後：
   - 發送成功通知

### 2. `ci.yml` - 傳統 CI 流程
**觸發條件**: 當您直接推送到 `master` 分支或創建 PR 時

**執行步驟**:
- Commit 格式檢查
- Node.js 環境檢查
- 單元測試
- E2E 測試
- 構建和部署
- 發送通知

## 🔧 使用方式

### 開發流程 (推薦)
```bash
# 1. 在 develop 分支開發
git checkout develop
git add .
git commit -m "feat: 新增功能"
git push origin develop

# 2. GitHub Actions 自動執行：
#    develop → 測試 → master → gh-pages
```

### 緊急修復流程
```bash
# 直接推送到 master (會觸發 ci.yml)
git checkout master
git add .
git commit -m "fix: 緊急修復"
git push origin master
```

## ⚙️ 必要設定

### 1. GitHub Repository 權限
確保 GitHub Actions 有足夠權限：
- Settings → Actions → General → Workflow permissions
- 選擇 "Read and write permissions"

### 2. 分支保護規則 (可選)
如果想要更嚴格的控制：
- Settings → Branches → Add rule
- 保護 `master` 分支，要求 PR 審核

### 3. Secrets 設定
如果您想保留通知功能，需要設定以下 Secrets：
- `LINE_USER_ID`
- `LINE_CHANNEL_ACCESS_TOKEN`
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`
- `DISCORD_WEBHOOK_URL`

## 🎯 優點

✅ **自動化**: develop → master → gh-pages 完全自動化
✅ **測試保障**: 只有測試通過才會合併和部署
✅ **清晰分離**: 開發在 develop，穩定版在 master
✅ **快速部署**: 推送即部署，無需手動操作
✅ **錯誤隔離**: develop 分支測試失敗不會影響 master

## 🔄 分支策略

```
develop (開發分支)
    ↓ 推送觸發 CI
    ↓ 執行測試
    ↓ 測試通過
master (穩定分支)
    ↓ 自動合併
    ↓ 構建應用
gh-pages (部署分支)
    ↓ 自動部署
    🌐 網站上線
```

現在您只需要在 develop 分支開發，推送後就會自動完成測試、合併、部署的完整流程！
