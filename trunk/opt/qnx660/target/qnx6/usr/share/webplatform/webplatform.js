(function () { 
/*
Copyright 2012 Research In Motion Limited.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.


*/
/**
 * almond 0.0.3 Copyright (c) 2011, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/almond for details
 */
/*jslint strict: false, plusplus: false */
/*global setTimeout: false */

var requirejs, require, define;
(function (undef) {

    var defined = {},
        waiting = {},
        aps = [].slice,
        main, req;

    if (typeof define === "function") {
        //If a define is already in play via another AMD loader,
        //do not overwrite.
        return;
    }

    /**
     * Given a relative module name, like ./something, normalize it to
     * a real name that can be mapped to a path.
     * @param {String} name the relative name
     * @param {String} baseName a real name that the name arg is relative
     * to.
     * @returns {String} normalized name
     */
    function normalize(name, baseName) {
        //Adjust any relative paths.
        if (name && name.charAt(0) === ".") {
            //If have a base name, try to normalize against it,
            //otherwise, assume it is a top-level require that will
            //be relative to baseUrl in the end.
            if (baseName) {
                //Convert baseName to array, and lop off the last part,
                //so that . matches that "directory" and not name of the baseName's
                //module. For instance, baseName of "one/two/three", maps to
                //"one/two/three.js", but we want the directory, "one/two" for
                //this normalization.
                baseName = baseName.split("/");
                baseName = baseName.slice(0, baseName.length - 1);

                name = baseName.concat(name.split("/"));

                //start trimDots
                var i, part;
                for (i = 0; (part = name[i]); i++) {
                    if (part === ".") {
                        name.splice(i, 1);
                        i -= 1;
                    } else if (part === "..") {
                        if (i === 1 && (name[2] === '..' || name[0] === '..')) {
                            //End of the line. Keep at least one non-dot
                            //path segment at the front so it can be mapped
                            //correctly to disk. Otherwise, there is likely
                            //no path mapping for a path starting with '..'.
                            //This can still fail, but catches the most reasonable
                            //uses of ..
                            break;
                        } else if (i > 0) {
                            name.splice(i - 1, 2);
                            i -= 2;
                        }
                    }
                }
                //end trimDots

                name = name.join("/");
            }
        }
        return name;
    }

    function makeRequire(relName, forceSync) {
        return function () {
            //A version of a require function that passes a moduleName
            //value for items that may need to
            //look up paths relative to the moduleName
            return req.apply(undef, aps.call(arguments, 0).concat([relName, forceSync]));
        };
    }

    function makeNormalize(relName) {
        return function (name) {
            return normalize(name, relName);
        };
    }

    function makeLoad(depName) {
        return function (value) {
            defined[depName] = value;
        };
    }

    function callDep(name) {
        if (waiting.hasOwnProperty(name)) {
            var args = waiting[name];
            delete waiting[name];
            main.apply(undef, args);
        }
        return defined[name];
    }

    /**
     * Makes a name map, normalizing the name, and using a plugin
     * for normalization if necessary. Grabs a ref to plugin
     * too, as an optimization.
     */
    function makeMap(name, relName) {
        var prefix, plugin,
            index = name.indexOf('!');

        if (index !== -1) {
            prefix = normalize(name.slice(0, index), relName);
            name = name.slice(index + 1);
            plugin = callDep(prefix);

            //Normalize according
            if (plugin && plugin.normalize) {
                name = plugin.normalize(name, makeNormalize(relName));
            } else {
                name = normalize(name, relName);
            }
        } else {
            name = normalize(name, relName);
        }

        //Using ridiculous property names for space reasons
        return {
            f: prefix ? prefix + '!' + name : name, //fullName
            n: name,
            p: plugin
        };
    }

    main = function (name, deps, callback, relName) {
        var args = [],
            usingExports,
            cjsModule, depName, i, ret, map;

        //Use name if no relName
        if (!relName) {
            relName = name;
        }

        //Call the callback to define the module, if necessary.
        if (typeof callback === 'function') {

            //Default to require, exports, module if no deps if
            //the factory arg has any arguments specified.
            if (!deps.length && callback.length) {
                deps = ['require', 'exports', 'module'];
            }

            //Pull out the defined dependencies and pass the ordered
            //values to the callback.
            for (i = 0; i < deps.length; i++) {
                map = makeMap(deps[i], relName);
                depName = map.f;

                //Fast path CommonJS standard dependencies.
                if (depName === "require") {
                    args[i] = makeRequire(name);
                } else if (depName === "exports") {
                    //CommonJS module spec 1.1
                    args[i] = defined[name] = {};
                    usingExports = true;
                } else if (depName === "module") {
                    //CommonJS module spec 1.1
                    cjsModule = args[i] = {
                        id: name,
                        uri: '',
                        exports: defined[name]
                    };
                } else if (defined.hasOwnProperty(depName) || waiting.hasOwnProperty(depName)) {
                    args[i] = callDep(depName);
                } else if (map.p) {
                    map.p.load(map.n, makeRequire(relName, true), makeLoad(depName), {});
                    args[i] = defined[depName];
                } else {
                    throw name + ' missing ' + depName;
                }
            }

            ret = callback.apply(defined[name], args);

            if (name) {
                //If setting exports via "module" is in play,
                //favor that over return value and exports. After that,
                //favor a non-undefined return value over exports use.
                if (cjsModule && cjsModule.exports !== undef) {
                    defined[name] = cjsModule.exports;
                } else if (!usingExports) {
                    //Use the return value from the function.
                    defined[name] = ret;
                }
            }
        } else if (name) {
            //May just be an object definition for the module. Only
            //worry about defining if have a module name.
            defined[name] = callback;
        }
    };

    requirejs = req = function (deps, callback, relName, forceSync) {
        if (typeof deps === "string") {

            //Just return the module wanted. In this scenario, the
            //deps arg is the module name, and second arg (if passed)
            //is just the relName.
            //Normalize module name, if it contains . or ..
            return callDep(makeMap(deps, callback).f);
        } else if (!deps.splice) {
            //deps is a config object, not an array.
            //Drop the config stuff on the ground.
            if (callback.splice) {
                //callback is an array, which means it is a dependency list.
                //Adjust args if there are dependencies
                deps = callback;
                callback = arguments[2];
            } else {
                deps = [];
            }
        }

        //Simulate async callback;
        if (forceSync) {
            main(undef, deps, callback, relName);
        } else {
            setTimeout(function () {
                main(undef, deps, callback, relName);
            }, 15);
        }

        return req;
    };

    /**
     * Just drops the config on the floor, but returns req in case
     * the config return value is used.
     */
    req.config = function () {
        return req;
    };

    /**
     * Export require as a global, but only if it does not already exist.
     */
    if (!require) {
        require = req;
    }

    define = function (name, deps, callback) {

        //This module may not have dependencies
        if (!deps.splice) {
            //deps is not an array, so probably means
            //an object literal or factory function for
            //the value. Adjust args.
            callback = deps;
            deps = [];
        }

        if (define.unordered) {
            waiting[name] = [name, deps, callback];
        } else {
            main(name, deps, callback);
        }
    };

    define.amd = {
        jQuery: true
    };
}());

define('pps/pps', function (require, exports, module) {
/*
* Copyright 2012 Research In Motion Limited.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

/*jshint es5:true */

var pps,
    globalId = 0,
    ppsConnections = {};

function generateId() {
    var id = globalId++;
    if (!window.isFinite(id)) {
        globalId = 0;
        id = 0;
    }
    return id;
}

pps = {
    // PPS Modes
    PPSMode: { FULL: 0, DELTA: 1, SERVER: 2, RAW: 3 },
    // File mode constants for use with the open() function
    // WRONLY is fastest
    // CREATE can be or-ed with RDONLY, WRONLY, or RDWR (e.g. open("/pps/someppsobject", FileMode.CREATE|FileMode.WRONLY))
    FileMode: { RDONLY: 0, WRONLY: 1, RDWR: 2, CREATE: 256 },

    create: function (ppsPath, ppsMode) {
        var _id = generateId(),
            _path = ppsPath,
            _mode = ppsMode,
            _data,
            _returnObj;

        function isActive() {
            return ppsConnections.hasOwnProperty(_id);
        }

        function deactivate() {
            delete ppsConnections[_id];
        }

        function open(fileMode, options) {
            var obj = JSON.parse(qnx.callExtensionMethod('pps.open', _id, _path, _mode, fileMode, options));
            if (obj.result) {
                ppsConnections[_id] = this;
                _data = obj.data;
                return true;
            }
            return false;
        }

        function write(data) {
            if (isActive()) {
                return qnx.callExtensionMethod('pps.write', _id, JSON.stringify(data)) === 'true';
            }
            return false;
        }

        function close() {
            if (isActive()) {
                qnx.callExtensionMethod('pps.close', _id);
            }
        }

        _returnObj = {
            open : open,
            write : write,
            close : close,

            /**
             * @description Callback to be fired when the PPS object is first read after open() is called.
             * @type {function}
             */
            onFirstReadComplete: undefined,

            /**
             * @desription Callback fired when new data has changed in the PPS that you have open()
             * @type {function}
             */
            onNewData: undefined,

            onOpenFailed: function (message) {
                console.log('PPS Connection - open failed: ' + message);
            },
            onWriteFailed: function (message) {
                console.log('PPS Connection - write failed: ' + message);
            },
            onClosed : deactivate
        };

        _returnObj.__defineGetter__('data', function () {
            return _data;
        });

        _returnObj.__defineGetter__('path', function () {
            return _path;
        });

        return _returnObj;
    },

    onEvent: function (id, type, data) {
        if (!type || !ppsConnections.hasOwnProperty(id)) {
            return;
        }

        var ppsConnection = ppsConnections[id],
            eventHandlerName = 'on' + type;
        if (ppsConnection.hasOwnProperty(eventHandlerName) && ppsConnection[eventHandlerName]) {
            if (type === 'FirstReadComplete' || type === 'NewData') {
                data = JSON.parse(data);
                ppsConnection._data = data;
            }
            ppsConnection[eventHandlerName](data);
        }
    }
};

module.exports = pps;

});

define('pps/jpps', function (require, exports, module) {
// Constants for use with the open() function

/** Used with the open() function as a mode parameter. This opens the file in
 * read-only mode.
    PPS_RDONLY = "0" */
/** Used with the open() function as a mode parameter. This opens the file in
 * write-only mode. Opening in write-only has less overhead than any other mode
 * and should be used whenever possible.
    JPPS_WRONLY = "1" */
/** Used with the open() function as a mode parameter. This opens the file in
 * read-write mode.
    JPPS_RDWR = "2" */
/** Used with the open() function as a mode parameter. This flag specifies that
 * the PPS object should be created if it does not exist. This flag can be or-ed
 * with the PPS_RDONLY, PPS_WRONLY or PPS_RDWR constants in the following manner:
 *
 * open("/pps/someppsobject",  PPS_CREATE|PPS_WRONLY);
 *
 * NOTE: O_CREAT flag is actually 0x100 (256 decimal), not '400' as is implied
 * by trunk/lib/c/public/fcntl.h.

    JPPS_CREATE = "256" */
/** Used with the open() function as a mode parameter. This flag specifies that
 * the PPS object should be created and opened in read-write mode. It is a
 * convenience constant equivalent to:
 *
 * open("/pps/someppsobject",  PPS_CREATE|PPS_RDWR);

    JPPS_RDWR_CREATE = "258" */

// Constants used in the init() function
/** The name of the native plugin library (*.so). */
var JPPS_LIB_NAME = "libjpps",
/** Name of the JPPS object, which is a concatenation of the library name and the
 * native class name. */
    JPPS_OBJ_NAME = JPPS_LIB_NAME + ".PPS",
    JPPS;

/* global JNEXT */
JPPS = {
    create: function () {
        var self = {
            m_strObjId: null,
            ppsObj: {}
        };

        // Initialize
        if (!JNEXT.require(JPPS_LIB_NAME)) {
            console.error("Unable to load \"" + JPPS_LIB_NAME + "\". PPS is unavailable.");
            return false;
        }

        self.m_strObjId = JNEXT.createObject(JPPS_OBJ_NAME);
        if (self.m_strObjId === "")  {
            console.error("JNext could not create the native PPS object \"" + JPPS_OBJ_NAME + "\". PPS is unavailable.");
            return false;
        }

        // JPPS Method declarations
        self.open = function (strPPSPath, mode, opts) {
            var parameters = strPPSPath + " " + mode + (opts ? " " + opts : ""),
                strVal = JNEXT.invoke(self.m_strObjId, "Open", parameters),
                arParams = strVal.split(" ");

            // If there's an error, output to the console
            if (arParams[0] !== "Ok") {
                console.error(strVal);
                return false;
            }

            return true;
        };

        self.read = function () {
            // Read a line from the file that was previously opened
            var strVal = JNEXT.invoke(self.m_strObjId, "Read"),
                arParams = strVal.split(" "),
                json;

            if (arParams[0] !== "Ok") {
                console.error(strVal);
                return false;
            }

            json = strVal.substr(arParams[0].length + 1);
            self.ppsObj = JSON.parse(json);
            return true;
        };

        self.write = function (obj) {
            var jstr = JSON.stringify(obj),
                strVal = JNEXT.invoke(self.m_strObjId, "Write", jstr),
                arParams = strVal.split(" ");

            if (arParams[0] !== "Ok") {
                console.error(strVal);
                return false;
            }

            return true;
        };

        self.close = function () {
            var strRes = JNEXT.invoke(self.m_strObjId, "Close");

            strRes = JNEXT.invoke(self.m_strObjId, "Dispose");
            JNEXT.unregisterEvents(self);
        };

        self.getId = function () {
            return self.m_strObjId;
        };

        self.onEvent = function (strData) {
            var arData = strData.split(" "),
                strEventDesc = arData[0],
                jsonData,
                data;

            switch (strEventDesc) {
            case "Error":
                self.onError();
                break;

            case "OnChange":
                jsonData = strData.substr(strEventDesc.length + 1);

                // data contains both the change data and the "full" data, in order
                // to avoid making a call to read() during the onChange
                data = JSON.parse(jsonData);

                // Update the local cache with a copy of the entire PPS object as it currently stands
                self.ppsObj = data["allData"];
                self.ppsData = {};
                self.ppsData[data["changeData"].objName] = data["allData"];

                // Send a change event with only the data that changed
                if (self.onChange !== null) {
                    self.onChange(data["changeData"]);
                }
                break;
            }
        };

        self.onError = function () {
            console.error("PPS onError() handler.");
        };

        JNEXT.registerEvents(self);

        return self;
    }
};

module.exports = JPPS;

});

define('mimeTypes', function (require, exports, module) {
/*
 * Copyright 2012 Research In Motion Limited.
 *
 * Licensed under the Apache License,Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * This has been placed in the public domain as per Apache the original can be seen here:
 * http://svn.apache.org/repos/asf/httpd/httpd/branches/1.3.x/conf/mime.types
 *
 * We have made this into a Javascript module by simply stripping the un-used mimtypes
 * and keying off the spaces to push them into an array we can use for lookup
 */

var mimeTypes = {},
    mimeToFileEnding = {},
    _self,
    STATE = {
        NONE : 0,
        INITIAL_LOAD : 1,
        FULLY_LOADED : 2
    },
    loadState = STATE.NONE;

/*
 * File listing scooped from the invocation framework
 * manually added open office types
 */

function loadMimes() {
    _self.addMimeTypes("3g2", "video/3gpp2");
    _self.addMimeTypes("3gp", "video/3gpp");
    _self.addMimeTypes("aac", "audio/aac");
    _self.addMimeTypes("abs", "audio/x-mpeg");
    _self.addMimeTypes("ai", "application/postscript");
    _self.addMimeTypes("aif", "audio/x-aiff");
    _self.addMimeTypes("aifc", "audio/x-aiff");
    _self.addMimeTypes("aiff", "audio/x-aiff");
    _self.addMimeTypes("aim", "application/x-aim");
    _self.addMimeTypes("amr", "audio/amr");
    _self.addMimeTypes("art", "image/x-jg");
    _self.addMimeTypes("asc", "text/plain");
    _self.addMimeTypes("asf", "video/x-ms-asf");
    _self.addMimeTypes("asx", "video/x-ms-asf");
    _self.addMimeTypes("atom", "application/atom+xml");
    _self.addMimeTypes("au", "audio/basic");
    _self.addMimeTypes("avi", "video/x-msvideo");
    _self.addMimeTypes("avx", "video/x-rad-screenplay");
    _self.addMimeTypes("bcpio", "application/x-bcpio");
    _self.addMimeTypes("bin", "application/octet-stream");
    _self.addMimeTypes("bmp", "image/bmp");
    _self.addMimeTypes("body", "text/html");
    _self.addMimeTypes("cdf", "application/x-cdf");
    _self.addMimeTypes("cer", "application/x-x509-ca-cert");
    _self.addMimeTypes("cgm", "image/cgm");
    _self.addMimeTypes("class", "application/java");
    _self.addMimeTypes("cpio", "application/x-cpio");
    _self.addMimeTypes("csh", "application/x-csh");
    _self.addMimeTypes("css", "text/css");
    _self.addMimeTypes("dib", "image/bmp");
    _self.addMimeTypes("djv", "image/vnd.djvu");
    _self.addMimeTypes("djvu", "image/vnd.djvu");
    _self.addMimeTypes("dll", "application/octet-stream");
    _self.addMimeTypes("doc", "application/msword");
    _self.addMimeTypes("odt", "application/vnd.oasis.opendocument.text");
    _self.addMimeTypes("ods", "application/vnd.oasis.opendocument.spreadsheet");
    _self.addMimeTypes("docm", "application/vnd.ms-word.document.macroEnabled.12");
    _self.addMimeTypes("docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    _self.addMimeTypes("dot", "application/msword");
    _self.addMimeTypes("dotm", "application/vnd.ms-word.template.macroEnabled.12");
    _self.addMimeTypes("dotx", "application/vnd.openxmlformats-officedocument.wordprocessingml.template");
    _self.addMimeTypes("dtd", "application/xml-dtd");
    _self.addMimeTypes("dv", "video/x-dv");
    _self.addMimeTypes("dvi", "application/x-dvi");
    _self.addMimeTypes("eps", "application/postscript");
    _self.addMimeTypes("etx", "text/x-setext");
    _self.addMimeTypes("exe", "application/octet-stream");
    _self.addMimeTypes("flac", "audio/flac");
    _self.addMimeTypes("gif", "image/gif");
    _self.addMimeTypes("gtar", "application/x-gtar");
    _self.addMimeTypes("gz", "application/x-gzip");
    _self.addMimeTypes("h264", "video/h264");
    _self.addMimeTypes("hdf", "application/x-hdf");
    _self.addMimeTypes("hqx", "application/mac-binhex40");
    _self.addMimeTypes("htc", "text/x-component");
    _self.addMimeTypes("htm", "text/html");
    _self.addMimeTypes("html", "text/html");
    _self.addMimeTypes("hqx", "application/mac-binhex40");
    _self.addMimeTypes("ico", "image/x-icon");
    _self.addMimeTypes("ics", "text/calendar");
    _self.addMimeTypes("ief", "image/ief");
    _self.addMimeTypes("ifb", "text/calendar");
    _self.addMimeTypes("jad", "text/vnd.sun.j2me.app-descriptor");
    _self.addMimeTypes("jar", "application/java-archive");
    _self.addMimeTypes("java", "text/plain");
    _self.addMimeTypes("jnlp", "application/x-java-jnlp-file");
    _self.addMimeTypes("jpe", "image/jpeg");
    _self.addMimeTypes("jpeg", "image/jpeg");
    _self.addMimeTypes("jpg", "image/jpeg");
    _self.addMimeTypes("js", "text/javascript");
    _self.addMimeTypes("jsf", "text/plain");
    _self.addMimeTypes("jspf", "text/plain");
    _self.addMimeTypes("kar", "audio/x-midi");
    _self.addMimeTypes("latex", "application/x-latex");
    _self.addMimeTypes("m2ts", "video/MP2T");
    _self.addMimeTypes("m3u", "audio/x-mpegurl");
    _self.addMimeTypes("m4a", "audio/mp4a-latm");
    _self.addMimeTypes("m4b", "audio/mp4a-latm");
    _self.addMimeTypes("m4p", "audio/mp4a-latm");
    _self.addMimeTypes("m4u", "video/vnd.mpegurl");
    _self.addMimeTypes("m4v", "video/x-m4v");
    _self.addMimeTypes("mac", "image/x-macpaint");
    _self.addMimeTypes("man", "application/x-troff-man");
    _self.addMimeTypes("mathml", "application/mathml+xml");
    _self.addMimeTypes("me", "application/x-troff-me");
    _self.addMimeTypes("mid", "audio/x-midi");
    _self.addMimeTypes("midi", "audio/x-midi");
    _self.addMimeTypes("mif", "application/x-mif");
    _self.addMimeTypes("mka", "audio/x-matroska");
    _self.addMimeTypes("mkv", "video/x-matroska");
    _self.addMimeTypes("mk3d", "video/x-matroska-3d");
    _self.addMimeTypes("mov", "video/quicktime");
    _self.addMimeTypes("movie", "video/x-sgi-movie");
    _self.addMimeTypes("mp1", "audio/x-mpeg");
    _self.addMimeTypes("mp2", "audio/x-mpeg");
    _self.addMimeTypes("mp3", "audio/x-mpeg");
    _self.addMimeTypes("mp4", "video/mp4");
    _self.addMimeTypes("mpa", "audio/x-mpeg");
    _self.addMimeTypes("mpe", "video/mpeg");
    _self.addMimeTypes("mpeg", "video/mpeg");
    _self.addMimeTypes("mpega", "audio/x-mpeg");
    _self.addMimeTypes("mpg", "video/mpeg");
    _self.addMimeTypes("mpv2", "video/mpeg2");
    _self.addMimeTypes("ms", "application/x-wais-source");
    _self.addMimeTypes("nc", "application/x-netcdf");
    _self.addMimeTypes("oda", "application/oda");
    _self.addMimeTypes("ogg", "audio/ogg");
    _self.addMimeTypes("pbm", "image/x-portable-bitmap");
    _self.addMimeTypes("pct", "image/pict");
    _self.addMimeTypes("pdf", "application/pdf");
    _self.addMimeTypes("pgm", "image/x-portable-graymap");
    _self.addMimeTypes("pic", "image/pict");
    _self.addMimeTypes("pict", "image/pict");
    _self.addMimeTypes("pls", "audio/x-scpls");
    _self.addMimeTypes("png", "image/png");
    _self.addMimeTypes("pnm", "image/x-portable-anymap");
    _self.addMimeTypes("pnt", "image/x-macpaint");
    _self.addMimeTypes("pot", "application/vnd.ms-powerpoint");
    _self.addMimeTypes("potm", "application/vnd.ms-powerpoint.template.macroEnabled.12");
    _self.addMimeTypes("potx", "application/vnd.openxmlformats-officedocument.presentationml.template");
    _self.addMimeTypes("ppm", "image/x-portable-pixmap");
    _self.addMimeTypes("ppt", "application/vnd.ms-powerpoint");
    _self.addMimeTypes("pps", "application/vnd.ms-powerpoint");
    _self.addMimeTypes("ppsm", "application/vnd.ms-powerpoint.slideshow.macroEnabled.12");
    _self.addMimeTypes("ppsx", "application/vnd.openxmlformats-officedocument.presentationml.slideshow");
    _self.addMimeTypes("pptm", "application/vnd.ms-powerpoint.presentation.macroEnabled.12");
    _self.addMimeTypes("pptx", "application/vnd.openxmlformats-officedocument.presentationml.presentation");
    _self.addMimeTypes("ps", "application/postscript");
    _self.addMimeTypes("psd", "image/x-photoshop");
    _self.addMimeTypes("qcp", "audio/qcelp");
    _self.addMimeTypes("qt", "video/quicktime");
    _self.addMimeTypes("qti", "image/x-quicktime");
    _self.addMimeTypes("qtif", "image/x-quicktime");
    _self.addMimeTypes("ras", "image/x-cmu-raster");
    _self.addMimeTypes("rdf", "application/rdf+xml");
    _self.addMimeTypes("rgb", "image/x-rgb");
    _self.addMimeTypes("rm", "application/vnd.rn-realmedia");
    _self.addMimeTypes("roff", "application/x-troff");
    _self.addMimeTypes("rtf", "application/rtf");
    _self.addMimeTypes("rtx", "text/richtext");
    _self.addMimeTypes("sh", "application/x-sh");
    _self.addMimeTypes("shar", "application/x-shar");
    _self.addMimeTypes("smf", "audio/x-midi");
    _self.addMimeTypes("sit", "application/x-stuffit");
    _self.addMimeTypes("snd", "audio/basic");
    _self.addMimeTypes("src", "application/x-wais-source");
    _self.addMimeTypes("sv4cpio", "application/x-sv4cpio");
    _self.addMimeTypes("sv4crc", "application/x-sv4crc");
    _self.addMimeTypes("svg", "image/svg+xml");
    _self.addMimeTypes("svgz", "image/svg+xml");
    _self.addMimeTypes("swf", "application/x-shockwave-flash");
    _self.addMimeTypes("t", "application/x-troff");
    _self.addMimeTypes("tar", "application/x-tar");
    _self.addMimeTypes("tcl", "application/x-tcl");
    _self.addMimeTypes("tex", "application/x-tex");
    _self.addMimeTypes("texi", "application/x-texinfo");
    _self.addMimeTypes("texinfo", "application/x-texinfo");
    _self.addMimeTypes("tif", "image/tiff");
    _self.addMimeTypes("tiff", "image/tiff");
    _self.addMimeTypes("tr", "application/x-troff");
    _self.addMimeTypes("tsv", "text/tab-separated-values");
    _self.addMimeTypes("txt", "text/plain");
    _self.addMimeTypes("ulw", "audio/basic");
    _self.addMimeTypes("ustar", "application/x-ustar");
    _self.addMimeTypes("vsd", "application/x-visio");
    _self.addMimeTypes("vxml", "application/voicexml+xml");
    _self.addMimeTypes("wav", "audio/x-wav");
    _self.addMimeTypes("wma", "audio/x-ms-wma");
    _self.addMimeTypes("wml", "text/vnd.wap.wml");
    _self.addMimeTypes("wmlc", "application/vnd.wap.wmlc");
    _self.addMimeTypes("wmls", "text/vnd.wap.wmlscript");
    _self.addMimeTypes("wmlscriptc", "application/vnd.wap.wmlscriptc");
    _self.addMimeTypes("wmv", "video/x-ms-wmv");
    _self.addMimeTypes("wrl", "x-world/x-vrml");
    _self.addMimeTypes("wspolicy", "application/wspolicy+xml");
    _self.addMimeTypes("xbm", "image/x-xbitmap");
    _self.addMimeTypes("xht", "application/xhtml+xml");
    _self.addMimeTypes("xhtml", "application/xhtml+xml");
    _self.addMimeTypes("xls", "application/vnd.ms-excel");
    _self.addMimeTypes("xlsm", "application/vnd.ms-excel.sheet.macroEnabled.12");
    _self.addMimeTypes("xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    _self.addMimeTypes("xlt", "application/vnd.ms-excel");
    _self.addMimeTypes("xltm", "application/vnd.ms-excel.template.macroEnabled.12");
    _self.addMimeTypes("xltx", "application/vnd.openxmlformats-officedocument.spreadsheetml.template");
    _self.addMimeTypes("xml", "application/xml");
    _self.addMimeTypes("xpm", "image/x-xpixmap");
    _self.addMimeTypes("xsl", "application/xml");
    _self.addMimeTypes("xslt", "application/xslt+xml");
    _self.addMimeTypes("xul", "application/vnd.mozilla.xul+xml");
    _self.addMimeTypes("xwd", "image/x-xwindowdump");
    _self.addMimeTypes("Z", "application/x-compress");
    _self.addMimeTypes("z", "application/x-compress");
    _self.addMimeTypes("zip", "application/zip");
}

function loadMoreMimes() {
    _self.addMimeTypes("atomcat", "application/atomcat+xml");
    _self.addMimeTypes("atomsvc", "application/atomsvc+xml");
    _self.addMimeTypes("ccxml", "application/ccxml+xml");
    _self.addMimeTypes("cu", "application/cu-seeme");
    _self.addMimeTypes("davmount", "application/davmount+xml");
    _self.addMimeTypes("ecma", "application/ecmascript");
    _self.addMimeTypes("emma", "application/emma+xml");
    _self.addMimeTypes("epub", "application/epub+zip");
    _self.addMimeTypes("pfr", "application/font-tdpfr");
    _self.addMimeTypes("stk", "application/hyperstudio");
    _self.addMimeTypes("jar", "application/java-archive");
    _self.addMimeTypes("ser", "application/java-serialized-object");
    _self.addMimeTypes("class", "application/java-vm");
    _self.addMimeTypes("json", "application/json");
    _self.addMimeTypes("lostxml", "application/lost+xml");
    _self.addMimeTypes("hqx", "application/mac-binhex40");
    _self.addMimeTypes("cpt", "application/mac-compactpro");
    _self.addMimeTypes("mrc", "application/marc");
    _self.addMimeTypes("ma,nb,mb", "application/mathematica");
    _self.addMimeTypes("mathml", "application/mathml+xml");
    _self.addMimeTypes("mbox", "application/mbox");
    _self.addMimeTypes("mscml", "application/mediaservercontrol+xml");
    _self.addMimeTypes("mp4s", "application/mp4");
    _self.addMimeTypes("doc,dot", "application/msword");
    _self.addMimeTypes("mxf", "application/mxf");
    _self.addMimeTypes("oda", "application/oda");
    _self.addMimeTypes("opf", "application/oebps-package+xml");
    _self.addMimeTypes("ogx", "application/ogg");
    _self.addMimeTypes("onetoc,onetoc2,onetmp,onepkg", "application/onenote");
    _self.addMimeTypes("xer", "application/patch-ops-error+xml");
    _self.addMimeTypes("pgp", "application/pgp-encrypted");
    _self.addMimeTypes("asc,sig", "application/pgp-signature");
    _self.addMimeTypes("prf", "application/pics-rules");
    _self.addMimeTypes("p10", "application/pkcs10");
    _self.addMimeTypes("p7m,p7c", "application/pkcs7-mime");
    _self.addMimeTypes("p7s", "application/pkcs7-signature");
    _self.addMimeTypes("cer", "application/pkix-cert");
    _self.addMimeTypes("crl", "application/pkix-crl");
    _self.addMimeTypes("pkipath", "application/pkix-pkipath");
    _self.addMimeTypes("pki", "application/pkixcmp");
    _self.addMimeTypes("pls", "application/pls+xml");
    _self.addMimeTypes("ai,eps,ps", "application/postscript");
    _self.addMimeTypes("cww", "application/prs.cww");
    _self.addMimeTypes("rdf", "application/rdf+xml");
    _self.addMimeTypes("rif", "application/reginfo+xml");
    _self.addMimeTypes("rnc", "application/relax-ng-compact-syntax");
    _self.addMimeTypes("rl", "application/resource-lists+xml");
    _self.addMimeTypes("rld", "application/resource-lists-diff+xml");
    _self.addMimeTypes("rs", "application/rls-services+xml");
    _self.addMimeTypes("rsd", "application/rsd+xml");
    _self.addMimeTypes("rss", "application/rss+xml");
    _self.addMimeTypes("rtf", "application/rtf");
    _self.addMimeTypes("sbml", "application/sbml+xml");
    _self.addMimeTypes("scq", "application/scvp-cv-request");
    _self.addMimeTypes("scs", "application/scvp-cv-response");
    _self.addMimeTypes("spq", "application/scvp-vp-request");
    _self.addMimeTypes("spp", "application/scvp-vp-response");
    _self.addMimeTypes("sdp", "application/sdp");
    _self.addMimeTypes("setpay", "application/set-payment-initiation");
    _self.addMimeTypes("setreg", "application/set-registration-initiation");
    _self.addMimeTypes("shf", "application/shf+xml");
    _self.addMimeTypes("smi,smil", "application/smil+xml");
    _self.addMimeTypes("rq", "application/sparql-query");
    _self.addMimeTypes("srx", "application/sparql-results+xml");
    _self.addMimeTypes("gram", "application/srgs");
    _self.addMimeTypes("grxml", "application/srgs+xml");
    _self.addMimeTypes("ssml", "application/ssml+xml");
    _self.addMimeTypes("plb", "application/vnd.3gpp.pic-bw-large");
    _self.addMimeTypes("psb", "application/vnd.3gpp.pic-bw-small");
    _self.addMimeTypes("pvb", "application/vnd.3gpp.pic-bw-var");
    _self.addMimeTypes("tcap", "application/vnd.3gpp2.tcap");
    _self.addMimeTypes("pwn", "application/vnd.3m.post-it-notes");
    _self.addMimeTypes("aso", "application/vnd.accpac.simply.aso");
    _self.addMimeTypes("imp", "application/vnd.accpac.simply.imp");
    _self.addMimeTypes("acu", "application/vnd.acucobol");
    _self.addMimeTypes("atc,acutc", "application/vnd.acucorp");
    _self.addMimeTypes("air", "application/vnd.adobe.air-application-installer-package+zip");
    _self.addMimeTypes("xdp", "application/vnd.adobe.xdp+xml");
    _self.addMimeTypes("xfdf", "application/vnd.adobe.xfdf");
    _self.addMimeTypes("azf", "application/vnd.airzip.filesecure.azf");
    _self.addMimeTypes("azs", "application/vnd.airzip.filesecure.azs");
    _self.addMimeTypes("azw", "application/vnd.amazon.ebook");
    _self.addMimeTypes("acc", "application/vnd.americandynamics.acc");
    _self.addMimeTypes("ami", "application/vnd.amiga.ami");
    _self.addMimeTypes("apk", "application/vnd.android.package-archive");
    _self.addMimeTypes("cii", "application/vnd.anser-web-certificate-issue-initiation");
    _self.addMimeTypes("fti", "application/vnd.anser-web-funds-transfer-initiation");
    _self.addMimeTypes("atx", "application/vnd.antix.game-component");
    _self.addMimeTypes("mpkg", "application/vnd.apple.installer+xml");
    _self.addMimeTypes("swi", "application/vnd.arastra.swi");
    _self.addMimeTypes("aep", "application/vnd.audiograph");
    _self.addMimeTypes("mpm", "application/vnd.blueice.multipass");
    _self.addMimeTypes("bmi", "application/vnd.bmi");
    _self.addMimeTypes("rep", "application/vnd.businessobjects");
    _self.addMimeTypes("cdxml", "application/vnd.chemdraw+xml");
    _self.addMimeTypes("mmd", "application/vnd.chipnuts.karaoke-mmd");
    _self.addMimeTypes("cdy", "application/vnd.cinderella");
    _self.addMimeTypes("cla", "application/vnd.claymore");
    _self.addMimeTypes("c4g,c4d,c4f,c4p,c4u", "application/vnd.clonk.c4group");
    _self.addMimeTypes("csp", "application/vnd.commonspace");
    _self.addMimeTypes("cdbcmsg", "application/vnd.contact.cmsg");
    _self.addMimeTypes("cmc", "application/vnd.cosmocaller");
    _self.addMimeTypes("clkx", "application/vnd.crick.clicker");
    _self.addMimeTypes("clkk", "application/vnd.crick.clicker.keyboard");
    _self.addMimeTypes("clkp", "application/vnd.crick.clicker.palette");
    _self.addMimeTypes("clkt", "application/vnd.crick.clicker.template");
    _self.addMimeTypes("clkw", "application/vnd.crick.clicker.wordbank");
    _self.addMimeTypes("wbs", "application/vnd.criticaltools.wbs+xml");
    _self.addMimeTypes("pml", "application/vnd.ctc-posml");
    _self.addMimeTypes("ppd", "application/vnd.cups-ppd");
    _self.addMimeTypes("car", "application/vnd.curl.car");
    _self.addMimeTypes("pcurl", "application/vnd.curl.pcurl");
    _self.addMimeTypes("rdz", "application/vnd.data-vision.rdz");
    _self.addMimeTypes("fe_launch", "application/vnd.denovo.fcselayout-link");
    _self.addMimeTypes("dna", "application/vnd.dna");
    _self.addMimeTypes("mlp", "application/vnd.dolby.mlp");
    _self.addMimeTypes("dpg", "application/vnd.dpgraph");
    _self.addMimeTypes("dfac", "application/vnd.dreamfactory");
    _self.addMimeTypes("geo", "application/vnd.dynageo");
    _self.addMimeTypes("mag", "application/vnd.ecowin.chart");
    _self.addMimeTypes("nml", "application/vnd.enliven");
    _self.addMimeTypes("esf", "application/vnd.epson.esf");
    _self.addMimeTypes("msf", "application/vnd.epson.msf");
    _self.addMimeTypes("qam", "application/vnd.epson.quickanime");
    _self.addMimeTypes("slt", "application/vnd.epson.salt");
    _self.addMimeTypes("ssf", "application/vnd.epson.ssf");
    _self.addMimeTypes("es3,et3", "application/vnd.eszigno3+xml");
    _self.addMimeTypes("ez2", "application/vnd.ezpix-album");
    _self.addMimeTypes("ez3", "application/vnd.ezpix-package");
    _self.addMimeTypes("fdf", "application/vnd.fdf");
    _self.addMimeTypes("mseed", "application/vnd.fdsn.mseed");
    _self.addMimeTypes("seed,dataless", "application/vnd.fdsn.seed");
    _self.addMimeTypes("gph", "application/vnd.flographit");
    _self.addMimeTypes("ftc", "application/vnd.fluxtime.clip");
    _self.addMimeTypes("fm,frame,maker,book", "application/vnd.framemaker");
    _self.addMimeTypes("fnc", "application/vnd.frogans.fnc");
    _self.addMimeTypes("ltf", "application/vnd.frogans.ltf");
    _self.addMimeTypes("fsc", "application/vnd.fsc.weblaunch");
    _self.addMimeTypes("oas", "application/vnd.fujitsu.oasys");
    _self.addMimeTypes("oa2", "application/vnd.fujitsu.oasys2");
    _self.addMimeTypes("oa3", "application/vnd.fujitsu.oasys3");
    _self.addMimeTypes("fg5", "application/vnd.fujitsu.oasysgp");
    _self.addMimeTypes("bh2", "application/vnd.fujitsu.oasysprs");
    _self.addMimeTypes("ddd", "application/vnd.fujixerox.ddd");
    _self.addMimeTypes("xdw", "application/vnd.fujixerox.docuworks");
    _self.addMimeTypes("xbd", "application/vnd.fujixerox.docuworks.binder");
    _self.addMimeTypes("fzs", "application/vnd.fuzzysheet");
    _self.addMimeTypes("txd", "application/vnd.genomatix.tuxedo");
    _self.addMimeTypes("ggb", "application/vnd.geogebra.file");
    _self.addMimeTypes("ggt", "application/vnd.geogebra.tool");
    _self.addMimeTypes("gex,gre", "application/vnd.geometry-explorer");
    _self.addMimeTypes("gmx", "application/vnd.gmx");
    _self.addMimeTypes("kml", "application/vnd.google-earth.kml+xml");
    _self.addMimeTypes("kmz", "application/vnd.google-earth.kmz");
    _self.addMimeTypes("gqf,gqs", "application/vnd.grafeq");
    _self.addMimeTypes("gac", "application/vnd.groove-account");
    _self.addMimeTypes("ghf", "application/vnd.groove-help");
    _self.addMimeTypes("gim", "application/vnd.groove-identity-message");
    _self.addMimeTypes("grv", "application/vnd.groove-injector");
    _self.addMimeTypes("gtm", "application/vnd.groove-tool-message");
    _self.addMimeTypes("tpl", "application/vnd.groove-tool-template");
    _self.addMimeTypes("vcg", "application/vnd.groove-vcard");
    _self.addMimeTypes("zmm", "application/vnd.handheld-entertainment+xml");
    _self.addMimeTypes("hbci", "application/vnd.hbci");
    _self.addMimeTypes("les", "application/vnd.hhe.lesson-player");
    _self.addMimeTypes("hpgl", "application/vnd.hp-hpgl");
    _self.addMimeTypes("hpid", "application/vnd.hp-hpid");
    _self.addMimeTypes("hps", "application/vnd.hp-hps");
    _self.addMimeTypes("jlt", "application/vnd.hp-jlyt");
    _self.addMimeTypes("pcl", "application/vnd.hp-pcl");
    _self.addMimeTypes("pclxl", "application/vnd.hp-pclxl");
    _self.addMimeTypes("sfd-hdstx", "application/vnd.hydrostatix.sof-data");
    _self.addMimeTypes("x3d", "application/vnd.hzn-3d-crossword");
    _self.addMimeTypes("mpy", "application/vnd.ibm.minipay");
    _self.addMimeTypes("afp,listafp,list3820", "application/vnd.ibm.modcap");
    _self.addMimeTypes("irm", "application/vnd.ibm.rights-management");
    _self.addMimeTypes("sc", "application/vnd.ibm.secure-container");
    _self.addMimeTypes("icc,icm", "application/vnd.iccprofile");
    _self.addMimeTypes("igl", "application/vnd.igloader");
    _self.addMimeTypes("ivp", "application/vnd.immervision-ivp");
    _self.addMimeTypes("ivu", "application/vnd.immervision-ivu");
    _self.addMimeTypes("xpw,xpx", "application/vnd.intercon.formnet");
    _self.addMimeTypes("qbo", "application/vnd.intu.qbo");
    _self.addMimeTypes("qfx", "application/vnd.intu.qfx");
    _self.addMimeTypes("rcprofile", "application/vnd.ipunplugged.rcprofile");
    _self.addMimeTypes("irp", "application/vnd.irepository.package+xml");
    _self.addMimeTypes("xpr", "application/vnd.is-xpr");
    _self.addMimeTypes("jam", "application/vnd.jam");
    _self.addMimeTypes("rms", "application/vnd.jcp.javame.midlet-rms");
    _self.addMimeTypes("jisp", "application/vnd.jisp");
    _self.addMimeTypes("joda", "application/vnd.joost.joda-archive");
    _self.addMimeTypes("ktz,ktr", "application/vnd.kahootz");
    _self.addMimeTypes("karbon", "application/vnd.kde.karbon");
    _self.addMimeTypes("chrt", "application/vnd.kde.kchart");
    _self.addMimeTypes("kfo", "application/vnd.kde.kformula");
    _self.addMimeTypes("flw", "application/vnd.kde.kivio");
    _self.addMimeTypes("kon", "application/vnd.kde.kontour");
    _self.addMimeTypes("kpr,kpt", "application/vnd.kde.kpresenter");
    _self.addMimeTypes("ksp", "application/vnd.kde.kspread");
    _self.addMimeTypes("kwd,kwt", "application/vnd.kde.kword");
    _self.addMimeTypes("htke", "application/vnd.kenameaapp");
    _self.addMimeTypes("kia", "application/vnd.kidspiration");
    _self.addMimeTypes("kne,knp", "application/vnd.kinar");
    _self.addMimeTypes("skp,skd,skt,skm", "application/vnd.koan");
    _self.addMimeTypes("sse", "application/vnd.kodak-descriptor");
    _self.addMimeTypes("lbd", "application/vnd.llamagraphics.life-balance.desktop");
    _self.addMimeTypes("lbe", "application/vnd.llamagraphics.life-balance.exchange+xml");
    _self.addMimeTypes("123", "application/vnd.lotus-1-2-3");
    _self.addMimeTypes("apr", "application/vnd.lotus-approach");
    _self.addMimeTypes("pre", "application/vnd.lotus-freelance");
    _self.addMimeTypes("nsf", "application/vnd.lotus-notes");
    _self.addMimeTypes("org", "application/vnd.lotus-organizer");
    _self.addMimeTypes("scm", "application/vnd.lotus-screencam");
    _self.addMimeTypes("lwp", "application/vnd.lotus-wordpro");
    _self.addMimeTypes("portpkg", "application/vnd.macports.portpkg");
    _self.addMimeTypes("mcd", "application/vnd.mcd");
    _self.addMimeTypes("mc1", "application/vnd.medcalcdata");
    _self.addMimeTypes("cdkey", "application/vnd.mediastation.cdkey");
    _self.addMimeTypes("mwf", "application/vnd.mfer");
    _self.addMimeTypes("mfm", "application/vnd.mfmp");
    _self.addMimeTypes("flo", "application/vnd.micrografx.flo");
    _self.addMimeTypes("igx", "application/vnd.micrografx.igx");
    _self.addMimeTypes("mif", "application/vnd.mif");
    _self.addMimeTypes("daf", "application/vnd.mobius.daf");
    _self.addMimeTypes("dis", "application/vnd.mobius.dis");
    _self.addMimeTypes("mbk", "application/vnd.mobius.mbk");
    _self.addMimeTypes("mqy", "application/vnd.mobius.mqy");
    _self.addMimeTypes("msl", "application/vnd.mobius.msl");
    _self.addMimeTypes("plc", "application/vnd.mobius.plc");
    _self.addMimeTypes("txf", "application/vnd.mobius.txf");
    _self.addMimeTypes("mpn", "application/vnd.mophun.application");
    _self.addMimeTypes("mpc", "application/vnd.mophun.certificate");
    _self.addMimeTypes("xul", "application/vnd.mozilla.xul+xml");
    _self.addMimeTypes("cil", "application/vnd.ms-artgalry");
    _self.addMimeTypes("cab", "application/vnd.ms-cab-compressed");
    _self.addMimeTypes("xls,xlm,xla,xlc,xlt,xlw", "application/vnd.ms-excel");
    _self.addMimeTypes("xlam", "application/vnd.ms-excel.addin.macroenabled.12");
    _self.addMimeTypes("xlsb", "application/vnd.ms-excel.sheet.binary.macroenabled.12");
    _self.addMimeTypes("xlsm", "application/vnd.ms-excel.sheet.macroenabled.12");
    _self.addMimeTypes("xltm", "application/vnd.ms-excel.template.macroenabled.12");
    _self.addMimeTypes("eot", "application/vnd.ms-fontobject");
    _self.addMimeTypes("chm", "application/vnd.ms-htmlhelp");
    _self.addMimeTypes("ims", "application/vnd.ms-ims");
    _self.addMimeTypes("lrm", "application/vnd.ms-lrm");
    _self.addMimeTypes("cat", "application/vnd.ms-pki.seccat");
    _self.addMimeTypes("stl", "application/vnd.ms-pki.stl");
    _self.addMimeTypes("ppt,pps,pot", "application/vnd.ms-powerpoint");
    _self.addMimeTypes("ppam", "application/vnd.ms-powerpoint.addin.macroenabled.12");
    _self.addMimeTypes("pptm", "application/vnd.ms-powerpoint.presentation.macroenabled.12");
    _self.addMimeTypes("sldm", "application/vnd.ms-powerpoint.slide.macroenabled.12");
    _self.addMimeTypes("ppsm", "application/vnd.ms-powerpoint.slideshow.macroenabled.12");
    _self.addMimeTypes("potm", "application/vnd.ms-powerpoint.template.macroenabled.12");
    _self.addMimeTypes("mpp,mpt", "application/vnd.ms-project");
    _self.addMimeTypes("docm", "application/vnd.ms-word.document.macroenabled.12");
    _self.addMimeTypes("dotm", "application/vnd.ms-word.template.macroenabled.12");
    _self.addMimeTypes("wps,wks,wcm,wdb", "application/vnd.ms-works");
    _self.addMimeTypes("wpl", "application/vnd.ms-wpl");
    _self.addMimeTypes("xps", "application/vnd.ms-xpsdocument");
    _self.addMimeTypes("mseq", "application/vnd.mseq");
    _self.addMimeTypes("mus", "application/vnd.musician");
    _self.addMimeTypes("msty", "application/vnd.muvee.style");
    _self.addMimeTypes("nlu", "application/vnd.neurolanguage.nlu");
    _self.addMimeTypes("nnd", "application/vnd.noblenet-directory");
    _self.addMimeTypes("nns", "application/vnd.noblenet-sealer");
    _self.addMimeTypes("nnw", "application/vnd.noblenet-web");
    _self.addMimeTypes("ngdat", "application/vnd.nokia.n-gage.data");
    _self.addMimeTypes("n-gage", "application/vnd.nokia.n-gage.symbian.install");
    _self.addMimeTypes("rpst", "application/vnd.nokia.radio-preset");
    _self.addMimeTypes("rpss", "application/vnd.nokia.radio-presets");
    _self.addMimeTypes("edm", "application/vnd.novadigm.edm");
    _self.addMimeTypes("edx", "application/vnd.novadigm.edx");
    _self.addMimeTypes("ext", "application/vnd.novadigm.ext");
    _self.addMimeTypes("odc", "application/vnd.oasis.opendocument.chart");
    _self.addMimeTypes("otc", "application/vnd.oasis.opendocument.chart-template");
    _self.addMimeTypes("odb", "application/vnd.oasis.opendocument.database");
    _self.addMimeTypes("odf", "application/vnd.oasis.opendocument.formula");
    _self.addMimeTypes("odft", "application/vnd.oasis.opendocument.formula-template");
    _self.addMimeTypes("odg", "application/vnd.oasis.opendocument.graphics");
    _self.addMimeTypes("otg", "application/vnd.oasis.opendocument.graphics-template");
    _self.addMimeTypes("odi", "application/vnd.oasis.opendocument.image");
    _self.addMimeTypes("oti", "application/vnd.oasis.opendocument.image-template");
    _self.addMimeTypes("odp", "application/vnd.oasis.opendocument.presentation");
    _self.addMimeTypes("ots", "application/vnd.oasis.opendocument.spreadsheet-template");
    _self.addMimeTypes("otm", "application/vnd.oasis.opendocument.text-master");
    _self.addMimeTypes("ott", "application/vnd.oasis.opendocument.text-template");
    _self.addMimeTypes("oth", "application/vnd.oasis.opendocument.text-web");
    _self.addMimeTypes("xo", "application/vnd.olpc-sugar");
    _self.addMimeTypes("dd2", "application/vnd.oma.dd2+xml");
    _self.addMimeTypes("oxt", "application/vnd.openofficeorg.extension");
    _self.addMimeTypes("pptx", "application/vnd.openxmlformats-officedocument.presentationml.presentation");
    _self.addMimeTypes("sldx", "application/vnd.openxmlformats-officedocument.presentationml.slide");
    _self.addMimeTypes("ppsx", "application/vnd.openxmlformats-officedocument.presentationml.slideshow");
    _self.addMimeTypes("potx", "application/vnd.openxmlformats-officedocument.presentationml.template");
    _self.addMimeTypes("dp", "application/vnd.osgi.dp");
    _self.addMimeTypes("pdb,pqa,oprc", "application/vnd.palm");
    _self.addMimeTypes("str", "application/vnd.pg.format");
    _self.addMimeTypes("ei6", "application/vnd.pg.osasli");
    _self.addMimeTypes("efif", "application/vnd.picsel");
    _self.addMimeTypes("plf", "application/vnd.pocketlearn");
    _self.addMimeTypes("pbd", "application/vnd.powerbuilder6");
    _self.addMimeTypes("box", "application/vnd.previewsystems.box");
    _self.addMimeTypes("mgz", "application/vnd.proteus.magazine");
    _self.addMimeTypes("qps", "application/vnd.publishare-delta-tree");
    _self.addMimeTypes("ptid", "application/vnd.pvi.ptid1");
    _self.addMimeTypes("qxd,qxt,qwd,qwt,qxl,qxb", "application/vnd.quark.quarkxpress");
    _self.addMimeTypes("mxl", "application/vnd.recordare.musicxml");
    _self.addMimeTypes("musicxml", "application/vnd.recordare.musicxml+xml");
    _self.addMimeTypes("cod", "application/vnd.rim.cod");
    _self.addMimeTypes("rm", "application/vnd.rn-realmedia");
    _self.addMimeTypes("link66", "application/vnd.route66.link66+xml");
    _self.addMimeTypes("see", "application/vnd.seemail");
    _self.addMimeTypes("sema", "application/vnd.sema");
    _self.addMimeTypes("semd", "application/vnd.semd");
    _self.addMimeTypes("semf", "application/vnd.semf");
    _self.addMimeTypes("ifm", "application/vnd.shana.informed.formdata");
    _self.addMimeTypes("itp", "application/vnd.shana.informed.formtemplate");
    _self.addMimeTypes("iif", "application/vnd.shana.informed.interchange");
    _self.addMimeTypes("ipk", "application/vnd.shana.informed.package");
    _self.addMimeTypes("twd,twds", "application/vnd.simtech-mindmapper");
    _self.addMimeTypes("mmf", "application/vnd.smaf");
    _self.addMimeTypes("teacher", "application/vnd.smart.teacher");
    _self.addMimeTypes("sdkm,sdkd", "application/vnd.solent.sdkm+xml");
    _self.addMimeTypes("dxp", "application/vnd.spotfire.dxp");
    _self.addMimeTypes("sfs", "application/vnd.spotfire.sfs");
    _self.addMimeTypes("sdc", "application/vnd.stardivision.calc");
    _self.addMimeTypes("sda", "application/vnd.stardivision.draw");
    _self.addMimeTypes("sdd", "application/vnd.stardivision.impress");
    _self.addMimeTypes("smf", "application/vnd.stardivision.math");
    _self.addMimeTypes("sdw", "application/vnd.stardivision.writer");
    _self.addMimeTypes("vor", "application/vnd.stardivision.writer");
    _self.addMimeTypes("sgl", "application/vnd.stardivision.writer-global");
    _self.addMimeTypes("sxc", "application/vnd.sun.xml.calc");
    _self.addMimeTypes("stc", "application/vnd.sun.xml.calc.template");
    _self.addMimeTypes("sxd", "application/vnd.sun.xml.draw");
    _self.addMimeTypes("std", "application/vnd.sun.xml.draw.template");
    _self.addMimeTypes("sxi", "application/vnd.sun.xml.impress");
    _self.addMimeTypes("sti", "application/vnd.sun.xml.impress.template");
    _self.addMimeTypes("sxm", "application/vnd.sun.xml.math");
    _self.addMimeTypes("sxw", "application/vnd.sun.xml.writer");
    _self.addMimeTypes("sxg", "application/vnd.sun.xml.writer.global");
    _self.addMimeTypes("stw", "application/vnd.sun.xml.writer.template");
    _self.addMimeTypes("sus,susp", "application/vnd.sus-calendar");
    _self.addMimeTypes("svd", "application/vnd.svd");
    _self.addMimeTypes("sis,sisx", "application/vnd.symbian.install");
    _self.addMimeTypes("xsm", "application/vnd.syncml+xml");
    _self.addMimeTypes("bdm", "application/vnd.syncml.dm+wbxml");
    _self.addMimeTypes("xdm", "application/vnd.syncml.dm+xml");
    _self.addMimeTypes("tao", "application/vnd.tao.intent-module-archive");
    _self.addMimeTypes("tmo", "application/vnd.tmobile-livetv");
    _self.addMimeTypes("tpt", "application/vnd.trid.tpt");
    _self.addMimeTypes("mxs", "application/vnd.triscape.mxs");
    _self.addMimeTypes("tra", "application/vnd.trueapp");
    _self.addMimeTypes("ufd,ufdl", "application/vnd.ufdl");
    _self.addMimeTypes("utz", "application/vnd.uiq.theme");
    _self.addMimeTypes("umj", "application/vnd.umajin");
    _self.addMimeTypes("unityweb", "application/vnd.unity");
    _self.addMimeTypes("uoml", "application/vnd.uoml+xml");
    _self.addMimeTypes("vcx", "application/vnd.vcx");
    _self.addMimeTypes("vsd,vst,vss,vsw", "application/vnd.visio");
    _self.addMimeTypes("vis", "application/vnd.visionary");
    _self.addMimeTypes("vsf", "application/vnd.vsf");
    _self.addMimeTypes("wbxml", "application/vnd.wap.wbxml");
    _self.addMimeTypes("wmlc", "application/vnd.wap.wmlc");
    _self.addMimeTypes("wmlsc", "application/vnd.wap.wmlscriptc");
    _self.addMimeTypes("wtb", "application/vnd.webturbo");
    _self.addMimeTypes("wpd", "application/vnd.wordperfect");
    _self.addMimeTypes("wqd", "application/vnd.wqd");
    _self.addMimeTypes("stf", "application/vnd.wt.stf");
    _self.addMimeTypes("xar", "application/vnd.xara");
    _self.addMimeTypes("xfdl", "application/vnd.xfdl");
    _self.addMimeTypes("hvd", "application/vnd.yamaha.hv-dic");
    _self.addMimeTypes("hvs", "application/vnd.yamaha.hv-script");
    _self.addMimeTypes("hvp", "application/vnd.yamaha.hv-voice");
    _self.addMimeTypes("osf", "application/vnd.yamaha.openscoreformat");
    _self.addMimeTypes("osfpvg", "application/vnd.yamaha.openscoreformat.osfpvg+xml");
    _self.addMimeTypes("saf", "application/vnd.yamaha.smaf-audio");
    _self.addMimeTypes("spf", "application/vnd.yamaha.smaf-phrase");
    _self.addMimeTypes("cmp", "application/vnd.yellowriver-custom-menu");
    _self.addMimeTypes("zir,zirz", "application/vnd.zul");
    _self.addMimeTypes("zaz", "application/vnd.zzazz.deck+xml");
    _self.addMimeTypes("vxml", "application/voicexml+xml");
    _self.addMimeTypes("hlp", "application/winhlp");
    _self.addMimeTypes("wsdl", "application/wsdl+xml");
    _self.addMimeTypes("wspolicy", "application/wspolicy+xml");
    _self.addMimeTypes("abw", "application/x-abiword");
    _self.addMimeTypes("ace", "application/x-ace-compressed");
    _self.addMimeTypes("aab,x32,u32,vox", "application/x-authorware-bin");
    _self.addMimeTypes("aam", "application/x-authorware-map");
    _self.addMimeTypes("aas", "application/x-authorware-seg");
    _self.addMimeTypes("torrent", "application/x-bittorrent");
    _self.addMimeTypes("bz", "application/x-bzip");
    _self.addMimeTypes("bz2,boz", "application/x-bzip2");
    _self.addMimeTypes("vcd", "application/x-cdlink");
    _self.addMimeTypes("chat", "application/x-chat");
    _self.addMimeTypes("pgn", "application/x-chess-pgn");
    _self.addMimeTypes("bdf", "application/x-font-bdf");
    _self.addMimeTypes("gsf", "application/x-font-ghostscript");
    _self.addMimeTypes("psf", "application/x-font-linux-psf");
    _self.addMimeTypes("otf", "application/x-font-otf");
    _self.addMimeTypes("pcf", "application/x-font-pcf");
    _self.addMimeTypes("snf", "application/x-font-snf");
    _self.addMimeTypes("ttf,ttc", "application/x-font-ttf");
    _self.addMimeTypes("pfa,pfb,pfm,afm", "application/x-font-type1");
    _self.addMimeTypes("spl", "application/x-futuresplash");
    _self.addMimeTypes("gnumeric", "application/x-gnumeric");
    _self.addMimeTypes("deb,udeb", "application/x-debian-package");
    _self.addMimeTypes("dir,dcr,dxr,cst,cct,cxt,w3d,fgd,swa", "application/x-director");
    _self.addMimeTypes("wad", "application/x-doom");
    _self.addMimeTypes("ncx", "application/x-dtbncx+xml");
    _self.addMimeTypes("dtb", "application/x-dtbook+xml");
    _self.addMimeTypes("res", "application/x-dtbresource+xml");
    _self.addMimeTypes("prc,mobi", "application/x-mobipocket-ebook");
    _self.addMimeTypes("application", "application/x-ms-application");
    _self.addMimeTypes("wmd", "application/x-ms-wmd");
    _self.addMimeTypes("wmz", "application/x-ms-wmz");
    _self.addMimeTypes("xbap", "application/x-ms-xbap");
    _self.addMimeTypes("mdb", "application/x-msaccess");
    _self.addMimeTypes("obd", "application/x-msbinder");
    _self.addMimeTypes("crd", "application/x-mscardfile");
    _self.addMimeTypes("clp", "application/x-msclip");
    _self.addMimeTypes("exe,dll,com,bat,msi", "application/x-msdownload");
    _self.addMimeTypes("mvb,m13,m14", "application/x-msmediaview");
    _self.addMimeTypes("wmf", "application/x-msmetafile");
    _self.addMimeTypes("mny", "application/x-msmoney");
    _self.addMimeTypes("pub", "application/x-mspublisher");
    _self.addMimeTypes("scd", "application/x-msschedule");
    _self.addMimeTypes("trm", "application/x-msterminal");
    _self.addMimeTypes("wri", "application/x-mswrite");
    _self.addMimeTypes("nc,cdf", "application/x-netcdf");
    _self.addMimeTypes("p12,pfx", "application/x-pkcs12");
    _self.addMimeTypes("p7b,spc", "application/x-pkcs7-certificates");
    _self.addMimeTypes("p7r", "application/x-pkcs7-certreqresp");
    _self.addMimeTypes("rar", "application/x-rar-compressed");
    _self.addMimeTypes("src", "application/x-wais-source");
    _self.addMimeTypes("der,crt", "application/x-x509-ca-cert");
    _self.addMimeTypes("fig", "application/x-xfig");
    _self.addMimeTypes("xpi", "application/x-xpinstall");
    _self.addMimeTypes("xenc", "application/xenc+xml");
    _self.addMimeTypes("xhtml,xht", "application/xhtml+xml");
    _self.addMimeTypes("xml,xsl", "application/xml");
    _self.addMimeTypes("dtd", "application/xml-dtd");
    _self.addMimeTypes("xop", "application/xop+xml");
    _self.addMimeTypes("xslt", "application/xslt+xml");
    _self.addMimeTypes("xspf", "application/xspf+xml");
    _self.addMimeTypes("mxml,xhvml,xvml,xvm", "application/xv+xml");
    _self.addMimeTypes("zip", "application/zip");
    _self.addMimeTypes("adp", "audio/adpcm");
    _self.addMimeTypes("au,snd", "audio/basic");
    _self.addMimeTypes("mid,midi,kar,rmi", "audio/midi");
    _self.addMimeTypes("mp4a", "audio/mp4");
    _self.addMimeTypes("m4a,m4p", "audio/mp4a-latm");
    _self.addMimeTypes("mpga,mp2,mp2a,mp3,m2a,m3a", "audio/mpeg");
    _self.addMimeTypes("oga,ogg,spx", "audio/ogg");
    _self.addMimeTypes("eol", "audio/vnd.digital-winds");
    _self.addMimeTypes("dts", "audio/vnd.dts");
    _self.addMimeTypes("dtshd", "audio/vnd.dts.hd");
    _self.addMimeTypes("lvp", "audio/vnd.lucent.voice");
    _self.addMimeTypes("pya", "audio/vnd.ms-playready.media.pya");
    _self.addMimeTypes("ecelp4800", "audio/vnd.nuera.ecelp4800");
    _self.addMimeTypes("ecelp7470", "audio/vnd.nuera.ecelp7470");
    _self.addMimeTypes("ecelp9600", "audio/vnd.nuera.ecelp9600");
    _self.addMimeTypes("aac", "audio/x-aac");
    _self.addMimeTypes("aif,aiff,aifc", "audio/x-aiff");
    _self.addMimeTypes("m3u", "audio/x-mpegurl");
    _self.addMimeTypes("wax", "audio/x-ms-wax");
    _self.addMimeTypes("wma", "audio/x-ms-wma");
    _self.addMimeTypes("ram,ra", "audio/x-pn-realaudio");
    _self.addMimeTypes("rmp", "audio/x-pn-realaudio-plugin");
    _self.addMimeTypes("vsd", "application/x-visio");
    _self.addMimeTypes("vxml", "application/voicexml+xml");
    _self.addMimeTypes("wav", "audio/x-wav");
    _self.addMimeTypes("cdx", "chemical/x-cdx");
    _self.addMimeTypes("cif", "chemical/x-cif");
    _self.addMimeTypes("cmdf", "chemical/x-cmdf");
    _self.addMimeTypes("cml", "chemical/x-cml");
    _self.addMimeTypes("csml", "chemical/x-csml");
    _self.addMimeTypes("xyz", "chemical/x-xyz");
    _self.addMimeTypes("bmp", "image/bmp");
    _self.addMimeTypes("cgm", "image/cgm");
    _self.addMimeTypes("g3", "image/g3fax");
    _self.addMimeTypes("gif", "image/gif");
    _self.addMimeTypes("ief", "image/ief");
    _self.addMimeTypes("jp2", "image/jp2");
    _self.addMimeTypes("pict,pic,pct", "image/pict");
    _self.addMimeTypes("png", "image/png");
    _self.addMimeTypes("btif", "image/prs.btif");
    _self.addMimeTypes("svg,svgz", "image/svg+xml");
    _self.addMimeTypes("tiff,tif", "image/tiff");
    _self.addMimeTypes("psd", "image/vnd.adobe.photoshop");
    _self.addMimeTypes("djvu,djv", "image/vnd.djvu");
    _self.addMimeTypes("dwg", "image/vnd.dwg");
    _self.addMimeTypes("dxf", "image/vnd.dxf");
    _self.addMimeTypes("fbs", "image/vnd.fastbidsheet");
    _self.addMimeTypes("fpx", "image/vnd.fpx");
    _self.addMimeTypes("fst", "image/vnd.fst");
    _self.addMimeTypes("mmr", "image/vnd.fujixerox.edmics-mmr");
    _self.addMimeTypes("rlc", "image/vnd.fujixerox.edmics-rlc");
    _self.addMimeTypes("mdi", "image/vnd.ms-modi");
    _self.addMimeTypes("npx", "image/vnd.net-fpx");
    _self.addMimeTypes("wbmp", "image/vnd.wap.wbmp");
    _self.addMimeTypes("xif", "image/vnd.xiff");
    _self.addMimeTypes("ras", "image/x-cmu-raster");
    _self.addMimeTypes("cmx", "image/x-cmx");
    _self.addMimeTypes("fh,fhc,fh4,fh5,fh7", "image/x-freehand");
    _self.addMimeTypes("ico", "image/x-icon");
    _self.addMimeTypes("pntg,pnt,mac", "image/x-macpaint");
    _self.addMimeTypes("pcx", "image/x-pcx");
    _self.addMimeTypes("pnm", "image/x-portable-anymap");
    _self.addMimeTypes("pbm", "image/x-portable-bitmap");
    _self.addMimeTypes("pgm", "image/x-portable-graymap");
    _self.addMimeTypes("ppm", "image/x-portable-pixmap");
    _self.addMimeTypes("qtif,qti", "image/x-quicktime");
    _self.addMimeTypes("rgb", "image/x-rgb");
    _self.addMimeTypes("xbm", "image/x-xbitmap");
    _self.addMimeTypes("xpm", "image/x-xpixmap");
    _self.addMimeTypes("xwd", "image/x-xwindowdump");
    _self.addMimeTypes("eml,mime", "message/rfc822");
    _self.addMimeTypes("igs,iges", "model/iges");
    _self.addMimeTypes("msh,mesh,silo", "model/mesh");
    _self.addMimeTypes("dwf", "model/vnd.dwf");
    _self.addMimeTypes("gdl", "model/vnd.gdl");
    _self.addMimeTypes("gtw", "model/vnd.gtw");
    _self.addMimeTypes("mts", "model/vnd.mts");
    _self.addMimeTypes("vtu", "model/vnd.vtu");
    _self.addMimeTypes("wrl,vrml", "model/vrml");
    _self.addMimeTypes("ics,ifb", "text/calendar");
    _self.addMimeTypes("css", "text/css");
    _self.addMimeTypes("csv", "text/csv");
    _self.addMimeTypes("html,htm", "text/html");
    _self.addMimeTypes("txt,text,conf,def,list,log,in", "text/plain");
    _self.addMimeTypes("dsc", "text/prs.lines.tag");
    _self.addMimeTypes("rtx", "text/richtext");
    _self.addMimeTypes("sgml,sgm", "text/sgml");
    _self.addMimeTypes("tsv", "text/tab-separated-values");
    _self.addMimeTypes("t,tr,roff,man,me,ms", "text/troff");
    _self.addMimeTypes("uri,uris,urls", "text/uri-list");
    _self.addMimeTypes("curl", "text/vnd.curl");
    _self.addMimeTypes("dcurl", "text/vnd.curl.dcurl");
    _self.addMimeTypes("scurl", "text/vnd.curl.scurl");
    _self.addMimeTypes("mcurl", "text/vnd.curl.mcurl");
    _self.addMimeTypes("fly", "text/vnd.fly");
    _self.addMimeTypes("flx", "text/vnd.fmi.flexstor");
    _self.addMimeTypes("gv", "text/vnd.graphviz");
    _self.addMimeTypes("3dml", "text/vnd.in3d.3dml");
    _self.addMimeTypes("spot", "text/vnd.in3d.spot");
    _self.addMimeTypes("jad", "text/vnd.sun.j2me.app-descriptor");
    _self.addMimeTypes("s,asm", "text/x-asm");
    _self.addMimeTypes("c,cc,cxx,cpp,h,hh,dic", "text/x-c");
    _self.addMimeTypes("f,for,f77,f90", "text/x-fortran");
    _self.addMimeTypes("p,pas", "text/x-pascal");
    _self.addMimeTypes("java", "text/x-java-source");
    _self.addMimeTypes("etx", "text/x-setext");
    _self.addMimeTypes("uu", "text/x-uuencode");
    _self.addMimeTypes("vcs", "text/x-vcalendar");
    _self.addMimeTypes("vcf", "text/x-vcard");
    _self.addMimeTypes("3gp", "video/3gpp");
    _self.addMimeTypes("3g2", "video/3gpp2");
    _self.addMimeTypes("h261", "video/h261");
    _self.addMimeTypes("h263", "video/h263");
    _self.addMimeTypes("h264", "video/h264");
    _self.addMimeTypes("jpgv", "video/jpeg");
    _self.addMimeTypes("jpm,jpgm", "video/jpm");
    _self.addMimeTypes("mj2,mjp2", "video/mj2");
    _self.addMimeTypes("mp4,mp4v,mpg4,m4v", "video/mp4");
    _self.addMimeTypes("mpeg,mpg,mpe,m1v,m2v", "video/mpeg");
    _self.addMimeTypes("ogv", "video/ogg");
    _self.addMimeTypes("qt,mov", "video/quicktime");
    _self.addMimeTypes("fvt", "video/vnd.fvt");
    _self.addMimeTypes("mxu,m4u", "video/vnd.mpegurl");
    _self.addMimeTypes("pyv", "video/vnd.ms-playready.media.pyv");
    _self.addMimeTypes("viv", "video/vnd.vivo");
    _self.addMimeTypes("dv,dif", "video/x-dv");
    _self.addMimeTypes("f4v", "video/x-f4v");
    _self.addMimeTypes("fli", "video/x-fli");
    _self.addMimeTypes("flv", "video/x-flv");
    _self.addMimeTypes("asf,asx", "video/x-ms-asf");
    _self.addMimeTypes("wm", "video/x-ms-wm");
    _self.addMimeTypes("wmx", "video/x-ms-wmx");
    _self.addMimeTypes("wvx", "video/x-ms-wvx");
    _self.addMimeTypes("avi", "video/x-msvideo");
    _self.addMimeTypes("movie", "video/x-sgi-movie");
    _self.addMimeTypes("ice", "x-conference/x-cooltalk");
}

function loadIfNeeded(mimeType, fileEnding) {
    if (loadState === STATE.NONE) {
        loadMimes();
        loadState = STATE.INITIAL_LOAD;
    } else if (loadState === STATE.INITIAL_LOAD) {
        if (!mimeTypes[fileEnding] && !mimeToFileEnding[mimeType]) {
            loadMoreMimes();
            loadState = STATE.FULLY_LOADED;
        }
    }
}

_self = {
    lookupByFileEnding : function (fileEnding) {
        loadIfNeeded(null, fileEnding);
        return mimeTypes[fileEnding];
    },

    fileEndingbyMIME : function (mimeType) {
        loadIfNeeded(mimeType, null);
        return mimeToFileEnding[mimeType];
    },

    addMimeTypes : function (endings, mimeType) {
        var fileEndings = endings.split(',');
        fileEndings.forEach(function (ending) {
            mimeTypes[ending] = mimeType;

            if (!mimeToFileEnding[mimeType]) {
                mimeToFileEnding[mimeType] = [];
            }
            mimeToFileEnding[mimeType].push(ending);
        });
    }
};

module.exports = _self;

});

define('utils', function (require, exports, module) {
/*
 * Copyright 2010-2011 Research In Motion Limited.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**#nocode+*/

var _self,
    _mimeTypes;

_self = {
    inNode: function () {
        return !!require.resolve;
    },

    getQnxNamespace: function () {
        return _self.inNode() ? null : qnx;
    },

    base64Encode: function (text) {
        return window.btoa(window.unescape(window.encodeURIComponent(text)));
    },

    base64Decode: function (text) {
        return window.decodeURIComponent(window.escape(window.atob(text)));
    },

    copy: function (obj) {
        var i,
            newObj = !obj ? false : (obj.isArray ? [] : {});

        if (typeof obj === 'number' ||
            typeof obj === 'string' ||
            typeof obj === 'boolean' ||
            obj === null ||
            obj === undefined) {
            return obj;
        }

        if (obj instanceof Date) {
            return new Date(obj);
        }

        if (obj instanceof RegExp) {
            return new RegExp(obj);
        }

        for (i in obj) {
            if (obj.hasOwnProperty(i)) {
                if (obj[i] && typeof obj[i] === "object") {
                    if (obj[i] instanceof Date) {
                        newObj[i] = obj[i];
                    }
                    else {
                        newObj[i] = _self.copy(obj[i]);
                    }
                }
                else {
                    newObj[i] = obj[i];
                }
            }
        }

        return newObj;
    },

    parseURI : function (str) {
        var i, uri = {},
            key = [ "source", "scheme", "authority", "userInfo", "user", "password", "host", "port", "relative", "path", "directory", "file", "query", "anchor" ],
            matcher = /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/.exec(str);

        for (i = key.length - 1; i >= 0; i--) {
            uri[key[i]] = matcher[i] || "";
        }

        return uri;
    },

    isLocalURI : function (uri) {
        return uri && uri.scheme && "local:///".indexOf(uri.scheme.toLowerCase()) !== -1;
    },

    isFileURI : function (uri) {
        return uri && uri.scheme && "file://".indexOf(uri.scheme.toLowerCase()) !== -1;
    },

    isHttpURI : function (uri) {
        return uri && uri.scheme && "http://".indexOf(uri.scheme.toLowerCase()) !== -1;
    },

    isHttpsURI : function (uri) {
        return uri && uri.scheme && "https://".indexOf(uri.scheme.toLowerCase()) !== -1;
    },

    // Checks if the specified uri starts with 'data:'
    isDataURI : function (uri) {
        return uri && uri.scheme && "data:".indexOf(uri.scheme.toLowerCase()) !== -1;
    },

    // Check if a url has a tel scheme
    isTelURI: function (uri) {
        return uri && uri.scheme && "tel:".indexOf(uri.scheme.toLowerCase()) !== -1;
    },

    // Check if a url is from a local protocal
    isLocalUrl: function (url) {
        if (url && url.indexOf('local:///') !== -1) {
            return true;
        }
        return false;
    },

    isDataUrl: function (url) {
        if (url && url.substring(0, 5) === 'data:') {
            return true;
        }
    },

    startsWith : function (str, substr) {
        return str.indexOf(substr) === 0;
    },

    fileNameToMIME : function (fileName) {
        var ext = fileName.split('.').pop();

        if (!_mimeTypes) {
            _mimeTypes = require('./mimeTypes');
        }

        return _mimeTypes.lookupByFileEnding(ext);
    },

    /*
     * Warning this function is greedy and will only return the first
     * file type based on the provided MIME type
     */
    fileEndingByMIME : function (mimeType) {

        if (!_mimeTypes) {
            _mimeTypes = require('./mimeTypes');
        }

        return _mimeTypes.fileEndingbyMIME(mimeType);
    },

    series: function (tasks, callback) {

        var execute = function () {
            var args = [],
                task;

            if (tasks.length) {
                task = tasks.shift();
                args = args.concat(task.args).concat(execute);
                task.func.apply(this, args);
            }
            else {
                callback.func.apply(this, callback.args);
            }
        };

        execute();
    },

    // navigator.language may be immutable
    // this allows for proper mocking of the property during testing
    language: function () {
        return navigator.language;
    },

    i18n: function () {
        var i18n = {
            translate: function (key) {
                return {
                    fetch: function () {
                        return key;
                    }
                };
            },
            format: function (dateOrNumber, formatCode) {
                return {
                    fetch: function () {
                        return dateOrNumber;
                    }
                };
            },
            reset: function () {
                return;
            }
        };
        return qnx.webplatform.i18n ? qnx.webplatform.i18n : i18n;
    },

    mixin: function (mixin, to) {
        Object.getOwnPropertyNames(mixin).forEach(function (prop) {
            if (Object.hasOwnProperty.call(mixin, prop)) {
                Object.defineProperty(to, prop, Object.getOwnPropertyDescriptor(mixin, prop));
            }
        });
        return to;
    },

    /**
     * Returns a local path translated into an actual path on the file system, this method should be updated
     * if the structure of the OS file system ever changes
     */
    translatePath : function (path) {
        var sourceDir = qnx.webplatform.getApplication().getEnv("HOME");

        if (_self.isLocalUrl(path)) {
            path = "file:///" + sourceDir.replace(/^\/*/, '') + "/../app/native/" + path.replace(/local:\/\/\//, '');
        }
        return path;
    },

    downloadFile : function (source, target, onSuccess, onError, options) {

        var fileName  = source.replace(/^.*[\\\/]/, ''),
            mimeType = _self.fileNameToMIME(fileName),
            xhr;

        if (mimeType) {
            if (mimeType.length > 1 && mimeType.isArray) {
                mimeType = mimeType[0];
            }
        } else {
            mimeType = 'text/plain';
        }

        if (typeof target === 'object') {
            target = target[0];
        }

        if (typeof options !== 'undefined') {
            mimeType = options.mimeType ? options.mimeType : mimeType;
            fileName = options.fileName ? options.fileName : fileName;
        }

        window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;
        source = _self.translatePath(source);

        xhr = new XMLHttpRequest();
        xhr.open('GET', source, true);
        xhr.responseType = 'blob';
        xhr.onload = function (e) {
            window.requestFileSystem(window.TEMPORARY, 1024 * 1024, function (fileSystem) {
                fileSystem.root.getFile(target, {create: true}, function (fileEntry) {
                    fileEntry.createWriter(function (writer) {
                        writer.onerror = function (e) {
                            console.log("Could not properly write " + fileName);
                            //pass
                        };

                        var blob = new Blob([xhr.response], {type: mimeType});
                        writer.write(blob);

                        // Call the callback sending back the invokable file path file:///
                        if (onSuccess) {
                            onSuccess("file:///" + target.replace(/^\/*/, ''));
                        }
                    }, onError);
                }, onError);
            }, onError);
        };

        xhr.send();
    }
};

module.exports = _self;

/**#nocode-*/

});

define('events', function (require, exports, module) {
/*
 *  Copyright 2011 Research In Motion Limited.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 *  NOTE: Taken from the Ripple-UI project
 *        https://github.com/blackberry/Ripple-UI/
 *
 *  MODIFICATIONS
 *      - renamed 'on' apis/methods to 'emit'
 *      - removed getEventSubscribers/eventHasSubscriber methods
 *      - remove usage of ripple's exception/utils modules
 *
 */
/* The following metaTag is added because this module would not be public */
/**#nocode+*/

var _listeners = {},
    _propertyMatcher = new RegExp("^Property(.*)Event$"),
    _networkEvents = ["NetworkResourceRequested", "NetworkResourceStatusReceived", "NetworkResourceHeaderReceived", "NetworkResourceDataReceived"];

function listenersFor(id, type, create) {
    var result = _listeners[id] || [];

    if (!id) {
        throw "id must be truthy";
    }
    if (!type) {
        throw "type must be truthy";
    }

    result = result[type];

    if (!result && create) {
        _listeners[id] = _listeners[id] || [];
        _listeners[id][type] = []; //Cannot exist
        result = _listeners[id][type]; //Pass by reference
    }

    return result;
}

function getNetworkListenerCount(id) {
    return _networkEvents.reduce(function (prev, currentEventName) {
        var returnCount,
            listeners;
        //Only will be string on first runThrough
        if (typeof prev === "string") {
            listeners = listenersFor(id, prev);
            returnCount = Array.isArray(listeners) ? listeners.length : 0;
        } else {
            returnCount = prev;
        }

        listeners = listenersFor(id, currentEventName);
        returnCount += Array.isArray(listeners) ? listeners.length : 0;

        return returnCount;
    });
}

function enableWebEvent(id, eventType, enable) {
    var matches = _propertyMatcher.exec(eventType),
        command = matches ? "webview.setPropertyChangedEventEnabled" : "webview.setWebEventEnabled",
        property = matches ? matches[1] : eventType,
        isNetworkEvent = (_networkEvents.indexOf(eventType) !== -1),
        enablePropertyChanged,
        networkListenerCount;

    qnx.callExtensionMethod(command, id, property, enable);
    if (matches) {
        // Enable PropertyChanged webEvent only when needed
        enablePropertyChanged = (qnx.callExtensionMethod("webview.isAnyPropertyChangedEventsEnabled", id) === "1");
        qnx.callExtensionMethod("webview.setWebEventEnabled", id, "PropertyChanged", enablePropertyChanged);
    }

    if (isNetworkEvent) {
        networkListenerCount = getNetworkListenerCount(id);
        if (enable && networkListenerCount === 1) {
            qnx.callExtensionMethod("webview.setEnableNetworkResourceRequestedEvents", id, true);
        }

        if (!enable && networkListenerCount === 0) {
            qnx.callExtensionMethod("webview.setEnableNetworkResourceRequestedEvents", id, false);
        }
    }
}

function on(id, type, listener, scope, once) {
    var listeners = listenersFor(id, type, true);
    listeners.push({
        func: listener,
        scope: scope,
        once: !!once
    });
    enableWebEvent(id, type, true);
}

function emit(listener, args, sync) {
    try {
        if (sync) {
            return listener.func.apply(listener.scope, args);
        } else {
            setTimeout(function () {
                listener.func.apply(listener.scope, args);
            }, 1);
        }
    } catch (e) {
        console.error(e && e.stack || e);
    }
}

function removeEventListener(id, type, targetListener) {
    var listeners = listenersFor(id, type),
        i;

    if (listeners) {
        for (i = 0; i < listeners.length; i++) {
            if (listeners[i].func === targetListener) {
                listeners.splice(i, 1); // delete
                if (listeners.length === 0) {
                    enableWebEvent(id, type, false);
                }
                break;
            }
        }
    }
}

module.exports = {
    on: function (id, type, listener, scope) {
        on(id, type, listener, scope);
    },

    once : function (id, type, listener, scope) {
        on(id, type, listener, scope, true);
    },

    isOn: function (id, type) {
        var listeners = listenersFor(id, type);
        //Check for undefined in case of deletion
        return typeof listeners !== "undefined"  && listeners.length !== 0;
    },

    //The emit function has 3 required params and 1 optional
    //The options function has two subparameters
    //options.sync means whether to emit synchronously (default false)
    //options.shouldReturn means
    emit: function (id, type, args, options) {
        var listeners = listenersFor(id, type),
            returnValue,
            sync,
            shouldReturn;
        args = args || [];
        options = options || {};
        sync = !!options.sync || false;
        shouldReturn = !!options.shouldReturn || false;
        if (listeners) {
            listeners.some(function (listener) {
                returnValue = emit(listener, args, sync);
                if (shouldReturn && returnValue) {
                    return true;
                }
                returnValue = null;
                return false;
            });

            if (shouldReturn && returnValue) {
                return returnValue;
            }

            //This array must exist or we wouldn't hit this block
            _listeners[id][type] = listeners.filter(function (listener) {
                return !listener.once;
            });
        }
    },

    removeEventListener: removeEventListener,

    clear: function (id) {
        if (id) {
            delete _listeners[id];
        }
    },

    receiveAllPropertyChangedEvents: function (id, enabled) {
        qnx.callExtensionMethod("webview.setAllPropertyChangedEventsEnabled", id, enabled);
    },

    //Exposing purely for debugging and less because there is a valid client reason
    listenersFor: listenersFor,

    defineNetworkEvent: function (eventName) {
        if (_networkEvents.indexOf(eventName) === -1) {
            _networkEvents.push(eventName);
        }
    }

};
/**#nocode-*/

});

define('chrome', function (require, exports, module) {
/*
 * Copyright (C) Research In Motion Limited 2011-2012. All rights reserved.
 */
var self;

self = {
    id: 1,
};

module.exports = self;

});

define('invocation', function (require, exports, module) {
/*
* Copyright 2011-2012 Research In Motion Limited.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
var invocation,
    globalId = 0,
    messageCallbacks = {},
    viewers = {},
    cardResizeId,
    utils = require('./utils'),
    interruptHandler;

function generateId() {
    var id = globalId++;
    if (!window.isFinite(id)) {
        globalId = 0;
        id = 0;
    }
    return id;
}

/**
 * @namespace Javascript access to the invocation framework
 * @name invocation
 * @memberOf Application
 */
invocation = {

    /**
     * @description Error returned by invocation framework when no target is available for the requested invocation.
     * @memberOf Application.invocation
     * @constant
     */
    INVOKE_NO_TARGET_ERROR: 'INVOKE_NO_TARGET_ERROR',

    /**
     * @description Error returned by invocation framwork when the request object is mal formed for invocation.
     * @memberOf Application.invocation
     * @constant
     */
    INVOKE_BAD_REQUEST_ERROR: 'INVOKE_BAD_REQUEST_ERROR',

    /**
     * @description Error returned when the invocation framework encounters and internal error.
     * @memberOf Application.invocation
     * @constant
     */
    INVOKE_INTERNAL_ERROR: 'INVOKE_INTERNAL_ERROR',

    /**
     * @description Error returned when the requested invocation had no target that was found. Change your parameters to find a more suitable invoke target.
     * @memberOf Application.invocation
     * @constant
     */
    INVOKE_TARGET_ERROR: 'INVOKE_TARGET_ERROR',

    /**
     * @description Error returned when the invocation is not owned by the application process and is denied from proceeding.
     * @memberOf Application.invocation
     * @constant
     */
    INVOKE_TARGET_NOT_OWNED_ERROR: 'INVOKE_TARGET_NOT_OWNED_ERROR',

    /**
     * @description Error returned when query targets request has an invalid or unrecognized argument.
     * @memberOf Application.invocation
     * @constant
     */
    QUERY_TARGETS_INVALID_ARGUMENT: 'invalid_argument',

    /**
     * @description Error returned by query targets when the response object is to large to be processed.
     * @memberOf Application.invocation
     * @constant
     */
    QUERY_TARGETS_RESPONSE_TOO_LARGE: 'response_too_large',

    /**
     * @description Error returned when the query targets service encounters and error internally.
     * @memberOf Application.invocation
     * @constant
     */
    QUERY_TARGETS_SERVER_ERROR: 'server_error',

    /**
     * @description Constant value for when invocation was performed using navigator launch.
     * @memberOf Application.invocation
     * @constant
     */
    LAUNCH: 0,

    /**
     * @description Constant value for when invocation was performed using invoke from another app in application mode.
     * @memberOf Application.invocation
     * @constant
     */
    INVOKE: 1,

    /**
     * @description Constant value for when invocation was performed using invoke from another app in viewer mode.
     * @memberOf Application.invocation
     * @constant
     */
    VIEWER: 2,

    /**
     * @description Constant value for when invocation was performed using invoke from another app in card mode.
     * @memberOf Application.invocation
     * @constant
     */
    CARD: 3,

    /**
     * @description Constant value representing the target type mask for applications.
     * @memberOf Application.invocation
     * @constant
     */
    TARGET_TYPE_MASK_APPLICATION: 1,

    /**
     * @description Constant value representing the target type mask for cards.
     * @memberOf Application.invocation
     * @constant
     */
    TARGET_TYPE_MASK_CARD: 2,

    /**
     * @description Constant value representing the target type mask for viewers.
     * @memberOf Application.invocation
     * @constant
     */
    TARGET_TYPE_MASK_VIEWER: 4,

    /**
     * @description Constant value representing the target type mask for services.
     * @memberOf Application.invocation
     * @constant
     */
    TARGET_TYPE_MASK_SERVICE: 8,

    /**
     * @description Constant value for invocation to include all the action types
     * @memberOf Application.invocation
     * @constant
     */
    ACTION_TYPE_ALL: 'ALL',

    /**
     * @description Constant value for invocation to define the discoverable actions that can be presented in menus
     * @memberOf Application.invocation
     * @constant
     */
    ACTION_TYPE_MENU: 'MENU',

    /**
     * @description Constant value for invocation to define the personal perimiter for invocation
     * @memberOf Application.invocation
     * @constant
     */
    PERIMETER_TYPE_PERSONAL: 'personal',

    /**
     * @description Constant value for invocation to define the enterprise perimiter for invocation
     * @memberOf Application.invocation
     * @constant
     */
    PERIMETER_TYPE_ENTERPRISE: 'enterprise',

    /**
     * @description Costant value for invocation that tells the box to box to preserve the URI as is
     *  and do not alter it to a file protocol. NO box-2-box logic is applied
     * @memberOf Application.invocation
     * @constant
     */
    FILE_TRANSFER_PRESERVE : 'PRESERVE',

    /**
     * @description Costant value for invocation that tells the box to box to copy the file to the receivers inbox
     * with the Read and Other only
     * @memberOf Application.invocation
     * @constant
     */
    FILE_TRANSFER_COPY_RO : 'COPY_RO',

    /**
     *  @description Costant value for invocation that tells the box to box to copy the file to the receivers inbox
     *  with the Read and Write privileges
     * @memberOf Application.invocation
     * @constant
     */
    FILE_TRANSFER_COPY_RW : 'COPY_RW',

    /**
     * @description Constant value for invocation box to box transfer permissions allows a link to be created to a file
     * from the sender to the receivers inbox
     * @memberOf Application.invocation
     * @constant
     */
    FILE_TRANSFER_LINK : 'LINK',

    /**
     * @description Constant value to define the top edge  should be up when a card is invoked from an application.
     * @memberOf Application.invocation
     * @constant
     */
    CARD_EDGE_TOP: 'top_up',

    /**
     * @description Constant value to define the bottom edge should be up when a card is invoked from an application.
     * @memberOf Application.invocation
     * @constant
     */
    CARD_EDGE_BOTTOM: 'bottom_up',

    /**
     * @description Constant value to define the left edge should be up when a card is invoked from an application.
     * @memberOf Application.invocation
     * @constant
     */
    CARD_EDGE_LEFT: 'left_up',

    /**
     * @description Constant value to define the right edge should be up when a card is invoked from an application.
     * @memberOf Application.invocation
     * @constant
     */
    CARD_EDGE_RIGHT: 'right_up',

    /**
     * @description Constant value to define that an invoked card should adopt an orientation of portrait.
     * @memberOf Application.invocation
     * @constant
     */
    CARD_ORIENTATION_PORTRAIT: 'portrait',

    /**
     * @description Constant value to define that an invoked card should adopt a landscape orientation.
     * @memberOf Application.invocation
     * @constant
     */
    CARD_ORIENTATION_LANDSCAPE: 'landscape',

    /**
     * @description Constant value that denotes the peek type as a content peek.
     * @memberOf Application.invocation
     * @constant
     */
    CARD_PEEK_TYPE_CONTENT: 'content',

    /**
     * @description Constant value that denotes a peek type of root.
     * @memberOf Application.invocation
     * @constant
     */
    CARD_PEEK_TYPE_ROOT: 'root',

    /**
     * @description Function that returns the startup mode of the application.
     * @memberOf Application.invocation
     * @returns {Object} An object that represents the startup mode as LAUNCH, CARD, VIEWER
     */
    getStartupMode: function () {
        var application = window.qnx.webplatform.getApplication(),
            mode,
            uri = application.getEnv('uri');
        if (uri === 'invoke://localhost') {
            mode = application.getEnv('MODE');
            if (mode === 'card') {
                return invocation.CARD;
            } else if (mode === 'view') {
                return invocation.VIEWER;
            } else {
                return invocation.INVOKE;
            }
        } else {
            return invocation.LAUNCH;
        }
    },

    /**
     * @description Retrieves the request that was used to invoke the application
     * @memberOf Application.invocation
     * @returns {Object} request The invoke request
     */
    getRequest: function () {
        return qnx.callExtensionMethod('invocation.invokeRequest');
    },


    /**
     * @description Sends an invoke request to the invocation framework.
     * @memberOf Application.invocation
     * @param {Object} request The invoke request
     * @param {callback} callback The function to be triggered when the response comes back
     * @param {boolean} [interruptable] a boolean value stating whether to allow interruption of this invocation request
     */
    invoke: function (request, callback, interruptable) {
        var id = generateId(),
            baseDir = window.qnx.webplatform.getApplication().getEnv("HOME") + "";

        // If the request contains a local URL, let's parse it out
        if (utils.isLocalUrl(request.uri)) {
            request.uri = "file:///" + baseDir.replace(/^\/*/, '') + "/../app/native/" + request.uri.replace(/local:\/\/\//, '');
        }

        if (callback) {
            messageCallbacks[id] = callback;
        }


        if (typeof interruptHandler === 'function' && interruptable) {
            interruptHandler(request, function (alteredRequest) {
                if (typeof alteredRequest === 'object') {
                    // If they gave us something useful we will try and use it, otherwise just use the original
                    qnx.callExtensionMethod('invocation.invoke', id, JSON.stringify(alteredRequest));
                }
            });
        } else {
            qnx.callExtensionMethod('invocation.invoke', id, JSON.stringify(request));
        }
    },

    /**
     * @description Sends an invoke request to the invocation framework w/menu service hack added on.
     * @memberOf Application.invocation
     * @param {Object} request The invoke request
     * @param {callback} callback The function to be triggered when the response comes back
     * @param {boolean} [interruptable] a boolean value stating whether to allow interruption of this invocation request
     */
    invokeHack: function (request, callback, interruptable) {
        // Menu service HACK this updates "mime" -> "type" which is incorrectly returned from menu service
        // and removes the type property which should be target_type
        if (request.hasOwnProperty('type')) {
            request.target_type = request.type;
            delete request.type;
        }

        if (request.hasOwnProperty('mime')) {
            request.type = request.mime;
            delete request.mime;
        }

        // END HACK
        return invocation.invoke(request, callback, interruptable);
    },

    /**
     * @description Sends an invokeViewer request to the invocation framework.
     * @memberOf Application.invocation
     * @param {Object} request The invokeViewer request
     * @param {callback} callback The function to be triggered when the response comes back
     */
    invokeViewer: function (request, callback) {
        var id = generateId(),
            viewerId;

        if (callback) {
            messageCallbacks[id] = callback;
        }
        viewerId = 'viewer' + id;
        request.winid = viewerId;
        qnx.callExtensionMethod('invocation.invokeViewer', id, viewerId, JSON.stringify(request));
    },

    /**
     * @description Sends a queryTargets request to the invocation framework.
     * @memberOf Application.invocation
     * @param {Object} request The queryTargets request
     * @param {callback} callback The function to be triggered when the response comes back
     */
    queryTargets: function (request, callback) {
        var id = generateId();
        messageCallbacks[id] = callback;

        // Translate a local path to a file path
        if (request.hasOwnProperty('uri')) {
            request.uri = utils.translatePath(request.uri);
        }

        qnx.callExtensionMethod('invocation.queryTargets', id, JSON.stringify(request));
    },

    /**
     * @description Sends cardResize request to invocation framework.
     * @memberOf Application.invocation
     */
    cardResized: function () {
        if (cardResizeId) {
            qnx.callExtensionMethod('invocation.cardResize', cardResizeId);
        }
    },

    /**
     * @description Sends cardPeek request to invocation framework. The card peek request allows the card to specify the type of peek to be performed.
     * @memberOf Application.invocation
     * @param {String} peekType Describes the type of peek to be performed.
     *                          This can be a peek to the content of the parent or a peek to the content of the root.
     *                          The root is the first parent in a chain of cards
     */
    cardPeek: function (peekType) {
        qnx.callExtensionMethod('invocation.cardPeek', peekType);
    },

    /**
     * @description Sends cardChildClose request to invocation framework to request that the stack above it be closed.
     * @memberOf Application.invocation
     */
    closeChildCard: function () {
        qnx.callExtensionMethod('invocation.cardChildClose');
    },

    /**
     * @description When a card completes its task it may request closure by sending a cardClose request to invocation framework.
     * @memberOf Application.invocation
     * @param {Object} request The card close request.
     */
    sendCardDone: function (request) {
        qnx.callExtensionMethod('invocation.cardClose', JSON.stringify(request));
    },

    /**
     * @description Retrieves the invoke target filters associated with the specified target. The specified target MUST be hosted by the calling process.
     * @memberOf Application.invocation
     * @param {String} target The name of the target whose filters are requested.
     * @param {callback} callback The function to be triggered when the response comes back.
     */
    getInvokeTargetFilters: function (target, callback) {
        var id = generateId(),
            request;

        messageCallbacks[id] = callback;
        request = {
            target: target
        };
        qnx.callExtensionMethod('invocation.getInvokeTargetFilters', id, JSON.stringify(request));
    },

    /**
     * @description Replaces the filters associated with the specified target with the set provided in the request. This request can only be made by a process hosting the specified target.
     * @memberOf Application.invocation
     * @param {Object} request The request contains new filters.
     * @param {callback} callback The function to be triggered when the response comes back.
     */
    setInvokeTargetFilters: function (request, callback) {
        var id = generateId();
        if (callback) {
            messageCallbacks[id] = callback;
        }
        qnx.callExtensionMethod('invocation.setInvokeTargetFilters', id, JSON.stringify(request));
    },


    /**
     * @description Method to trigger invoked event on the controller and notify any
     *              That this application has been invoked. Currently bound to chrome/internal
     * @memberOf Application.invocation
     * @param {Object} request That triggered the invocation
     */
    onInvoked: function (request) {
        qnx.webplatform.getController().dispatchEvent('invocation.invoked', [request]);
    },


    /**
     * @description Method triggered onInvokeResponse from native.
     * @memberOf Application.invocation
     * @param {Number} id the id of the callback to be triggered on response
     * @param {Function} error callback triggered on error from the invoke response
     * @param {Object} response from the invoked target that is to be returned to the callee
     */
    onInvokeResponse: function (id, error, response) {
        var callback = messageCallbacks[id],
            responseObj;
        if (callback) {
            delete messageCallbacks[id];
            try {
                responseObj = JSON.parse(response);
            } catch (e) {
                responseObj = null;
            }
            callback(error, responseObj);
        }
    },


    /**
     * @description Method triggered onInvokeViewerResponse from native after an invoke of a viewer.
     * @memberOf Application.invocation
     * @param {Number} id the id of the callback to be triggered on response
     * @param {Function} error callback triggered on error from the invoke response
     */
    onInvokeViewerResponse: function (id, error) {
        if (error) {
            var callback = messageCallbacks[id];
            delete messageCallbacks[id];
            if (callback) {
                callback(error);
            }
        }
    },

    /**
     * @description Method triggered onQueryTargetsResponse from native after a Query Targets
     *              returns.
     * @memberOf Application.invocation
     * @param {Number} id the id of the callback to be triggered on response
     * @param {Function} error callback triggered on error from the invoke response
     * @param {Object} response from the invoked target that is to be returned to the callee
     */
    onQueryTargetsResponse: function (id, error, response) {
        var callback = messageCallbacks[id],
            responseObj;
        if (callback) {
            delete messageCallbacks[id];
            try {
                responseObj = JSON.parse(response);
            } catch (e) {
                responseObj = null;
            }
            callback(error, responseObj);
        }
    },

    /**
     * @description Method triggered onViewerCreate from native when it completes creating a viewer.
     * @memberOf Application.invocation
     * @param {Number} id the id of the callback to be triggered on response
     * @param {Number} viewerId  the id of the viewer that was created by the OS
     */
    onViewerCreate: function (id, viewerId) {
        var callback = messageCallbacks[id],
            viewer;
        delete messageCallbacks[id];
        viewer = {
            viewerId: viewerId,
            relayCallbacks: {},

            close: function () {
                qnx.callExtensionMethod('invocation.closeViewer', this.viewerId);
            },

            receive: function (id, message) {
                var name = message.msg;

                if (name === 'viewerCloseRequest') {
                    this.close();
                    if (this.hasOwnProperty('onClose')) {
                        this.onClose();
                    }
                } else if (name === 'viewerCancelRequest') {
                    this.close();
                    if (this.hasOwnProperty('onCancel')) {
                        this.onCancel();
                    }
                } else if (this.hasOwnProperty('onReceive')) {
                    this.onReceive(id, message.msg, message.dat);
                }
            },

            receiveResponse: function (id, response) {
                var callback = this.relayCallbacks[id];
                delete this.relayCallbacks[id];
                if (callback) {
                    callback(response.name, response.dat);
                }
            },

            setSize: function (width, height) {
                var message = {
                    msg: 'resizeReqeust',
                    data: {
                        width: width,
                        height: height
                    }
                };
                this.send(JSON.stringify(message));
            },

            setPosition: function (x, y) {
                qnx.callExtensionMethod('invocation.setViewerPosition', this.viewerId, x, y);
            },

            setVisibility: function (visibility) {
                qnx.callExtensionMethod('invocation.setViewerVisibility', this.viewerId, visibility);
            },

            setZOrder: function (zOrder) {
                qnx.callExtensionMethod('invocation.setViewerZOrder', this.viewerId, zOrder);
            },

            send: function (message, callback) {
                var id = generateId();
                if (callback) {
                    this.relayCallbacks[id] = callback;
                }
                message.winid = this.viewerId;
                qnx.callExtensionMethod('invocation.viewerRelay', id, message);
            },

            update: function () {
                qnx.callExtensionMethod('applicationWindow.flushContext');
            },
        };
        viewers[viewer.viewerId] = viewer;
        callback(null, viewer);
    },

    onViewerRelay: function (id, message) {
        try {
            var obj = JSON.parse(message),
                viewer = viewers[obj.winId];
            if (viewer) {
                viewer.receive(id, obj);
            }
        } catch (e) {
            // Possibly log the error?
        }
    },

    onViewerRelayResponse: function (id, response) {
        try {
            var obj = JSON.parse(response),
                viewer = viewers[obj.winId];
            if (viewer) {
                viewer.receiveResponse(id, obj);
            }
        } catch (e) {
            // Possibly log the error?
        }
    },

    onViewerStopped: function (viewerId) {
        delete viewers[viewerId];
    },


    /**
     * @description Method triggered onCardResize from native when it completes a card resize
     *              an application can listen to the dispatched cardResize event.
     * @memberOf Application.invocation
     * @param {Number} id the id of the callback to be triggered on response
     * @param {Object} request object that was issued during the resize request.
     */
    onCardResize: function (id, request) {
        var values = request.split(','),
            resizeRequest = {
                width: values[0],
                height: values[1],
                orientation: values[2],
                edge: values[3]
            };

        //Handles id internally. Save it and use later when sending cardResize response.
        cardResizeId = id;
        qnx.webplatform.getController().dispatchEvent('invocation.cardResize', [resizeRequest]);
    },

    /**
     * @description Method triggered onCardStartPeek from native when the card has begun its peek
     *              applications can listen to the dispatched even off the controller of cardPeekStarted
     * @memberOf Application.invocation
     * @param {Object} peekType object representing the type of peek.
     */
    onCardStartPeek: function (peekType) {
        qnx.webplatform.getController().dispatchEvent('invocation.cardPeekStarted', [peekType]);
    },

    /**
     * @description Method triggered onCardEndPeek from native when the card has finished its peek
     *              applications can listen to the dispatched even off the controller of cardPeekEnded
     * @memberOf Application.invocation
     */
    onCardEndPeek: function () {
        qnx.webplatform.getController().dispatchEvent('invocation.cardPeekEnded');
    },

    /**
     * @description Method triggered onCardChildClosed from native when the child card has
     *              been closed, the parent application is notified through this method. Clients
     *              listen to the dispatched childCardClosed event off the invocation framework
     * @memberOf Application.invocation
     * @param {Object} response object representing the response from the child card.
     */
    onCardChildClosed: function (response) {
        var responseObj;
        try {
            responseObj = JSON.parse(response);
        } catch (e) {
            responseObj = {
                reason: "",
                type: "",
                data: ""
            };
        }
        qnx.webplatform.getController().dispatchEvent('invocation.childCardClosed', [responseObj]);
    },

    /**
     * @description Method triggered onCardClosed from native when the card has
     *              been closed, this event is triggered on a card when it closes. It
     *              can subscribe to the cardClosed event off the controller.
     * @memberOf Application.invocation
     * @param {Object} response object representing the response from the card.
     */
    onCardClosed: function (response) {
        var responseObj;
        try {
            responseObj = JSON.parse(response);
        } catch (e) {
            responseObj = {
                reason: "",
                type: "",
                data: ""
            };
        }
        qnx.webplatform.getController().dispatchEvent('invocation.cardClosed', [responseObj]);
    },

    /**
     * @description Method triggered after a call to getInvokeTargetFilters, this conatins the
     *              response, error and id of the callback to be triggered that was awaiting the response.
     * @memberOf Application.invocation
     * @param {Number} id the id of the callback to be triggered on response
     * @param {Function} error callback triggered on error from the invoke response
     * @param {Object} response from the invoked target that is to be returned to the callee
     */
    onGetInvokeTargetFiltersResponse: function (id, error, response) {
        var callback = messageCallbacks[id],
            responseObj;
        if (callback) {
            delete messageCallbacks[id];
            try {
                responseObj = JSON.parse(response);
            } catch (e) {
                responseObj = null;
            }
            callback(error, responseObj);
        }
    },

    /**
     * @description Method triggered after a call to setInvokeTargetFilters, this conatins the
     *              response, error and id of the callback to be triggered that was awaiting the response.
     * @memberOf Application.invocation
     * @param {Number} id the id of the callback to be triggered on response
     * @param {Function} error callback triggered on error from the invoke response
     * @param {Object} response from the invoked target that is to be returned to the callee
     */
    onSetInvokeTargetFiltersResponse: function (id, error, response) {
        var callback = messageCallbacks[id],
            responseObj;
        if (callback) {
            delete messageCallbacks[id];
            try {
                responseObj = JSON.parse(response);
            } catch (e) {
                responseObj = null;
            }
            callback(error, responseObj);
        }
    },

    /**
     * @description Adds a listener for an invocation event.
     * @memberOf Application.invocation
     * @param {String} evt The invocation event to listen for
     * Can be one of
     *   'Invoked',
     *   'cardResize',
     *   'cardPeekStarted',
     *   'cardPeekEnded',
     *   'childCardClosed',
     *   'cardClosed'
     * @param {callback} handler The function to be invoked when the event occurs
     */
    addEventListener : function (evt, handler) {
        var fullEvtName = "invocation." + evt.charAt(0).toLowerCase() + evt.slice(1);
        qnx.webplatform.getController().addEventListener(fullEvtName, handler);
    },

    /**
     * @description Removes a listener for an invocation event.
     * @memberOf Application.invocation
     * @param {String} evt The invocation event to remove listener for, which can be one of event defined in the invocationEvts array. It will not handle any other events.
     * @param {callback} handler The function to be invoked when the event occurs
     */
    removeEventListener : function (evt, handler) {
        var fullEvtName = "invocation." + evt.charAt(0).toLowerCase() + evt.slice(1);
        qnx.webplatform.getController().removeEventListener(fullEvtName, handler);

    }
};


/**
 * @name Invocation#Interrupter
 * @memberOf Application.invocation
 * @description An interrupter property that can be set as a function to be called during interruption
 *              or cleared to allow invocation to proceed un-interrupted. This property is only used on
 *              invocations that are deemed interruptable as per the invocation.invoke method.
 * @param {Function} handler The interrupter to be set on the invocation framework
 * @returns {Object} The interrupter function that is currently set
*/
invocation.__defineGetter__('interrupter', function () {
    return interruptHandler;
});
invocation.__defineSetter__('interrupter', function (handler) {
    interruptHandler = handler;
});



module.exports = invocation;

});

define('rpc', function (require, exports, module) {
/*
 *  Copyright 2012 Research In Motion Limited.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
/* The following metaTag is added because this module would not be public */
/**#nocode+*/

var rpc,
    _published = {},
    _pendingCallbacks = {},
    lastId = 0,
    hasBeenInit;

function publish(webviewId, name, callback, options) {
    options = options || {};

    // Initialize WebView ID if it does not yet exist
    if (!_published[webviewId]) {
        _published[webviewId] = {};
    }

    _published[webviewId][name] = {
        callback: callback,
        scope: options.scope,
        once: options.once
    };
}

function unpublish(webviewId, name) {
    delete _published[webviewId][name];
}

function execute(targetFunc, args, sync, callback) {
    try {
        if (sync) {
            return targetFunc.callback.apply(targetFunc.scope, args);
        } else {
            setTimeout(function () {
                var params = [args, callback];
                targetFunc.callback.apply(targetFunc.scope, params);
            }, 1);
        }
    } catch (e) {
        console.error(e && e.stack || e);
    }
}

function init() {
    var controller = window.qnx.webplatform.getController();
    controller.addEventListener('JavaScriptCallback', function (value, sourceWebViewId) {
        var args = eval(JSON.parse(value)['args']),
            command = args[0],
            name = args[1],
            functionArgs = eval(args[2]), //TODO: Better way to convert string to array
            callbackId = args[3];

        // Handle only the webplatform.rpc commands
        if (command === 'webplatform.rpc') {
            rpc.runPublishedFunction(controller.id, name, functionArgs, false, function (result) {
                var params = callbackId,
                    callbackCode;
                if (result) {
                    params +=  ", " + JSON.stringify(result);
                }
                callbackCode = "qnx.webplatform.getController().runRemoteExecCallback(" + params + ")";
                qnx.callExtensionMethod('webview.executeJavaScript', sourceWebViewId, callbackCode, "NormalWorld");
            });
        }
    });
}

function allowRpc(webviewObj, enable) {
    var controllerId = qnx.webplatform.getController().id,
        func = enable ? "enableWebEventRedirect" : "disableWebEventRedirect";

    webviewObj[func]("JavaScriptCallback", controllerId);
    qnx.callExtensionMethod("webview.setWebEventEnabled", webviewObj.id, "JavaScriptCallback", enable);
}

rpc = {
    // For controller webview
    publish: function (webviewId, name, callback, options) {
        if (!hasBeenInit) {
            hasBeenInit = true;
            init();
        }
        // Error checking
        if (!webviewId) {
            throw "WebView ID is invalid"; //TODO: i18n
        }
        if (!name) {
            throw "Function name is invalid"; // TODO: i18n
        }
        publish(webviewId, name, callback, options);
    },

    unpublish: function (webviewId, name) {
        if (!name) {
            throw "Function name is invalid"; // TODO: i18n
        }
        unpublish(webviewId, name);
    },

    // runPublishedFunction has 3 required params and 2 optional
    runPublishedFunction: function (webviewId, name, args, sync, callback) {
        var targetFunc = _published[webviewId][name],
            returnVal;

        args = args || [];
        if (!targetFunc) {
            throw "WebView with ID " + webviewId + " has not published a function named '" + name + "'"; //TODO: i18n
        }

        returnVal = execute(targetFunc, args, sync, callback);

        // Remove stored callback if intended to run only once
        if (targetFunc.once) {
            delete _published[webviewId][name];
        }

        if (sync) {
            return returnVal;
        }
    },

    clear: function (webviewId) {
        if (webviewId) {
            delete _published[webviewId];
        }
    },

    allowRpc: allowRpc,

    // For the client webviews
    remoteExec: function (webviewId, name, args, callback) {

        _pendingCallbacks[lastId] = callback;

        // Use webplatform.rpc to send values to the controller
        // Will show up as a 'JavaScriptCallback' event in the controller
        qnx.callExtensionMethod('webplatform.rpc', name, JSON.stringify(args),  lastId++);
    },

    runRemoteExecCallback: function (callbackId, args) {
        _pendingCallbacks[callbackId](args);
        delete _pendingCallbacks[callbackId];
    }
};

module.exports = rpc;
/**#nocode-*/

});

define('webEventRouter', function (require, exports, module) {
/*
* Copyright 2012 Research In Motion Limited.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
/* The following metaTag is added because this module would not be public */
/**#nocode+*/
var webEventRouter,
    _redirects = {};

webEventRouter = {
    enableRedirect: function (eventId, sourceWebViewId, targetWebViewId, returnVal) {
        _redirects[eventId] = _redirects[eventId] || {};
        _redirects[eventId][sourceWebViewId] = {
            targetWebViewId: targetWebViewId,
            returnVal: returnVal
        };
    },

    disableRedirect: function (eventId, sourceWebViewId) {
        delete _redirects[eventId][sourceWebViewId];
    },

    route: function (eventId, sourceWebViewId) {
        var returnObj;
        if (_redirects[eventId]) {
            returnObj = _redirects[eventId][sourceWebViewId]; 
        }  
        return returnObj ? returnObj : {targetWebViewId: sourceWebViewId}; 
    }
};

module.exports = webEventRouter;
/**#nocode-*/

});

define('chrome/events/application', function (require, exports, module) {
/*
* Copyright 2011-2012 Research In Motion Limited.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

function getAngle(edge) {
    switch (edge) {
    case "right_up":
        return 90;
    case "left_up":
        return 270;
    case "bottom_up":
        return 180;
    default:
        return 0;
    }
}

function setApplicationActive(webviewId, active) {
    var applicationState = active ? 'ApplicationActivationStateActive' : 'ApplicationActivationStateStandby';
    qnx.callExtensionMethod('webview.setApplicationActivationState', webviewId, applicationState);
}

var application = {
    onExit: function () {
        qnx.webplatform.getController().dispatchEvent("application.exit", true);
    },
    onFontInfoChange: function (family, size) {
        qnx.webplatform.getController().dispatchEvent('application.fontchanged', [family, size]);
    },
    onKeyboardOpening: function () {
        qnx.webplatform.getController().dispatchEvent("application.keyboardOpening");
    },
    onKeyboardOpened: function () {
        qnx.webplatform.getController().dispatchEvent("application.keyboardOpened");
    },
    onKeyboardClosing: function () {
        qnx.webplatform.getController().dispatchEvent("application.keyboardClosing");
    },
    onKeyboardClosed: function () {
        qnx.webplatform.getController().dispatchEvent("application.keyboardClosed");
    },
    onKeyboardPosition: function (yPosition) {
        qnx.webplatform.getController().dispatchEvent("application.keyboardPosition", [yPosition]);
    },
    onLanguageChange: function (language) {
        qnx.webplatform.getController().dispatchEvent("application.systemLanguageChange", [language]);
    },
    onLowMemory: function () {
        var index,
            webviews = qnx.webplatform.getWebViews();
        //Notify all webviews that the system has low memory
        for (index = 0; index < webviews.length; index++) {
            webviews[index].notifySystemLowMemory();
        }
        qnx.webplatform.getController().dispatchEvent("application.lowMemory");
    },
    onRegionChange: function (region) {
        qnx.webplatform.getController().dispatchEvent("application.systemRegionChange", [region]);
    },
    onRotate: function (orientation, edge) {
        var screenWidth = window.innerWidth,
            screenHeight = window.innerHeight,

            angle = getAngle(edge),
            angleChange = angle - window.orientation,
            width = screenWidth,
            height = screenHeight;

        if (angleChange % 180) {
            width = screenHeight;
            height = screenWidth;
        }

        qnx.webplatform.getController().dispatchEvent("application.rotate", [width, height, angle], true);
    },
    onRotateCheck: function (orientation, edge) {
        return true;
    },
    onRotateDone: function (edge) {
        var angle = getAngle(edge);
        qnx.webplatform.getController().dispatchEvent("application.rotateDone", [angle]);
    },
    onPropertyViewportEvent: function () {
        qnx.webplatform.getController().dispatchEvent("application.propertyViewportEvent");
    },
    onSwipeDown: function () {
        qnx.webplatform.getController().dispatchEvent("application.swipedown");
    },
    onWindowActive: function () {
        qnx.webplatform.getController().dispatchEvent("application.active");
        qnx.webplatform.getWebViews().forEach(function (webview) {
            setApplicationActive(webview.id, true);
        });
    },
    onWindowInactive: function () {
        qnx.webplatform.getController().dispatchEvent("application.inactive");
        qnx.webplatform.getWebViews().forEach(function (webview) {
            setApplicationActive(webview.id, false);
        });
    },
    onWindowState: function (state) {
        qnx.webplatform.getApplication().windowState = state;
        qnx.webplatform.getController().dispatchEvent("application.stateChange", [state]);
    },
    onDeviceEdge: function (edge) {
        qnx.webplatform.getController().dispatchEvent("application.rotateWhenLocked", [edge]); //renames the dispatched event since deviceEdge is a horrible name
    },
    onPooled: function () {
        qnx.webplatform.getController().dispatchEvent("application.pooled", true);
    },
    onIsDeviceLocked: function (state) {
        qnx.webplatform.getController().dispatchEvent("application.isDeviceLocked", [state], true); // not a real event, as it will be triggered only if you query isDeviceLocked
    },
    onWindowCover: function (size) {
        var pSize = JSON.parse(size);
        qnx.webplatform.getApplication().coverSize = pSize;
        qnx.webplatform.getController().dispatchEvent("application.windowCover", [pSize], true);
    },
    onWindowCoverEnter: function () {
        qnx.webplatform.getController().dispatchEvent("application.windowCoverEnter", true);
    },
    onWindowCoverExit: function () {
        qnx.webplatform.getController().dispatchEvent("application.windowCoverExit", true);
    },
    onWindowLock: function () {
        qnx.webplatform.getController().dispatchEvent("application.windowLock", true);
    },
    onWindowUnlock: function () {
        qnx.webplatform.getController().dispatchEvent("application.windowUnlock", true);
    }
};

module.exports = application;

});

define('cards/capture', function (require, exports, module) {
/*
 * Copyright 2012 Research In Motion Limited.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

module.exports = {

    /**
     * @constant
     * @name MODE_PHOTO
     * @memberOf Application.cards.camera
     * @description A string constant representing invocation into photo mode of the camera card
     */
    MODE_PHOTO: 'photo',

    /**
     * @constant
     * @name MODE_VIDEO
     * @memberOf Application.cards.camera
     * @description A string constant representing invocation into video mode of the camera card
     */
    MODE_VIDEO: 'video',

    /**
     * @constant
     * @name MODE_FULL
     * @memberOf Application.cards.camera
     * @description A string constant representing invocation into full mode of the camera card
     */
    MODE_FULL: 'full',

    /**
     * @function
     * @description Opens the camera capture card with the video mode set using the mode parameter
     * @param {String} mode A string representing either MODE_PHOTO, MODE_VIDEO, MODE_FULL constants
     * @param [Function] done A callback triggered when the card composition is complete and the card has closed
     * @param [Function] cancel A callback triggered if the card is canceled by the user
     * @param [Function] invokeCallback A callback triggered when the invocation of the card is complete
     * @memberOf Application.cards.camera
     * @name open
     * @example
     * var details = {
     *         subject: "Something",
     *         body: "Something something...",
     *         startTime: "Thu Jul 17 20:20:20 2031",
     *         duration: "20",
     *         participants: ["a@a.a", "b@b.b"]
     *     },
     *     done = function () {},
     *     cancel = function () {},
     *     invokeCallback = function () {};
     *  camera.open(details, done, cancel, invokeCallback);
     */
    open: function (mode, done, cancel, invokeCallback) {

        var application = window.qnx.webplatform.getApplication(),
            callback;

        callback =  function (info) {
            application.invocation.removeEventListener("childCardClosed", callback);

            if (info.reason === "save") {
                if (typeof done === 'function') {
                    done(info.data);
                }
            } else if (info.reason === "done" || info.reason === "close") {
                if (typeof cancel === 'function') {
                    cancel(info.reason);
                }
            }
        };
        application.invocation.addEventListener("childCardClosed", callback);

        application.invocation.invoke({
            action: "bb.action.CAPTURE",
            target: "sys.camera.card",
            data: window.btoa(mode)
        }, function (error) {
            invokeCallback(error);
        });

    }
};


});

define('defaultHandlers/onChooseFile', function (require, exports, module) {
/*
 * Copyright 2012 Research In Motion Limited.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

module.exports = {
    handle: function (webview) {
        return function (paramsString) {
            var capture,
                file,
                details,
                captureMode,
                type = [],
                filter = [],
                params = JSON.parse(paramsString),
                acceptItemSplit,
                mime,
                subType,
                returnValue = {};

            returnValue.setWait = true;
            if (params.capture === 'camera' || params.capture === 'camcorder') {
                capture = require('./../cards/capture');
                captureMode = params.capture === 'camera' ? capture.MODE_PHOTO : capture.MODE_VIDEO;

                capture.open(captureMode, function (path) {
                    webview.chooseFileResponse(params.waitHandle, encodeURIComponent(path));
                },
                function () {
                    webview.chooseFileResponse(params.waitHandle);
                },
                function (error) {
                    if (error) {
                        webview.uiWebView.toast.show(require('./../utils').i18n().translate("Unable to open the camera.").fetch(), {'translate' : true});
                        webview.chooseFileResponse(params.waitHandle);
                    }
                });
            } else {
                file = require('./../cards/file');

                if (params.acceptMIMETypes) {
                    params.acceptMIMETypes.forEach(function (acceptItem) {
                        //string matches
                        if (acceptItem === "image/*" && type.indexOf(file.TYPE_PICTURE) === -1) {
                            type.push(file.TYPE_PICTURE);
                        } else if (acceptItem === "video/*" && type.indexOf(file.TYPE_VIDEO) === -1) {
                            type.push(file.TYPE_VIDEO);
                        } else if (acceptItem === "audio/*" && type.indexOf(file.TYPE_MUSIC) === -1) {
                            type.push(file.TYPE_MUSIC);
                        }

                        //handle mime-types
                        acceptItemSplit = acceptItem.split("/");

                        if (acceptItemSplit.length === 2 && acceptItemSplit[1] !== "*") {
                            mime = acceptItemSplit[0];
                            subType = acceptItemSplit[1];

                            if (mime === "image" && type.indexOf(file.TYPE_PICTURE) === -1) {
                                type.push(file.TYPE_PICTURE);
                            } else if (mime === "video" && type.indexOf(file.TYPE_VIDEO) === -1) {
                                type.push(file.TYPE_VIDEO);
                            } else if (mime === "audio" && type.indexOf(file.TYPE_MUSIC) === -1) {
                                type.push(file.TYPE_MUSIC);
                            }
                            if (params.acceptMIMETypes.length === 1) { //only use filters if a single mime type. So image/jpg is supprted but image/jpg, video/* will not filter on jpg.
                                filter.push("*." + subType);// if its a file extension simply add it to filters list.
                            }
                        }
                    });
                }

                details = {
                    mode: file.MODE_PICKER,
                    type: type,
                    filter: filter
                };

                file.open(details, function (filepaths) {
                    webview.chooseFileResponse(params.waitHandle, encodeURIComponent(filepaths[0]));
                },
                function () {
                    webview.chooseFileResponse(params.waitHandle);
                },
                function (error) {
                    if (error) {
                        webview.chooseFileResponse(params.waitHandle);
                        if (webview && webview.uiWebView) {
                            webview.uiWebView.toast.show(require('./../utils').i18n().translate("Unable to select a file.").fetch(), {'translate' : true});
                        }
                    }
                });
            }
            return JSON.stringify(returnValue);
        };
    }
};

});

define('defaultHandlers/onOpenWindow', function (require, exports, module) {
/*
 * Copyright 2012 Research In Motion Limited.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var _popupWebview,
    contextmenu,
    events = require('./../events'),
    CHILD_WINDOW_EVENT = "ChildWindowOpen",
    initialized,
    timerHandle;

function createPopup(webview, processId, zOrder) {
    _popupWebview = window.qnx.webplatform.createWebView({ processId: processId }, function () {
        _popupWebview.backgroundColor = 0x00FFFFFF;
        _popupWebview.devicePixelRatio = 1;
        _popupWebview.zOrder = zOrder;
        _popupWebview.active = true;
        _popupWebview.setGeometry(0, 0, window.innerWidth, window.innerHeight);
        webview.setPopupWebView(_popupWebview.id);
        _popupWebview.visible = true;
    });

    _popupWebview.addEventListener('Destroyed', function (webviewId) {
        qnx.callExtensionMethod('webview.delete', _popupWebview.id);
        _popupWebview = undefined;
    });

    _popupWebview.addEventListener('ProcessCrash', function () {
        _popupWebview = undefined;
    });

}

function hidePopup() {
    if (_popupWebview) {
        qnx.callExtensionMethod('webview.destroy', _popupWebview.id);
    }
}

function init(webview) {
    initialized = true;
    contextmenu = require('./../ui/contextMenu/index');
    // Add any handlers to the actual webview itself
    webview.addEventListener('CloseWindow', function () {
        if (_popupWebview) {
            _popupWebview.visible = false;
            hidePopup();
        }

        if (contextmenu) {
            contextmenu.enabled = true;
        }
    });
}

module.exports = {
    handle: function (webview) {
        return function (paramsString) {
            var args = JSON.parse(paramsString),
                uiWebView = webview.uiWebView,
                processId = webview.processId ? webview.processId : 0,
                zOrder = uiWebView.zOrder + 1;

            if (!initialized) {
                init(webview);
            }

            if (args.action === 'CREATE' && args.isPopup) {

                // Create the popup webview
                if (contextmenu) {
                    contextmenu.enabled = false;
                }

                if (!_popupWebview) {
                    createPopup(webview, processId, zOrder);
                } else {
                    webview.setPopupWebView(_popupWebview.id);
                    _popupWebview.visible = true;
                }
                return JSON.stringify({ setAction : 'DISCARD' });
            }

            // Pass this event on since we didn't really want it
            return events.emit(webview.id, CHILD_WINDOW_EVENT, [paramsString], {sync : true, shouldReturn: true});
        };
    }
};

});

define('defaultHandlers/InvokeRequestEvent', function (require, exports, module) {
/*
 * Copyright 2012 Research In Motion Limited.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

module.exports = {
    handle: function (webview) {
        return function (value) {
            var obj = JSON.parse(value),
            request = {
                uri: obj.uri
            };

            window.qnx.webplatform.getApplication().invocation.invoke(request, function (error) {
                if (error && webview && webview.uiWebView) {
                    window.qnx.webplatform.getController().dispatchEvent('InvokeRequestEventError', [error]);
                }
            });
        };
    }
};

});

define('rotationHelper', function (require, exports, module) {
/*
* Copyright 2011-2012 Research In Motion Limited.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

var webviews = {},
    app,
    rotationHelper;

var viewportChanged = function (webviewId) {
    app.notifyRotateComplete();
};

var onRotate = function (width, height, angle) {
    app.addEventListener('PropertyViewportEvent', viewportChanged);
    if (window.innerHeight === height && window.innerWidth === width) {
        // For 180 degrees rotations, manually dispatch the event to finish rotation within 2 seconds
        window.qnx.webplatform.getController().dispatchEvent("PropertyViewportEvent");
    }
    // Set window size for application
    app.setWindowSize(width, height, angle);

    //Set orientation and geometry for each webview
    Object.keys(webviews).forEach(function (webviewId) {
        webviewId = window.parseInt(webviewId, 10);
        webviews[webviewId].setApplicationOrientation(angle);
        webviews[webviewId].setGeometry(0, 0, width, height);
    });
};

var getAngle = function (edge) {
    switch (edge) {
    case "right_up":
        return 90;
    case "left_up":
        return 270;
    case "bottom_up":
        return 180;
    default:
        return 0;
    }
};

var onCardResize = function (request) {

    var angle = getAngle(request.edge);

    // Rotate backwards to compensate for host rotation
    app.setWindowSize(request.width, request.height, angle - 360);

    //set orientation and geometry for each webview
    Object.keys(webviews).forEach(function (webviewId) {
        webviewId = window.parseInt(webviewId, 10);
        webviews[webviewId].setApplicationOrientation(angle);
        webviews[webviewId].setGeometry(0, 0, request.width, request.height);
        webviews[webviewId].notifyApplicationOrientationDone();
    });
    app.invocation.cardResized();
};

var onRotateDone = function () {
    // Notify all webviews that rotation has completed
    Object.keys(webviews).forEach(function (webviewId) {
        webviews[webviewId].notifyApplicationOrientationDone();
    });
    app.removeEventListener('PropertyViewportEvent', viewportChanged);
};

rotationHelper = {

    addWebview: function (webview) {
        webviews[webview.id] = webview;
    },

    removeWebview: function (webview) {
        delete webviews[webview.id];
    },

    init : function (application, controller) {
        if (!app) {
            app = application;
            rotationHelper.addWebview(controller);
            app.addEventListener('application.rotate', onRotate);
            app.addEventListener('application.rotateDone', onRotateDone);
            controller.addEventListener('invocation.cardResize', onCardResize);
        }
    }
};

module.exports = rotationHelper;

});

define('windowAnimations', function (require, exports, module) {
/*
 * Copyright (C) Research In Motion Limited 2011-2012. All rights reserved.
 */
var self,
    windowAnimationFinishedCallbacks = {};

self = {
    windowAnimationFinishedCallbacks: windowAnimationFinishedCallbacks,

    // curve is one of Linear, EaseInCurve, or EaseOutCurve
    animateWindowLocation: function (jsScreenWindowHandle, curve, duration, startX, startY, endX, endY, callback) {
        var animationId = qnx.callExtensionMethod("windowAnimations.animateWindowLocation", jsScreenWindowHandle, curve, duration, startX, startY, endX, endY);
        if (callback) {
            windowAnimationFinishedCallbacks[animationId] = callback;
        }
        qnx.callExtensionMethod("windowAnimations.startAnimation");
    },

    // pageDeltas is an array of jsScreenWindowHandle, startX, startY, endX, endY 5-grams
    animateWindowLocations: function (curve, duration, pageDeltas, callback)
    {
        var args = ["windowAnimations.animateWindowLocationMultiple", curve, duration].concat(pageDeltas),
            animationId = qnx.callExtensionMethod.apply(qnx, args);
        if (callback) {
            windowAnimationFinishedCallbacks[animationId] = callback;
        }
        qnx.callExtensionMethod("windowAnimations.startAnimation");
    },

    // curve is one of Linear, EaseInCurve, or EaseOutCurve
    animateGlobalAlpha: function (jsScreenWindowHandle, curve, duration, startAlpha, endAlpha, callback) {
        var animationId = qnx.callExtensionMethod("windowAnimations.animateGlobalAlpha", jsScreenWindowHandle, curve, duration, startAlpha, endAlpha);
        if (callback) {
            windowAnimationFinishedCallbacks[animationId] = callback;
        }
        qnx.callExtensionMethod("windowAnimations.startAnimation");
    },

    // pageDeltas is an array of jsScreenWindowHandle, startAlpha, endAlpha 3-grams
    animateGlobalAlphas: function (curve, duration, pageDeltas, callback)
    {
        var args = ["windowAnimations.animateGlobalAlphaMultiple", curve, duration].concat(pageDeltas),
            animationId = qnx.callExtensionMethod.apply(qnx, args);
        if (callback) {
            windowAnimationFinishedCallbacks[animationId] = callback;
        }
        qnx.callExtensionMethod("windowAnimations.startAnimation");
    }
};

module.exports = self;

});

define('chrome/events/windowAnimations', function (require, exports, module) {
/*
 * Copyright (C) Research In Motion Limited 2011-2012. All rights reserved.
 */
var self,
    windowAnimationFinishedCallbacks = require('../../windowAnimations').windowAnimationFinishedCallbacks;

self = {
    onWindowAnimationFinished: function (animationId) {
        if (windowAnimationFinishedCallbacks[animationId]) {
            windowAnimationFinishedCallbacks[animationId]();
            delete windowAnimationFinishedCallbacks[animationId];
        }
    }
};

module.exports = self;

});

define('pps/ppsUtils', function (require, exports, module) {
/**
 * Copyright 2012 Research In Motion Limited.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

var pps = require("./pps"),
    JPPS = require("./jpps"),
    ppsUtils;

/**
 * @namespace
 * @name qnx.webplatform.pps
 * @description Module used to interact with pps
 * @property {Object} PPSMode Refer to {@link qnx.webplaform.pps.PPSMode}
 * @property {Object} FileMode  Refer to {@link qnx.webplaform.pps.FileMode}
 */
ppsUtils = {
    /**
     * @namespace Currently only FULL and DELTA are supported. Can be used with bitwise OR.
     * @name PPSMode
     * @memberOf qnx.webplatform.pps
     * @property {Number} FULL
     * @property {Number} DELTA
    */
    PPSMode: {
        FULL: 0,
        DELTA: 1,
        SERVER: 2,
        RAW: 4,
        WAIT: 8
    },

    /**
     * @name FileMode
     * @memberOf qnx.webplatform.pps
     * @namespace
     * @property {Number} RDONLY
     * @property {Number} WRONLY
     * @property {Number} RDWR
     * @property {Number} CREATE
    */
    FileMode: {
        RDONLY: 0,
        WRONLY: 1,
        RDWR: 2,
        CREATE: 256
    },

    /**
     * @function
     * @name createObject
     * @memberOf qnx.webplatform.pps
     * @description Creates a PPS Object
     * @param {String} path The path to the PPS object to be read
     * @param {qnx.webplatform.pps.PPSMode} [options.ppsMode=PPSMode.FULL] The mode to create the pps object
     * @returns {Object} An instance of a PPS object to run actions on
     */
    createObject: function (ppsPath, ppsMode) {
        var ppsObj,
            makeShim;

        if (ppsMode === pps.PPSMode.FULL) {
            ppsObj = pps.create(ppsPath, ppsMode);

            ppsObj.onOpenFailed = function (message) {
                ppsObj.onError(message);
            };

            ppsObj.onWriteFailed = function (message) {
                ppsObj.onError(message);
            };
        } else {

            /**
             * Since we are currently missing DELTA support through the pps / qnx
             * callExtensionMethod calls, this createObject method wraps a fork in
             * implementation between pps and the JPPS library which does support DELTA.
             * This shim exposes the same, expected interface for the JPPS implementation.
             */
            makeShim = function () {

                function buildPath(path, mode) {
                    var returnPath = path,
                        modes = [];

                    if (mode !== ppsUtils.PPSMode.FULL) {

                        if ((mode | ppsUtils.PPSMode.DELTA) === mode) {
                            modes.push("delta");
                        }

                        if (modes.length >= 1) {
                            returnPath += "?" + modes.join(",");
                        }
                    }

                    return returnPath;
                }

                var jppsObj,
                    _ppsObjName = ppsPath.split("/").pop().split("?").shift(), //Grab the final ppsObject name to append it to the returnObj
                    _path = buildPath(ppsPath, ppsMode),
                    _data,
                    _returnObj;

                jppsObj = JPPS.create();

                _returnObj = {
                    open: function (fileMode, options) {
                        var returnVal = jppsObj.open(_path, fileMode, options);
                        if (returnVal && jppsObj.read()) {
                            _data = {};
                            _data[_ppsObjName] = jppsObj.ppsObj;
                            if (this.onFirstReadComplete && typeof this.onFirstReadComplete === "function") {
                                this.onFirstReadComplete(_data);
                            }
                        }
                        return returnVal;
                    },

                    write: function (data) {
                        return jppsObj.write(data);
                    },

                    close: function () {
                        jppsObj.close();
                    },

                    onFirstReadComplete: undefined,

                    onNewData: undefined,

                    onClosed: undefined
                };

                _returnObj.__defineGetter__('data', function () {
                	return jppsObj.ppsData || _data;
                });

                _returnObj.__defineGetter__('path', function () {
                    return _path;
                });

                jppsObj.onChange = function (data) {
                    if (_returnObj.onNewData && typeof _returnObj.onNewData === "function") {
                        _returnObj.onNewData(data);
                    }
                };

                return _returnObj;
            };

            ppsObj = makeShim();
        }

        return ppsObj;
    },

    /**
     * @function
     * @name syncReadPPSObject
     * @memberOf qnx.webplatform.pps
     * @description Reads from a PPS Object
     * @param {String} path The path to the PPS object to be read
     * @param {Object} [options] The options object
     * @param {qnx.webplatform.pps.PPSMode} [options.ppsMode=PPSMode.FULL] The mode to create the pps object
     * @param {qnx.webplatform.pps.FileMode} [options.fileMode=FileMode.RDONLY] The mode to open the file in
     * @returns {Object} The data read from the PPS Object or undefined in an error
     * @throws {String} If an error occurs
     */
    syncReadPPSObject: function (path, options) {

        options = options || {};

        var ppsMode = options.ppsMode || pps.PPSMode.FULL,
            fileMode = options.fileMode || pps.FileMode.RDONLY,
            ppsObj = this.createObject(path, ppsMode),
            errorMsg,
            returnValue;

        if (ppsObj) {
            if (ppsObj.open(fileMode)) {
                ppsObj.close();
                returnValue = ppsObj.data;
            } else {
                errorMsg = "Failed to open PPS object with path " + path + " and with mode " + fileMode;
            }

        } else {
            errorMsg = "Failed to create a PPS object with path " + path + " and with mode " + ppsMode;
        }

        if (errorMsg) {
            throw errorMsg;
        } else {
            return returnValue;
        }
    },

    /**
     * @function
     * @name syncWritePPSObject
     * @memberOf qnx.webplatform.pps
     * @description Writes to a PPS Object
     * @param {String} path The path to the PPS object to be read
     * @param {Object} [options] The options object
     * @param {qnx.webplatform.pps.PPSMode} [options.ppsMode=PPSMode.FULL] The mode to create the pps object
     * @param {qnx.webplatform.pps.FileMode} [options.fileMode=FileMode.RDONLY] The mode to open the file in
     * @returns {Boolean} True if write was successful or False otherwise
     * @throws {String} If an error occurs
     */
    syncWritePPSObject: function (writeData, path, options) {
        options = options || {};

        var ppsMode = options.ppsMode || pps.PPSMode.FULL,
            fileMode = options.fileMode || pps.FileMode.RDWR,
            ppsObj = this.createObject(path, ppsMode),
            errorMsg;

        if (ppsObj) {
            if (ppsObj.open(fileMode)) {
                if (!ppsObj.write(writeData)) {
                    errorMsg = "Failed to write data to PPS object with path " + path;
                }
                ppsObj.close();
            } else {
                errorMsg = "Failed to open PPS object with path " + path + " and with mode " + fileMode;
            }

        } else {
            errorMsg = "Failed to create a PPS object with path " + path + " and with mode " + ppsMode;
        }

        if (errorMsg) {
            throw errorMsg;
        }
    },

    /**
     * @function
     * @name ppsEncodeObject
     * @memberOf qnx.webplatform.pps
     * @description Encode an Object in PPS format
     * @param {Object} obj The object to encode
     * @returns {String} Object in PPS format
     */
    ppsEncodeObject: function (obj) {
        var data = '',
            name,
            value;
        for (name in obj) {
            data += name + ':';
            value = obj[name];
            if (typeof value === 'string') {
                data += ':' + value;
            } else if (typeof value === 'number') {
                data += 'n:' + value;
            } else if (typeof value === 'boolean') {
                data += 'b:' + value;
            } else if (typeof value === 'object') {
                data += 'json:' + JSON.stringify(value);
            }
            data += '\n';
        }
        return data;
    }

};

module.exports = ppsUtils;

});

define('cards/calendarPicker', function (require, exports, module) {
/*
 * Copyright 2012 Research In Motion Limited.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var ppsUtils = require('./../pps/ppsUtils'),
    utils = require('./../utils');

module.exports = {

    /**
     * @description Open a calendar picker card based on the provided details
     * @memberOf Application.cards.calendar.picker
     * @name open
     * @param {Object} details An object that contains details of the specific picker request
     * @param [Function] done A callback triggered when the card composition is complete and the card has closed
     * @param [Function] cancel A callback triggered if the card is canceled by the user
     * @param [Function] invokeCallback A callback triggered when the invocation of the card is complete
     * @example
     * var options = {
     *          filepath: path to file where .vcs will be saved
     *     },
     *     done = function () {},
     *     cancel = function () {},
     *     invokeCallback = function () {};
     *  calendar.picker.open(details, done, cancel, invokeCallback);
     */
    open: function (details, done, cancel, invokeCallback) {
        var application = window.qnx.webplatform.getApplication(),
            callback,
            data = (typeof details !== undefined) ? {
                filepath: utils.translatePath(details.filepath)
            } : {},
            encodedData = ppsUtils.ppsEncodeObject(data);

        callback = function (info) {
            application.invocation.removeEventListener("childCardClosed", callback);
            if (info.reason === "cancel") {
                if (typeof cancel === "function") {
                    cancel(info.reason);
                }
            }
            else {
                if (typeof done === "function") {
                    done(info.data);
                }
            }
        };

        application.invocation.addEventListener("childCardClosed", callback);
        application.invocation.invoke({
            target : 'sys.pim.calendar.viewer.nav',
            action : 'bb.calendar.PICK',
            data : window.btoa(encodedData)
        }, invokeCallback);
    }
};

});

define('cards/emailComposer', function (require, exports, module) {
/*
 * Copyright 2012 Research In Motion Limited.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var ppsUtils = require('./../pps/ppsUtils'),
    utils = require('./../utils');

function processPaths(rawPaths) {
    var paths = [],
        i;
    for (i = 0; i < rawPaths.length; i++) {
        paths.push(utils.translatePath(rawPaths[i]));
    }
    return paths;
}

module.exports = {

    /**
     * @description Opens the email composer card configuring the open using the details parameter
     * @memberOf Application.cards.email.composer
     * @name open
     * @function
     * @param {Object} details An object that contains the details of the email composition
     * @param [Function] done A callback triggered when the card composition is complete and the card has closed
     * @param [Function] cancel A callback triggered if the card is canceled by the user
     * @param [Function] invokeCallback A callback triggered when the invocation of the card is complete
     * @example
     * var details = {
     *      to: ["somebody@somewhere.com"],
     *      cc: ["someoneelse@somewhere.com", "anotherone@somewhere.com"],
     *      subject: "Something",
     *      body: "Something something...",
     *      attachment: ["local:///img/blackberry10.png"]
     *     },
     *     done = function () {},
     *     cancel = function () {},
     *     invokeCallback = function () {};
     *  emailComposer.open(details, done, cancel, invokeCallback);
     */
    open: function (details, done, cancel, invokeCallback) {
        var application = window.qnx.webplatform.getApplication(),
            data = (typeof details !== undefined) ? {
                from : details.from,
                subject : details.subject,
                body : details.body,
                calendarevent : details.calendarevent,
                to : details.to ? details.to : [],
                cc : details.cc ? details.cc : [],
                attachment : details.attachment ? processPaths(details.attachment) : []
            } : {},
            encodedData = ppsUtils.ppsEncodeObject({data: data}),
            callback;

        callback =  function (info) {
            application.invocation.removeEventListener("childCardClosed", callback);
            if (info.reason === 'cancel') {
                if (typeof cancel === 'function') {
                    cancel(info.reason);
                }
            }
            else {
                if (typeof done === 'function') {
                    done(info.data);
                }
            }
        };

        application.invocation.addEventListener("childCardClosed", callback);

        application.invocation.invoke({
            target: "sys.pim.uib.email.hybridcomposer",
            action: "bb.action.COMPOSE",
            data: window.btoa(encodedData)
        }, invokeCallback);

    }
};


});

define('cards/calendarComposer', function (require, exports, module) {
/*
 * Copyright 2012 Research In Motion Limited.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
*/
var utils = require('./../pps/ppsUtils');

module.exports = {

    /**
     * @description Open a calendar composer card based on the provided details
     * @memberOf Application.cards.calendar.composer
     * @name open
     * @param {Object} details An object that contains details of the specific composition request
     * @param [Function] done A callback triggered when the card composition is complete and the card has closed
     * @param [Function] cancel A callback triggered if the card is canceled by the user
     * @param [Function] invokeCallback A callback triggered when the invocation of the card is complete
     * @example
     * var details = {
     *         subject: "Something",
     *         body: "Something something...",
     *         startTime: "Thu Jul 17 20:20:20 2031",
     *         duration: "20",
     *         participants: ["a@a.a", "b@b.b"]
     *     },
     *     done = function () {},
     *     cancel = function () {},
     *     invokeCallback = function () {};
     *  calendar.composer.open(details, done, cancel, invokeCallback);
     */
    open: function (details, done, cancel, invokeCallback) {
        var application = window.qnx.webplatform.getApplication(),
            callback,
            data = (typeof details !== 'undefined') ? {
                accountId : details.accountId,
                syncId : details.syncId,
                subject : details.subject,
                startTime : details.startTime,
                duration : details.duration,
                body : details.body,
                participants : details.participants ? details.participants : []
            } : {},
            encodedData = utils.ppsEncodeObject(data);

        callback =  function (info) {
            application.invocation.removeEventListener("childCardClosed", callback);
            if (info.reason === "cancel") {
                if (typeof cancel === 'function') {
                    cancel(info.reason);
                }
            }
            else {
                if (typeof done === 'function') {
                    done(info.data);
                }
            }
        };

        application.invocation.addEventListener("childCardClosed", callback);
        application.invocation.invoke({
            target: 'sys.pim.calendar.viewer.eventcreate',
            action: 'bb.calendar.CREATE',
            data: window.btoa(encodedData)
        }, invokeCallback);
    }
};

});

define('cards/file', function (require, exports, module) {
/*
 * Copyright 2012 Research In Motion Limited.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
*/

var utils = require('./../pps/ppsUtils');

module.exports = {

    /**
     * @name MODE_PICKER
     * @memberOf Application.cards.filePicker
     * @description A constant that will invoke the card in picking mode to choose a file.
     * @constant String
     */
    MODE_PICKER: 'Picker',

    /**
     * @name MODE_SAVER
     * @memberOf Application.cards.filePicker
     * @description A constant that invokes the card in saving mode.
     * @constant String
     */
    MODE_SAVER: 'Saver',

    /**
     * @name MODE_PICKER_MULTIPLE
     * @memberOf Application.cards.filePicker
     * @description A constant that sets the mode as PickerMultiple to allow selecting multiple files once invoked.
     * @constant String
     */
    MODE_PICKER_MULTIPLE: 'PickerMultiple',

    /**
     * @name MODE_SAVER_MULTIPLE
     * @memberOf Application.cards.filePicker
     * @description A constant that sets the mode as SaverMultiple to allow saving multiple files once the card is invoked.
     * @constant String
     */
    MODE_SAVER_MULTIPLE: 'SaverMultiple',

    /**
     * @name VIEWER_MODE_LIST
     * @memberOf Application.cards.filePicker
     * @description A constant that sets the viewing mode as list view. Showing the files in a list.
     * @constant String
     */
    VIEWER_MODE_LIST: 'ListView',

    /**
     * @name VIEWER_MODER_GRID
     * @memberOf Application.cards.filePicker
     * @description A constant that sets the viewing mode as GridView showing the files in a Grid Structure.
     * @constant String
     */
    VIEWER_MODE_GRID: 'GridView',

    /**
     * @name SORT_BY_NAME
     * @memberOf Application.cards.filePicker
     * @description A constant that sets the sorting property to work by name value.
     * @constant String
     */
    SORT_BY_NAME: 'Name',

    /**
     * @name SORT_BY_DATE
     * @memberOf Application.cards.filePicker
     * @description A constant that sets the sort by field as the date.
     * @constant String
     */
    SORT_BY_DATE: 'Date',

    /**
     * @name SORT_BY_SUFFIX
     * @memberOf Application.cards.filePicker
     * @description A constant that sets sorting by suffix or file type ending.
     * @constant String
     */
    SORT_BY_SUFFIX: 'Suffix',

    /**
     *
     * @name SORT_BY_SIZE
     * @memberOf Application.cards.filePicker
     * @description A constant that sets the sorting by size of the files in the card.
     * @constant String
     */
    SORT_BY_SIZE: 'Size',

    /**
     * @name SORT_ORDER_ASCENDING
     * @memberOf Application.cards.filePicker
     * @description A constant that sets the sort order as Ascending.
     * @constant String
     */
    SORT_ORDER_ASCENDING: 'Ascending',

    /**
     * @name SORT_ORDER_DESCENDING
     * @memberOf Application.cards.filePicker
     * @description A constant that sets the sort order as descending.
     * @constant String
     */
    SORT_ORDER_DESCENDING: 'Descending',

    /**
     * @name TYPE_PICTURE
     * @memberOf Application.cards.filePicker
     * @description Sets the filter to only show or save as a type of picture on the file system.
     * @constant String
     */
    TYPE_PICTURE: 'picture',

    /**
     * @name TYPE_PICTURE
     * @memberOf Application.cards.filePicker
     * @description Sets the filter to only show or save as a type of document on the file system. In picking mode you will only see files that are types of documents: .doc,.pdf etc.
     * @constant String
     */
    TYPE_DOCUMENT: 'document',

    /**
     * @name TYPE_MUSIC
     * @memberOf Application.cards.filePicker
     * @description Sets the filter to only show or save as a type of music on the file system. In picking mode this will only show you files of type musing.
     * @constant String
     */
    TYPE_MUSIC: 'music',

    /**
     * @name TYPE_VIDEO
     * @memberOf Application.cards.filePicker
     * @description Sets the filter to only show or save as a type of video on the file system.
     * @constant String
     */
    TYPE_VIDEO: 'video',

    /**
     * @name TYPE_OTHER
     * @memberOf Application.cards.filePicker
     * @description A constant that describes the file type as saving or picking as other.
     * @constant String
     */
    TYPE_OTHER: 'other',

    /**
     * @description Opens the file card that can be invoked in picker or save mode. Users are able to select, single, multiple to save or select. The card supports a multiple of options for view types, sorting and file types.
     * @memberOf Application.cards.filePicker
     * @name open
     * @param {Object} details An object that contains the details of the filePicker invocation. Mode, Title, ViewMode etc
     * @param [Function] done A callback triggered when the card composition is complete and the card has closed
     * @param [Function] cancel A callback triggered if the card is canceled by the user
     * @param [Function] invokeCallback A callback triggered when the invocation of the card is complete
     * @example
     * var details = {
     *      mode: MODE_PICKER,
     *      title: "Some Custom Title",
     *      viewMode: VIEWER_MODE_GRID,
     *      sortBy: SORT_BY_NAME,
     *      sortOrder: SORT_ORDER_DESCENDING,
     *      directory: ["/your/directory/to/invoke/on"],
     *      allowOverwrite: true,
     *      defaultType: TYPE_DOCUMENT,
     *      type: [TYPE_PICTURE, TYPE_MUSIC]
     *      filter: ["*.jpg", "*.mp4"],
     *      imageCrop: false,
     *      defaultFileNames: ["fileOne.jpg", default.jpg],
     *     },
     *     done = function () {},
     *     cancel = function () {},
     *     invokeCallback = function () {};
     *     application.cards.filePicker.open(details, done, cancel, invokeCallback);
     */
    open: function (details, done, cancel, invokeCallback) {
        var application = window.qnx.webplatform.getApplication(),
            data = {
                Mode: details.mode,
                Title: details.title,
                ViewMode: details.viewMode,
                SortBy: details.sortBy,
                SortOrder: details.sortOrder,
                ImageCrop: details.imageCrop,
                AllowOverwrite: details.allowOverwrite,
                Type: details.type ? details.type.join(',') : [],
                DefaultType: details.defaultType,
                Filter: details.filter ? details.filter.join(';') : [],
                Directory: details.directory ? details.directory.join(',') : [],
                DefaultFileNames: details.defaultSaveFileNames ? details.defaultSaveFileNames.join(',') : []
            },
            encodedData,
            callback;

        callback =  function (info) {
            application.invocation.removeEventListener("childCardClosed", callback);

            if (info.reason === "save") {
                var result = info.data,
                    path,
                    arrayResult = [];

                if (typeof done === 'function') {
                    if (info && info.data && info.data.match("^dat:json")) { //strip off dat:json
                        result = info.data.slice(9);
                    }
                    result = JSON.parse(result);

                    result.forEach(function (file) {
                        path = file.uri;
                        if (path.match("^file:///")) { //strip off file://
                            path = path.slice(7);
                        }
                        if (path.match("file:")) { //strip off file:
                            path = "";
                        }
                        if (path !== "")
                            arrayResult.push(path);
                    });

                    done(arrayResult);
                }
            } else if (info.reason === "cancel") {
                if (typeof cancel === 'function') {
                    cancel(info.reason);
                }
            }
        };
        application.invocation.addEventListener("childCardClosed", callback);

        encodedData = utils.ppsEncodeObject(data);

        application.invocation.invoke({
            action: "bb.action.OPEN",
            target: "sys.filepicker.target",
            data: window.btoa(encodedData)
        }, function (error) {
            invokeCallback(error);
        });

    }
};


});

define('cards/ics', function (require, exports, module) {
/*
 * Copyright 2012 Research In Motion Limited.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
*/

var ppsUtils = require('./../pps/ppsUtils'),
    utils = require('./../utils');

module.exports = {

    /**
     * @description Opens the email composer card configuring the open using the details parameter
     * @memberOf Application.cards.icsViewer
     * @name open
     * @param {Object} details An object that contains the details of the ics file and any account options
     * @param [Function] done A callback triggered when the card composition is complete and the card has closed
     * @param [Function] cancel A callback triggered if the card is canceled by the user
     * @param [Function] invokeCallback A callback triggered when the invocation of the card is complete
     * @example
     * var details = {
     *      uri : "file:///accounts/1000/shared/documents/test.ics",
     *      accountId: "1"
     *     },
     *     done = function () {},
     *     cancel = function () {},
     *     invokeCallback = function () {};
     *  icsViewer.open(details, done, cancel, invokeCallback);
     */
    open: function (details, done, cancel, invokeCallback) {
        var application = window.qnx.webplatform.getApplication(),
            data = {
                accountId : details.accountId
            },
            encodedData,
            callback;

        callback =  function (info) {
            application.invocation.removeEventListener('childCardClosed', callback);
            if (info.reason === "Closed") {
                if (typeof done === "function") {
                    done(info.data);
                }
            } else {
                if (typeof cancel === "function") {
                    cancel(info.reason);
                }
            }
        };
        application.invocation.addEventListener('childCardClosed', callback);

        encodedData = ppsUtils.ppsEncodeObject(data);

        application.invocation.invoke({
            action: 'bb.action.OPEN',
            target: 'sys.pim.calendar.viewer.ics',
            type: 'text/calendar',
            uri: utils.translatePath(details.uri),
            data: window.btoa(encodedData)
        }, function (error) {
            invokeCallback(error);
        });

    }
};


});

define('notification', function (require, exports, module) {
/*
* Copyright 2012 Research In Motion Limited.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

var ppsUtils = require('./pps/ppsUtils'),
    notification;

/**
 * @namespace A javascript abstraction of the notification
 * @name qnx.webplatform.notification
 */
notification = {
    /**
     * @description Create notification item in UIB by sending a message to PPS. If there is a notification item with the same itemId then it would be overwritten.
     * @function
     * @name qnx.webplatform.notification#notify
     * @param {Object} args A unique id for the notification.
     * @param {String} args.title Used as title text in UIB entries
     * @param {Object} args.options Options object contains additional information.
     * @param {String} args.options.tag Unique id that identifies this notification. Can be referenced in subsequent messages and responses related to this notification.
     * @param {String} [args.options.body] Used as a body text in UIB entries
     * @param {String} [args.options.target] The target name of the application to be invoked. The invocation happens when the notification item is selected in UIB.
     * @param {String} [args.options.targetAction] The name of the target action. Example: "bb.action.OPEN".
     * @param {String} [args.options.payload] Payload to send to the invoked application. Data must be Base64 encoded. Value is passed on to the Invocation Framework as data.
     * @param {String} [args.options.payloadType] MIME type of the payload. Value is passed on to the Invocation Framework as type.
     * @param {String} [args.options.payloadURI] URI to payload data to send to the invoked application. Value is passed on to the Invocation Framework as uri. Example: "file://path/to/file.
     * @param {callback} [callback] A callback to be invoked after creating notification.
    */
    notify: function (args, callback) {
        // Calling delete with tag before writing new notification, ensures new notification will override the old one.
        try {
            ppsUtils.syncWritePPSObject({'msg': 'delete', dat: {'itemid': args.options.tag}}, '/pps/services/notify/control');
            ppsUtils.syncWritePPSObject(
                {'msg': 'notify',
                    dat: {'itemid': args.options.tag, "title": args.title, 'subtitle': args.options.body,
                        'target': args.options.target, 'targetAction': args.options.targetAction,
                        'payload': args.options.payload, 'payloadType': args.options.payloadType, 'payloadURI': args.options.payloadURI
                    }
                },
                '/pps/services/notify/control'
            );
            callback();
        } catch (e) {
            callback(e);
        }
    },
    /**
     * @description Remove notification item from UIB.
     * @function
     * @name qnx.webplatform.notification#remove
     * @param {String} itemId Unique id that identifies this notification. Can be referenced in subsequent messages and responses related to this notification.
    */
    remove: function (itemId) {
        ppsUtils.syncWritePPSObject({'msg': 'delete', dat: {'itemid': itemId}}, '/pps/services/notify/control');
    }
};

module.exports = notification;

});

define('pps/ppsNetwork', function (require, exports, module) {
/*
 *  Copyright 2012 Research In Motion Limited.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var self,
    ppsUtils = require('./ppsUtils'),
    // TODO: For enterprise perimeter apps, this needs to be looking into the enterprise folder
    NETWORK_INTERFACE_ROOT = '/pps/services/networking/interfaces/',
    NETWORK_STATUS_PATH = '/pps/services/networking/status_public',
    CELL_STATUS_PATH = '/pps/services/cellular/radioctrl/status_cell_public',
    NETWORK_INTERFACES,
    NETWORK_INFO_STATUS;

function getInterfaces(callback) {
    var ppsObj = ppsUtils.createObject(NETWORK_INTERFACE_ROOT + ".all", ppsUtils.PPSMode.FULL);
    NETWORK_INTERFACES = [];

    function onNewData(data) {
        for (var key in data) {
            if (data.hasOwnProperty(key)) {
                NETWORK_INTERFACES.push(key);
            }
        }
    }

    function onFirstReadComplete(data) {
        for (var key in data) {
            if (data.hasOwnProperty(key)) {
                NETWORK_INTERFACES.push(key);
            }
        }
    }

    function onClosed() {
        //Sort the interfaces In order of precedence
        NETWORK_INTERFACES = NETWORK_INTERFACES.sort(function (a, b) {
            var precedence = {
                'rndis0': 1,//USB
                'ecm0': 2,//USB
                'tiw_sta0': 3,
                'ppp0': 4//Bluetooth
            };

            //if not in pecedence list, place after usb but before ppp0
            return (precedence[a] ? precedence[a] : 3) - (precedence[b] ? precedence[b] : 3);
        });

        callback();
    }

    ppsObj.onNewData = onNewData;
    ppsObj.onFirstReadComplete = onFirstReadComplete;
    ppsObj.onClosed = onClosed;

    ppsObj.open(ppsUtils.FileMode.RDONLY);
    ppsObj.close();
}

function handleNetworkStatusForInterface(networkInterface) {
    var ipAddresses = networkInterface.ip_addresses,
        type = networkInterface.type,
        ip4,
        ip6;

    if ((type === "wifi" || type === "usb") && ipAddresses && ipAddresses.length === 2) {
        // The ip addresses are returned in an array of the format:
        // [ 'ipv4Address/subnet', 'ipv6Address%interface/subnet' ]
        // so we trim them down here for the convenience of the caller.
        // In the case of wifi, ip6 comes first then ip4
        if (ipAddresses[0].match("^([0-9]{1,3}([.][0-9]{1,3}){3}).*")) {
            //first address is IP4 [USB IP]
            ip4 = ipAddresses[0];
            ip6 = ipAddresses[1];
        } else {
            //first address is IP6 [WIFI IP]
            ip6 = ipAddresses[0];
            ip4 = ipAddresses[1];
        }
        return {
            ipv4Address: ip4.substr(0, ip4.indexOf('/')),
            ipv6Address: ip6.substr(0, ip6.indexOf('%')),
            type: type,
            connected: networkInterface.connected
        };
    }
}

function getNetworkStatusForInterface(i, callback) {
    if (i < NETWORK_INTERFACES.length) {
        var networkInterface = ppsUtils.syncReadPPSObject(NETWORK_INTERFACE_ROOT + NETWORK_INTERFACES[i]),
            networkStatus = handleNetworkStatusForInterface(networkInterface[NETWORK_INTERFACES[i]]);

        if (networkStatus) {
            NETWORK_INFO_STATUS[NETWORK_INTERFACES[i]] = networkStatus;
        } else {
            NETWORK_INFO_STATUS[NETWORK_INTERFACES[i]] = null;
        }

        getNetworkStatusForInterface(++i, callback);
    } else {
        callback(NETWORK_INFO_STATUS);
    }
}

self = {
    getNetworkInfo : function (callback) {
        if (callback) {
            getInterfaces(function () {
                NETWORK_INFO_STATUS = {};

                //Will recursively get the network status for each interface
                getNetworkStatusForInterface(0, callback);
            });
        }
    },

    getActiveConnectionInfo : function () {
        var activeConnectionInfo = null,
            defaultInterface,
            interfaceInfo,
            publicStatus,
            cellPublicStatus,
            cellInfo,
            networkStatus = ppsUtils.syncReadPPSObject(NETWORK_STATUS_PATH);

        publicStatus = networkStatus['status_public'];

        if (publicStatus['default_interface'] === "") {
            return null;
        } else {
            activeConnectionInfo = {};
        }

        defaultInterface = publicStatus['default_interface'];
        activeConnectionInfo.defaultInterface = defaultInterface;
        activeConnectionInfo.ipv4 = publicStatus['ip4_ok'] === "yes" ? true : false;
        activeConnectionInfo.ipv6 = publicStatus['ip6_ok'] === "yes" ? true : false;
        activeConnectionInfo.defaultGateways = publicStatus['default_gateway'];

        interfaceInfo = ppsUtils.syncReadPPSObject(NETWORK_INTERFACE_ROOT + defaultInterface);

        if (interfaceInfo) {
            activeConnectionInfo.type = interfaceInfo[defaultInterface].type;
            activeConnectionInfo.up = interfaceInfo[defaultInterface].up;

            if (interfaceInfo[defaultInterface].type === 'cellular') {
                cellInfo = ppsUtils.syncReadPPSObject(CELL_STATUS_PATH);
                cellPublicStatus = cellInfo['status_cell_public'];
                activeConnectionInfo.technology = cellPublicStatus['network_technology'];
            }
        }
       
        return activeConnectionInfo;
    },
};

module.exports = self;

});

define('cards/mediaplayer', function (require, exports, module) {
/*
 * Copyright 2012 Research In Motion Limited.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var utils = require('./../utils'),
    ppsUtils = require('./../pps/ppsUtils');


module.exports = {

    /**
     * @description Opens the media player card with the details object providing the source of the data to be passed
     * @memberOf Application.cards.mediaplayerPreviewer
     * @name open
     * @param {Object} details An object that contains the details of the invocation request for the card
     * @param [Function] done A callback triggered when the card composition is complete and the card has closed
     * @param [Function] cancel A callback triggered if the card is canceled by the user
     * @param [Function] invokeCallback A callback triggered when the invocation of the card is complete
     * @example
     * var details = {
     *      contentUri: "file:///accounts/1000/shared/videos/cool.mp4"
     *      imageUri : "file:///accounts/1000/shared/documents/img_test.jpg",
     *      contenttitle = "An awesome title"
     *     },
     *     done = function () {},
     *     cancel = function () {},
     *     invokeCallback = function () {};
     *  application.cards.mediaplayer.open(details, done, cancel, invokeCallback);
     */
    open: function (details, done, cancel, invokeCallback) {
        var application = window.qnx.webplatform.getApplication(),
            callback,
            encodedData,
            uri;

        details = details || {};

        uri = utils.translatePath(details.contentUri || "");

        encodedData = ppsUtils.ppsEncodeObject({
            contentTitle: details.contentTitle,
            imageUri: details.imageUri ? utils.translatePath(details.imageUri) : undefined
        });

        callback =  function (info) {
            application.invocation.removeEventListener("childCardClosed", callback);

            if (info.reason.toLowerCase().indexOf("cancel") === 0) {
                if (typeof cancel === 'function') {
                    cancel(info.reason);
                }
            }
            else if (typeof done === 'function') {
                done(info.data);
            }
        };

        application.invocation.addEventListener("childCardClosed", callback);

        application.invocation.invoke({
            action: "bb.action.VIEW",
            target: "sys.mediaplayer.previewer",
            uri: uri,
            data: window.btoa(encodedData)
        }, function (error) {
            invokeCallback(error);
        });

    }
};


});

define('device', function (require, exports, module) {
/**
 * Copyright 2012 Research In Motion Limited.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

var ppsUtils = require('./pps/ppsUtils'),
    utils = require('./utils'),
    ppsNetwork = require('./pps/ppsNetwork'),
    events = require("./events"),
    chrome = require("./chrome"),
    CONNECTION_EVENT_NAME = "device.connectionChange",
    BATTERY_EVENT_PREFIX = "device.battery.",
    BATTERY_EVENTS = {
        chargeLow: "chargeLow",
        chargeCritical: "chargeCritical",
        statusChange: "statusChange"
    },
    BATTERY_PPS_PATH = "/pps/services/BattMgr/status",
    CONNECTION_PPS_PATH = "/pps/services/networking/status_public",
    ppsObjects = {},
    /**
     * @namespace This class has several device properties that are populated through pps
     * @name qnx.webplatform.device
     * @property {String} devicePin The PIN of the device
     * @property {String} IMEI The IMEI of the device
     * @property {String} defaultTheme The default theme of the device
     * @property {String} deviceOS The operating system of the device
     * @property {String} deviceName The name of the device
     * @property {String} hardwareId The hardware Id of the device
     * @property {String} iconRes The resolution of the icons on the device.
     * @property {String} modelFullName The full name of the model eg BlackBerry Z10
     * @property {String} modelName The full name of the model eg Z10
     * @property {String} scmBundle The scm bundle of the OS build
     * @property {String} screenDPI The DPI value of the screen
     * @property {String} screenRes The resolution of the screen
     * @property {String} MCC The mobile carrier code for the device. Requires read_cellular_data permission.
     * @property {String} MNC The mobile network code for the device. Requires read_cellular_data permission.
     * @property {String} IMSI The IMSI is a restricted property of the device. It requires special auth permissions and more.
     * @property {String} timezone The current timezone of the device
     */
    device = {},
    timezones = null,
    batteryInfo = {},
    _batteryState = {CRITICAL: 0, LOW: 1, NORMAL: 2},
    DEVICE_TYPE = {L_SERIES : 0, N_SERIES : 1};

function defineProperty(ppsPath, propertyName, accessorArray) {
    Object.defineProperty(device, propertyName, {
        get: function () {
            try {
                var ppsData = ppsUtils.syncReadPPSObject(ppsPath);
                return accessorArray.reduce(function (previous, current) {
                    return previous[current];
                }, ppsData);
            } catch(ex) {
                //For consistency, always catch and log exceptions for all device properties
                console.error(ex);
            }
        },
        enumerable: true
    });
}

defineProperty("/pps/services/private/deviceproperties", "devicePin", ["deviceproperties", "devicepin"]);
defineProperty("/pps/services/private/deviceproperties", "IMEI", ["deviceproperties", "IMEI"]);
defineProperty("/pps/services/deviceproperties", "defaultTheme", ["deviceproperties", "defaultTheme"]);
defineProperty("/pps/services/deviceproperties", "deviceOS", ["deviceproperties", "device_os"]);
defineProperty("/pps/services/deviceproperties", "deviceName", ["deviceproperties", "devicename"]);
defineProperty("/pps/services/deviceproperties", "hardwareId", ["deviceproperties", "hardwareid"]);
defineProperty("/pps/services/deviceproperties", "iconRes", ["deviceproperties", "icon_res"]);
defineProperty("/pps/services/deviceproperties", "modelFullName", ["deviceproperties", "modelfullname"]);
defineProperty("/pps/services/deviceproperties", "modelName", ["deviceproperties", "modelname"]);
defineProperty("/pps/services/deviceproperties", "scmBundle", ["deviceproperties", "scmbundle"]);
defineProperty("/pps/services/deviceproperties", "screenDPI", ["deviceproperties", "screen_dpi"]);
defineProperty("/pps/services/deviceproperties", "screenRes", ["deviceproperties", "screen_res"]);
defineProperty("/pps/services/cellular/uicc/card0/status_private", "mcc", ["status_private", "hplmn", "mcc"]);
defineProperty("/pps/services/cellular/uicc/card0/status_private", "mnc", ["status_private", "hplmn", "mnc"]);
defineProperty("/pps/services/cellular/uicc/card0/status_restricted", "IMSI", ["status_restricted", "imsi"]);
defineProperty("/pps/services/confstr/_CS_TIMEZONE", "timezone", ["_CS_TIMEZONE", "_CS_TIMEZONE"]);

function batteryLevelToState(level) {
    if (level < 5) {
        return _batteryState.CRITICAL;
    } else if (level >= 5 && level < 15) {
        return _batteryState.LOW;
    } else {
        return _batteryState.NORMAL;
    }
}

function batteryOnNewData(changedData) {
    var newBatteryState,
        eventsToTrigger = {
            statusChange: false,
            chargeLow: false,
            chargeCritical: false
        },
        eventKey;

    // Determine imporant changes and trigger associated events
    if (changedData.changed) {
        if (changedData.changed.BatteryInfo) {
            batteryInfo.level = changedData.data.BatteryInfo.BatteryStatus.StateOfCharge;
            eventsToTrigger.statusChange = true;
        }

        if (changedData.changed.ChargerInfo) {
            batteryInfo.isPlugged = changedData.data.ChargerInfo !== "NONE";
            eventsToTrigger.statusChange = true;
        }

        newBatteryState = batteryLevelToState(batteryInfo.level);

        if (newBatteryState !== batteryInfo.state) {
            if (newBatteryState === _batteryState.LOW) {
                eventsToTrigger.chargeLow = true;
            } else if (newBatteryState === _batteryState.CRITICAL) {
                eventsToTrigger.chargeCritical = true;
            }

            batteryInfo.state = newBatteryState;
        }

        // Dispatch relevant events
        for (eventKey in eventsToTrigger) {
            if (eventsToTrigger.hasOwnProperty(eventKey) && eventsToTrigger[eventKey]) {
                qnx.webplatform.getController().dispatchEvent(BATTERY_EVENT_PREFIX + eventKey, [batteryInfo]);
            }
        }
    }
}

function batteryOnFirstRead(data) {
    // Store initial battery info data for delta comparisions
    batteryInfo.level = data.status.BatteryInfo.BatteryStatus.StateOfCharge;
    batteryInfo.isPlugged = data.status.ChargerInfo !== "NONE";
    batteryInfo.state = batteryLevelToState(batteryInfo.level);
}

function _setupPPS(eventName, path) {
    var ppsObj = ppsUtils.createObject(path, ppsUtils.PPSMode.DELTA);

    ppsObj.onFirstReadComplete = function (data) {
        qnx.webplatform.getController().dispatchEvent(eventName, [data]);
    };

    ppsObj.onNewData = function (data) {
        qnx.webplatform.getController().dispatchEvent(eventName, [data]);
    };

    ppsObj.open(ppsUtils.FileMode.RDONLY);

    ppsObjects[path] = ppsObj;
}

/**
 * @description Adds an event listener for device events
 * @param {String} eventName Device event name. Can be one of:
 *                  "device.connectionChange",
 *                  "device.battery.statusChange",
 *                  "device.battery.chargeLow", (Battery level under 15%)
 *                  "device.battery.chargeCritical" (Battery level under 5%)
 * @param {Function} handler Callback handler for when event gets fired
 * @example
 * qnx.webplatform.device.addEventListener("device.connectionChange", function (data) {
 *     console.log("Connection Changed!")
 * })
 */
device.addEventListener = function (eventName, handler) {
    if (utils.startsWith(eventName, BATTERY_EVENT_PREFIX)) {
        qnx.webplatform.getController().addEventListener(eventName, handler);

        if (ppsObjects[BATTERY_PPS_PATH] === undefined) {
            var ppsObj = ppsUtils.createObject(BATTERY_PPS_PATH, ppsUtils.PPSMode.DELTA);

            ppsObj.onFirstReadComplete = batteryOnFirstRead;
            ppsObj.onNewData = batteryOnNewData;
            ppsObj.open(ppsUtils.FileMode.RDONLY);

            ppsObjects[BATTERY_PPS_PATH] = ppsObj;
        }
    } else if (eventName === CONNECTION_EVENT_NAME) {
        qnx.webplatform.getController().addEventListener(eventName, handler);

        if (ppsObjects[CONNECTION_PPS_PATH] === undefined) {
            _setupPPS(eventName, CONNECTION_PPS_PATH);
        }
    }
};

/**
 * @description Removes an existing event handler for a device event
 * @param {String} Device event name
 * @param {Function} Event handler to unbind
 * @example
 * qnx.webplatform.device.removeEventListener("device.connectionChange");
 */
device.removeEventListener = function (eventName, handler) {
    var ppsObj,
        batteryEvent;

    if (utils.startsWith(eventName, BATTERY_EVENT_PREFIX)) {
        // Only close the PPS object if we have no battery listeners which need it
        qnx.webplatform.getController().removeEventListener(eventName, handler);

        // Since we have n types of listeners on this single PPS, make sure all
        // of them are unbound before closing the PPS
        for (batteryEvent in BATTERY_EVENTS) {
            if (BATTERY_EVENTS.hasOwnProperty(batteryEvent)) {
                if (events.isOn(chrome.id, BATTERY_EVENT_PREFIX + batteryEvent)) {
                    return;
                }
            }
        }

        ppsObj = ppsObjects[BATTERY_PPS_PATH];
        ppsObj.close();

        delete ppsObjects[BATTERY_PPS_PATH];

    } else if (eventName === CONNECTION_EVENT_NAME) {
        qnx.webplatform.getController().removeEventListener(eventName, handler);

        if (!events.isOn(chrome.id, eventName)) {
            ppsObj = ppsObjects[CONNECTION_PPS_PATH];
            ppsObj.close();

            delete ppsObjects[CONNECTION_PPS_PATH];
        }
    }
};

/**
 * @description Returns all connected and not connected network interfaces for the device
 * @param {Function} Callback which contains a a list of interfaces as a parameter
 * @example
 * qnx.webplatform.device.getNetworkInterfaces(function (interfaces) {
 *     console.log(interfaces[0]) // Prints the first interface, such as "tiw_st0" (wifi)
 *     console.log(interfaces[1])
 * });
 */
device.getNetworkInterfaces = function (callback) {
    ppsNetwork.getNetworkInfo(callback);
};

/**
 * @name device#activeConnection
 * @description Returns the current connected connection
 * @returns {Object} Active connection information such as type, gateways, status
 * @example
 * var actionConnection = qnx.webplatform.device.activeConnection;
 * console.log(actionConnection.type); // One of ["wifi", "wired", "bluetooth_dun", "usb", "vpn", "bb", "cellular", "unknown", "none"]
 * console.log(actionConnection.defaultInterface); // Prints 'tiw_st0'
 * console.log(actionConnection.technology); //undefined except for cellular when its one of ["edge", "evdo", "umts", "lte", "unknown"]
 */
Object.defineProperty(device, 'activeConnection', {
    get: function () {
        return ppsNetwork.getActiveConnectionInfo();
    },
    enumerable: true
});

/**
 * @description Returns the list of all timezones
 * @param {Function} Callback which contains a list of timezone ids as parameter, if
 * there is a problem reading the timezone file, null will be returned
 * @example
 * qnx.webplatform.device.getTimezones(function (timezones) {
 *     if (timezones) {
 *         console.log(timezones[0]);
 *     }
 * })
 */
device.getTimezones = function (callback) {
    if (!callback || typeof callback !== "function") {
        return;
    }

    if (!timezones) {
        var sandbox = qnx.webplatform.getController().setFileSystemSandbox, // save original sandbox value
            errorHandler = function (e) {
                callback(null);
                // set it back to original value
                qnx.webplatform.getController().setFileSystemSandbox = sandbox;
            },
            gotFile = function (fileEntry) {
                fileEntry.file(function (file) {
                    var reader = new FileReader();

                    reader.onloadend = function (e) {
                        var fileContent = this.result,
                            lines = fileContent.split("\n"),
                            tz = [];

                        lines.forEach(function (line) {
                            if (/^"/.test(line)) {
                                tz.push(line.replace(/"/g, ""));
                            }
                        });
                        callback(tz);
                        // cache read timezones list for subsequent calls
                        timezones = tz;
                        // set it back to original value
                        qnx.webplatform.getController().setFileSystemSandbox = sandbox;
                    };

                    reader.readAsText(file);
                }, errorHandler);
            },
            onInitFs = function (fs) {
                qnx.webplatform.getController().setFileSystemSandbox = false;
                fs.root.getFile("/usr/share/zoneinfo/tzvalid", {create: false}, gotFile, errorHandler);
            };

        window.webkitRequestFileSystem(window.PERSISTENT, 1024 * 1024, onInitFs, errorHandler);
    } else {
        callback(timezones);
    }
};

/**
 * @name device#type
 * @description Returns the current type of device based on the screen height and width
 */
device.__defineGetter__("type", function () {
    if (window.screen.height === 720 && window.screen.width === 720) {
        return DEVICE_TYPE.N_SERIES;
    } else if ((window.screen.height === 1280 && window.screen.width === 768) || (window.screen.height === 768 && window.screen.width === 1280)) {
        return DEVICE_TYPE.L_SERIES;
    }
});

/**
 * @name device#hasPhysicalKeyboard
 * @description Returns from a media query whether this device has a physical keyboard or not
 */
device.__defineGetter__("hasPhysicalKeyboard", function () {
    return window.matchMedia("(-blackberry-physical-keyboard)").matches;
});

/**
 * @name device#DEVICE_TYPE
 * @description Returns the DEVICE_TYPE object with a constant assigned for each type
 *              DEVICE_TYPE.L_SERIES = 0, DEVICE_TYPE.N_SERIES = 1
 */
device.DEVICE_TYPE = DEVICE_TYPE;

module.exports = device;


});

define('chrome/internal', function (require, exports, module) {
/*
 * Copyright (C) Research In Motion Limited 2011-2012. All rights reserved.
 */
var events = require('../events'),
    chrome = require("../chrome"),
    application = require("../chrome/events/application"),
    windowAnimations = require('../chrome/events/windowAnimations'),
    invocation = require("../invocation"),
    webEventRouter = require("../webEventRouter"),
    pps =  require('../pps/pps'),
    sendEvents = [
       /**
        * @memberOf WebView
        * @event
        * @name onJavaScriptWindowObjectCleared
        */
        'JavaScriptWindowObjectCleared',
       /**
        * @memberOf WebView
        * @event
        * @name onLocationChanging
        */
        'LocationChanging',
       /**
        * @memberOf WebView
        * @event
        * @name onContextMenuRequestEvent
        */
        'ContextMenuRequestEvent',
        /**
        * @memberOf WebView
        * @event
        * @name onContextMenuCancelEvent
        */
        'ContextMenuCancelEvent',
       /**
        * @memberOf WebView
        * @event
        * @name onPropertyCurrentContextEvent
        */
        'PropertyCurrentContextEvent',
        /**
         * @memberOf WebView
         * @event
         * @name onUnknownProtocol
         */
        'UnknownProtocol',

        /**
         * @memberOf WebView
         * @event
         * @name onDialogRequested
         */
        'DialogRequested',
        /**
         * @memberOf WebView
         * @event
         * @name onChooseFile
         */
        'ChooseFile',

        /**
         * @memberOf WebView
         * @event
         * @name onSSLHandshakingFailed
         */
        'SSLHandshakingFailed',

        /**
         * @memberOf WebView
         * @event
         * @name onGeolocationPermissionRequest
         */
        'GeolocationPermissionRequest',

        /**
         * @memberOf WebView
         * @event
         * @name onNotificationPermissionRequest
         */
        'NotificationPermissionRequest',

         /**
         * @memberOf WebView
         * @event
         * @name onNetworkError
         */
        'NetworkError',

        /**
         * @memberOf WebView
         * @event
         * @name onNotificationPermissionCheck
         */
        'NotificationPermissionCheck',

       /**
        * @memberOf WebView
        * @event
        * @name onUserMediaRequest
        */
        'UserMediaRequest',

        /**
        * @memberOf WebView
        * @event
        * @name onOpenWindow
        */
        'OpenWindow',

        /**
        * @memberOf WebView
        * @event
        * @name onChildWindowOpen
        * @description This event is only fired if the default OpenWindow handler is attached
        */
        'ChildWindowOpen',

       /**
        * @memberOf WebView
        * @event
        * @name onChildWebViewCreated
        */
        'ChildWebViewCreated',

       /**
        * @memberOf WebView
        * @event
        * @name onNetworkResourceHeaderReceived
        */
        'NetworkResourceStatusReceived',

       /**
        * @memberOf WebView
        * @event
        * @name onNetworkResourceHeaderReceived
        */
        'NetworkResourceHeaderReceived',

       /**
        * @memberOf WebView
        * @event
        * @name onNetworkResourceHeaderReceived
        */
        'NetworkResourceDataReceived',

       /**
        * @memberOf WebView
        * @event
        * @name onNetworkResourceRequested
        * @description This event handler will fire whenever a network resource is requested. The handler should return an action indicating what should be done (one of ALLOW, DENY, or SUBSTITUTE).
        */
        'NetworkResourceRequested'

    ];

function defineSendEvent(eventName, isNetworkEvent) {
    if (sendEvents.indexOf(eventName) === -1) {
        sendEvents.push(eventName);
    }
    if (isNetworkEvent) {
        events.defineNetworkEvent(eventName);
    }
}

module.exports = {
    sendEvents: sendEvents,
    defineSendEvent: defineSendEvent,
    enableWebEventRedirect: webEventRouter.enableRedirect,
    disableWebEventRedirect: webEventRouter.disableRedirect,
    windowAnimations: windowAnimations,
    application: application,
    invocation: {
        onInvoked: invocation.onInvoked,
        onInvokeResponse: invocation.onInvokeResponse,
        onInvokeViewerResponse: invocation.onInvokeViewerResponse,
        onQueryTargetsResponse: invocation.onQueryTargetsResponse,
        onViewerCreate: invocation.onViewerCreate,
        onViewerRelay: invocation.onViewerRelay,
        onViewerRelayResponse: invocation.onViewerRelayResponse,
        onViewerStopped: invocation.onViewerStopped,
        onCardResize: invocation.onCardResize,
        onCardStartPeek: invocation.onCardStartPeek,
        onCardEndPeek: invocation.onCardEndPeek,
        onCardChildClosed: invocation.onCardChildClosed,
        onCardClosed: invocation.onCardClosed,
        onGetInvokeTargetFiltersResponse: invocation.onGetInvokeTargetFiltersResponse,
        onSetInvokeTargetFiltersResponse: invocation.onSetInvokeTargetFiltersResponse
    },
    pps: {
        onEvent: pps.onEvent
    },
    webEvent: function (webviewId, eventName, eventArgs, eventId) {

        // Redirect web events if needed
        var routingObj = webEventRouter.route(eventName, webviewId),
            originalWebViewId = webviewId;
        webviewId = routingObj.targetWebViewId;
        eventArgs = originalWebViewId === webviewId ? [eventArgs] : [eventArgs, originalWebViewId];

        //There are two different types of events we need to handle
        //Plain QNXWebEvents that are a one way pub sub model
        //SendEvents that require a return value and thus need to be handled synchronously
        if (sendEvents.indexOf(eventName) !== -1) {
            return events.emit(webviewId, eventName, eventArgs, {sync: true, shouldReturn: true});
        } else {
            events.emit(webviewId, eventName, eventArgs);
        }
    }
};

});

define('Application', function (require, exports, module) {
/*
* Copyright 2011-2012 Research In Motion Limited.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

var Application,
    internal = require("./chrome/internal"),
    invocation = require("./invocation");

/**
 * @class A javascript abstraction of the application
 * @property {Boolean} visible Whether the application window is visible or not
 */
Application = function () {
    var coverSize = qnx.callExtensionMethod('application.coverSize'),
        windowState = qnx.callExtensionMethod('application.isForeground') === "1" ? "fullscreen" : "thumbnail";

    this.__defineGetter__("coverSize", function () {
        return coverSize;
    });

    this.__defineSetter__("coverSize", function (size) {
        coverSize = size;
    });

    this.__defineGetter__("windowState", function () {
        return windowState;
    });

    this.__defineSetter__("windowState", function (state) {
        windowState = state;
    });

    this.__defineGetter__("isForeground", function () {
        return qnx.callExtensionMethod('application.isForeground')  === "1" ? true : false;
    });

    this.__defineGetter__("windowVisible", function () {
        return qnx.callExtensionMethod("applicationWindow.isVisible") === "1";
    });

    this.__defineSetter__("windowVisible", function (newVisibility) {
        qnx.callExtensionMethod("applicationWindow.setVisible", !!newVisibility);
    });

    /**
     * @description Returns the system region
     */
    this.__defineGetter__("systemRegion", function () {
        return qnx.callExtensionMethod('application.systemRegion');
    });

    /**
     * @description Gets the port for Web Inspector.
     */
    this.__defineGetter__("webInspectorPort", function () {
        return qnx.callExtensionMethod("webInspector.port");
    });

    /**
     * @description Gets an environment variable.
     * @param {String} name The name of the environment variable to get.
     */
    this.getEnv = function (name) {
        return qnx.callExtensionMethod('application.getenv', name);
    };

    /**
     * @description Sets an environment variable.
     * @param {String} name The name of the environment variable to set.
     * @param {String} value The value of the environment variable to set.
     */
    this.setEnv = function (name, value) {
        return qnx.callExtensionMethod('application.setenv', name, value);
    };

    /**
     * @description Removes an environment variable.
     * @param {String} name The name of the environment variable to unset.
     */
    this.unsetEnv = function (name) {
        return qnx.callExtensionMethod('application.unsetenv', name);
    };

    /**
     *@description Notifies the application that rotation handling is complete.
     */
    this.notifyRotateComplete = function () {
        qnx.callExtensionMethod('application.notifyRotateComplete');
    };

    /**
     *@description Returns system font family.
     */
    this.getSystemFontFamily = function () {
        return qnx.callExtensionMethod('application.systemFontFamily');
    };

    /**
     *@description Returns system font size in pixels.
     */
    this.getSystemFontSize = function () {
        return parseInt(qnx.callExtensionMethod('application.systemFontSize'), 10);
    };

    /**
     *@description Exits the application.
     */
    this.exit = function () {
        qnx.callExtensionMethod('application.requestExit');
    };

    /**
     *@description Minimizes the application
     */
    this.minimizeWindow = function () {
        qnx.callExtensionMethod('application.minimizeWindow');
    };

    /**
     *@description Locks rotation events received through application.rotate when the user rotates the device.
     *@param {Boolean} receiveRotateEvents - if true allows the user to receive rotateWhenLocked events.
     */
    this.lockRotation = function (receiveRotateEvents) {
        if (receiveRotateEvents) {
            qnx.callExtensionMethod('application.lockRotation', 'deviceTracking');
        } else {
            qnx.callExtensionMethod('application.lockRotation');
        }
    };

    /**
     *@description Unlock rotation events received through application.rotate.
     */
    this.unlockRotation = function () {
        qnx.callExtensionMethod('application.unlockRotation');
    };

    /**
     *@description Sets a new wallpaper.
     *@param {String} filePath of the location of the wallpaper, must be absolute path. eg- '/accounts/1000/shared/photos/pic.jpg'
     */
    this.newWallpaper = function (filePath) {
        qnx.callExtensionMethod('application.newWallpaper', filePath);
    };

    /**
     *@description Forces rotation of the screen to a certain edge or orientation.
     *@param {String} orientation or edge which should be final rotation, possible values are top_up, right_up, left_up, landscape or portrait
     */
    this.rotate = function (edge) {
        qnx.callExtensionMethod('application.rotate', edge);
    };

    /**
     * @description Adds a listener for event.
     * @param {String} evt The event to listen for. A list of application events are:
     *  "application.stateChange",
     *  "application.inactive",
     *  "application.active",
     *  "application.swipedown",
     *  "application.exit",
     *  "application.fontchanged",
     *  "application.lowMemory",
     *  "application.rotate",
     *  "application.rotateDone",
     *  "application.keyboardOpening",
     *  "application.keyboardOpened",
     *  "application.keyboardClosing",
     *  "application.keyboardClosed",
     *  "application.keyboardPosition",
     *  "application.propertyViewportEvent",
     *  "application.systemLanguageChange",
     *  "application.rotateWhenLocked",
     *  "application.systemRegionChange"
     *  "application.mediaError"
     * @param {callback} handler The function to be invoked when the event occurs
     */
    this.addEventListener = function (evt, handler) {
        qnx.webplatform.getController().addEventListener(evt, handler);
    };

    /**
     * @description Removes a listener for an event.
     * @param {String} evt The event to remove listener for. It will only handle valid events.
     * @param {callback} handler The function to be invoked when the event occurs
     */
    this.removeEventListener = function (evt, handler) {
        qnx.webplatform.getController().removeEventListener(evt, handler);
    };

    /**
     * @description Allows an event type to be handled as a send event.  Must be done before creating WebViews.
     * @param {String} evt The event type to be handled as a send event
     */
    this.defineSendEvent = internal.defineSendEvent;

    /**
     * @description Sets size of the application.
     * @param {Number} width Width of the application.
     * @param {Number} height Height of the application.
     * @param {Number} angle Angle of desired orientation.
     */
    this.setWindowSize = function (width, height, angle) {
        qnx.callExtensionMethod('applicationWindow.setSize', width, height, angle);
    };

    /**
     *@description An application gets 3 seconds to terminate after receiving the onExit message. Each time the message is sent, the application will receive another 2 seconds before its terminated so it can be called in a loop during the
     */
    this.extendTerminate = function () {
        qnx.callExtensionMethod('application.extendTerminate');
    };

    /**
     *@description Use this method to reply to onPooled event. An application must reply to the onPooled event to indicated that it wants to be pooled. If there is no response within 1 second, the application will be terminated.
     */
    this.setPooled = function () {
        qnx.callExtensionMethod('application.setPooled');
    };

    /**
     *@description Query the lockstate.
     *@param callback will return with the value of state - The state can be notLocked | screenLocked | passwordLocked.
     */
    this.isDeviceLocked = function (callback) {
        var listener = function (state) {
            callback(state);
            qnx.webplatform.getApplication().removeEventListener('application.isDeviceLocked', listener);
        };
        qnx.webplatform.getApplication().addEventListener('application.isDeviceLocked', listener);
        qnx.callExtensionMethod('application.isDeviceLocked');
    };

     /**
     *@description Update the cover.
     *@param {Object} cover - describing the cover to display.
     * "cover":{
     *       "type":"snapshot|file|alternate|live" // live requires special permissions.
     *       "capture":{"x":0,"y":0,"width":100,"height":200}}, //needed in the case type is snapshot.
     *       "path": "/some/awesome/path/file.jpg", // needed in the case type is file
     *       "text":[
     *         {"label":"Label", "size":3}]  // An array of objects describing strings to draw on the label. The navigator will choose the amount of text that will fit.
     *                                       //takes in label, size, color, wrap - color is HEX string like #FFFFFF, wrap is a boolean value
     *       "transition":"default",         //transition Valid transitions are: default, slide, fade, none. specifies the transition used when changing to the new cover
     *       "badges":true                   // A Boolean value that specifies if badges should be shown over the cover or not.
     *   }
     */
    this.updateCover = function (cover) {
        qnx.callExtensionMethod('application.updateCover', JSON.stringify(cover));
    };

    this.invocation = invocation;
};

Application.prototype.cards = {

    /**
    * @namespace
    * @name mediaplayerPreviewer
    * @memberOf Application.cards
    * @description Used to invoke the media player card
    */
    mediaplayerPreviewer: require("./cards/mediaplayer"),

    /**
    * @namespace
    * @name filePicker
    * @memberOf Application.cards
    * @description Used to invoke native file picker Cascades card
    */
    filePicker: require("./cards/file"),

    /**
    * @namespace
    * @name camera
    * @memberOf Application.cards
    * @description Used to invoke native camera Cascades card
    */
    camera: require("./cards/capture"),

    email: {

        /**
         * @namespace
         * @name composer
         * @memberOf Application.cards.email
         */
        composer : require('./cards/emailComposer')
    },

    calendar: {

        /**
         * @namespace
         * @name picker
         * @memberOf Application.cards.calendar
         */
        picker : require('./cards/calendarPicker'),

        /**
         * @namespace
         * @name composer
         * @memberOf Application.cards.calendar
         */
        composer: require('./cards/calendarComposer')
    },

    /**
    * @namespace
    * @name icsViewer
    * @memberOf Application.cards
    * @description Used to invoke ICS Viewer card
    */
    icsViewer: require("./cards/ics")
};

module.exports = Application;

});

define('menuService', function (require, exports, module) {
/*
 * Copyright 2012 Research In Motion Limited.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var self,
    pps = require('./pps/pps'),
    menuControl,
    callbacks = {},
    globalId = 0;

function generateId() {
    var id = globalId++;
    if (!window.isFinite(id)) {
        globalId = 0;
        id = 0;
    }
    return id.toString();
}

function handleError() {
    for (var id in callbacks) {
        callbacks[id](null, self.MENU_SERVICE_FAILURE_ERROR);
    }
    callbacks = {};
}

function handleNewData(data) {
    var response = data.control,
        inherited,
        id,
        callback;
    if (response.hasOwnProperty('res') && response.res === 'getMenuItems') {
        inherited = response.dat ? response.dat["inherited-target"] : undefined;
        id = response.id;
        callback = callbacks[id];
        delete callbacks[id];
        if (callback) {
            callback(inherited, response.dat, response.err);
        }
    } else {
        handleError();
    }
}

/**
 * @namespace A javascript wrapper of the Menu Service
 * @name menuService
 * @description This module must be included on your own through the use of require('./menuService') or something similar
 *              it does not sit on a publicly accessible namespace. The module is used by the CCM and Invocation List plugins
 *              in WebPlatform currently.
 */
self = {

    /**
     * @description A constant that describes the menu service failure
     * @constant
     * @name MENU_SERVICE_FAILURE_ERROR
     * @memberOf menuService
     */
    MENU_SERVICE_FAILURE_ERROR: 'MENU_SERVICE_FAILURE_ERROR',

    /**
     * @description getMenuItems returns the menu items from the menu service required for the specific request. These items correspond to the specific actions that the platform provides for Sharing, SetAs, or OpenIn etc.
     * @param {Object} request A JSON request object containing the proper request fields for the menu service
     * @param {String} request.action A string representing the action can be one of the bb.action.VIEW/SHARE/OPEN etc
     * @param {String} request.uri A valid uri with protocol of the type tel:124124124 or http://rim.com
     * @param {String} request.target_type An invocation target type defined in the invocation.TARGET_TYPE_* definition
     * @param {Function} error An error callback to be triggered on error
     * @memberOf menuService
     * @name getMenuItems
     * @example
     * var request = {
     *   action: action,
     *   mime: mime-type,
     *   uri: URI,
     *   data: base64 encoded data,
     *   target_type_mask: one of invocation target types,
     *   perimeter: perimeter name
     * };
     *
     * var return_structure = {
     *   title: title to describe the items,
     *   title-sub: secondary title,
     *   title-icon1: URI of the primary icon,
     *   title-icon2: URI of the secondary icon,
     *   items:
     *   [
     *     {
     *       icon: URI of menu item icon,
     *       label: localized menu item label,
     *       label-sub1: optional secondary label,
     *       label-sub2: optional tertiary label,
     *       invoke:
     *       {
     *         type: one of invocation target types,
     *         target: invocation target,
     *         action: action,
     *         mime: mime-type,
     *         uri: URI,
     *         data: base64 encoded data
     *         perimeter: perimeter name
     *       },
     *       children:
     *       {
     *         * recursive structure...
     *       }
     *     }
     *     ...
     *   ]
     * };
     *
     * var menuService = require('lib/menuService'),
     *     request = {
     *         action: 'bb.action.VIEW',
     *         uri: 'tel:14161234567',
     *         target_type: invocation.TARGET_TYPE_CARD
     *     };
     * menuService.getMenuItems(request, function (response, error) {
     *      // Do something exciting here
     *     });
     *
     */
    getMenuItems: function (request, callback) {
        var id;

        if (!menuControl) {
            menuControl = pps.create('/pps/services/menu/control', pps.PPSMode.FULL);
            menuControl.onNewData = handleNewData;
            menuControl.onFirstReadComplete = function () {
                console.log("menu.service: First read complete");
            };
            menuControl.onReadFailed = handleError;
            menuControl.onClosed = handleError;
            menuControl.onOpenFailed = handleError;
            menuControl.onWriteFailed = handleError;
            menuControl.open(pps.FileMode.RDWR);
        }

        id = generateId();
        if (callback) {
            callbacks[id] = callback;
        }
        request['supports-inherited'] = true;
        menuControl.write({msg: 'getMenuItems', id: id, dat: request});
    },
};

module.exports = self;


});

define('ui/contextMenu/actions', function (require, exports, module) {
/*
 * Copyright 2012 Research In Motion Limited.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var _utils = require('./../../utils'),
    _i18n,
    _menuItems,
    _currentContext,
    /* TODO figure out eventing to client webview */
    _event,
    _invocation,
    _application,
    _renderingWebView,
    _clientWebViewId,
    _handlers = {},
    _customHandlers = {},
    _menuServiceItems = {},
    _invocationResults,
    menuActions;


function setCurrentContext(context) {
    _currentContext = context;
}

function showInvocationList(title, items, options) {
    options = options || {};
    var listArgs = JSON.stringify({"title" : title, "targets" : items, "inheritedTargets": options.inheritedTargets});
    _renderingWebView.executeJavaScript("require('invocationlist').show(" + listArgs + ")");
}

// Default context menu response handler
function handleContextMenuResponse(args) {
    var menuAction = args[0];
    qnx.callExtensionMethod('webview.handleContextMenuResponse', _clientWebViewId, menuAction);
}

function loadClientURL(args) {
    var url = args[0];
    qnx.callExtensionMethod('webview.loadURL', _clientWebViewId, url);
}

function downloadURL(args) {
    var url = args[0];
    qnx.callExtensionMethod('webview.downloadURL', _clientWebViewId, url);
}

function saveLinkAs() {
    if (!_currentContext || !_currentContext.url) {
        return;
    }

    var source = _currentContext.url,
        defaultFileName = source.substring(source.lastIndexOf('/') + 1),
        details = {
            mode: _application.cards.filePicker.MODE_SAVER,
            allowOverwrite: true,
        },
        options = {
            translate : true,
        };

    if (defaultFileName.length !== 0) {
        details.defaultSaveFileNames = [defaultFileName];
    }


    // Invoke the file picker to choose where to save the file
    _application.cards.filePicker.open(details, function (target) {
        if (target) {
            _utils.downloadFile(source, target, function () {
                _renderingWebView.toast.show(_i18n.translate("File successfully saved.").fetch(), options);
            }, function () {
                _renderingWebView.toast.show(_i18n.translate("File could not be saved.").fetch(), options);
            });
        }
    },
    // Don't do anything on cancel, since the user probably did it on purpose.
    null,
    function (error) {
        if (error) {
            _renderingWebView.toast.show(_i18n.translate("Unable to select a file.").fetch(), options);
        } else {
            console.log("invoke success");
        }
    });
}

function openLink() {
    if (!_currentContext || !_currentContext.url) {
        return;
    }
    //Update the content web view with the new URL
    loadClientURL([_currentContext.url]);
}

function generateDataFilePath(source, baseDir) {
    var mimeType = 'image/png',
        standardFileName = 'image',
        ending;

    //Parse the data URI
    if (source.indexOf(';') !== -1) {
        mimeType = source.substring(5, source.indexOf(';'));
    } else if (source.indexOf(',') !== -1) {
        mimeType = source.substring(5, source.indexOf(','));
    } // Default to png as per above

    ending = _utils.fileEndingByMIME(mimeType);
    ending = ending ? ending[0] : ending;

    return (baseDir ? baseDir : '') + standardFileName + '.' + ending;
}


function saveImage() {
    // Ensure we have a proper context of the image to save
    if (!_currentContext || !_currentContext.isImage || !_currentContext.src) {
        return;
    }

    var source     = _currentContext.src,
        details    = {
            mode: _application.cards.filePicker.MODE_SAVER,
            allowOverwrite: true,
            defaultType : _application.cards.filePicker.TYPE_PICTURE,
            defaultSaveFileNames : [source.substring(source.lastIndexOf('/') + 1)],
        },
        options = {
            translate : true,
        },
        displayMessage;

    if (_utils.isDataUrl(source)) {
        details.defaultSaveFileNames = [generateDataFilePath(source)];
    }
        // Invoke the file picker to choose where to save the file
    _application.cards.filePicker.open(details, function (target) {
        if (target) {
            _utils.downloadFile(source, target, function () {
                _renderingWebView.toast.show(_i18n.translate("File successfully saved.").fetch(), options);
            }, function () {
                _renderingWebView.toast.show(_i18n.translate("File could not be saved.").fetch(), options);
            });
        }
    },
    // Don't do anything on cancel, since the user probably did it on purpose.
    null,
    function (error) {
        if (error) {
            displayMessage = "{'dialogType' : 'JavaScriptAlert', 'title': 'File Picker Error', 'message' : 'Could not open file picker.'}";
            _renderingWebView.executeJavaScript("require('dialog').show(" + displayMessage + ")");
        } else {
            console.log("invoke success");
        }
    });
}

/*
 * viewImage functon will invoke the picture viewer based on the current context url
 * if the url is local, it will use a standard box-2-box invoke, if remote, it will
 * save the file prior to invoking the picture viewer.
 */
function viewImage() {

    if (!_currentContext || !_currentContext.isImage || !_currentContext.src) {
        return;
    }
    var source = _currentContext.src,
        home   =  "/" + _application.getEnv("HOME").replace(/^\/*/, '') + "/../tmp/",
        target =  home + source.replace(/^.*[\\\/]/, ''),
        invokeRequest =  {
            action : "bb.action.VIEW",
            uri : ""
        };

    if (_utils.isDataUrl(source)) {
        target = generateDataFilePath(source, home);
    }

    if (_utils.isLocalUrl(source)) {
        invokeRequest.uri = source;
        _invocation.invoke(invokeRequest, function (error, response) {
            if (error) {
                console.log(error);
            }
        });
    } else {
        _utils.downloadFile(source, target, function (path) {
            invokeRequest.uri = path;
            _invocation.invoke(invokeRequest, function (error, response) {
                if (error) {
                    console.log(error);
                }
            });
        }, function (error) {
            console.log(error);
        });
    }
}

function responseHandler(menuAction) {
    if (!menuAction) {
        return;
    }
    handleContextMenuResponse([menuAction]);
}

function addCustomItem(actionId, itemHandler) {
    if (actionId) {
        _customHandlers[actionId] = itemHandler;
        return true;
    }
    return false;
}

function removeCustomItem(actionId) {
    if (_customHandlers[actionId]) {
        delete _customHandlers[actionId];
    }
}

function clearMenuServiceItems() {
    _menuServiceItems = {};
}

function clearCustomHandlers() {
    _customHandlers = {};
}

function addMenuServiceItem(item) {
    if (item.actionId) {
        _menuServiceItems[item.actionId] = item;
    }
}

function menuServiceHandler(item) {
    var request = {};
    // We got multiple children so let's pass them to the invocation list
    if (item.children) {
        showInvocationList(item.label, item.children.items, {inheritedTargets: item["inherited-target"]});
    } else {
        request = item.invoke;
    }

    window.qnx.webplatform.getApplication().invocation.invokeHack(request, function () {
        console.log("executing menu item action: " + request);
    });
}

function runHandler(actionId, source) {
    if (_customHandlers[actionId]) {
        _customHandlers[actionId](actionId, source);
    } else if (_handlers[actionId]) {
        _handlers[actionId](actionId);
    } else if (actionId.indexOf('MenuService-') !== -1 && _menuServiceItems[actionId]) {
        menuServiceHandler(_menuServiceItems[actionId]);
    }
}

_handlers = {
    'Cancel'         : responseHandler,
    'ClearField'     : responseHandler,
    'Cut'            : responseHandler,
    'Copy'           : responseHandler,
    'Paste'          : responseHandler,
    'Select'         : responseHandler,
    'SelectAll'      : responseHandler,
    'CopyLink'       : responseHandler,
    'OpenLink'       : openLink,
    'SaveLinkAs'     : saveLinkAs,
    'CopyImageLink'  : responseHandler,
    'SaveImage'      : saveImage,
    'ViewImage'      : viewImage,
    'InspectElement' : responseHandler
};

function init(renderingWebView) {
    _renderingWebView = renderingWebView;
    _application = qnx.webplatform.getApplication();
    _invocation = _application.invocation;
    _i18n = _utils.i18n();
}

function setClientWebView(webviewId) {
    _clientWebViewId = webviewId;
}

menuActions = {
    init: init,
    setClientWebView: setClientWebView,
    handlers: _handlers,
    addMenuServiceItem: addMenuServiceItem,
    clearMenuServiceItems: clearMenuServiceItems,
    runHandler: runHandler,
    clearCustomHandlers: clearCustomHandlers,
    setCurrentContext: setCurrentContext,
    addCustomItem: addCustomItem,
    removeCustomItem: removeCustomItem
};

menuActions.__defineSetter__('invocationResults', function (val) {
    _invocationResults = val;
});

module.exports = menuActions;

});

define('ui/contextMenu/index', function (require, exports, module) {
/*
 * Copyright 2012 Research In Motion Limited.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


/**
 * @class Used to display and customize context menus
 * @description Used to display and customize context menus
 * @name UIWebView.contextMenu
*/

var contextmenu,
    _utils = require('./../../utils'),
    _actions = require('./actions'),
    _controller,
    _renderingWebView,
    _menuItems,
    _currentContext,
    _parsedContext,
    _customContextItems = {},
    _overrides = {},
    _disabledPlatformItems = {},
    _menuActions,
    _invocation,
    _application,
    _i18n,
    _menuService = require("./../../menuService"),
    contextMenuEnabled = true,
    _customContextOptions = {},
    CONTEXT_ALL = 'ALL',
    CONTEXT_LINK = 'LINK',
    CONTEXT_IMAGE_LINK = 'IMAGE_LINK',
    CONTEXT_IMAGE = 'IMAGE',
    CONTEXT_TEXT = 'TEXT',
    CONTEXT_INPUT = 'INPUT',
    headText,
    subheadText;


function setMenuOptions(options) {
    _menuItems = options;
}

function parseWebWorksContext(context) {
    try {
        return JSON.parse(context.webWorksContext);
    } catch (error) {
        console.log("Not a valid WebWorks JSON context. Treating context as a string.");
        return  { type : context.webWorksContext};
    }
}

function generateMenuItems(menuItems, cb) {

/*
    With having to check for invocation query targets, pushing of the menu items is no longer sync since the
    querying is async. To mitigate this, callbacks are queued and run from start to finish.
 */

    var items = [],
        hasCancel = false,
        jobQueue = [],
        i,
        addItem = function (obj, callback) {
            items.push(obj);
            callback();
        };

    for (i = 0; i < menuItems.length; i++) {
        switch (menuItems[i]) {
        case 'ClearField':
            jobQueue.push({
                func: addItem,
                args: [{'label': _i18n.translate('Clear Field').fetch(), 'actionId': 'ClearField', 'icon': 'platform:///ui-resources/assets/contextmenu.png'}]
            });
            break;
        case 'SendLink':
            break;
        case 'SendImageLink':
            break;
        case 'FullMenu':
            break;
        case 'Delete':
            break;
        case 'Cancel':
            jobQueue.push({
                func: addItem,
                args: [{'label': _i18n.translate('Dismiss Selection').fetch(), 'actionId': 'Cancel', 'icon': 'platform:///ui-resources/assets/contextmenu.png', 'isPinned': true}]
            });
            hasCancel = true;
            break;
        case 'Cut':
            jobQueue.push({
                func: addItem,
                args: [{'label': _i18n.translate('Cut').fetch(), 'actionId': 'Cut', 'icon': 'platform:///ui-resources/assets/contextmenu.png'}]
            });
            break;
        case 'Copy':
            jobQueue.push({
                func: addItem,
                args: [{'label': _i18n.translate('Copy').fetch(), 'actionId': 'Copy', 'icon': 'platform:///ui-resources/assets/contextmenu.png'}]
            });
            break;
        case 'Paste':
            jobQueue.push({
                func: addItem,
                args: [{'label': _i18n.translate('Paste').fetch(), 'actionId': 'Paste', 'icon': 'platform:///ui-resources/assets/contextmenu.png'}]
            });
            break;
        case 'SelectAll':
            jobQueue.push({
                func: addItem,
                args: [{'label': _i18n.translate('Select All').fetch(), 'actionId': 'SelectAll', 'icon': 'platform:///ui-resources/assets/contextmenu.png'}]
            });
            break;
        case 'Select':
            jobQueue.push({
                func: addItem,
                args: [{'label': _i18n.translate('Select').fetch(), 'actionId': 'Select', 'icon': 'platform:///ui-resources/assets/contextmenu.png'}]
            });
            break;
        case 'AddLinkToBookmarks':
            break;
        case 'CopyLink':
            jobQueue.push({
                func: addItem,
                args: [{'label': _i18n.translate('Copy Link').fetch(), 'actionId': 'CopyLink', 'icon': 'platform:///ui-resources/assets/contextmenu.png'}]
            });
            break;
        case 'OpenLinkInNewTab':
            break;
        case 'OpenLink':
            break;
        case 'SaveLinkAs':
            jobQueue.push({
                func: addItem,
                args: [{'label': _i18n.translate('Save Link As').fetch(), 'actionId': 'SaveLinkAs', 'icon': 'platform:///ui-resources/assets/contextmenu.png'}]
            });
            break;
        case 'SaveImage':
            jobQueue.push({
                func: addItem,
                args: [{'label': _i18n.translate('Save Image').fetch(), 'actionId': 'SaveImage', 'icon': 'platform:///ui-resources/assets/contextmenu.png'}]
            });
            break;
        case 'CopyImageLink':
            jobQueue.push({
                func: addItem,
                args: [{'label': _i18n.translate('Copy Image Link').fetch(), 'actionId': 'CopyImageLink', 'icon': 'platform:///ui-resources/assets/contextmenu.png'}]
            });
            break;
        case 'ViewImage':
            jobQueue.push({
                func: addItem,
                args: [{'label': _i18n.translate('View Image').fetch(), 'actionId': 'ViewImage', 'icon': 'platform:///ui-resources/assets/contextmenu.png'}]
            });
            break;
        case 'Search':
            break;
        case 'ShareLink':
            // Now handled through the menu service
            break;
        case 'ShareImage':
            break;
        case 'InspectElement':
            jobQueue.push({
                func: addItem,
                args: [{'label': _i18n.translate('Inspect Element').fetch(), 'actionId': 'InspectElement', 'icon': 'platform:///ui-resources/assets/contextmenu.png'}]
            });
            break;
        }
    }

    if (!hasCancel) {
        jobQueue.push({
            func: addItem,
            args: [{'label': _i18n.translate('Cancel').fetch(), 'actionId': 'Cancel', 'icon': 'platform:///ui-resources/assets/contextmenu.png', 'isPinned': true}]
        });
    }


    headText = undefined;
    subheadText = undefined;
    if (_currentContext) {
        if (_currentContext.isWebWorksContext) {
            _parsedContext = parseWebWorksContext(_currentContext);
        }

        if (_parsedContext && (_parsedContext.header || _parsedContext.subheader)) {
            headText = _parsedContext.header;
            subheadText = _parsedContext.subheader;
            _parsedContext = undefined;
        } else if (_currentContext.url) {
            headText = _currentContext.text;
            subheadText = _currentContext.url;
        } else if (_currentContext.text) {
            subheadText = _currentContext.text;
        } else if (_currentContext.alt) {
            subheadText = _currentContext.alt;
        } else if (_currentContext.src) {
            subheadText = _currentContext.src;
        }

        headText = headText || 'Selection';
    }

    // Execute pushing of items as a series since theres an async task in there
    _utils.series(jobQueue, {
        func: cb,
        args: [items]
    });
}

function safeEval(jsonString) {
    return JSON.parse('{"obj":' + jsonString + '}').obj;
}

/**
 * @name UIWebView.contextMenu#addItem
 * @function
 * @description Adds a menu item to the context menu. Will overwrite any menu item
 * with the same action ID.
 * @param {function} success Executed on success
 * @param {function} fail Executed on failure
 * @param {Object} args Arguments object
 * @param {String[]} args.contexts List of contexts where the item should be added
 * @param {Object} args.action Object describing the item to add
 * @param {String} args.action.actionId Id of the menu item
 * @param {String} args.action.label Text label of the menu item
 * @param {String} args.action.icon URL to the icon image of the menu item
 * @param {function} args.handler Function to execute when the menu item is activated
*/
function addItem(success, fail, args, env) {
    var contexts = args.contexts,
        action = args.action,
        handler = args.handler,
        contextKey,
        context;

    // At very least we need an actionId and a valid function to do anything.
    // We don't require a label or icon since they could be overridding a platform
    if ((action.actionId || action.actionId !== '') && (typeof handler === 'function')) {
        _actions.addCustomItem(action.actionId, handler);
    } else {
        return fail('You must provide a valid actionId');
    }

    for (contextKey in contexts) {
        if (contexts.hasOwnProperty(contextKey)) {
            context = contexts[contextKey];
            if (!_customContextItems[context]) {
                _customContextItems[context] = {};
            }
            _customContextItems[context][action.actionId] = action;
        }
    }

    success();
}

function removeItemFromAllContexts(actionId) {
    var context;

    for (context in _customContextItems) {
        if (_customContextItems[context][actionId]) {
            delete _customContextItems[context][actionId];
        }
    }
}

/**
 * @name UIWebView.contextMenu#removeItem
 * @function
 * @description Removes a previously added menu item from the context menu.
 * @param {function} success Executed on success
 * @param {function} fail Executed on failure
 * @param {Object} args Arguments object
 * @param {String[]} args.contexts List of contexts where the item should be removed
 * @param {String} args.actionId ID of the menu item
*/
function removeItem(success, fail, args, env) {
    var contexts = args.contexts,
        actionId = args.actionId,
        item,
        context;

    for (item in contexts) {
        context = contexts[item];
        if (context === CONTEXT_ALL) {
            removeItemFromAllContexts(actionId);
            break;
        } else {
            if (_customContextItems[context]) {
                delete _customContextItems[context][actionId];
            } else {
            }
        }
    }
    _actions.removeCustomItem(actionId);
    success();
}

/**
 * @name UIWebView.contextMenu#defineCustomContext
 * @function
 * @description Allows the developer to define a custom context.
 * @param {String} context A String representing the custom context.
 * @param {Object} options An Object that contains the various options to set for the custom context.
 * @param {Array} options.includeContextItems An Array that defines a list of contexts to which custom items will be used from when applicable.
 * @param {boolean} options.includePlatformItems An boolean indicating whether to include the default platform items.
 * @param {boolean} options.includeMenuServiceItems An boolean indicating whether to add menu items provided by the menu service.
 * &lt;script type="text/javascript"&gt;
 *
 * function defineCustomContext() {
 *     var options = {
 *         includeContextItems: ["IMAGE"],//Includes custom items added for IMAGE
 *         includePlatformItems: true,
 *         includeMenuServiceItems: true,
 *         pinnedItemId: 'CustomId'
 *     };
 *
 *     uiWebView.contextMenu.defineCustomContext("myContext", options)
 * }
 * &lt;/script&gt;
 *
 */
function defineCustomContext(context, options) {
    if (context && options) {
        _customContextOptions[context] = options;
    }
}

function isTextInput(context) {
    return context && context.text && !context.url;
}

function isTypeOfText(context) {
    return context && context.text;

}

function isTypeOfImage(context) {
    return context && context.isImage;
}

function isTypeOfWebWorksContext(context) {
    return context && context.isWebWorksContext;
}

function determineContext(currentContext) {
    if (currentContext.url && !currentContext.isImage) {
        return CONTEXT_LINK;
    }

    if (currentContext.url && currentContext.isImage) {
        return CONTEXT_IMAGE_LINK;
    }

    if (currentContext.isImage) {
        return CONTEXT_IMAGE;
    }

    if (currentContext.isInput) {
        return CONTEXT_INPUT;
    }

    if (currentContext.text) {
        return CONTEXT_TEXT;
    }
}

/**
 * @name UIWebView.contextMenu#disablePlatformItem
 * @function
 * @description Removes a platform provided menu item from the context menu
 * @param {String} context Context in which the menu item should be removed
 * @param {String} actionId Action ID of the item to remove. Action ID of "MenuService" is used to disable all menu service items.
 * @return {Boolean}
 */
function disablePlatformItem(context, actionId) {
    var pushIndex;

    // Initialize if needed
    _disabledPlatformItems[context] = _disabledPlatformItems[context] || [];
    pushIndex = _disabledPlatformItems[context].indexOf(actionId) === -1 ? _disabledPlatformItems[context].push(actionId) : null;
    return !!pushIndex;
}

/**
 * @name UIWebView.contextMenu#enablePlatformItem
 * @function
 * @description Restores a disabled platform provided menu item in the context menu
 * @param {String} context Context in which the menu item should be restored
 * @param {String} actionId Action ID of the item to restore. Action ID of "MenuService" is used to enable all menu service items.
 * @return {Boolean}
*/
function enablePlatformItem(context, actionId) {
    var index;
    if (_disabledPlatformItems[context]) {
        index = _disabledPlatformItems[context].indexOf(actionId);
        if (index !== -1) {
            _disabledPlatformItems[context].splice(index, 1);
            return true;
        }
    }
    return false;
}

/**
 * @name UIWebView.contextMenu#listDisabledPlatformItems
 * @function
 * @description Lists the disabled platform provided menu items
 * @return {Object} List of contexts and their disabled platform items
 */
function listDisabledPlatformItems() {
    return _disabledPlatformItems;
}

function removeDisabledPlatformItems(items, currentContext) {
    var context = determineContext(currentContext),
        actionIdsToRemove = _disabledPlatformItems[context] || [];

    // Include items to be removed from all contexts
    actionIdsToRemove = actionIdsToRemove.concat(_disabledPlatformItems[CONTEXT_ALL] || []);

    if (actionIdsToRemove.length > 0) {
        items = items.filter(function (item) {
            if (actionIdsToRemove.indexOf(item.actionId) !== -1) {
                return false;
            } else if (/^MenuService/.test(item.actionId) && actionIdsToRemove.indexOf('MenuService') !== -1) {
                return false;
            } else {
                return true;
            }
        });
    }
    return items;
}

/**
 * @name UIWebView.contextMenu#activateContextMenu
 * @function
 * @description Activates the contextMenu and creates menu items by passing in the items object
 * @param {Object} items The menu items objects that needs to be in contextMenu
 */
function activateContextMenu(items) {
    var args,
        webworksContext = parseWebWorksContext(_currentContext),
        pinnedItemId,
        header = {
            headText : headText,
            subheadText : subheadText
        },
        hasActionItems = function (items) {
            return items.some(function (item) {
                return item && item.actionId && item.actionId !== "Cancel";//Dont count the default cancel item
            });
        };

    // Set the pinnedItemId if it exists from the custom context
    if (_customContextOptions[webworksContext.type]) {
        pinnedItemId = _customContextOptions[webworksContext.type].pinnedItemId;
    }

    if (items && Array.isArray(items) && hasActionItems(items)) {

        args = JSON.stringify({'menuItems': items, '_currentContext': _currentContext, 'header' : header, 'pinnedItemId' : pinnedItemId});
        _renderingWebView.executeJavaScript("require('contextmenu').activate(" + args + ")");
    }
}

function addMenuServiceItems(items, context, callback) {
    var request = {};

    if (isTypeOfImage(context)) {
        request.uri = _utils.translatePath(context.src);
        request.metadata = JSON.stringify({subject: context.text}) + '\n';
    } else if (isTypeOfText(context)) {
        if (context.url) {
            request.uri = _utils.translatePath(context.url);
            request.metadata = JSON.stringify({subject: context.text}) + '\n';
        } else {
            request.mime = 'text/plain';
            request.data = _utils.base64Encode(context.text);
        }
    }

    _menuService.getMenuItems(request, function (inherited, response, error) {
        var responseItems,
        item,
        inheritedTargets,
        last2Items,
        i;

        if (error) {
            console.log(error);
        } else {

            if (response && response.hasOwnProperty('items')) {
                responseItems = response.items;
            } else {
                responseItems = [];
            }

            for (i = 0; i < responseItems.length; i++) {
                // no share menu item for local, file scheme
                if (!_utils.isLocalURI(_utils.parseURI(context.url))) {
                    item = {
                        'label'   : responseItems[i].label,
                        'actionId': 'MenuService-' + i,
                        'icon': "file://" + responseItems[i].icon
                    };
                    // Need unique object per response item
                    inheritedTargets = _utils.copy(inherited);
                    if (responseItems[i].action) {
                        inheritedTargets.action = responseItems[i].action;
                    }

                    // Contains .children, or .invoke
                    if (responseItems[i].children) {
                        item.children = responseItems[i].children;
                        item["inherited-target"] = inheritedTargets;
                    } else {
                        item.invoke = inheritedTargets ? _utils.mixin(inheritedTargets, responseItems[i].invoke) : responseItems[i].invoke;
                        if (!item.invoke.uri) {
                            item.invoke.uri = _utils.translatePath(request.uri);
                        }
                    }

                    //Now add an item to the menu service for invocation later
                    _actions.addMenuServiceItem(item);

                    // Currently the delete item is in the last two items
                    // insert new item before delete item
                    last2Items = items.slice(-2);
                    if (last2Items && last2Items[0].isPinned) {
                        items.splice(-2, 0, item);
                    } else if (last2Items && last2Items[1].isPinned) {
                        items.splice(-1, 0, item);
                    }
                }
            }
        }
        callback(items);
    });
}

/**
 * @name UIWebView.contextMenu#overrideItem
 * @function
 * @description Overrides a platform context menu item based on the actionId of the menu item,
 *              relies on the sender to know the correct actionId.
 * @param {Object} item item to be overridden, includes label, and actionId
 * @param {String} item.actionId The actionId to be overridden
 * @param {String} [item.label] The label of the menu item to be displayed to the user
 * @param {String} [item.icon] Path to an icon to be displayed accompanying the overridden platform item
 * @return {Boolean}
 */
function overrideItem(item, handler) {

    // Store the item
    _overrides[item.actionId] = item;

    //Override the handler
    if ((item.actionId && item.actionId !== '') && (typeof handler === 'function')) {
        _actions.addCustomItem(item.actionId, handler);
        return true;
    }

    return false;
}

/**
 * @description Clears the override of a particular platform item. If a user wishes to
 *              no longer override a platform item they can call this function to clear it.
 * @param {String} actionId The platform actionId that will be cleared of any overriding menu item.
 * @return {Boolean}
 */
function clearOverride(actionId) {
    if (actionId && _overrides[actionId]) {
        _actions.removeCustomItem(actionId);
        delete _overrides[actionId];
        return true;
    }
    return false;
}

function addOverridingItems(items) {
    var index,
        actionId;
    for (index = 0; index < items.length; index++) {
        actionId = items[index].actionId;
        if (_overrides[actionId]) {
            // We are overriding the system platform menu item
            items[index].label = _overrides[actionId].label ? _overrides[actionId].label : items[index].label;
            items[index].icon = _overrides[actionId].icon ? _overrides[actionId].icon : items[index].icon;
        }
    }
}

function addCustomItemsForContext(items, context) {
    var customContextItems = _customContextItems[context],
        actionId;

    if (customContextItems) {
        for (actionId in customContextItems) {
            if (customContextItems.hasOwnProperty(actionId)) {
                items.unshift(customContextItems[actionId]);
            }
        }
    }
}

function addCustomItems(menuItems, currentContext) {
    var webworksContext = parseWebWorksContext(_currentContext),
        processCustomItems = function (menuItems, contextType) {
            if (isTypeOfWebWorksContext(currentContext)) {
                if (_customContextOptions[webworksContext.type]) {
                    var includeContextItems = _customContextOptions[webworksContext.type].includeContextItems;

                    if (includeContextItems && includeContextItems.indexOf(contextType) !== -1) {
                        addCustomItemsForContext(menuItems, contextType);
                    }
                }
            } else {
                addCustomItemsForContext(menuItems, contextType);
            }
        };

    // Add ALL
    addCustomItemsForContext(menuItems, CONTEXT_ALL);

    if (isTypeOfWebWorksContext(currentContext)) {
        //Custom contexts are stored by context name
        addCustomItemsForContext(menuItems, webworksContext.type);
    }

    if (currentContext) {
        processCustomItems(menuItems, determineContext(currentContext));
    }
}

function restoreDefaultMenu() {
    _customContextItems = {};
    _actions.clearCustomHandlers();
    _disabledPlatformItems = {};
}

function subscribeTo(webview) {

    // Unwrap any WebWorks WebView wrapper objects
    webview = typeof(webview.getWebViewObj) === "function" ? webview.getWebViewObj() : webview;

    _actions.setClientWebView(webview.id);

    webview.onPropertyCurrentContextEvent = function (value) {
        _currentContext = JSON.parse(value);
        _actions.setCurrentContext(_currentContext);
    };

    webview.onContextMenuCancelEvent = function (value) {
        if (contextMenuEnabled) {
            _renderingWebView.executeJavaScript("require('contextmenu').hideContextMenu()");
        }
    };

    webview.onContextMenuRequestEvent = function (value) {
        var menu = JSON.parse(value),
            webworksContext = parseWebWorksContext(_currentContext),
            includePlatformItems = !isTypeOfWebWorksContext(_currentContext) || (_customContextOptions[webworksContext.type] && _customContextOptions[webworksContext.type].includePlatformItems),
            callback = function (items) {
                // Called after addMenuServiceItems to allow disabling of menu service items
                items = removeDisabledPlatformItems(items, _currentContext);

                //NOTE: addCustomItems must be called after addMenuServiceItems so it can override menu service items.
                addCustomItems(items, _currentContext);
                addOverridingItems(items);
                activateContextMenu(items);
            };

        // Always clear out previous invocation targets before re-generating menu items
        _actions.invocationResults = [];

        if (contextMenuEnabled) {
            //Remove all platform items for custom contexts, if the includePlatformItems option wasn't set
            if (!includePlatformItems) {
                menu.menuItems = [];
            }

            generateMenuItems(menu.menuItems, function (items) {
                if (contextMenuEnabled) {
                    if (!isTypeOfWebWorksContext(_currentContext) || (_customContextOptions[webworksContext.type] && _customContextOptions[webworksContext.type].includeMenuServiceItems)) {
                        addMenuServiceItems(items, _currentContext, callback);
                    } else {
                        callback(items);
                    }
                }
            });
        }
        return '{"setPreventDefault":true}';
    };
    webview.addEventListener('LocationChange', function () {
        restoreDefaultMenu();
    });

    _controller.publishRemoteFunction('webview.notifyContextMenuCancelled', function () {
        if (webview) {
            webview.notifyContextMenuCancelled();
        }
    });

    _controller.publishRemoteFunction('executeMenuAction', function (args, callback) {
        var actionId = args[0],
            source = parseWebWorksContext(_currentContext);

        // Set the source to actual Id from the given context
        source = source.id;

        if (actionId) {
            _actions.runHandler(actionId, source);
        }
    });
}

/**
 * @name UIWebView.contextMenu#init
 * @function
 * @description Initializes the context menu
 * @param {Object} renderingWebView The WebView to render the context menu. Requires a UIWebView.
 */
function init(renderingWebView) {
    _renderingWebView = renderingWebView;
    _actions.init(renderingWebView);
    _controller = window.qnx.webplatform.getController();
    _application = window.qnx.webplatform.getApplication();
    _invocation = _application.invocation;
    _i18n = _utils.i18n();
}

contextmenu = {
    init : init,
    addItem: addItem,
    removeItem: removeItem,
    overrideItem: overrideItem,
    clearOverride: clearOverride,
    disablePlatformItem: disablePlatformItem,
    enablePlatformItem: enablePlatformItem,
    listDisabledPlatformItems: listDisabledPlatformItems,
    defineCustomContext: defineCustomContext,
    activateContextMenu: activateContextMenu,
    subscribeTo: subscribeTo
};

/**
 * @name UIWebView.contextMenu#enabled
 * @description True if context menu is enabled
 * @return {Boolean}
 */
contextmenu.__defineGetter__("enabled", function () {
    return contextMenuEnabled;
});

contextmenu.__defineSetter__("enabled", function (enabled) {
    contextMenuEnabled = enabled;
});

module.exports = contextmenu;

});

define('ui/dialog/index', function (require, exports, module) {
/*
 *  Copyright 2012 Research In Motion Limited.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @class Used to display dialogs
 * @description Used to display dialogs
 * @name UIWebView.dialog
 */

var _utils = require('./../../utils'),
    _i18n,
     dialog,
    _renderingWebView,
    _controller,
    _clientWebView,
    resultCallback,
    waitHandle,
    _waitHandles = [],
    _locked,
    _pendingDialogs,
    nativeEventId = 'DialogRequested',
    INSECURE_CONTENT_TYPE = 'InsecureSubresourceLoadPolicyConfirm',
    NETWORK_ERROR = "NetworkError",
    DATABASE_QUOTA = "DatabaseQuotaExceeded",
    WEBFILESYSTEM_QUOTA = "WebFileSystemQuotaExceeded",
    MEDIA_ERROR_TYPE = "MediaError";

/**
 * @name UIWebView.dialog#show
 * @function
 * @description Show method that will show a dialog with the provided description
 * @param {Object} description
 * @param {Function} [callback] A callback for sending the dialog result
 */
function show(description, callback) {

    if (!_locked) {
        _locked = true;
        /* Set the callback for sending our result back to the user */
        resultCallback = callback;
        var value = JSON.stringify(description);
        _renderingWebView.executeJavaScript("require('dialog').showDialog(" + value + ")");
    } else {
        // If we are locked, then let's store this for later
        _pendingDialogs.push({description : description, callback : callback});
    }
}

/**
 * @name UIWebView.dialog#result
 * @function
 * @description Result method that is invoked by the UIWebView and should not be called manually
 * @param {Object} value A response object from the dialog
 * @param {Boolean} value.ok True if user selected 'Ok' button from the dialog, and false otherwise.
 * @param {String} value.username The string in text field for username in dialogs
 * @param {String} value.password The string in text field for password in dialogs
 * @param {String} value.oktext The string in text field in dialogs
 * @param {Boolean} value.save True if user selected 'Save' button from the dialog, and false otherwise.
 * @param {Boolean} value.never True if user selected 'Never' button from the dialog, and false otherwise.
 * @param {Boolean} value.cancel True if user selected 'Cancel' button from the dialog, and false otherwise.
 */
function result(value) {

    var pendingDialog;

    if (typeof resultCallback === 'function') {
        resultCallback(value);
    }
    // We were called from the actual Event, so let's resume that
    waitHandle = _waitHandles.shift();
    value.waitHandle = waitHandle;
    if (value && value.ok) {
        _clientWebView.dialogResponse(waitHandle, value.oktext, value.username, value.password);
    } else if (value && value.save) {
        _clientWebView.dialogResponse(waitHandle, "save");
    } else if (value && value.never) {
        _clientWebView.dialogResponse(waitHandle, "never");
    } else if (value && value.cancel) {
        _clientWebView.dialogResponse(waitHandle, "");
    } else {
        // This is the default case, to ensure at all
        // times we resume the client thread just in case our result gets lost
        _clientWebView.dialogResponse(waitHandle, true);
    }

    // Unlock this and see if we have any dialogs waiting to be executed
    _locked = false;

    if (_pendingDialogs.length > 0) {
        pendingDialog = _pendingDialogs.shift();
        show(pendingDialog.description, pendingDialog.callback);
    }
}

/**
 * @name UIWebView.dialog#subscribeTo
 * @function
 * @description Subscribes to the dialog events such as onDialogRequested, onSSLHandshakingFailed,
 *              onGeologcationPermissionRequest, and onUserMediaRequest on the provided WebView object.
 * @param {Object} webview The WebView which will emit dialog events
 */
function subscribeTo(webview) {

    _clientWebView = typeof(webview.getWebViewObj) === "function" ? webview.getWebViewObj() : webview;
    // Subscribe to the onDialog event on the client webview
    webview.onDialogRequested = function (eventArgs) {

        var parsedArgs = JSON.parse(eventArgs);
        if (parsedArgs.hasOwnProperty("waitHandle")) {
            _waitHandles.push(parsedArgs.waitHandle);
        }
        switch (parsedArgs.dialogType) {
        case INSECURE_CONTENT_TYPE:
        case DATABASE_QUOTA:
        case WEBFILESYSTEM_QUOTA:
            _clientWebView.dialogResponse(waitHandle, true);
            break;
        case MEDIA_ERROR_TYPE:
            _clientWebView.dialogResponse(waitHandle, true);
            _controller.dispatchEvent("application.mediaError", [eventArgs]);
            break;
        default:
            show(eventArgs);
        }
        // Return to prevent a duplicate native dialog and wait for the dialog response
        return '{"setWait": true}';
    };

    webview.onSSLHandshakingFailed = function (context) {
        var certificate = JSON.parse(context),
            url = certificate.url,
            msgObj = {
                dialogType : 'SSLCertificateException',
                url : url
            };

        show(msgObj, function (result) {
            if (result.save) {
                // Trusting will save the exception for the webview and continue
                webview.continueSSLHandshaking(certificate.streamId, "SSLActionTrust");
            } else if (result.cancel) {
                // return and do nothing since we don't want to add an exception
                webview.continueSSLHandshaking(certificate.streamId, "SSLActionReject");
            }
        });

    };

    webview.onGeolocationPermissionRequest = function (request) {
        var evt = JSON.parse(request),
            msgObj = {
                dialogType : 'GeolocationPermission',
                url : evt.origin
            },
            invoke = {
                target: 'sys.settings.card',
                uri: 'settings://location'
            },
            application = qnx.webplatform.getApplication(),
            reloadCallback = function (info) {
                webview.reload();
                application.invocation.removeEventListener("childCardClosed", reloadCallback);
            };

        if (evt.showGlobalPermissionRequest) {
            show(msgObj, function (result) {
                if (result.ok) {
                    application.invocation.addEventListener("childCardClosed", reloadCallback);
                    application.invocation.invoke(invoke);
                }
            });
        }
        // Always allow it for us
        webview.allowGeolocation(evt.origin);
        return '{"setPreventDefault": true}';
    };

    webview.onUserMediaRequest = function (eventArgs) {
        var parsedArgs = JSON.parse(eventArgs),
            dialog,
            i,
            cameras = [];

        if (!parsedArgs.cameras || parsedArgs.cameras.length === 0) {
            return;
        }

        function translate(cameraUnit) {
            if (cameraUnit === "CAMERA_UNIT_FRONT") {
                return _i18n.translate("Front").fetch();
            }

            return _i18n.translate("Rear").fetch();
        }

        if (parsedArgs.cameras.length === 1) {
            webview.allowUserMedia(parsedArgs.id, parsedArgs.cameras[0]);
        } else {
            for (i = 0; i < parsedArgs.cameras.length; i++) {
                cameras[i] = translate(parsedArgs.cameras[i]);
            }

            dialog = {
                'dialogType': "CameraSelection",
                'title': _i18n.translate("Camera Selection").fetch(),
                'cameras': cameras
            };
        }
        show(dialog, function (result) {
            if (result.ok) {
                webview.allowUserMedia(parsedArgs.id, parsedArgs.cameras[result.cameraSelectedIndex]);
            }
        });
    };

    _controller.publishRemoteFunction('dialog.result', function (value) {
        result(value[0]);
    });
}

/**
 * @name UIWebView.dialog#init
 * @function
 * @description Initializes the dialog by passing in the rendering WebView
 * @param {Object} renderingWebView The WebView which will render the dialogs
 */
function init(renderingWebView) {
    _renderingWebView = renderingWebView;
    _controller = window.qnx.webplatform.getController();
    _i18n = _utils.i18n();
    _locked = false;
    _pendingDialogs = [];
}

dialog  = {
    show : show,
    subscribeTo : subscribeTo,
    result : result,
    init : init,
};

module.exports = dialog;

});

define('ui/toast/index', function (require, exports, module) {
/*
 * Copyright 2012 Research In Motion Limited.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


/**
 * @class Used to display toasts
 * @description Used to display toasts
 * @name UIWebView.toast
 */

var _application,
    _toast,
    _renderingWebView,
    _callbackHandler,
    _dismissHandler,
    _controller,
    _guid = 0;

/**
 * @name UIWebView.toast#init
 * @function
 * @description Initializes the toast component by passing in the webview to render it in
 * @param {Object} renderingWebView a reference to the webview to render the toast in
 * @param {Int} [toastTimeout] Specify the default value for simple toast time outs
 * @param {Int} [frenchToastTimeout] Specify the default value for french toast time outs
*/
function init(renderingWebView, toastTimeout, frenchToastTimeout) {
    _controller = qnx.webplatform.getController();
    _renderingWebView = renderingWebView;
    _guid = 0;

    _controller.publishRemoteFunction('toast.dismissed', function (args) {
        var toastId = args[0];
        if (toastId) {
            if (_dismissHandler) {
                _dismissHandler(toastId);
            }
        }
    });

    _controller.publishRemoteFunction('toast.callback', function (args) {
        var toastId = args[0];
        if (toastId) {
            if (_callbackHandler) {
                _callbackHandler(toastId);
            }
        }
    });
}

/**
 * @name UIWebView.toast#show
 * @function
 * @description Show method that accepts a message to show in the form of a toast dialog on
 *              screen. Provides facilities to get button clicks and callbacks as well. Will
 *              also create a frenchToast for a complex toast request vs a basic toast.
 * @param {String} message that the use wished to display on screen in the toast
 * @param {Object} [options] Object containing optional paramaters.
 * @param {String} [options.buttonText] Text to be used in the button if proved
 * @param {Boolean} [options.translate] Text to be used in the button if proved
 * @param {Function} [options.callbackHandler] A callback to that will be triggered on button click
 * @param {Function} [options.dismissHandler] A dismiss callback that is triggered when a toast is dismissed
 * @param {Integer} [options.timeout] A timeout value to be used as a maximum value for displaying the toast as visible
 * @return {String} toastId The id of toast message, -1 when there is no message to show.
*/
function show(message, options) {
    var args = {},
        toastId = _guid++;

    // If there is a message only will we do some work otherwise just ignore the API call
    if (message) {
        if (options && options.buttonText) {
            args = options;
            args.message = message;
            args.toastId = toastId;
            // Save the callback functions we want to run later
            _callbackHandler = options.callbackHandler;
            _dismissHandler = options.dismissHandler;
            _renderingWebView.executeJavaScript("require('toaster').createFrenchToast(" + JSON.stringify(args) + ")");
        } else {
            if (options) {
                args = options;
            }
            args.message = message;
            args.toastId = toastId;
            _renderingWebView.executeJavaScript("require('toaster').createBasicToast(" + JSON.stringify(args) + ")");
        }

        return toastId;
    }

    return -1;
}

_toast = {
    init : init,
    show: show,
};

module.exports = _toast;




});

define('ui/invocationlist/index', function (require, exports, module) {
/*
 *  Copyright 2012 Research In Motion Limited.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


/**
 * @class Used to display and invocation lists
 * @description Used to display invocation lists
 * @name UIWebView.invocationlist
 */

var _invocationlist,
    _renderingWebView,
    _controller,
    _invocation,
    _application,
    _invokeCallback,
    _utils = require('../../utils');

/**
 * @name UIWebView.invocationlist#init
 * @function
 * @description Used to initialize the invocation list plugin.
 * @param {Object} renderingWebView The UIWebView which renders the invocation list
 */
function init(renderingWebView) {

    // Set up our invocation component and references
    _renderingWebView = renderingWebView;
    _controller = qnx.webplatform.getController();
    _application = qnx.webplatform.getApplication();
    _invocation = _application.invocation;

    // Publish the callback from the UI layer
    _controller.publishRemoteFunction('invocation.invoke', function (value) {
        var request = value[0];
        _invocation.invokeHack(request, _invokeCallback, true);
    });
}

/**
 * @name UIWebView.invocationlist#show
 * @function
 * @description Show method that will show a card of invocation targets returned
 *              from the query targets results set using the provided request object.
 * @param {Object} request an object that defines the query targets parameter to pass to the show function
 * @param {Function} [invokeCallback] a user defined callback triggered on successful invocation of an item
 * @param {Function} [errorCallback] a user defined callback triggered on error during the query targets
*/
function show(request, title, invokeCallback, errorCallback) {
    var targets = {},
        target,
        i = 0,
        metadata,
        mimeType;
    _invokeCallback = invokeCallback;

    // Allow the client to pass in meta data without changing the
    // method signature
    if (request.hasOwnProperty('metadata')) {
        metadata = request.metadata;
        delete request.metadata;
    }

    if (request.hasOwnProperty('type')) {
        mimeType = request.type;
    }

    if (request.hasOwnProperty('mime')) {
        mimeType = request.mime;
        request.type = request.mime;
        delete request.mime;
    }

    _invocation.queryTargets(request, function (error, results) {
        if (error && errorCallback) {
            errorCallback(error);
        } else {
            // For each target let's build out a well formed invocation
            // object with the SAME structure as a menu service invoke
            // this means we are preserving the bug where type === mime
            // but we will let the invocatoin layer deal with it
            if (results[0].targets) {
                for (i = 0; i < results[0].targets.length ; i++) {
                    // Copy everything in from th request
                    target = _utils.copy(request);

                    // Remove the target_type_mask not used in invoke
                    if (target.target_type_mask) {
                        delete target.target_type_mask;
                    }

                    if (results[0].targets[i].perimeter) {
                        target.perimeter = results[0].targets[i].perimeter;
                    }

                    if (results[0].targets[i].key) {
                        target.target = results[0].targets[i].key;
                    }

                    if (metadata) {
                        target.metadata = metadata;
                    }

                    // Overriding the mime for strange reasons since
                    // this API is used with the menu service standard
                    // that uses a mime type then adjusted by invokeHack
                    if (mimeType) {
                        target.mime = mimeType;
                        if (target.hasOwnProperty('type')) {
                            delete target.type;
                        }
                    }

                    targets[i] = {
                        invoke : target,
                        label : results[0].targets[i].label,
                        icon : results[0].targets[i].icon
                    };
                }
                var args = JSON.stringify({'targets' : targets, 'title' : title});
                _renderingWebView.executeJavaScript("require('invocationlist').show(" + args + ")");

            }
        }
    });
}

/**
 * @name UIWebView.invocationlist#hide
 * @function
 * @description Hide method that hides the invocation list that is currently
 *              shown on screen. No arguments are needed
 */

function hide() {
    if (_renderingWebView) {
        _renderingWebView.executeJavaScript("require('invocationlist').hide()");
    }
}

_invocationlist = {
    show: show,
    hide : hide,
    init: init,
};

module.exports = _invocationlist;

});

define('ui/default/index', function (require, exports, module) {
/*
 * Copyright 2012 Research In Motion Limited.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var _application,
    _renderingWebView,
    _default;

function init(renderingWebView) {
    var args;

    _renderingWebView = renderingWebView;
    _application = window.qnx.webplatform.getApplication();

    _application.addEventListener('application.fontchanged', function (fontStyle, fontSize) {
        args = JSON.stringify({'fontStyle': fontStyle, 'fontSize' : fontSize});
        _renderingWebView.executeJavaScript("require('default').setBodyFont(" + args + ")");
    });
    _application.addEventListener('application.systemLanguageChange', function () {
        _renderingWebView.executeJavaScript("require('default').updateBaseDirection()");
    });
}

function setDefaultFont() {
    var args,
        fontSize,
        fontStyle;
    fontSize = _application.getSystemFontSize();
    fontStyle = _application.getSystemFontFamily();
    args = JSON.stringify({'fontStyle' : fontStyle, 'fontSize' : fontSize});
    _renderingWebView.executeJavaScript("require('default').setBodyFont(" + args + ")");
}

_default = {
    init : init,
    setDefaultFont: setDefaultFont,
};

module.exports = _default;




});

define('ui/childwebviewcontrols/index', function (require, exports, module) {
/*
 * Copyright 2012 Research In Motion Limited.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @class Used to control child WebViews
 * @description Used to control child WebViews
 * @name UIWebView.childwebviewcontrols
 */

var childwebviewcontrols,
    appWebViewProcessId,
    overlayWebView,
    childWebView,
    events = require("./../../events"),
    CHILD_WEBVIEW_CREATED_EVENT = "ChildWebViewCreated",
    CONTROLS_HEIGHT = 111, // height + border
    title = '',
    hasOverlayControlsShown = false,
    hasWebViewLoaded = false,
    isNSeries;

/**
 * @name UIWebView.childwebviewcontrols#showControls
 * @function
 * @description Show the child WebView controls
 */
function showControls() {
    hasOverlayControlsShown = true;
    return overlayWebView.executeJavaScript("require('childwebviewcontrols').show();");
}

/**
 * @name UIWebView.childwebviewcontrols#hideControls
 * @function
 * @description Hide the child WebView controls
 */
function hideControls() {
    hasOverlayControlsShown = false;
    return overlayWebView.executeJavaScript("require('childwebviewcontrols').hide();");
}

/**
 * @name UIWebView.childwebviewcontrols#setTitle
 * @function
 * @description Set the title of the child WebView
 * @param {Object} title The title that needs be set on the child WebView
 */
function setTitle(title) {
    return overlayWebView.executeJavaScript("require('childwebviewcontrols').setTitle(" + JSON.stringify(title) + ");");
}

/**
 * @name UIWebView.childwebviewcontrols#createWebView
 * @function
 * @description Creates a WebView that is in the same process as the parent WebView.
 * @param {Function} [callback] A callback for sending our result back to user when the child WebView is ready
 */
function createWebView(ready) {
    childWebView = window.qnx.webplatform.createWebView({processId: appWebViewProcessId, defaultWebEventHandlers: ['InvokeRequestEvent']}, function () {
        hasWebViewLoaded = true;

        childWebView.addEventListener('PropertyTitleEvent', function (documentTitle) {
            title = documentTitle;
            if (hasOverlayControlsShown) {
                setTitle(title);
            }
        });

        childWebView.visible = true;
        childWebView.setGeometry(0, window.innerHeight, window.innerWidth, window.innerHeight - CONTROLS_HEIGHT);
        childWebView.zOrder = 1;
        childWebView.backgroundColor = 0xFFFFFFFF;

        childWebView.addEventListener('Destroyed', function () {
            title = "";
            hasWebViewLoaded = false;
            hideControls();
            childWebView.delete(function () {
                childWebView = null;
            });
        });

        setTimeout(function () {
            showControls();
            setTitle(title);
            childWebView.animateWindowLocation('Linear', 0.25, 0, window.innerHeight, 0, CONTROLS_HEIGHT, function () {
                childWebView.active = true;
            }, 650);
        }, 250);

        if (ready && typeof ready === 'function') {
            ready();
        }
    });
}

/**
 * @name UIWebView.childwebviewcontrols#back
 * @function
 * @description Moves the child WebView backwards in history
 * */
function back() {
    qnx.callExtensionMethod("webview.goBack", childWebView.id);
}

/**
 * @name UIWebView.childwebviewcontrols#destroy
 * @function
 * @description Destroys the current child WebView
 */
function destroy() {
    if (childWebView) {
        childWebView.destroy();
    }
}

/**
 * @name UIWebView.childwebviewcontrols#open
 * @function
 * @description Opens the provided url in the child WebView
 * @param {String} url The url that will be loaded in the child WebView
 * @param {Function} [callback] A completion callback
 */
function open(url, callback) {
    var complete = function () {
        if (typeof(callback) === 'function') {
            callback();
        }
    };
    if (hasWebViewLoaded) {
        childWebView.url = url;
        complete();
    }
    else {
        createWebView(function () {
            events.emit(appWebViewProcessId, CHILD_WEBVIEW_CREATED_EVENT, [childWebView], {sync : true, return: true });
            childWebView.url = url;
            complete();
        });
    }
}

/**
 * @name UIWebView.childwebviewcontrols#subscribeTo
 * @function
 * @description Subscribes the child WebView to another WebView.
 * @param {Object} appWebView A parent WebView to listen for open window events
 * @param {Boolean} bindOnOpenWindowHandler True to handle the open window event instead of the child window event
 */
function subscribeTo(appWebView, bindOnOpenWindowHandler) {
    var childWindowHandler = function (args) {
        var data = JSON.parse(args);
        open(data.url);
        return JSON.stringify({ setView: '' + childWebView.id });
    };

    appWebViewProcessId = appWebView.processId;

    if (bindOnOpenWindowHandler) {
        appWebView.onOpenWindow = childWindowHandler;
    } else {
        appWebView.onChildWindowOpen = childWindowHandler;
    }
}

/**
 * @name UIWebView.childwebviewcontrols#init
 * @function
 * @description Initializes the child WebView controls by passing in a UIWebView to render it
 * @param {Object} webview A reference to the WebView to render the child WebView controls
 */
function init(webview) {
    isNSeries = (window.screen.height === 720 && window.screen.width === 720);

    if (isNSeries) {
        CONTROLS_HEIGHT = 91;
    }
    var controller = qnx.webplatform.getController();
    overlayWebView = webview;

    // publish remote functions for the UI control bar
    controller.publishRemoteFunction('childWebView.back', function () {
        back();
    });

    controller.publishRemoteFunction('childWebView.destroy', function () {
        destroy();
    });
}

childwebviewcontrols = {
    init: init,
    open: open,
    destroy: destroy,
    subscribeTo: subscribeTo,
    getChildWebView: function () {
        return childWebView;
    }
};

module.exports = childwebviewcontrols;

});

define('ui/formcontrol/index', function (require, exports, module) {
/*
 *  Copyright 2012 Research In Motion Limited.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @class Used to display form controls
 * @description Used to display form controls
 * @name UIWebView.formcontrol
 */

var formcontrol,
    _renderingWebView,
    _clientWebView,
    _controller,
    _created,
    _enabled,
    _currentState = {},
    _position,
    _validFormActions = ["focusPreviousField", "focusNextField", "submitForm"];

/**
 * @name UIWebView.formcontrol#updateState
 * @function
 * @description Updates the current state of the form controls
 * @param {String} option The option to update the position or state of the form control
 */
function update(option) {
    if (_created) {
        if (option === "position") {
            _renderingWebView.executeJavaScript("require('formcontrol').updateVerticalPosition(" + _position + ")");
        } else if (option === "state") {
            _renderingWebView.executeJavaScript("require('formcontrol').update(" + JSON.stringify(_currentState) + ")");
        }
    }
}

/**
 * @name UIWebView.formcontrol#init
 * @function
 * @description Used to initialize the form control plugin
 * @param {Object} renderingWebview The WebView which will render the form controls
 */
function init(renderingWebView) {
    var application = qnx.webplatform.getApplication();
    _renderingWebView = renderingWebView;
    _controller = qnx.webplatform.getController();

    _controller.publishRemoteFunction("formcontrol.sensitivity", function (args) {
        var mode = args[0];
        _renderingWebView.sensitivity = mode;
    });

    _controller.publishRemoteFunction("formcontrol.action", function (args) {
        var action = args[0];
        if (_clientWebView && _validFormActions.indexOf(action) !== -1) {
            qnx.callExtensionMethod("webview." + action, _clientWebView.id);
        }
    });

    application.addEventListener("application.keyboardPosition", function (position) {
        _position = position;
        update("position");
    });

    application.addEventListener("application.keyboardClosing", function () {
        _position = -100;
        update("position");
    });
}

/**
 * @name UIWebView.formcontrol#show
 * @function
 * @description Show method that will show the form controls
 * @param {Boolean} prev The value for the "previous" button in the formcontrol to enable or disable
 * @param {Boolean} next The value for the "next" button in the formcontrol to enable or disable
 */
function show(prev, next) {
    _currentState.enable = true;
    _currentState.previousEnabled = prev;
    _currentState.nextEnabled = next;
    update("state");
}

/**
 * @name UIWebView.formcontrol#subscribeTo
 * @function
 * @description Subscribes to the form control events on the provided WebView
 * @param {Object} webview a WebView which will emit form control events
 */
function subscribeTo(webview) {
    _clientWebView = webview;

    webview.addEventListener("FormControlEvent", function (evt) {
        if (!_created) {
            _renderingWebView.executeJavaScript("require('formcontrol').create()");
            _created = true;
        }
        evt = JSON.parse(evt);
        _currentState.enable = evt.isVisible;
        _currentState.previousEnabled = evt.isPreviousActive;
        _currentState.nextEnabled = evt.isNextActive;
        update("state");
    });
}

formcontrol = {
    init : init,
    subscribeTo : subscribeTo,
    show : show
};

module.exports = formcontrol;

});

define('WebView', function (require, exports, module) {
/*
* Copyright 2010-2011 Research In Motion Limited.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

var WebView,
    events = require('./events'),
    chrome = require('./chrome'),
    internal = require('./chrome/internal'),
    windowAnimations = require('./windowAnimations'),
    rpc = require('./rpc'),
    _callback = false;

/**
 * @class A javascript abstraction of the underlying webkit WebView
 * @param {Object} options Options used by the WebView
 * @param {Number} options.WebViewId specifies the WebView id to use
 * @param {callback} options.onCreate specifies the WebView created callback function
 * @param {Number} options.processId specifies the the process id of the WebView
 */
function WebView(options) {

    var _windowGroup = qnx.callExtensionMethod("webview.applicationWindowGroup", chrome.id),
        //Either should be the input id or create a new webview
        _processId = (options && typeof options.processId === 'number') ? options.processId : 0,
        _defaultSendEventHandlers = (options && options.defaultSendEventHandlers) ? options.defaultSendEventHandlers : [],
        _defaultWebEventHandlers = (options && options.defaultWebEventHandlers) ? options.defaultWebEventHandlers : [],
        _id = (options && options.WebViewId) ? options.WebViewId : parseInt(qnx.callExtensionMethod('webview.create', _windowGroup, _processId), 10),
        _listeners = {},
        _qnxObjectEnabled = false,
        _rpcEnabled = false,
        that = this,
        _webInspectorEnabled = false,
        _inProcessWebInspectorEnabled = false,
        _keyboardVisible = false,
        _uiWebView;

    if (options && options.onCreate) {
        events.on(_id, "Created", options.onCreate);
    }

    /**
     * @name WebView#id
     * @description The id of the WebView. READ ONLY
     * @returns {Number} id
    */
    this.__defineGetter__("id", function () {
        return _id;
    });

    /**
     * @name WebView#windowGroup
     * @description The windowGroup of the WebView. READ ONLY
     * @return {Number} windowGroup
    */
    this.__defineGetter__("windowGroup", function () {
        return _windowGroup;
    });

    /**
     * @name WebView#visible
     * @description Whether the WebView is currently visible
     * @return {Boolean} visible
    */
    this.__defineGetter__("visible", function () {
        return qnx.callExtensionMethod("webview.isVisible", this.id) === "1";
    });

    this.__defineSetter__("visible", function (newVisibility) {
        qnx.callExtensionMethod("webview.setVisible", this.id, !!newVisibility);
    });

    /**
     * @name WebView#pluginsEnabled
     * @description Sets whether plugins are enabled for the WebView
     * @return {Boolean} pluginsEnabled
    */
    this.__defineGetter__("pluginsEnabled", function () {
        return qnx.callExtensionMethod('webview.isEnablePlugins', this.id) === "1";
    });

    this.__defineSetter__("pluginsEnabled", function (pluginsEnabled) {
        qnx.callExtensionMethod('webview.setEnablePlugins', this.id, pluginsEnabled);
    });

    /**
     * @name WebView#active
     * @description Whether the WebView is currently active
     * @return {Boolean} active
    */
    this.__defineGetter__("active", function () {
        return qnx.callExtensionMethod("webview.isActive", this.id);
    });

    this.__defineSetter__("active", function (newActivity) {
        qnx.callExtensionMethod("webview.setActive", this.id, !!newActivity);
    });

    /**
     * @name WebView#backgroundColor
     * @description Sets the background color of the WebView
     * @return {String} color
    */
    this.__defineSetter__("backgroundColor", function (backgroundColor) {
        qnx.callExtensionMethod("webview.setBackgroundColor", this.id, backgroundColor);
    });

    this.__defineGetter__("backgroundColor", function () {
        return qnx.callExtensionMethod("webview.backgroundColor", this.id);
    });

    /**
     * @name WebView#devicePixelRatio
     * @description The device pixel ratio of the WebView
     * @return {Number} devicePixelRatio
    */
    this.__defineSetter__("devicePixelRatio", function (pixelRatio) {
        qnx.callExtensionMethod("webview.setDevicePixelRatio", this.id, pixelRatio);
    });

    this.__defineGetter__("devicePixelRatio", function () {
        return qnx.callExtensionMethod("webview.devicePixelRatio", this.id);
    });

    /**
     * @name WebView#sensitivity
     * @description Sets the sensitivity mode of the WebView.  Can be one of:
     * "SensitivityAlways",
     * "SensitivityTest",
     * "SensitivityNoFocus",
     * "SensitivityNever",
     * "SensitivityFullscreen"
     * @return
    */
    this.__defineSetter__("sensitivity", function (sensitivity) {
        qnx.callExtensionMethod("webview.setSensitivity", this.id, sensitivity);
    });

    this.__defineGetter__("sensitivity", function () {
        return qnx.callExtensionMethod("webview.sensitivity", this.id);
    });

    /**
     * @name WebView#zOrder
     * @description The zOrder of the WebView
     * @return {Number} zOrder
    */
    this.__defineGetter__("zOrder", function () {
        return qnx.callExtensionMethod("webview.zOrder", this.id);
    });

    this.__defineSetter__("zOrder", function (newZOrder) {
        qnx.callExtensionMethod("webview.setZOrder", this.id, parseInt(newZOrder, 10));
    });

    /**
     * @name WebView#url
     * @description The fully qualified url currently loaded into the WebView
     * @return {String} url
    */
    this.__defineGetter__("url", function () {
        return qnx.callExtensionMethod("webview.location", this.id);
    });

    this.__defineSetter__("url", function (newUrl) {
        qnx.callExtensionMethod("webview.loadURL", this.id, newUrl);
    });

    /**
     * @name WebView#originalLocation
     * @description The original location of a WebView. READ ONLY
     * @return {String} originalLocation
    */
    this.__defineGetter__("originalLocation", function () {
        return qnx.callExtensionMethod("webview.originalLocation", this.id);
    });

    /**
     * @name WebView#enableCrossSiteXHR
     * @description Sets whether the WebView allows cross site XHR
     * @return {Boolean}
    */
    this.__defineGetter__("enableCrossSiteXHR", function () {
        return qnx.callExtensionMethod("webview.isEnableCrossSiteXHR", this.id);
    });

    this.__defineSetter__("enableCrossSiteXHR", function (shouldEnable) {
        qnx.callExtensionMethod("webview.setEnableCrossSiteXHR", this.id, shouldEnable);
    });

    /**
     * @name WebView#enableWebInspector
     * @description Sets whether WebInspector is enabled or disabled for the WebView
     * @return {Boolean} enableWebInspector
    */
    this.__defineGetter__("enableWebInspector", function () {
        return _webInspectorEnabled;
    });

    this.__defineSetter__("enableWebInspector", function (shouldEnable) {
        _webInspectorEnabled = shouldEnable;
        qnx.callExtensionMethod("webview.setEnabledOutOfProcessWebInspector", this.id, shouldEnable);
    });

    /**
     * @name WebView#enableInProcessWebInspector
     * @description Sets whether InProcessWebInspector is enabled or disabled for the Webview
     * @return {Boolean} enableInProcessWebInspector
    */
    this.__defineGetter__("enableInProcessWebInspector", function () {
        return _inProcessWebInspectorEnabled;
    });

    this.__defineSetter__("enableInProcessWebInspector", function (shouldEnable) {
        _inProcessWebInspectorEnabled = shouldEnable;
        qnx.callExtensionMethod('webview.setWebInspectorEnabled', this.id, shouldEnable);
    });

    /**
     * @name WebView#setFileSystemSandbox
     * @description Sets whether the filesystem sandbox is enabled or disabled for the WebView
     * @return {Boolean} setFileSystemSandbox
    */
    this.__defineGetter__("setFileSystemSandbox", function () {
        return qnx.callExtensionMethod("webview.fileSystemAPISandboxed", this.id);
    });

    this.__defineSetter__("setFileSystemSandbox", function (shouldEnable) {
        qnx.callExtensionMethod("webview.setFileSystemAPISandboxed", this.id, shouldEnable);
    });

    /**
     * @name WebView#autoDeferNetworkingAndJavaScript
     * @description Sets whether the WebView allows autoDeferNetworkingAndJavaScript or not
     * @return {Boolean} autoDeferNetworkingAndJavaScript
    */
    this.__defineGetter__("autoDeferNetworkingAndJavaScript", function () {
        return qnx.callExtensionMethod("webview.isAutoDeferNetworkingAndJavaScript", this.id);
    });

    this.__defineSetter__("autoDeferNetworkingAndJavaScript", function (shouldAutoDeferNetworkingAndJavaScript) {
        qnx.callExtensionMethod("webview.setAutoDeferNetworkingAndJavaScript", this.id, shouldAutoDeferNetworkingAndJavaScript);
    });

    /**
     * @name WebView#allowQnxObject
     * @description Sets whether the WebView is allowed to access the qnx object
     * @return {Boolean}
    */
    this.__defineGetter__("allowQnxObject", function () {
        return _qnxObjectEnabled;
    });

    this.__defineSetter__("allowQnxObject", function (shouldEnable) {
        _qnxObjectEnabled = shouldEnable;
        qnx.callExtensionMethod("webview.enableQnxJavaScriptObject", this.id, shouldEnable);
    });

    /**
     * @name WebView#uiWebView
     * @description Sets the UI WebView of the current WebView
     * @return {Object}
    */
    this.__defineGetter__("uiWebView", function () {
        return _uiWebView;
    });

    this.__defineSetter__("uiWebView", function (uiWebView) {
        _uiWebView = uiWebView;
    });

    /**
     * @name WebView#allowRpc
     * @description Allows a WebView to use the rpc channel to communicate with the controller WebView.
     * @return {Boolean}
    */
    this.__defineGetter__("allowRpc", function () {
        return _rpcEnabled;
    });

    this.__defineSetter__("allowRpc", function (shouldEnable) {
        _rpcEnabled = shouldEnable;
        rpc.allowRpc(that, shouldEnable);
    });

    /**
     * @name WebView#processId
     * @description The process id of the WebView. READ ONLY
     * @return {Number}
    */
    this.__defineGetter__("processId", function () {
        return _processId;
    });

    /**
     * @name WebView#extraHttpHeaders
     * @description Allows a WebView to set a json key value list of headers, and retreive a json key value pair.
     * @return {JSON}
    */
    this.__defineSetter__("extraHttpHeaders", function (jsonHeaders) {
        var headers = JSON.stringify(jsonHeaders);
        qnx.callExtensionMethod('webview.setExtraHttpHeaders', this.id, headers);
    });

    this.__defineGetter__("extraHttpHeaders", function () {
        return JSON.parse(qnx.callExtensionMethod('webview.extraHttpHeaders', this.id));
    });

    /**
     * @name WebView#defaultFontSize
     * @description Sets the default font size of the WebView
     * @return {Number}
    */
    this.__defineSetter__("defaultFontSize", function (fontSize) {
        qnx.callExtensionMethod("webview.setDefaultFontSize", this.id, fontSize);
    });

    this.__defineGetter__("defaultFontSize", function () {
        return qnx.callExtensionMethod("webview.defaultFontSize", this.id);
    });

    /**
     * @name WebView#fullScreenVideoCapable
     * @description Sets whether fullScreenVideoCapable is enabled or disabled for the WebView
     * @return {Boolean}
    */
    this.__defineSetter__("fullScreenVideoCapable", function (shouldEnable) {
        qnx.callExtensionMethod("webview.setFullScreenVideoCapable", this.id, shouldEnable);
    });

    this.__defineGetter__("fullScreenVideoCapable", function () {
        return qnx.callExtensionMethod("webview.fullScreenVideoCapable", this.id);
    });

    /**
     * @name WebView#allowAllPropertyChangedEvents
     * @description Sets whether allowsAllPropertyChangedEvents is enabled or disabled for the WebView
     * @return {Boolean}
    */
    this.__defineSetter__("allowAllPropertyChangedEvents", function (shouldEnable) {
        qnx.callExtensionMethod("webview.setAllPropertyChangedEventsEnabled", this.id, shouldEnable);
    });

    this.__defineGetter__("allowAllPropertyChangedEvents", function () {
        return qnx.callExtensionMethod("webview.isAllPropertyChangedEventsEnabled", this.id);
    });

    /**
     * @name WebView#allowAllWebEvents
     * @description Sets whether allowAllWebEvents is enabled or disabled for the WebView
     * @return {Boolean}
    */
    this.__defineSetter__("allowAllWebEvents", function (shouldEnable) {
        qnx.callExtensionMethod("webview.setAllWebEventsEnabled", this.id, shouldEnable);
    });

    this.__defineGetter__("allowAllWebEvents", function () {
        return qnx.callExtensionMethod("webview.isAllWebEventsEnabled", this.id);
    });

    /**
     * @name WebView#allowsAnyPropertyChangedEvents
     * @description The value for isAnyPropertyChangedEventsEnabled of the WebView. READ ONLY
     * @return {Boolean}
    */
    this.__defineGetter__("allowsAnyPropertyChangedEvents", function () {
        return qnx.callExtensionMethod("webview.isAnyPropertyChangedEventsEnabled", this.id);
    });

    /**
     * @name WebView#allowsAnyWebEvents
     * @description The value for anyWebEventsEnabled of the WebView. READ ONLY
     * @return {Boolean}
    */
    this.__defineGetter__("allowsAnyWebEvents", function () {
        return qnx.callExtensionMethod("webview.isAnyWebEventsEnabled", this.id);
    });

    /**
     * @name WebView#javaScriptInterruptTimeout
     * @description Sets the javascript interrupt timeout(in ms) of the WebView
     * @return {Number}
    */
    this.__defineSetter__("javaScriptInterruptTimeout", function (ms) {
        qnx.callExtensionMethod("webview.setJavaScriptInterruptTimeout", this.id, ms);
    });

    this.__defineGetter__("javaScriptInterruptTimeout", function () {
        return qnx.callExtensionMethod("webview.javaScriptInterruptTimeout", this.id);
    });

    /**
     * @name WebView#jsScreenWindowHandle
     * @description The unique id for the WebView application screen. READ ONLY
     * @return {Number}
    */
    this.__defineGetter__("jsScreenWindowHandle", function () {
        return qnx.callExtensionMethod("webview.jsScreenWindowHandle", this.id);
    });

    /**
     * @name WebView#allowWebInspection
     * @description Sets whether allowWebInspection is enabled or disabled for the WebView
     * @return {Boolean}
    */
    this.__defineSetter__("allowWebInspection", function (shouldEnable) {
        qnx.callExtensionMethod("webview.setAllowWebInspection", this.id, this.id, shouldEnable);
    });

    /**
     * @name WebView#enableDialogRequestedEvents
     * @description Sets whether DialogRequestedEvents is enabled or disabled for the WebView
     * @return {Boolean}
    */
    this.__defineSetter__("enableDialogRequestedEvents", function (shouldEnable) {
        qnx.callExtensionMethod("webview.setEnableDialogRequestedEvents", this.id, shouldEnable);
    });

    /**
     * @name WebView#
     * @description
     * @return
    */
    this.__defineGetter__("enableDialogRequestedEvents", function () {
        return qnx.callExtensionMethod("webview.isEnableDialogRequestedEvents", this.id);
    });

    /**
     * @name WebView#enableJavaScript
     * @description Sets whether JavaScript is enabled or disabled for the WebView
     * @return {Boolean}
    */
    this.__defineSetter__("enableJavaScript", function (shouldEnable) {
        qnx.callExtensionMethod("webview.setEnableJavaScript", this.id, shouldEnable);
    });

    this.__defineGetter__("enableJavaScript", function () {
        return qnx.callExtensionMethod("webview.isEnableJavaScript", this.id);
    });

    /**
     * @name WebView#keyboardVisible
     * @description Sets whether keyboardVisible is enabled or disabled for the WebView
     * @return {Boolean}
    */
    this.__defineSetter__("keyboardVisible", function (shouldEnable) {
        _keyboardVisible = shouldEnable;
        qnx.callExtensionMethod("webview.setKeyboardVisible", this.id, shouldEnable);
    });

    this.__defineGetter__("keyboardVisible", function () {
        return _keyboardVisible;
    });

    /**
     * @name WebView#overScrollColor
     * @description Sets the overScrollColor of the WebView
     * @return {String}
    */
    this.__defineSetter__("overScrollColor", function (color) {
        qnx.callExtensionMethod("webview.setOverScrollColor", this.id, color);
    });

    this.__defineGetter__("overScrollColor", function () {
        return qnx.callExtensionMethod("webview.overScrollColor", this.id);
    });

    /**
     * @name WebView#userAgent
     * @description Sets the user agent of the WebView
     * @return {String}
    */
    this.__defineSetter__("userAgent", function (userAgent) {
        qnx.callExtensionMethod("webview.setUserAgent", this.id, userAgent);
    });

    this.__defineGetter__("userAgent", function () {
        return qnx.callExtensionMethod("webview.userAgent", this.id);
    });

    /**
     * @name WebView#title
     * @description The title of the WebView. READ ONLY
     * @return {String}
    */
    this.__defineGetter__("title", function () {
        return qnx.callExtensionMethod("webview.title", this.id);
    });

    /**
     * @name WebView#status
     * @description The status of the WebView. READ ONLY
     * @return {String}
    */
    this.__defineGetter__("status", function () {
        return qnx.callExtensionMethod("webview.status", this.id);
    });

    /**
     * @name WebView#currentContext
     * @description The value of the current context(ie alt, src, etc.) of the WebView
     * @return {JSON String}
    */
    this.__defineGetter__("currentContext", function () {
        return qnx.callExtensionMethod("webview.currentContext", this.id);
    });

    function setListener(eventName, listener) {
        var methodName = "on" + eventName;
        if (listener && typeof listener === 'function') {
            events.on(_id, eventName, listener);
            _listeners[methodName] = listener;
            return true;
        } else {
            //If an invalid callback is set, clear the listener
            events.removeEventListener(_id, eventName, _listeners[methodName]);
            delete _listeners[methodName];
            return false;
        }
    }

    function defineEventListeners(eventName) {
        var methodName = "on" + eventName;

        that.__defineGetter__(methodName, function () {
            return _listeners[methodName];
        });

        that.__defineSetter__(methodName, function (listener) {
            setListener(eventName, listener);
        });
    }


    internal.sendEvents.forEach(defineEventListeners);

    // Set default handlers after the WebView has been created
    events.on(_id, "Created", function () {
        // by default webviews are created with autoDeferNetworkingAndJavaScript set to false. Clients can unset
        that.autoDeferNetworkingAndJavaScript = false;
        _defaultSendEventHandlers.forEach(function (defaultSendEventHandler) {
            that[defaultSendEventHandler] = require('./defaultHandlers/' + defaultSendEventHandler).handle(that);
        });
        _defaultWebEventHandlers.forEach(function (defaultWebEventHandler) {
            events.on(_id, defaultWebEventHandler, function () {
                require('./defaultHandlers/' + defaultWebEventHandler).handle(that).apply(null, Array.prototype.slice.apply(arguments));
            });
        });
    });

}

/**#@+
* @param {String} eventType The native event to be listened to.<b> Only the following events can be listened to or the method will fail silently.</b><br/>
* Can be one of
        'ContentRendered',
        'ContextMenuCancelEvent',
        'Created',
        'Destroyed',
        'DocumentLoadCommitted',
        'DocumentLoaded',
        'DocumentLoadFinished',
        'DialogRequested'
        'JavaScriptCallback',
        'JavaScriptResult',
        'InvokeRequestEvent',
        'LocationChange',
        'NetworkError',
        'PropertyActiveEvent',
        'PropertyBackgroundColorEvent',
        'PropertyCanGoBackEvent',
        'PropertyCanGoForwardEvent',
        'PropertyCertificateInfoEvent',
        'PropertyContentRectangleEvent',
        'PropertyCurrentContextEvent',
        'PropertyEnableWebInspectorEvent',
        'PropertyEncryptionInfoEvent',
        'PropertyFaviconEvent',
        'PropertyHistoryListEvent',
        'PropertyHistoryPositionEvent',
        'PropertyJavaScriptInterruptTimeoutEvent',
        'PropertyLoadProgressEvent',
        'PropertyLocationEvent',
        'PropertyOriginalLocationEvent',
        'PropertyScaleEvent',
        'PropertyScrollPositionEvent',
        'PropertySecureTypeEvent',
        'PropertyStatusEvent',
        'PropertyTitleEvent',
        'PropertyTooltipEvent',
        'PropertyVisibleEvent',
        'PropertyWebInspectorPortEvent',
        'PropertyViewportEvent',
        'PropertyZOrderEvent',
**/

/**
 * @description Adds a listener for a given event. Multiple listeners can be registered for the same event.
 * @param {callback} eventListener The function to be invoked when the event occurs
*/
WebView.prototype.addEventListener = function (eventType, eventListener) {
    if (internal.sendEvents.indexOf(eventType) === -1 && eventType !== "NetworkResourceRequested") {
        events.on(this.id, eventType, eventListener); //What to put for scope???
    }
};

/**
 * @description Removes a specific registered listener for a given event
 * @param {Object} eventListener The function to be removed from the list of event listeners
*/
WebView.prototype.removeEventListener = function (eventType, eventListener) {
    if (internal.sendEvents.indexOf(eventType) === -1 && eventType !== "NetworkResourceRequested") {
        events.removeEventListener(this.id, eventType, eventListener);
    }
};

/**
 * @description Dispatches an event of the provided type with the given arguments to all registered listeners.
 * @param {Object[]} args The array of objects to be passed to the event
*/
WebView.prototype.dispatchEvent = function (eventType, args, sync) {
    if (args && typeof args === 'boolean') {
        sync = args;
        args = [];
    }
    if (internal.sendEvents.indexOf(eventType) === -1 && eventType !== "NetworkResourceRequested") {
        events.emit(this.id, eventType, args, {sync: sync});
    }
};

/**#@-*/

/**
* @description Sets the location of the WebView on the screen
* @param {Number} x The x position of the WebView
* @param {Number} y The y position of the WebView
* @param {Number} width The width of the WebView
* @param {Number} height The height of the WebView
*/
WebView.prototype.setGeometry = function (x, y, width, height) {
    qnx.callExtensionMethod("webview.setGeometry", this.id, x, y, width, height);
};

/**
 * Animates the window's position
 * @param  {string}   curve    one of Linear, EaseInCurve, or EaseOutCurve
 * @param  {float}    duration fractional seconds
 * @param  {integer}  startX   Start horizontal position
 * @param  {integer}  startY   Start vertical position
 * @param  {integer}  endX     End horizontal position
 * @param  {integer}  endY     End vertical position
 * @param  {Function} callback Function to be called when the animation is complete
 */
WebView.prototype.animateWindowLocation = function (curve, duration, startX, startY, endX, endY, callback) {
    var jsScreenWindowHandle = qnx.callExtensionMethod('webview.jsScreenWindowHandle', this.id);
    windowAnimations.animateWindowLocation(jsScreenWindowHandle, curve, duration, startX, startY, endX, endY, callback);
};



/**
 * @description Reloads the current WebView
 */
WebView.prototype.reload = function () {
    qnx.callExtensionMethod("webview.reload", this.id);
};

/**
 * @description Stops the current WebView
 * @param {callback} [onComplete] A callback to be invoked when the stop call is complete
 */
WebView.prototype.stop = function (onComplete) {
    qnx.callExtensionMethod("webview.stop", this.id);

    if (onComplete && typeof onComplete === 'function') {
        onComplete();
    }
};

/**
 * @description Destroys the underlying native WebView. WebView must be deleted afterwards to remove it completely.
 * @param {callback} [onComplete] A callback to be invoked when the destruction call is complete
 */
WebView.prototype.destroy = function (onComplete) {
    qnx.callExtensionMethod("webview.destroy", this.id);

    if (onComplete && typeof onComplete === 'function') {
        onComplete();
    }
};

/**
 * @description Syncs the proxy credential of the WebView
 * @param {String} username The username of the proxy credential
 * @param {String} password The password of the proxy credential
 */
WebView.prototype.syncProxyCredential = function (username, password) {
    qnx.callExtensionMethod("webview.syncProxyCredential", this.id, username, password);
};

/**
 * @description Initializes the WebView
 * @param {Number} orientation The orientation you want to initialize with (ie. 0, 90, -90)
 */
WebView.prototype.initialize = function (orientation) {
    qnx.callExtensionMethod("webview.initialize", this.id, this.windowGroup, orientation);
};

/**
 * @description Deletes the underlying native WebView
 * @param {callback} [onComplete] A callback to be invoked when the deletion call is complete
 */
WebView.prototype.delete = function (onComplete) {
    qnx.callExtensionMethod("webview.delete", this.id);
    //Clear all event listeners and published functions for this webview
    events.clear(this.id);
    rpc.clear(this.id);

    if (onComplete && typeof onComplete === 'function') {
        onComplete();
    }
};

/**
 * @description Returns the boolean value for the property VideoFullScreen of the WebView
 */
WebView.prototype.isVideoFullScreen = function () {
    qnx.callExtensionMethod("webview.isVideoFullScreen", this.id);
};

/**
 * @description Executes javascript in the context of the Webview
 * @param {String} js The javascript expression to be executed
 * @param {boolean} [inIsolatedWorld=false] Run javascript in isolated context
 * @param {callback} [onComplete] A callback to be invoked when the destruction call is complete
 */
WebView.prototype.executeJavaScript = function (js, inIsolatedWorld, onComplete) {
    qnx.callExtensionMethod("webview.executeJavaScript", this.id, js, inIsolatedWorld ? "IsolatedWorld" : "NormalWorld");
    if (onComplete && typeof onComplete === 'function') {
        onComplete();
    }
};

/**
 * @description Sets the background color of the WebView
 * @param {String} color The desired background color of the WebView in hex
 * @deprecated
 * @see WebView#backgroundColor
 * @example webview.setBackgroundColor("0x00FFFFFF");
 */
WebView.prototype.setBackgroundColor = function (color) {
    qnx.callExtensionMethod("webview.setBackgroundColor", this.id, color);
};

/**
 * @description Notifies native that stuff is opened
 * @param {Number} streamId The streamId of the stream that has been opened
 * @param {String} responseCode The response to the opening of it
 * @param {String} value The value you wish to notify native of
 */
WebView.prototype.notifyOpen = function (streamId, responseCode, value) {
    qnx.callExtensionMethod("webview.notifyOpen", this.id, streamId, responseCode, value);
};

/**
 * @description Notifies the native webview that the application is low on memory
 */
WebView.prototype.notifySystemLowMemory = function () {
    qnx.callExtensionMethod('webview.notifySystemLowMemory', this.id);
};

/**
 * @description Notifies native that the header is received
 * @param {Number} streamId The streamId of the stream that has been opened
 * @param {String} responseCode The response to the opening of it
 * @param {String} value The value you wish to notify native of
 */
WebView.prototype.notifyHeaderReceived = function (streamId, responseCode, value) {
    qnx.callExtensionMethod("webview.notifyHeaderReceived", this.id, streamId, responseCode, value);
};

/**
 * @description Notifies native that the data is received
 * @param {Number} streamId The streamId of the stream that has been opened
 * @param {String} responseCode The response to the opening of it
 * @param {String} value The value you wish to notify native of
 */
WebView.prototype.notifyDataReceived = function (streamId, responseCode, value) {
    qnx.callExtensionMethod("webview.notifyDataReceived", this.id, streamId, responseCode, value);
};

/**
 * @description Notifies native that the WebView is done rotating
 */
WebView.prototype.notifyApplicationOrientationDone = function () {
    qnx.callExtensionMethod("webview.notifyApplicationOrientationDone", this.id);
};

/**
 * @description Notifies native that everything is done
 * @param {Number} streamId The streamId of the stream that has been opened
 */
WebView.prototype.notifyDone = function (streamId, responseCode, value) {
    qnx.callExtensionMethod("webview.notifyDone", this.id, streamId);
};

/**
 * @description Notifies native that the context menu has been dismissed
 */
WebView.prototype.notifyContextMenuCancelled = function () {
    qnx.callExtensionMethod("webview.notifyContextMenuCancelled", this.id);
};

/**
 * @description Publishes a name that maps to a specific function.  Allows other WebViews to request execution of the handler.
 * @param {String} name The name of the function to be published
 * @param {Function} handler Function that will be published
 * @param {Object} options Optional configuration object.  Subparameters are "scope" and "once"
*/
WebView.prototype.publishRemoteFunction = function (name, handler, options) {
    rpc.publish(this.id, name, handler, options);
};

/**
 * @description Removes a published function name
 * @param {String} name Name of the function to unpublish
*/
WebView.prototype.unpublishRemoteFunction = function (name) {
    rpc.unpublish(this.id, name);
};

/**
 * @description Performs a remote function call on another WebView
 * @param {Number} webviewId ID of the target WebView
 * @param {String} name Name of the function to be executed
 * @param {Object[]} args Arguments for the desired function
 * @param {Function} callback Optional callback that runs on completion.  Ignored on synchronous calls.
*/
WebView.prototype.remoteExec = function (webviewId, name, args, callback) {
    rpc.remoteExec(webviewId, name, args, callback);
};

/**
 * @description Redirects web events intended for this WebView to another WebView
 * @param {String} eventType Name of the event to redirect
 * @param {Number} targetWebView ID of the WebView that will receive the event
 * @param {String} returnVal Optional return value for the event
*/
WebView.prototype.enableWebEventRedirect = function (eventType, targetWebViewId, returnVal) {
    internal.enableWebEventRedirect(eventType, this.id, targetWebViewId, returnVal);
};

/**
 * @description Stops web event redirection for a particular event
 * @param {String} eventType Name of the event to stop redirecting
*/
WebView.prototype.disableWebEventRedirect = function (eventType) {
    internal.disableWebEventRedirect(eventType, this.id);
};

/**
 * @description Used as the entry point of the rpc channel to run a callback with parameters
 * @param {Number} callbackId ID of the desired callback to run
 * @param {String} args Stringified parameters for the callback
*/

WebView.prototype.runRemoteExecCallback = function (callbackId, args) {
    rpc.runRemoteExecCallback(callbackId, args);
};

/**
 * @description Sets orientation of the WebView.
 * @param {Number} angle Angle of desired orientation
*/

WebView.prototype.setApplicationOrientation = function (angle) {
    qnx.callExtensionMethod("webview.setApplicationOrientation", this.id, angle);
};

/**
 * @description Sets an extra plugin directory for the WebView.
 * @param {String} directory Path to the extra directory [i.e. '/usr/lib/browser/plugins']
*/

WebView.prototype.setExtraPluginDirectory = function (directory) {
    qnx.callExtensionMethod('webview.setExtraPluginDirectory', this.id, directory);
};

/**
 * @description Allows the WebView to continue the SSL Handshaking if an SSLHandshakingFailed
 * event was triggered and caused the SSL handshake to be paused.
 * @param {Number} streamId The SSL stream id from the SSLHandshakingFailed event
 * @param {String} SSLAction The SSLAction can be one of: SSLActionTrust, SSLActionReject or SSLActionNone
*/

WebView.prototype.continueSSLHandshaking = function (streamId, SSLAction) {
    qnx.callExtensionMethod("webview.continueSSLHandshaking", this.id, streamId, SSLAction);
};

/**
 * @description Shows all of the known SSL Certificates of the WebView.
 */
WebView.prototype.knownSSLCertificates = function () {
    return qnx.callExtensionMethod("webview.knownSSLCertificates", this.id);
};

/**
 * @description Allows the WebView to add a known SSL Certificate to it's stored
 * list of known certificates. This allows WebViews to remember certificate exceptions.
 * @param {String} url The url of the website for which we wish to add a known certificate
 * @param {String} certificateInfo The certificate info passed from the SSLHandshakingFailed event
 */

WebView.prototype.addKnownSSLCertificate = function (url, certificateInfo) {
    return qnx.callExtensionMethod("webview.addKnownSSLCertificate", this.id, url, certificateInfo);
};

/**
 * @description Allows the WebView to add a known SSL Certificate to it's stored
 * list of known certificates. This allows WebViews to remember certificate exceptions.
 * @param {String} url The url of the website for which we wish to add a known certificate
 */

WebView.prototype.hasKnownSSLCertificate = function (url) {
    return qnx.callExtensionMethod("webview.knownSSLCertificate", this.id, url);
};

/**
 * @description Allows the WebView to add whitelist access between two origins. This will allow cross origin communication
 * that would not otherwise be possible.
 * @param {String} sourceOrigin The URI of the source where a network request is created. Use local:// for local access.
 * @param {String} destination The URI of the destination of a network request
 * @param {Boolean} [allowSubdomains=False] Whether subdomains of the source/destination origins should be allowed as well.
 */
WebView.prototype.addOriginAccessWhitelistEntry = function (sourceOrigin, destination, allowSubdomains) {
    qnx.callExtensionMethod("webview.addOriginAccessWhitelistEntry", this.id, sourceOrigin, destination, !!allowSubdomains);
};

/**
 * @description Allows the WebView to remove previously added whitelist entries.
 * @param {String} sourceOrigin The URI of the source where a network request is created. Use local:// for local access.
 * @param {String} destination The URI of the destination of a network request
 * @param {Boolean} [allowSubdomains=False] Whether subdomains of the source/destination origins should be allowed as well.
 */
WebView.prototype.removeOriginAccessWhitelistEntry = function (sourceOrigin, destination, allowSubdomains) {
    qnx.callExtensionMethod("webview.removeOriginAccessWhitelistEntry", this.id, sourceOrigin, destination, !!allowSubdomains);
};

/**
 * @description Tells native to download the corresponding URL
 * @param {String} url The url to be downloaded
 */
WebView.prototype.downloadURL = function (url) {
    qnx.callExtensionMethod("webview.downloadURL", this.id, url);
};

/**
 * @description Tells native to handle the context menu response based on the given action
 * @param {String} action The id of the context menu action to be handled.
 */
WebView.prototype.handleContextMenuResponse = function (action) {
    qnx.callExtensionMethod("webview.handleContextMenuResponse", this.id, action);
};

/**
 * @description Allows the WebView to add a known Geolocation permissions for a
 * specific site. This would suppress any notifications from WebKit.
 * @param {String} origin Domain of the website that we wish to allow geolocation permission
*/
WebView.prototype.allowGeolocation = function (origin) {
    qnx.callExtensionMethod("webview.setAllowGeolocation", this.id, origin, true);
};

/**
 * @description Sets the current WebView to disallow Geolocation based on the
 * origin parameter passed in.
 * @param {String} origin Origin of the website for which we wish to add a geolocation permission for this
 * is based on the domain used, sub pages are automatically affected.
*/
WebView.prototype.disallowGeolocation = function (origin) {
    qnx.callExtensionMethod("webview.setAllowGeolocation", this.id, origin, false);
};

/**
 * @description Allows the WebView to add a known Geolocation permissions for a
 * specific site. This would suppress any notifications from WebKit.
 * @param {String} origin Origin of the website for which we wish to check the geolocation
 * value. This is based on the domain.
*/
WebView.prototype.isGeolocationAllowed = function (origin) {
    return qnx.callExtensionMethod("webview.isEnableGeolocation", this.id, origin);

};

/**
 * @description Allows the WebView to add notification permissions for a
 * specific site. This would suppress any notifications from WebKit.
 * @param {String} origin of the website for which we wish to add notification permission for
*/

WebView.prototype.allowNotifications = function (origin) {
    qnx.callExtensionMethod("webview.setAllowNotification", this.id, origin, true);
};

/**
 * @description Disallows the WebView to add notification permissions for a
 * specific site. This would suppress any notifications from WebKit.
 * @param {String} origin of the website for which we wish to add notification permission for
*/

WebView.prototype.disallowNotifications = function (origin) {
    qnx.callExtensionMethod("webview.setAllowNotification", this.id, origin, false);
};

WebView.prototype.setPopupWebView = function (popupId) {
    qnx.callExtensionMethod('webview.setPopupWebView', this.id, popupId);
};

/**
 * @description Tells the WebView to allow the request for user media.
 * @param {Number} evtId The id of the event.
 * @param {String} cameraName The camera to be used for capturing/recording.
 */
WebView.prototype.allowUserMedia = function (evtId, cameraName) {
    if (cameraName && cameraName.length > 0) {
        qnx.callExtensionMethod("webview.setAllowUserMedia", this.id, evtId, cameraName);
    }
};

/**
 * @description Tells The WebView to disallow the request for user media.
 * @param {Number} evtId The id of the event.
 */
WebView.prototype.disallowUserMedia = function (evtId) {
    qnx.callExtensionMethod("webview.setAllowUserMedia", this.id, evtId, "");
};

/**
 * @description Allows an event which require explicit enabling.
 * @param {String} eventName The name of the event.
 */
WebView.prototype.allowWebEvent = function (eventName) {
    qnx.callExtensionMethod('webview.setEnable' + eventName + 'Events', this.id, true);
};

/**
 * @description Disallows an event which has been explicitly enabled.
 * @param {String} eventName The name of the event.
 */
WebView.prototype.disallowWebEvent = function (eventName) {
    qnx.callExtensionMethod('webview.setEnable' + eventName + 'Events', this.id, false);
};

/**
 * @description Checks if an event has been explicitly enabled.
 * @param {String} eventName The name of the event.
 */
WebView.prototype.isWebEventAllowed = function (eventName) {
    return qnx.callExtensionMethod('webview.isWebEventEnabled', this.id, eventName) === "1" ||
        qnx.callExtensionMethod('webview.isEnable' + eventName + 'Events', this.id) === "1" ||
        false;
};

/**
 * @description Enable string pattern matching.
 * @param {String} eventName The name of the event.
 */
WebView.prototype.enableStringPatternMatching = function (shouldEnable) {
    qnx.callExtensionMethod("webview.setPatternMatchingEnabled", this.id, shouldEnable);
};

/**
 * @description Allows the WebView to add a known SSL Certificates to it's stored list of known certificates.
 * This allows WebViews to remember certificate exceptions.
 * @param {Array} urlInfo The array of url and certificateInfo JSON objects you wish to add
 *
 * ie. {String} url, {JSON String} certInfo
 *     webview.addMultipleSSLCertificates([(url, certInfo),..])
 */

WebView.prototype.addMultipleSSLCertificates = function (urlInfo) {
    qnx.callExtensionMethod("webview.addKnownSSLCertificates", this.id, urlInfo);
};

/**
 * @description Capture the Contents in contentsRect in the WebView into specified desitinationSize
 * @param {Number} evtId The event ID you want to capture the content at
 * @param {JSON} contentsRect The rectangle area of the contents will be captured
 * @param {JSON} desitinationSize The size of the contents you want to save it as
 * @param {Function} callback The callback function you want to call
 *
 * ie. var contentsRect = JSON.stringify({x: 0, y: 0, width: window.innerWidth, height: window.innerHeight}),
 *         destinationSize = JSON.stringify({width: window.innerWidth, height: window.innerHeight});
 */
WebView.prototype.captureContents = function (contentsRect, destinationSize, callback) {
    var callbackId,
        _captureId = 0,
        captureContents,
        imgString;

    captureContents = function (data) {
        data = JSON.parse(data);
        imgString = data.base64PNGImage;

        if (callback && typeof callback === 'function') {
            callback(imgString);
            this.removeEventListener("CaptureContents", captureContents);
            _callback = false;
        }
    };

    if (!_callback && typeof callback === 'function') {
        this.addEventListener("CaptureContents", captureContents);
        _callback = true;
        callbackId = _captureId++;
    }
    qnx.callExtensionMethod("webview.captureContents", this.id, callbackId, contentsRect, destinationSize);
};

/**
 * @description Logs the error message of the WebView
 * @param {String} errorMsg The Error Message you want to log
 */
WebView.prototype.log = function (errorMsg) {
    qnx.callExtensionMethod("webview.log", this.id, errorMsg);
};

/**
 * @description Removes all of the known SSL certificates.
 */

WebView.prototype.removeAllKnownSSLCertificates = function () {
    qnx.callExtensionMethod("webview.removeAllKnownSSLCertificates", this.id);
};

/**
 * @description Remove the specified SSL ceritificate with matching url and certificateId.
 * @param {String} url The url of the website
 * @param {String} certificateId The signature of the certificate
 * ie.  var certificate = JSON.parse(context),
 *          certificateId = certificate.connectionInfo.certificateInfo.certificates[0].signature,
 *          url = certificate.url;
 */
WebView.prototype.removeKnownSSLCertificate = function (url, certificateId) {
    qnx.callExtensionMethod("webview.removeKnownSSLCertificate", this.id, url, certificateId);
};

/**
 * @descrption Request for the current context update.
 */
WebView.prototype.requestCurrentContextUpdate = function () {
    qnx.callExtensionMethod("webview.requestCurrentContextUpdate", this.id);
};

/**
 * @description Uses waitable object for dialog responses.
 * @param {String} waitHandleID The id of the waitHandle for the dialog
 * @param {String} okText The text response from the dialog
 * @param {String} username The username response from the dialog
 * @param {String} password The password response from the dialog
 */
WebView.prototype.dialogResponse = function (waitHandleID, oktext, username, password) {
    qnx.callExtensionMethod("webview.dialogResponse", this.id, waitHandleID, true, oktext, username, password);
};

/**
 * @description Uses waitable object for chooseFile event Handler.
 * @param {String} waitHandleID The id of the waitHandle
 * @param {String} [path=""] The encoded path to the file chosen
 */
WebView.prototype.chooseFileResponse = function (waitHandleID, path) {
    path = path || '';
    qnx.callExtensionMethod("webview.chooseFileResponse", this.id, waitHandleID, path);
};

module.exports = WebView;

});

define('UIWebView', function (require, exports, module) {
/*
* Copyright 2011-2012 Research In Motion Limited.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

var UIWebView,
    WebView = require('./WebView'),
    _contextMenu = require('./ui/contextMenu/index'),
    _dialog = require('./ui/dialog/index'),
    _toast = require('./ui/toast/index'),
    _default = require('./ui/default/index'),
    _invocationlist = require('./ui/invocationlist/index'),
    _childwebviewcontrols = require('./ui/childwebviewcontrols/index'),
    _formcontrol = require("./ui/formcontrol/index");

/**
 * @class An extended WebView object used to render UI components.
 * @extends WebView
 * @param {Object} options Options used by the WebView
 * @param {Number} options.WebViewId specifies the WebView id to use
 * @param {callback} options.onCreate specifies the WebView created callback function
 * @param {Number} options.processId specifies the the process id of the WebView
*/
function UIWebView(options) {
    WebView.call(this, options);

    /**
     * @name UIWebView#default
     * @description The default plugin used for general purpose utilities
     * @returns {UIWebView.default}
    */
    _default.init(this);
    this.default = _default;

    /**
     * @name UIWebView#contextMenu
     * @description The context menu plugin
     * @returns {UIWebView.contextMenu}
    */
    _contextMenu.init(this);
    this.contextMenu = _contextMenu;

    /**
     * @name UIWebView#toast
     * @description The toast plugin
     * @returns {UIWebView.toast}
    */
    _toast.init(this);
    this.toast = _toast;

    /**
     * @name UIWebView#dialog
     * @description The dialog plugin
     * @returns {UIWebView.dialog}
    */
    _dialog.init(this);
    this.dialog = _dialog;

    /**
     * @name UIWebView#childwebviewcontrols
     * @description The child web view controls plugin
     * @returns {UIWebView.childwebviewcontrols}
    */
    _childwebviewcontrols.init(this);
    this.childwebviewcontrols = _childwebviewcontrols;

    /**
     * @name UIWebView#invocationlist
     * @description The invocation list plugin
     * @returns {UIWebView.invocationlist}
    */
    _invocationlist.init(this);
    this.invocationlist = _invocationlist;

    /**
     * @name UIWebView#formcontrol
     * @description The form control plugin
     * @returns {UIWebView.formcontrol}
    */
    _formcontrol.init(this);
    this.formcontrol = _formcontrol;
}

// Set the prototype object so we inherit all properties
// Pass a webview id to avoid creating a new webview while linking prototypes
UIWebView.prototype = new WebView({WebViewId: 1});
UIWebView.prototype.constructor = UIWebView;

module.exports = UIWebView;

});
/*
 * Copyright 2010-2011 Research In Motion Limited.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @exports _self as qnx.webplatform
 * @namespace qnx.webplatform
*/
qnx.webplatform = (function () {
    var WebView = require("WebView"),
        UIWebView = require("UIWebView"),
        Application = require("Application"),
        device = require("device"),
        chrome = require("chrome"),
        internal = require("chrome/internal"),
        ppsUtils = require("pps/ppsUtils"),
        notification = require("notification"),
        rotationHelper = require("rotationHelper"),
        _controller,
        _application,
        _originalInternalObj,
        _webviews = [];

    _controller = new WebView({WebViewId : chrome.id});
    _controller.autoDeferNetworkingAndJavaScript = false;

    _webviews.push(_controller);

    _application = new Application();

    //Only two possible cases should be chrome does not exist
    //OR someone is already implementing webEvent and we will hijack
    //but we'll be cautious just in case
    if (!window.chrome) {
        window.chrome = {};
    }
    if (!window.chrome.internal) {
        window.chrome.internal = {};
    }

    function bindInternalObject(objName, internalObj) {
        if (!window.chrome.internal[objName]) {
            window.chrome.internal[objName] = internalObj;
        } else {
            _originalInternalObj = {};

            Object.getOwnPropertyNames(internalObj).forEach(function (funcName) {
                _originalInternalObj[funcName] = window.chrome.internal[objName][funcName];
                //Hijack the function and call ours upstream
                window.chrome.internal[objName][funcName] = function () {
                    internalObj[funcName].apply(this, arguments);
                    if (_originalInternalObj[funcName]) {
                        _originalInternalObj[funcName].apply(this, arguments);
                    }
                };
            });
        }
    }

    bindInternalObject('webEvent', internal.webEvent);
    bindInternalObject('invocation', internal.invocation);
    bindInternalObject('application', internal.application);
    bindInternalObject('windowAnimations', internal.windowAnimations);
    bindInternalObject('pps', internal.pps);

    function getWebViewById(Id) {
        var match;
        _webviews.forEach(function (webview) {
            if (webview.id === Id) {
                match = webview;
            }
        });
        return match;
    }

    function createOrGetWebview(args, Type) {
        var webview;
        if (args && args.WebViewId) {
            webview = getWebViewById(args.WebViewId);
        }

        if (!webview) {
            webview = new Type(args);
            _webviews.push(webview);

            rotationHelper.init(_application, _controller);
            rotationHelper.addWebview(webview);
        }
        webview.addEventListener("Destroyed", function () {
            var id = _webviews.indexOf(webview);
            if (id !== -1) {
                _webviews.splice(id, 1);
            }
            rotationHelper.removeWebview(webview);
        });
        return webview;
    }

    return {
        /**
         * @description This method creates a new webview object, it can accept the options parameter or just the onCreate callback for legacy support purposes.
         * @param {Object} Optional the options object allows the developer to pass in different options to the WebView object, processType, WebViewId, or the onCreate method.
         * @param {Function} onCreate A callback that will be fired when the native side creates the webview. Clients are expected to implement this as the native side will throw errors if the user attempts to access the webview before the event occures.
         * @returns {WebView} A webview object
         * @example
         * qnx.webplatform.getController().enableWebInspector(true);
         *
         * var webview = qnx.webplatform.createWebView(function (value, eventId) {
         *     webview.setGeometry(0, 0, window.innerWidth, window.innerHeight);
         *     webview.visible = true;
         *     webview.active = true;
         *     console.log("woot");
         * });
         */
        createWebView : function (options, onCreate) {
            var args = {};
            if (options && typeof options === 'function') {
                args.onCreate = options;
            } else {
                args = options ? options : {};
                args.onCreate = onCreate;
            }
            return createOrGetWebview(args, WebView);
        },

        createUIWebView : function (options, onCreate) {
            var args = {};
            if (options && typeof options === 'function') {
                args.onCreate = options;
            } else {
                args = options ? options : {};
                args.onCreate = onCreate;
            }
            return createOrGetWebview(args, UIWebView);
        },

        getWebViews: function () {
            return _webviews;
        },

        /**
         * @description This method returns the Webview object for the controller
         * @returns {WebView} The controller webview
         */
        getController : function () {
            return _controller;
        },

        /**
         * @description This method returns the Application object
         * @returns {Application} The Application
         */
        getApplication : function () {
            return _application;
        },

        /**
         * @description This method returns the Notification namespace to handle request and response against pps.
         * @name qnx.webplatform#notification
         * @returns {qnx.webplatform.notification}: The Notification namespace
         */
        notification: notification,

        /**
         * @description This method allows access to the native communication channel.
         */
        nativeCall: function () {
            return qnx.callExtensionMethod.apply(qnx, Array.prototype.slice.apply(arguments));
        },

        /**
         * @description This returns the device object containing simple device properties populated using pps.
         * @name qnx.webplatform#device
         * @returns {qnx.webplatform.device} The device object
         */
        device: device,

        /**
         * @description This returns the pps object used to interact with the pps system.
         * @name qnx.webplatform#pps
         * @returns {qnx.webplatform.pps} The pps object
         */
        pps: ppsUtils
    };
}());


}());