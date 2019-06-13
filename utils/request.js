const app = getApp();
const request = (url, data, method, header) => {
    data = data || {};
    header = header || {};
    let token = app.globalData.token;
    if (token) {
        header["Authorization"] = "Bearer " + token;
    }
    // console.log("log", header);
    return new Promise((resolve, reject) => {
        wx.request({
            url: app.globalData.serverUrl + url,
            header: header,
            data: data,
            method: method, // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
            // header: {}, // 设置请求的 header
            success: function(res) {
                // success
                console.log("request请求成功" + res);
                //如果token过期,后台会夹带更新后的token,存在则更新本地
                // if (res.token.length) {
                //     app.globalData.token = res.token;
                // }
            },
            fail: function() {
                // fail
                console.log("request请求失败");
            }
        });
    });
};
module.exports = {
    get: function(url, data, header) {
        return request(url, data, "GET", header);
    },
    post: function(url, data, header) {
        return request(url, data, "POST", header);
    },
    put:function(url,data,header){
        return request(url, data, "PUT", header);

    }
};
