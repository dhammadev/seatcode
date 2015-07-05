var browserDetection = (function() {
    var minValidVersions = {
        "Chrome": 22,
        "Firefox": 17,
        "Safari": 5.1
    };

    var minMobileBrowsersVersion = {
        "Safari": 4.0,//This includes zsb
        "Firefox": 10,
        "Chrome": 18,
        "Android": 4.0
    };

    var browsers = ["Firefox", "Chrome"];

    var browserData = [
        {
            userAgentString: navigator.userAgent,
            browserSearchString: "Chrome",
            browser: "Chrome"
        },
        {
            userAgentString: navigator.vendor,//since the userAgent strings have all the listed browsers mentioned and Apple is the only word to distinguish safari browser from others.
            browserSearchString: "Apple",
            browser: "Safari"

        },
        {
            userAgentString: navigator.userAgent,
            browserSearchString: "Firefox",
            browser: "Firefox"
        },
        {
            userAgentString: navigator.userAgent,
            browserSearchString: "MSIE",
            browser: "Explorer"
        },
        {
            userAgentString: navigator.userAgent,
            browserSearchString: "Trident",
            browser: "Explorer"
        },
        {
            userAgentString: navigator.userAgent,
            browserSearchString: "Android",
            browser: "Android"
        }
    ];

    var versionSearchString = {
        "Firefox": "Firefox",
        "Safari": "Version",
        "Chrome": ["Chrome", "CriOS"],
        "Explorer": ["MSIE", "Trident"],
        "Android": "Version"
    };

    var currentBrowser = "";

    var searchBrowser = function() {
        for (var i = 0; i < browserData.length; i++) {
            var uaString = browserData[i].userAgentString;
            if (uaString && uaString.indexOf(browserData[i].browserSearchString) != -1) {
                return browserData[i].browser;
            }
        }
    };

    var getVersion = function(uaString, versionSearch) {
        if (versionSearch instanceof Array) {

            var validVersionString = _.find(versionSearch, function(search) {
                return !_.isUndefined(getVersionNumber(uaString, search));
            });

            return getVersionNumber(uaString, validVersionString);

        }
        else {
            return getVersionNumber(uaString, versionSearch);
        }

    };

    var getVersionNumber = function(uaString, versionSearch) {
        var index = uaString.indexOf(versionSearch);
        if (index == -1) {
            return;
        }
        return parseFloat(uaString.substring(index + versionSearch.length + 1));
    };

    var isValidBrowserVersion = function() {
        var browser = searchBrowser() || "invalid";
        var minVersion;
        currentBrowser = browser;

        var ua = navigator.userAgent;

        // var version = getVersion(ua, versionSearchString[browser]) || getVersion(navigator.appVersion, versionSearchString[browser])
        //   || "invalid";

        //var isMobile = /Mobile/i.test(ua) || /Android/i.test(ua);

        if (_.indexOf(browsers, browser) !== -1) {
            return true;
        }

        return false;
    };

    var isExplorer = function() {
        var currentBrowser = searchBrowser() || "invalid";
        return _.isEqual(currentBrowser, "Explorer");
    };

    var isChromeFrameEnabled = function() {
        return (window.externalHost && _.isObject(window.externalHost)) ? true : false;
    };

    var getBrowserVersion = function() {
        var browser = searchBrowser() || "invalid";
        currentBrowser = browser;

        var ua = navigator.userAgent;

        return getVersion(ua, versionSearchString[browser]) ||
               getVersion(navigator.appVersion, versionSearchString[browser])
            || "invalid";

    };

    var getCurrentBrowser = function() {
        return searchBrowser() || "invalid";
    };

    return {
        isValidBrowserVersion: isValidBrowserVersion,
        isExplorer: isExplorer,
        isChromeFrameEnabled: isChromeFrameEnabled,
        getBrowserVersion: getBrowserVersion,
        getCurrentBrowser: getCurrentBrowser
    };
})();
