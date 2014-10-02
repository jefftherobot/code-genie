// Extra credit, a debugging module too
module.exports = function (env, callback) {

    /** Helps sort arbitrary content */
    var categorize = function (rname, root, key, from) {

        // Special exceptions
        if (key == 'constructor')
            return;
        else if (key == 'parent')
            return;
        else if (key == 'html')
            return;

        // Is this some kind of helper function?
        if (typeof(from[key]) == 'function') {
            try {
                root.helpers[key + '()'] = from[key]();
            }
            catch (e) {
                // Stupid functions with no obvious usage can fuck off.
            }
        }

        // Not a function? Must be data
        else {
            try {
                JSON.stringify(from[key]);
                root.data[rname + '.' + key] = from[key];
            }
            catch(e) {
                var tmp = {};
                for (var k in from[key]) {
                    try {
                        JSON.stringify(from[key][k]);
                        tmp[k] = from[key][k];
                    }
                    catch(e) {
                        tmp[k] = '...';
                    }
                }
                root.data[key] = tmp;
            }
        }
    };

    /** Page processing helper */
    var handle_page = function (page) {

        // Setup data blocks
        var data = {
            helpers: {
                __info: 'via page.XXX; eg. page.getUrl()'
            },
            data: {
                __info: 'via page.XXX; eg. page.metadata.template',
                'parent': 'parent data object, see env.helpers.debug(page.parent, contents)'
            }
        };

        // Process page data
        for (var key in page) {
            if (!key.indexOf('_') == 0) {
                categorize('page', data, key, page);
            }
        }

        // Return all debugging data
        var rtn = {
            'page': data,
            toString: function () {
                return JSON.stringify(rtn, null, 4);
            }
        };
        return rtn;
    };

    /** Contents processing helper */
    var handle_contents = function (page) {

        // Setup data blocks
        var data = {
            data: {
            }
        };

        // Process page data
        for (var key in page) {
            if (!key.indexOf('_') == 0) {
                categorize('contents', data, key, page);
            }
        }

        // Return all debugging data
        var rtn = {
            'contents': data,
            toString: function () {
                return JSON.stringify(rtn, null, 4);
            }
        };
        return rtn;
    };

    /** Publish this helper to external use */
    env.helpers.debug = function (c) {
        if (!c) {
            console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!\n');
            console.log('Debugging is not possible without context.');
            console.log('required usage in template is one of:\n');
            console.log('- var x = env.helpers.debug(page)\n');
            console.log('- var x = env.helpers.debug(contents)\n');
            console.log('= env.helpers.debug(page).toString()\n');
            console.log('= env.helpers.debug(contents).toString()\n');
            console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
            throw new Error('Invalid usage of env.helpers.debug')
        }
        if (c['filepath']) {
            return handle_page(c);
        }
        return handle_contents(c);
    };

    // Done!
    callback();
}