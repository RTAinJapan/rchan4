import express from 'express';
import WebSocket from 'ws';

import configModule from 'config';
const config: Config = configModule.util.toObject(configModule);

import getAllUsers from './getAllUsers';
import getRoleInfo from './getRoleInfo';
import modifyUserRole from './modifyUserRole';

const app = express();
app.use(express.static('public'));

const wss = new WebSocket.Server({ port: config.wsport });
wss.on('listening', (e) => {
  console.log('listen ws:' + config.wsport);
});

// クライアントから接続来た
let connectedList: {
  id: string;
  userId: string;
  name: string;
  ws: WebSocket.WebSocket;
}[] = [];

wss.on('connection', (ws: WebSocket.WebSocket) => {
  // メッセージが来た
  ws.on('message', (message: string) => {
    wshandle(ws, message);
  });

  ws.send(JSON.stringify({ type: 'status', data: 'connected' }));
});

setInterval(() => {
  const status = {
    users: connectedList.map((item) => item.name),
  };

  const removeTarget: number[] = [];
  for (let i = 0; i < connectedList.length; i++) {
    const connected = connectedList[i];

    if (connected.ws.readyState <= 1) {
      connected.ws.send(JSON.stringify(status));
    } else {
      // 接続切れた
      connected.ws.close();
      removeTarget.push(i);
    }
  }
  connectedList = connectedList.filter((item, i) => !removeTarget.includes(i));
}, 5000);

app.get('/', function (req, res) {
  // staticでpublic配下は送られる
});

app.listen(config.port, () => {
  console.log(`Start server. port: ${config.port}`);
});

/** メッセージ受信処理 */
const wshandle = async (ws: WebSocket.WebSocket, message: string) => {
  try {
    console.log('received: %s', message);

    const data: WSMessage = JSON.parse(message);
    console.log(data);
    switch (data.type) {
      case 'userInfo': {
        console.log('userInfo');
        connectedList.push({
          id: new Date().getTime().toString(),
          userId: data.data.discordUserId,
          name: data.data.discordUserName,
          ws: ws,
        });
        break;
      }
      case 'getAllUsers': {
        console.log('getAllUsers');
        const users = await getAllUsers();
        const res = {
          type: 'getAllUsers',
          data: users,
        };
        ws.send(JSON.stringify(res));
        break;
      }
      case 'getRoleInfo': {
        console.log('getRoleInfo');
        const info = await getRoleInfo(data.data.roleId);
        const res = {
          type: 'getRoleInfo',
          data: info,
        };
        ws.send(JSON.stringify(res));

        break;
      }
      case 'modifyUserRole': {
        console.log('modifyUserRole');
        const info = await modifyUserRole(data.data);
        const res = {
          type: 'modifyUserRole',
          data: info,
        };
        ws.send(JSON.stringify(res));

        break;
      }
      default: {
        ws.send(JSON.stringify({ type: 'status', data: 'invalid data' }));
        break;
      }
    }
  } catch (e) {
    ws.send(JSON.stringify({ type: 'status', data: 'invalid data' }));
  }
};
