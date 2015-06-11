var OCUrl = document.getElementById ('ocurl');
var Username = document.getElementById ('username');
var Passwd = document.getElementById ('passwd');
var Save = document.getElementById ('save');
var Message = document.getElementById ('message');

var L10N;

if (!String.prototype.startsWith) {
  	String.prototype.startsWith = function (SearchString, Position)
	{
    	Position = Position || 0;
    	return this.indexOf (SearchString, Position) === Position;
  	};
}

function ValidURL (URLString)
{
	return /^([a-z]([a-z]|\d|\+|-|\.)*):(\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?((\[(|(v[\da-f]{1,}\.(([a-z]|\d|-|\.|_|~)|[!\$&'\(\)\*\+,;=]|:)+))\])|((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=])*)(:\d*)?)(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*|(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)|((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)|((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)){0})(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(URLString);
}

Save.addEventListener('click', function (event)
{
	Message.innerHTML = '';
	Message.style.display = 'none';
	
	if (!ValidURL (OCUrl.value) || !(OCUrl.value.startsWith ('http') || OCUrl.value.startsWith ('https')))
	{
		Message.innerHTML = L10N.MSG_InvalidURL;
		Message.style.display = 'block';
	}
	else
	{
		Message.innerHTML = L10N.MSG_DataSaved;
		Message.style.display = 'block';
				
		// If OK, emit data to main.js
		self.port.emit ('OCDSignInOutput', {
			OCUrl: OCUrl.value,
			Username: Username.value,
			Passwd: Passwd.value
		});
	}
}, false);

self.port.on ('OCDSignInInput', function (Data)
{
	L10N = Data.L10N;
	
	OCUrl.placeholder = L10N.PH_OCUrl;
	document.getElementById ('ocurllbl').innerHTML = L10N.PH_OCUrl;
	OCUrl.value = Data.Stored.OCUrl; 
	
	Username.placeholder = L10N.PH_Username;
	document.getElementById ('usernamelbl').innerHTML = L10N.PH_Username;
	Username.value = Data.Stored.Username;
	
	Passwd.placeholder = L10N.PH_Password;
	document.getElementById ('passwdlbl').innerHTML = L10N.PH_Password;
	Passwd.value = Data.Stored.Passwd;
	
	Save.value = L10N.Save;
});