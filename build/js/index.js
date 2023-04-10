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
    console.log('checkUser');
    // console.log(req.body);
    (0, checkUser_1.default)(req.body.token).then((info) => {
        const response = {
            type: 'checkUser',
            data: info,
        };
        res.send(JSON.stringify(response));
    });
});
app.post('/getAllUsers', (req, res) => {
    console.log('getAllUsers');
    (0, getAllUsers_1.default)().then((users) => {
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
    (0, getRoleInfo_1.default)(req.body.roleId).then((info) => {
        const response = {
            type: 'getRoleInfo',
            data: info,
        };
        res.send(JSON.stringify(response));
    });
});
app.post('/modifyUserRole', (req, res) => {
    console.log('modifyUserRole');
    (0, modifyUserRole_1.default)(req.body).then((info) => {
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
//# sourceMappingURL=index.js.map