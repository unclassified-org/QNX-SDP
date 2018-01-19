#!/usr/bin/python
"""
Generate the /etc/os.version file based on build environments
"""
import os
from optparse import OptionParser
import subprocess
from platform import node
import time
import re
import glob

def main(argv):
	# --------------------------
	# Set Paths
	# --------------------------
	srcroot = os.path.realpath(os.path.dirname(__file__))
	targetDir=os.environ.get('QNX_CAR2_WORKSPACE', os.path.realpath(os.path.join(srcroot,"..", "..")))

	boardsDir=os.path.join(targetDir,"boards")
	osVersionFile=os.path.join(targetDir,"etc","os.version")

	hostDir= os.environ.get('QNX_HOST','')
	if hostDir == '':
		 print >> sys.stderr, "[warning]: QNX_HOST variable is not set."
	sdpDir=os.path.normpath(os.path.join(hostDir,"..","..",".."))
	installDir=os.path.join(sdpDir,"install","qnx-sdp")
	commit_msg_path=os.path.join(sdpDir,"install","qnx-sdp","*","commit_msg")
	commit_msg=glob.glob(commit_msg_path)

	#initialize variable
	sdpRevision=None
	svnRevision=None

	# --------------------------
	# handle command-line options
	# --------------------------
	opt = OptionParser()
	opt.description = __doc__
	opt.set_usage("usage: %prog [options] platform.variant")

   	opt.add_option("-v", "--verbose",
		action='count', dest='verbosity',
		help="increase verbosity")

	opt.add_option("-q", "--quiet",
		action='store_true', dest='quiet', default=False,
		help="prevent output")

	opt.add_option("-p", "--additionalParameters",
		action='store', type="string", dest='additionalParameters',
		help="<param>=<value> <param>=<value>")

	opt.set_defaults(verbosity=0)
	opt.set_defaults(additionalParameters="")

	(options, args) = opt.parse_args()
	if len(args) != 1:
		opt.error("Got unexpected argument(s)")

	platformVariant = args[0]
	if not os.path.exists(os.path.join(boardsDir,platformVariant)):
		opt.error("Platform-variant not found [%s/%s]." % (boardsDir,platformVariant))

	(platform, variant) = platformVariant.split('.')

	# --------------------------
	# Star writing info into file
	# --------------------------
	osVF = open(osVersionFile,'wb')
	localtime = time.asctime( time.localtime(time.time()) )
	osVF.write("date:\t\t" + localtime + "\n")
	project = os.getenv('JOB_NAME',"Local Build")
	osVF.write("project:\t" + project + "\n")
	HOSTNAME = node()
	osVF.write("buildHost:\t" + HOSTNAME + "\n")
	buildID = os.getenv('BUILD_ID',"Local Build")
	osVF.write("buildID:\t" + buildID + "\n")
	buildNum = os.getenv('BUILD_NUMBER',"Local Build")
	osVF.write("buildNum:\t" + buildNum + "\n\n")
	osVF.write("platform:\t" + platform + "." + variant + "\n")
	# --------------------------
	# Get CAR2 Repository 
	# Information
	# --------------------------
	try:
		p = subprocess.Popen(["svn","info",targetDir], stdout=subprocess.PIPE)
		svnInfo = p.stdout.read(2046)
		for info in svnInfo.split("\n"):
			if "Revision" in info:
				svnRevision = info.strip()
				svnRevision = svnRevision[len("Revision: "):]
			if "URL" in info:
				svnURL = info.strip()
				svnURL = svnURL[len("URL: "):]
			if "Repository Root" in info:
				svnRoot = info.strip()
				svnRoot = svnRoot[len("Repository Root: "):]

		svnBranch = svnURL[len(svnRoot) + 1:svnURL.find("target") - 1]
		osVF.write("car2Branch:\t" + svnBranch + "\n")
		osVF.write("car2Rev:\t" + svnRevision + "\n")
	except:
		pass
	# --------------------------
	# Get QNX SDP installer
	# Information 
	# --------------------------
	if commit_msg and os.path.exists(commit_msg[0]):
		if len(commit_msg) > 1:
			print >> sys.stderr, "[warning]: commit_msg has more than one match."
			print >> sys.stderr, commit_msg
		f = open(commit_msg[0])
		if options.verbosity:
			print >> sys.stderr, "[info] %s: commit_msg: %s" % (os.path.basename(__file__),commit_msg[0])
		for line in f:
			m = re.search("/qnx_sdp.*/trunk:",line)
			if m:
				sdpRevision = line[m.end():]
				osVF.write("car2Rev:\t" + sdpRevision + "\n")
				break
	# --------------------------
	# Get car2Rev from env if
	# we haven't set it
	# --------------------------
	if not sdpRevision and not svnRevision:
		car2Rev = os.environ.get('CAR2_REV','')
		osVF.write("car2Rev:\t" + car2Rev + "\n")
		
	if options.additionalParameters:
		for nameValue in options.additionalParameters.split(' '):
			if len(nameValue) <= 2:
				break
			try:
				(name, value) = nameValue.split('=')
				osVF.write(name + ": " + value + "\n")
			except Exception as e:
				print >> sys.stderr, ("[warning] %s: Invalid Name=Value Parameter: [%s]." % (os.path.basename(__file__), nameValue))

	osVF.close()

	if not options.quiet:
		print >> sys.stderr, ("[info] %s: Generated os.version file: [%s]" % (os.path.basename(__file__), osVersionFile))
	if options.verbosity:
		print >> sys.stderr, (open(osVersionFile,"r").read())

if __name__ == '__main__':
    import sys
    sys.stdout = os.fdopen(sys.stdout.fileno(), 'w', 0)
    sys.exit(main(sys.argv) or 0)
