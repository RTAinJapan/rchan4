import Discord from 'discord.js';
import configModule from 'config';
const config: Config = configModule.util.toObject(configModule);

const main = async () => {
  try {
    //  Discordのトークン取得
    const token = config.discordToken ? config.discordToken : process.env.NODE_ENV_DISCORD_TOKEN;
    if (!token) throw new Error('Discord認証トークンが指定されていません。');

    // Discordログイン
    /** DiscordのClientオブジェクト */
    const client = new Discord.Client({
      intents: [Discord.GatewayIntentBits.Guilds, Discord.GatewayIntentBits.GuildMembers],
    });
    await client.login(token);
    if (!client.user) throw new Error('ログインに失敗しました。');

    // 何か裏でいろいろしてるので準備完了を待つ
    await (async () => {
      return new Promise<void>((resolve, reject) => {
        client.once('ready', () => {
          console.log('Ready!');
          resolve();
        });
      });
    })();

    // 操作対象のサーバ取得
    const guild = await client.guilds.fetch(config.guildId);
    if (!guild) throw new Error('操作対象のサーバ情報を取得できません。');
    console.log(`サーバ名: ${guild.name}`);

    // オフライン勢も含めてサーバの全メンバーを取得する
    await guild.members.fetch();
    const guildFullMembers = guild.members.cache;

    // 全メンバーを確認
    console.log('メンバーを出力');
    let list = `"名前","ID"\n`;
    for (const member of guildFullMembers) {
      const line = `"${member[1].user.tag.replace(/"/g, '""')}","${member[1].user.id}"`;
      list += `${line}\n`;
    }

    // ログアウト
    client.destroy();

    return list;
  } catch (error) {
    console.error('何かエラーがあった');
    console.error(error);
    return [];
  }
};

export default main;
