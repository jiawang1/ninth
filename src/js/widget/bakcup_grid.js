(function(factory){
    "use strict";
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    }
    else if(typeof exports === 'object') {
        factory(require('jquery'));
    }
    else {
        factory(jQuery);
    }

})(function($) {
    "use strict";

    var gridview = function (options) {        
        var container = $(arguments[0]),
        opts = arguments[1] || {},
        delegate = opts.delegate,
        /**
         * checkType: 0 none
         *            1 checkbox
         *            2 radio button
         */
        checkType = opts.checkType || 0,
        gvCtrls = [],
        self = this,
        colSpec = null,
        gridContainer = $("<div>").addClass("gridContainer"),
        table = $("<table>").addClass("grid").attr({cellspacing:0}),
        thead = $("<thead>"),
        tbody = $("<tbody>"),
        pagingArea = null,
        pagingAction = null,
        pagingLoadWindow = null,
        rowCount = 0,
        tip = null,
        floatHeader = null,
        offset = null,

        checkAllCtrl = null,

        isShown = false,
        filters = [],
        rowSelectedEvent = [],
        rowCheckEvent = [];

        var startMove = false;
        var currentTh = null;

        function getDelegate() {
            return delegate;
        }

        function isReady() {
            return container[0].clientWidth > 0 ? true : false;
        }

        function searchText(inputText) {
            var text = $.trim(inputText);
            var regStr = text.replace(/\\/g, "\\\\");
            if(regStr=="."){
                regStr = regStr.replace(/./g, "\\.");
            }
            
            /***************************/
            var allTr = tbody.find("tr");
            if(allTr && allTr.length>0){
                for(var i=0;i<allTr.length;i++){
                    allTr[i].style.display=null;
                }
            }
            var alltd = tbody.find("td");
            if(alltd && alltd.length>0){
                for(var i=0;i<alltd.length;i++){
                    var td = alltd[i];
                    var originalText = $(td).attr("OriginalText");
                    if(originalText){
                        $(td).first().text(originalText);
                    }
                }
            }
            /****************************/
            
            var hideTrs = tbody.find("tr:notContainsNotCaseSensitive('"+ text +"')");
            if(hideTrs && hideTrs.length>0){
                for(var i=0;i<hideTrs.length;i++){
                    hideTrs[i].style.display="none";
                }
            }
            var trs = tbody.find("tr:containsNotCaseSensitive('"+ text +"')");
            var tds = tbody.find("td:containsNotCaseSensitive('"+ text +"')");
            if(tds && tds.length>0){
                for(var j =0;j<tds.length;j++){
                    var td = tds[j];
                    var children = $(td).first().children();
                    if(!children || children.length <=0){
                        var reg = "/"+regStr+"/i";
                        var matchText = $(td).first().text().match(eval(reg));
                        
                        $(td).attr({"OriginalText":$(td).first().text()});
                        var newText = $(td).first().text().replace(eval(reg), "<b style='color:#FFFF00;background-color:#000000;'>"+matchText+"</b>");
                        $(td).first().html(newText).append(children);
                    }
                }
            }
        }

        function sort(event){
            if(startMove){
                return;
            }
            var dataType=$(this).attr('dataType');
            var sortType=$(this).attr('sortType');
            var btnSort = $(this).find("#btnSort");
            if(!btnSort || btnSort.length==0){
                btnSort = $("<a>").attr({id: "btnSort"}).addClass('sort_down');
                $(this).find("section").append(btnSort);
            }
            $('.sort_down').removeClass();
            $('.sort_up').removeClass();
            if(!sortType || sortType===""){
                sortType='ASC';
                btnSort.addClass("sort_up");
                $(this).attr('sortType','ASC');
            }else if(sortType === 'ASC'){
                sortType='DESC';
                btnSort.addClass("sort_down");
                $(this).attr('sortType','DESC');
            }else if(sortType === 'DESC'){
                sortType='ASC';
                btnSort.addClass("sort_up");
                $(this).attr('sortType','ASC');
            }
            var index=$(this).index()+1;
            var values=[];
            var row=tbody.find('tr');
             
            if(event.data){
                 $.each(row,function(i){
                    
                    var dataIndex = $(this).data('dataIndex');
                     
                     if(dataIndex === undefined){
                         $(this).data('dataIndex', i);
                         var rowData = event.data.delegation.getRow(i);
                     }else{
                         var rowData = event.data.delegation.getRow(dataIndex);
                     }
                     values[i] = row[i];
                     values[i]['sortData'] = rowData[event.data.sortedBy];
                    
                    });
                
            }else{
                 $.each(row,function(i){ 
                     
                        var dataIndex = $(this).data('dataIndex');
                         if(dataIndex === undefined){
                             $(this).data('dataIndex', i);
                         }
                     values[i]=row[i] });
            }
            
            values.sort(sortData(index,dataType,sortType));
            
            $.each(values, function(i){
                if( values[i]['sortData'] !== undefined){
                    delete values[i]['sortData'];
                }
            });
            
            $('.sorted').removeClass();
            $(this).addClass('sorted');

            var fragment=document.createDocumentFragment();
            $.each(values,function(i){
                fragment.appendChild(values[i]);
            });

            tbody.append(fragment);
        }

        function sortData(index, dataType, sortType) {
            var parseData = function (data, dataType) {
                switch(dataType) {
                case 'number':
                    return parseFloat(data) || 0;
                case 'datetime':
                    return Date.parse(data)||0;
                default:
                    return data;
                }
            };

            return function (value1, value2) {
                var dataA, dataB;
                if (value1['sortData'] !== undefined){
                    dataA = parseData(value1['sortData'], dataType);
                    dataB = parseData(value2['sortData'], dataType);
                } else {
                    var textA = $(value1).find('td:nth-child(' + index + ')').text();
                    var textB = $(value2).find('td:nth-child(' + index + ')').text();
                    dataA = parseData(textA,dataType);
                    dataB = parseData(textB,dataType);
                }

                if (!dataType || dataType === "string") {
                    dataA = dataA + '';
                    dataB = dataB + '';
                    return sortType==='ASC' ? dataA.localeCompare(dataB) : dataB.localeCompare(dataA);
                } else {
                    return sortType==='ASC' ? dataA > dataB : dataA < dataB;
                }
            };
        }
        var leftCol, rightCol, maxLeft, maxRight, oLeftCol, oRightCol;
        
        function onMousedown(event) {
            event = event || window.event;
            var $target = $(event.target||event.srcElement);
//            var self = $(this);
             // ignore first column and last column
             if ($target.prevAll().length < 1 || $target.nextAll().length < 1) {
                 return;
             }
             var position = $target.offset();
             var width = event.clientX - position.left;
             if (width < 2 || ($target.width() - width) < 2) {
                $target.css({ 'cursor': 'col-resize' });
                 startMove = true;
                 if (width < $target.width() / 2) {
                     currentTh = $target.prev();
                     leftCol = $target.prev();
                     rightCol = $target;
                 }
                 else {
                     currentTh = $target;
                     leftCol = $target;
                     rightCol = $target.next();
                 }
                 
                 if(floatHeader){
                   oLeftCol = thead.find("tr th").eq(leftCol.prevAll().length);
                   oRightCol = thead.find("tr th").eq(rightCol.prevAll().length);

                 }
                 maxLeft = $(leftCol).offset().left;
                 maxRight = $(rightCol).offset().left +$(rightCol).width() ;
             }else{
                currentTh = null;
                startMove = false;
             }
        }

        function onMousemove(event) {
            
             if(startMove === true && currentTh){
                 var leftWidth = event.clientX - maxLeft;
                 var rightWidth = maxRight - event.clientX;
                 if(leftWidth < 16 || rightWidth < 16 ){
                    return;
                 }else{
                    $(leftCol).width(leftWidth);
                    $(rightCol).width(rightWidth);
                    if(floatHeader){
                        oLeftCol.width(leftWidth);
                        oRightCol.width(rightWidth);
                    }
                 }
//                var position = currentTh.offset();
//                var index = currentTh.prevAll().length;
//                if(index !=0){
//                    var width1 = event.clientX - position.left;
//                    currentTh.width(width1);
//                    thead.find("th").eq(index).width(width1);
//                    onAfterDragged();
//                }
             }
//                if(!startMove){
//                    self.css({ 'cursor': 'default' });
//                }
//             if (width < 2 || (self.width() - width) < 2 ) {
//                 self.css({ 'cursor': 'col-resize' });
//             }else{
//                if(!startMove){
//                    self.css({ 'cursor': 'default' });
//                }
//             }
         }

         function onMouseup(event) {
            event = event || window.event;
            var $target = $(event.target||event.srcElement);
            $target.css({ 'cursor': 'default' });
            if (startMove === true) {
                currentTh = null;
                startMove = false;
                leftCol = null; 
                rightCol = null;
                maxLeft = -1;
                maxRight= -1;
                oLeftCol= null;
                oRightCol= null;
            }
         }
         
         /*****************************Do not delete***************************************/
         // function onMousemove(event) {
            // var self = $(this);
            // var left = self.offset().left;
            // var width = event.clientX - left;
            // if(startMove == true && currentTh){
                // var index = currentTh.prevAll().length;
                // if(index != 0) {
                    // var cols = index + currentTh.nextAll().length + 1;
                    // var totalWidth=0, rightWidth=0, i;
                    // thead.find("th").each(function(index1,obj){
                        // if(index1 !=0){
                            // totalWidth += $(this).width();
                        // }
                        // if(index1 >= index){
                            // rightWidth +=  $(this).width();
                        // }
                    // });
                    // var minWidth = totalWidth/200;
                    // var currWidth = currentTh.width();
                    // var position = currentTh.offset();
                    // var mouseX = event.clientX - 10;
                    // if (mouseX < position.left + minWidth)
                        // mouseX = position.left + minWidth;
                    // var rightmost = thead.find("th").eq(cols-1).offset().left + thead.find("th").eq(cols-1).width() - 3*minWidth *(cols-index);
                    // if (mouseX > rightmost)
                        // mouseX = rightmost;
                    // var newWidth = mouseX - position.left;
                    // var p = newWidth * 100 / totalWidth;
                    // var max = rightWidth*100/totalWidth -(cols-index-1)/2;
                    // if(p > max) p = max;
                    // currentTh.css("width", p+"%");
                    // thead.find("th").eq(index).css("width", p+"%");
                    // var move = 0, colWidth=0;
                    // for(i=index+1; i<cols; i++) {
                        // colWidth = thead.find("th").eq(i).width() * (rightWidth - newWidth) / (rightWidth-currWidth) - move;
                        // if(colWidth < minWidth) {
                            // move = minWidth - colWidth;
                            // colWidth = minWidth;
                        // }
                        // p = colWidth* 100 / totalWidth;
                        // if(floatHeader){
                            // floatHeader.find("th").eq(i).css("width", p+"%");
                        // }
                        // thead.find("th").eq(i).css("width", p+"%");
                    // }
                    // onAfterDragged();
                // }
             // }
             // if (width < 2 || (self.width() - width) < 2 ) {
                 // self.css({ 'cursor': 'col-resize' });
             // }else{
                // if(!startMove){
                    // self.css({ 'cursor': 'default' });
                // }
             // }
         // }
    // 
         // function onMouseup(event) {
            // var self = $(this);
            // self.css({ 'cursor': 'default' });
            // if (startMove == true && currentTh) {
                // currentTh.css({ 'cursor': 'default' });
                // var index = currentTh.prevAll().length;
                // if(index != 0) {
                    // var cols = index + currentTh.nextAll().length + 1;
                    // var totalWidth=0, rightWidth=0, i;
                    // thead.find("th").each(function(index1,obj){
                        // if(index1 !=0){
                            // totalWidth += $(this).width();
                        // }
                        // if(index1 >= index){
                            // rightWidth +=  $(this).width();
                        // }
                    // });
                    // var minWidth = totalWidth/200;
                    // var currWidth = currentTh.width();
                    // var position = currentTh.offset();
                    // var mouseX = event.clientX - 10;
                    // if (mouseX < position.left + minWidth)
                        // mouseX = position.left + minWidth;
                    // var rightmost = thead.find("th").eq(cols-1).offset().left + thead.find("th").eq(cols-1).width() - 3*minWidth *(cols-index);
                    // if (mouseX > rightmost)
                        // mouseX = rightmost;
                    // var newWidth = mouseX - position.left;
                    // var p = newWidth * 100 / totalWidth;
                    // var max = rightWidth*100/totalWidth -(cols-index-1)/2;
                    // if(p > max) p = max;
                    // currentTh.css("width", p+"%");
                    // thead.find("th").eq(index).css("width", p+"%");
                    // var move = 0, colWidth=0;
                    // for(i=index+1; i<cols; i++) {
                        // colWidth = thead.find("th").eq(i).width() * (rightWidth - newWidth) / (rightWidth-currWidth) - move;
                        // if(colWidth < minWidth) {
                            // move = minWidth - colWidth;
                            // colWidth = minWidth;
                        // }
                        // p = colWidth* 100 / totalWidth;
                        // if(floatHeader){
                            // floatHeader.find("th").eq(i).css("width", p+"%");
                        // }
                        // thead.find("th").eq(i).css("width", p+"%");
                    // }
                    // onAfterDragged();
                    // currentTh = null;
                    // startMove = false;
                // }else{
                    // currentTh = null;
                    // startMove = false;
                // }
            // }
         // }
         /******************************************************************************************************/

         function onAfterDragged(){
            var values=[];
            var row=tbody.find('tr');
            $.each(row,function(i){ values[i]=row[i] });
            var fragment=document.createDocumentFragment();
            $.each(values,function(i){
                fragment.appendChild(values[i]);
            });
            tbody.append(fragment);
         }

         $("body").bind("mouseup", onMouseup);

         function show() {
             /* auto resize its height */
             if (delegate.autoResize != null && delegate.autoResize() > 0 && container) {
                 $(container).css("height", ($(window).height() - delegate.autoResize() + 6) + 'px');
                 $(gridContainer).css("height", ($(window).height() - delegate.autoResize()) + 'px');
             }

            if (isReady()) {
                onShow();
                isShown = true;
            } else {
                window.setTimeout((function(that){return function(){that.show();};})(this), 800);
            }
         };
        self.autoResize = function () {
            if (delegate.autoResize != null && delegate.autoResize() > 0 && container) {
                $(container).css("height", ($(window).height() - delegate.autoResize() + 6) + 'px');
                $(gridContainer).css("height", ($(window).height() - delegate.autoResize()) + 'px');
            }
        };
        $(window).resize(function () {
            /* auto resize its height */
            self.autoResize();
        });
        function onShow() {
            thead.empty();
            tbody.empty();

            if (delegate) {
                renderHeader();
                renderBody();
                if (delegate.pagingMode === true){
                    if(!pagingArea) {
                        pagingArea = new PagingArea(container,delegate.pageSize);}
                    pagingArea.refreshPageArea();
                }
            }

            offset = table.position();
        }

        function reload() {
            $('.sort_down').removeClass();
            $('.sort_up').removeClass();
            /* auto resize its height */
            if (delegate.autoResize != null && delegate.autoResize() > 0 && container) {
                $(container).css("height", ($(window).height() - delegate.autoResize() + 6) + 'px');
                $(gridContainer).css("height", ($(window).height() - delegate.autoResize()) + 'px');
            }

            if(isShown){
                tbody.empty();

                if(delegate){
                    renderBody();
                    if(delegate.pagingMode === true){
                        if(!pagingArea){
                            pagingArea = new PagingArea(container,delegate.pageSize);
                            }
                            pagingArea.refreshPageArea();

                    }
                }

            }
//          else {
//              window.setTimeout((function(that){return function(){that.reload();};})(this), 800);
//          }
        }

        // original code
        // function fnSort(evt){
            // var trs=tbody.children() ,sortType,isNum=true,i,len,text,
            // cellIndex=evt.currentTarget.cellIndex,newTRs;
            // sortType=evt.currentTarget.getAttribute('sort');
            // for(i=0,len=trs.length;i<len;i++){
            // text=trs[i].childNodes[cellIndex].innerText.trim();
            // if(text.substring(0,2)==="00")
            // {
                // isNum=false;
                // break;
            // }
            // else if(isNaN(+text)){
                // isNum=false;
                // break;
            // }
            // }
            // if(sortType==='ASC'){
            // sortType='DESC';
            // }
            // else
            // {
            // sortType='ASC';
            // }
            // evt.currentTarget.setAttribute('sort',sortType);
            // newTRs=trs.sort(function(a,b){
                    // var aTd,bTd;
                    // aTd=isNum?+a.childNodes[cellIndex].innerText.trim():a.childNodes[cellIndex].innerText.trim();
                    // bTd=isNum?+b.childNodes[cellIndex].innerText.trim():b.childNodes[cellIndex].innerText.trim();
                    // return sortType==='ASC'?aTd>bTd:aTd<bTd;
                    // });
           // // tbody.empty();
            // tbody.append(newTRs);
    //
        // }

        function refreshContent(){
            if(isShown){
                tbody.empty();

                if(delegate){
                    renderBody();
                    if(pagingAction){
                        pagingAction.call(pagingArea);
                        pagingAction = null;

                        if(pagingLoadWindow){
                            pagingLoadWindow.close();
                        }
                    }
                }
            }
        }

        function renderHeader(){
            if(delegate.getHeaderSpec){
                colSpec = delegate.getHeaderSpec();
                var headRow = $("<tr>").css("position", "inherit");

                if (checkType) {
                    if (checkType == 1) {
                        checkAllCtrl = $("<input>").attr({ type: "checkbox" });
                        if (delegate.HideCheckAll == true) {
                            checkAllCtrl.css({ "display": "none" });
                        }
                        else {
                            checkAllCtrl.css({ "display": "inline" });
                        }

                        if (delegate.removeCheckAll) {
                            headRow.append($("<th>").css({ width: "20px" }));
                        }
                        else {
                            checkAllCtrl.click(function () {
                               opCheckOnAll(this.checked);
                            });
                            headRow.append($("<th>").append(checkAllCtrl).css({ width: "20px" }));
                        }
                    }
                    else if (checkType == 2) {
                        headRow.append($("<th>").css({ width: "20px" }));
                    }
                } else {
                    if (delegate.needExport && delegate.needExport() == false) {
                        headRow.append($("<th>").addClass('row_indicator_noIcon'));
                    }
                    else {
                        var th = $("<th>").addClass('row_indicator').css('cursor', 'pointer');
                        th.attr("title", "data export");
                        th.click(function () {
                            var count = delegate.getRowCount();
                            if (count && count > 0) {
                                var data = [];
                                for (var i = 0; i < count; i++) {
                                    data.push(delegate.getRow(i));
                                }

                                var colList = delegate.getHeaderSpec();
                                new exportCSV(this, { colList: colList, data: data });
                            }
                        });
                        headRow.append(th);
                    }
                }

                for(var i = 0; i < colSpec.length; i++){
                    var headCellDesc = colSpec[i],
                    headCell = $("<th>");
                    //headCell.bind("click",sort);
                    if(delegate.disableSort){
                        if(!delegate.disableSort()){
                            
                            if(headCellDesc.sortedBy){
                                 headCell.bind("mouseup",{sortedBy: headCellDesc.sortedBy, delegation: delegate},sort);
                            }else{
                             headCell.bind("mouseup",sort);
                                }
                            }
                    }else{
                            if(headCellDesc.sortedBy){
                                 headCell.bind("mouseup",{sortedBy: headCellDesc.sortedBy, delegation: delegate},sort);
                            }else{
                                 headCell.bind("mouseup",sort);
                            }
                    }

//                     headCell.bind("mousedown",onMousedown);
//                     headCell.bind("mousemove",onMousemove);
//                     headCell.bind("mouseup",onMouseup);


                    if(headCellDesc.width){
                        headCell.css({width:headCellDesc.width});
                        // if has float header, so just update the th's width
                        if(floatHeader){
                            floatHeader.find("th").eq(i+1).width(headCellDesc.width);
                        }
                    }
                    if(headCellDesc.dataType){
                        headCell.attr('dataType', headCellDesc.dataType);
                    }

                    //headCell.append(headCellDesc.description);
                    headCell.attr('title', headCellDesc.description);

                    var toolsContainer = $("<section>").css({ "display": "block","float":"left"});

                    if (headCellDesc.filter) {
                        var btnFilter = $("<a>").attr({ href: '#', id: "btnFilter_" + i }).addClass('filter');

                        btnFilter.click((function (jqObj, columnField) {
                            return function (e) {
                                var field = columnField;
                                var queryPanel = $("<section>").css({ "padding": "0 10px" }).addClass("gridPopup");

                                if (columnField.filter.mode == 0) {
                                    var row = $("<div>").addClass("row");
                                    var tbx = $("<input>").attr({ "type": "textbox" });

                                    row.append($("<div>").append(columnField.description).addClass("rowName"));
                                    row.append($("<div>").append(tbx).addClass("rowValue"));

                                    var tools = $("<div>").addClass("toolbar");
                                    var btnOK = $("<input>").attr({ "type": "button", "value": localizedString("MISC_FILTER") });
                                    var btnReset = $("<input>").attr({ "type": "button", "value": localizedString("MISC_RESET") });
                                    tools.append(btnOK);
                                    tools.append(btnReset);
                                    queryPanel.append(row);
                                    queryPanel.append(tools);

                                    btnOK.click(function () {
                                        jqObj.addClass("filtered");
                                        if (!jqObj.filterField) {
                                            jqObj.filterField = {};
                                            filters.push(jqObj.filterField);
                                        }
                                        jqObj.filterField["columnName"] = field.name;
                                        jqObj.filterField["filter"] = tbx.val();

                                        if (jqObj.filterField["filter"] == "") {
                                            jqObj.removeClass("filtered");
                                        }

                                        self.reload();
                                        jqObj.popup.close();
                                    });

                                    btnReset.click(function () {
                                        tbx.val("");
                                        tbx.focus();
                                    });
                                } else if (columnField.filter.mode == 1) {
                                    var datalist = $("<select>").attr({ "multiple": true }).addClass("datalist");
                                    var filteredFields = {};

                                    for (var rowIdx = -1; rowIdx < rowCount; rowIdx++) {
                                        var value = -1;
                                        var rowData = null;
                                        if (rowIdx != -1) {
                                            rowData = delegate.getRow(rowIdx);
                                            if (!(rowData.VisibleFilterValue == false) || jqObj.filtered == true) {
                                                value = rowData[columnField.name];

                                                if (filteredFields[value] == undefined) {
                                                    filteredFields[value] = {};
                                                    filteredFields[value]["dataArray"] = [];
                                                    filteredFields[value]["dataArray"].push(rowData);
                                                }
                                                else {
                                                    filteredFields[value]["dataArray"].push(rowData);
                                                    continue;
                                                }
                                            }
                                            else {
                                                continue;
                                            }

                                        }
                                        var option = $("<option>");

                                        var status = true;
                                        if (rowData != null) {
                                            status = rowData.VisibleFilterValue == false ? false : true;
                                        }
                                        else {
                                            if (jqObj.filtered == true) {
                                                status = false;
                                            }
                                        }

                                        var checkbox = $("<input>").attr({ "type": "checkbox", "checked": status });
                                        option.append(checkbox);
                                        if (rowIdx == -1) {
                                            checkbox.allSelector = true;
                                            checkbox.addClass("All");
                                            option.append("All");
                                        } else {
                                            option.append(value);
                                        }
                                        option.attr({ "value": value });
                                        datalist.append(option);

                                        checkbox.filteredField = filteredFields[value];

                                        option.click((function (cbx, data) {
                                            return function (e) {
                                                if (!(this.disabled == true)) {
                                                    var value = !cbx.attr("checked");

                                                    if (data) {
                                                        data.VisibleFilterValue = value;
                                                    }

                                                    cbx.attr("checked", value);
                                                    if (cbx.allSelector) {
                                                        var result = datalist.find("option>input");
                                                        result.attr("checked", value);

                                                        showAllData(value);

                                                    } else {
                                                        if (value == false) {
                                                            datalist.find("option>input.All").attr("checked", false);
                                                        }

                                                        for (var i = 0; i < cbx.filteredField.dataArray.length; i++) {
                                                            cbx.filteredField.dataArray[i].VisibleFilterValue = value;
                                                        }
                                                    }
                                                }
                                            }
                                        })(checkbox, rowData));
                                    }

                                    if (datalist.find("option").length == 1) {
                                        datalist.find("option").attr("disabled", true);
                                        datalist.find("input").attr("disabled", true);
                                    }

                                    var tools = $("<div>").addClass("toolbar").addClass("mode2");
                                    var btnOK = $("<input>").attr({ "type": "button", "value": localizedString("MISC_OK") });
                                    var btnCancel = $("<input>").attr({ "type": "button", "value": localizedString("MISC_CANCEL") });

                                    btnOK.click(function () {
                                        var value = datalist.find("option>input.All").attr("checked");

                                        if (value) {
                                            jqObj.filtered = false;
                                            jqObj.removeClass("filtered");
                                        } else {
                                            jqObj.filtered = true;
                                            jqObj.addClass("filtered");
                                        }

                                        self.reload();
                                        jqObj.popup.close();
                                    });

                                    btnCancel.click(function () {
                                        jqObj.popup.close();
                                    });

                                    tools.append(btnOK);
                                    tools.append(btnCancel);

                                    queryPanel.append(datalist);
                                    queryPanel.append(tools);
                                }

                                if (jqObj.popup) {
                                    if (jqObj.popup.getVisible()) {
                                        jqObj.popup.close();
                                    }
                                    else {
                                        jqObj.popup.remove(".gridPopup");
                                        jqObj.popup.append(queryPanel);
                                        jqObj.popup.show();

                                        if (columnField.filter.mode == 0) {
                                            tbx.focus();
                                        }
                                    }
                                } else {
                                    if (columnField.filter.mode == 0) {
                                        jqObj.popup = $(jqObj).popupManager(320, 120, true, localizedString("MISC_FILTER_TITLE"));
                                    } else if (columnField.filter.mode == 1) {
                                        jqObj.popup = $(jqObj).popupManager(250, 330, true, localizedString("MISC_FILTER_TITLE"));
                                    }

                                    jqObj.popup.append(queryPanel);

                                    if (columnField.filter.mode == 0) {
                                        tbx.focus();
                                    }
                                }
                            }
                        }(btnFilter, headCellDesc)));
                    }

                    toolsContainer.append(headCellDesc.description);

                    if (headCellDesc.filter) {
                        toolsContainer.append(btnFilter);
                    }

                    headCell.append(toolsContainer);

                    headRow.append(headCell);
                }
                thead.bind("mousedown",onMousedown);
                thead.bind("mousemove",onMousemove);
                thead.bind("mouseup",onMouseup);
                thead.append(headRow);
            }
        }

        function showAllData(visible) {
            for (var rowIdx = 0; rowIdx < rowCount; rowIdx++) {
                var rowData = delegate.getRow(rowIdx);
                rowData.VisibleFilterValue = visible;
            }
        }

        function renderFloatHeader() {
            if (isReady()) {
                onRenderFloatHeader();
            } else {
                window.setTimeout(function () { renderFloatHeader(); }, 800);
            }
        }

        function onRenderFloatHeader() {

            var floatHeadTable = $("<table>").addClass("grid").attr({cellspacing:0}),
            floatHead = $("<thead>"),
            floatHeadRow = $("<tr>"),
            cellLst = floatHeader ? floatHeader.find("th") : thead.find("th");

            //floatHeader.css({width: thead.width(), height: thead.height()});
            for(var i = 0; i < cellLst.length; i++){
                var template = $(cellLst[i]),
                floatCell = $("<th>");
                floatCell.css({width:template[0].style["width"] || (template.width() + 'px')});
                floatCell.addClass(template[0].className);

                if (i == 0 && checkType == 0) {
                    floatCell.css('cursor', 'pointer');
                    floatCell.click(function () {
                        var count = delegate.getRowCount();
                        if (count && count > 0) {
                            var data = [];
                            for (var i = 0; i < count; i++) {
                                data.push(delegate.getRow(i));
                            }

                            var colList = delegate.getHeaderSpec();
                            new exportCSV(this, { colList: colList, data: data });
                        }
                    });
                    floatCell.attr("title", "Export");
                }else{
                    floatCell.attr('dataType', template.attr("dataType"));
                    //floatCell.bind("click",sort);
                    if(delegate.disableSort){
                        if(!delegate.disableSort()){
                            floatCell.bind("mouseup",sort);
                        }
                    }else{
                        floatCell.bind("mouseup",sort);
                    }
                }

//                floatCell.bind("mousedown",onMousedown);
//                floatCell.bind("mousemove",onMousemove);
//                floatCell.bind("mouseup",onMouseup);

                var ctrls = template.contents();
                for(var j = 0; j < ctrls.length; j++){
                    floatCell.append(ctrls[j]);
                    template.append($(ctrls[j]).clone())
                }

                floatHeadRow.append(floatCell);
            }

            var left = offset == null ? 0 : offset.left + 'px',
            top = offset == null ? 0 : offset.top + 'px',
            width = tbody.width() + 'px';

            if (offset.top < 0) {
                top = 1 + 'px';
            }

            floatHeadTable.css({width:width, top: top, left:left, position:'absolute'})
            floatHead.append(floatHeadRow);
            floatHead.bind("mousedown",onMousedown);
            floatHead.bind("mousemove",onMousemove);
            floatHead.bind("mouseup",onMouseup);

            floatHeadTable.append(floatHead);
            gridContainer.append(floatHeadTable);

            if(floatHeader){
                floatHeader.remove();
            }
            floatHeader = floatHeadTable;
            //thead.css({visibility:"hidden"});
        }

        function renderBody() {
            if (delegate.getRow != undefined && delegate.getRowCount != undefined) {
                rowCount = delegate.getRowCount();
                if (!rowCount) {
                    renderTip();
                    if (checkAllCtrl) {
                        checkAllCtrl.attr({ "checked": 0 }).css('display', 'none');
                    }
                    return;
                } else if (tip) {
                    tip.remove();
                }

                if (checkAllCtrl) {
                    if (delegate.HideCheckAll == true) {
                        checkAllCtrl.css({ "display": "none" });
                    }
                    else {
                        checkAllCtrl.css({ "display": "inline" });
                    }
                }
                var defaultSelectedIndex = -1;
                if (delegate.getDefaultSelectedIndex) {
                    defaultSelectedIndex = delegate.getDefaultSelectedIndex();
                }

                var radom = String(parseInt(Math.random() * 100));
                var hasColor = false;
                for (var rowIdx = 0; rowIdx < rowCount; rowIdx++) {
                    var row = $("<tr>"),
                    rowData = delegate.getRow(rowIdx);

                    if(delegate.alterColor){
                            if(rowData[delegate.alterColor]){
                                if(rowIdx > 0){
                                    var lastRow = delegate.getRow(rowIdx - 1);
                                    if(rowData[delegate.alterColor] !== lastRow[delegate.alterColor]){
                                        if(!hasColor){row.addClass("stripe");}
                                            hasColor = !hasColor;
                                    }else{
                                        if(hasColor){
                                            row.addClass("stripe");
                                        }
                                    }
                                }
                            }
                        }

                    if (checkType && checkType == 1 && (rowCount == 0 || rowCount > tbody.find("td:nth-child(1) input[type=checkbox]:checked").length)) {
                        checkAllCtrl.attr("checked", false);
                    }

                    //////////////////////////////filter start//////////////////////////////////////
                    if (filters) {
                        var exist = false;

                        if (filters.length == 0) {
                            exist = true;
                        }
                        else {
                            var existCount = 0;
                            for (var i = 0; i < filters.length; i++) {
                                var filter = filters[i];

                                if (filter["filter"] == undefined || filter["filter"] == null || filter["filter"] == "" || rowData[filter.columnName].indexOf($.trim(filter["filter"])) != -1) {
                                    existCount++;
                                }
                            }

                            if (existCount == filters.length) {
                                exist = true;
                            }
                        }

                        if (!exist) {
                            continue;
                        }
                    }

                    if (rowData.VisibleFilterValue == false) {
                        continue;
                    }
                    //////////////////////////////filter end//////////////////////////////////////

                    if (checkType && checkType == 1) {
                        var checkbox = $("<input>").attr({ type: "checkbox" });
                        row.append($("<td>").css({ width: "20px" }).append(checkbox));
                        gvCtrls.push(checkbox);

                        checkbox.click((function () {
                            var idx = rowIdx;
                            return function (event) {
                                var trigger = { isChecked: this.checked, index: idx, target:this };
                                onRowChecked.call(trigger);

                                if (!delegate.removeCheckAll) {
                                    if (!this.checked && checkAllCtrl.attr("checked")) {
                                        checkAllCtrl.attr("checked", false);
                                    } else if (rowCount > 0 && rowCount == tbody.find("td:nth-child(1) input[type=checkbox]:checked").length) {
                                        checkAllCtrl.attr("checked", true);
                                    }
                                }

                                event.stopPropagation();
                            };
                        })());

                        // update by Yi, Xin at 13:28 03/22/2012 first
                        // updata by chang, bingben at May 13th 2012 second
                        // update by Yi, Xin at 11:29 05/18/2012, description: fixed logic error
                        /*if (!delegate.removeCheckAll && checkAllCtrl.attr("checked")) {
                            checkbox.attr({ "checked": true });
                            checkbox.click();
                        }*/

                        //add by chang bingben
//                      if (delegate.isRowChecked) {
//                          checkbox.attr({ "checked": false });
//                          checkbox.click();
//                      }
                        if (delegate.selectedData && delegate.selectedData.length > 0 && delegate.selectedData.length > 0) {
                            for (var i = 0; i < delegate.selectedData.length; i++) {
                                if (rowData.ID==delegate.selectedData[i]) {
                                    checkbox.attr({ "checked": true });
                                    checkbox.click();
                                }
                            }
                        }
                         /*if(checkAllCtrl.attr("checked") || (delegate.isRowChecked && delegate.isRowChecked(rowIdx))){
                        checkbox.attr({"checked":true});
                        checkbox.click();
                        }*/
                    } else if (checkType && checkType == 2) {
                        var radio = $('<input>').attr({ type: 'radio', name: 'radio' + radom });
                        row.append($("<td>").css({ width: "20px" }).append(radio));
                        gvCtrls.push(radio);

                        radio.click((function () {
                            var idx = rowIdx;
                            return function (event) {
                                var trigger = { index: idx };
                                onRowChecked.call(trigger);

                                event.stopPropagation();
                            };
                        })());
                    }
                    else {
                        row.append($("<td>").addClass('row_indicator'));
                    }

                    renderRowContent(delegate, rowIdx, rowData, row, colSpec);

                    row.click((function () {
                        var idx = rowIdx;
                        return function () {
                            var autoExpand = delegate.shouldExpandOnRowSelect == undefined
                            || (delegate.shouldExpandOnRowSelect && delegate.shouldExpandOnRowSelect());
                            if (autoExpand) {
                                $(this).find(".groupToggle").click();
                            }

                            tbody.find("tr").removeClass("selected");

                            // updated by c5162323 (05/05/2012 12:03), because when checkType is 1, it means we can choose mutiple items, so that one item's highlight background doesn't make sense.
                            if (checkType != 1) {
                                $(this).addClass("selected");
                            }

                            if (delegate.getNotAllowedSelected)
                            {
                                $(this).removeClass("selected");
                            }

                            // Uses dom click() method instead of jQuery.fn.click() since the latter will preventDefault()
                            // note the follow two lines at 06/07/2012, c5162323, because if there contains another links or buttons, the checkbox's status will be disturbed.
                            /*if (gvCtrls[idx])
                                gvCtrls[idx][0].click(); */
                            onRowSelected(idx);
                        };
                    })());

                    if (typeof (defaultSelectedIndex) == 'number') {
                        if (defaultSelectedIndex >= 0 && defaultSelectedIndex == rowIdx) {
                            // set checkbox & radio button selected status
                            if (checkType && checkType == 1) {
                                var checkList = $(row).find('input[type="checkbox"]');
                                if (checkList.size() > 0) {
                                    $(checkList[0]).attr('checked', 'true');
                                }
                                //update by c5162699
                                if (rowCount == 1 && !delegate.removeCheckAll) {
                                    checkAllCtrl.attr("checked", true);
                                }
                            } else if (checkType && checkType == 2) {
                                var radioList = $(row).find('input[type="radio"]');
                                if (radioList.size() > 0) {
                                    $(radioList[0]).attr('checked', 'true');
                                }

                                row.addClass("selected");
                            }
                            else {
                                row.addClass("selected");
                            }
                        }
                    }
                    else if (typeof (defaultSelectedIndex) == 'object') {
                        for (var i = 0; i < defaultSelectedIndex.length; i++) {
                            if (defaultSelectedIndex[i] >= 0 && defaultSelectedIndex[i] == rowIdx) {
                                // set checkbox & radio button selected status
                                if (checkType && checkType == 1) {
                                    var checkList = $(row).find('input[type="checkbox"]');
                                    if (checkList.size() > 0) {
                                        $(checkList[0]).attr('checked', 'true');
                                    }
                                    //update by c5162699
                                    if (rowCount == 1 && !delegate.removeCheckAll) {
                                        checkAllCtrl.attr("checked", true);
                                    }
                                } else if (checkType && checkType == 2) {
                                    var radioList = $(row).find('input[type="radio"]');
                                    if (radioList.size() > 0) {
                                        $(radioList[0]).attr('checked', true);
                                    }

                                    row.addClass("selected");
                                }
                                else {
                                    row.addClass("selected");
                                }
                            }
                        }
                    }

                    tbody.append(row);

                    if (delegate.getSubDelegate) {
                        renderSubRows(row, rowData, rowIdx);
                    }
                } // end for

                //updata by c5162699
                if (!delegate.removeCheckAll && rowCount > 0 && rowCount == tbody.find("td:nth-child(1) input[type=checkbox]:checked").length) {
                    checkAllCtrl.attr("checked", true);
                }

                var bodyWidth = $(tbody).width();
                if (floatHeader != null && bodyWidth > 0) {
                    $(floatHeader).css('width', bodyWidth);
                }
            }
        }

        function renderSubRows(parent,parentData,parentRowInx){
            var subDelegate = null;
            var rowGroup = [];
            var btnExpandCollapse = $("<a href='#'>").addClass("groupToggle");
            if(delegate.getSubDelegate){
                subDelegate = delegate.getSubDelegate(parentRowInx);
            }
            var callback = function(){
                var rowCount = (subDelegate.getRowCount && subDelegate.getRowCount()) || 0,
                myColSpec = (subDelegate.getHeaderSpec && subDelegate.getHeaderSpec()) || colSpec;
                var prevRow = null;
                for(var rowIdx = 0; rowIdx < rowCount; rowIdx++){
                    var row = $("<tr>").addClass("subRow"),
                    rowData = subDelegate.getRow(rowIdx);

                    if(checkType && checkType == 1){
                        row.append($("<td>").css({width:"20px"}));
                    } else if(checkType && checkType == 2){
                        row.append($("<td>").css({width:"20px"}));
                    }
                    else {
                        row.append($("<td>").addClass('row_indicator'));
                    }

                    renderRowContent(subDelegate, rowIdx, rowData, row, myColSpec);
                    row.find("td:eq(1)").addClass('indent');
                    if(prevRow != null){
                       prevRow.after(row);
                    }else{
                      parent.after(row);
                    }
                    prevRow = row;
                    rowGroup.push(row);

                    if(!subDelegate.shouldBeExapnd || !subDelegate.shouldBeExpand()){
                        row.hide();
                    }
                }

                for(var i = 0; i < rowGroup.length; i++){
                    if(btnExpandCollapse.hasClass("expand")){
                        rowGroup[i].show(500);
                    } else {
                        rowGroup[i].hide(500);
                    }
                }

            };

            parent.find("td:eq(1)").prepend(function(index, html){
                btnExpandCollapse.click(function(event){
                    var trigger = $(this);
                    trigger.toggleClass("expand");

                    if(subDelegate.loadSubData && rowGroup.length<=0){
                     subDelegate.loadSubData(parentData,callback);
                    }else if(!subDelegate.loadSubData && rowGroup<=0){
                        callback();
                    }else{
                        for(var i = 0; i < rowGroup.length; i++){
                            if(trigger.hasClass("expand")){
                                rowGroup[i].show(500);
                            } else {
                                rowGroup[i].hide(500);
                            }
                        }
                    }

                    event.stopPropagation();

                    window.setTimeout(renderFloatHeader, 500);
                })

                return btnExpandCollapse;
            });
        }

        function renderRowContent(delegate, rowIdx, rowData, rowJQ, colSpec){
            for(var colIdx = 0; colIdx < colSpec.length; colIdx ++){
                var colDesc = colSpec[colIdx],
                cell = $("<td>");

                if(rowIdx == 0 && colDesc.width){
                    cell.css({width:colDesc.width});
                }

                var cellObj = {data:rowData, colName: colDesc["name"], row: rowIdx, col:colIdx, cell: cell,parentRow:rowJQ},
                template = null;
                if(delegate.getCell){
                    template = delegate.getCell.call(cellObj);
                }
                if(template == null){
                    cell.text(rowData[colDesc["name"]]);
                } else {
                    cell.append(template);
                }

                if (typeof (rowData[colDesc["name"]]) == 'string') {
                    if(template == null){
                        cell.attr("title", rowData[colDesc["name"]]);
                    }else{
                        if(typeof(template) == 'string')
                             cell.attr("title", template);
                    }
                }

                rowJQ.append(cell);
            }
        }

        function renderTip(){
            if(delegate && delegate.getTip){
                if(tip){
                    tip.remove();
                }

                tip = $("<div>").addClass("tip").append(delegate.getTip());
                gridContainer.append(tip);
                var top = (gridContainer.height() - thead.height() - tip.height() - (tip.height() == 0 ? 40 : 0)) / 2;
                tip.css({"padding-top":top + "px"});
            }
        }

        function onRowSelected(idx){
            for(var i = 0; i < rowSelectedEvent.length; i++){
                if(delegate && delegate.getRow){
                    var trigger = {data:delegate.getRow(idx), index:idx};
                    rowSelectedEvent[i].call(trigger);
                } else {
                    rowSelectedEvent[i].call({index:idx});
                }
            }
        }

        function onRowChecked(){
            for(var i = 0; i < rowCheckEvent.length; i++){
                if(delegate && delegate.getRow){
                    this.data = delegate.getRow(this);
                    rowCheckEvent[i].call(this);
                } else {
                    rowCheckEvent[i].call(this);
                }
            }
        }

        function opCheckOnAll(checked) {
            var chklist = tbody.find("tr td:nth-child(1) input:checkbox");
            for(var i = 0; i < chklist.length; i++){
                if(chklist[i].checked != checked){
                    chklist[i].checked = checked;
                    var trigger = { isChecked: checked, index: i };
                    onRowChecked.call(trigger);
                }
            }

        }

        function PagingArea(container,pageSize){
            pagingArea = $("<div>").addClass("paging");
            $(container).append(pagingArea);
            this.pageSize = pageSize;
            this.totalCount = 0;
            this.totalPageCount = 0;
            this.currentCount = 0;
            this.height = 30;

            this.pageLabel = $("<label>").append(localization.AUDIT_LOG_PAGING_LABEL).css({ "vertical-align":"middle"});
            this.prePage = $("<input>").attr({ "title": "previous page","type": "button","value": "< "}).css({"margin-right":"10px","vertical-align":"middle"});
            this.firstPage = $("<input>").attr({ "title": "first page", "type": "button", "value": "|<" }).css({ "margin-right": "5px", "vertical-align": "middle" });
            this.nextPage = $("<input>").attr({ "title": "next page", "type": "button", "value": " >" }).css({ "margin-left": "10px", "vertical-align": "middle" });
            this.lastPage = $("<input>").attr({ "title": "last page", "type": "button", "value": ">|" }).css({ "margin-left": "5px", "vertical-align": "middle" });
            this.currentPageBox = $("<input>").css({"margin-left":"10px","vertical-align":"middle", "width":"2em","text-align":"right"});
            this.pageNumLabel = $("<label>").attr({ "id": "grid_pageNumber" }).css({width:"100px","vertical-align":"middle"});

            pagingArea.append(this.firstPage);
            pagingArea.append(this.prePage);
            pagingArea.append(this.pageLabel);
            pagingArea.append(this.currentPageBox);
            this.pageNumLabel.append(" of " + this.currentCount);
            pagingArea.append(this.pageNumLabel);
            pagingArea.append(this.nextPage);
            pagingArea.append(this.lastPage);

            this.currentPageBox.blur(function(){
                $(this).val(pagingArea.currentCount);
            });

            this.currentPageBox.keydown(function(e){
                if(e.keyCode == 13){
                    var boxValue = $(this).val();
                    var reg = new RegExp("^[1-9]\\d*$");
                    if(!reg.test(boxValue) || boxValue > pagingArea.totalPageCount){
                        $(this).val(pagingArea.currentCount);
                        return;
                    }

                    if(boxValue == pagingArea.currentCount)return;

                    if(boxValue == 1){
                        PagingArea.first();
                    }else if( boxValue == pagingArea.totalPageCount){
                        PagingArea.last();
                    }else{

                        pagingArea.currentCount = parseInt(boxValue);
                        pagingAction = function(){
                            this.firstPage.attr({"disabled":false});
                            this.prePage.attr({"disabled":false});
                            this.nextPage.attr({"disabled":false});
                            this.lastPage.attr({"disabled":false});

                        };

                        PagingArea.LoadPage((boxValue - 1) * pagingArea.pageSize, pagingArea.pageSize);
                    }
                }

                if(!(e.keyCode === 8 || e.keyCode === 9 || (e.keyCode >= 46 && e.keyCode <= 57) || (e.keyCode >= 96 && e.keyCode <= 105))){
                    e.preventDefault();
                    e.stopPropagation();
                }
            });

            this.bind(this.firstPage, "click",PagingArea.first);
            this.bind(this.prePage,"click",PagingArea.pre);
            this.bind(this.nextPage, "click", PagingArea.next);
            this.bind(this.lastPage, "click", PagingArea.last);
        }

        PagingArea.prototype.refreshPageArea = function(){

            if(delegate.getRowCount){
                if(!delegate.getRowCount() > 0){
                    this.firstPage.attr({"disabled":true});
                    this.prePage.attr({"disabled":true});
                    this.nextPage.attr({"disabled":true});
                    this.lastPage.attr({"disabled":true});
                    this.currentCount = 0;
                    this.totalPageCount = 0;
                    this.pageNumLabel.html("").append(" of " + this.totalPageCount);
                    this.currentPageBox.val(0).attr({"disabled": true});
                    return;
                }
            }

            if(delegate.getTotalCount){
                this.totalCount = delegate.getTotalCount();
                this.totalPageCount  = Math.ceil(this.totalCount / this.pageSize);
                this.currentCount = 0;

                if(this.totalCount > this.pageSize){
                    this.firstPage.attr({"disabled":true});
                    this.prePage.attr({"disabled":true});
                    this.nextPage.attr({"disabled":false});
                    this.lastPage.attr({"disabled":false});
                    this.currentCount = 1;
                    this.currentPageBox.val(this.currentCount).attr({"disabled": false});
                    this.pageNumLabel.html("").append(" of " + this.totalPageCount);
                    return;
                }

                if(this.totalCount == 0){
                    this.currentCount = 0;
                }else{
                    this.currentCount = 1;
                }
                this.firstPage.attr({"disabled":true});
                this.prePage.attr({"disabled":true});
                this.nextPage.attr({"disabled":true});
                this.lastPage.attr({"disabled":true});
                this.pageNumLabel.html("").append(" of " + this.totalPageCount);
                this.currentPageBox.val(this.currentCount).attr({"disabled": true});

            }
        };

        PagingArea.first = function(){

                pagingAction = function(){
                    this.currentCount = 1;
                    this.firstPage.attr({"disabled":true});
                    this.prePage.attr({"disabled":true});
                    this.nextPage.attr({"disabled":false});
                    this.lastPage.attr({"disabled":false});
                    this.currentPageBox.val(this.currentCount);
                };
                PagingArea.LoadPage(0, pagingArea.pageSize);

        };

        PagingArea.pre = function(){
            pagingAction = function(){
                this.currentCount--;
                this.nextPage.attr({"disabled":false});
                this.lastPage.attr({"disabled":false});
                if(this.currentCount == 1){
                    this.firstPage.attr({"disabled":true});
                    this.prePage.attr({"disabled":true});
                }else{
                    this.firstPage.attr({"disabled":false});
                    this.prePage.attr({"disabled":false});
                }
                this.currentPageBox.val(this.currentCount);
            };
            var pageNum = pagingArea.currentCount - 1;
            PagingArea.LoadPage((pageNum - 1) * pagingArea.pageSize, pagingArea.pageSize);

        };

        PagingArea.next = function(){
            pagingAction = function(){
                this.currentCount++;
                this.firstPage.attr({"disabled":false});
                this.prePage.attr({"disabled":false});
                if(this.currentCount == this.totalPageCount){
                    this.nextPage.attr({"disabled":true});
                    this.lastPage.attr({"disabled":true});
                }else{
                    this.nextPage.attr({"disabled":false});
                    this.lastPage.attr({"disabled":false});
                }
                this.currentPageBox.val(this.currentCount);
             };
                var pageNum = pagingArea.currentCount + 1;
                PagingArea.LoadPage((pageNum - 1) * pagingArea.pageSize, pagingArea.pageSize);

        };

        PagingArea.last = function(){
                pagingAction = function(){
                        this.currentCount = this.totalPageCount;
                        this.firstPage.attr({"disabled":false});
                        this.prePage.attr({"disabled":false});
                        this.nextPage.attr({"disabled":true});
                        this.lastPage.attr({"disabled":true});
                        this.currentPageBox.val(this.currentCount);
                };
            var pageNum = pagingArea.totalPageCount;
            PagingArea.LoadPage((pageNum - 1) * pagingArea.pageSize, pagingArea.pageSize);
            };

        PagingArea.LoadPage = function(skipCount, loadCount){

            if(delegate.showLoadingWindow == undefined || delegate.showLoadingWindow !== false ){
                if(!pagingLoadWindow){
                    pagingLoadWindow = new loadingWindow();
                }
                pagingLoadWindow.show();
            }
                delegate.loadPage(skipCount, loadCount);
            };

        PagingArea.prototype.bind = function(jquery, eventType, callback){
                var events = jquery.data("events");

                if(events == undefined){
                    jquery.bind(eventType, callback);
                    return;
                }
                var _event = events[eventType];
                if(_event == undefined){
                    jquery.bind(eventType, callback);
                    return;
                }

            };

        PagingArea.prototype.unbind = function(jquery, eventType){
                var events = jquery.data("events");
                if(events){
                    var eClick = events[eventType];
                    if(eClick){
                        jquery.unbind(eventType);
                    }
                }
            };

            self.show = show;
            self.reset = function(opts){
                if(opts && opts.delegate){
                    delegate = opts.delegate;
                }
            };
            self.rowSelectedEvent = rowSelectedEvent;
            self.rowCheckEvent = rowCheckEvent;
            self.reload = reload;
            self.searchText = searchText;
            self.getDelegate=getDelegate;
            self.refreshContent = refreshContent;

            table.append(thead);
            table.append(tbody);

        if(container){

            gridContainer.append(table);
            $(container).append(gridContainer);

            if(delegate.pagingMode === true){
                if(!pagingArea) {
                    pagingArea = new PagingArea(container,delegate.pageSize);
                    }

                pagingArea.refreshPageArea();
            }

            if(delegate && delegate.getGridHeight){
                gridContainer.css({height: delegate.getGridHeight() + "px", 'min-height': delegate.getGridHeight() + "px"});
                gridContainer.bind("scroll", renderFloatHeader);
                $(window).bind("resize", function(){
                    if(floatHeader){
                        if(table.width() == 0){
                            floatHeader.remove();
                        } else {
                            renderFloatHeader();
                        }
                    }
                });
                var containerHeight = delegate.pagingMode?delegate.getGridHeight() + pagingArea.height + 6 + "px":delegate.getGridHeight() + 6 + "px";

                container.css({height: containerHeight, 'min-height': containerHeight, "overflow":"hidden", position:"relative"});
            }

            var dragger = $("<div>").addClass('dragger').attr('draggable', 'false'),
            sizeManager = new (function (){
                var oY = 0,
                deltaY = 0,
                oH = gridContainer.height(),
                self = this,
                mH = Number.MAX_VALUE,
                toolHeight = delegate.pagingMode?pagingArea.height + 6: 6;


                this.resizeStart = function(e){
                    oY = e.pageY;
                    mH = table.height();

                    gridContainer.css('max-height', Math.max(mH, oH) + 'px');
                    container.css('max-height', Math.max(mH, oH) + toolHeight + 'px');

                    $(window).bind('mousemove', self.resize);
                    $(window).bind('mouseup', self.resizeEnd);
                };

                this.resizeEnd = function(e){
                    oH = gridContainer.height();

                    $(window).unbind('mousemove', self.resize);
                    $(window).unbind('mouseup', self.resizeEnd);

                    $(window).resize();
                };

                this.resize = function(e){
                    deltaY = e.pageY - oY;

                    gridContainer.height(oH + deltaY + 'px');
                    container.height(oH + deltaY + toolHeight + 'px');
                };
            })();

            $(container).append(dragger);
            self.disableDragger=function(){
                dragger.unbind('mousedown', sizeManager.resizeStart);
            };

            dragger.bind('mousedown', sizeManager.resizeStart);
            if (opts && opts.undraggable == true || (delegate.autoResize != null && delegate.autoResize() > 0)) {
                self.disableDragger();
            }
        }
    };

   var Plugin = function(options){
       return  new gridview(this, options);
   };
  $.fn.gridview             = Plugin;
  $.fn.gridview.Constructor = gridview;
        
});







