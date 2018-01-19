importPackage(java.lang);
importPackage(java.io);
importPackage(java.net);
importPackage(javax.script);
importPackage(com.sencha.util);
importPackage(com.sencha.logging);
importPackage(com.sencha.util.filters);
importPackage(com.sencha.exceptions);
importPackage(com.sencha.command);
importPackage(com.sencha.tools.generator);

(function(Scope){

    var CR = StringUtil.NewLine,
        applyTo = Scope.applyTo = function(dest, src) {
            if (dest && src) {
                for (var name in src) {
                    dest[name] = src[name];
                }
            }
            return dest;
        },
        xpathCache = {},
        _logger = SenchaLogManager.getLogger("ant-util");

    if (!Array.prototype.forEach) {
        Array.prototype.forEach = function (callback, scope) {
            for (var array = this, i = 0, n = array.length; i < n; ++i) {
                callback.call(scope, array[i], i, array);
            }
        };
    }

    applyTo(Scope, {
        'CR' : CR,
        
        deleteFile: function(fileName) {
            try {
                FileUtil['delete'](fileName);
            } catch (e) {
                echo('Warning: Cannot delete "' + fileName + '"');
            }
        },

        /**
         * Writes the specified message to the log.
         * @param {String} message The message to log
         */
        echo: function(message) {
            _logger.info(message);
        },

        /**
         * Writes the specified message to the log and prefix it with the local time.
         * @param {String} message The message to log
         */
        echoWithTime: function(message) {
            Scope.echo(new Date().toLocaleTimeString() + ' - ' + message);
        },

        escapeXml: (function () {
            var map = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&apos;'
            };

            function replacer (m) {
                return map[m];
            }

            return function (string) {
                return String(string).replace(/[&<>'"]/g, replacer);
            };
        }()),

        /**
         * 
         * Advanced attributes.get wrapper that check that the value is not a property 
         * cast the result to a string and eventually fail the build if the attribute is 
         * not present.
         */
        getValueFromAttribute: function(name, fail) {
           var value = attributes.get(name) + '';

           if (!value || value == '' || value.match(/\$\{[^\}]*\}/)) {
               if (fail) {
                   self.fail("Unable to find attribute " + name);
               }
               return null;
           } else {
               return value;
           }
       },

        /**
         * Executes a command given an object describing the application and arguments.
         * 
         *      exec({
         *          app: 'git',
         *          args: [ 'log', '-1', '--format=%H' ]
         *      });
         *
         *      // the above is equivalent to the following:
         *
         *      exec('git', ['log', '-1', '--format:%H']);
         * 
         * The important feature provided by this method (beyond convenience) is that the app name
         * (e.g., "git") is used to lookup an optional property (e.g., "x-git.exe"). That property
         * can be defined to deal with local path issues. When it is undefined, the raw app name is
         * used for the underlying exec task and must be found in the system path.
         * 
         * @param {Object/String} cmd An object describing the command.
         * @param {String} cmd.app The name of the application (e.g., "jsduck" or "git").
         * @param {String[]} cmd.args The arguments to pass to the application.
         * @param {Boolean} cmd.failOnError False to continue if the command fails (default is true).
         * @param {String[]} [args] The arguments to pass to the application.
         * @param {Object} [opt] Extra options (e.g., "failOnError").
         * @return {Object} The result of the command
         * @return {Number} return.exitCode The exit code of the command
         * @return {String} return.output The stdout generated from the command
         */
        exec: function(cmd, args, opt) {
            if (typeof cmd == 'string') {
                cmd = applyTo({
                    app: cmd,
                    args: args || []
                }, opt);
            }

            var task = project.createTask('exec'),
                exe = cmd.app,
                outProp = makeUniqueProperty(),
                resultProp = makeUniqueProperty(),
                arg;

            // The x-foo.exe property is needed if the app is not in the PATH (or you are on
            // Windows w/Cygwin or Mingw32 and the Unix-like PATH breaks the PATH search):
            //
            exe = project.getProperty('x-'+exe+'.exe') || exe;
            task.setExecutable(exe);
            task.setSearchPath(true);
            if (cmd.capture !== false) {
                // we sometimes need to not capture input our the child process may hang... it is
                // useful for simple tools only
                task.setOutputproperty(outProp);
            }
            task.setResultProperty(resultProp);
            task.setFailonerror(cmd.failOnError !== false);
            if (cmd.dir) {
                task.setDir(new File(project.resolveFile(cmd.dir)));
            }

            var path = new org.apache.tools.ant.types.Environment.Variable();
            path.setKey('PATH');
            // this ensures the separators are correct (Ant likes ';' even w/platform uses ':'):
            path.setPath(new org.apache.tools.ant.types.Path(project, project.getProperty('x-env.PATH')));
            task.addEnv(path);

            for (var i = 0, n = cmd.args.length; i < n; ++i) {
                arg = task.createArg();
                arg.setValue(cmd.args[i]);
            }

            Scope.echo(exe + ' ' + cmd.args.join(' '));
            task.execute();
            return {
                exitCode: project.getProperty(resultProp),
                output: project.getProperty(outProp)
            };
        },

        getCurrentCommitHash: function() {
            return Scope.exec('git', ['log', '-1', '--format=%H']).output;
        },

        makeUniqueProperty: function() {
            var i = 0,
                prop;

            do {
                prop = 'x-genprop-' + (++i);
            } while (project.getProperty(prop + '-taken'));

            project.setProperty(prop + '-taken', '1');
            return prop;
        },

        /**
         * Makes the URL as described by the params.
         * @param {Object} params The parameters for the task
         * @param {String} params.host The host (machine name or IP address) of the URL.
         * @param {String} [params.scheme="http"] The protocol of the URL (e.g., "https").
         * @param {int} [params.port] The port number
         * @param {String} [params.path="/"] The path of the URL.
         * @param {String[]} [params.query] The query parameters of the URL.
         * @param {String} [params.fragment] The fragment of the URL.
         * @return {String} The URL
         */
        makeUrl: function(params) {
            var uri = new URI(params.scheme || 'http',
                              null,
                              params.host,
                              Number(params.port) || -1, // on Mac, null||-1 is a boolean!
                              params.path || '/',
                              null, null),
                url = String(uri.toString());

            if (params.query.length) {
                for (var a = [], i = 0, q = params.query, n = q.length; i < n; ++i) {
                    if (typeof q[i] == 'string') {
                        a.push(q[i]);
                    } else {
                        a.push((q[i].name + '=' + encodeURIComponent(q[i].value)));
                    }
                }

                url += '?' + a.join('&');
            }

            if (params.fragment) {
                url += '#' + params.fragment;
            }

            //self.log(url);
            return url;
        },

        /**
         * Creates the specified directory or directories if multiple need to be created. The goal
         * being to ensure that the specified directory exists if at all possible.
         * 
         * @param {String} dir The name of the directory to create
         * @return {String} The full path to the directory
         */
        mkdir: function(dir) {
            var task = project.createTask("mkdir"),
                resolvedDir = project.resolveFile(dir);

            task.dir = resolvedDir;
            task.execute();

            return resolvedDir.toString();
        },

        parseBool: function(bool) {
            return /true|yes|on|1|y/i.test(String(bool));
        },

        /**
         * Splits a set of paths (filenames) into an array. These paths should be separated by the
         * platform's path separator (typically, ';' or ':').
         * @param {String} paths The paths string to split
         * @param {String} sep The path separator
         * @return {String[]} The paths as individual strings.
         */
        splitPaths: function(paths, sep) {
            if (paths.indexOf(sep) >= 0) {
                return paths.split(sep);
            }

            // On Linux, the Java File.pathSeparator is ":", but Ant still uses ";"
            if (sep == ':' && paths.indexOf(';') >= 0) {
                return paths.split(';');
            }

            return [ paths ];
        },

        /**
         * Read the specified file and return an array of lines.
         * @param {String} fileName The file name
         * @param {Boolean} failIfNotFound False to return null if file not found (default is true).
         * @return {String[]} The array containing the lines of the file or null.
         */
        readLines: function(fileName, failIfNotFound) {
             var f, lines = [ ], s;

            try {
                f = new BufferedReader(new FileReader(fileName));
                while ((s = f.readLine()) !== null) {
                    lines.push(String(s));
                }
            } catch (e) {
                if (failIfNotFound === false) {
                    return null;
                }
                self.fail('Cannot read file: ' + fileName + ': ' + e.message);
            } finally {
                if (f) {
                    f.close();
                }
            }

            return lines;
        },
                
        /**
         * Read the specified file and returns the file as a single string.
         * @param {String} fileName The file name
         * @param {Boolean} failIfNotFound False to return null if file not found (default is true).
         * @return {String} The string with the content of the file or null.
         */
        readFile: function(fileName, failIfNotFound) {
            return FileUtil.readUnicodeFile(fileName);
        },
                
        /**
         * Writes the specified string to a file.
         * @param {String} fileName The file name
         * @param {String} text The string with the content of the file
         */
        writeFile: function(fileName, text) {
            FileUtil.writeFile(fileName, text);
        },
                
        /**
         * Writes the specified array of lines to a file.
         * @param {String} fileName The file name
         * @param {String[]} lines The array containing the lines of the file
         */
        writeLines: function(fileName, lines) {
            FileUtil.writeFile(fileName, lines.join(CR));
        },
                
        xpathFind: function(node, xpath, type) {
            var child = xpathFindNodes(node, xpath, type || 'NODE');
            return child ? child.getNodeValue() : null;
        },

        xpathFindNodes: function(node, xpath, type) {
            var xp = xpathCache[xpath];
            if (!xp) {
                var factory = javax.xml.xpath.XPathFactory.newInstance(),
                    instance = factory.newXPath();
                xpathCache[xpath] = xp = instance.compile(xpath);
            }
            return xp.evaluate(node, XPathConstants[type || 'NODESET']);
        },
                
        jsonDecode: function(data) {
            _logger.trace("decoding json data");
            return JSON.parse(data);
        },

        stripCommentsFromJson: function(json) {
            return StringUtil.stripCommentsFromJson(json);
        },

        jsonEncode: function(obj, readable) {
            _logger.debug("encoding json data");
            var indent = null;
            if(readable) {
                indent = (typeof readable === 'string')
                    ? readable
                    : '  ';
            }
            if(indent) {
                return JSON.stringify(obj, null, indent);
            } else {
                return JSON.stringify(obj);
            }
        },
                
        readConfig: function(configFile) {
            _logger.trace("reading config data from {}", configFile);
            var configData = null;
            
            // eval the data to an object to remove comments and 
            // fix up escape sequences
            eval('var configData = (' + 
                    Scope.readFile(configFile)
                    + ");");
            
            return configData;
        },

        joinPath: function() {
            var len = arguments.length, i, paths = [];
            for (i = 0; i < len; i++) {
                if (_logger.isTraceEnabled()) {
                    _logger.trace("adding path arg : {}", arguments[i]);
                }
                paths.push(arguments[i]);
            }
            return PathUtil.getAbsolutePath(paths.join(File.separator));
        },
                
        resolvePath: function() {
            return new File(Scope.joinPath.apply(this, arguments)).getAbsolutePath();
        },

        copy: function(src, dest, filter) {
            if(filter) {
                FileUtil.copy(src, dest, filter);
            } else {
                FileUtil.copy(src, dest);
            }
        },

        copyFiles: function(proj, dir, todir, includes, excludes) {
            var task = proj.createTask("copy"),
                fileset = proj.createDataType('fileset');

            fileset.setDir(new File(dir));
            if(includes) {
                fileset.setIncludes(includes);
            }

            if(excludes) {
                fileset.setExcludes(excludes);
            }

            task.setTodir(new File(todir));
            task.addFileset(fileset);
            task.execute();
        },

        moveFiles: function(proj, from, to, includes, excludes) {
            var task = proj.createTask("move"),
                fileset = proj.createDataType('fileset');

            fileset.setDir(new File(from));
            if(includes) {
                fileset.setIncludes(includes);
            }

            if(excludes) {
                fileset.setExcludes(excludes);
            }

            task.setTodir(new File(to));
            task.addFileset(fileset);
            task.execute();
        },

        moveFile: function(proj, from, to) {
            var task = proj.createTask("move");
            task.setTofile(new File(to));
            task.setFile(new File(from));
            task.execute();
        },

        readFileContent: function(file) {
            return FileUtil.readUnicodeFile(file);
        },

        readFileData: function(file) {
            return FileUtil.readFileData(file);
        },

        writeFileContent: function(file, content) {
            FileUtil.writeFile(file, content);
        },

        each: function(list, func) {
            var len = list.length,
                i;
            for (i = 0; i < len; i++) {
                func(list[i]);
            }
            return list;
        },
                
        map: function(list, func) {
            var out = [],
                len = list.length,
                i;
            for (i = 0; i < len; i++) {
                out.push(func(list[i]));
            }
            return out;
        },

        endsWith: function(input, substr) {
            // ensure js strings, not java strings
            input = input + '';
            substr = substr + '';
            return input.indexOf(substr, input.length - substr.length) !== -1;
        },

        isChildPath: function(parent, child) {
            var parentPath = PathUtil.getCanonicalPath(parent) + '',
                childPath = PathUtil.getCanonicalPath(child) + '';

            return childPath.indexOf(parentPath) === 0;
        },

        exists: function(path) {
            return new File(path).exists();
        },

        filter: function(list, func) {
            var newlist = [],
                len = list.length,
                i, item;
            for (i = 0; i < len; i++) {
                item = list[i];
                if (func(item)) {
                    newlist.push(item);
                }
            }
            return newlist;
        },

        concat: function(list1, list2) {
            var newlist = [],
                func = function (item) {
                    newlist.push(item);
                };
            Scope.each(list1, func);
            Scope.each(list2, func);
            return newlist;
        },
                
        stripSpecialDirNames: function(path) {
            var cleanPath = (path + '')
                .replace(/\.\.\\/g, "")
                .replace(/\.\.\//g, "")
                .replace(/\.\\/g, "")
                .replace(/\.\//g, "")
                .replace(/\~\//g, "");
            return cleanPath;
        },
            
        /*
         * Evaluates a template / directory of templates to a specified location
         * with optional context variables
         * 
         * @param {String} templatePath the path to tempmlate files to generate
         * @param {String} outputPath the output path of evaluated templates
         * @param {Object} params context variables for template evaluation
         */
        generateTemplates: function (templatePath, outputPath, params) {
            var generator = new Generator(),
                context = generator.getContext();
            
            if (params) {
                for (var name in params) {
                    if (params.hasOwnProperty(name)) {
                        context.put(name, params[name]);
                    }
                } 
            }
            
            generator.setSource(templatePath);
            generator.setTarget(outputPath);
            generator.generate();
        }


    });

    //-----------------------------------------------------------------------------

    /**
     * This class provides an iterator of a set of single file or directory elements.
     */
    function FileSequence (config) {
        applyTo(this, config);

        this.index = 0;
        this.count = this.dirs ? this.dirs.size() : 0;
    }

    FileSequence.prototype = {
        /**
         * @cfg
         * The name of the attribute on each element that contains the path.
         */
        attr: 'path',

        append: function (seq) {
            return new UnionSequence({
                sets: [this, seq]
            });
        },

        next: function () {
            var dir = this.peek();
            this.currentDir = null; // forces us to advance
            return dir;
        },

        peek: function () {
            var currentDir = this.currentDir;

            if (!currentDir && this.index < this.count) {
                var dir = this.dirs.get(this.index++);
                dir = dir.getRuntimeConfigurableWrapper();

                currentDir = project.resolveFile(dir.getAttributeMap().get(this.attr));

                this.currentDir = currentDir;
            }

            return currentDir;
        }
    };

    //-----------------------------------------------------------------------------

    /**
     * This class provides an iterator of the files in a set of filesets.
     */
    function FileSetSequence (config) {
        applyTo(this, config);

        this.pathSep = String(File.pathSeparator);
        this.fileSep = String(File.separator);
        this.fileSetIndex = 0;
        this.nameIndex = 0;
        this.numFileSets = this.fileSets ? this.fileSets.size() : 0;
    }

    FileSetSequence.prototype = {
        append: function (seq) {
            return new UnionSequence({
                sets: [this, seq]
            });
        },

        next: function () {
            var file = this.peek();
            this.currentFile = null; // forces us to advance
            return file;
        },

        peek: function () {
            var currentFile = this.currentFile;

            if (!currentFile) {
                var fileNames = this.fileNames;

                // This is a loop since a fileset can be empty...
                while (!fileNames || this.nameIndex == fileNames.length) {
                    if (this.fileSetIndex == this.numFileSets) {
                        return null;
                    }

                    var fileSet = this.fileSets.get(this.fileSetIndex++);

                    if (this.dirsOnly) {
                        fileNames = [''];
                    } else {
                        fileNames = splitPaths(String(fileSet), this.pathSep);
                    }

                    this.currentDir = fileSet.getDir(project) + this.fileSep;
                    this.fileNames = fileNames;
                    this.nameIndex = 0;
                }

                this.currentFile = currentFile = this.currentDir + fileNames[this.nameIndex++];
            }

            return currentFile;
        }
    };

    //-----------------------------------------------------------------------------

    /**
     * This class provides an iterator over a set of iteratable collections.
     */
    function UnionSequence (config) {
        applyTo(this, config);
        this.index = 0;
    }

    UnionSequence.prototype = {
        append: function (seq) {
            this.sets.push(seq);
            return this;
        },

        next: function () {
            var ret = this.peek();
            this.current = null;
            return ret;
        },

        peek: function () {
            var current = this.current;

            while (!current && this.index < this.sets.length) {
                current = this.sets[this.index].next();
                if (!current) {
                    ++this.index;
                }
            }

            return current;
        }
    };

    /**
     * 
     * Small utility class that extract github user and repo from a git url
     */

    var Github = {

        httpRe: /https:\/\/[^@]+@github.com\/([^\/]+)\/([^\.]+).git/,

        gitRe: /git@github.com:([^\/]+)\/([^\.]+).git/,

        extract: function(url) {
            var match = url.match(this.httpRe) || url.match(this.gitRe);
            if (match && match.length == 3) {
                return {
                    user: match[1],
                    repo: match[2]
                }
            }

            return match;
        },

        extractUser: function(url) {
            var extract = this.extract(url);
            if (extract === null) {
                self.fail("Github.extractUser: Unable to extract user from git url " + url);
            }

            return extract.user;
        },

        extractRepo: function(url) {
            var extract = this.extract(url);
            if (extract === null) {
                self.fail("Github.extractRepo: Unable to extract repo from git url " + url);
            }

            return extract.repo;
        }
    };

    applyTo(Scope, {
        'FileSequence' : FileSequence,
        'FileSetSequence' : FileSetSequence,
        'UnionSequence' : UnionSequence,
        'Github' : Github
    });

})(this);
/*
 * This file contains the guts of the <x-jsduck> task.
 */

(function () {
    var falseRe = /false|0|no|off/i,
        fileRe = /^`([^`]+)`$/;

    var PATH = function (value, name) {
            return '--' + name + '=' + project.resolveFile(value);
        },
        FILE = function (value, name) {
            var match = fileRe.exec(value),
                content = value;

            if (match) {
                content = readFile(project.resolveFile(value));
            }

            return '--' + name + '=' + content;
        },
        BOOL = function (value, name) {
            if (!value || falseRe.test(value)) {
                return null;
            }
            return '--' + name;
        },
        TEXT = function (value, name) {
            return '--' + name + '=' + value;
        }

    var handlers = {
            outdir: function (value) {
                return '--output=' + project.resolveFile(value);
            },
            "ignore-global": BOOL,
            external: TEXT,
            "builtin-classes": BOOL,
            "meta-tags": PATH,

            warnings: function (value) {
                if (value == 'none') {
                    return '--warnings=-all';
                }
                return '--warnings=' + value;
            },

            verbose: BOOL,

            title: TEXT,
            footer: TEXT,
            "head-html": FILE,
            "body-html": FILE,
            welcome: PATH,
            guides: PATH,
            videos: PATH,
            examples: PATH,
            stats: BOOL,
            categories: PATH,
            "pretty-json": BOOL,
            images: PATH,
            "link-tpl": FILE,
            "img-tpl": FILE,
            'export': TEXT,
            seo: BOOL,
            "eg-iframe": PATH,
            processes: TEXT,
            template: PATH,
            "template-links": PATH,
            "extjs-path": TEXT,
            "local-storage-db": TEXT,
            "touch-examples-ui": BOOL,
            "ext-namespace": TEXT,
            "examples-base-url": TEXT,
            config: PATH
        };

    var args = [],
        file, inputs, name, value, s;

    // Convert the attributes into options at one arg each:
    //
    for (name in handlers) {
        value = attributes.get(name);
        if (value !== null) {
            s = handlers[name](String(value), name);
            if (s) {
                args.push(s);
            }
        }
    }

    // For each directory or file specified, append the paths as arguments:
    //
    for (inputs = new FileSequence({
                        dirs: elements.get('dir')
                    }).append(new FileSetSequence({
                        fileSets: elements.get('files')
                    }));
                (file = inputs.next()); ) {
        args.push(file);
    }

    exec('jsduck', args, { capture: false });
})();
