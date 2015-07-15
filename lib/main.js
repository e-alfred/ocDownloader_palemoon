var NeededAPIVersion = '1.2.3';

function HandleChange (State)
{
  	if (State.checked)
  	{
		var Data = {
			Stored: StoredData,
			L10N: {
				PH_OCUrl: _ ('ownCloudURL'),
				PH_Username: _ ('Username'),
				PH_Password: _ ('Password'),
				Save: _ ('Save'),
				MSG_InvalidURL: _ ('InvalidURL'),
				MSG_DataSaved: _ ('Datasaved')
			}
		};
  		Panel.port.emit ('OCDSignInInput', Data);
		
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

if (!String.prototype.endsWith)
{
    String.prototype.endsWith = function (Suffix)
	{
        return this.indexOf (Suffix, this.length - Suffix.length) !== -1;
    };
}

function MakeOCURL (Method)
{
	var URL = StoredData.OCUrl;
	 
	if (!URL.endsWith ('/'))
	{
		URL += '/';
	}
	URL = URL + 'ocs/v1.php/apps/ocdownloader/api/' + Method + '?format=json';
	
	return URL.substr(0, URL.indexOf(':')) + '://' + StoredData.Username.trim () + ':' + StoredData.Passwd.trim () + '@' + URL.substr (URL.indexOf('/') + 2);
}

function NotifyMe (Message)
{
	require('sdk/notifications').notify
	({
		title: 'ocDownloader',
		text: Message,
		iconURL: Self.data.url ('img/icon-32.png')
	});
}

var { ToggleButton } = require ('sdk/ui/button/toggle');
var Self = require ('sdk/self');
var SimpleStorage = require ('sdk/simple-storage');
var Context = require('sdk/context-menu');
var _ = require('sdk/l10n').get;

var StoredData = SimpleStorage.storage.OCSiginIn;

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
  	contentURL: Self.data.url ('signin.html'),
	contentScriptFile: Self.data.url ('js/signin.js'),
  	onHide: HandleHide
});

Panel.port.on ('OCDSignInOutput', function (Data)
{
	SimpleStorage.storage.OCSiginIn = Data;
	StoredData = Data;
	
	var Request = require('sdk/request').Request;
		
	Request ({
		url: MakeOCURL ('version'),
		content: { AddonVersion: NeededAPIVersion },
		headers: { 'OCS-APIREQUEST':true },
		onComplete: function (Response)
		{
			try
			{
				var OCS = eval ('(' + Response.text + ')');
				OCS = OCS.ocs;
				
				if (OCS.meta.statuscode == 100)
				{
					if (OCS.data.RESULT)
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
		var Request = require('sdk/request').Request;
		
		Request ({
			url: MakeOCURL ('add'),
			content: { URL: encodeURIComponent (LinkSrc) },
			headers: { 'OCS-APIREQUEST':true },
			onComplete: function (Response)
			{
				try
				{
					var OCS = eval ('(' + Response.text + ')');
					OCS = OCS.ocs;
					
					if (OCS.meta.statuscode == 100)
					{
						if (!OCS.data.ERROR)
						{
							NotifyMe (_ ('Downloadlaunchedonyourserver') + ': ' + OCS.data.FILENAME);
						}
						else
						{
							NotifyMe (_ (OCS.data.MESSAGE));
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