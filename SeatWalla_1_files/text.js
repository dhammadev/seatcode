var module = (function() {
    var returnStrings = {};
    var language = localStorage["seatwalla_language"] || "ENGLISH";

    var placeHolder = {
        firstName: translation[language].PLACEHOLDER_FIRST_NAME,
        secondName: translation[language].PLACEHOLDER_SECOND_NAME,
        age: translation[language].PLACEHOLDER_AGE,
        courses: translation[language].PLACEHOLDER_COURSES,
        room: translation[language].PLACEHOLDER_ROOM,
        notes: translation[language].PLACEHOLDER_NOTES
    }

    var htmlText = function(lang) {
        var data = {};
        if (lang === "ENGLISH" || lang === "VIETNAMESE" || lang === "SPANISH" || lang === "PORTUGUESE") {
            data =  translation[lang];
        }
        else {
            data =  translation["ENGLISH"];
        }

        data.language = lang;
        return data;
    };

    var replaceArg = function(text) {

        var translation = text;

        if (arguments.length > 1) {
            var params = Array.prototype.slice.call(arguments, 1);

            // Replaces "{0}" with first parameter, "{1}" with second parameter, etc.
            translation = translation.replace(/\{(\d+)\}/g, function(match, p1) {
                return params[p1];
                //return localization.localizeStringUsingLocale(params[p1], locale);
            });
        }

        return translation;
    }

    return {
        data: htmlText,
        replaceArg: replaceArg,
        placeHolder: placeHolder,
        language: language
    };
})();
