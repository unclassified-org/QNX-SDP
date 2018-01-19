#!/usr/bin/python
"""Set up MKIFS_PATH for the given board, locate and concatenate the
specified build files, and run mkifs to create a boot image."""

import sys
import errno
import os
import os.path as _ospath
srcroot = os.path.realpath(os.path.dirname(__file__))
sys.path.append(srcroot + "/../pymodules")
import qnxcar.config as _carcfg
import qnxcar.path
import qnxcar.util
import subprocess
from optparse import OptionParser
import ConfigParser
import shutil

def make_pathstr(elements, sep):
	for x in elements:
		if sep in x:
			# separators can't be escaped
			raise ValueError('path element %r contains'
					' a path separator (%r)' % (x, sep))
	return sep.join(elements)

def make_bin_paths(root):
	dirlist = (
		"${PROCESSOR}/sbin",
		"${PROCESSOR}/usr/sbin",
		"${PROCESSOR}/boot/sys",
		"${PROCESSOR}/bin",
		"${PROCESSOR}/usr/bin",
		"${PROCESSOR}/lib",
		"${PROCESSOR}/lib/dll",
		"${PROCESSOR}/lib/dll/mmedia",
		"${PROCESSOR}/usr/lib",
		"${PROCESSOR}/usr/photon/bin",
		"usr/share/sounds",
		"usr/share/images"
	)
	return [ _ospath.join(root, x) for x in dirlist ]

def mkifs(searchpath, inputfiles, output, debug_output, verbosity=0):
	## set environment and command line
	newenv = os.environ.copy()
	# path separator is ';' on Windows, ':' otherwise
	# (${PATHSEP} can be used in build files for portability)
	sep = newenv.setdefault('PATHSEP', os.pathsep)
	newenv['MKIFS_PATH'] = make_pathstr(searchpath, sep)
	
	vstr = ''
	if verbosity >= 2:
		vstr = 'v'
		tmpv = min(verbosity, 10)
		while tmpv >= 6:
			vstr += 'v'
			tmpv -= 1
	
	cmdline = ['mkifs']  # needs to be in $PATH
	if vstr:
		cmdline.append('-' + vstr)
	cmdline.append('-')
	if output:
		cmdline.append(output)
	
	if verbosity >= 2:
		debug_output.write('MKIFS_PATH (with path separator %r):\n' % (sep,))
		for x in searchpath:
			debug_output.write('\t%s\n' % (x,))
		debug_output.write('--\n')
	if verbosity >= 1:
		debug_output.write("Running %r\n\n" % (cmdline,))
	
	## execute mkifs
	
	debug_output.flush()
	try:
		proc = subprocess.Popen(cmdline, env=newenv,
				stdin=subprocess.PIPE, stderr=debug_output)
	except OSError, e:
		if e.errno == errno.ENOENT:
			msg = [
				"Error: mkifs not found in $PATH." % (cmdline[0],),
				''
			]
			for m in msg:
				print >> sys.stderr, m
		
		raise
	
	## feed data to mkifs
	
	filedata_tee = None
	sepline = ('@' * 72) + '\n'
	if verbosity >= 5:
		filedata_tee = debug_output
		filedata_tee.write(sepline)
	
	for filename in inputfiles:
		f = open(filename, 'rb')
		try:
			data = "\n### start file: %s\n" % (filename,)
			data += f.read()
			data += "\n### end file: %s\n\n" % (filename,)
			
			proc.stdin.write(data)
			if filedata_tee:
				filedata_tee.write(data)
				filedata_tee.flush()
		finally:
			f.close()
	
	if filedata_tee:
		filedata_tee.write(sepline)
	
	## wait for completion
	
	debug_output.flush()
	proc.stdin.close()
	rv = proc.wait()
	if rv != 0:
		raise RuntimeError( "mkifs failed with code %d" % (rv,) )

def main(argv):
	optp = OptionParser()
	optp.description = __doc__
	optp.set_usage("usage: %prog [options] board_name")
	optp.add_option("-f", "--input", metavar="BUILDFILE",
			action='append', dest='inputs',
			help="include the specified input file")
	optp.add_option("-r", "--root", metavar="DIRECTORY",
			action='append', dest='roots',
			help="include the specified directory as a root")
	optp.add_option("-N", "--no-defaults",
			action='append_const', dest='roots', const=False,
			help="don't include default directories in the search path")
	optp.add_option("--defaults",
			action='append_const', dest='roots', const=True,
			help="include default directories in the search path")
	optp.add_option("-o", "--output", metavar="IMAGEFILE",
			help="write to the specified IFS file")
	optp.add_option("-v", "--verbose",
			action='count', dest='verbosity',
			help="increase verbosity")
	optp.add_option("-c", "--config",
			action='store', dest='config',
			help="read the specified IFS config file")
	optp.add_option("-d", "--default-ifs",
			action='store', dest='default_ifs',
			help="specified which ifs is the default-ifs(qnx-ifs)")
	optp.add_option("--output-path",
			action='store', dest='output_path',
			help="write IFS(s) to the specified location")
	
	optp.set_defaults(output='')
	optp.set_defaults(roots=[])
	optp.set_defaults(inputs=[])
	optp.set_defaults(verbosity=0)
	optp.set_defaults(config='')
	optp.set_defaults(defaul_ifs='')
	optp.set_defaults(output_path='')

	(options, args) = optp.parse_args(args=argv[1:], values=None)
	
	if len(args) < 1:
		optp.error("No board specified")
	elif len(args) > 1:
		optp.error("Got unexpected argument(s)")
	boardname = args[0]
	
	if ( options.output == ''
			and getattr(sys.stdout, 'isatty', lambda:True)() and options.config == ''):
		print >> sys.stderr, (
				"Use option '-o example.ifs' to specify a filename,")
		print >> sys.stderr, (
				"or '-o -' to force output on stdout.")
		print >> sys.stderr
		optp.error("won't write to a terminal unless forced")
	
	env_verbosity = 0
	vstr = os.environ.get('MKIFS_DEBUG', None)
	if vstr:
		try: env_verbosity = int(vstr, 0)
		except ValueError: pass
	options.verbosity = max(options.verbosity, env_verbosity)
	
	rootloc = qnxcar.path.get_stage_root_locator()
	xloc = qnxcar.path.get_stage_locator(boardname,
			cpudir=None, includeroots=False)
	xloc.searchpath = list(xloc.searchpath)
	xloc.searchpath.extend( rootloc.multilocate('boards/common') )
	
	inputs = []
	for buildfile in options.inputs:
		if os.path.dirname(buildfile):
			inputs.append(buildfile)
		else:
			inputs.append( xloc.locate('ifs/' + buildfile, nofail=1) )
	
	## build mkifs_path
	
	add_defs = True
	for x in options.roots:
		if x in (True, False):
			add_defs = False
			break
	if add_defs:
		options.roots.append(True)
	
	mkifs_path = []
	for r in options.roots:
		if r == True:
			loc = qnxcar.path.get_stage_locator(boardname, cpudir=None)
			for ifsdir in rootloc.multilocate('boards/common/ifs'):
				mkifs_path.append(ifsdir)
			for defroot in loc.searchpath:
				mkifs_path.extend( make_bin_paths(defroot) )
		elif r == False:
			pass
		else:
			mkifs_path.extend( make_bin_paths(r) )
	srcroot = os.path.realpath(os.path.dirname(__file__))
  	IFS_DIR    = os.path.normpath(os.path.join(srcroot,'..','..','boards', boardname, 'ifs'))
	mkifs_path.append(IFS_DIR)
	
	##
	if options.config == '':
		dbgout = sys.stdout
		if options.output and options.output != '-':
			print "** Building %s..." % (options.output,)
		else:
			dbgout = sys.stderr
	
		mkifs(mkifs_path, inputs, options.output,
				debug_output=dbgout, verbosity=options.verbosity)

	else:
		# ------------------------------
		# Process with the Config file
		# ------------------------------

		# open and read the config file
		config = ConfigParser.RawConfigParser(allow_no_value=True)
		config.optionxform = str
		configfile = open(options.config, 'r')
		config.readfp(configfile)
		configfile.close

		# extract the content from config file
		IFSs = config.sections()
		for IFS in IFSs:
			if IFS == 'PROCESSOR':
				proc = config.items(IFS)[0]
				os.environ['PROCESSOR'] = proc[0]
				continue
			buildfiles = config.items(IFS)	
			inputs = []
			for buildfile in buildfiles:
				if os.path.dirname(buildfile[0]):
					inputs.append(buildfile[0])
				else:
					inputs.append( xloc.locate('ifs/' + buildfile[0], nofail=1) )

			if options.output_path:
				output = os.path.join(options.output_path, IFS)
			else:
				output = IFS

			dbgout = sys.stdout
			print "** Building %s..." % (IFS)
	
			mkifs(mkifs_path, inputs, output,
					debug_output=dbgout, verbosity=options.verbosity)

	# ------------------------------
	# Copy default_ifs to qnx-ifs
	# ------------------------------
	if options.default_ifs:
		if options.output_path:
			dst = os.path.join(options.output_path, 'qnx-ifs')
			src  = os.path.join(options.output_path, options.default_ifs)
		else:
			dst = 'qnx-ifs'
			src  = options.default_ifs
		print  "[info]: Copying Boot IFS: [%s] to qnx-ifs..." % (options.default_ifs)
		try:
			shutil.copy2(src,dst)
		except (OSError, IOError):
			print >> sys.stderr, ("[warning]: Boot IFS not found: [%s]" % (options.default_ifs))

if __name__ == '__main__':
	import sys
	sys.exit(main(sys.argv) or 0)
