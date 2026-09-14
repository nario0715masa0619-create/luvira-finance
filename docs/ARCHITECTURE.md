# Architecture

## 全体像

```text
freee API ──────────┐
個人立替の手入力 ────┼─> Luvira Finance API ─> 財務DB ─> ダッシュボード
予定固定費 ──────────┘                         └> Luvira AI秘書
CSV（予備・移行用） ─────────────────> 取込キュー
```

## 境界

Financeは取引、残高、予算、予測、立替を所有する。freeeは会計データの中心とし、Financeは経営判断用の速報・予測レイヤーとして動作する。Luvira AI秘書はFinanceの許可された情報を読み取り、自然言語で説明する。

## データ区分

- `freee_synced`: freee APIから取得した実績
- `manual`: 手入力した実績
- `planned`: 固定費・税金・給与等の予定
- `csv_imported`: CSVから取り込んだ予備データ
- `reconciled`: freeeの正式取引との照合状態

AIの回答には、実績・予定・未照合を明示する。
