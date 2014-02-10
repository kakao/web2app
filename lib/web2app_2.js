/*jshint devel: true */
(function (exports) {
    "use strict";

    exports.web2app2 = (function () {

        var ua = daumtools.userAgent(),
            os = ua.os;

        var intentNotSupportedBrowserList = [
            'firefox',
            'opr'
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
                if (os.android && context.storeURL) {
                    if (isIntentNotSupportedBrowser() || !!context.useUrlScheme) {
                        web2app_android_scheme(context.urlScheme, context.storeURL, onAppMissing);
                    } else {
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
            setTimeout(function () {
                fallbackFunction(storeURL);
            }, 200); // launchURI와 storeURL이 둘다 실행되는 문제 방지

            window.location.href = launchURI;
        }

        function web2app_android_intent(launchURI) {
            top.location.href = launchURI;
        }

        function web2app_android_scheme(launchURI, storeURL, fallbackFunction) {
            var clickedAt = new Date().getTime();
            setTimeout(function () {
                var now = new Date().getTime();
                if (isPageVisible() && now - clickedAt < 2000) {
                    fallbackFunction(storeURL);
                }
            }, 1000);
            var iframe = createHiddenIframe('appLauncher');
            iframe.src = launchURI;
        }

        function isPageVisible() {
            if (typeof document.webkitHidden !== 'undefined') {
                return !document.webkitHidden;
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


