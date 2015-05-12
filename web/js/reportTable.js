/**
 * Created by user on 2015/5/12.
 */
var DragTable = {
    createNew: function (tableClass) {
        var dt = {};//dragTable
        dt.tableClass = tableClass;
        dt.$table = $("." + tableClass);
        dt.$headTr = dt.$table.find("thead>tr");
        dt.$thArrowDiv;
        /**
         * The temporary array of all thObj, It will be use when generateTr().
         * In order to reduce DOM operation.
         * @type {Array}
         */
        dt.thObjList = [];
        dt.trList;
        dt.debug = false;
        dt.eventLogEnable = false;
        //dt.dragImgElement;
        dt.dragIndex = -1;
        dt.dropIndex = -1;
        dt.data = [];
        dt.dataSize = 0;
        dt.columnSize = 0;
        dt.columnFields = [];
        dt.renderTBody = "";

        dt.DRAG_OVER_CLASS = "dragOverColumn";
        dt.BASIC_TH_CLASS = "basicTH";
        dt.RISE_FALL_STYLE = "riseFallStyle";
        dt.FOREX_RISE_CLASS = "forexRise";
        dt.FOREX_FALL_CLASS = "forexFall";
        dt.STOCK_RISE_CLASS = "stockRiseZh";
        dt.STOCK_FALL_CLASS = "stockFallZh";
        dt.STOCK_CHANGE_COLOR_FIELD = "stockChangeColorField";
        dt.ORDER_BY = "orderBy";
        dt.DESC = "desc";
        dt.ASC = "asc";
        dt.COLUMN_TYPE = "type";
        dt.DECIMAL = "decimal";
        dt.FIELD = "field";
        dt.TD_CLASS = "tdClass";
        dt.ARROW_DIV = "arrowDiv";
        dt.DESC_ARROW = "descArrow";
        dt.ASC_ARROW = "ascArrow";
        dt.DATA_DATE_FORMATE = "YYYYMMDD";
        dt.DISPLAY_DATE_FORMATE = "YYYY-MM-DD";
        dt.DATA_TIME_FORMATE = "HHmmss";
        dt.DISPLAY_TIME_FORMATE = "HH:mm:ss";

        dt.init = function () {
            dt.initColumnField();
            var $th;
            for (var colIndex = 0; colIndex < dt.columnSize; colIndex++) {
                $th = dt.getThByIndex(colIndex);
                if (typeof($th.attr(dt.COLUMN_TYPE)) == "undefined") {
                    $th.attr(dt.COLUMN_TYPE, "text");
                }
                $th.attr(dt.ORDER_BY, "");
                $th.addClass(dt.BASIC_TH_CLASS);
                //append the arrow div for sort
                $th.append("<div class='" + dt.ARROW_DIV + "'></div>");
                $th.on("click", dt.sortColumnClick);
            }
            dt.$thArrowDiv = dt.$headTr.find("th>." + dt.ARROW_DIV);
            //add event listener for drag&down
            var thList = dt.getThList();
            thList.attr("draggable", true);
            thList.on("dragstart", dt.dragStart);
            thList.on("dragenter", dt.dragEnter);
            thList.on("dragleave", dt.dragLeave);
            thList.on("dragover", dt.dragOver);
            thList.on("dragend", dt.dragEnd);
            thList.on("drop", dt.drop);
        };

        dt.initColumnField = function () {
            var $th;
            var thList = dt.getThList();
            dt.columnSize = thList.length;
            dt.columnFields = [];
            for (var colIndex = 0; colIndex < dt.columnSize; colIndex++) {
                $th = dt.getThByIndex(colIndex);
                dt.columnFields.push($th.attr(dt.FIELD));
            }
        };

        /**
         * To save attribute of th, it will be use when generateTd().
         * @param $th
         * @returns {{th: *, type: *, decimal: (*|number), field: *, stockChangeColorField: *, orderBy: *, display: *, arrowDiv: (*|{}), externalClass: *}}
         */
        dt.thObject = function ($th) {
            var thObj = {
                "th": $th,
                "type": $th.attr(dt.COLUMN_TYPE),
                "decimal": $th.attr(dt.DECIMAL) || 0,
                "field": $th.attr(dt.FIELD),
                "stockChangeColorField": $th.attr(dt.STOCK_CHANGE_COLOR_FIELD),
                "riseFallStyle": $th.attr(dt.RISE_FALL_STYLE),
                "orderBy": $th.attr(dt.ORDER_BY),
                "display": $th.css("display"),
                "arrowDiv": $th.find(dt.ARROW_DIV),
                "externalClass": $th.attr(dt.TD_CLASS)
            };
            var format = "";
            var originalFormat = "";
            var dateTimeFormat = "";
            var digit = "";
            switch (thObj.type) {
                case "rate":
                    format = "%";
                //break;
                case "number":
                    for (var i = 0; i < thObj.decimal; i++) {
                        digit += "0";
                    }
                    format = "0,0." + digit + format;
                    break;
                case "date":
                    originalFormat = dt.DATA_DATE_FORMATE;
                    dateTimeFormat = dt.DISPLAY_DATE_FORMATE;
                    break;
                case "time":
                    originalFormat = dt.DATA_TIME_FORMATE;
                    dateTimeFormat = dt.DISPLAY_TIME_FORMATE;
                    break;
            }

            thObj.format = format;
            thObj.originalFormat = originalFormat;
            thObj.dateTimeFormat = dateTimeFormat;
            return thObj;
        };

        /**
         * refresh thObjList, make sure the thObjList have latest th attribute
         */
        dt.refreshThObjList = function () {
            dt.thObjList = [];
            var thList = dt.getThList();
            thList.each(function (i) {
                dt.thObjList.push(dt.thObject($(this)));
            });
        };

        dt.setDataSource = function (newData) {
            dt.data = newData;
            dt.dataSize = dt.data.length;
            var thList = dt.getThList();
            //find unempty 'orderBy' attribute of th from thList.
            var lastSortIndex = thList.filter("[" + dt.ORDER_BY + "='" + dt.DESC + "'],[" + dt.ORDER_BY + "='" + dt.ASC + "']").eq(0).index();
            if (lastSortIndex != -1) {
                dt.sortOrderBy(lastSortIndex, false);//keep last orderBy, so do not changes orderBy
            }
            dt.renderDom();
        };

        /**
         * Getting the th list.
         * @returns JQuery list
         */
        dt.getThList = function () {
            return dt.$headTr.children();
        };

        /**
         * Getting the th by Index.
         * @param index
         * @returns JQuery object
         */
        dt.getThByIndex = function (index) {
            return dt.getThList().eq(index);
        };

        /**
         * Getting the list of th and td by colIndex.
         * @param index
         * @returns  JQuery list
         */
        dt.getColumn = function (index) {
            return dt.$table.find("tr>th:nth-child(" + (index + 1) + "), tr>td:nth-child(" + (index + 1) + ")");
        };

        /**
         * ------------------------------------------------------------------
         * Operate Column
         * ------------------------------------------------------------------
         */
        dt.swapColumn = function () {
            if (dt.dropIndex != dt.dragIndex) {
                var $dragColumn = dt.getColumn(dt.dragIndex);
                var $dropColumn = dt.getColumn(dt.dropIndex);
                $dragColumn.each(function (i) {
                    DomTool.swapElements($(this)[0], $dropColumn.get(i));
                });
                dt.initColumnField();
            }
        };

        dt.sortColumnClick = function (e) {
            dt.sortOrderBy($(this).index(), true);
        };

        /**
         *
         * @param sortIndex
         * @param changeOrderBy
         */
        dt.sortOrderBy = function (sortIndex, changeOrderBy) {
            var $th = dt.getThByIndex(sortIndex);
            var currentOrderBy = $th.attr(dt.ORDER_BY);
            currentOrderBy = (currentOrderBy == dt.ASC || currentOrderBy == "") ? dt.ASC : dt.DESC;
            if (changeOrderBy) {
                currentOrderBy = (currentOrderBy == dt.ASC) ? dt.DESC : dt.ASC;
            }
            dt.sortColumn(sortIndex, currentOrderBy);
        };

        dt.sortColumn = function (sortIndex, orderBy) {
            dt.log("sortIndex=" + sortIndex + ":" + orderBy);
            var thList = dt.getThList();
            var $th = dt.getThByIndex(sortIndex);
            var type = $th.attr(dt.COLUMN_TYPE);
            var field = $th.attr(dt.FIELD);
            var arrowDiv = $th.find("." + dt.ARROW_DIV);
            //remove all arrow class
            dt.$thArrowDiv.removeClass(dt.DESC_ARROW);
            dt.$thArrowDiv.removeClass(dt.ASC_ARROW);

            if (orderBy == dt.ASC) {
                arrowDiv.addClass(dt.ASC_ARROW);
            } else {
                arrowDiv.addClass(dt.DESC_ARROW);
            }

            if (type == "number" || type == "rate") {
                JsonTool.sort(dt.data, field, orderBy);
            } else {
                JsonTool.sortString(dt.data, field, orderBy);
            }
            thList.attr(dt.ORDER_BY, "");//empty 'orderBy' attribute of all th
            $th.attr(dt.ORDER_BY, orderBy);//set 'orderBy' attribute of this th
            dt.renderDom();
        };
        /**
         * ------------------------------------------------------------------
         * Render TBody
         * ------------------------------------------------------------------
         */
        dt.renderDom = function () {
            //console.time("renderDom");
            dt.refreshThObjList();//refresh thObjList
            dt.renderTBody = "";
            for (var rowIndex = 0; rowIndex < dt.dataSize; rowIndex++) {
                dt.renderTBody += dt.generateTr(rowIndex);
            }
            dt.$table.find("tbody").html(dt.renderTBody);
            dt.trList = dt.$table.find("tbody").children();
            dt.trList.each(function(index){
                $(this).click(dt.onRowClick);
            });
            //console.timeEnd("renderDom");
        };

        dt.onRowClick = function(e){
            var tr = e.currentTarget;
            //var evt = new Event("rowClick");
            var tableClass = dt.tableClass;
            var rowIndex = $(tr).attr("rowIndex");
            var rowData = dt.data[rowIndex];
            $( document ).trigger( "rowClick", [ tableClass, rowIndex,rowData ] );
            //document.dispatchEvent(evt);
        };

        dt.generateTr = function (rowIndex) {
            var tr = "<tr rowIndex='"+rowIndex+"'>";
            var thObj;
            for (var colIndex = 0; colIndex < dt.columnSize; colIndex++) {
                thObj = dt.thObjList[colIndex];
                tr += dt.generateTd(thObj, colIndex, dt.data[rowIndex]);
            }
            tr += "</tr>";
            return tr;
        };

        /**
         *
         * @param thObj  reusable object
         * @param colIndex
         * @param rowData
         * @returns {string}
         */
        dt.generateTd = function (thObj, colIndex, rowData) {

            var tdClass = dt.generateTdClass(thObj, rowData);
            var tdStyle = dt.generateStyle(thObj.display);
            var tdValue = dt.generateValue(thObj, rowData);
            tdValue = dt.generateTdDiv(thObj,rowData,tdValue);
            return "<td" + tdClass + tdStyle + ">" + tdValue + "</td>";
        };

        dt.generateTdDiv = function(thObj,rowData,tdValue){
            var stockChangeColorField = thObj[dt.STOCK_CHANGE_COLOR_FIELD];
            var tdDiv = "";
            var divClass = "";
            var afterDiv = "";
            var riseFallStyle = thObj[dt.RISE_FALL_STYLE];
            if (typeof riseFallStyle !== typeof undefined && riseFallStyle !== false) {
                var change = rowData[stockChangeColorField];
                if(riseFallStyle=="forex"){
                    if (change >= 0) {
                        divClass += " " + dt.FOREX_RISE_CLASS;
                        afterDiv += "<div class='forexRiseArrow'></div>";
                    } else {
                        divClass += " " + dt.FOREX_FALL_CLASS;
                        afterDiv += "<div class='forexFallArrow'></div>";
                    }
                }
            }
            if(divClass!=""||afterDiv!=""){
                tdDiv = "<div class='"+divClass+"'>"+tdValue+"</div>"+afterDiv;
            }else{
                tdDiv = tdValue;
            }
            return tdDiv;
        };

        dt.generateTdClass = function (thObj, rowData) {
            var type = thObj[dt.COLUMN_TYPE];
            var externalClass = thObj.externalClass;
            var stockChangeColorField = thObj[dt.STOCK_CHANGE_COLOR_FIELD];
            var riseFallStyle = thObj[dt.RISE_FALL_STYLE];

            var tdClass = "";
            if (type == "number" || type == "rate" || type == "date" || type == "time") {
                tdClass += "numberTD";
            } else {
                tdClass += "baseTD";
            }

            //rise and fall class
            if (typeof stockChangeColorField !== typeof undefined && stockChangeColorField !== false) {
                var change = rowData[stockChangeColorField];
                if (typeof riseFallStyle !== typeof undefined && riseFallStyle !== false) {

                } else {
                    if (change >= 0) {
                        tdClass += " " + dt.STOCK_RISE_CLASS;
                    } else {
                        tdClass += " " + dt.STOCK_FALL_CLASS;
                    }
                }

            }
            if (typeof externalClass !== typeof undefined && externalClass !== false) {
                tdClass += " " + externalClass;
            }
            if (tdClass != "") {
                return " class='" + tdClass + "'";
            } else {
                return "";
            }
        };

        dt.generateStyle = function (display) {
            if (display == "none") {
                return " style='display:none'";
            } else {
                return "";
            }
        };

        dt.generateValue = function (thObj, rowData) {
            var value = rowData[thObj.field];
            if (thObj.format != "") {
                //console.log("format="+thObj.format+",value="+value);
                return numeral(value).format(thObj.format);
            } else if (thObj.dateTimeFormat != "") {
                return moment(value, thObj.originalFormat).format(thObj.dateTimeFormat);
            } else {
                return value;
            }
        };
        /**
         * ------------------------------------------------------------------
         * Drag&Down
         * ------------------------------------------------------------------
         */
        dt.dragStart = function (e) {
            dt.eventLog("dragStart");
            dt.dragIndex = $(this).index();
            e.originalEvent.dataTransfer.setData("text/plain", "anything");

            //dt.dragImgElement = e.originalEvent.target.cloneNode(true);
            //dt.dragImgElement.style.backgroundColor = "red";
            //dt.dragImgElement.style.position = "absolute"; dt.dragImgElement.style.top = "0px"; dt.dragImgElement.style.right = "0px";
            //document.body.appendChild(dt.dragImgElement);
            //e.originalEvent.dataTransfer.setDragImage(dt.dragImgElement, 0, 0);

            e.originalEvent.target.style.opacity = "0.4";
        };

        dt.dragEnter = function (e) {
            dt.eventLog("dragEnter");
            $(this).addClass(dt.DRAG_OVER_CLASS);
        };

        dt.dragLeave = function (e) {
            dt.eventLog("dragLeave");
            $(this).removeClass(dt.DRAG_OVER_CLASS);
        };

        dt.dragOver = function (e) {
            e.preventDefault();
            e.originalEvent.dataTransfer.dropEffect = "move";
            return false;
        };

        dt.dragEnd = function (e) {
            dt.eventLog("dragEnd");
            //原本放在dr.drop(),但如果drop在th以外的地方就不會觸發drop
            dt.getThList().removeClass(dt.DRAG_OVER_CLASS);
            dt.getThList().css("opacity", "1");
            //document.body.removeChild(dt.dragImgElement);
        };

        dt.drop = function (e) {
            dt.eventLog("drop");
            e.preventDefault();
            dt.dropIndex = $(this).index();
            dt.swapColumn();
            return false;
        };
        /**
         * ------------------------------------------------------------------
         * Show&Hide column
         * ------------------------------------------------------------------
         */
        dt.hideColumn = function (index) {
            if (index < dt.columnSize) {
                dt.getColumn(index).hide();
            }
        };

        dt.showColumn = function (index) {
            if (index < dt.columnSize) {
                dt.getColumn(index).show();
            }
        };

        /**
         * ------------------------------------------------------------------
         * Log
         * ------------------------------------------------------------------
         */
        dt.eventLog = function (msg) {
            if (dt.eventLogEnable)
                dt.log(msg);
        };

        dt.log = function (msg) {
            if (dt.debug)
                console.log("dragTable log:" + msg);
        };
        /**
         * ------------------------------------------------------------------
         * Function End
         * ------------------------------------------------------------------
         */
        dt.init();
        return dt;
    }
};