# Architecture

## 全体像

```text
銀行・法人カード ─┐
個人立替の手入力 ──┼─> Luvira Finance API ─> 財務DB ─> ダッシュボード
予定固定費 ───────┘                         └> Luvira AI秘書
freee（四半期記帳） ────────────────> 照合・状態管理
```

## 境界

Financeは取引、残高、予算、予測、立替を所有する。Luvira AI秘書はFinanceの許可された情報を読み取り、自然言語で説明する。

## データ区分

- `actual`: 銀行・カード等で確認済みの実績
- `manual`: 手入力した実績
- `planned`: 固定費・税金・給与等の予定
- `reconciled`: freeeとの照合状態

AIの回答には、実績・予定・未照合を明示する。
