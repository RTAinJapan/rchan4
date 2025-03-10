import Discord from 'discord.js';
import config from './config';

const main = async (data: { roleId: string; isAddRole: boolean; members: string[] }) => {
  try {
    const members = data.members;
    if (members.length === 0) throw new Error('権限付与対象のメンバーが指定されていません。');

    // Discordログイン
    /** DiscordのClientオブジェクト */
    const client = new Discord.Client({
      intents: [Discord.GatewayIntentBits.Guilds, Discord.GatewayIntentBits.GuildMembers],
    });
    await client.login(config.discordToken);
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

    // 付与対象に絞り込み
    const targetMember = guildFullMembers.filter((member) => {
      return members.includes(member.id);
    });

    // 操作対象として指定されているのにサーバにいない人をチェック
    const missingUsers: string[] = [];
    for (const member of members) {
      if (member && !targetMember.get(member)) {
        missingUsers.push(member);
        console.warn(`サーバにいない： ${member}`);
      }
    }

    // 付与する権限の表示名を取得
    const role = guild.roles.cache.get(data.roleId);
    if (!role) throw new Error('操作対象のサーバに指定した権限が存在しません。');
    const roleName = role.name;

    // 付与する権限に既に割り当てられてる人
    console.log('既に割り当てられてる人');
    for (const member of role.members) {
      console.log(`"${member[1].user.id}", "${member[1].user.tag}"`);
    }
    console.log('=============================');

    // リストに合致したメンバーに権限付与
    const mangementType = data.isAddRole ? '追加' : '削除';
    console.log(`以下のメンバーについて ${roleName} の権限${mangementType}`);

    const execLog: string[] = [];
    for (const member of targetMember) {
      console.log(`"${member[1].id}", "${member[1].user.tag}"`);
      execLog.push(`${member[1].id}, ${member[1].user.tag}`);
      if (data.isAddRole) {
        await member[1].roles.add(role);
      } else {
        await member[1].roles.remove(role);
      }
    }

    // ログアウト
    client.destroy();

    if (missingUsers.length > 0) {
      return {
        result: 'partial',
        message: '一部のユーザがいない',
        detail: missingUsers,
      };
    }

    return {
      result: 'ok',
      message: `${roleName}の権限${mangementType}`,
      detail: execLog,
    };
  } catch (error) {
    console.error('何かエラーがあった');
    console.error(error);
    return {
      result: 'ng',
      detail: error,
    };
  }
};

export default main;
