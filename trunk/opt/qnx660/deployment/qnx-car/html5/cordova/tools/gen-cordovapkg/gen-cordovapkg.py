#!/usr/bin/python
# ----------------------------------
# Generate the WebWorks/Cordova BAR packages
# ----------------------------------

import platform, sys, os, string, subprocess, logging
import tempfile, shutil, uuid, inspect, zipfile
from optparse import OptionParser

currentScriptDirectory = os.path.abspath(os.path.split(inspect.getfile( inspect.currentframe() ))[0])

def ensureTool(tool):
    returnCode = False
    DEVNULL = open(os.devnull, 'w')

    verbo_print(2, "[verbose]: Ensure [%s] is availble on the system..." % tool )

    try:
        subprocess.check_call(tool, stdin=None, stdout=DEVNULL, stderr=DEVNULL, shell=True)
        returnCode = True
    except:
        returnCode = False
        verbo_print(0, "[error]: Command not found: [" + tool + "]")

    DEVNULL.close()
    return returnCode


def exportDirectory(source, destination, type=None):
    """ Helper Function to Export Paths out of Filesystem/SVN/GIT """
    checkoutCommand = None

    if source.endswith("/"):
        source = source[:-1]

    if source.startswith("~"):
        source = os.path.expanduser(source)

    sourceName = os.path.basename(source)

    if os.path.exists(source):
        # Svn Export From a Local Path
        if arg_parser().options.exportSVN == True:
            DEVNULL = open(os.devnull, 'w')
            svnExportCommand = "svn export " + source + " " + os.path.join(destination, sourceName) + " --force"
            verbo_print(0, "[verbose]: SVN Export Command: [" + svnExportCommand + "]")
            try:
                subprocess.check_call(svnExportCommand, stdin=None, stdout=DEVNULL, stderr=DEVNULL, shell=True)
                svnSuccess = True
            except:
                svnSuccess = False
            DEVNULL.close()

        # Copy Recursively From a Local Path
        if arg_parser().options.exportSVN == False or svnSuccess == False:
            if arg_parser().options.exportSVN == True:
                print "[warning]: svn export failed.  Reverting to direct copy..."
            try:
                verbo_print(0, "[verbose]: Copy Command: [" + source + "] -> [" + os.path.join(destination, sourceName) + "]")
                shutil.copytree(source, os.path.join(destination, sourceName))
            except shutil.Error as err:
                print "[error]: copy failed.", err
                sys.exit(1)
        return os.path.join(destination, sourceName)

    elif source.endswith(".git"):
        checkoutCommand = "git clone " + source + " " + sourceName


    else:
        checkoutCommand = "svn export " + source + " " + sourceName

    if checkoutCommand:
        originalPath = os.getcwd()
        os.chdir(destination)
        verbo_print(1, "[info]: Checking out with: [%s]" % checkoutCommand)
        returnCode = os.system(checkoutCommand)
        if returnCode != 0:
            raise RuntimeError("[error]: Running [%s]" % checkoutCommand)
        os.chdir(originalPath)

    return os.path.join(destination,sourceName)




class WebTools:
    """WebTool Class

    Each Application is built with a set of cordova tools.
    A single instance of the web tools object exists to perform
    all web tool building/packaging tasks.
    """

    def __init__(self):
        self.workspace = self.setupToolsWorkspace()
        self.cordovaPath = None
        self.cordovaPluginsPath = None

    def populate(self, location, checkoutName):
        """populate a tools' workspace"""
        exportedDirectory = exportDirectory(location, self.workspace, checkoutName)
        if checkoutName == "qnxSDKPath":
            self.cordovaPath = os.path.join(exportedDirectory, "cordova", "cordova-qnxcar")
            self.cordovaPluginsPath = os.path.join(exportedDirectory, "cordova", "cordova-qnxcar-plugins")
        else:
            print "[error]: Unknown Checkout Name: [%s]." % checkoutName
            sys.exit(1)

    def setPaths(self):
        # The SDK contains the BB Native Packager which needs to be available in the environment.
        hostPlatform = platform.system().lower()
        if hostPlatform == "windows":
            hostPlatform = "win32"
        pathToBBNativePackager = os.path.join(self.workspace, 'html5sdk', 'tools', 'packaging', hostPlatform, 'bin')
        verbo_print(3, "[verbo]: Adding HTML5 SDK bin/ path to $PATH: [%s]" % pathToBBNativePackager)
        if not os.path.exists(pathToBBNativePackager):
            verbo_print(0, "[warning]: No host-side native packaging tools found for this system (%s).  Reverting to \"linux\"..." % hostPlatform)
            pathToBBNativePackager = os.path.join(self.workspace, 'html5sdk', 'tools', 'packaging', 'linux', 'bin')

        os.environ['PATH'] = pathToBBNativePackager + ":" + os.environ['PATH']


    def setupToolsWorkspace(self):
        """Setup a temporary location to checkout/store the tools"""
        return tempfile.mkdtemp()

    def destroyWorkspace(self):
        """remove the Tools' workspace"""
        if os.path.exists(self.workspace):
            if arg_parser().options.keepWorkspace:
                verbo_print(0, "[debug]: Not Desstroying Tool Workspace: [%s]" % self.workspace)
            else:
                verbo_print(1, "[info]: Removing Tool Workspace: [%s]..." % self.workspace)
                shutil.rmtree(self.workspace)

    def __del__(self):
        self.destroyWorkspace()




class Application:
    """Application Class

    Each Application is built within its own workspace.

    This class defines this location as well as the application
    packaging method.
    """

    def __init__(self, pathToApplications, applicationName):

        self.applicationName = applicationName
        self.originalApplicationPath = os.path.join(pathToApplications,self.applicationName)
        self.applicationPath = ""

        self.isCordova = self.isCordovaApplication()
        if self.isCordova:
            self.applicationPath = self.setupApplicationWorkspace()
            self.cordovaWorkspace = os.path.join(self.applicationPath, "cordova_workspace")

        self.applicationPlugins = [] # List of plugins available to this application


    def isCordovaApplication(self):
        """Determine whether this is a cordova application"""
        if os.path.exists(os.path.join(self.originalApplicationPath, "cordova")):
            return True
        else:
            return False


    def setupApplicationWorkspace(self):
        """Setup a temporary location to build the application"""
        if self.isCordova:
            thisWorkspace = tempfile.mkdtemp()
            return exportDirectory(self.originalApplicationPath, thisWorkspace)
        else:
            return False


    def destroyApplicationWorkspace(self):
        """remove the application workspace"""
        if os.path.exists(self.applicationPath):
            if arg_parser().options.keepWorkspace:
                verbo_print(0, "[info]: Not Desstroying Workspace: [%s]" % self.applicationPath)
            else:
                verbo_print(1, "[info]: Removing Application Workspace: [%s]..." % self.applicationPath)
                shutil.rmtree(self.applicationPath)


    # TODO: This method should be broken up into logical units
    def package(self, tool):
        """Package the application"""

        if self.isCordova == False:
            print "[warning]: Application (%s) is not a cordova application." % self.applicationName
            return False


        # --------------------------------
        # create a base cordova app
        # --------------------------------
        verbo_print(1, "[info]: Creating a Cordova application structure...")
        createCommand = "create"
        if "win" in platform.system().lower():
            createCommand = "create.bat"
        cordovaCommand = os.path.join(tool.cordovaPath, "blackberry10", "bin", createCommand) + " " + self.cordovaWorkspace

        verbo_print(5, "[debug]: Calling: [%s]" % cordovaCommand)
        returnCode = os.system(cordovaCommand)
        if returnCode != 0 or not os.path.exists(os.path.join(self.cordovaWorkspace, "www")):
            raise RuntimeError("[error]: Running [%s]" % cordovaCommand)


        # --------------------------------
        # remove all of the files & folders we don't care about
        # --------------------------------
        verbo_print(1, "[info]: Removing files that aren't needed...")
        for file in ["lib", "css", "img", "js", "res", "spec", "spec.html", "config.xml", "index.html"]:
            fileToRemove = os.path.join(self.cordovaWorkspace, "www", file)
            if os.path.exists(fileToRemove):
                verbo_print(1, "[info]: Removing default-cordova file: [%s]" % fileToRemove)
                if os.path.isdir(fileToRemove):
                    shutil.rmtree(fileToRemove)
                elif os.path.isfile(fileToRemove):
                    os.remove(fileToRemove)
            else:
                print "[warning]: file/directory doesn't exist: [%s]" % fileToRemove


        # --------------------------------
        # copy the actual application into the cordova workspace
        # --------------------------------
        verbo_print(1, "[info]: Merging the application into the Cordova structure")
        for applicationItem in os.listdir(self.applicationPath):

            destinationPath = os.path.join(self.cordovaWorkspace, "www", applicationItem)
            sourcePath = os.path.join(self.applicationPath, applicationItem)

            if not os.path.exists(destinationPath):
                # Ensure not copying Cordova Workspace into itself
                if applicationItem != os.path.basename(self.cordovaWorkspace):
                    verbo_print(1, "[info]: Copying Application Item: [%s]..." % applicationItem)
                    if os.path.isdir(sourcePath):
                        shutil.copytree(sourcePath, destinationPath)
                    else:
                        shutil.copy(sourcePath, destinationPath)
            else:
                print "[warning]: Application Item Already Exists (Will Not be Copied): [%s] -> [%s]..." % (sourcePath, destinationPath)
                sys.exit(1)


        # --------------------------------
        # remove webworks files
        # --------------------------------
        if os.path.exists(os.path.join(self.cordovaWorkspace, "www", "webworks")):
            verbo_print(2, "[verbo]: removing webworks/...")
            shutil.rmtree(os.path.join(self.cordovaWorkspace, "www", "webworks"))
        else:
            print "[warning]: No webworks/ directory to remove."


        # --------------------------------
        # move the cordova files to their proper place
        # --------------------------------
        verbo_print(1, "[info]: Merging Cordova files")
        cordovaGeneratedWorkspace = os.path.join(self.cordovaWorkspace, "www", "cordova")
        for cordovaItem in os.listdir(cordovaGeneratedWorkspace):
            verbo_print(1, "[info]: Moving Cordova Item: [%s]..." % cordovaItem)

            # FIXME:  lib/ directory exists in both locations.
            if not os.path.exists(os.path.join(self.cordovaWorkspace, "www", cordovaItem)):
                shutil.move(os.path.join(cordovaGeneratedWorkspace, cordovaItem), os.path.join(self.cordovaWorkspace, "www"))
            else:
                raise RuntimeError("[error]: Cordova population: item exists: [%s]" % cordovaItem)
        shutil.rmtree(cordovaGeneratedWorkspace)


        # --------------------------------
        # figure out which plugins need to be loaded
        # --------------------------------
        verbo_print(1, "[info]: Determining which plugins to load")
        f = open(os.path.join(self.cordovaWorkspace, "www", "config.xml"))
        lines = f.readlines()
        f.close()

        for line in lines:
            if "<feature" in line and "name=\"com." in line:
                featureName = line[line.find("name=\"") + len("name=\""):]
                featureName = featureName.split("\"")[0]
                self.applicationPlugins.append(featureName)

        verbo_print(1, "[info]: Application Plugins:")
        for plugin in self.applicationPlugins:
            print " - [%s]" % plugin


        # --------------------------------
        # load the plugins
        # --------------------------------
        for plugin in self.applicationPlugins:
            verbo_print(1, "[info]: Loading plugin: [%s]..." % plugin)
            cordovaCommand = "plugman install --platform blackberry10 --project " + os.path.join(self.cordovaWorkspace)
            cordovaCommand += " --plugin " + os.path.join(tool.cordovaPluginsPath, "plugin", plugin)
            if arg_parser().options.verbose > 0:
                cordovaCommand += " --debug"

            verbo_print(5, "[debug]: Calling: [%s]" % cordovaCommand)
            returnCode = os.system(cordovaCommand)
            if returnCode != 0:
                raise RuntimeError("[error]: Running [%s]" % cordovaCommand)


        # --------------------------------
        # build the app
        # --------------------------------
        verbo_print(0, "[info]: Building the application: [%s]..." % self.applicationName)
        cordovaBuildCommand = os.path.join(self.cordovaWorkspace, "cordova", "build")
        cordovaBuildCommand += " --debug"
        verbo_print(1, "[info]: Build Application with: [%s]" % cordovaBuildCommand)
        returnCode = os.system(cordovaBuildCommand)
        if returnCode != 0:
            raise RuntimeError("[error]: Running [%s]" % cordovaBuildCommand)


    # --------------------------------
    # save the bar file, nuke the rest
    # --------------------------------
    def deploy(self, destinationPath):
        verbo_print(1, "[info]: Deploying the BAR file to: [%s]" % destinationPath)
        barFileSourceLocation = os.path.join(self.cordovaWorkspace, "build", "device", "qnxcarapp.bar")

        if move_application(barFileSourceLocation, os.path.join(destinationPath, self.applicationName + ".cordova.bar")):
            return True
        else:
            return False


    def __del__(self):
        self.destroyApplicationWorkspace()




def move_application(barFilePath, applicationDestinationPath):
    """Move Application Bar"""
    if os.path.exists(applicationDestinationPath) == True:
        verbo_print(0, "[warning]: Removing previously-installed bar file: [" + applicationDestinationPath + "]")
        os.remove(applicationDestinationPath)

    if not os.path.exists(barFilePath):
        verbo_print(0, "[error]: Supplied Application Bar File Doesn't Exist: [%s]" % barFilePath)
        return False

    verbo_print(0, "[verbose]: moving bar file (%s) to destination (%s)\n", (barFilePath, applicationDestinationPath))
    try:
        shutil.move(barFilePath, applicationDestinationPath)
    except shutil.Error as err:
        print "[error]: moving bar file (%s) to destination (%s)\n%s" % (barFilePath, applicationDestinationPath, err)
        return False

    return True




def verbo_print(minimumVerboseLevel, message, args=None):
    """Print verbose messages"""
    if arg_parser().options.verbose >= minimumVerboseLevel or minimumVerboseLevel == 0:
        if  args != None:
            print message % args
        else:
            print message




class arg_parser:
    """arg_parser Class

    Parameters and Arguments Class
    """
    opt = OptionParser()
    opt.description = __doc__
    opt.set_usage("usage: %prog [options] -o output-path --qnx-sdk html5-sdk-path [Application-1] [Application-n]")

    opt.add_option("-v", "--verbose",
            action='count', dest='verbose',
            help="increase verbosity")

    opt.add_option("-o", "--output-path",
            action='store', type="string", dest='outputPath',
            help="The output path for the generated bar files.")

    opt.add_option("-p", "--application-path",
            action='store', type="string", dest='applicationPath',
            help="The location of the Applications to package.")

    opt.add_option("-x", "--debug",
            action='count', dest='debug',
            help="Debug (keeps temporary folders)")

    opt.add_option("-E","--no-export",
            action='store_false', dest='exportSVN', default=True,
            help="Do not attempt to export WebWorks from SVN.")

    opt.add_option("--qnx-sdk",
            action='store', type="string", dest='qnxSDKPath',
            help="Specify the local path to the HTML5 SDK")

    opt.add_option("--keep-workspaces",
            action='store_true', dest='keepWorkspace', default=False,
            help="Keep all Application and Tool Workspaces for debugging.")

    (options, packages) = opt.parse_args()

    if not options.outputPath or not os.path.isdir(options.outputPath):
        opt.error("--output-path is required.")

    if not options.qnxSDKPath:
        opt.error("--qnx-sdk is required.")



# --------------------------
# MAIN
# --------------------------
def main(argv):

    exitCode = 0
    erroneousApplications = []
    successfulApplications = []

    # --------------------------
    # Generate Tooling Workspace
    # --------------------------
    tools = WebTools()

    # --------------------------
    # Populate WebTools Workspace
    # --------------------------
    tools.populate(arg_parser().options.qnxSDKPath, "qnxSDKPath")

    # --------------------------
    # Set environment path to SDK
    # --------------------------
    tools.setPaths()

    # --------------------------
    # Ensure required tools are available
    # --------------------------
    returnCode = ensureTool("blackberry-nativepackager")
    if not returnCode:
        print "[error]: Missing Required Binary."
        sys.exit(1)

    # --------------------------
    # Determine location of applications
    # --------------------------
    if arg_parser().options.applicationPath:
        applicationPath = arg_parser().options.applicationPath
    else:
        applicationPath = os.path.realpath(os.path.join(currentScriptDirectory, "..", "..", "..", "apps"))
        if not os.path.exists(applicationPath):
            print "[error]: Application Path Not Found: [%s]" % applicationPath
            sys.exit(1)


    # --------------------------
    # Package each Application Requested
    # --------------------------
    verbo_print(3, "[info]: Application Path: [%s]" % applicationPath)
    for application in os.listdir(applicationPath):
        verbo_print(3, "[info]: Checking Application [%s]" % application)

        executePackaging = False
        if len(arg_parser().packages) <= 0:
            executePackaging = True
        else:
            for package in arg_parser().packages:
                if string.lower(package) == string.lower(application):
                    executePackaging = True
                    break
        if executePackaging == False:
            continue

        # --------------------------
        # Package the Application
        # --------------------------
        verbo_print(3, "[info]: Processing Application [%s]" % application)
        thisApp = Application(applicationPath, application)
        if thisApp.isCordova:
            thisApp.package(tools)
            if thisApp.deploy(arg_parser().options.outputPath):
                successfulApplications.append(thisApp.applicationName)
            else:
                erroneousApplications.append(thisApp.applicationName)
                exitCode += 1
        else:
            verbo_print(0, "[warning]: Application is not Cordova: [%s]" % thisApp.applicationName)


    for application in successfulApplications:
        verbo_print(0, "[info]: successfully installed: [%s]" % application)

    for application in erroneousApplications:
        verbo_print(0, "[error]: _NOT_ successfully installed: [%s]" % application)

    sys.exit(exitCode)




if __name__ == '__main__':
    import sys
    sys.stdout = os.fdopen(sys.stdout.fileno(), 'w', 0)
    sys.exit(main(sys.argv) or 0)
