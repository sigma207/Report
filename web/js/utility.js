/**
 * Created by user on 2015/5/13.
 */
var baseUrl = "http://122.152.162.81:8080/cfdcreativebo/query/";
var css = "red";
//var css = "blue";
//var css = "black";
function today() {
    var today = new Date();
    var yyyy = today.getFullYear().toString();
    var mm = (today.getMonth() + 1).toString(); // getMonth() is zero-based
    var dd = today.getDate().toString();
    return yyyy + (mm[1] ? mm : "0" + mm[0]) + (dd[1] ? dd : "0" + dd[0]); // padding
}

function toYYYYMMDD(day) {

    var yyyy = day.getFullYear().toString();
    var mm = (day.getMonth() + 1).toString(); // getMonth() is zero-based
    var dd = day.getDate().toString();
    return yyyy + (mm[1] ? mm : "0" + mm[0]) + (dd[1] ? dd : "0" + dd[0]); // padding
}

function hhmmssTohh_mm_ss(dateStr) {
    var str = dateStr.substring(0, 2) + ":" + dateStr.substring(2, 4) + ":" + dateStr.substring(4);
    return str;
}

$.browser = {};
initBrowser();
function initBrowser() {
    $.browser.mozilla = /firefox/.test(navigator.userAgent.toLowerCase());
    $.browser.webkit = /webkit/.test(navigator.userAgent.toLowerCase());
    $.browser.opera = /opera/.test(navigator.userAgent.toLowerCase());
    $.browser.msie = /msie/.test(navigator.userAgent.toLowerCase()) || !!navigator.userAgent.match(/Trident.*rv\:11\./);
    $.browser.lang = window.navigator.userLanguage || window.navigator.language;
    $.browser.param = {};
    initUrlParameter();
    function initUrlParameter() {
        var sPageURL = window.location.search.substring(1);
        var sURLVariables = sPageURL.split('&');
        for (var i = 0; i < sURLVariables.length; i++) {
            var sParameterName = sURLVariables[i].split('=');
            $.browser.param[sParameterName[0]] = sParameterName[1];
        }
    }
}

function getUrlParameter(sParam) {
    return $.browser.param[sParam];
}

var JsonTool = {
    sortString: function (json, property, order) {
        json.sort(function (a, b) {
            if (order == "" || order == "asc") {
                return a[property].localeCompare(b[property]);
            } else {
                return b[property].localeCompare(a[property]);
            }
        });
    },
    sort: function (json, property, order) {
        json.sort(function (a, b) {
            if (order == "" || order == "asc") {
                return a[property] - b[property];
            } else {
                return b[property] - a[property];
            }
        });
    },
    formatFloat: function (num, pos) {
        var size = Math.pow(10, pos);
        return Math.round(num * size) / size;
    },
    random: function (min, max) {
        return Math.random() * (max - min) + min;
    },
    randomInt: function (min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
};

var DomTool = {
    /**
     * http://stackoverflow.com/questions/8034918/jquery-switch-elements-in-dom
     * pure dom element swap
     * @param elm1
     * @param elm2
     */
    swapElements: function (elm1, elm2) {
        var parent1, next1,
            parent2, next2;

        parent1 = elm1.parentNode;
        next1 = elm1.nextSibling;
        parent2 = elm2.parentNode;
        next2 = elm2.nextSibling;

        parent1.insertBefore(elm2, next1);
        parent2.insertBefore(elm1, next2);
    },
    appendCss: function (href) {
        $("head").append($("<link rel='stylesheet' type='text/css' href='" + href + "'>"));
    }
};

var SelectTool = {
    getTimeOptionHtml: function (value, text, selected) {
        if(value<10)value="0"+value;
        if(text<10)text="0"+text;
        return SelectTool.getOptionHtml(value,text,selected);
    },
    getOptionHtml: function (value, text, selected) {
        selected = (selected)?"selected":"";
        return "<option value='" + value + "' " + (selected || "") + ">" + text + "</option>";
    },
    generateTimeOptions: function (max) {
        var options = [];
        var text = "";
        for (var i = 0; i < max; i++) {
            text = (i < 10) ? "0" + i : i.toString();
            options.push({
                value: text,
                label: text
            });
        }
        return options;
    }
};
