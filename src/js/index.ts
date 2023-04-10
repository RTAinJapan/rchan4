import express from 'express';

import configModule from 'config';
const config: Config = configModule.util.toObject(configModule);

import checkUser from './checkUser';
import getAllUsers from './getAllUsers';
import getRoleInfo from './getRoleInfo';
import modifyUserRole from './modifyUserRole';

const app = express();
app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
  // staticでpublic配下が送られる
});

app.get('/getLoginUrl', (req, res) => {
  console.log('getLoginUrl');

  const discordState = Math.random() * 100000000;
  const url = `https://discordapp.com/api/oauth2/authorize?response_type=token&client_id=${config.clientId}&state=${discordState}&scope=${config.scope}`;
  res.send(JSON.stringify({ url }));
});

app.post('/checkUser', (req, res) => {
  checkUserInner(req, res);
});

app.post('/getAllUsers', (req, res) => {
  getAllUsersInner(req, res);
});

app.post('/getRoleInfo', (req, res) => {
  getRoleInfoInner(req, res);
});

app.post('/modifyUserRole', (req, res) => {
  modifyUserRoleInner(req, res);
});

app.listen(config.port, () => {
  console.log(`Start server. port: ${config.port}`);
});

let tokenList: {
  token: string;
  expire: number;
  result: PromiseType<ReturnType<typeof checkUser>>;
}[] = [];

const checkUserInnerInner = async (req): ReturnType<typeof checkUser> => {
  const authHeader = req.get('Authorization');

  const exist = tokenList.find((item) => item.token === authHeader);
  if (!exist) {
    //
  } else if (exist.expire < new Date().getTime()) {
    // 期限切れ
    tokenList = tokenList.filter((item) => item.token === authHeader);
  } else if (exist.expire > new Date().getTime()) {
    console.log('キャッシュ再利用');
    return exist.result;
  }

  console.log('所属チェック');
  const info = await checkUser(authHeader);
  const date = new Date();
  date.setDate(date.getDate() + 1);
  tokenList.push({
    token: authHeader,
    expire: date.getTime(),
    result: info,
  });
  return info;
};

const checkUserInner = async (req, res) => {
  console.log('checkUser');

  const info = await checkUserInnerInner(req);
  const response = {
    type: 'checkUser',
    data: info,
  };
  res.send(JSON.stringify(response));
};

const getAllUsersInner = async (req, res) => {
  console.log('getAllUsers');
  try {
    if ((await checkUserInnerInner(req)).status !== 'ok') {
      throw new Error('認証エラー');
    }

    const users = await getAllUsers();
    const response = {
      type: 'getAllUsers',
      data: users,
    };
    res.send(JSON.stringify(response));
  } catch (e) {
    console.error(e);
    res.status(500).send(
      JSON.stringify({
        type: 'getAllUsers',
        data: [],
      })
    );
  }
};

const getRoleInfoInner = async (req, res) => {
  console.log('getRoleInfo');
  try {
    if ((await checkUserInnerInner(req)).status !== 'ok') {
      throw new Error('認証エラー');
    }

    console.log(req.body);

    const info = await getRoleInfo(req.body.roleId);
    const response = {
      type: 'getRoleInfo',
      data: info,
    };
    res.send(JSON.stringify(response));
  } catch (e) {
    console.error(e);
    res.status(500).send(
      JSON.stringify({
        type: 'getAllUsers',
        data: [],
      })
    );
  }
};

const modifyUserRoleInner = async (req, res) => {
  console.log('modifyUserRole');
  try {
    if ((await checkUserInnerInner(req)).status !== 'ok') {
      throw new Error('認証エラー');
    }

    const info = await modifyUserRole(req.body);
    const response = {
      type: 'modifyUserRole',
      data: info,
    };
    res.send(JSON.stringify(response));
  } catch (e) {
    console.error(e);
    res.status(500).send(
      JSON.stringify({
        type: 'getAllUsers',
        data: [],
      })
    );
  }
};
