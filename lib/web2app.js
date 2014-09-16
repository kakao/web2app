/*jshint devel: true */
(function (exports) {
    "use strict";
    
    exports.web2app = (function () {

        var ua = daumtools.userAgent(),
            os = ua.os;
        
        var intentNotSupportedBrowserList = [
            'firefox'
        ];
        
        var moveToStore = function (storeURL) {
            window.location.href = storeURL;
        };
        
        function web2app(context) {
            
            var willInvokeApp = (typeof context.willInvokeApp === 'function') ? context.willInvokeApp : function(){},
                onAppMissing  = (typeof context.onAppMissing === 'function')  ? context.onAppMissing  : moveToStore,
                onUnsupportedEnvironment = (typeof context.onUnsupportedEnvironment === 'function') ? context.onUnsupportedEnvironment : function(){};
            
            willInvokeApp();
            
            setTimeout(function () {
                if (os.android) {
                    if (isIntentNotSupportedBrowser() || !!context.useUrlScheme) {
                        if (context.storeURL) {
                            web2app_android_scheme(context.urlScheme, context.storeURL, onAppMissing);
                        }
                    } else if (context.intentURI){
                        web2app_android_intent(context.intentURI);
                    }
                } else if (os.ios && context.storeURL) {
                    web2app_iOS(context.urlScheme, context.storeURL, onAppMissing);
                } else {
                    onUnsupportedEnvironment();
                }
            }, 100);                        
        }
        
        function isIntentNotSupportedBrowser() {
            var blackListRegexp = new RegExp(intentNotSupportedBrowserList.join('|'), "i");

            return blackListRegexp.test(ua.ua);
        }
        
        function web2app_iOS(launchURI, storeURL, fallbackFunction) {
            var tid = deferFallback(function () {
                fallbackFunction(storeURL);
            });
            window.addEventListener('pagehide', function clear () {
                clearTimeout(tid);
                window.removeEventListener('pagehide', clear);
            });
            window.location.href = launchURI;
        }

        function web2app_android_intent(launchURI) {
            top.location.href = launchURI;
        }
        
        function web2app_android_scheme(launchURI, storeURL, fallbackFunction) {
            var tid = deferFallback(function () {
                fallbackFunction(storeURL);
            });
            var iframe = createHiddenIframe('appLauncher');
            iframe.src = launchURI;
        }

        function deferFallback(callback) {
            var clickedAt = new Date().getTime();
            return setTimeout(function () {
                var now = new Date().getTime();
                if (isPageVisible() && now - clickedAt < 2500) {
                    callback();
                }
            }, 2000);
            // 앱을 처음 실행하는 경우에는 pagehide가 발생하기 전(앱이 실행되어 브라우저 pagehide 발생)에 fallback이 실행되는 경우가 있어 2초 정도 필요
        }
        
        function isPageVisible() {
            var attrNames = ['hidden', 'webkitHidden'];
            for(var i=0, len=attrNames.length; i<len; i++) {
                if (document[attrNames[i]] !== 'undefined') {
                    return !document[attrNames[i]];
                }
            }
            return true;
        }
        
        function createHiddenIframe(id) {
            var iframe = document.createElement('iframe');
            iframe.id = id;
            iframe.style.border = 'none';
            iframe.style.width = '0';
            iframe.style.height = '0';
            iframe.style.display = 'none';
            iframe.style.overflow = 'hidden';
            document.body.appendChild(iframe);
            return iframe;
        }
                
        /**
         * app.을 실행하거나 / store 페이지에 연결하여 준다.
         * @function 
         * @param context {object} urlScheme, intentURI, storeURL, appName, onAppMissing, onUnsupportedEnvironment, willInvokeApp 
         * @example daumtools.web2app({ urlScheme : 'daumapps://open', intentURI : '', storeURL: 'itms-app://...', appName: '다음앱' });
         */
        return web2app;
        
    })();
    
})(window.daumtools = (typeof window.daumtools === 'undefined') ? {} : window.daumtools);

    
