"use strict";
const app = getApp();
Page({
    data: {
        userInfo: {},
        canIUse: wx.canIUse("button.open-type.getUserInfo")
    },

    onLoad: function() {
        let th = this;
        // 查看是否授权
        wx.getSetting({
            success: function(res) {
                if (res.authSetting["scope.userInfo"]) {
                    wx.getUserInfo({
                        success: function(res) {
                            // success
                            app.globalData.userInfo = res.userInfo;
                            th.setData({
                                userInfo: res.userInfo,
                                canIUse: false
                            });
                        },
                        complete: function() {
                            wx.navigateTo({
                                url: "connect/connect"
                            });
                        }
                    });
                }
            }
        });
    },
    bindGetUserInfo(e) {
        let th = this;
        wx.getSetting({
            success: res => {
                if (res.authSetting["scope.userInfo"]) {
                    // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
                    wx.getUserInfo({
                        success: res => {
                            // 可以将 res 发送给后台解码出 unionId
                            wx.getUserInfo({
                                success: function(res) {
                                    // success
                                    app.globalData.userInfo = res.userInfo;
                                    th.setData({
                                        userInfo: res.userInfo,
                                        canIUse: false
                                    });
                                }
                            });
                            wx.navigateTo({
                                url: "./connect/connect"
                            });
                            // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
                            // 所以此处加入 callback 以防止这种情况
                            if (app.userInfoReadyCallback) {
                                app.userInfoReadyCallback(res);
                            }
                        }
                    });
                }
            }
        });
    }
});
