/* global daumtools, jshint devel: true */
(function (exports) {
    "use strict";

    exports.web2app = (function () {

        var TIMEOUT_IOS = 2 * 1000,
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
                onAppMissing  = (typeof context.onAppMissing === 'function')  ? context.onAppMissing  : moveToStore,
                onUnsupportedEnvironment = (typeof context.onUnsupportedEnvironment === 'function') ? context.onUnsupportedEnvironment : function(){};

            willInvokeApp();

            if (os.android) {
                if (isIntentSupportedBrowser() && context.intentURI && !context.useUrlScheme) {
                    web2appViaIntentURI(context.intentURI);
                } else if (context.storeURL) {
                    web2appViaCustomUrlSchemeForAndroid(context.urlScheme, context.storeURL, onAppMissing);
                }
            } else if (os.ios && context.storeURL) {
                web2appViaCustomUrlSchemeForIOS(context.urlScheme, context.storeURL, onAppMissing, context.universalLink);
            } else {
                setTimeout(function () {
                    onUnsupportedEnvironment();
                }, 100);
            }
        }

        // chrome 25 and later supports intent. https://developer.chrome.com/multidevice/android/intents
        function isIntentSupportedBrowser () {
            var supportsIntent = ua.browser.chrome && +(ua.browser.version.major) >= 25;
            var blackListRegexp = new RegExp(intentNotSupportedBrowserList.join('|'), "i");
            return supportsIntent && !blackListRegexp.test(ua.ua);
        }

        function web2appViaCustomUrlSchemeForAndroid (urlScheme, storeURL, fallback) {
            deferFallback(TIMEOUT_ANDROID, storeURL, fallback);
            launchAppViaHiddenIframe(urlScheme);
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

        function web2appViaIntentURI (launchURI) {            
            if ( ua.browser.chrome ){
              move();
            }else{
              setTimeout(move, 100);
            }

            function move(){
              top.location.href = launchURI;
            }
        }

        function web2appViaCustomUrlSchemeForIOS (urlScheme, storeURL, fallback, universalLink) {
            var tid = deferFallback(TIMEOUT_IOS, storeURL, fallback);
            if (parseInt(ua.os.version.major, 10) < 8) {
                bindPagehideEvent(tid);
            } else {
                bindVisibilityChangeEvent(tid);
            }

            // https://developer.apple.com/library/prerelease/ios/documentation/General/Conceptual/AppSearch/UniversalLinks.html#//apple_ref/doc/uid/TP40016308-CH12
            if ( isSupportUniversalLinks() ){
                if (universalLink === undefined) {
                    universalLink = urlScheme;
                } else {
                    clearTimeout(tid);
                }
                launchAppViaChangingLocation(universalLink);
            }else{
                launchAppViaHiddenIframe(urlScheme);
            }
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
                if (typeof document[attrNames[i]] !== 'undefined') {
                    return !document[attrNames[i]];
                }
            }
            return true;
        }

        function launchAppViaChangingLocation (urlScheme){
            window.top.location.href = urlScheme;
        }

        function launchAppViaHiddenIframe (urlScheme) {
            setTimeout(function () {
                var iframe = createHiddenIframe('appLauncher');
                iframe.src = urlScheme;
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

        function isSupportUniversalLinks(){
            return (parseInt(ua.os.version.major, 10) > 8 && ua.os.ios);
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


(function (exports) {
    "use strict";

    /* package version info */
    exports.daumtools = (typeof exports.daumtools === "undefined") ? {} : exports.daumtools;
    if(typeof exports.daumtools.web2app !== "undefined") {
        exports.daumtools.web2app.version = "1.0.12";
    }
}(window));

