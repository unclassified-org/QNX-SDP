var _logger = SenchaLogManager.getLogger("app-upgrade");

function removeBuildPathsFromConfig(configFile) {
    var configData = readConfig(configFile);
    if(configData.buildPaths) {
        delete configData.buildPaths;
    }
    writeFileContent(configFile, jsonEncode(configData, true));
}

function runAppUpgrade(proj) {
    var basedir = proj.getProperty("basedir"),
        newSdkPath = proj.getProperty("args.path"),
        appPath = resolvePath("."),
        hasSenchaSdkFile = new File(appPath, ".senchasdk").exists(),
        hasSenchaDir = new File(appPath, ".sencha").exists();

    // v2 app
    if(hasSenchaSdkFile && !hasSenchaDir) {

        // backup packager.json
        // backup app.json
        // backup .senchasdk target directory
        // generate app locally from new framework
        // update app.json paths to .senchasdk stuff to framework.dir
        // delete .senchasdk

        var appSdkFile = resolvePath(appPath, '.senchasdk'),
            appSdkPtr =  FileUtil.readFile(appSdkFile).trim(),
            appSdkPath = resolvePath(appPath, appSdkPtr),
            appConfigFile = resolvePath(appPath, "app.json"),
            appConfig = readConfig(appConfigFile),
            oldSdkVersion = FileUtil.readFile(resolvePath(appSdkPath, "version.txt")).trim(),
            appBackupPath = resolvePath(appPath, ".sencha_backup", appName, oldSdkVersion),
            sdkBackupPath = resolvePath(appBackupPath, appSdkPtr),
            appName = appConfig.name,
            generateCmd = [
                "--sdk-path=" + newSdkPath,
                "generate",
                "app",
                "-upgrade",
                appName,
                appPath
            ],
            sencha = new Sencha(),
            newAppConfig,
            frameworkPath,
            relativePath,
            appFiles = [
                ".senchasdk",
                "app.js",
                "app.json",
                "packager.json",
                "index.html",
                "resources/sass/config.rb"
            ];

        _logger.debug("Backing up application sdk from {} to {}",
            appSdkPath,
            sdkBackupPath);

        moveFiles(proj, appSdkPath, sdkBackupPath);

        _logger.info("Renamed {} to {} for backup", appSdkPath, sdkBackupPath);

        _logger.debug("Backing up application specific files");

        copyFiles(proj, appPath, appBackupPath, "**/*", ".sencha_backup/**/*");

        _logger.info("Creating new application structure");

        _logger.debug(generateCmd.join(" "));
        sencha.dispatch(generateCmd);

        _logger.info("Updating references to framework files");

        newAppConfig = new SenchaConfigManager(appPath).getConfig();
        frameworkPath = newAppConfig.get("framework.dir");
        relativePath =
            (PathUtil.getRelativePath(appPath, frameworkPath) + '').replace("\\", "/");

        if(endsWith(relativePath, "/")) {
            relativePath = relativePath.substring(0, relativePath.length - 1);
        }

        _logger.debug("Updating file references from path '{}' to path '{}'",
            appSdkPtr,
            relativePath)

        each(appFiles, function(file){
            var fileData = readFileContent(file);

            // prop: "sdk/...
            fileData = StringUtil.replace(
                fileData,
                "\"" + appSdkPtr,
                "\"" + relativePath);

            // prop: 'sdk/...
            fileData = StringUtil.replace(
                fileData,
                "'" + appSdkPtr,
                "'" + relativePath);

            writeFileContent(file, fileData);
        });

        deleteFile(appSdkFile);

        _logger.debug("Removing deprecated 'buildPaths' property from app.json");
        removeBuildPathsFromConfig(appConfigFile);

        // set the app config path for sencha.cfg update downstream
        proj.setProperty("app.ir", appPath);
        proj.setProperty("app.config.dir", [appPath, '.sencha', 'app'].join(File.separator));

    }
    // v3 app
    else if(hasSenchaDir) {

        var frameworkName = proj.getProperty("framework.name"),
            appName = proj.getProperty("app.name"),
            appConfigFile = resolvePath(appPath, "app.json"),
            workspacePath = proj.getProperty("workspace.dir"),
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
            sencha = new Sencha();

        if(!exists(sdkBackupPath)) {
            _logger.info("Backing up framework files from {} to {}",
                appSdkPath,
                sdkBackupPath);

            moveFiles(proj, appSdkPath, sdkBackupPath);
        }

        _logger.info("Backing up application files from {} to {}",
            appPath,
            appBackupPath);

        if(isChildPath(appPath, appSdkPath)) {
            _logger.debug("excluding framework files from app backup");
            appBackupExcludes.push(PathUtil.getRelativePath(appPath, appSdkPath) + "/**/*");
        }

        copyFiles(proj, appPath, appBackupPath, ["**/*"].join(','), appBackupExcludes.join(','));

        _logger.info("Updating application and workspace files");
        _logger.debug("running command : sencha " + generateCmd.join(" "));

        sencha.dispatch(generateCmd);

        _logger.debug("Removing deprecated 'buildPaths' property from app.json");
        removeBuildPathsFromConfig(appConfigFile);


        _logger.info("A backup of pre-upgrade application files is available at {}", 
            appBackupPath);

    } else if(!hasSenchaSdkFile) {

        _logger.error("Unable to locate .senchasdk file or .sencha folder");
        _logger.error("Please ensure this folder is a valid v2 or v3 Sencha Touch application");
        throw new ExState("No .senchasdk file or .sencha directory found");

    }

};

(function (proj) {
    _logger.info("building application");
    runAppUpgrade(proj);
})(project);