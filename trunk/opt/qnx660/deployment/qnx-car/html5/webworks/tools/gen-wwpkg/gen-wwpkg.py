#!/usr/bin/python
# ----------------------------------
# Generate the WebWorks BAR packages
# ----------------------------------

import platform, sys, os, inspect, string, subprocess, logging
import tempfile, zipfile, shutil
from optparse import OptionParser

currentDirectory = os.path.abspath(os.path.split(inspect.getfile( inspect.currentframe() ))[0])
cmd_subfolder = os.path.realpath(currentDirectory + "/../pymodules")
if cmd_subfolder not in sys.path:
     sys.path.insert(0, cmd_subfolder)



# --------------------------------
# Container for WebWorks packaging items
# --------------------------------
class ww_package:
    senchaToolsVersion = ""
    wwFrameWork = ""
    html5ToolsPath = ""
    html5AppsPath = ""
    bb10Path = ""
    appPath = ""
    tmpExportPath = ""
    tmpWebWorksPath = ""
    bbwp = ""
    packageInstallationPath = ""
    optimizedWebWorksPath = ""
    optimizedAppPath = ""
    originalPath = ""


# --------------------------------
# Move WebWork Application Bar
# --------------------------------
def ww_move_application(wwBarFilePath, applicationDestinationPath):
    if os.path.exists(applicationDestinationPath) == True:
        verbo_print(0, "[verbose]: Removing previously-installed bar file: [" + applicationDestinationPath + "]")
        os.remove(applicationDestinationPath)

    verbo_print(0, "[verbose]: moving bar file (%s) to destination (%s)\n", (wwBarFilePath, applicationDestinationPath))
    try:
        shutil.move(wwBarFilePath, applicationDestinationPath)
    except shutil.Error as err:
        print "[error]: moving bar file (%s) to destination (%s)\n%s" % (wwBarFilePath, applicationDestinationPath, err)
        return False
    return True

# --------------------------------
# Package a WebWorks Application
# --------------------------------
def ww_packageApp(path, packagingCommand):
    os.chdir(path)
    if arg_parser().options.verbose <= 0:
		if "win" in platform.system().lower():
			packagingCommand += " > NUL"
		else:
			packagingCommand += " > /dev/null"
    else:
        verbo_print(0, "[verbose]: Calling WebWorks Packaging Command: [" + packagingCommand + "]")

    returnCode = os.system(packagingCommand)
    if returnCode != 0:
        raise RuntimeError("[error]: Running [%s]" % packagingCommand)

# --------------------------------
# Print verbose messages
# --------------------------------
def verbo_print(minimumVerboseLevel, message, args=None):
    if arg_parser().options.verbose > minimumVerboseLevel:
        if  args != None:
            print message % args
        else:
            print message

# --------------------------------
# Remove inclusion of sencha-touch-all.js during Sencha Optimization
# --------------------------------
def remove_sencha_include(file):
    verbo_print(2, "[debug]: Removing sencha inclusion from [%s]", file)
    f = open(file)
    lines = f.readlines()
    f.close()

    f = open(file, "w")
    for line in lines:
        if not "sencha-touch-all.js" in line:
            f.write(line)
    f.close()


# --------------------------------
# Zip application contents previous to packaging the WebWorks Bar.
# --------------------------------
def ww_zip(zipFilePath):
    appZipFile = zipfile.ZipFile(zipFilePath, mode='w')

    rootlen = len(os.curdir) + 1
    for base, dirs, files in os.walk(os.curdir):
        for file in files:
            fn = os.path.join(base, file)
            appZipFile.write(fn, fn[rootlen:])

    appZipFile.close()


# --------------------------------
# Parameters and Arguments
# --------------------------------
class arg_parser:
    opt = OptionParser()
    opt.description = __doc__
    opt.set_usage("usage: %prog [options] -o output-path [Application-1] [Application-n]")

    opt.add_option("-v", "--verbose",
            action='count', dest='verbose',
            help="increase verbosity")

    opt.add_option("-o", "--output-path",
            action='store', type="string", dest='outputPath',
            help="The output path for the generated bar files.")

    opt.add_option("-p", "--application-path",
            action='store', type="string", dest='applicationPath',
            help="The location of the Applications to package.")

    opt.add_option("-s", "--sencha-tools-version",
            action='store', type="string", dest='senchaToolsVersion', default="3.0.2.288",
            help="Specify the Sencha Tools version to use.")

    opt.add_option("-x", "--debug",
            action='count', dest='debug',
            help="Debug (keeps temporary folders)")

    opt.add_option("-w", "--webworks-version",
            action='store', type="string", dest='wwFrameWork', default="BB10webworks-1.0.4.11",
            help="Specify the WebWorks version to use.")

    opt.add_option("-E","--no-export",
            action='store_false', dest='exportSVN', default=True,
            help="Do not attempt to export WebWorks from SVN.")

    opt.add_option("-O","--sencha-optimize",
            action='store_true', dest='optimize', default=False,
            help="Optimize Sencha Application(s).")

    opt.add_option("-S","--sencha-tool-path",
            action='store', type="string", dest='senchaToolsDir', default=None,
            help="Specify the path to the SenchaCMD tools directory")

    opt.add_option("-W","--webworks-path",
            action='store', type="string", dest='webWorksPath', default=None,
            help="Specify the path to the webworks/ directory")

    opt.add_option("-C","--common-path",
            action='store', type="string", dest='commonPath', default=None,
            help="Specify the path to the common/ folder")


    (options, packages) = opt.parse_args()

    if not options.outputPath or not os.path.isdir(options.outputPath):
        opt.error("--output-path is required.")


# --------------------------------
# Package the list of application in both
# debug and optimized packages.
# --------------------------------
def package_webwork_application(applicationList, optimize=False):
    installedPackages = []
    for application in applicationList:
        tmpApplicationPath = os.path.join(ww_package().appPath, application)

        # --------------------------
        # Ensure valid webworks application
        # --------------------------
        if not os.path.exists(os.path.join(tmpApplicationPath, "webworks")):
            verbo_print(1, "[warning]: Skipping Invalid Application Folder: [%s]." % application )
            continue

        # --------------------------
        # Ensure we are to package
        # --------------------------
        executePackaging = False
        if len(arg_parser().packages) > 0:
            for package in arg_parser().packages:
                if string.lower(package) == string.lower(application):
                    executePackaging = True
                elif string.lower(package) == "1":
                    executePackaging = True
                continue
        else:
            executePackaging = True

        if executePackaging == False:
            verbo_print(3, "[debug]: Application [%s] doesn't match any specified application (%s)." % (string.lower(application), arg_parser().packages))
            continue


        # --------------------------
        # Move the webworks configuration file into the application source directory
        # --------------------------
        if os.path.isdir(os.path.join(tmpApplicationPath, "webworks")):
            for webworksItem in os.listdir(os.path.join(tmpApplicationPath, "webworks")):
                if os.path.isdir(os.path.join(tmpApplicationPath, "webworks", webworksItem)):
                    shutil.copytree(os.path.join(tmpApplicationPath, "webworks", webworksItem), tmpApplicationPath)
                else:
                    shutil.copy(os.path.join(tmpApplicationPath, "webworks", webworksItem), tmpApplicationPath)
            shutil.rmtree(os.path.join(tmpApplicationPath, "webworks"))

        # --------------------------
        # Check whether it's a Sencha application (used for optimization)
        # --------------------------
        isSencha = False
        senchaJsonFile = os.path.join(tmpApplicationPath, "app.json")
        if os.path.exists(senchaJsonFile):
            isSencha = True
        verbo_print(0, "[verbose]: isSencha (%s): [%s]", (senchaJsonFile, isSencha))

        # --------------------------
        # zip the source in preparation for packaging
        # --------------------------
        os.chdir(tmpApplicationPath)

        zipFileName = application + ".zip"
        zipFilePath = os.path.join(ww_package().tmpWebWorksPath,zipFileName)
        verbo_print (0, "[verbose]: Creating zip file: [" + zipFilePath + "]")

        ww_zip(zipFilePath)

        # --------------------------
        # WebWorks Packaging
        # --------------------------
        wwPackagingCommand = ww_package().bbwp + " " + zipFileName + " -d"
        ww_packageApp(ww_package().tmpWebWorksPath, wwPackagingCommand)

        # --------------------------
        # Add un-optimized bar package
        # --------------------------
        applicationBarFileName = application + ".bar"

        wwBarFilePath = os.path.join(ww_package().tmpWebWorksPath, "device", applicationBarFileName)
        if os.path.exists(wwBarFilePath) != True:
            print "[error]: WebWorks bar file not generated (%s)" % wwBarFilePath
            sys.exit(1)

        # --------------------------
        # Move the generated bar file to the destination
        # --------------------------
        if arg_parser().options.optimize == True and isSencha == True:
            applicationBarFileName = application + ".debug.bar"

        applicationDestinationPath = os.path.join(ww_package().packageInstallationPath, applicationBarFileName)
        if ww_move_application(wwBarFilePath, applicationDestinationPath) == False:
            sys.exit(1)

        installedPackages.append(applicationDestinationPath)

        # --------------------------
        # Optimize Application
        # --------------------------
        if arg_parser().options.optimize == True and isSencha == True:
            print "Optimize ", application

            # --------------------------
            # Remove the un-optimized zip file
            # --------------------------
            verbo_print(0, "[verbose]: Removing zip file: [%s]", zipFilePath)
            os.remove(zipFilePath)

            # --------------------------
            # Remove inclusion statement of sencha-all.js from the index.html page
            # --------------------------
            remove_sencha_include(os.path.join(ww_package().appPath, application, "index.html"))

            # --------------------------
            # Prepare for Sencha optimization
            # --------------------------
            os.chdir(tmpApplicationPath)
            platformSystem = platform.system()
            senchaToolsDir = os.path.join(ww_package().tmpHtml5ToolsPath, "SenchaCMD", ww_package().senchaToolsVersion, platformSystem)
            senchaEnvDir = os.path.join(senchaToolsDir,"sencha.env")

            # --------------------------
            # Copy in sencha.env/ items
            # --------------------------
            for item in os.listdir(senchaEnvDir):
                verbo_print(0, "[info]: Copying [%s] from [%s] to [%s].", (item, senchaEnvDir, tmpApplicationPath))
                senchaEnvItemPath = os.path.join(senchaEnvDir,item)

                try:
                    if os.path.isfile(senchaEnvItemPath):
                        shutil.copy(senchaEnvItemPath, tmpApplicationPath)
                    else:
                        shutil.copytree(senchaEnvItemPath, os.path.join(tmpApplicationPath,item))
                except shutil.Error as err:
                    print "[error]: copying %s to destination from: [%s]" % (item,tmpApplicationPath)
                    continue

            # --------------------------
            # Sencha Optimization
            # --------------------------
            if not os.path.exists(senchaToolsDir):
                print "[warning]: Sencha Tools Directory not available for optimization: [%s]" % senchaToolsDir
                print "[warning]: Trying system's [sencha] command..."
                if arg_parser().options.verbose > 3:
                    senchaCommand = "sencha -d"
                else:
                    senchaCommand = "sencha -q"
            else:
                if arg_parser().options.verbose > 3:
                    senchaCommand = os.path.join(senchaToolsDir,"sencha") + " -d"
                else:
                    senchaCommand = os.path.join(senchaToolsDir,"sencha") + " -q"


            verbo_print(0, "[verbose]: Running Sencha command: [%s]", senchaCommand)
            returnCode = subprocess.call(senchaCommand + " app build", stdin=None, stdout=None, stderr=None, shell=True)
            if returnCode != 0:
                print "[error]: Sencha Command Failed. (No optimization is possible)."
                sys.exit(returnCode)

            # --------------------------
            # Move to optimized location
            # --------------------------
            ww_package.optimizedWebWorksPath = os.path.join(ww_package().appPath, application, "build", "webworks")
            ww_package.optimizedAppPath = os.path.join(ww_package().optimizedWebWorksPath, "production")
            os.chdir(ww_package().optimizedAppPath)

            # --------------------------
            # Zip the optimized source in preparation for packaging
            # --------------------------
            zipFilePath = os.path.join(ww_package().optimizedWebWorksPath, zipFileName)
            verbo_print(0, "[verbose]: Creating zip file: [" + zipFilePath + "]")
            ww_zip(zipFilePath)

            # --------------------------
            # Package the optimized application
            # --------------------------
            ww_packageApp(ww_package().optimizedWebWorksPath, wwPackagingCommand)

            # --------------------------
            # Move the generated bar file to the destination
            # --------------------------
            applicationBarFileName = application + ".bar"
            wwBarFilePath = os.path.join(ww_package().optimizedWebWorksPath, "device", applicationBarFileName)
            applicationDestinationPath = os.path.join(ww_package().packageInstallationPath, applicationBarFileName)

            if ww_move_application(wwBarFilePath, applicationDestinationPath) == False:
                sys.exit(1)

            installedPackages.append(applicationDestinationPath)


    return installedPackages


# --------------------------
# MAIN
# --------------------------
def main(argv):

    ww_package.originalPath = os.getcwd()

    # --------------------------
    # Determine location of applications and tools
    # --------------------------
    html5BasePath = os.path.realpath(os.path.join(currentDirectory, "..", "..", ".."))

    ww_package.packageInstallationPath = arg_parser().options.outputPath
    ww_package.wwFrameWork = arg_parser().options.wwFrameWork
    ww_package.senchaToolsVersion = arg_parser().options.senchaToolsVersion

    if not arg_parser().options.webWorksPath:
        arg_parser.options.webWorksPath = os.path.join(html5BasePath, "webworks")

    if not arg_parser().options.commonPath:
        arg_parser.options.commonPath = os.path.join(html5BasePath, "common")

    if not arg_parser().options.senchaToolsDir:
        arg_parser.options.senchaToolsDir = os.path.join(html5BasePath, "tools", "SenchaCMD")

    ww_package.html5ToolsPath = os.path.join(html5BasePath, "tools")
    ww_package.html5AppsPath = os.path.join(html5BasePath, "apps")
    verbo_print(3, "[verbose]: Original HTML5 WebWorks    Path: [%s]" % arg_parser().options.webWorksPath)
    verbo_print(3, "[verbose]: Original HTML5 Common      Path: [%s]" % arg_parser().options.commonPath)
    verbo_print(3, "[verbose]: Original HTML5 SenchaTools Path: [%s]" % arg_parser().options.senchaToolsDir)

    # --------------------------
    # Export webworks and tools out of SVN
    # --------------------------
    ww_package.tmpExportPath = tempfile.mkdtemp()
    ww_package.tmpWebWorksPath = os.path.join(ww_package().tmpExportPath, "webworks")
    ww_package.tmpHtml5AppsPath = os.path.join(ww_package().tmpWebWorksPath, "apps")
    ww_package.tmpHtml5ToolsPath = os.path.join(ww_package().tmpWebWorksPath, "tools")
    if arg_parser().options.exportSVN == True:
        DEVNULL = open(os.devnull, 'w')

        # WebWorks
        svnExportCommand = "svn export " + arg_parser().options.webWorksPath + " " + ww_package().tmpWebWorksPath + " --force"
        verbo_print(0, "[verbose]: SVN Export Command: [" + svnExportCommand + "]")
        subprocess.call(svnExportCommand, stdin=None, stdout=DEVNULL, stderr=DEVNULL, shell=True)

        # Web Tools
        svnExportCommand = "svn export " + arg_parser().options.senchaToolsDir + " " + os.path.join(ww_package().tmpHtml5ToolsPath, "SenchaCMD") + " --force"
        verbo_print(0, "[verbose]: SVN Export Command: [" + svnExportCommand + "]")
        subprocess.call(svnExportCommand, stdin=None, stdout=DEVNULL, stderr=DEVNULL, shell=True)

        # Apps
        svnExportCommand = "svn export " + ww_package().html5AppsPath + " " + ww_package().tmpHtml5AppsPath + " --force"
        verbo_print(0, "[verbose]: SVN Export Command: [" + svnExportCommand + "]")
        subprocess.call(svnExportCommand, stdin=None, stdout=DEVNULL, stderr=DEVNULL, shell=True)
        DEVNULL.close()

    # --------------------------
    # Copy webworks and tools to temporary destination
    # --------------------------
    try:
        # WebWorks
        if not os.path.isdir(ww_package().tmpWebWorksPath):
            verbo_print(0, "[verbose]: Copy Command: [" + arg_parser().options.webWorksPath + "] -> [" + ww_package().tmpWebWorksPath + "]")
            shutil.copytree(arg_parser().options.webWorksPath, ww_package().tmpWebWorksPath)

        # Web Tools
        if not os.path.isdir(os.path.join(ww_package().tmpHtml5ToolsPath, "SenchaCMD")):
            verbo_print(0, "[verbose]: Copy Command: [" + arg_parser().options.senchaToolsDir + "] -> [" + ww_package().tmpHtml5ToolsPath + "]")
            shutil.copytree(arg_parser().options.senchaToolsDir, os.path.join(ww_package().tmpHtml5ToolsPath, "SenchaCMD"))

        # Apps
        if not os.path.isdir(ww_package().tmpHtml5AppsPath):
            verbo_print(0, "[verbose]: Copy Command: [" + ww_package().html5AppsPath + "] -> [" + ww_package().tmpHtml5AppsPath + "]")
            shutil.copytree(ww_package().html5AppsPath, ww_package().tmpHtml5AppsPath)

    except shutil.Error as err:
        print "[error]: copy failed.", err
        sys.exit(1)


    # --------------------------
    # Copy common files to temporary destinatiom
    # --------------------------
    try:
        verbo_print(0, "[verbose]: Copy Command: [" + arg_parser().options.commonPath + "] -> [" + os.path.join(ww_package().tmpExportPath, "common") + "]")
        shutil.copytree(arg_parser().options.commonPath, os.path.join(ww_package().tmpExportPath, "common"))

    except shutil.Error as err:
        print "[error]: copy failed.", err
        sys.exit(1)


    if arg_parser().options.applicationPath != None:

        tmpUserDefinedApplicationPath= os.path.join(ww_package().tmpWebWorksPath,"user-defined-applications")
        # --------------------------
        # SVN export the application directory into the temporary location.
        # --------------------------
        if arg_parser().options.exportSVN == True:
            DEVNULL = open(os.devnull, 'w')
            svnExportCommand = "svn export " + arg_parser().options.applicationPath + " " + tmpUserDefinedApplicationPath + " --force"
            verbo_print(0, "[verbose]: SVN Export Command: [" + svnExportCommand + "]")
            subprocess.call(svnExportCommand, stdin=None, stdout=DEVNULL, stderr=None, shell=True)
            DEVNULL.close()

        # --------------------------
        # Direct copy the application directory into the temporary location.
        # --------------------------
        if arg_parser().options.exportSVN == False or not os.path.isdir(tmpUserDefinedApplicationPath):
            if arg_parser().options.exportSVN == True:
                print "[warning]: svn export failed.  Reverting to direct copy..."
            try:
                verbo_print(0, "[verbose]: Copy Command: [" + arg_parser().options.applicationPath + "] -> [" + tmpUserDefinedApplicationPath + "]")
                shutil.copytree(arg_parser().options.applicationPath, tmpUserDefinedApplicationPath)
            except shutil.Error as err:
                print "[error]: copy failed.", err
                sys.exit(1)

        ww_package.appPath = tmpUserDefinedApplicationPath
    else:
        ww_package.appPath = os.path.join(ww_package().tmpWebWorksPath, "apps")

    ww_package.bb10Path = os.path.join(ww_package().tmpWebWorksPath, "tools", ww_package().wwFrameWork)
    ww_package.bbwp = os.path.join(ww_package().bb10Path, "bbwp")

    if os.path.exists(ww_package().appPath) != True:
        print "Error: Application Path not found: [%s]" % ww_package().appPath
        sys.exit(1)

    # --------------------------
    # Package each application (optimized and non-optimized)
    # --------------------------
    print "Packaging WebWorks Packages..."
    installedPackages = package_webwork_application(os.listdir(ww_package().appPath), False)

    # --------------------------
    # Print what we've packaged
    # --------------------------
    for package in installedPackages:
        print package

    # --------------------------
    # Remove temporary path
    # --------------------------

    # Ensure we're not in the temporary WebWorks path before removing it.
    os.chdir(ww_package().originalPath)

    if arg_parser().options.debug == None:
        verbo_print(0, "[verbose]: Removing temp path: [" + ww_package().tmpExportPath + "]")
        shutil.rmtree(ww_package().tmpExportPath)

    if len(installedPackages) == 0:
        print "[error]: No Applications were packaged."
        sys.exit(1)

    sys.exit(0)

if __name__ == '__main__':
    import sys
    sys.stdout = os.fdopen(sys.stdout.fileno(), 'w', 0)
    sys.exit(main(sys.argv) or 0)
