describe("web2app.js", function () {
    'use strict';

    var daumtools = null;
        
    beforeEach(function() {
        daumtools = window.daumtools;

        spyOn(daumtools, 'web2app');

        //window.navigator.userAgent = "Mozilla/5.0 (iPhone; CPU iPhone OS 5_0_1 like Mac OS X) AppleWebKit/534.46 (KHTML, like Gecko) Version/5.1 Mobile/9A405 Safari/7534.48.3";

        var scheme = 'myp',
            pkgName = 'net.daum.android.air',
            urlScheme = 'myp://sendMessage?message=web2app test' +
                '&url=' + encodeURIComponent('http://www.daum.net') +
                '&appID=' + encodeURIComponent('http://www.daum.net'),
            appStoreURL = 'itms-apps://itunes.apple.com/kr/app/id373539016?mt=8';

        daumtools.web2app(urlScheme, {
            storeURL : appStoreURL,
            appName : '마이피플',
            onAppMissing: function() {

            },
            onUnsupportedEnvironment: function() {  
                
            },
            willInvokeApp: function() {

            }
        });

    });
    
    it("should call web2app function", function() {
        expect(daumtools.web2app).toHaveBeenCalled();
    });

});

