"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const express_1 = tslib_1.__importDefault(require("express"));
const config_1 = tslib_1.__importDefault(require("config"));
const config = config_1.default.util.toObject(config_1.default);
const checkUser_1 = tslib_1.__importDefault(require("./checkUser"));
const getAllUsers_1 = tslib_1.__importDefault(require("./getAllUsers"));
const getRoleInfo_1 = tslib_1.__importDefault(require("./getRoleInfo"));
const modifyUserRole_1 = tslib_1.__importDefault(require("./modifyUserRole"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.static('public'));
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
let tokenList = [];
const checkUserInnerInner = async (req) => {
    const authHeader = req.get('Authorization');
    const exist = tokenList.find((item) => item.token === authHeader);
    if (!exist) {
        //
    }
    else if (exist.expire < new Date().getTime()) {
        // 期限切れ
        tokenList = tokenList.filter((item) => item.token === authHeader);
    }
    else if (exist.expire > new Date().getTime()) {
        console.log('キャッシュ再利用');
        return exist.result;
    }
    console.log('所属チェック');
    const info = await (0, checkUser_1.default)(authHeader);
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
        const users = await (0, getAllUsers_1.default)();
        const response = {
            type: 'getAllUsers',
            data: users,
        };
        res.send(JSON.stringify(response));
    }
    catch (e) {
        console.error(e);
        res.status(500).send(JSON.stringify({
            type: 'getAllUsers',
            data: [],
        }));
    }
};
const getRoleInfoInner = async (req, res) => {
    console.log('getRoleInfo');
    try {
        if ((await checkUserInnerInner(req)).status !== 'ok') {
            throw new Error('認証エラー');
        }
        console.log(req.body);
        const info = await (0, getRoleInfo_1.default)(req.body.roleId);
        const response = {
            type: 'getRoleInfo',
            data: info,
        };
        res.send(JSON.stringify(response));
    }
    catch (e) {
        console.error(e);
        res.status(500).send(JSON.stringify({
            type: 'getAllUsers',
            data: [],
        }));
    }
};
const modifyUserRoleInner = async (req, res) => {
    console.log('modifyUserRole');
    try {
        if ((await checkUserInnerInner(req)).status !== 'ok') {
            throw new Error('認証エラー');
        }
        const info = await (0, modifyUserRole_1.default)(req.body);
        const response = {
            type: 'modifyUserRole',
            data: info,
        };
        res.send(JSON.stringify(response));
    }
    catch (e) {
        console.error(e);
        res.status(500).send(JSON.stringify({
            type: 'getAllUsers',
            data: [],
        }));
    }
};
//# sourceMappingURL=index.js.map