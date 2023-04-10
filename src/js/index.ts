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
  console.log('checkUser');
  // console.log(req.body);

  checkUser(req.body.token).then((info) => {
    const response = {
      type: 'checkUser',
      data: info,
    };
    res.send(JSON.stringify(response));
  });
});

app.post('/getAllUsers', (req, res) => {
  console.log('getAllUsers');

  getAllUsers().then((users) => {
    const response = {
      type: 'getAllUsers',
      data: users,
    };
    res.send(JSON.stringify(response));
  });
});

app.post('/getRoleInfo', (req, res) => {
  console.log('getRoleInfo');
  console.log(req.body);

  getRoleInfo(req.body.roleId).then((info) => {
    const response = {
      type: 'getRoleInfo',
      data: info,
    };
    res.send(JSON.stringify(response));
  });
});

app.post('/modifyUserRole', (req, res) => {
  console.log('modifyUserRole');

  modifyUserRole(req.body).then((info) => {
    const response = {
      type: 'modifyUserRole',
      data: info,
    };
    res.send(JSON.stringify(response));
  });
});

app.listen(config.port, () => {
  console.log(`Start server. port: ${config.port}`);
});
