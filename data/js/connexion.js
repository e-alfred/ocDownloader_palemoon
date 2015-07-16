var OCUrlTF = document.getElementById ('ocurltf');
var UsernameTF = document.getElementById ('usernametf');
var PasswdTF = document.getElementById ('passwdtf');
var SaveBtn = document.getElementById ('savebtn');
var MessageP = document.getElementById ('messagep');

var L10N;

function StartsWith (String, LookingFor, Position)
{
   	Position = Position || 0;
   	return String.indexOf (LookingFor, Position) === Position;
}

function ValidURL (URLString)
{
	return /^([a-z]([a-z]|\d|\+|-|\.)*):(\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?((\[(|(v[\da-f]{1,}\.(([a-z]|\d|-|\.|_|~)|[!\$&'\(\)\*\+,;=]|:)+))\])|((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=])*)(:\d*)?)(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*|(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)|((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)|((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)){0})(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(URLString);
}

SaveBtn.addEventListener('click', function (event)
{
	MessageP.textContent = '';
	MessageP.style.display = 'none';
	
	if (!ValidURL (OCUrlTF.value) || !(StartsWith (OCUrlTF.value, 'http') || StartsWith (OCUrlTF.value, 'https')))
	{
		MessageP.textContent = L10N.MSG_InvalidURL;
		MessageP.style.display = 'block';
	}
	else
	{
		MessageP.textContent = L10N.MSG_DataSaved;
		MessageP.style.display = 'block';
				
		// If OK, emit data to main.js
		self.port.emit ('OCDConnexionOutput', {
			OCUrl: OCUrlTF.value,
			Username: UsernameTF.value,
			Passwd: PasswdTF.value
		});
	}
}, false);

self.port.on ('OCDConnexionInput', function (Data)
{
	L10N = Data.L10N;
	
	OCUrlTF.placeholder = L10N.PH_OCUrl;
	document.getElementById ('ocurltflbl').textContent = L10N.PH_OCUrl;
	OCUrlTF.value = Data.Stored ? Data.Stored.OCUrl : '' ;
	
	UsernameTF.placeholder = L10N.PH_Username;
	document.getElementById ('usernametflbl').textContent = L10N.PH_Username;
	UsernameTF.value = Data.Stored ? Data.Stored.Username : '';
	
	PasswdTF.placeholder = L10N.PH_Password;
	document.getElementById ('passwdtflbl').textContent = L10N.PH_Password;
	PasswdTF.value = Data.Stored ? Data.Stored.Passwd : '';
	
	SaveBtn.value = L10N.SaveBtnTxt;
});