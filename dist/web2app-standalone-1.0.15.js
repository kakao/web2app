/*jshint browser: true, node: true
*/

(function (exports) {
    'use strict';

    var userAgent = exports.userAgent = function (ua) {
        ua = (ua || window.navigator.userAgent).toString().toLowerCase();
        function checkUserAgent(ua) {
            var browser = {};
            var match = /(dolfin)[ \/]([\w.]+)/.exec( ua ) ||
                    /(edge)[ \/]([\w.]+)/.exec( ua ) ||
                    /(chrome)[ \/]([\w.]+)/.exec( ua ) ||
                    /(opera)(?:.*version)?[ \/]([\w.]+)/.exec( ua ) ||
                    /(webkit)(?:.*version)?[ \/]([\w.]+)/.exec( ua ) ||
                    /(msie) ([\w.]+)/.exec( ua ) ||
                    ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+))?/.exec( ua ) ||
                    ["","unknown"];
            if (match[1] === "webkit") {
                match = /(iphone|ipad|ipod)[\S\s]*os ([\w._\-]+) like/.exec(ua) ||
                    /(android)[ \/]([\w._\-]+);/.exec(ua) || [match[0], "safari", match[2]];
            } else if (match[1] === "mozilla") {
                if (/trident/.test(ua)) {
                    match[1] = "msie";
                } else {
                    match[1] = "firefox";
                }
            } else if (/polaris|natebrowser|([010|011|016|017|018|019]{3}\d{3,4}\d{4}$)/.test(ua)) {
                match[1] = "polaris";
            }

            browser[match[1]] = true;
            browser.name = match[1];
            browser.version = setVersion(match[2]);

            return browser;
        }

        function setVersion(versionString) {
            var version = {};

            var versions = versionString ? versionString.split(/\.|-|_/) : ["0","0","0"];
            version.info = versions.join(".");
            version.major = versions[0] || "0";
            version.minor = versions[1] || "0";
            version.patch = versions[2] || "0";

            return version;
        }

        function checkPlatform (ua) {
            if (isPc(ua)) {
                return "pc";
            } else if (isTablet(ua)) {
                return "tablet";
            } else if (isMobile(ua)) {
                return "mobile";
            } else {
                return "";
            }
        }
        function isPc (ua) {
            if (ua.match(/linux|windows (nt|98)|macintosh|cros/) && !ua.match(/android|mobile|polaris|lgtelecom|uzard|natebrowser|ktf;|skt;/)) {
                return true;
            }
            return false;
        }
        function isTablet (ua) {
            if (ua.match(/ipad/) || (ua.match(/android/) && !ua.match(/mobi|mini|fennec/))) {
                return true;
            }
            return false;
        }
        function isMobile (ua) {
            if (!!ua.match(/ip(hone|od)|android.+mobile|windows (ce|phone)|blackberry|bb10|symbian|webos|firefox.+fennec|opera m(ob|in)i|polaris|iemobile|lgtelecom|nokia|sonyericsson|dolfin|uzard|natebrowser|ktf;|skt;/)) {
                return true;
            } else {
                return false;
            }
        }

        function checkOs (ua) {
            var os = {},
                match = /(iphone|ipad|ipod)[\S\s]*os ([\w._\-]+) like/.exec(ua) ||
                        (/polaris|natebrowser|([010|011|016|017|018|019]{3}\d{3,4}\d{4}$)/.test(ua)? ["", "polaris", "0.0.0"] : false) ||
                        /(windows)(?: nt | phone(?: os){0,1} | )([\w._\-]+)/.exec(ua) ||
                        /(android)[ \/]([\w._\-]+);/.exec(ua) ||
                        (/android/.test(ua)? ["", "android", "0.0.0"] : false) ||
                        (/(windows)/.test(ua)? ["", "windows", "0.0.0"] : false) ||
                        /(mac) os x ([\w._\-]+)/.exec(ua) ||
                        (/(linux)/.test(ua)? ["", "linux", "0.0.0"] : false) ||
                        (/webos/.test(ua)? ["", "webos", "0.0.0"] : false) ||
                        /(cros)(?:\s[\w]+\s)([\d._\-]+)/.exec(ua) ||
                        /(bada)[ \/]([\w._\-]+)/.exec(ua) ||
                        (/bada/.test(ua)? ["", "bada", "0.0.0"] : false) ||
                        (/(rim|blackberry|bb10)/.test(ua)? ["", "blackberry", "0.0.0"] : false) ||
                        ["", "unknown", "0.0.0"];

            if (match[1] === "iphone" || match[1] === "ipad" || match[1] === "ipod") {
                match[1] = "ios";
            } else if (match[1] === "windows" && match[2] === "98") {
                match[2] = "0.98.0";
            }
            if (match[1] === 'cros') {
                match[1] = "chrome";
            }
            os[match[1]] = true;
            os.name = match[1];
            os.version = setVersion(match[2]);
            return os;
        }

        function checkApp (ua) {
            var app = {},
                match = /(crios)[ \/]([\w.]+)/.exec( ua ) ||
                        /(daumapps)[ \/]([\w.]+)/.exec( ua ) ||
                        ["",""];

            if (match[1]) {
                app.isApp = true;
                app.name = match[1];
                app.version = setVersion(match[2]);
            } else {
                app.isApp = false;
            }

            return app;
        }

        return {
            ua: ua,
            browser: checkUserAgent(ua),
            platform: checkPlatform(ua),
            os: checkOs(ua),
            app: checkApp(ua)
        };
    };

    if (typeof window === 'object' && window.navigator.userAgent) {
        window.ua_result = userAgent(window.navigator.userAgent) || null;
    }

})((function (){
    // Make userAgent a Node module, if possible.
    if (typeof exports === 'object') {
        exports.daumtools = exports;
        exports.util = exports;
        return exports;
    } else if (typeof window === 'object') {
        window.daumtools = (typeof window.daumtools === 'undefined') ? {} : window.daumtools;
        window.util = (typeof window.util === 'undefined') ? window.daumtools : window.util;
        return window.daumtools;
    }
})());


/* global exports, jshint devel: true */
(function (exports) {
    "use strict";

    exports.web2app = (function () {

        var TIMEOUT_IOS = 2 * 1000,
            TIMEOUT_ANDROID = 3 * 100,
            INTERVAL = 100,
            ua = exports.userAgent(),
            os = ua.os,
            intentNotSupportedBrowserList = [
                'firefox',
                'opr/'
            ];

        function moveToStore (storeURL) {
            top.window.location.href = storeURL;
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
                top.window.location.href = launchURI;
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
            top.window.location.href = urlScheme;
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

})((function (){
    if (typeof exports === 'object') {
        exports.daumtools = exports;
        return exports;
    } else if (typeof window === 'object') {
        window.daumtools = (typeof window.daumtools === 'undefined') ? {} : window.daumtools;
        return window.daumtools;
    }
})());