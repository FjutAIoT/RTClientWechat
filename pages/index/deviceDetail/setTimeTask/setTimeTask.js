const app = getApp();
Page({
    data: {
        desired: null,
        br: "\n",
        deviceId: null,
        desired: null,
        taskName: "定时任务",
        hour: null,
        minute: null,
        setTask: false,
        taskSwitch: null,
        luminance: null,
        items: [{ name: "开启", value: true }, { name: "关闭", value: false }]
    },
    onLoad: function(e) {
        this.setData({
            deviceId: e.id
        });
        this.getDeviceTimedTask(e.id);
    },
    getDeviceTimedTask: function(id) {
        let desired = app.globalData.desired;
        let list = [];
        let time;
        for (let i in desired) {
            if (desired[i].deviceId == id) {
                time =
                    new Date(desired[i].executeTime).getFullYear() +
                    "/" +
                    (new Date(desired[i].executeTime).getMonth() + 1) +
                    "/" +
                    new Date(desired[i].executeTime).getDate() +
                    "，" +
                    (new Date(desired[i].executeTime).getHours() - 1) +
                    ":" +
                    new Date(desired[i].executeTime).getMinutes() +
                    ":" +
                    new Date(desired[i].executeTime).getMilliseconds();
                desired[i].detailTime = time;
                list.push(desired[i]);
            }
        }
        list = list.reverse();
        this.setData({
            desired: list
        });
    },
    setTask: function(e) {
        console.log(e);
        let value = e.detail.value;
        let id = e.currentTarget.dataset.id;
        if (value) {
            this.startDeviceTimedTask(id);
        } else {
            this.cancelDeviceTimedTask(id);
        }
    },
    cancelDeviceTimedTask: function(id) {
        let th = this;
        let desiredList = app.globalData.desired;
        wx.request({
            url: app.globalData.serverUrl + "/api/device/canclDeviceTimedTask",
            data: { timedTaskId: id },
            method: "PUT", // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
            header: {
                "content-type": "application/json;charset=utf-8",
                Authorization: "Bearer " + app.globalData.token
            }, // 设置请求的 header
            success: function(res) {
                // success
                console.log("取消定时成功");
                for (let i in desiredList) {
                    if (desiredList[i].timedTaskId == id) {
                        desiredList[i].perform = false;
                    }
                }
                th.getTask();
            },
            fail: function() {
                // fail
            },
            complete: function() {
                // complete
            }
        });
    },
    startDeviceTimedTask: function(id) {
        let th = this;
        let desiredList = app.globalData.desired;
        wx.request({
            url: app.globalData.serverUrl + "/api/device/startDeviceTimedTask",
            data: { timedTaskId: id },
            method: "PUT",
            header: {
                "content-type": "application/json;charset=utf-8",
                Authorization: "Bearer " + app.globalData.token
            }, // 设置请求的 header
            success: function(res) {
                // success
                console.log(res.data.response);
                for (let i in desiredList) {
                    if (desiredList[i].timedTaskId == id) {
                        desiredList[i].executeTime =
                            res.data.response.executeTime;
                        desiredList[i].perform = true;
                    }
                }
                th.getTask();
            },
            fail: function() {
                // fail
            },
            complete: function() {
                // complete
            }
        });
    },
    getTask: function() {
        let th = this;
        wx.request({
            url:
                app.globalData.serverUrl +
                "/api/device/getDeviceTimedTask?deviceId=" +
                th.data.deviceId,
            method: "GET",
            header: {
                "content-type": "application/json;charset=utf-8",
                Authorization: "Bearer " + app.globalData.token
            },
            success: function(res) {
                // success
                app.globalData.desired = res.data.response;
            },
            fail: function(err) {
                console.log(err);
            },
            complete: function() {
                th.getDeviceTimedTask(th.data.deviceId);
            }
        });
    },
    setTimedTask: function() {
        let task = {
            name: this.data.taskName,
            deviceId: this.data.deviceId,
            time: { hour: this.data.hour, minute: this.data.minute },
            desired: {}
        };
        if (this.data.taskSwitch != null) {
            task.desired.switch = this.data.taskSwitch;
        }
        if (this.data.luminance != null) {
            task.desired.luminance = this.data.luminance;
        }
        if (this.data.hour == null || this.data.hour == "") {
            task.time.hour = 0;
        }
        if (this.data.minute == null || this.data.minute == "") {
            task.time.minute = 0;
        }
        let th = this;
        wx.request({
            url: app.globalData.serverUrl + "/api/device/setDeviceTimedTask",
            data: task,
            method: "POST",
            header: {
                "content-type": "application/json;charset=utf-8",
                Authorization: "Bearer " + app.globalData.token
            }, // 设置请求的 header
            success: function(res) {
                // success
                console.log("定时成功");
                th.setData({ setTask: false });
            },
            fail: function() {
                // fail
            },
            complete: function() {
                // complete
                th.getTask();
            }
        });
    },
    addDesired: function() {
        this.setData({
            setTask: true
        });
    },
    setHour: function(e) {
        this.setData({
            hour: e.detail.value
        });
    },
    setMinute: function(e) {
        this.setData({
            minute: e.detail.value
        });
    },
    setName: function(e) {
        this.setData({
            taskName: e.detail.value
        });
    },
    setSwitch: function(e) {
        if (e.detail.value == "true") {
            this.setData({
                taskSwitch: true
            });
        } else {
            this.setData({
                taskSwitch: false
            });
        }
    },
    setLuminance: function(e) {
        this.setData({
            luminance: e.detail.value
        });
    },
    close: function() {
        this.setData({
            setTask: false
        });
    }
});
