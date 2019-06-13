const app = getApp();
Page({
    data: {
        equipments: null,
        deviceCategory: null,
        multiArray: null,
        multiIndex: [0, 0],
        rooms: null,
        roomName: null,
        index: 0,
        networking: "wifi",
        os: "Linux",
        protocol: "MQTT",
        categoryItemId: "ceilingLamp",
        selectedRoom: null,
        first: true,
        deviceStatus: [],
        deviceData: {
            categoryItemId: null,
            desc: null,
            deviceId: null,
            groupId: null,
            name: "LED灯",
            networking: "wifi",
            os: "Linux",
            protocol: "MQTT",
            roomId: null,
            status: { luminance: 0, switch: false }
        }
    },
    onLoad: function(option) {
        this.init();
        let deviceData = this.data.deviceData;
        deviceData.deviceId = option.id;
        deviceData.groupId = app.globalData.userInfo.groupId;
        let room = app.globalData.rooms;
        let name = [];
        for (let i in room) {
            name.push(room[i].name);
        }
        deviceData.roomId = room[0].roomId;
        this.setData({
            deviceData: deviceData,
            rooms: room,
            roomName: name,
            selectedRoom: name[0]
        });
    },
    init: function() {
        let th = this;
        wx.request({
            url: app.globalData.serverUrl + "/api/device/getAllDeviceCategory",
            method: "GET", // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
            header: {
                Authorization: "Bearer " + app.globalData.token
            }, // 设置请求的 header
            success: function(res) {
                // success
                th.data.deviceCategory = res.data.response;
                let arr1 = res.data.response;
                let arr2 = [];
                let multiArr1 = [];
                let multiArr2 = [];
                let deviceData = th.data.deviceData;
                for (let j = 0; j < arr1.length; j++) {
                    multiArr1[j] = arr1[j].name;
                    arr2[j] = arr1[j].categoryItem;
                }
                let arr3 = arr2[0];
                deviceData.categoryItemId = arr3[0].categoryItemId;
                for (let k = 0; k < arr3.length; k++) {
                    multiArr2[k] = arr3[k].name;
                }
                let array = [];
                array[0] = multiArr1;
                array[1] = multiArr2;
                th.setData({
                    multiArray: array,
                    deviceData: deviceData
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
    bindMultiPickerChange: function(e) {
        let multiArray = this.data.multiArray;
        let multiIndex = this.data.multiIndex;
        let type1 = multiArray[0][multiIndex[0]];
        let type2 = multiArray[1][multiIndex[1]];
        let deviceCategory = this.data.deviceCategory;
        let deviceData = this.data.deviceData;
        for (let i = 0; i < deviceCategory.length; i++) {
            if (type1 == deviceCategory[i].name) {
                for (
                    let j = 0;
                    j < deviceCategory[i].categoryItem.length;
                    j++
                ) {
                    if (type2 == deviceCategory[i].categoryItem[j].name) {
                        deviceData.categoryItemId =
                            deviceCategory[i].categoryItem[j].categoryItemId;
                        deviceData.name =
                            deviceCategory[i].categoryItem[j].name;
                    }
                }
            }
        }
        this.setData({
            multiIndex: e.detail.value,
            deviceData: deviceData
        });
        let th = this;
        wx.request({
            url:
                app.globalData.serverUrl +
                "/api/device/getDeviceParamAndAttrById?categoryItemId=" +
                this.data.deviceData.categoryItemId,
            method: "GET",
            header: {
                Authorization: "Bearer " + app.globalData.token
            },
            success: function(res) {
                // success
                console.log(res);
                th.setData({
                    deviceStatus: res.data.response.attr
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
    bindMultiPickerColumnChange: function(e) {
        let data = {
            multiArray: this.data.multiArray,
            multiIndex: this.data.multiIndex
        };
        data.multiIndex[e.detail.column] = e.detail.value;
        // 改变第i列数据之后，后几列选择第0个选项（重置）
        if (e.detail.column == "0") {
            data.multiArray[1] = this.selectArray(data.multiIndex[0]);
        }
        this.setData(data);
    },
    selectArray: function(num) {
        let arr1 = this.data.deviceCategory;
        let arr2 = [];
        let arr3 = [];
        arr2 = arr1[num].categoryItem;
        for (let i = 0; i < arr2.length; i++) {
            arr3[i] = arr2[i].name;
        }
        return arr3;
    },
    bindPickerChange(e) {
        let num = parseInt(e.detail.value);
        console.log(num);
        let room = app.globalData.rooms[num];
        let deviceData = this.data.deviceData;
        deviceData.roomId = room.roomId;
        this.setData({
            index: e.detail.value,
            deviceData: deviceData,
            selectedRoom: room.name
        });
    },
    next: function() {
        this.setData({
            first: false
        });
        // this.onShow();
    },
    back: function() {
        this.setData({
            first: true
        });
    },
    setDeviceName: function(e) {
        let deviceData = this.data.deviceData;
        deviceData.name = e.detail.detail.value;
        this.setData({
            deviceData: deviceData
        });
    },
    setDeviceDesc: function(e) {
        let deviceData = this.data.deviceData;
        deviceData.desc = e.detail.detail.value;
        this.setData({
            deviceData: deviceData
        });
    },
    add: function() {
        let data_ = this.data.deviceData;
        wx.request({
            url: app.globalData.serverUrl + "/api/device/setDevice",
            data: data_,
            method: "POST",
            header: {
                Authorization: "Bearer " + app.globalData.token
            },
            success: function(res) {
                // success
                console.log(res);
                wx.switchTab({
                    url: "/pages/index/index",
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
            fail: function() {
                // fail
            },
            complete: function() {
                // complete
            }
        });
    }
});
