"use strict";
const app = getApp();
Page({
    data: {
        email: null,
        nickname: null,
        password: null,
        Vcode: null
    },
    onLoad: function() {},
    register: function(e) {
        let username = e.detail.value.nickname;
        let psd = e.detail.value.password;
        if (!username) {
            wx.showModal({
                title: "提示",
                content: "账号不能为空",
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
                content: "密码不能为空",
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
        if (psd.length < 6 || psd.length > 16) {
            wx.showModal({
                title: "提示",
                content: "密码位数限制为6-16位",
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
        let reqdata = {
            code: this.data.Vcode,
            resCode: app.globalData.code,
            id: this.data.email,
            nickName: this.data.nickname,
            password: this.data.password,
            type: "email"
        };
        wx.request({
            url: app.globalData.serverUrl + "/api/user/signUp",
            data: reqdata,
            method: "POST",
            success: function(res) {
                // success
                wx.showToast({
                    title: "注册成功",
                    icon: "success",
                    duration: 1000
                });
                console.log(res);
                app.globalData.token = res.data.response.token;
                app.globalData.userInfo = res.data.response.userInfo;
                wx.navigateTo({
                    url: "../perfect/perfect"
                });
            },
            fail: function(err) {
                // fail
            },
            complete: function() {
                // complete
            }
        });
        this.saveData();
    },
    saveData: function() {
        wx.setStorage({
            key: "userId",
            data: this.data.email
        });
        wx.setStorage({
            key: "passWord",
            data: this.data.password
        });
    },
    getNickname: function(e) {
        let name = e.detail.value;
        this.setData({
            nickname: name
        });
    },
    getPsd: function(e) {
        let psd = e.detail.value;
        this.setData({
            password: psd
        });
    },
    getEmail: function(e) {
        let email = e.detail.value;
        this.setData({
            email: email
        });
    },
    getVerCode: function(e) {
        let code = e.detail.value;
        this.setData({
            Vcode: code
        });
    },
    getVcode: function(e) {
        let id = this.data.email;
        if (id) {
            wx.request({
                url: app.globalData.serverUrl + "/api/user/sendCode",
                data: {
                    id: id,
                    type: "email"
                },
                method: "POST",
                success: function(res) {
                    // success
                    console.log(res);
                    if (res.data.message == "邮箱已被注册") {
                        wx.showToast({
                            title: "邮箱已被注册",
                            icon: "none",
                            duration: 1000
                        });
                    } else if (res.data.response == "ok") {
                        wx.showToast({
                            title: "已发送",
                            icon: "success",
                            duration: 1000
                        });
                    }
                },
                fail: function(err) {
                    console.log(err);
                    // fail
                },
                complete: function() {
                    // complete
                }
            });
        } else {
            wx.showModal({
                title: "提示",
                content: "邮箱不能为空",
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
    }
});
