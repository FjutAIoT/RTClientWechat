const app = getApp();
const socket = require("../../index/index");
Page({
    data: { userInfo: null },
    onLoad: function() {
        let user = app.globalData.userInfo;
        user.email = wx.getStorageSync("userId");
        this.setData({
            userInfo: user
        });
    },
    exit: function() {
        wx.clearStorageSync("token");
        wx.request({
            url: app.globalData.serverUrl + "/api/user/signOut",
            method: "GET",
            header: {
                "content-type": "application/json;charset=utf-8",
                Authorization: "Bearer " + app.globalData.token
            }, // 设置请求的 header
            success: function(res) {
                // success

                wx.closeSocket();
                app.globalData.token = null;
                wx.redirectTo({
                    url: "../../login/connect/connect"
                });
            },
            fail: function() {
                // fail
            },
            complete: function() {
                // complete
            }
        });
    }
});
