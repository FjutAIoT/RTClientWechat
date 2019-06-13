"use strict";
const app = getApp();
Page({
    data: {
        userData: {
            groupData: {
                groupName: "",
                region: [
                    // http://118.24.169.3/v1/api/user/getCityInfo?adcode=140000
                    { adcode: "110000", name: "北京市" },
                    // http://118.24.169.3/v1/api/user/getDistrictInfo?adcode=140400
                    { adcode: "110100", name: "北京市" },
                    { adcode: "110101", name: "东城区" }
                ]
            },
            userData: {
                avatar: "",
                birthday: "2019-01-01",
                sex: "男"
            }
        },
        userInfo: {
            nickName: "",
            userID: ""
        },
        familyInfo: {
            familyName: "",
            familyId: ""
        },
        man: true,
        woman: false,
        date: "2019-01-01",
        index: 0,
        region: ["北京市", "北京市", "东城区"],
        page: 1,
        groupInfo: null
    },
    onLoad: function() {
        this.setData({
            userInfo: app.globalData.userInfo
        });
    },
    onShow: function() {
        let family = this.data.familyInfo;
        family.familyName = this.data.userInfo.nickName + "的家";
    },
    //  点击日期组件确定事件
    bindDateChange: function(e) {
        let user = this.data.userData;
        user.userData.birthday = e.detail.value;
        this.setData({
            date: e.detail.value,
            userData: user
        });
    },
    sexChange: function(e) {
        let sex = e.currentTarget.dataset.sex;
        console.log(sex);
        let user = this.data.userData;
        user.userData.sex = sex;
        if (sex == "男") {
            this.setData({
                man: true,
                woman: false,
                userData: user
            });
        } else {
            this.setData({
                man: false,
                woman: true,
                userData: user
            });
        }
    },
    bindChange: function(e) {
        let user = this.data.userData;
        user.groupData.region[0].name = e.detail.value[0];
        user.groupData.region[1].name = e.detail.value[1];
        user.groupData.region[2].name = e.detail.value[2];
        user.groupData.region[0].adcode = e.detail.code[0];
        user.groupData.region[1].adcode = e.detail.code[1];
        user.groupData.region[2].adcode = e.detail.code[2];
        this.setData({
            region: e.detail.value,
            userData: user
        });
    },
    bindFamilyName: function(e) {
        let user = this.data.userData;
        let family = this.data.familyInfo;
        user.groupData.groupName = e.detail.value;
        family.familyName = e.detail.value;
        this.setData({
            userData: user,
            familyInfo: family
        });
    },
    holdup: function() {
        let th = this;
        let reqData = th.data.userData;
        wx.request({
            url: app.globalData.serverUrl + "/api/user/perfectInformation",
            data: reqData,
            method: "POST",
            header: {
                Authorization: "Bearer " + app.globalData.token
            },
            success: function(res) {
                // success
                console.log(res);
                app.globalData.token = res.data.response.token;
                app.globalData.userInfo = res.data.response.userInfo;
                app.globalData.rooms = res.data.response.rooms;
                app.globalData.group = res.data.response.groupInfo;
                th.setData({
                    page: 2,
                    groupInfo: res.data.response.groupInfo
                });
            },
            fail: function(err) {
                // fail
                console.log(err);
            },
            complete: function() {
                // complete
            }
        });
    },
    toIndex: function() {
        wx.switchTab({
            url: "/pages/index/index"
        });
    }
});
