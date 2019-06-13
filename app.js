//app.js
const utils = require("./utils/util.js");
App({
    globalData: {
        // serverUrl: "http://127.0.0.1:3000",
        // socket: "http://127.0.0.1:3000",
        serverUrl: "http://www.chfeng.top/v1",
        socket: "http://www.chfeng.top",
        userInfo: null,
        userData: null,
        appData: null,
        code: null,
        token: null,
        id: null,
        password: null,
        rooms: null,
        deviceList: null,
        group: null,
        messages: null,
        desired: null,
        appid: "wx6c8305cda951f17a",
        appSecret: "570a62dd7848629d2c6e49bacea97682",
        history: [], //语音历史记录
        order: [
            {
                img: "asd",
                order: {
                    one: "one",
                    one: "one",
                    one: "one"
                }
            },
            {
                img: "asd",
                order: {
                    two: "two",
                    two: "two",
                    two: "two"
                }
            },
            {
                img: "asd",
                order: {
                    three: "three",
                    three: "three",
                    three: "three"
                }
            }
        ]
    },
    onLaunch: function() {
        console.log("小程序开始");
    },
    // 获取用户信息
    getUserInfo: function() {
        console.log("开始获取用户信息(app.js->getUserInfo)");
        wx.getSetting({
            success: res => {
                if (res.authSetting["scope.userInfo"]) {
                    console.log("用户信息已授权");
                    // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
                    wx.getUserInfo({
                        success: res => {
                            console.log("getUserInfo接口返回值：");
                            console.log(res);
                            // 可以将 res 发送给后台解码出 unionId
                            this.globalData.userData = res.userInfo;

                            // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
                            // 所以此处加入 callback 以防止这种情况
                            if (this.userInfoReadyCallback) {
                                this.userInfoReadyCallback(res);
                            }
                        }
                    });
                } else {
                    console.log("用户信息未授权，需重新获取授权");
                }
            }
        });
    },
    getRecordAuth: function() {
        wx.getSetting({
            success(res) {
                console.log("获取设置成功");
                console.log(res);
                if (!res.authSetting["scope.record"]) {
                    wx.authorize({
                        scope: "scope.record",
                        success() {
                            // 用户已经同意小程序使用录音功能，后续调用 wx.startRecord 接口不会弹窗询问
                            console.log("授权成功");
                        },
                        fail() {
                            console.log("授权失败");
                        }
                    });
                } else {
                    console.log("录音已经授权");
                }
            },
            fail(res) {
                console.log("fail");
                console.log(res);
            }
        });
    },
    onHide: function() {
        wx.stopBackgroundAudio();
    }
});
