var domain = ''; 
var email_format = -1;

var height = $(document).height();
var changeHeightInterval;
var cookieKey = 'faceSpy_autoscroll';
var alreadyParsed = false;

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
     
    domain = request.messages.param_domain;
    email_format = request.messages.param_format;
  
    if( request.messages.clicked === "clicked_popup" ) {
      console.clear();
      console.log('faceSpy -> Started.');
	  
	  bindAutoscroll();
	  
    }
  }
);


function GetEmail(str,domain,email_format){
  var arr = str.split(/\s+/);
  var email = '';
  
  switch (email_format) {
     case '0': email = arr[0]+'.'; break;
     case '1': email = arr[0].charAt(0)+'.';break;
     case '2': email = arr[0]+'_'; break;
  }
  
  for(i=1; i < arr.length; i++){
     email += arr[i];
     //console.log(arr[0]);
   }
  email += domain; 
  //console.log(email);
  return email; 
}

function isHeightChanged() {
		var isChanged = $(document).height() != height;
		height = $(document).height();
		return isChanged;
	}
	
function unbindAutoscroll() {
		clearInterval(changeHeightInterval);
		//console.log('"changeHeightInterval" in unbindAutoscroll: '+changeHeightInterval);
	}
	
function bindAutoscroll() {
		setCookie(true);
		changeHeightInterval = setInterval(handleScrolling, 200);
	}

function unbindAutoscroll() {
		setCookie(false);
		clearInterval(changeHeightInterval);
	}	

function setCookie(value) {
		document.cookie = cookieKey + "=" + parseInt("" + (value + 0));
	}

function isCookie() {
		return document.cookie.indexOf(cookieKey + "=1") !== -1;
	}		
	
function handleScrolling() {
		if(isHeightChanged()) {
		    //console.log('scrolling');
			$(document).scrollTop($(document).height());
		} else {  
		         //console.log('Stopping Scroll ...');
		         var found_EoR = $('div:contains("End of Results")');
		         if (found_EoR.length) {
		            //console.log('End of Results was found');
		            //console.log('"changeHeightInterval" in handlecrolling: '+changeHeightInterval);
		            
		            if (! alreadyParsed && isCookie()) {
		               unbindAutoscroll();
		               alreadyParsed = true;
		               GetInfo();		               
		             }  
		          }  
		        } 
	};
	
	
 function makeTable(container, data) {
    var tabla = $("<table/>").addClass('CSSTableGenerator');
    tabla.attr('id', 'faceSpyTable');
    tabla.hide();
    $.each(data, function(rowIndex, r) {
        var row = $("<tr/>");
        $.each(r, function(colIndex, c) { 
            row.append($("<t"+(rowIndex == 0 ?  "h" : "d")+"/>").text(c));
        });
        tabla.append(row);
    });
    return container.append(tabla);
 }	
	
	
  function exportTableToCSV($table, filename) {
        var $rows = $table.find('tr:has(td)'),

            // Temporary delimiter characters unlikely to be typed by keyboard
            // This is to avoid accidentally splitting the actual contents
            tmpColDelim = String.fromCharCode(11), // vertical tab character
            tmpRowDelim = String.fromCharCode(0), // null character

            //Actual delimiter characters for CSV format
            colDelim = '","',
            rowDelim = '"\r\n"',

            //Grab text from table into CSV formatted string
            csv = '"' + $rows.map(function (i, row) {
                var $row = $(row),
                    $cols = $row.find('td');

                return $cols.map(function (j, col) {
                    var $col = $(col),
                        text = $col.text();

                    return text.replace(/"/g, '""'); // escape double quotes

                }).get().join(tmpColDelim);

            }).get().join(tmpRowDelim)
                .split(tmpRowDelim).join(rowDelim)
                .split(tmpColDelim).join(colDelim) + '"',

            //Data URI
            csvData = 'data:application/csv;charset=utf-8,' + encodeURIComponent(csv);
            return csvData;
    }	
		
		
function GetInfo(){
      console.clear();
      var line_arr = [];  
      
      var data = [["Full Name", "Email Address", "Job Title","Lives in"]]; //headers
            
       
      $("._5d-5" ).each(function( index ) {
          line_arr.push($(this).text() +' : '+GetEmail($(this).text(),domain,email_format));
          data.push([$(this).text(),GetEmail($(this).text(),domain,email_format),"",""]);
          
      });
      
      //Looking for Job Positions and "Live in"
      line_index = 0;       
      $("._52eh" ).each(function( index ) {
         LineToPrint = '';
      
         if(($(this).text().indexOf(' at ') != -1) && ($(this).text().indexOf('Studied ') == -1) && ($(this).text().indexOf('Studies ') == -1)) {    
            //console.log(line_arr[line_index]+' : ' + $(this).text());
            LineToPrint = line_arr[line_index]+' : ' + $(this).text();
            //update job title
            data[line_index][2] = $(this).text();
            line_index ++;  
          } //End of Job Positions
          

          if($(this).text().indexOf('Lives in ') != -1) { 
            LineToPrint = LineToPrint + ' : ' + $(this).text();
            data[line_index][3] = $(this).text();
            //console.log('Printing live in > '+$(this).text());
          }//End of "Lives in"
          
          if (LineToPrint != '') console.log(LineToPrint);          
      });
      
      
      console.log('Create table');                
         var faceSpyTable = makeTable($(document.body), data);              
      console.log('Create table - Complete');
      
      console.log('Export to CSV');
         var export_lnk = $("<a/>").addClass('export_lnk');
         
         var csvData_href = exportTableToCSV($('#faceSpyTable'));
         export_lnk.attr({'download': 'facespy.csv',
                          'href': csvData_href,
                          'target': '_blank'
                        });
         export_lnk.text('Export to CSV');
         export_lnk.attr('id', 'export_lnk');
         $(document.body).append(export_lnk);
         $("#export_lnk")[0].click();
      console.log('Export to CSV - Complete')

}
