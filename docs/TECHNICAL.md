# Technical notes

## 初期実装

現在の画面MVPは依存関係なしのブラウザアプリ。次の実装ではfreee APIを主経路にする。個人カード・個人口座・現金・予定支払いは手入力、CSVはAPIで取得できない場合の予備・移行用として残す。

## freee連携

OAuth 2.0でfreeeと接続し、事業所を選択したうえで口座明細（`wallet_txns`）、正式取引（`deals`）、口座・勘定科目などのマスタを取得する。Client Secretやアクセストークンは環境変数またはサーバー側の安全な保管領域に置き、リポジトリへ保存しない。

初期接続のAPIサーバーは`server.js`。起動前に`.env.example`を参考に環境変数を設定する。freee DevelopersでOAuthアプリを作成し、リダイレクトURIに`FREEE_REDIRECT_URI`の値を登録する。現状のセッション保存は開発用のメモリ実装であり、本番では暗号化されたDBまたはセッションストアへ置き換える。

提供エンドポイント：

- `GET /auth/freee`：freee認証開始
- `GET /auth/freee/callback`：認証コールバック
- `GET /api/freee/status`：接続状態
- `GET /api/freee/companies`：事業所一覧
- `GET /api/freee/wallet-txns?company_id=...`：口座明細
- `GET /api/freee/deals?company_id=...`：正式取引

取得元と会計状態は別々に保持する。freeeから明細を取得しても、税理士による正式な記帳済みとは限らないため、速報値と正式帳簿を画面上で区別する。

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
