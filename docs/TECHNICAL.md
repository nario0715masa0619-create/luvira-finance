# Technical notes

## 初期実装

現在のMVPは依存関係なしのブラウザアプリ。データはブラウザの`localStorage`に保存する。銀行・法人カードはCSV取込、個人カード・個人口座・現金は手入力に対応する。

## CSV形式

```csv
date,description,amount,category,source
2026-09-01,Office rent,100000,家賃,会社口座
```

## 次の実装

- サーバーDBとユーザー認証
- 会社単位のデータ分離
- API／SFTP等による明細自動取得
- 定期支払いの発生日・終了日
- 予算と資金繰り予測
- 監査ログ・暗号化バックアップ
- freee照合状態のインポート
