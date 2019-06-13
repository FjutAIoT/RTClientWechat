"use strict";
const app = getApp();
Page({
    data: {
        userInfo: null,
        userData: null,
        isLastCell: 1,
        imgUrl: null,
        deviceNum: 0
    },
    onLoad: function() {
        let list = app.globalData.deviceList;
        if (list) {
            let num = list.length;
            this.setData({
                deviceNum: num
            });
        }
        this.getUser();
    },
    getUser: function() {
        let user = app.globalData.userInfo;
        this.setData({
            userData: user
        });
    },
    voice: function() {
        wx.navigateTo({
            url: "../voice/voice"
        });
    },
    message: function() {
        wx.navigateTo({
            url: "message/message"
        });
    }
});
