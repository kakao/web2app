/*jshint devel: true */
/*global daumtools */

(function (exports) {
    "use strict";
    
    exports.web2app = (function () {

        var ua = daumtools.userAgent(),
            os = ua.os;
        
        var moveToStore = function (storeURL) {
            window.location.href = storeURL;
        };
        
        function web2app(urlScheme, context) {
            
            var willInvokeApp = (typeof context.willInvokeApp === 'function') ? context.willInvokeApp : function(){},
                onAppMissing  = (typeof context.onAppMissing === 'function')  ? context.onAppMissing  : moveToStore,
                onUnsupportedEnvironment = (typeof context.onUnsupportedEnvironment === 'function') ? context.onUnsupportedEnvironment : function(){};
            
            willInvokeApp();
            
            if (os.android) {
                web2app_android(urlScheme);
            } else if (os.ios && context.storeURL) {
                web2app_iOS(urlScheme, context.storeURL, onAppMissing);
            } else {
                onUnsupportedEnvironment();
            }
        }
        
        function web2app_android(launchURI) {
            top.location.href = launchURI;
        }
    
        function web2app_iOS(launchURI, storeURL, fallbackFunction) {
            setTimeout(function () {
                fallbackFunction(storeURL);
            }, 200); // launchURI와 storeURL이 둘다 실행되는 문제 방지
            
            window.location.href = launchURI;
        }
        
        /**
         * app.을 실행하거나 / store 페이지에 연결하여 준다.
         * @function
         * @param scheme {string} ios custom url scheme or android intent uri
         * @param context {object} storeURL, appName, onAppMissing, onUnsupportedEnvironment, willInvokeApp 
         * @example daumtools.web2app('daumapps://open', { storeURL: 'itms-app://...', appName: '다음앱' });
         */
        return web2app;
        
    })();
    
})(window.daumtools = (typeof window.daumtools === 'undefined') ? {} : window.daumtools);

    
