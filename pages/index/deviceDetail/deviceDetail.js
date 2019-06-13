const app = getApp();
Page({
    data: {
        device: null,
        percent: "light0",
        status: "normal",
        showDetail: false,
        countDown: false,
        stop: true,
        stopTime: null,
        time: "00:00:00",
        timeValue1: null,
        timeValue2: null,
        desired: null,
        setTime: false,
        desiredDetail: "无任务"
    },
    onLoad: function(e) {
        this.getDevice(e.id);
        this.getDeviceTimedTask(e.id);
        // this.updateStatus(e.id);
    },
    onShow: function() {
        let id = this.data.device.device.deviceId;
        this.getDevice(id);
    },
    updateStatus: function(id) {
        let th = this;
        let device = this.data.device;
        wx.onSocketMessage(function(res) {
            // data
            let data1 = res.data;
            if (data1.substr(0, 1) == "0") {
                data1 = JSON.parse(data1.substr(1));
            } else if (data1.substr(0, 2) == "42") {
                data1 = JSON.parse(data1.substr(2));
                if (data1[0] == "updateDeviceStatus") {
                    if ((data1[1].deviceId = th.data.deviceId)) {
                        let light = "light" + device.status.luminance / 10;
                        device.status = data1[1].status;
                        th.setData({
                            percent: light
                        });
                    }

                    th.setData({
                        device: device
                    });
                } else if (data1[0] == "updateOnline") {
                    device.device.onLine = data1[1].onLine;
                    th.setData({
                        device: device
                    });
                }
            }
        });
    },
    getDevice: function(id) {
        let th = this;
        let deviceList = app.globalData.deviceList;
        for (let i in deviceList) {
            if (deviceList[i].device.deviceId == id) {
                th.setData({
                    device: deviceList[i]
                });
                if (deviceList[i].device.categoryId == "lighting") {
                    let light = "light" + deviceList[i].status.luminance / 10;
                    th.setData({
                        percent: light
                    });
                }
                wx.setNavigationBarTitle({
                    title: deviceList[i].device.categoryItemName
                });
            }
        }
    },
    getDeviceTimedTask: function(id) {
        let desired = app.globalData.desired;
        let list = [];
        let desc = "无任务";
        for (let i in desired) {
            if (desired[i].deviceId == id) {
                list.push(desired[i]);
            }
        }
        for (let j in list) {
            if (list[j].perform == true && list[j].finish == false) {
                desc = "正在执行，";
                let end =
                    list[j].executeTime +
                    list[j].time.hour * 3600000 +
                    list[j].time.minute * 60000;
                end =
                    new Date(end).getHours() +
                    ":" +
                    new Date(end).getMinutes() +
                    ":" +
                    new Date(end).getMilliseconds();
                desc = desc + end;
                if (list[j].desired.switch == false) {
                    desc = desc + "关闭";
                } else if (list[j].desired.switch == true) {
                    desc = desc + "开启";
                    if (list[j].desired.luminance) {
                        desc =
                            desc + "  亮度调整为" + list[j].desired.luminance;
                    }
                }
            }
        }
        this.setData({
            desired: list,
            desiredDetail: desc
        });
    },
    setLuminance: function(e) {
        let device = this.data.device;
        let id = device.device.deviceId;
        device.status.luminance = e.detail.value;
        let light = "light" + e.detail.value / 10;
        this.setData({
            device: device,
            percent: light
        });
        let data = {
            percent: e.detail.value,
            deviceId: id
        };
        this.setDesired(data);
        this.getDevice(id);
    },

    setTime: function(e) {
        let value = e.detail.value;
        if (value) {
            this.setData({
                countDown: true,
                setTime: true
            });
        } else {
            this.stop(value);
            this.cancelDeviceTimedTask();
        }
    },
    start: function() {
        this.startDeviceTimedTask();
    },
    stop: function(e) {
        if (!e) {
        }
        this.setData({
            stop: true
        });
    },
    btn: function() {
        let th = this;
        let device = this.data.device;
        if (device.device.onLine == false) {
            return false;
        }
        device.status.switch = !device.status.switch;
        let reqdata = {
            desired: { switch: device.status.switch },
            deviceId: device.device.deviceId,
            groupId: device.device.groupId
        };
        wx.request({
            url: app.globalData.serverUrl + "/api/device/setDesired",
            data: reqdata,
            method: "POST",
            header: {
                Authorization: "Bearer " + app.globalData.token
            },
            success: res => {
                th.getDevice(device.device.deviceId);
            },
            fail: err => {
                console.log(err);
            }
        });
        this.setData({
            device: device
        });
    },

    setDesired: function(data) {
        let th = this;
        if (this.data.device.device.onLine == false) {
            return false;
        }
        let desired = {
            deviceId: data.deviceId,
            desired: { luminance: data.percent }
        };
        wx.request({
            url: app.globalData.serverUrl + "/api/device/setDesired",
            data: desired,
            method: "POST", // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
            header: {
                "content-type": "application/json;charset=utf-8",
                Authorization: "Bearer " + app.globalData.token
            }, // 设置请求的 header
            success: function(res) {
                // success
                th.getDevice(data.deviceId);
            },
            fail: function() {
                // fail
            },
            complete: function() {
                // complete
            }
        });
    },
    showDetail: function() {
        let status = this.data.showDetail;
        this.setData({
            showDetail: !status
        });
    },
    closeShow: function() {
        let status = this.data.showDetail;
        this.setData({
            showDetail: !status
        });
    },
    carStop: function() {
        let direction = 7;
        let reqdata = {
            desired: { direction: direction },
            deviceId: this.data.device.device.deviceId,
            groupId: this.data.device.device.groupId
        };
        wx.request({
            url: app.globalData.serverUrl + "/api/user/carCtrl",
            data: reqdata,
            method: "POST",
            header: {
                Authorization: "Bearer " + app.globalData.token
            },
            success: res => {
                console.log(res);
            },
            fail: err => {
                console.log(err);
            }
        });
    },
    longW: function(e) {
        let direction = e.currentTarget.id;
        if (direction == "1") {
            direction = 5;
        }
        let reqdata = {
            desired: { direction: direction },
            deviceId: this.data.device.device.deviceId,
            groupId: this.data.device.device.groupId
        };
        wx.request({
            url: app.globalData.serverUrl + "/api/user/carCtrl",
            data: reqdata,
            method: "POST",
            header: {
                Authorization: "Bearer " + app.globalData.token
            },
            success: res => {},
            fail: err => {
                console.log(err);
            }
        });
    },
    longS: function(e) {
        let direction = e.currentTarget.id;
        if (direction == "4") {
            direction = 6;
        }
        let reqdata = {
            desired: { direction: direction },
            deviceId: this.data.device.device.deviceId,
            groupId: this.data.device.device.groupId
        };
        wx.request({
            url: app.globalData.serverUrl + "/api/user/carCtrl",
            data: reqdata,
            method: "POST",
            header: {
                Authorization: "Bearer " + app.globalData.token
            },
            success: res => {},
            fail: err => {
                console.log(err);
            }
        });
    },
    carCtrl: function(e) {
        let direction = e.currentTarget.id;
        let reqdata = {
            desired: { direction: direction },
            deviceId: this.data.device.device.deviceId,
            groupId: this.data.device.device.groupId
        };
        wx.request({
            url: app.globalData.serverUrl + "/api/user/carCtrl",
            data: reqdata,
            method: "POST",
            header: {
                Authorization: "Bearer " + app.globalData.token
            },
            success: res => {},
            fail: err => {
                console.log(err);
            }
        });
    }
});
