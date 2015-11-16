# Web2App Library

Launch a mobile app. from a webpage


```javascript
daumtools.web2app({
	urlScheme : '',									// iphone : custom scheme
	intentURI : '',									// android : intent URI
	appName   : '', 								// application Name (ex. facebook, twitter, daum)
	storeURL  : '',									// app store URL
	willInvokeApp : function() {},					// function for logging
	onAppMissing  : function() {},					// fallback function (default. move to appstore)
	onUnsupportedEnvironment : function() {}		// fallback function
});
```

Warning : `onAppMissing` fallback function isn't working on android chrome, because chrome should use the [intent](https://developer.chrome.com/multidevice/android/intents).

Dependency : [ua_parser](https://github.com/html5crew/ua_parser)
