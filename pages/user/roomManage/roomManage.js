const app = getApp();
Page({
    data: {
        familyInfo: null,
        rooms: null,
        visible: false,
        roomNum: 0,
        address: null,
        findId: null,
        findFamily: null
    },
    onLoad: function() {
        this.getFamily();
    },
    getFamily: function() {
        let family = app.globalData.group;
        let room = app.globalData.rooms;
        let address = "";
        for (let i in family.region) {
            address += family.region[i].name + " ";
        }
        if (room) {
            let num = room.length;
            this.setData({
                roomNum: num
            });
        }
        this.setData({
            familyInfo: family,
            rooms: room,
            address: address
        });
    },
    exitGroup: function() {
        let id = this.data.familyInfo.groupId;
        wx.request({
            url: app.globalData.serverUrl + "//api/group/unGroup?groupId=" + id,
            method: "GET",
            header: {
                "content-type": "application/json;charset=utf-8",
                Authorization: "Bearer " + app.globalData.token
            }, // 设置请求的 header
            success: function(res) {
                // success
            },
            fail: function() {
                // fail
            },
            complete: function() {
                // complete
            }
        });
    },
    setfindId: function(e) {
        let findId = e.detail.value;
        this.setData({
            findId: findId
        });
    },
    getGroup: function() {
        let th = this;
        let id = this.data.findId;
        wx.request({
            url:
                app.globalData.serverUrl +
                "/aip/group/getGroupInfo?groupId=" +
                id,
            method: "GET",
            header: {
                "content-type": "application/json;charset=utf-8",
                Authorization: "Bearer " + app.globalData.token
            }, // 设置请求的 header
            success: function(res) {
                // success
                console.log(res);
                th.complete.setData({
                    findFamily: res.data.response
                });
            },
            fail: function() {
                // fail
            },
            complete: function() {
                // complete
            }
        });
    },
    jion: function() {
        this.setData({
            visible: true
        });
    },
    cancel: function() {
        this.setData({
            visible: false
        });
    },
    joinGroup: function() {
        let reqData = {
            groupId: this.data.findFamily.groupId,
            userId: this.data.familyInfo.ownerId
        };
        wx.request({
            url: app.globalData.serverUrl + "/api/group/applyMembershipMsg",
            data: reqData,
            method: "POST",
            header: {
                "content-type": "application/json;charset=utf-8",
                Authorization: "Bearer " + app.globalData.token
            }, // 设置请求的 header
            success: function(res) {
                // success
                console.log(res);
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
