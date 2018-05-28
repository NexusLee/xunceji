$(function(){
    "use strict";

    var dappAddress = "n1xKKgQ4LK9BV9agQqf1AsXeQacyz1MmP3j";
    var nebulas = require("nebulas"),
        Account = nebulas.Account,
        neb = new nebulas.Neb();
    neb.setRequest(new nebulas.HttpRequest("https://mainnet.nebulas.io"));

    var NebPay = require("nebpay");
    var nebPay = new NebPay();

    var cube = document.querySelector(".cube");
    var cancelBtn = document.querySelector(".weui-dialog__btn_cancel");
    var submitBtn = document.querySelector(".weui-dialog__btn_submit");

    var $iosDialog1 = $('#iosDialog1');
    var $toast = $(".toast");


    var serialNumber, intervalQuery;
    var options = {
        goods: {
        },
        callback: NebPay.config.testnetUrl,   //交易查询服务器地址
        listener: function(resp) {
            console.log(resp);
        } //为浏览器插件指定listener,处理交易返回结果
    };

    var map = new AMap.Map('mapContainer', {
        resizeEnable: true
    });
    //地图中添加地图操作ToolBar插件
    map.plugin(['AMap.ToolBar'], function() {
        //设置地位标记为自定义标记
        var toolBar = new AMap.ToolBar();
        map.addControl(toolBar);
    });

    var infoWindow = new AMap.AdvancedInfoWindow({
        placeSearch: false,
        asOrigin: false,
        offset: new AMap.Pixel(10, -30)
    });

     var callBackFn = function(e) {
        map.off('click', callBackFn);

        var name = document.querySelector(".toilet-name");
        var addr = document.querySelector(".toilet-addr");
        var counter = document.querySelector(".weui-textarea-counter span");
        var lat = e.lnglat.getLat();
        var lng = e.lnglat.getLng();
        var latlng = [ lng, lat ];
        var item  = {};
        item.latlng = latlng;
        item.city = city;

        $iosDialog1.fadeIn(200);


        addr.onkeyup = onkeyup;

        function onkeyup(e){
            counter.innerHTML = addr.value.length;
        }


        submitBtn.addEventListener("click", function (e){
            item.name = name.value;
            item.addr = addr.value;
            var to = dappAddress;
            var value = "0";
            var callFunction = "save";
            var callArgs = JSON.stringify([item]);

            serialNumber = nebPay.call(to, value, callFunction, callArgs, options);

            intervalQuery = setInterval(function () {
                funcIntervalQuery(item);
            }, 10000);

            $iosDialog1.fadeOut(200);
            map.off('click', callBackFn);
        })
    };

    cube.addEventListener("click", function (e){
        $toast.fadeIn(200);
        var timer = setTimeout(function(){
            $toast.fadeOut(200);
            clearTimeout(timer);
        }, 1500);
        map.on('click', callBackFn);
    });

    cancelBtn.addEventListener("click", function (e){
        $iosDialog1.fadeOut(200);
        map.off('click', callBackFn);
    });

    function funcIntervalQuery(item) {
        nebPay.queryPayInfo(serialNumber, options)   //search transaction result from server (result upload to server by app)
            .then(function (resp) {
                var respObject = JSON.parse(resp);
                if (respObject.code === 0) {
                    clearInterval(intervalQuery);

                    //添加点标记，并使用自己的icon
                    new AMap.Marker({
                        map: map,
                        position: item.latlng,
                        icon: new AMap.Icon({
                            size: new AMap.Size(27, 38),  //图标大小
                            image: "images/toilet.png"
                        })
                    });
                }
            })
    }

    var city;
    //初始化
    function getData() {
        var from = Account.NewAccount().getAddressString();
        var value = "0";
        var nonce = "0";
        var gas_price = "1000000";
        var gas_limit = "2000000";
        var callFunction = "get";

        getCity().then(function(data) {
            city = data;
            var callArgs = "[\"" + data + "\"]";
            var contract = {
                "function": callFunction,
                "args": callArgs
            };

            neb.api.call(from, dappAddress, value, nonce, gas_price, gas_limit, contract).then(function (resp) {
                var arr = JSON.parse(resp.result);
                arr.map(function(item, index){

                    var marker = new AMap.Marker({
                        map: map,
                        icon: new AMap.Icon({
                            size: new AMap.Size(40, 40),  //图标大小
                            image: "images/toilet.png"
                        }),
                        position: [item.latlng[0], item.latlng[1]]
                    });

                    //实例化信息窗体
                    var title = item.name,
                        content = [];
                    content.push("<div class='info-title'>" + title + "</div>");
                    content.push("<div class='info-content'><p>地址：" + item.addr + "</p></div>");


                    var content = '<div class="info-title">' + title + '</div><div class="info-content">' +
                        '地址' + item.addr;

                    marker.on('click', function() {
                        infoWindow.setContent(content);
                        infoWindow.open(map, marker.getPosition());
                    });

                })

            }).catch(function (err) {
                console.log("error:" + err.message)
            });
        });
    }

    function getCity() {
        return new Promise(function(resolve, reject) {
            map.getCity(function (data) {
                resolve(data.city);
            });
        });
    }

    getData();
});




