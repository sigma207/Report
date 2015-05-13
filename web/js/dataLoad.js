/**
 * Created by user on 2015/5/12.
 */
var DataLoad = {
    createNew: function () {
        var dl = {};
        dl.dataSource = null;
        dl.reportData = [];
        dl.reportColumns = [];
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

        dl.getJSON = function (url) {
            dl.showLoading();
            $.getJSON(url, function (data) {
                dl.dataSource = data;
                if (dl.loadType == "report") {
                    dl.dataFormat4Report();
                }
            }).error(function (jqXHR, textStatus, errorThrown) {
                if (jqXHR.getResponseHeader("Content-Length") == null || jqXHR.getResponseHeader("Content-Length") == "0") {
                    alert("查無資料！");
                } else {
                    alert("Service API Error [" + textStatus + "]" + jqXHR);
                }
                dl.hideLoading();
            }).complete(function () {
                dl.hideLoading();
                console.log("dataLoad complete");
                $(document).trigger("dataLoadComplete");
            });
        };

        dl.dataFormat4Report = function () {
            dl.reportColumns = dl.dataSource.ch.split(",");
            dl.reportData = [];
            var list = dl.dataSource.c.split('\u0003');
            var obj = {};
            for (var i = 0; i < list.length; i++) {
                obj = {};
                list[i].split("\u0002").forEach(function (elm, index, array) {
                    obj["column" + index] = elm;
                });
                dl.reportData.push(obj);
            }
            console.log("dataLoad dataFormat4Report");
        };

        dl.getReportJSON = function (url) {
            dl.loadType = "report";
            dl.getJSON(url);
        };

        dl.appendLoadingGif();
        return dl;
    }
};