/**
 * Created by user on 2015/5/13.
 */
var baseUrl="http://122.152.162.81:8080/cfdcreativebo/query/";
var css="red";
function today() {
    var today = new Date();
    var yyyy = today.getFullYear().toString();
    var mm = (today.getMonth() + 1).toString(); // getMonth() is zero-based
    var dd = today.getDate().toString();
    return yyyy + (mm[1] ? mm : "0" + mm[0]) + (dd[1] ? dd : "0" + dd[0]); // padding
};
function toYYYYMMDD(day) {

    var yyyy = day.getFullYear().toString();
    var mm = (day.getMonth() + 1).toString(); // getMonth() is zero-based
    var dd = day.getDate().toString();
    return yyyy + (mm[1] ? mm : "0" + mm[0]) + (dd[1] ? dd : "0" + dd[0]); // padding
};

function hhmmssTohh_mm_ss(dateStr) {
    var str = dateStr.substring(0, 2) + ":" + dateStr.substring(2, 4) + ":" + dateStr.substring(4);
    return str;
}

function getUrlParameter(sParam) {
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++) {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam) {
            return sParameterName[1];
        }
    }
}
