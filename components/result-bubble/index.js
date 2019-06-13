import { language } from "../../utils/conf.js";

Component({
    properties: {
        /*
    item 格式
    {
      create: '04/27 15:37',
      text: '一二三四五',
      translateText: '12345',
      voicePath: '',
      translateVoicePath: '',
      id: 0,
    },*/
        item: {
            type: Object,
            value: {},
            observer: function(newVal, oldVal) {
                // 翻译完成后，文字有改变触发重新翻译
                if (
                    this.data.recordStatus == 2 &&
                    oldVal.text &&
                    oldVal.text != "" &&
                    newVal.text != oldVal.text
                ) {
                    this.triggerEvent("translate", {
                        item: this.data.item,
                        index: this.data.index
                    });
                }

                // 翻译内容改变触发播放
                // if (
                //     newVal.autoPlay &&
                //     newVal.translateVoicePath != oldVal.translateVoicePath
                // ) {
                //     this.autoPlayTranslateVoice();
                // } else if (newVal.translateVoicePath == "") {
                //     this.playAnimationEnd();
                // }
            }
        },
        editShow: {
            type: Boolean,
            value: false
        },
        index: {
            type: Number
        },

        currentTranslateVoice: {
            type: String,
            observer: function(newVal, oldVal) {
                if (
                    newVal != "" &&
                    newVal != this.data.item.translateVoicePath
                ) {
                    this.playAnimationEnd();
                }
            }
        },

        recordStatus: {
            type: Number,
            value: 2 // 0：正在识别，1：正在翻译，2：翻译完成
        }
    },

    data: {
        tips_language: language[0], // 目前只有中文

        modalShow: false, // 展示悬浮框

        playType: "wait", // 语音播放状态

        waiting_animation: {},
        waiting_animation_1: {},

        edit_icon_path: "../../image/edit.png"
    },

    // ready: function() {
    //     if (this.data.item.autoPlay) {
    //         this.autoPlayTranslateVoice();
    //     }
    // },

    // 组件生命周期函数，在组件实例被从页面节点树移除时执行
    detached: function() {
        // console.log("detach")
    },

    methods: {
        /**
         * 显示悬浮框
         */
        showModal: function() {
            this.setData({ modalShow: true });
        },

        /**
         * 离开悬浮框
         */
        modalLeave: function() {
            this.setData({ modalShow: false });
        }
    }
});
