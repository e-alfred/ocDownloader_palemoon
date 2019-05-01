var { ToggleButton } = require ('sdk/ui/button/toggle');
var Self = require ('sdk/self');
var SimpleStorage = require ('sdk/simple-storage');
var Context = require('sdk/context-menu');
var _ = require('sdk/l10n').get;
var Request = require('sdk/request').Request;
var { encode, decode } = require("sdk/base64");

var NeededAPIVersion = '1.2.3';
var StoredData = SimpleStorage.storage.OCConnection;

function HandleChange (State)
{
  	if (State.checked)
  	{
		var Data = {
			'Stored': StoredData,
			'L10N': {
				'PH_OCUrl': _ ('ownCloudURL'),
				'PH_Username': _ ('Username'),
				'PH_Password': _ ('Password'),
				'SaveBtnTxt': _ ('Save'),
				'MSG_InvalidURL': _ ('InvalidURL'),
				'MSG_DataSaved': _ ('Datasaved')
			}
		};
		
  		Panel.port.emit ('OCDConnexionInput', Data);
		
    	Panel.show (
		{
      		position: Button
		});
  	}
}

function HandleHide ()
{
	Button.state ('window', { checked: false });
}

function EndsWith (String, LookingFor)
{
    return String.indexOf (LookingFor, String.length - LookingFor.length) !== -1;
}

function MakeOCURL (Method)
{
	var URL = StoredData.OCUrl;
	 
	if (!EndsWith (URL, '/'))
	{
		URL += '/';
	}
	URL = URL + 'index.php/apps/ocdownloader/api/' + Method + '?format=json';
	
	return URL.substr(0, URL.indexOf(':')) + '://' + '@' + URL.substr (URL.indexOf('/') + 2);
}

function NotifyMe (Message)
{
	require('sdk/notifications').notify
	({
		title: 'ocDownloader',
		text: Message,
		iconURL: Self.data.url ('img/icon-16.png')
	});
}

var Button = ToggleButton
({
  	id: 'OCDToggleBtn',
  	label: 'ocDownloader',
  	icon:
	{
    	'16': Self.data.url ('img/icon-16.png'),
    	'32': Self.data.url ('img/icon-32.png'),
    	'64': Self.data.url ('img/icon-64.png')
  	},
  	onChange: HandleChange
});

var Panel = require ('sdk/panel').Panel
({
	width: 580,
  	height: 420,
  	contentURL: Self.data.url ('connexion.html'),
	contentScriptFile: Self.data.url ('js/connexion.js'),
  	onHide: HandleHide
});

Panel.port.on ('OCDConnexionOutput', function (Data)
{
	SimpleStorage.storage.OCConnection = Data;
	StoredData = Data;
		
	Request ({
		url: MakeOCURL ('version'),
		content: { AddonVersion: NeededAPIVersion },
		headers: {
			'OCS-APIREQUEST':true,
			'Authorization': 'Basic ' + encode(Data.Username.trim () + ':' + Data.Passwd.trim ())
			},
		onComplete: function (Response)
		{
			try
			{
				var OCS = JSON.parse (Response.text);
				
				if (Response.status == 200)
				{
					if (OCS.RESULT)
					{
						NotifyMe (_ ('VersionOK'));
					}
					else
					{
						NotifyMe (_ ('VersionNOK'));
					}
				}
				else
				{
					NotifyMe (_ ('Unabletoreachyourserver'));
				}
			}
			catch (E)
			{
				NotifyMe (_ ('NoresponsefromocDownloaderonyourserverPleasecheckthesettings'));
				console.log (E.message);
			}
		}
	}).post ();
});

Context.Item
({
	label: _ ('DownloadWithocDownloader'),
	image: Self.data.url ('img/icon-16.png'),
	context: Context.SelectorContext ('a'),
  	contentScript: 'self.on ("click", function (Node, Data) {' +
                   '	self.postMessage (Node.href);' +
                   '});',
	onMessage: function (LinkSrc)
	{
		Request ({
			url: MakeOCURL ('add'),
			content: { URL: encodeURIComponent (LinkSrc) },
			headers: { 
				'OCS-APIREQUEST':true,
				'Authorization': 'Basic ' + encode(StoredData.Username.trim () + ':' + StoredData.Passwd.trim ())
				},
			onComplete: function (Response)
			{
				try
				{
					var OCS = JSON.parse (Response.text);
					
					if (Response.status == 200)
					{
						if (!OCS.ERROR)
						{
							NotifyMe (_ ('Downloadlaunchedonyourserver') + ': ' + OCS.FILENAME);
						}
						else
						{
							NotifyMe (_ (OCS.MESSAGE));
						}
					}
					else
					{
						NotifyMe (_ ('Unabletoreachyourserver'));
					}
				}
				catch (E)
				{
					NotifyMe (_ ('NoresponsefromocDownloaderonyourserverPleasecheckthesettings'));
					console.log (E.message);
				}
			}
		}).post ();
	}
});