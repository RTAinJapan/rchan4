# Rちゃん4号

どこかのサーバの誰かに何かの権限を付与する。
要Node.js

## 下準備 1

- Discordアプリケーションを作成
  - https://discord.com/developers/applications
- OAuth2タブを開いて以下を実施
  - Redirectsを設定
    - デプロイ先にあわせる
    - 例： `http://localhost/login/discord/index.html`
    - 例： `http://example.com/login/discord/index.html`
  - CLIENT IDをメモする
- Botタブを開いて以下を実施
  - Build-A-Botで「Add Bot」をクリックしてBot作成
  - TOKENを生成してメモする
  - `SERVER MEMBERS INTENT` をオンにする
- Discord botをサーバに登録
  - OAuth2 -> URL Generatorで以下をチェック
    - bot
    - Manage Roles
  - 生成されたURLでアクセスし、操作対象のサーバに招待する
  - Discordのサーバ設定で、追加されたbotのロールを、なるべく上の方に移動する
    - botより上の位置に存在するロールは、botがいじれないため

## 下準備 2 パッケージインストール

```shell
npm install
```

## 下準備 3 設定ファイル作る

- 環境変数に以下を設定

```
DISCORD_CLIENT_ID=Discord ApplicationのOAuth2のClient ID
DISCORD_SCOPE=guilds.members.read%20guilds%20identify
DISCORD_ALLOW_ROLES=操作を許可するロールのID。複数ある場合はカンマ区切り
DISCORD_GUILD_ID=操作対象のサーバID
DISCORD_TOKEN=Discord botの認証トークン
PORT=待ち受けポート番号
```

## ビルド

- ソースのビルド

```shell
npm run build
```

## 実行

- 起動したらあとはブラウザからアクセスする

```shell
npm run start
```

### docker composeで起動

```shell
docker compose up
```
