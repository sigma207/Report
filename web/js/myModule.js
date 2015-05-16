/**
 * Created by user on 2015/5/16.
 */

angular.module("dataLoadFactory", []).factory("myDataLoad", ["$http", function ($http) {
    return {
        "rowSymbol": "\u0003",
        "colSymbol": "\u0002",
        "dataSource": null,
        "loadC": [],
        "loadCh": [],
        "loadingGif": null,
        "loadType": "report",
        appendLoadingGif: function () {
            var htmlStr = "<div id='loadinggif' style='left:50%;top:50%;z-index:100;position: fixed; background-color: rgba(255, 255, 255, 0.9); display:block' >";
            htmlStr += "<center><img src='image/ajax-loader.gif'></center></div>";
            $("body").prepend(htmlStr);

            this.loadingGif = $("#loadinggif");
            this.hideLoading();
        },
        showLoading: function () {
            this.loadingGif.show();
        },
        hideLoading: function () {
            this.loadingGif.hide();
        },
        getJSON: function (url, callback) {
            var self = this;
            if (self.loadingGif == null) {
                self.appendLoadingGif();
            }
            self.showLoading();
            console.time("getJSON");
            $http({
                method: "GET",
                url: url
            }).success(function (data, status, headers, config) {
//                    console.log(status);
                console.timeEnd("getJSON");
                self.hideLoading();
                self.dataSource = data;
                if (self.loadType == "report") {
                    self.dataFormat4Report();
                } else if (self.loadType == "common") {
                    self.dataFormat4Common();
                }
                callback.call(self);
            }).error(function (data, status, headers, config) {
                console.timeEnd("getJSON");
                self.hideLoading();
                alert(status);
            });
        },
        getCommonJSON: function (url, callback) {
            this.loadType = "common";
            this.getJSON(url, callback);
        },
        getReportJSON: function (url, callback) {
            this.loadType = "report";
            this.getJSON(url, callback);
        },

        dataFormat4Common: function () {
            this.loadC = [];
            var list = this.dataSource.c.split(this.rowSymbol);
            var count = list.length;
            var obj = null;
            for (var i = 0; i < count; i++) {
                obj = [];
                list[i].split(this.colSymbol).forEach(function (elm, index, array) {
                    obj.push(elm);
                });
                this.loadC.push(obj);
            }
        },
        dataFormat4Report: function () {
            console.time("dataFormat4Report");
            this.loadCh = this.dataSource.ch.split(",");
            this.loadC = [];
            var list = this.dataSource.c.split(this.rowSymbol);
            var count = list.length;
            var obj = null;
            for (var i = 0; i < count; i++) {
                obj = {};
                list[i].split(this.colSymbol).forEach(function (elm, index, array) {
                    obj["column" + index] = elm;
                });
                this.loadC.push(obj);
            }
        }
    };
}])
;