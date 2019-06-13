//index.js
"use strict";
const app = getApp();
const io = require("../../libs/weapp.socket.io.js");
const { $Message } = require("../../dist/base/index");
Page({
    data: {
        userInfo: {},
        hasUserInfo: false,
        canIUse: wx.canIUse("button.open-type.getUserInfo"),
        equipments: null,
        weatherData: null,
        markers: null,
        starTime: 0,
        ClickNum: 0,
        current: "homepage",
        model: false,
        eqmodel: null,
        eqTypes: [
            "all",
            "ceilingLamp-b",
            "airFan-b",
            "sensor-b",
            "alarm-b",
            "other-b"
        ],
        selected: "all",
        rooms: null,
        deviceList: null,
        group: null,
        update: null,
        updateStatus: null,
        messages: null
    },
    onLoad: function() {
        // this.init();
        this.setData({ userInfo: app.globalData.userInfo });
    },
    init: function() {
        this.setData({
            userInfo: {},
            hasUserInfo: false,
            canIUse: wx.canIUse("button.open-type.getUserInfo"),
            equipments: null,
            weatherData: null,
            markers: null,
            starTime: 0,
            ClickNum: 0,
            current: "homepage",
            model: false,
            eqmodel: null,
            eqTypes: [
                "all",
                "ceilingLamp-b",
                "airFan-b",
                "sensor-b",
                "alarm-b",
                "other-b"
            ],
            selected: "all",
            rooms: null,
            deviceList: null,
            group: null,
            update: null,
            updateStatus: null,
            messages: null
        });
    },
    onReady: function() {
        let th = this;
        let rooms = {};
        let deviceList = [];
        let group = {};
        this.created();
        wx.onSocketMessage(function(res) {
            // data
            let data1 = res.data;
            if (data1.substr(0, 1) == "0") {
                data1 = JSON.parse(data1.substr(1));
            } else if (data1.substr(0, 2) == "42") {
                data1 = JSON.parse(data1.substr(2));
                for (let i in data1) {
                    if (data1[i] == "rooms") {
                        rooms = data1[1];
                        app.globalData.rooms = rooms;
                    } else if (data1[i] == "group") {
                        group = data1[1];
                        th.getWeather(data1[1]);
                    } else if (data1[i] == "devices") {
                        deviceList = data1[1];
                    } else if (data1[i] == "updateOnline") {
                        th.data.update = data1[1];
                        th.onShow();
                    } else if (
                        data1[i] == "updateDevices" &&
                        data1[1].type == "add"
                    ) {
                        th.data.updateStatus = data1[1];
                        th.onShow();
                    } else if (
                        data1[i] == "updateDevices" &&
                        data1[1].type == "delete"
                    ) {
                        th.deleteDevice(data1[1].deviceId);
                    } else if (data1[i] == "addDevice") {
                        th.data.deviceList.push(data1[1]);
                    } else if (data1[i] == "message") {
                        app.globalData.messages = data1[1];
                    } else if (
                        data1[i] == "updateRooms" &&
                        data1[1].type == "add"
                    ) {
                        th.addRoom(data1[1].data);
                    } else if (data1[i] == "updateDeviceStatus") {
                        th.updateDeviceStatus(data1[1]);
                    }
                }
            }
            app.globalData.deviceList = deviceList;
            app.globalData.rooms = rooms;
            app.globalData.group = group;
            th.setData({
                rooms: rooms,
                deviceList: deviceList,
                group: group
            });
            th.onShow();
        });
    },
    onShow: function() {
        this.setData({ userInfo: app.globalData.userInfo });
        let list = this.data.deviceList;
        let room = this.data.rooms;
        if (this.data.update) {
            for (let i in list) {
                if (this.data.update.deviceId == list[i].device.deviceId) {
                    list[i].device.onLine = this.data.update.onLine;
                }
            }
        }
        if (this.data.updateStatus) {
            for (let i in list) {
                if (
                    list[i].device.deviceId ==
                    this.data.updateStatus.data.device.deviceId
                ) {
                    return false;
                }
            }
            list.push(this.data.updateStatus.data);
        }
        for (let i in list) {
            for (let j in room) {
                if (list[i].device.roomId == room[j].roomId) {
                    list[i].device.roomName = room[j].name;
                }
            }
        }
        app.globalData.deviceList = list;
        this.setData({
            deviceList: list,
            starTime: 0,
            ClickNum: 0
        });
    },
    addRoom: function(e) {
        let room = this.data.rooms;
        room.push(e);
        app.globalData.rooms = room;
        this.setData({
            rooms: room
        });
    },
    deleteDevice: function(id) {
        let list = this.data.deviceList;
        for (let i in list) {
            if (list[i].device.deviceId == id) {
                list.splice(i, 1);
            }
        }
        this.setData({
            deviceList: list
        });
    },
    updateDeviceStatus: function(data) {
        let deviceList = this.data.deviceList;
        for (let i in deviceList) {
            if (deviceList[i].device.deviceId == data.deviceId) {
                deviceList[i].status = data.status;
            }
        }
        this.setData({
            deviceList: deviceList
        });
    },
    created: function() {
        const socket = io.connect(app.globalData.socket, {
            query: "token=" + app.globalData.token
        });

        socket.on("connection", data => {
            console.log("connect");
        });

        socket.on("disconnect", data => {
            console.log("disconnect");
        });

        socket.on("reconnect", attemptNumber => {
            if (!app.globalData.token) {
                socket.close();
            }
            console.log(attemptNumber);
        });

        socket.on("connect_error", error => {
            console.log(error);
        });
    },

    handleChange: function({ detail }) {
        this.setData({
            current: detail.key
        });
    },
    onChange: function(event) {
        let detail = event.currentTarget.dataset.eqstate;
        let eqs = this.data.deviceList;
        let state;
        let reqdata = {};
        if (detail.status.switch == false) {
            state = true;
            $Message({
                content: detail.device.name + " 开启成功",
                type: "success",
                duration: 1
            });
        } else {
            state = false;
            $Message({
                content: detail.device.name + " 关闭成功",
                type: "success",
                duration: 1
            });
        }
        for (let i in eqs) {
            if (eqs[i].device.deviceId == detail.device.deviceId) {
                eqs[i].status.switch = state;
                reqdata = {
                    desired: { switch: eqs[i].status.switch },
                    deviceId: eqs[i].device.deviceId,
                    groupId: eqs[i].device.groupId
                };
                wx.request({
                    url: app.globalData.serverUrl + "/api/device/setDesired",
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
            }
        }
        this.setData({
            deviceList: eqs
        });
        this.onShow();
    },
    changeType: function(event) {
        let type = event.currentTarget.dataset.type;
        type = type.replace("-b", "");
        let types = this.data.eqTypes;
        let type1;
        for (let i in types) {
            types[i] = types[i].replace("-b", "");
            if (types[i] == type) {
                type1 = types[i];
            } else {
                types[i] = types[i] + "-b";
            }
        }
        this.setData({
            eqTypes: types,
            selected: type1
        });
        this.onShow();
    },

    bindViewTap: function() {
        wx.navigateTo({
            url: "../logs/logs"
        });
    },
    getEquipment: function() {
        let time = clearInterval(function() {
            if (!this.data.equipments) {
                this.data.equipments = app.globalData.deviceList;
                console.log(this.data.equipments);
            } else {
                clearTimeout(time);
            }
        }, 1000);
    },

    toAdd: function() {
        if (this.data.rooms) {
            wx.request({
                url: app.globalData.serverUrl + "/api/device/getDeviceId",
                method: "GET",
                header: {
                    "content-type": "application/json;charset=utf-8",
                    Authorization: "Bearer " + app.globalData.token
                },
                success: function(res) {
                    // success
                    console.log(res);
                    wx.navigateTo({
                        url: "add/add?id=" + res.data.response.deviceId
                    });
                },
                fail: function() {
                    // fail
                },
                complete: function() {
                    // complete
                }
            });
        } else {
            wx.navigateTo({
                url: "family/family"
            });
        }
    },
    getWeather: function(e) {
        let th = this;
        let adcode = e.region[2].adcode;
        wx.request({
            url:
                app.globalData.serverUrl +
                "/api/aMap/getWeatherInfo?city=" +
                adcode,
            method: "GET",
            header: {
                "content-type": "application/json;charset=utf-8",
                Authorization: "Bearer " + app.globalData.token
            },
            success: function(res) {
                // success
                let temp = res.data.response.lives[0].temperature + "℃";
                res.data.response.lives[0].temperature = temp;
                th.setData({
                    weatherData: res.data.response.lives[0]
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
    voice: function() {
        wx.navigateTo({
            url: "../voice/voice"
        });
    },

    myClick: function(e) {
        let that = this;
        let curTime = e.timeStamp;
        let starTime = this.data.starTime;
        if (that.data.starTime === 0) {
            this.setData({
                starTime: curTime
            });
            setTimeout(function() {
                that.resetClick();
                if (that.data.ClickNum === 1) {
                    that.voice();
                }
            }, 500);
        } else {
            if (curTime - starTime < 300) {
                this.setData({
                    ClickNum: 1
                });
            }
        }
    },
    toEq: function(e) {
        let id = e.currentTarget.dataset.deviceid;
        wx.request({
            url:
                app.globalData.serverUrl +
                "/api/device/getDeviceTimedTask?deviceId=" +
                id,
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
                wx.navigateTo({
                    url: "deviceDetail/deviceDetail?id=" + id
                });
            }
        });
    },

    resetClick: function() {
        if (this.data.ClickNum === 0) {
            this.setData({
                starTime: 0,
                ClickNum: 0
            });
        }
    }
});
