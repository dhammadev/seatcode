var seatwallaCookie = {
    getCookie: function(key) {
        if (!key || !this.hasCookie(key)) {
            return null;
        }

        var cookies = document.cookie.split(/;\s*/);
        var regEx = new RegExp("^" + key + "=.*$");

        for (var i = 0; i < cookies.length; i++) {
            //                if (new RegExp(key + "=.*").test(cookies[i])) {
            //                    return cookies[i].substring(key.length + 1);
            //                }

            var matches = cookies[i].split("=");

            if (matches && matches[0] === key && regEx.test(cookies[i])) {
                return matches[1];
            }
        }

        return null;
    },

    setCookie: function(key, value) {
        var expDate = new Date();
        expDate.setFullYear(expDate.getFullYear() + 10);
        document.cookie = escape(key) + "=" + escape(value) + ";expires=" + expDate.toGMTString() + ";secure";
    },

    hasCookie: function(key) {
        return (new RegExp("(^|;\\s+)" + window.escape(key) + "=")).test(document.cookie);
    },

    isCookieEnabled: function() {
        var isEnabled = navigator.cookieEnabled ||
                        ("cookie" in document && (document.cookie.length > 0 ||
                                                  (document.cookie = "test").indexOf.apply(document.cookie, ["test"]) >
                                                  -1));

        return isEnabled;

    }
};
