$(document).ready(function(){
    $("#btnGO").click(function(){
    
    //alert($('#txtdomain').val());
    //alert($('#selformat').val());
    
       if (validation) {
       
			  //var newURL = "https://www.facebook.com/search/218052195602/employees/present";
			  //var newURL = "https://www.facebook.com/search/top/?q=People who work at ";
			  var newURL = 'https://www.facebook.com/search/str/'+$('#txtcompany').val()+'/pages-named/employees/present/intersect';
			  //newURL += $('#txtcompany').val();
  
			  //chrome.tabs.create({ url: newURL },function(tab){
			  chrome.tabs.update({url: newURL },function(tab){
				console.log('Tab Created ' + tab.id);
				chrome.tabs.onUpdated.addListener(function(tabId, changeinfo, tab){
				  console.log(changeinfo.status);
				  if (changeinfo.status == "complete") {				  
			  
					 chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
						var activeTab = tabs[0];
						//chrome.tabs.sendMessage(activeTab.id, {"messages": "clicked_popup"});
						chrome.tabs.sendMessage(tabId, {messages: {clicked:'clicked_popup',param_domain:$('#txtdomain').val(),param_format:$('#selformat').val()}});
					 });
				   }  
				});    
			  });
			  
		} //validation	  
    });
});


function validation(){
   if ($('#txtcompany').val()=='') { 
       $('#txtcompany').focus();
       alert('The value for the Company is missing.');
       return false;
   }
   return true;
}

function arroba(x){
 x.value = "@";
}
	
	
	
	