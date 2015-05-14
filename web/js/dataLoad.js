/**
 * Created by user on 2015/5/12.
 */
var DataLoad = {
    "rowSymbol": "\u0003",
    "colSymbol": "\u0002",
    createNew: function () {
        var dl = {};
        dl.dataSource = null;
        dl.loadC = [];
        dl.loadCh = [];
        dl.loadingGif = null;
        dl.loadType = "report";

        dl.appendLoadingGif = function () {
            var htmlStr = "<div id='loadinggif' style='left:50%;top:50%;z-index:100;position: fixed; background-color: rgba(255, 255, 255, 0.9); display:block' >";
            htmlStr += "<center><img src='image/ajax-loader.gif'></center></div>";
            $("body").prepend(htmlStr);

            dl.loadingGif = $("#loadinggif");
            dl.hideLoading();
        };

        dl.showLoading = function () {
            dl.loadingGif.show();
        };

        dl.hideLoading = function () {
            dl.loadingGif.hide();
        };

        dl.getJSON = function (url, callback) {
            dl.showLoading();
            console.time("getJSON");
            $.getJSON(url, function (data) {
                dl.dataSource = data;
                if (dl.loadType == "report") {
                    dl.dataFormat4Report();
                } else if (dl.loadType == "common") {
                    dl.dataFormat4Common();
                }
            }).error(function (jqXHR, textStatus, errorThrown) {
                dl.hideLoading();
                if (jqXHR.getResponseHeader("Content-Length") == null || jqXHR.getResponseHeader("Content-Length") == "0") {
                    alert("查無資料！");
                } else {
                    alert("Service API Error [" + textStatus + "]" + jqXHR);
                }
                dl.hideLoading();
            }).complete(function () {
                dl.hideLoading();
                console.timeEnd("getJSON");
                callback.call(this);
            });
        };

        dl.dataFormat4Report = function () {
            console.time("dataFormat4Report");
            dl.loadCh = dl.dataSource.ch.split(",");
            dl.loadC = [];
            var list = dl.dataSource.c.split(DataLoad.rowSymbol);
            var count = list.length;
            var obj = null;
            for (var i = 0; i < count; i++) {
                obj = {};
                list[i].split(DataLoad.colSymbol).forEach(function (elm, index, array) {
                    obj["column" + index] = elm;
                });
                dl.loadC.push(obj);
            }
        };

        dl.dataFormat4Common = function () {
            dl.loadC = [];
            var list = dl.dataSource.c.split(DataLoad.rowSymbol);
            var count = list.length;
            var obj = null;
            for (var i = 0; i < count; i++) {
                obj = [];
                list[i].split(DataLoad.colSymbol).forEach(function (elm, index, array) {
                    obj.push(elm);
                });
                dl.loadC.push(obj);
            }
        };

        dl.getReportJSON = function (url, callback) {
            dl.loadType = "report";
            dl.getJSON(url, callback);
        };

        dl.getCommonJSON = function (url, callback) {
            dl.loadType = "common";
            dl.getJSON(url, callback);
        };

        dl.appendLoadingGif();
        return dl;
    }
};