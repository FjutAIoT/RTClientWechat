"use strict";
const app = getApp();
Page({
    data: {
        current: "tab1",
        modes: null,
        associates: null,
        addMode: false,
        addAssociate: false,
        modeName: "情景模式",
        range: ["不定时", "执行一次", "每周一次"],
        index: 0,
        modeType: 0,
        modeDate: "2019-06-05",
        modeTime: "00:00",
        dayIndex: 0,
        days: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"],
        modeDay: "周一",
        associateName: null,
        associateId: null,
        selectAssociateId: null,
        associateIndex: 0,
        associateNames: "",
        deviceList: null,
        selectDevice: null,
        associateAttr: null,
        attrIndex: 0,
        selectAttr: null,
        attrKey: null,
        addAssociateDevice: false,
        addModeDevice: false,
        modeDeviceTime: {
            mintue: 0,
            second: 0
        },
        modeDeviceSwitch: false,
        modeId: null
    },
    onLoad: function() {
        this.getDevice();
        this.getMode();
        this.getAssociate();
    },
    onShow: function() {
        this.getMode();
        this.getAssociate();
    },
    handleChange({ detail }) {
        this.setData({
            current: detail.key
        });
    },
    addA: function() {
        this.setData({
            addAssociate: true
        });
    },
    getAssociate: function() {
        let th = this;
        wx.request({
            url: app.globalData.serverUrl + "/api/device/deviceAssociate",
            method: "GET",
            header: {
                Authorization: "Bearer " + app.globalData.token
            },
            success: function(res) {
                // success
                let devicelist = app.globalData.deviceList;
                let associate = res.data.response;
                for (let i in devicelist) {
                    for (let j in associate) {
                        if (associate[j].condition != null) {
                            if (
                                associate[j].condition.deviceId ==
                                devicelist[i].device.deviceId
                            ) {
                                associate[j].conditionDevice = devicelist[i];
                            }
                        }
                        if (associate[j].expect != null) {
                            if (
                                associate[j].expect.deviceId ==
                                devicelist[i].device.deviceId
                            ) {
                                associate[j].expectDevice = devicelist[i];
                            }
                        }
                    }
                }
                th.setData({
                    associates: associate
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
    changeAssociateName: function(e) {
        this.setData({
            associateName: e.detail.value
        });
    },
    deviceChange: function(e) {
        this.setData({
            associateIndex: e.detail.value,
            selectDevice: this.data.deviceList[e.detail.value]
        });
    },
    setLuminance: function(e) {
        let device = this.data.selectDevice;
        device.status.luminance = e.detail.value;
        this.setData({
            selectDevice: device
        });
    },
    setSwitch: function(e) {
        let device = this.data.selectDevice;
        device.status.switch = e.detail.value;
        this.setData({
            selectDevice: device,
            modeDeviceSwitch: e.detail.value
        });
    },
    getDevice: function() {
        let devices = app.globalData.deviceList;
        let name = [];
        let id = [];
        let status = [];
        for (let i in devices) {
            if (devices[i].device.categoryId != "sensor") {
                name[i] = devices[i].device.name;
                id[i] = devices[i].device.deviceId;
                status[i] = devices[i].status;
            }
        }
        this.setData({
            associateNames: name,
            associateId: id,
            selectDevice: devices[0],
            associateAttr: status,
            deviceList: app.globalData.deviceList
        });
    },
    addAssociateDevice: function(e) {
        this.setData({
            addAssociateDevice: true,
            selectAssociateId: e.currentTarget.dataset.id
        });
    },
    addAssociate: function() {
        let th = this;
        let data = {
            name: this.data.associateName, //任务名称
            condition: {
                deviceId: this.data.selectDevice.device.deviceId,
                id: "switch",
                value: this.data.selectDevice.status.switch
            }
        };
        wx.request({
            url: app.globalData.serverUrl + "/api/device/deviceAssociate",
            data: data,
            method: "POST",
            header: {
                Authorization: "Bearer " + app.globalData.token
            },
            success: function(res) {
                // success
                console.log(res);
            },
            fail: function(err) {
                // fail
                console.log(err);
            },
            complete: function() {
                // complete
                th.getAssociate();
                th.setData({
                    addAssociate: false
                });
            }
        });
    },
    addAssociate1: function() {
        let items = this.data.associates;
        let associateName;
        for (let i in items) {
            if (items[i].associateId == this.data.selectAssociateId) {
                associateName = items[i].name;
            }
        }
        console.log(associateName);
        //追加
        let data = {
            name: associateName, //任务名称
            expect: {
                deviceId: this.data.selectDevice.device.deviceId,
                id: "switch",
                value: this.data.selectDevice.status.switch
            },
            associateId: this.data.selectAssociateId,
            type: 2
        };
        let th = this;
        wx.request({
            url: app.globalData.serverUrl + "/api/device/deviceAssociate",
            data: data,
            method: "PUT",
            header: {
                Authorization: "Bearer " + app.globalData.token
            },
            success: function(res) {
                // success
                console.log(res);
            },
            fail: function(err) {
                // fail
                console.log(err);
            },
            complete: function() {
                // complete
                th.exit();
                th.getAssociate();
            }
        });
    },
    changeAssociate: function(e) {
        let th = this;
        let list = this.data.associates;
        let state;
        for (let i in list) {
            if (list[i].associateId == e.currentTarget.dataset.id) {
                state = !list[i].open;
            }
        }
        let data = {
            associateId: e.currentTarget.dataset.id,
            open: state
        };
        wx.request({
            url: app.globalData.serverUrl + "/api/device/open/deviceAssociate",
            data: data,
            method: "PUT",
            header: {
                Authorization: "Bearer " + app.globalData.token
            },
            success: function(res) {
                // success
                console.log(res);
                th.getAssociate();
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
    deleteAssociate: function(e) {
        let th = this;
        let associateId = e.currentTarget.dataset.id;
        console.log(associateId);
        wx.request({
            url:
                app.globalData.serverUrl +
                "/api/device/deviceAssociate?associateId=" +
                associateId,
            method: "DELETE",
            header: {
                Authorization: "Bearer " + app.globalData.token
            },
            success: function(res) {
                // success
                console.log(res);
                th.getAssociate();
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
    // 获取关联信息 api/device/deviceAssociate GET
    // 关联添加
    // api/device/deviceAssociate  POST {"name":"qwe","condition":{"deviceId":"cb6208e65bd8e0cac1cc","id":"switch","value":false}}
    // api/device/deviceAssociate  PUT {"name":"123","expect":{"deviceId":"80b6b5b7f6c4882282fa","id":"switch","value":true},"associateId":"8bc9cd60-8471-11e9-90e0-ab3eb92f372c","type":2}
    // 激活关联
    // api/device/open/deviceAssociate PUT {"associateId":"8bc9cd60-8471-11e9-90e0-ab3eb92f372c","open":true}
    // 删除关联
    // api/device/deviceAssociate?associateId=8bc9cd60-8471-11e9-90e0-ab3eb92f372c  DETELE
    getMode: function() {
        let th = this;
        wx.request({
            url: app.globalData.serverUrl + "/api/device/mode",
            method: "GET",
            header: { Authorization: "Bearer " + app.globalData.token },
            success: function(res) {
                // success
                let mode = res.data.response;
                let devicelist = app.globalData.deviceList;
                let modeTask;
                for (let i in mode) {
                    modeTask = mode[i].modeTasks;
                    for (let j in devicelist) {
                        for (let k in modeTask) {
                            if (
                                devicelist[j].device.deviceId ==
                                modeTask[k].deviceId
                            ) {
                                modeTask[k].device = devicelist[j];
                            }
                        }
                    }
                    mode[i].modeTasks = modeTask;
                    let time = mode[i].time;
                    if (time.length < 1) {
                        mode[i].nowTime = "无";
                        continue;
                    }
                    let d = new Date(time);
                    let times =
                        d.getFullYear() +
                        "-" +
                        (d.getMonth() + 1) +
                        "-" +
                        d.getDate() +
                        " " +
                        d.getHours() +
                        ":" +
                        d.getMinutes() +
                        ":" +
                        d.getSeconds();

                    mode[i].nowTime = times;
                }
                th.setData({
                    modes: mode
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
    addModeDevice1: function(e) {
        this.setData({
            modeId: e.currentTarget.dataset.id,
            addModeDevice: true
        });
    },
    add: function() {
        this.setData({
            addMode: true
        });
    },
    exit: function() {
        this.setData({
            addMode: false,
            addAssociate: false,
            addAssociateDevice: false,
            addModeDevice: false
        });
    },
    changeModeName: function(e) {
        let modeName = e.detail.value;
        this.setData({
            modeName: modeName
        });
    },
    modeChange: function(e) {
        this.setData({
            index: e.detail.value,
            modeType: e.detail.value
        });
    },
    bindDateChange: function(e) {
        this.setData({
            modeDate: e.detail.value
        });
    },
    bindTimeChange: function(e) {
        this.setData({
            modeTime: e.detail.value
        });
    },
    bindDayChange: function(e) {
        this.setData({
            dayIndex: e.detail.value,
            modeDay: e.detail.value
        });
    },
    addMode: function() {
        let data;
        if (this.data.modeType == 0) {
            data = {
                name: this.data.modeName,
                timeType: this.data.modeType,
                time: "",
                date: []
            };
        }
        if (this.data.modeType == 1) {
            data = {
                name: this.data.modeName,
                timeType: this.data.modeType,
                time: "2019-06-12T16:00:00.000Z",
                date: []
            };
        }
        if (this.data.modeType == 2) {
            data = {
                name: this.data.modeName,
                timeType: this.data.modeType,
                time: "2019-06-12T16:00:00.000Z",
                date: [this.data.modeDay]
            };
        }
        let th = this;
        th.setData({
            addMode: false
        });
        wx.request({
            url: app.globalData.serverUrl + "/api/device/mode",
            data: data,
            method: "POST",
            header: { Authorization: "Bearer " + app.globalData.token },
            success: function(res) {
                // success
                console.log(res);
            },
            fail: function(err) {
                // fail
                console.log(err);
            },
            complete: function() {
                // complete
                th.getMode();
            }
        });
    },
    setMintue: function(e) {
        let time = this.data.modeDeviceTime;
        time.mintue = e.detail.value;
        this.setData({
            modeDeviceTime: time
        });
    },
    setSecond: function(e) {
        let time = this.data.modeDeviceTime;
        time.second = e.detail.value;
        this.setData({
            modeDeviceTime: time
        });
    },
    addModeDevice: function() {
        let data = {
            modeId: this.data.modeId,
            deviceId: this.data.selectDevice.device.deviceId,
            desired: {
                switch: this.data.modeDeviceSwitch,
                luminance: this.data.selectDevice.status.luminance
            },
            time: this.data.modeDeviceTime
        };
        let th = this;
        wx.request({
            url: app.globalData.serverUrl + "/api/device/mode/task",
            data: data,
            method: "POST",
            header: { Authorization: "Bearer " + app.globalData.token },
            success: function(res) {
                // success
                console.log(res);
            },
            fail: function(err) {
                // fail
                console.log(err);
            },
            complete: function() {
                // complete
                th.exit();
                th.getMode();
            }
        });
    },
    deleteMode: function(e) {
        let th = this;
        wx.request({
            url:
                app.globalData.serverUrl +
                "/api/device/mode?modeId=" +
                e.currentTarget.dataset.id,
            method: "DELETE",
            header: { Authorization: "Bearer " + app.globalData.token },
            success: function(res) {
                // success
                console.log(res);
            },
            fail: function(err) {
                // fail
                console.log(err);
            },
            complete: function() {
                // complete
                th.getMode();
            }
        });
    },
    openMode: function(e) {
        let th = this;
        let data = {
            modeId: e.currentTarget.dataset.id,
            switch: !e.currentTarget.dataset.switch
        };
        wx.request({
            url: app.globalData.serverUrl + "/api/device/mode/switch",
            data: data,
            method: "PUT",
            header: { Authorization: "Bearer " + app.globalData.token },
            success: function(res) {
                // success
                console.log(res);
            },
            fail: function(err) {
                // fail
                console.log(err);
            },
            complete: function() {
                // complete
                th.getMode();
            }
        });
    }
    // 获取情景模式信息
    // api/device/mode GET
    // 添加   api/device/mode  POST  {"name":"情景模式","timeType":1,"time":"2019-06-01T16:00:00.000Z","date":[]}
    // api/device/mode/task POST  {"modeId":"43169650-8473-11e9-90e0-ab3eb92f372c","deviceId":"cb6208e65bd8e0cac1cc","desired":{"switch":true},"time":{"minute":1,"second":0}}
    // api/device/mode/task POST  {"modeId":"43169650-8473-11e9-90e0-ab3eb92f372c","deviceId":"cb6208e65bd8e0cac1cc","desired":{"switch":false},"time":{"minute":0,"second":0}}
    // api/device/mode/switch PUT  {"modeId":"43169650-8473-11e9-90e0-ab3eb92f372c","switch":true}
});
