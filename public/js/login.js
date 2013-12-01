function endBlackout(){
    $(".msgbox").fadeOut();
    $(".blackout").fadeOut();
}

function strtBlackout(){
	$(".blackout").fadeIn(500); 
    $(".msgbox").fadeIn(1000);
	$(entername).focus();
	$(entername).keydown(function(e) {
        if (e.keyCode == 13) {
            if ($(entername).val()) {
                name = $(entername).val();
                if(/^[a-zA-Z]*$/.test(name) == false) {
                    $("#alerts2").fadeIn();
                }
                else {
                	endBlackout();
            	   chat_ready();
                }
            }
            else {
            	$("#alerts").fadeIn();
            }
        }
        });
    return false;
}

function gotofunc() {
    if ($(entername).val()) {
    	name = $(entername).val();
        if(/^[a-zA-Z]*$/.test(name) == false) {
                    $("#alerts2").fadeIn();
        }
        else {
     	    endBlackout();
 	        chat_ready();
        }
    }
    else {
        $("#alerts").fadeIn();
    }
}

function logOut() { 
    socket.disconnect(); 
    setCookie("user","",-1);
    location.reload();   
}