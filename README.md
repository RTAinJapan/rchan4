# Rちゃん4号

どこかのサーバの誰かに何かの権限を付与する。
要Node.js

## 下準備 1

Discord botをサーバに登録
(v12 から？bot の token じゃないとログインに失敗するようになった)

- see: https://www.reddit.com/r/Discord_Bots/comments/7ttd58/get_missing_permissions_when_trying_to_add_a_role/dtf3ouh?utm_source=share&utm_medium=web2x&context=3

## 下準備 2

- Discordアプリケーションをサーバに登録
  - https://discord.com/developers/applications
- OAuth2で、Redirectsを設定
  - デプロイ先にあわせる
  - 例： `http://localhost/login/discord/index.html`
  - 例:  `http://example.com/login/discord/index.html`
- OAuth2で、CLIENT IDを確認

## 下準備 3 パッケージインストール
- yarn入れてない人はnpm install

```shell
yarn
```

## 下準備 4 設定ファイル作る

`config/default.json`に以下を適宜設定

```json
{
  "clientId": "Discord ApplicationのOAuth2のClient ID",
  "scope": "guilds.members.read%20guilds%20identify",
  "allowRoles": ["操作を許可するロールのID"],
  "guildId": "操作対象のサーバID",
  "discordToken": "Discord botの認証トークン。Configに無ければ環境変数 NODE_ENV_DISCORD_TOKEN を使用する",
  "port": 待ち受けポート番号
}
```

## サーバー側実行

```
yarn start
```

あとはブラウザからアクセスする

## Todo
- ユーザーのトークン使うんだし、ユーザーのトークンで権限つけ外しできるんじゃね
