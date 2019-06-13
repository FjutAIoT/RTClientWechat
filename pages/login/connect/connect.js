"use strict";

const app = getApp();
Page({
    data: {
        id: null,
        password: null
    },
    onLoad: function(e) {
        let userName = wx.getStorageSync("userId");
        let userPassword = wx.getStorageSync("passWord");
        let token = wx.getStorageSync("token");
        if (userName) {
            this.setData({ id: userName });
        }
        if (userPassword) {
            this.setData({ password: userPassword });
        }
        if (token) {
            this.autoLogin();
        }
    },
    onShow() {
        this.setData({
            id: app.globalData.id,
            password: app.globalData.password
        });
    },
    autoLogin: function() {
        let th = this;
        wx.login({
            success: function(res) {
                wx.request({
                    url:
                        app.globalData.serverUrl +
                        "/api/user/weChatSignIn?code=" +
                        res.code,
                    method: "GET",
                    success: function(res1) {
                        // success
                        if (res1.data.response.ok == false) {
                            if (th.complete.data.id && th.data.password) {
                                th.connect();
                            }
                        } else {
                            app.globalData.token = res1.data.response.token;
                            app.globalData.userInfo =
                                res1.data.response.userInfo;
                            wx.setStorageSync(
                                "token",
                                res1.data.response.token
                            );
                            wx.switchTab({
                                url: "/pages/index/index"
                            });
                            return true;
                        }
                    },
                    fail: function(err) {
                        // fail
                        console.log(err);
                    },
                    complete: function() {}
                });
            }
        });
    },
    connect: function(e) {
        let th = this;
        let username = e.detail.value.username;
        let psd = e.detail.value.password;
        if (!username) {
            wx.showModal({
                title: "提示",
                content: "请输入账号",
                showCancel: false,
                success(res) {
                    if (res.confirm) {
                        console.log("用户点击确定");
                    } else if (res.cancel) {
                        console.log("用户点击取消");
                    }
                }
            });
            return false;
        }
        if (!psd) {
            wx.showModal({
                title: "提示",
                content: "请输入密码",
                showCancel: false,
                success(res) {
                    if (res.confirm) {
                        console.log("用户点击确定");
                    } else if (res.cancel) {
                        console.log("用户点击取消");
                    }
                }
            });
            return false;
        }
        wx.setStorage({
            key: "userId",
            data: username
        });
        wx.setStorage({
            key: "passWord",
            data: psd
        });
        wx.login({
            success: function(res) {
                // success
                wx.request({
                    url: app.globalData.serverUrl + "/api/user/weChatAuthorize",
                    data: {
                        code: res.code,
                        id: username,
                        password: psd,
                        type: "email"
                    },
                    method: "POST",
                    success: function(res1) {
                        // success
                        if (res1.data.message === "账号未注册") {
                            wx.showModal({
                                title: "提示",
                                content: "账号未注册",
                                showCancel: false,
                                success(res) {
                                    if (res.confirm) {
                                        console.log("用户点击确定");
                                    } else if (res.cancel) {
                                        console.log("用户点击取消");
                                    }
                                }
                            });
                            return false;
                        } else if (res1.data.message === "账号已授权") {
                            th.autoLogin();
                        } else {
                            app.globalData.token = res1.data.response.token;
                            wx.setStorageSync(
                                "token",
                                res1.data.response.token
                            );
                            app.globalData.userInfo =
                                res1.data.response.userInfo;
                            wx.setStorage({
                                key: "token",
                                data: res1.data.response.token
                            });
                            console.log("登录成功！");
                            wx.switchTab({
                                url: "/pages/index/index"
                            });
                        }
                    },
                    fail: function(err) {
                        // fail
                        console.log(err);
                        wx.showModal({
                            title: "提示",
                            content: err,
                            showCancel: false,
                            success(res) {
                                if (res.confirm) {
                                    console.log("用户点击确定");
                                } else if (res.cancel) {
                                    console.log("用户点击取消");
                                }
                            }
                        });
                        return false;
                    }
                });
            }
        });
    },
    toRegister: function() {
        wx.navigateTo({
            url: "../register/register"
        });
    }
});
