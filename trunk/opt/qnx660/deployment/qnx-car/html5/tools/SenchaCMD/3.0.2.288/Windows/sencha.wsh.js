/* 
 * Copyright (C) 2012, Sencha Inc.
 * All rights reserved
 * 
 * This is a Window Script Host (WSH) script to wrap the Sencha SDK Tools. Since the SDK
 * Tools are Java, executing them requires a bit of extra command-line verbage. Also, we
 * need to execute the right version of the tools given the context in which we are run.
 */
var fileSys = new ActiveXObject("Scripting.FileSystemObject");
var shell   = new ActiveXObject("WScript.Shell");
var procStdErr = null;

function main (args) {
    var baseDir = getBaseDir(),  // the folder from which we are running
        curDir = getCurDir(),
        popDir;

    // The .secha.cfg file in our basedir describes the SDK Tools version
    var toolsCfgFile = catPath(baseDir, 'sencha.cfg');
    if (!fileExists(toolsCfgFile)) {
        raise('Sencha Cmd folder (' + baseDir + ') is missing sencha.cfg - aborting');
    }

    var toolsCfg = readPropertiesFile(toolsCfgFile);

    cmd = 'java ' + (toolsCfg['cmd.jvm.args'] || '') +
          ' -jar ' + escapeCmdArg(catPath(baseDir, 'sencha.jar'));

    cmd += ' ' + escapeCmdLine(args);//echo('cmd: ' + cmd);
    exitCode = exec(cmd, null, true);//echo('exit: ' + exitCode);

    if(exitCode == 42) {
        // redirect code from sencha tools
        var redirectPath = procStdErr;
        cmd = escapeCmdArg(catPath(redirectPath, 'sencha.cmd'));
        cmd += ' ' + escapeCmdLine(args);//echo(cmd);
        exitCode = exec(cmd, null, false);
    }

    if (popDir) {
        shell.CurrentDirectory = curDir;
    }

    return exitCode;
}

//-----------------------------------------------------------------------------
// General WSH utilities from here until the built-in test code

function callMain () {
    var exitCode;

    try {
        var argv = WScript.Arguments,
            args = [],
            n = argv.length;

        for (var i = 0; i < n; ++i) {
            args.push(argv(i));
        }

        //echo('args: ' + args.join('\n'));
        //exitCode = main(args) || 0;
    } catch (e) {
        echo('');
        echo('ERROR: ' + e.message);
        exitCode = 1;
    }
        exitCode = main(args) || 0;

    WScript.Quit(exitCode);
}

function catPath (folder, sub) {
    var i = 1;

    do {
        sub = arguments[i++];
        if (sub.charAt(0) == '\\') {
            sub = sub.substr(1);
        }
        if (! /\\$/.test(folder)) {
            folder += '\\';
        }
        if (sub) {
            folder += sub;
        }
    } while (i < arguments.length);

    return folder;
}

function echo (line) {
    if (typeof line == 'string') {
        WScript.Echo(line);
    } else {
        for (var i = 0; i < line.length; ++i) {
            WScript.Echo(line[i]);
        }
    }

    return line;
}

function eachFile (path, fn) {
    for (var files = enumFiles(path); !files.atEnd(); files.moveNext()) {
        if (fn(files.item()) === false) {
            break;
        }
    }
}

function eachFileName (path, fn) {
    eachFile(path, function (file) {
        return fn(file.Name);
    });
}

function eachFolder (path, fn) {
    for (var files = enumFolders(path); !files.atEnd(); files.moveNext()) {
        if (fn(files.item()) === false) {
            break;
        }
    }
}

function eachFolderName (path, fn) {
    eachFolder(path, function (file) {
        return fn(file.Name);
    });
}

function enumFiles (path) {
    var folder = getFolder(path);

    return folder ? new Enumerator(folder.Files) : new Enumerator();
}

function enumFolders (path) {
    var folder = getFolder(path);

    return folder ? new Enumerator(folder.SubFolders) : new Enumerator();
}

function escapeCmdArg (arg) {
    if (arg.indexOf(' ') < 0 && arg.indexOf('"') < 0) {
        return arg;
    }

    return '"' + arg + '"';
    
    // The following code does this the technically proper way, however, WSH seems to be
    // one of the few tools that does not process quotes and backslash escapes in the
    // (semi-)standard way. The standard way is documented here:
    // 
    // CommandLineToArgvW -
    //    http://msdn.microsoft.com/en-us/library/windows/desktop/bb776391(v=vs.85).aspx
    // 
    // The algorithm below is derived from:
    //
    // http://blogs.msdn.com/b/twistylittlepassagesallalike/archive/2011/04/23/everyone-quotes-arguments-the-wrong-way.aspx
    //

//    var backslash = '\\',
//        escaped = '"',
//        c, backslashCount;
//
//    for (var i = 0; i < arg.length; ++i) {
//        backslashCount = 0;
//        while (i < arg.length && arg.charAt(i) == backslash) {
//            ++backslashCount;
//            ++i;
//        }
//
//        if (i == arg.length) {
//            // escape each backslash
//            escaped += backslash.repeat(backslashCount * 2);
//            break;
//        }
//
//        c = arg.charAt(i);
//        if (c == '"') {
//            // escape each backslash and the quote:
//            escaped += backslash.repeat(backslashCount * 2 + 1);
//        } else {
//            // backslashes are only special when there is a following quote, so just add
//            // them normally:
//            escaped += backslash.repeat(backslashCount);
//        }
//
//        escaped += c;
//    }
//
//    return escaped + '"';
}

function escapeCmdLine (args) {
    var cmdline = [],
        i;

    for (i = 0; i < args.length; ++i) {
        cmdline.push(escapeCmdArg(args[i]));
    }

    return cmdline.join(' ');
}

function exec (cmdline, redirectStdOut, captureStdErr) {
    var process = shell.Exec(cmdline),
        stderr = "";

    if (redirectStdOut !== false) {
        while (!process.StdOut.AtEndOfStream) {
            WScript.StdOut.WriteLine(process.StdOut.ReadLine());
        }
    }

    if(captureStdErr === true) {
        while(!process.StdErr.AtEndOfStream) {
            stderr += process.StdErr.ReadLine();
        }
        procStdErr = stderr;
    }

    while (process.Status == 0) {
        WScript.Sleep(100);
    }

    return process.ExitCode;
}

function fileExists (name) {
    return fileSys.FileExists(name);
}

function folderExists (name) {
    name = trimPathSlash(name);

    return fileSys.FolderExists(name);
}

function getAbsolutePathName (path) {
    try {
        return fileSys.GetAbsolutePathName(path);
    } catch (e) {
        raise("getAbsolutePathName(" + path + "): " + e.description, e.number);
    }
}

function getCurDir () {
    return getAbsolutePathName('.');
}

function getBaseDir () {
    return getParentFolderName(WScript.ScriptFullName);
}

function getEnv (varName, defVal) {
    var value = shell.Environment("Process").Item(varName);

    if (defVal !== undefined && (value == null || value.length == 0)) {
        value = defVal;
    }

    return value;
}

function getFile (path) {
    try {
        return fileSys.GetFile(path);
    } catch (e) {
        return null;
    }
}

function getFolder (path) {
    path = path.trimTail('\\');

    try {
        return fileSys.GetFolder(path);
    } catch (e) {
        return null;
    }
}

function getParentFolderName (path, count) {
    try {
        var parent = path,
            n = count || 1;

        for (var i = 0; i < n; ++i) {
            parent = fileSys.GetParentFolderName(parent);
        }

        return parent;
    } catch (e) {
        raise('getParentFolderName(' + path + ', ' + count + '): ' + e.description, e.number);
    }
}

function raise (desc, err) {
    if (err instanceof Error) {
        raise(desc + " [" + err.description + "]", err.number);
    } else {
        throw new Error(err || 0x80004005, desc); // E_FAIL = 0x80004005
    }
}

function warn (msg) {
    echo('WARNING: ' + msg);
}

function readPropertiesFile (path) {
    if (!fileExists(path)) {
        return null;
    }

    var lines = textFileReadLines(path),
        properties = {};

    for (var i = 0; i < lines.length; ++i) {
        var line = lines[i],
            match = /^\s*([^#][^=]*)\s*=(.*)$/.exec(line);

        if (match) {
            //echo('property: ' + match[1]);
            //echo('value:    ' + match[2]);
            properties[match[1]] = match[2];
        }
    }

    return properties;
}

function textFileOpen (path, mode, create, format) {
    try {
        return fileSys.OpenTextFile(path, mode, create, format);
    } catch (e) {
        raise('openTextFile(' + path + ', ' + mode + ', ' + create + ', ' + format + '): ' +
              e.description, e.number);
    }
}

function textFileReadLines (path) {
    var file = textFileOpen(path, 1),
        lines = [];

    try {
        while (!file.atEndOfStream) {
            lines.push(file.ReadLine());
        }
    } catch (e) {
        raise('readTextFile(' + path + '): ' + e.description, e.number);
    } finally {
        file.Close();
    }

    return lines;
}

//----------------------------------------------------------------------------------

String.prototype.repeat = function (times) {
    var s = '';

    for (var i = times; i-- > 0; ) {
        s += this;
    }

    return s;
};

String.prototype.trimTail = function (ch) {
    var matches, t;
    
    if (typeof ch == 'string') {
        matches = function (c) {
            return c == ch;
        }
    } else {
        if (!ch) {
            ch = /\s/;
        }
        matches = function (c) {
            return ch.test(c);
        }
    }
    
    for (var i = this.length, ret = this; i-- > 0; ) {
        t = ret.substr(i, 1);
        if (!matches(t)) {
            break;
        }
        ret = ret.substr(0, i);
    }

    return ret;
}

//----------------------------------------------------------------------------------
// Some internal testing

function assert (b) {
    if (!b) {
        var args = Array.prototype.slice.call(arguments, 1);
        raise(args.join(''));
    }
}

function Expectation (obj) {
    this.actual = obj;
}

Expectation.prototype = {
    toBe: function (expected) {
        assert(this.actual === expected, 'Expected "', this.actual, '" toBe "', expected, '"');
    },
    toBeLE: function (expected) {
        assert(this.actual <= expected, 'Expected "', this.actual, '" <= "', expected, '"');
    },
    toBeLT: function (expected) {
        assert(this.actual < expected, 'Expected "', this.actual, '" < "', expected, '"');
    },
    toBeGE: function (expected) {
        assert(this.actual >= expected, 'Expected "', this.actual, '" >= "', expected, '"');
    },
    toBeGT: function (expected) {
        assert(this.actual > expected, 'Expected "', this.actual, '" > "', expected, '"');
    },
    toBeNE: function (expected) {
        assert(this.actual != expected, 'Expected "', this.actual, '" != "', expected, '"');
    },
    toEqual: function (expected) {
        assert(this.actual == expected, 'Expected "', this.actual, '" toEqual "', expected, '"');
    }
}

function expect (obj) {
    return new Expectation(obj);
}

function selfTest () {
    expect(catPath('foo\\', '\\bar')).toBe('foo\\bar');
    expect(catPath('foo\\', '\\bar', '\\boo')).toBe('foo\\bar\\boo');
    expect(catPath('foo', 'bar')).toBe('foo\\bar');
    expect(catPath('foo', 'bar\\', 'boo')).toBe('foo\\bar\\boo');
    expect(catPath('foo', 'bar', 'boo')).toBe('foo\\bar\\boo');
}

//----------------------------------------------------------------------------------

try {
    selfTest();
} catch (e) {
    echo('ERROR (SELF-TEST): ' + e.message);
    WScript.Quit(2);
}

callMain();