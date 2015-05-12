var baseUrl="http://122.152.162.81:8080/cfdcreativebo/query/";
var css="red";




function ReportTable(){
	var tickArr;
	var pageNo=0;
	var pageCount=30;
	var isAutoReflash=false;
	var loadCount=0;
	var repColNo=-1;
	var repMap;

	this.col=2;
	this.row=15;
	this.render = function render(view) {
		var htmlStr="<div id='loadinggif' style='width:100%;height:100%;z-index:100;position: absolute; background-color: rgba(255, 255, 255, 0.9); display:block' >";
		htmlStr+="<center><img src='image/ajax-loader.gif' style='position: relative;top:50%;'></center></div>";
		if(this.col==1){
			htmlStr+="<table id='ticktable0' class='reporttable'  width='100%'>"+
							"<thead></thead>"+
							"<tbody></tbody>"+
						"</table>";
		}else if(this.col==2){
			htmlStr+="<table width='100%' class='reporttable'>"+
				"<tr style='background:#ffffff'>"+
					"<td width='49%'>	"+
						"<table id='ticktable0'  width='100%'>"+
							"<thead></thead>"+
							"<tbody></tbody>"+
						"</table>"+
					"</td>"+
					"<td width='2%'>"+
					"</td>	"+
					"<td width='49%'>"+
						"<table id='ticktable1'  width='100%'>"+
							"<thead></thead>"+
							"<tbody></tbody>"+
						"</table>"+
					"</td>"+
				"</tr>"+
			"</table>";
		}

		htmlStr+="<table width='100%'>"+
			"<tr  style='background:#ffffff'>"+
				"<td style='text-align: left;'>當前第[<label id='pageIdxCount'>0/0</label>]頁"+
				"</td>"+
				
				"<td style='text-align: right;'>"+
					"<button id='fpagebtn' class='btn btn-default'>第一頁</button>"+
					"<button id='pageupbtn' class='btn btn-default'>上一頁</button>"+
					"<button id='pagedownbtn' class='btn btn-default'>下一頁</button>"+
					"<button id='lpagebtn' class='btn btn-default'>最末頁</button>"+
					//"<input id='pageno' type='text' style='width:45px'>頁"+
				"</td>"+
			"</tr>"+
		"</table>";

		$("#"+view).html(htmlStr);
		//$('#loadinggif').css('display','none');
		this.loadEmptyPage();
		loadEvent();

    };

    

    this.loadUrl=function loadUrl(urlStr){
    	//alert("loading gif");
    	$('#loadinggif').show();
    	
    	$.getJSON( urlStr, function( data ) {
    		//$("#loadinggif").show();
				$("#ticktable0 > thead > tr").remove();
				$("#ticktable1 > thead > tr").remove();
				var colStr=data.ch.split(",");
				var thead="<tr>";
				for(i=0;i<colStr.length;i++){
					thead+="<th>"+colStr[i]+"</th>";
				}
				thead+="</tr>";
				$("#ticktable0 > thead").append(thead);
				$("#ticktable1 > thead").append(thead);
				var cstr=data.c;
				tickArr=cstr.split('\u0003');
				showPageIdxCount();
				loadTablePage();
				loadCount++;
			})
    		.error(function(jqXHR, textStatus, errorThrown) { 
    			if(jqXHR.getResponseHeader("Content-Length")==null){
    				
    				alert("查無資料！");

    			}else{
    				alert("Service API Error ["+ textStatus +"]"+ jqXHR); 
    			}
    			$("#loadinggif").hide(); 
    		})
			.complete(function(){ 
				$("#loadinggif").hide(); 
			});
    };

    this.setColumn=function setColumn(col){
    	this.col=col;
    };

    this.setAutoReflash=function setAutoReflash(isAutoReflash){
    	this.isAutoReflash=isAutoReflash;
    };

    this.replace=function replace(replaceColNo,replaceMap){
    	repColNo=replaceColNo;
    	repMap=replaceMap;
    };



    function showPageIdxCount(){
    	$("#pageIdxCount").text((pageNo+1)+"/"+Math.ceil(tickArr.length/pageCount));
    }

    this.loadEmptyPage=function loadEmptyPage(){
    	$("#ticktable0 > tbody > tr").remove();
		$("#ticktable1 > tbody > tr").remove();
		$("#ticktable0 > thead > tr").remove();
		$("#ticktable1 > thead > tr").remove();
		var count=0;
		for(i=0;i<pageCount;i++){
			//alert(tickArr[i]);
			var tr="<tr><td>&nbsp; </td></tr>";

			
			if(count<pageCount/2){
				$("#ticktable0 > tbody").append(tr);
			}else{
				$("#ticktable1 > tbody").append(tr);
			}

			count++;
			
		}
		var thead="<tr><th>&nbsp; </th></tr>";
		$("#ticktable0 > thead").append(thead);
		$("#ticktable1 > thead").append(thead);
    }

    function loadTablePage(){
		$("#ticktable0 > tbody > tr").remove();
		$("#ticktable1 > tbody > tr").remove();
		var count=0;
		
		for(i=pageCount*pageNo;i<tickArr.length;i++){
			//alert(tickArr[i]);
			var rowArr=tickArr[i].split('\u0002')
			var tr="<tr>";
			for(j=0;j<rowArr.length;j++){

				itemStr=rowArr[j];
				//alert("replaceColNo="+repColNo+"   j="+j);
				if(repColNo!=-1 && j==repColNo){
					itemStr=repMap[itemStr];
				}
				tr+="<td>"+itemStr+"</td>";
			}
			tr+="</tr>";
			if(count<pageCount/2){
				$("#ticktable0 > tbody").append(tr);
			}else{
				$("#ticktable1 > tbody").append(tr);
			}

			count++;
			if(count>=pageCount){
				break;
			}
		}

		for(i=0;i<pageCount-count;){
			var tr="<tr><td colspan="+rowArr.length+">&nbsp;</td></tr>";
			/*
			for(j=0;j<rowArr.length;j++){
				tr+="<td>"+rowArr[j]+"</td>";
			}
			tr+="</tr>";
			*/
			if(count<pageCount/2){
				$("#ticktable0 > tbody").append(tr);
			}else{
				$("#ticktable1 > tbody").append(tr);
			}

			count++;
		}
	}
	function loadEvent(){
		$("#pagedownbtn").click(function(){
			if(pageNo<tickArr.length/pageCount-1){
				pageNo++;
				loadTablePage();
				showPageIdxCount();
			}else{
				alert("抱歉!最後一頁囉");
			}
		});
		$("#pageupbtn").click(function(){
			if(pageNo>0){
				pageNo--;
				loadTablePage();
				showPageIdxCount();
			}else{
				alert("抱歉!第一頁囉");
			}
		});
		$("#fpagebtn").click(function(){
			pageNo=0;
			loadTablePage();
			showPageIdxCount();
			
		});
		$("#lpagebtn").click(function(){
			pageNo=Math.ceil(tickArr.length/pageCount)-1;
			loadTablePage();
			showPageIdxCount();
			
		});
	}
}

function today() {
	var today=new Date();
	   var yyyy = today.getFullYear().toString();
	   var mm = (today.getMonth()+1).toString(); // getMonth() is zero-based
	   var dd  = today.getDate().toString();
	   return yyyy + (mm[1]?mm:"0"+mm[0]) + (dd[1]?dd:"0"+dd[0]); // padding
	  };
function toYYYYMMDD(day) {
	
	   var yyyy = day.getFullYear().toString();
	   var mm = (day.getMonth()+1).toString(); // getMonth() is zero-based
	   var dd  = day.getDate().toString();
	   return yyyy + (mm[1]?mm:"0"+mm[0]) + (dd[1]?dd:"0"+dd[0]); // padding
};	  

function hhmmssTohh_mm_ss(dateStr){
	var str=dateStr.substring(0, 2)+":"+dateStr.substring(2, 4)+":"+dateStr.substring(4);
	return str;
}

function getUrlParameter(sParam)
	{
	    var sPageURL = window.location.search.substring(1);
	    var sURLVariables = sPageURL.split('&');
	    for (var i = 0; i < sURLVariables.length; i++) 
	    {
	        var sParameterName = sURLVariables[i].split('=');
	        if (sParameterName[0] == sParam) 
	        {
	            return sParameterName[1];
	        }
	    }
	}


