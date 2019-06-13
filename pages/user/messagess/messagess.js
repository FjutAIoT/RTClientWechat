const app = getApp();
Page({
    data: {
        messages: []
    },
    onLoad: function() {
        // let message = app.globalData.messages.message;
        // let messages = [];
        // messages.push(message);
        // this.setData({
        //     messages: messages
        // });
        this.getMessage();
    },
    getMessage: function() {
        let th = this;
        let data = {
            query: { status: "", category: "" },
            pageNo: 0,
            pageSize: 10
        };
        wx.request({
            url: app.globalData.serverUrl + "/api/message/getMessages",
            data: data,
            method: "POST",
            header: { Authorization: "Bearer " + app.globalData.token },
            success: function(res) {
                // success
                console.log(res);
                let message = res.data.response.page;
                for (let i in message) {
                    let time = message[i].message.createTime;
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
                    message[i].message.createTime = times;
                }
                th.setData({
                    messages: message
                });
            },
            fail: function(err) {
                console.log(err);
                // fail
            },
            complete: function() {
                // complete
            }
        });
    }
});
