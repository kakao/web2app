# Web2App Library

run application in a web browser

“`
daumtools.web2app(urlScheme, {					// android : intent URI, iphone : custom scheme
	appName : '', 								// application Name (ex. facebook, twitter, daum)
	storeURL: '',								// app store URL
	willInvokeApp : function() {},				// function for logging
	onAppMissing  : function() {},				// fallback function (default. move to appstore)
	onUnsupportedEnvironment : function() {}	// fallback function
});
“`
