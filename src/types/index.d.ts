type Config = {
  clientId: string;
  scope: string;
  allowRoles: string[];

  /**
   * 操作対象のサーバID
   * @description サーバ名のところ右クリックしたらメニューが出てきて取得できる
   */
  guildId: string;
  /**
   * DiscordのAPIトークン
   * @description Configに無ければ環境変数 NODE_ENV_DISCORD_TOKEN を使用する
   */
  discordToken: string;
  /**
   * 待ち受けポート
   */
  port: number;
};
type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer P> ? P : never;

type WSMessage = WSMessageUser | WSMessageGetAllUsers | WSMessageGetRoleInfo | WSMessageModifyUserRole;

// WebSocket ユーザー情報を取得
type WSMessageUser = {
  type: 'userInfo';
  data: {
    discordUserId: string;
    discordUserName: string;
  };
};

type WSMessageGetAllUsers = {
  type: 'getAllUsers';
  data: any;
};

type WSMessageGetRoleInfo = {
  type: 'getRoleInfo';
  data: {
    roleId: string;
  };
};

type WSMessageModifyUserRole = {
  type: 'modifyUserRole';
  data: {
    roleId: string;
    isAddRole: boolean;
    members: string[];
  };
};
