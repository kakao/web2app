/*jshint devel: true */
(function (exports) {
    "use strict";
    
    exports.web2app = (function () {

        var TIMEOUT_IOS_SHORT = 1 * 1000,
            TIMEOUT_IOS_LONG = 2 * 1000,
            TIMEOUT_ANDROID = 3 * 100,
            INTERVAL = 100,
            ua = daumtools.userAgent(),
            os = ua.os,
            intentNotSupportedBrowserList = [
                'firefox',
                'opr'
            ];
        
        function moveToStore (storeURL) {
            window.location.href = storeURL;
        }

        function web2app (context) {
            var willInvokeApp = (typeof context.willInvokeApp === 'function') ? context.willInvokeApp : function(){},
                afterInvokeApp = (typeof context.afterInvokeApp === 'function') ? context.afterInvokeApp : function(){},
                onAppMissing  = (typeof context.onAppMissing === 'function')  ? context.onAppMissing  : moveToStore,
                onUnsupportedEnvironment = (typeof context.onUnsupportedEnvironment === 'function') ? context.onUnsupportedEnvironment : function(){};
            
            willInvokeApp();

            if (os.android) {
                if (isIntentNotSupportedBrowser() || !!context.useUrlScheme) {
                    if (context.storeURL) {
                        web2appViaCustomUrlSchemeForAndroid(context.urlScheme, context.storeURL, onAppMissing, afterInvokeApp);
                    }
                } else if (context.intentURI){
                    web2appViaIntentURI(context.intentURI, afterInvokeApp);
                }
            } else if (os.ios && context.storeURL) {
                web2appViaCustomUrlSchemeForIOS(context.urlScheme, context.storeURL, onAppMissing, afterInvokeApp);
            } else {
                setTimeout(function () {
                    onUnsupportedEnvironment();
                }, 100);
            }
        }
        
        function isIntentNotSupportedBrowser () {
            var blackListRegexp = new RegExp(intentNotSupportedBrowserList.join('|'), "i");
            return blackListRegexp.test(ua.ua);
        }

        function web2appViaCustomUrlSchemeForAndroid (urlScheme, storeURL, fallback, afterInvokeApp) {
            deferFallback(TIMEOUT_ANDROID, storeURL, fallback);
            launchAppViaHiddenIframe(urlScheme, afterInvokeApp);
        }

        function deferFallback(timeout, storeURL, fallback) {
            var clickedAt = new Date().getTime();
            return setTimeout(function () {
                var now = new Date().getTime();
                if (isPageVisible() && now - clickedAt < timeout + INTERVAL) {
                    fallback(storeURL);
                }
            }, timeout);
        }

        function web2appViaIntentURI (launchURI, afterInvokeApp) {
            setTimeout(function () {
                invokeAfterInvokeApp(afterInvokeApp);
                top.location.href = launchURI;
            }, 100);
        }

        function web2appViaCustomUrlSchemeForIOS (urlScheme, storeURL, fallback, afterInvokeApp) {
            var tid;
            if (parseInt(ua.os.version.major, 10) < 8) {
                tid = deferFallback(TIMEOUT_IOS_LONG, storeURL, fallback);
                bindPagehideEvent(tid);
            } else {
                // to avoid ios store alert
                if (moveToStore === fallback) {
                    tid = deferFallback(TIMEOUT_IOS_SHORT, storeURL, fallback);
                } else {
                    tid = deferFallback(TIMEOUT_IOS_LONG, storeURL, fallback);
                }
                bindVisibilityChangeEvent(tid);
            }
            launchAppViaHiddenIframe(urlScheme, afterInvokeApp);
        }

        function bindPagehideEvent (tid) {
            window.addEventListener('pagehide', function clear () {
                if (isPageVisible()) {
                    clearTimeout(tid);
                    window.removeEventListener('pagehide', clear);
                }
            });
        }

        function bindVisibilityChangeEvent (tid) {
            document.addEventListener('visibilitychange', function clear () {
                if (isPageVisible()) {
                    clearTimeout(tid);
                    document.removeEventListener('visibilitychange', clear);
                }
            });
        }

        function isPageVisible () {
            var attrNames = ['hidden', 'webkitHidden'];
            for(var i=0, len=attrNames.length; i<len; i++) {
                if (document[attrNames[i]] !== 'undefined') {
                    return !document[attrNames[i]];
                }
            }
            return true;
        }

        function launchAppViaHiddenIframe (urlScheme, afterInvokeApp) {
            setTimeout(function () {
                invokeAfterInvokeApp(afterInvokeApp);
                var iframe = createHiddenIframe('appLauncher');
                iframe.src = urlScheme;
            }, 100);
        }

        function invokeAfterInvokeApp(afterInvokeApp) {
            setTimeout(function () {
                afterInvokeApp();
            }, 100);
        }

        function createHiddenIframe (id) {
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

    
})(window.daumtools = (typeof window.daumtools === 'undefined') ? {} : window.daumtools)