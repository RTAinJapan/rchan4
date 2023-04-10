"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const express_1 = tslib_1.__importDefault(require("express"));
const ws_1 = tslib_1.__importDefault(require("ws"));
const config_1 = tslib_1.__importDefault(require("config"));
const config = config_1.default.util.toObject(config_1.default);
const getAllUsers_1 = tslib_1.__importDefault(require("./getAllUsers"));
const getRoleInfo_1 = tslib_1.__importDefault(require("./getRoleInfo"));
const modifyUserRole_1 = tslib_1.__importDefault(require("./modifyUserRole"));
const app = (0, express_1.default)();
app.use(express_1.default.static('public'));
const wss = new ws_1.default.Server({ port: config.wsport });
wss.on('listening', (e) => {
    console.log('listen ws:' + config.wsport);
});
// クライアントから接続来た
let connectedList = [];
wss.on('connection', (ws) => {
    // メッセージが来た
    ws.on('message', (message) => {
        wshandle(ws, message);
    });
    ws.send(JSON.stringify({ type: 'status', data: 'connected' }));
});
setInterval(() => {
    const status = {
        users: connectedList.map((item) => item.name),
    };
    const removeTarget = [];
    for (let i = 0; i < connectedList.length; i++) {
        const connected = connectedList[i];
        if (connected.ws.readyState <= 1) {
            connected.ws.send(JSON.stringify(status));
        }
        else {
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
const wshandle = async (ws, message) => {
    try {
        console.log('received: %s', message);
        const data = JSON.parse(message);
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
                const users = await (0, getAllUsers_1.default)();
                const res = {
                    type: 'getAllUsers',
                    data: users,
                };
                ws.send(JSON.stringify(res));
                break;
            }
            case 'getRoleInfo': {
                console.log('getRoleInfo');
                const info = await (0, getRoleInfo_1.default)(data.data.roleId);
                const res = {
                    type: 'getRoleInfo',
                    data: info,
                };
                ws.send(JSON.stringify(res));
                break;
            }
            case 'modifyUserRole': {
                console.log('modifyUserRole');
                const info = await (0, modifyUserRole_1.default)(data.data);
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
    }
    catch (e) {
        ws.send(JSON.stringify({ type: 'status', data: 'invalid data' }));
    }
};
//# sourceMappingURL=index.js.map