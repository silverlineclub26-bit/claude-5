# Silver Line 銀線陪練桌 (claude-5)

手機用的德州撲克單挑練習網頁：4 人桌對戰混合風格 AI，內建**近似 GTO 建議引擎**與每手覆盤。

線上版：https://silverlineclub26-bit.github.io/claude-5/

## 特色
- **位置制 4 人桌**：BTN / SB / BB / UTG 每手輪動，短碼自動切換 push/fold。
- **近似 GTO 建議**：翻前用起手牌勝率百分位範圍（各位置 open / call / 3-bet）；翻後對「依對手動作推測的範圍」算勝率 + 底池賠率 / MDF + 下注尺寸。
- **高速引擎**：位元遮罩 7 張評估器 + 蒙地卡羅，手機即時運算不卡。
- **可調加注**：滑桿 + ½ / ¾ / 滿池 / All-in 快捷。
- **紀律指標 + 每手教練覆盤**：追蹤你偏離建議的比例。

## 開發 / 部署

編輯原始檔 `index.src.html`（含 JSX，可直接用瀏覽器開來測），再產出部署用的最佳化 `index.html`：

```bash
npm install          # 安裝 esbuild（及測試用的 react/react-dom）
node build.mjs       # index.src.html → index.html（JSX 預先編譯，去除瀏覽器端 Babel）
```

若更動了牌力評估器邏輯，重算起手牌百分位靜態表：

```bash
node precompute.mjs  # 高次模擬重算 HAND_PCT，寫回 index.src.html
node build.mjs       # 再重建
```

推上 `main` 分支即由 GitHub Pages 部署。**只有 `index.html` 是網站需要的檔案**。

> 個人練習用途，非真錢賭博，建議亦非完整 GTO solver。
