#!/usr/bin/python
"""Create a tar file containing the file sets listed in the board profile,
with proper ownership and permissions."""

from __future__ import with_statement
from qnxcar.config import CarConfig
import copy
import os.path
import shutil
import re
import qnxcar.fileset_parser as _fsparser
import qnxcar.fswalker
import qnxcar.path
import qnxcar.timeutil
import qnxcar.util
import sys
import tarfile
import time
from cStringIO import StringIO
from optparse import OptionParser
from qnxcar.barreader import BarReader

def tarinfo_for_string(text, name=''):
	ti = tarfile.TarInfo(name)
	ti.size = len(text)
	ti.mtime = time.time()
	ti.mode = 0644
	ti.uid = 0
	ti.gid = 0
	ti.uname = ''
	ti.gname = ''

	sio = StringIO()
	sio.write(text)
	sio.seek(0)
	return (ti, sio)

def tarinfo_for_menuline(prefix, appname, ppsline):
	assert ppsline.count('\n') == 1
	menufile = (prefix + 'appinfo/menuentry/' + appname)
	return tarinfo_for_string(ppsline, name=menufile)

def get_paxheaders(tarinfo):
	# no pax_headers attribute is present in old Python versions
	# (in this case, paxh is a dummy dict that will be discarded)
	paxh = getattr(tarinfo, 'pax_headers', None)
	if paxh is None:
		paxh = {}
		tarinfo.pax_headers = paxh
	return paxh

def format_tarinfo(tarinfo):
	class D(object):
		def __getitem__(self, key):
			return getattr(tarinfo, key)

	d = D()
	ret = (
		"name=%(name)r mode=0%(mode)03o"
		" user=%(uname)r(%(uid)d) group=%(gname)r(%(gid)d)"
	) % d

	ret += " size=%(size)d mtime=%(mtime)d type=%(type)r" % d

	paxh = get_paxheaders(tarinfo)
	ret += " fileset=%r" % (paxh.get('qnx:fileset', None),)

	return ret

class TarCreator(object):
	"""The TarCreator object builds a list of files to be included.
Call the write_all function to write them to a tar file.

(It's done this way to handlne duplicate files -- if two filesets include the
same file, we can warn about it, and can change the permissions since the file
hasn't been written yet.)
"""

	def __init__(self, tar, msgp):
		self.config = None
		self.contents = {}
		self.contentlist = []
		self.prefix = ''
		self.tarfile = tar
		self.msgp = msgp
		self.inodes = {}
		self.symbols = None
		self.symbolslist = []

	def _write_file(self, tarinfo):
		file = None
		try:
			if tarinfo.isfile():
				file = open(tarinfo.__source_path, 'rb')

				# Use a hard link if possible.  This reduces the CAR2
				# image size (and speeds up extraction) by about 20%.
				# If we don't want links, they could be dereferenced
				# during extraction.
				#
				# (We can't use self.tarfile.inodes--it's set during
				# gettarinfo, not addfile. See Python issue #11899.)

				st = os.fstat(file.fileno())
				inode = (st.st_ino, st.st_dev)
				linkname = self.inodes.get(inode)
				if linkname:
					tarinfo.type = tarfile.LNKTYPE
					tarinfo.linkname = linkname
					tarinfo.size = 0
				else:
					self.inodes[inode] = tarinfo.name

			self.tarfile.addfile(tarinfo, file)
		finally:
			if file: file.close()

	def write_all(self):
		# Sort the list; at minimum, we need to include a directory
		# before including the files contained within it (otherwise,
		# tar may fail to extract those files).

		paths = self.contentlist
		paths.sort()
		for key in paths:
			tarinfo = self.contents[key]
			self._write_file(tarinfo)

	def addfile(self, tarinfo, fullpath=None):
		tarinfo = copy.copy(tarinfo)
		tarinfo.__source_path = fullpath
		tarinfo.name = self.prefix + tarinfo.name

		key = tarinfo.name

		# Print something regarding duplicate items found
		if key in self.contents:
			if fullpath is None:
				if tarinfo.type == tarfile.SYMTYPE: 
					if tarinfo.linkname != self.contents[key].linkname:
						oldstr = format_tarinfo(self.contents[key])
						newstr = format_tarinfo(tarinfo)
						self.msgp(3, "duplicate symlink differ:")
						self.msgp(3, " old: %s linkname: %s" % (oldstr,self.contents[key].linkname,))
						self.msgp(3, " new: %s linkname: %s" % (newstr,tarinfo.linkname,))
				else:
					self.msgp(2, "Warning: saw duplicate missing directory %r" % (key,))
			else:
				if not self.tarfile.gettarinfo(fullpath).isdir():
					if not self.symbols or tarinfo.name + ".sym" != self.contents[key].name:
						self.msgp(2, "Warning: saw duplicate item %r" % (key,))
				if tarinfo.tobuf() != self.contents[key].tobuf():
					if not self.symbols or tarinfo.name + ".sym" != self.contents[key].name:
						oldstr = format_tarinfo(self.contents[key])
						newstr = format_tarinfo(tarinfo)
						self.msgp(3, "duplicate items differ:")
						self.msgp(3, " old: %s" % (oldstr,))
						self.msgp(3, " new: %s" % (newstr,))
				# continue, and allow this entry to override the old one
		else:

			# Copy the symbol file temporarily for inclusion
			# The copy will be removed in the finally clause
			if self.symbols:
				if key.endswith(".sym"):

					symbollesskey = re.sub(".sym$", "", key)
					symbollessfullpath = re.sub(".sym$", "", fullpath)
					if not any(symbollessfullpath in entry for entry in self.symbolslist):

						try:
							if not os.path.exists(symbollessfullpath):
								shutil.copy2(fullpath, symbollessfullpath)
							else:
								self.msgp(1, "Warning: symbol file cannot be cloned as path exists: [%s]" % symbollessfullpath)
							key = symbollesskey
							fullpath = symbollessfullpath

							self.msgp(2, "Copied symbols file for inclusion: [%s]" % fullpath)
							self.symbolslist.append(fullpath)
						except:
							msgp(0, "Unable to copy symbols file.", sys.exc_info()[0])
					else:
						return

			self.contentlist.append(key)

		self.contents[key] = copy.copy(tarinfo)
		self.msgp(6, "Destination: " + key)
		self.msgp(6, " \__ Source: "
				+ ("(none)" if fullpath is None else fullpath) )



	def addtree(self, path, gid=0):
		loc = self.config.locator
		found = False
		for node in loc.recurse(path):
			if qnxcar.path.is_vcs_path(node.locpath):
				node.childnames = ()  # don't recurse
				continue

			fullpath = loc.locate(node.locpath)
			if not fullpath:
				continue

			found = True
			ti = self.tarfile.gettarinfo(fullpath)
			ti.name = node.locpath
			ti.uname = ''  # extract with numeric uid
			ti.gname = ''  # extract with numeric gid
			ti.uid = 0
			ti.gid = gid
			if ti.isdir():
				ti.mode = 0775
				self.addfile(ti)
			else:
				executable = (ti.mode & 0111) != 0
				ti.mode = 0664 | (0111 if executable else 0)
				self.addfile(ti, fullpath=fullpath)

		if not found:
			self.msgp(1, "skipped missing item: %s" % (path,))
		return found

	def _add_fsentry(self, fsentry, fullpath):
		u = self.config.userlist.lookup(fsentry.uid)
		if u is not None:
			uid = u.uid
		else:
			self.msgp(1, "Can't find user %r" % (fsentry.uid,))
			uid = 0

		g = self.config.grouplist.lookup(fsentry.gid)
		if g is not None:
			gid = g.gid
		else:
			self.msgp(1, "Can't find group %r" % (fsentry.gid,))
			gid = 0

		if fullpath is None:
			ti = tarfile.TarInfo(fsentry.path)
			if fsentry.issymlink() :
				ti.type = tarfile.SYMTYPE
				ti.linkname = fsentry.target
				ti.mtime = time.time()

			else:
				# we can create a DIRECTORY entry from nothing
				# (i.e., without locating a local directory)
				assert fsentry.kind == fsentry.DIRECTORY
				ti.type = tarfile.DIRTYPE
				ti.mtime = time.time()
		else:
			ti = self.tarfile.gettarinfo(fullpath)

		ti.name = fsentry.path
		ti.uname = str(fsentry.uid)
		ti.gname = str(fsentry.gid)
		ti.uid = uid
		ti.gid = gid
		ti.mode = fsentry.mode
		if ti.isfile():
			#change the ti.name to relocate the file if attribute "dest" exist 
			dest = 0
			try:
				dest = fsentry.dest
			except:
				pass
			if dest:
				ti.name = dest

		if fsentry.isdircontents() and ti.isdir():
			# for subdirectories, enable execute permission for
			# all users with read permission
			m = ti.mode & 0444   # get read permissions
			m >>= 2              # change to execute permissions
			ti.mode |= m

		paxh = get_paxheaders(ti)
		if fsentry.fileset:
			# this pax header is just informational;
			# no software looks at it
			paxh['qnx:fileset'] = fsentry.fileset.name

		if not fsentry.isdircontents():
			# verify item type (file or directory); this is a warning,
			# not an error, because the filesets may have many entries
			# with incorrect types

			def ftype_warn(msg):
				self.msgp(3, "Warning: %s %s" % (fullpath, msg))

			if ti.isdir() and not fsentry.isdir():
				ftype_warn("is a directory (expected non-directory)")
			elif fsentry.isdir() and not ti.isdir():
				ftype_warn("not a directory (expected directory)")

		self.addfile(ti, fullpath=fullpath)

	def addfileset(self, fileset):
		locator = self.config.locator
		pkg = fileset.package

		# in the tar file, pkg.install_path will follow self.prefix
		prefix = pkg.install_path if pkg else ''
		prefix = (prefix + '/').lstrip('/')

		self.msgp(2, 'fileset %s' % (fileset.name,))
		for fsentry in fileset.entries:
			path = fsentry.path
			if fsentry.isdir():
				if not path.endswith('/'):
					path += '/'
			elif fsentry.isdircontents():
				path += '/**'
			found = 0
 
			try:
				#add prefix to the dest if it exist 
				fsentry.set_dest(prefix + fsentry.dest)
			except:
				pass

			# if the "--symbols" option was passed, look for the .sym file initially
			if self.symbols and not path.endswith(".sym"):
				for node in locator.match( path + ".sym" , yieldall=True,
							includeroot=(not fsentry.isdircontents()) ):
					if not node.match:
						continue
					elif qnxcar.path.is_vcs_path(node.locpath):
						node.childnames = ()  # don't recurse
						continue
					newfse = copy.copy(fsentry)
					newfse.path = prefix + node.locpath
					xpath = locator.locate(node.locpath)
					if xpath is not None:
						self.msgp(2, "Adding symbols file: [%s]" % xpath)
						self._add_fsentry(newfse, xpath)
						found += 1
						continue

			if  fsentry.issymlink():
				fsentry.path = prefix + fsentry.path
				self._add_fsentry(fsentry, None)
				continue

			for node in locator.match( path, yieldall=True,
					includeroot=(not fsentry.isdircontents()) ):

				if not node.match:
					# TODO: if this is a directory that's already in the tarfile,
					# call node.resetchildnames() so we'll recurse into it
					continue
				elif qnxcar.path.is_vcs_path(node.locpath):
					node.childnames = ()  # don't recurse
					continue

				newfse = copy.copy(fsentry)
				newfse.path = prefix + node.locpath
				xpath = locator.locate(node.locpath)
				if xpath is not None:
					if os.path.islink(xpath):
						self.msgp(1, "Warning: %s is a symlink file" % (xpath) )
					self._add_fsentry(newfse, xpath)
					found += 1

			if not found:
				if fsentry.isdir():
					fsentry.path = prefix + fsentry.path
					self._add_fsentry(fsentry, None)
				else:
					self.msgp(1, "skipped missing item: %s" % (fsentry.path,) )

def split_inclkey(key):
	return (key[:1], key[1:])

def should_include(options, testitems):
	"""For each name in testitems, check whether options.includes mentions
the name; if so, return the inclusion/exclusion result immediately.
Returns (bool, extra), where extra=options.includes[i][1] (for some index i).
If no match, returns (options.include_defaults, {})."""

	ret = options.include_defaults
	extra = {}
	for testname in testitems:
		for (inclkey, inclextra) in options.includes:
			(inclchar, inclname) = split_inclkey(inclkey)
			if inclname == testname:
				ret = inclchar in ('+',)
				extra = inclextra
				break
		if extra:
			# found a match
			break
	return (ret, extra)

def main(argv):
	### handle command-line options

	def append_opt(options, key, value, optp, *v, **kw):
		# need to know the prefix in effect when the argument was read
		dest = kw['dest']
		value = kw.get('valprefix', '') + (value or '')

		L = getattr(optp.values, dest)
		L.append( (value, {
			'prefix':optp.values.prefix,
			'cpu':optp.values.cpu,
		}) )
		setattr(optp.values, dest, L)

	def append_pkg(options, key, value, optp, *v, **kw):
		optp.values.include_defaults = False
		kw.setdefault('dest', 'includes')
		kw.setdefault('valprefix', '+package:')
		return append_opt(options, key, value, optp, *v, **kw)

	optp = OptionParser()
	optp.description = __doc__
	optp.set_usage("usage: %prog [options] [board_name]")
	optp.add_option("-o", "--output", metavar="TARFILE",
			help="write to the specified tar file")
	optp.add_option("--prefix", metavar="PREFIX",
			action='store', dest='prefix',
			help="prefix each path with the given string")
	optp.add_option("--package", "-p", metavar="PKGNAME",
			action='callback', callback=append_pkg, type=str,
			help="include the given package (implies --no-defaults)")
	optp.add_option("--bars",
			action='callback', callback=append_pkg,
			callback_kwargs={'valprefix':'+apps'},
			help="include new-style (BAR) applications (implies --no-defaults)")
	optp.add_option("--cpu", metavar="CPUDIR",
			action='store', dest='cpu',
			help="set the system architecture (e.g., \"armle-v7\")")
	optp.add_option("-f", "--fileset", metavar="SETNAME",
			action='callback', callback=append_opt, type=str,
			callback_kwargs={'dest':'includes', 'valprefix':'+fileset:'},
			help="include the specified fileset")
	optp.add_option("--no-defaults",
			action='store_false', dest='include_defaults',
			help="don't include the board's default filesets/applications")
	optp.add_option("-z",
			action='store_const', const='gzip', dest='compress',
			help="compress with gzip")
	optp.add_option("--compress", metavar="METHOD",
			action='store', dest='compress',
			help=("use the given compression method: "
					"auto (default), none, gzip, bzip2") )
	optp.add_option("-s", "--symbols",
			action='store_true', dest='symbols', default=False,
			help="Search in the runtime-symbols/ folder for the unstripped binaries")
	optp.add_option("--profile", metavar="PROFILE",
			action='store', dest='profile',
			help="specify the profile xml file (default: \"profile.xml\")")
	optp.add_option("-v", "--verbose",
			action='count', dest='verbosity',
			help="increase verbosity")

	optp.set_defaults(output='')
	optp.set_defaults(prefix='')
	optp.set_defaults(compress='auto')
	optp.set_defaults(includes=[])
	optp.set_defaults(include_defaults=True)
	optp.set_defaults(verbosity=1)

	(options, args) = optp.parse_args(args=argv[1:], values=None)

	if not options.compress in ('auto', 'none', 'gzip', 'bzip2'):
		optp.error("Invalid --compress method")

	if len(args) > 1:
		optp.error("Got unexpected argument(s)")

	if options.output in ('', '-'):
		tarfileobj = sys.stdout
		if ((not options.output)
				and getattr(tarfileobj, 'isatty', lambda:True)() ):
			print >> sys.stderr, (
					"Use option '-o example.tar' to specify a filename,")
			print >> sys.stderr, (
					"or '-o -' to force output on stdout.")
			print >> sys.stderr
			optp.error("won't write to a terminal unless forced")
	else:
		# pass a file object to TarFile; if we pass a filename, TarFile
		# creates it as executable
		tarfileobj = open(options.output, 'wb')

        externalsStage = qnxcar.path._env_path('EXTERNAL_STAGE', optional=1)
        if externalsStage is not None:
            if options.verbosity >= 2:
                print "Warning: using $EXTERNAL_STAGE env var: '", externalsStage, "', this will override the default target/externals svn external as the source for externals runtime files"

        externalsSymbols = qnxcar.path._env_path('EXTERNAL_SYMBOLS', optional=1)
        if externalsSymbols is not None:
            if options.verbosity >= 2:
                print "Warning: using $EXTERNAL_SYMBOLS env var: '", externalsSymbols, "', this will override the default target/runtime-stage as the source for unstripped binaries"

	### initialise

	cfg = CarConfig()
	if len(args) > 0:
		cfg.boardname = args[0]
	if options.cpu:
		cfg.cpu = options.cpu
	if options.symbols:
		cfg.symbols = options.symbols
	if options.profile:
		cfg.profile = options.profile
	board = cfg.board

	# parse filesets before starting
	extra_filesets = []
	for (inclkey, extra) in options.includes:
		(inclchar, inclname) = split_inclkey(inclkey)

		pref = 'fileset:'
		if inclname.startswith(pref) and should_include(options, [inclkey]):
			fsname = inclname[len(pref):]
			path = cfg.find_fileset(fsname, nofail=True)
			extra['fileset'] = _fsparser.parse_fileset(path)
			extra_filesets.append( (fsname,extra) )

	# also parse app list
	dummy = cfg.oldapplist

	msgp = qnxcar.util.MsgPrinter(
			file=sys.stderr, verbosity=options.verbosity)

	def _printpath():
		yield "search path:"
		for x in cfg.locator.searchpath:
			yield "  %s" % (x,)
		yield '--'
	msgp.printlines(3, _printpath())

	try:
		### initialise the tar file
	
		tarmode = 'w|'
		ext = None
		if (options.compress == 'auto'):
			ext = os.path.splitext(options.output)[1]
		if (options.compress == 'gzip') or (ext in ('.gz', '.tgz')):
			tarmode += 'gz'
		elif (options.compress == 'bzip2') or (ext in ('.bz2', '.tbz')):
			tarmode += 'bz2'
	
		tar = tarfile.TarFile.open(fileobj=tarfileobj, mode=tarmode)
		tar.encoding = 'utf8'
		tar.dereference = False  # archive symlinks as symlinks (no
					 # dereference, so do not create
					 # copies).
	
		tarcr = TarCreator(tar, msgp)
		tarcr.config = cfg
		tarcr.prefix = options.prefix
		tarcr.symbols = options.symbols
	
		appinfo_list = []
		old_style_apps = []
		sign = 'unsigned'
		use_bar_installer = False  # TODO: we should install BARs normally
	
		msgp(0, 'Locating files...')
		### add default board items
	
		if board:
			sign = 'signed' if board.secure else 'unsigned'
	
			# build the app list (BAR files) early
			for incapp in board.get_included_apps():
				(wanted, extra) = should_include(options,
						['app:' + incapp.name, 'apps'])
				if wanted:
					try:
						appinfo = cfg.applist.get_app(incapp.name)
						appinfo_list.append(appinfo)
					except KeyError:
						msgp(1, "Unknown application name: %r" % (incapp.name,) )
	
			# read all filesets
			filesets = []
			for pkg in board.get_packages():
				inckeys = ('package:' + pkg.name, 'packages')
				(wanted, extra) = should_include(options, inckeys)
				if not wanted:
					continue
	
				xprefix = extra.get('prefix', None)
	
				for appname in pkg.get_appset_names():
					old_style_apps.append( (appname, xprefix) )
	
				for fs in pkg.get_filesets():
					if xprefix is not None:
						tarcr.prefix = xprefix
					tarcr.addfileset(fs)
	
		### add extra items
	
		for (fsname, extra) in extra_filesets:

			cfg.cpu = extra['cpu']
			tarcr.prefix = extra['prefix']
			tarcr.addfileset( extra['fileset'] )
	
		### handle old-style apps
	
		newgid = 30000
		old_style_appinfo = []
		for (appname, xprefix) in old_style_apps:
			# Make a gid (permissions-old-style-apps.xslt uses
			# position() + 30000, which is basically the same).
			newgid += 1  # Even missing apps increment the gid.
	
			if xprefix is not None:
				tarcr.prefix = xprefix
	
			appinfo = cfg.oldapplist.get_app(appname, None)
			if appinfo is None:
				msgp(1, ("skipped unknown old-style app: %s"
						" (not in old-style-applications.xml)") % (appname,) )
			elif tarcr.addtree('apps/' + appname, gid=newgid):
				old_style_appinfo.append(appinfo)
	
		### handle BAR files
	
		bars = []
		newgid = max(newgid, 30100)
		for appinfo in appinfo_list:
			newgid += 1  # Even missing apps increment the gid.
	
			barpath = 'appinstall/bars/%s/%s' % (sign, appinfo.srcPath)
			fullpath = cfg.locator.locate(barpath)
			if fullpath:
				# add the BAR file (without extracting it)
				if use_bar_installer:
					tarcr.addtree(barpath)
	
				bars.append({
					'appinfo':appinfo,
					'barpath':barpath,
					'fullpath':fullpath,
					'gid':newgid,
				})
			else:
				msgp(1, "skipped missing bar: %s" % (barpath,) )
	
		### actually write the tar file
	
		msgp(0, 'Writing tar file...')
		tarcr.write_all()
	
		for appinfo in old_style_appinfo:
			# create a menu entry
			(ti, f) = tarinfo_for_menuline(tarcr.prefix,
					appinfo.name, appinfo.ppsmenuline)
			tar.addfile(ti, f)

		apkruntimeRegisteredApps = ''	
		for info in bars:
			# get info for PPS transaction file
			appinfo = info['appinfo']
			xinfo = info.copy()
			xinfo['ppsname'] = appinfo.name
			xinfo['tarprefix'] = tarcr.prefix
			xinfo['extras'] = appinfo.extras
			xinfo['classification'] = appinfo.classification
	
			if use_bar_installer:
				# create a PPS transaction file for the installer
				# (see the preactivate service in startup.sh)
	
				# PPS transaction file contents
				trans = '\n'.join([
					'@%(ppsname)s',
					'action::stage',
					'session::0',
					'package_location::%(tarprefix)s/%(barpath)s',
					'extras::%(extras)s',
					'classification::%(classification)s',
				]) % xinfo
	
				transfile = ('%(tarprefix)s' 'appinfo/inst-trans/'
						'%(classification)s/%(ppsname)s') % xinfo
				(ti, f) = tarinfo_for_string(trans, name=transfile)
				tar.addfile(ti, f)
			else:
				# extract the bar file and add its contents
	
				barpath = info['fullpath']
				bar = BarReader(barpath)
				msgp(6, "Adding extracted bar file: " + barpath)
				for (ti, f) in bar.mktarinfo(gid=info['gid']):
					tar.addfile(ti, f)
	
				# create a menu entry
	
				(ti, f) = tarinfo_for_menuline(tarcr.prefix,
						appinfo.name, bar.ppsmenuline)
				tar.addfile(ti, f)
                                if (bar.isApkruntime):
				   (ppsFile, ppsData) = bar.apkruntimePpsInfo
                                   (ti, f) = tarinfo_for_string(ppsData, name=(tarcr.prefix + ppsFile))
				   tar.addfile(ti, f)
	                           apkruntimeRegisteredApps += bar.registeredAppLine
         
                if (len(apkruntimeRegisteredApps) > 1): 
                   (ti, f) = tarinfo_for_string( apkruntimeRegisteredApps, name=(tarcr.prefix + 'var/pps/system/installer/registeredapps/applications'))
                   msgp(0, 'Apkruntime applications registered:\n' + apkruntimeRegisteredApps)
                   tar.addfile(ti, f)
 
		tar.close()
	# Cleanup temporary files
	finally:
		if tarcr.symbols:
			for symbolsfile in tarcr.symbolslist:
				try:
					os.unlink(symbolsfile)
				except:
					msgp(0, "Unable to remove copied symbols file.", sys.exc_info()[0])
				tarcr.symbolslist.remove(symbolsfile)

if __name__ == '__main__':
	import sys
	sys.exit(main(sys.argv) or 0)
