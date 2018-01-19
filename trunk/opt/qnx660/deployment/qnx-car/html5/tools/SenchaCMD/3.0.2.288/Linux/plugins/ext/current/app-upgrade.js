var _logger = SenchaLogManager.getLogger("app-upgrade");

function runAppUpgrade (proj) {
    var //basedir = proj.getProperty("basedir"),
        newSdkPath = proj.getProperty("framework.dir"),
        appPath = proj.getProperty('app.dir'),
        //appConfigPath = proj.getProperty('app.config.dir'),
        workspacePath = proj.getProperty("workspace.dir"),
        hasSenchaDir = new File(appPath, ".sencha").exists();

    if (!hasSenchaDir) {
        _logger.error("Unable to locate .sencha folder");
        _logger.error("Please ensure this folder is a valid v3 ExtJS application");
        throw new ExState("No .sencha directory found");
    }

    var frameworkName = proj.getProperty("framework.name"),
        appName = proj.getProperty("app.name"),
        appSdkPath = resolvePath(proj.getProperty(frameworkName + ".dir")),
        oldSdkVersion = proj.getProperty("framework.version"),
        appBackupPath = resolvePath(appPath, ".sencha_backup", appName, oldSdkVersion),
        sdkBackupPath = resolvePath(workspacePath, ".sencha_backup", frameworkName, oldSdkVersion),
        generateCmd = [
            "--sdk-path=" + newSdkPath,
            "generate",
            "app",
            "-upgrade",
            appName,
            appPath
        ],
        appBackupExcludes = [
            ".sencha_backup/**/*"
        ],
        sencha = new Sencha(),
        appVerStr = proj.getProperty("app.cmd.version") || "0.0.0.0",
        appVer = new Version(appVerStr);

    if (!exists(sdkBackupPath)) {
        _logger.info("Backing up framework files from {} to {}",
                appSdkPath,
                sdkBackupPath);

        moveFiles(proj, appSdkPath, sdkBackupPath);
    }

    _logger.info("Backing up application files from {} to {}",
            appPath,
            appBackupPath);

    if (isChildPath(appPath, appSdkPath)) {
        _logger.debug("excluding framework files from app backup");
        appBackupExcludes.push(PathUtil.getRelativePath(appPath, appSdkPath) + "/**/*");
    }

    copyFiles(proj, appPath, appBackupPath, ["**/*"].join(','), appBackupExcludes.join(','));

    _logger.info("Updating application and workspace files");
    _logger.debug("running command : sencha " + generateCmd.join(" "));

    // if this is a pre 3.0.1 app, we'll need to update the theme structure
    if (new Version('3.0.1').compareTo(appVer) > 0) {

        var fwConfigDir = proj.getProperty("framework.config.dir"),
            appTemplatePath = resolvePath(
                fwConfigDir, 
                'templates', 
                'App', 
                'packages'),
            //appName = proj.getProperty('app.name'),
            //frameworkName = proj.getProperty('framework.name'),
            frameworkPath = PathUtil.convertPathCharsToUnix(
                PathUtil.getRelativePath(appPath, appSdkPath)),
            oldThemePath = resolvePath(appPath, "resources", "theme"),
            oldSassPath = resolvePath(appPath, "resources", "sass"),
            newThemePath = resolvePath(appPath, "packages"),
            files = new File(oldThemePath)
                .listFiles(), 
            len = files.length, 
            file, f,
            themeNames = [],
            themeName, newThemeName, t,
            srcLocation, dstLocation;
    
        for (f = 0; f < len; f++) {
            file = files[f];
            if (file.isDirectory()) {
                themeNames.push(file.getName());
            }
        }
        
        deleteFile(oldThemePath); // the ./resources/theme folder is no more
        len = themeNames.length;

        for (t = 0; t < len; t++) {
            themeName = themeNames[t];
            newThemeName = themeName;
            if (newThemeName == 'default') {
                newThemeName = 'theme';
            }
        
            _logger.info("Upgrading theme {}", themeName);

            srcLocation = resolvePath(oldSassPath, themeName);
            dstLocation = resolvePath(newThemePath, newThemeName, "sass");
            _logger.info("Upgrading sass theme location from {} to {}",
                srcLocation, dstLocation);

            moveFiles(proj, srcLocation, dstLocation);
            deleteFile(resolvePath(dstLocation, 'config.rb')); // not upgradable
            deleteFile(srcLocation);
            
            _logger.info("Regenerating theme files for theme {}", themeName);
            generateTemplates(appTemplatePath, newThemePath, {
                'name': newThemeName,
                'themeName': newThemeName,
                'appName': appName,
                'frameworkName': frameworkName,
                'frameworkPath': frameworkPath
            });
        
            var appScssFile = resolvePath(dstLocation, "app.scss"),
                appScss = readFileContent(appScssFile) + '',
                themeNameSetter = "$theme-name: '" + newThemeName + "';";
            
            // ensure that the app scss file declares the name of the theme
            if (appScss.indexOf(themeNameSetter) === -1) {
                writeFileContent(
                    appScssFile, 
                    themeNameSetter + StringUtil.NewLine + appScss);
            }

            // update the app's index.html file to replace references to the old
            // generated css location

            var appIndex = resolvePath(appPath, "index.html"),
                appIndexFile = new File(appIndex);

            if (appIndexFile.exists()) {
                var origRef = "resources/css/" + themeName + "/app.css",
                    newRef = "resources/" + newThemeName + "/app.css";
                var appIndexContent = readFileContent(appIndex);
                _logger.debug(
                    "Updating all index.html references from {} to {}",
                    origRef, newRef);
                appIndexContent = StringUtil.replace(appIndexContent, origRef, newRef);
                writeFileContent(appIndex, appIndexContent);
            }
        }
    }

    sencha.dispatch(generateCmd);

    _logger.debug("removing unused app.json file");
    FileUtil['delete'](resolvePath(appPath, "app.json"));

    _logger.info("A backup of pre-upgrade application files is available at {}",
            appBackupPath);
}

(function (proj) {
    _logger.info("building application");
    runAppUpgrade(proj);
})(project);
