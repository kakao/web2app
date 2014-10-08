/*! ua_parser - v1.0.14 - 2013-08-08
* Copyright (c) 2013 HTML5 Tech. Team in Daum Communications Corp.;
* Licensed MIT - https://github.com/daumcorp/ua_parser/blob/master/LICENSE*/
!function(a){"use strict";var b=a.userAgent=function(a){function b(a){var b={},d=/(dolfin)[ \/]([\w.]+)/.exec(a)||/(chrome)[ \/]([\w.]+)/.exec(a)||/(opera)(?:.*version)?[ \/]([\w.]+)/.exec(a)||/(webkit)(?:.*version)?[ \/]([\w.]+)/.exec(a)||/(msie) ([\w.]+)/.exec(a)||a.indexOf("compatible")<0&&/(mozilla)(?:.*? rv:([\w.]+))?/.exec(a)||["","unknown"];return"webkit"===d[1]?d=/(iphone|ipad|ipod)[\S\s]*os ([\w._\-]+) like/.exec(a)||/(android)[ \/]([\w._\-]+);/.exec(a)||[d[0],"safari",d[2]]:"mozilla"===d[1]?d[1]=/trident/.test(a)?"msie":"firefox":/polaris|natebrowser|([010|011|016|017|018|019]{3}\d{3,4}\d{4}$)/.test(a)&&(d[1]="polaris"),b[d[1]]=!0,b.name=d[1],b.version=c(d[2]),b}function c(a){var b={},c=a?a.split(/\.|-|_/):["0","0","0"];return b.info=c.join("."),b.major=c[0]||"0",b.minor=c[1]||"0",b.patch=c[2]||"0",b}function d(a){return e(a)?"pc":f(a)?"tablet":g(a)?"mobile":""}function e(a){return a.match(/linux|windows (nt|98)|macintosh/)&&!a.match(/android|mobile|polaris|lgtelecom|uzard|natebrowser|ktf;|skt;/)?!0:!1}function f(a){return a.match(/ipad/)||a.match(/android/)&&!a.match(/mobi|mini|fennec/)?!0:!1}function g(a){return a.match(/ip(hone|od)|android.+mobile|windows (ce|phone)|blackberry|bb10|symbian|webos|firefox.+fennec|opera m(ob|in)i|polaris|iemobile|lgtelecom|nokia|sonyericsson|dolfin|uzard|natebrowser|ktf;|skt;/)?!0:!1}function h(a){var b={},d=/(iphone|ipad|ipod)[\S\s]*os ([\w._\-]+) like/.exec(a)||/(android)[ \/]([\w._\-]+);/.exec(a)||(/android/.test(a)?["","android","0.0.0"]:!1)||(/polaris|natebrowser|([010|011|016|017|018|019]{3}\d{3,4}\d{4}$)/.test(a)?["","polaris","0.0.0"]:!1)||/(windows)(?: nt | phone(?: os){0,1} | )([\w._\-]+)/.exec(a)||(/(windows)/.test(a)?["","windows","0.0.0"]:!1)||/(mac) os x ([\w._\-]+)/.exec(a)||(/(linux)/.test(a)?["","linux","0.0.0"]:!1)||(/webos/.test(a)?["","webos","0.0.0"]:!1)||/(bada)[ \/]([\w._\-]+)/.exec(a)||(/bada/.test(a)?["","bada","0.0.0"]:!1)||(/(rim|blackberry|bb10)/.test(a)?["","blackberry","0.0.0"]:!1)||["","unknown","0.0.0"];return"iphone"===d[1]||"ipad"===d[1]||"ipod"===d[1]?d[1]="ios":"windows"===d[1]&&"98"===d[2]&&(d[2]="0.98.0"),b[d[1]]=!0,b.name=d[1],b.version=c(d[2]),b}function i(a){var b={},d=/(crios)[ \/]([\w.]+)/.exec(a)||/(daumapps)[ \/]([\w.]+)/.exec(a)||["",""];return d[1]?(b.isApp=!0,b.name=d[1],b.version=c(d[2])):b.isApp=!1,b}return a=(a||window.navigator.userAgent).toString().toLowerCase(),{ua:a,browser:b(a),platform:d(a),os:h(a),app:i(a)}};"object"==typeof window&&window.navigator.userAgent&&(window.ua_result=b(window.navigator.userAgent)||null)}(function(){return"object"==typeof exports?(exports.daumtools=exports,exports.util=exports,exports):"object"==typeof window?(window.daumtools="undefined"==typeof window.daumtools?{}:window.daumtools,window.util="undefined"==typeof window.util?window.daumtools:window.util,window.daumtools):void 0}());

/*jshint devel: true */
(function (exports) {
    "use strict";
    
    exports.web2app = (function () {

        var IOS8_TIMEOUT = 1 * 1000,
            IOS7_TIMEOUT = 2 * 1000,
            ua = daumtools.userAgent(),
            os = ua.os;
        
        var intentNotSupportedBrowserList = [
            'firefox'
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
                if (isIntentNotSupportedBrowser() || !!context.useUrlScheme) {
                    if (context.storeURL) {
                        web2appViaCustomUrlSchemeForAndroid(context.urlScheme, context.storeURL, onAppMissing);
                    }
                } else if (context.intentURI){
                    web2appViaIntentURI(context.intentURI);
                }
            } else if (os.ios && context.storeURL) {
                web2appViaCustomUrlSchemeForIOS(context.urlScheme, context.storeURL, onAppMissing);
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

        function web2appViaCustomUrlSchemeForAndroid (urlScheme, storeURL, fallbackFunction) {
            setTimeout(function () {
                fallbackFunction(storeURL);
            }, 1000);
            launchAppViaHiddenIframe(urlScheme);
        }

        function web2appViaIntentURI (launchURI) {
            setTimeout(function () {
                top.location.href = launchURI;
            }, 100);
        }

        function web2appViaCustomUrlSchemeForIOS (urlScheme, storeURL, fallbackFunction) {
            if (parseInt(ua.os.version.major, 10) < 8) {
                bindPagehideEvent(storeURL, fallbackFunction);
            } else {
                bindVisibilityChangeEvent(storeURL, fallbackFunction);
            }
            launchAppViaHiddenIframe(urlScheme);
        }

        function bindPagehideEvent (storeURL, fallbackFunction) {
            var tid = setTimeout(function () {
                fallbackFunction(storeURL);
            }, IOS7_TIMEOUT);
            window.addEventListener('pagehide', function clear () {
                if (isPageVisible()) {
                    clearTimeout(tid);
                    window.removeEventListener('pagehide', clear);
                }
            });
        }

        function bindVisibilityChangeEvent (storeURL, fallbackFunction) {
            var tid = setTimeout(function () {
                fallbackFunction(storeURL);
            }, IOS8_TIMEOUT);
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
    if(exports.daumtools.web2app !== "undefined") {
        exports.daumtools.web2app.version = "1.0.2";
    }
}(window));
