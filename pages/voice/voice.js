const app = getApp();
const request = require("../../utils/request");
const util = require("../../utils/util.js");
const plugin = requirePlugin("WechatSI");
import { language } from "../../utils/conf.js";
const { $Toast } = require("../../dist/base/index");
const { $Message } = require("../../dist/base/index");
const manager = plugin.getRecordRecognitionManager(); // 获取全局唯一的语音识别管理器recordRecoManager-

Page({
    data: {
        dialogList: [],
        scroll_top: 10000, // 竖向滚动条位置

        bottomButtonDisabled: false, // 底部按钮disabled

        tips_language: language[0], // 目前只有中文

        initTranslate: {
            // // 为空时的卡片内容
            // text:
            //     "你可以这样说:\n\n\n打开空气净化器\n\n打开卧室的灯\n\n打开客厅的灯\n\n关闭插座"
            text: "请说话"
        },

        currentTranslate: {
            // 当前语音输入内容

            text: "等待说话"
        },
        recording: false, // 正在录音
        recordStatus: 0, // 状态： 0 - 录音中 1- 翻译中 2 - 翻译完成/二次翻译

        toView: "fake", // 滚动位置
        lastId: -1, // dialogList 最后一个item的 id
        currentTranslateVoice: "", // 当前播放语音路径
        wxRequestStatus: "", //用来测试request是否连接
        helpPage: true,
        order: [],
        visible2: false,
        position: "left",
        checked: false,
        current: [],
        returndevice: []
    },
    //生命周期函数，每次打开会调用一次
    onShow: function() {
        this.scrollToNew();

        this.initCard();

        if (this.data.recordStatus == 2) {
            wx.showLoading({
                // title: '',
                mask: true
            });
        }
    },
    //生命周期函数，一个页面只会调用一次
    onLoad: function() {
        // Request.get("api/user/getUserInfo"); //test
        // this.getHistory(); //获取历史记录
        this.initRecord(); //初始化语音回调

        this.setData({ toView: this.data.toView, order: app.globalData.order });
        this.innerAudioContext = wx.createInnerAudioContext();

        app.getRecordAuth(); //获取录音授权
    },
    //页面监听隐藏，当跳转或tab切换时调用
    onHide: function() {
        this.setHistory();
    },
    /**
     * 按住按钮开始语音识别
     */
    streamRecord: function(e) {
        console.log("震动");
        wx.vibrateShort();
        let detail = e.detail || {};
        let buttonItem = detail.buttonItem || {};
        manager.start({
            lang: buttonItem.lang
        });
        this.setData({
            recordStatus: 0,
            recording: true,
            currentTranslate: {
                // 当前语音输入内容
                create: util.recordTime(new Date()),
                text: "正在聆听中",
                lfrom: buttonItem.lang,
                lto: buttonItem.lto
            }
        });
        this.scrollToNew();
    },

    /**
     * 松开按钮结束语音识别
     */
    streamRecordEnd: function(e) {
        let detail = e.detail || {}; // 自定义组件触发事件时提供的detail对象
        let buttonItem = detail.buttonItem || {};

        // 防止重复触发stop函数
        if (!this.data.recording || this.data.recordStatus != 0) {
            console.warn("已经完成!");
            return;
        }
        manager.stop();
        this.setData({
            bottomButtonDisabled: true
        });
    },
    /**
     * 初始化为空时的卡片
     */
    initCard: function() {
        let initTranslateNew = Object.assign({}, this.data.initTranslate, {
            create: util.recordTime(new Date())
        });
        this.setData({
            initTranslate: initTranslateNew
        });
    },

    /**
     * 删除卡片
     */

    /**
     * 识别内容为空时的反馈
     */
    showRecordEmptyTip: function() {
        this.setData({
            recording: false,
            bottomButtonDisabled: false
        });
        wx.showToast({
            title: this.data.tips_language.recognize_nothing,
            icon: "success",
            image: "/image/no_voice.png",
            duration: 1000,
            success: function(res) {},
            fail: function(res) {
                console.log(res);
            }
        });
    },

    /**
     * 初始化语音识别回调
     * 绑定语音播放开始事件
     */
    initRecord: function() {
        //有新的识别内容返回，则会调用此事件
        manager.onRecognize = res => {
            let currentData = Object.assign({}, this.data.currentTranslate, {
                text: res.result
            });
            this.setData({
                currentTranslate: currentData
            });
            this.scrollToNew();
        };

        // 识别结束事件
        manager.onStop = res => {
            let text = res.result;
            if (text == "") {
                this.showRecordEmptyTip();
                return;
            }

            let lastId = this.data.lastId + 1;

            let currentData = Object.assign({}, this.data.currentTranslate, {
                text: res.result,
                translateText: "正在翻译中",
                id: lastId,
                voicePath: res.tempFilePath
            });

            this.setData({
                currentTranslate: currentData,
                recordStatus: 1,
                lastId: lastId
            });

            this.scrollToNew();
            // this.repeatedSpeech(text, this.data.dialogList.length);
            // request.post("api/semantic/setSemanticText", {
            //     text: this.removePunctuationMark(text)
            // });

            let that = this;
            let header = header || {};
            let token = app.globalData.token;
            if (token) {
                header["Authorization"] = "Bearer " + token;
            }
            wx.request({
                url: app.globalData.serverUrl + "/api/semantic/setSemanticText",
                header: header,
                data: { text: this.removePunctuationMark(text) },
                method: "POST",
                success: function(res) {
                    // success
                    if (res.data.response.data.length == 1) {
                        $Message({
                            content: res.data.response.information,
                            type: "success"
                        });
                        that.setData({
                            recording: false,
                            bottomButtonDisabled: false
                        });
                    } else if (res.data.response.data.length > 1) {
                        let deviceArray = [];
                        for (
                            let i = 0, len = res.data.response.data.length;
                            i < len;
                            i++
                        ) {
                            let device = {};
                            device.id = res.data.response.data[i];
                            device.name = res.data.response.name[i];
                            device.action = res.data.response.action;
                            device.status = res.data.response.status[i];
                            deviceArray.push(device);
                        }
                        that.setData({
                            device: deviceArray,
                            visible2: true
                        });
                    } else if (res.data.response.data.length === 0) {
                        $Message({
                            content: res.data.response.information,
                            type: "error"
                        });
                        that.setData({
                            recording: false,
                            bottomButtonDisabled: false
                        });
                    }
                },
                fail: function(res) {
                    console.log("我是萨芬");
                    that.setData({
                        recording: false,
                        bottomButtonDisabled: false
                    });
                },
                complete: function() {}
            });
        };

        // 识别错误事件
        manager.onError = res => {
            this.setData({
                recording: false,
                bottomButtonDisabled: false
            });
        };
    },

    /**
     * 设置语音识别历史记录
     */
    setHistory: function() {
        try {
            let dialogList = this.data.dialogList;
            dialogList.forEach(item => {
                item.autoPlay = false;
            });
            wx.setStorageSync("history", dialogList);
        } catch (e) {
            console.error("setStorageSync setHistory failed");
        }
    },

    /**
     * 重新滚动到底部
     */
    scrollToNew: function() {
        this.setData({
            toView: this.data.toView
        });
    },

    /**
     * 去掉句子后面的标点符号
     */
    removePunctuationMark: function(text) {
        return text.replace(/。/g, "");
    },

    /**
     * 重复用户输入的话**汉语
     */
    repeatedSpeech: function(text, index) {
        let that = this;

        let sentence = "您说的是" + this.removePunctuationMark(text) + "吗";
        console.log(text); //text后面会有句号

        plugin.textToSpeech({
            lang: "zh_CN",
            tts: true,
            content: sentence,
            success: function(res) {
                console.log("合成语音成功", res.filename);
                wx.playBackgroundAudio({
                    dataUrl: res.filename
                });
                that.setData({
                    bottomButtonDisabled: false
                });
            },
            fail: function(res) {
                console.log("合成语音失败", res);
            }
        });
    },

    /**
     *向后台发出控制指令
     */
    /**帮助界面 */
    helpOpen: function() {
        this.setData({
            initTranslate: {
                text: ""
            },
            helpPage: false
        });
    },
    helpClose: function() {
        this.setData({
            helpPage: true,
            initTranslate: {
                text:
                    "你可以这样说:\n\n\n打开客厅的吸顶灯\n\n关闭客厅的吸顶灯\n\n把客厅吸顶灯亮度调到100%\n\n把客厅的风扇速度调到一档"
            }
        });
    },
    /**跳转到上一个页面 */
    close: function() {
        wx.navigateBack({
            delta: 1
        });
    },

    handleOK() {
        let that = this;
        let arr = new Array();
        if (this.data.current.length == 0) {
            $Toast({
                content: "请选择一个设备",
                type: "success"
            });
        } else {
            for (let i of this.data.device) {
                if (this.data.current.indexOf(i.id) !== -1) {
                    arr.push(i);
                }
            }

            let header = header || {};
            let token = app.globalData.token;
            let data = arr;
            if (token) {
                header["Authorization"] = "Bearer " + token;
            }
            wx.request({
                url: app.globalData.serverUrl + "/api/device/setManyDesired",
                data: data,
                header: header,
                method: "POST",
                success: function(res) {
                    $Message({
                        content: res.data.response.information,
                        type: "success"
                    });
                    that.setData({
                        visible2: false,
                        recording: false,
                        bottomButtonDisabled: false
                    });
                },
                fail: function(res) {
                    that.setData({
                        recording: false,
                        bottomButtonDisabled: false
                    });
                },
                complete: function(res) {}
            });
        }
    },
    handleCancel() {
        this.setData({
            visible2: false,
            recording: false,
            bottomButtonDisabled: false
        });
    },
    handleDeviceChange({ detail = {} }) {
        const index = this.data.current.indexOf(detail.value);
        index === -1
            ? this.data.current.push(detail.value)
            : this.data.current.splice(index, 1);
        this.setData({
            current: this.data.current
        });
    }
});
