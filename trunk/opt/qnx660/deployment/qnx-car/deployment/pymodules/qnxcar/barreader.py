import datetime as _datetime
import os.path as _ospath
import qnxcar.timeutil as _timeutil
import tarfile as _tarfile
import time as _time
import zipfile as _zipfile

class _FnDict(object):
	def __init__(self, fn): self.fn = fn
	def __getitem__(self, key): return self.fn(key)

def _add_x_perm_if_r(mode):
	m = mode & 0444   # get read permissions
	m >>= 2           # change to execute permissions
	return mode | m

class BarReader(object):
	def __init__(self, file):
		assert file
		self.zipfile = _zipfile.ZipFile(file)
		self._manifest = self._read_manifest()

	def _read_manifest(self):
		file = self.zipfile.open('META-INF/MANIFEST.MF')
		return [line.rstrip('\r\n') for line in file]
	
	def _getmf(self, key):
		"Return the value of the first manifest field with the given key."
		
		for line in self._manifest:
			parts = line.split(':', 1)
			if len(parts) == 2 and parts[0] == key:
				return parts[1].strip()
		raise KeyError("no manifest entry %r" % (key,))
	
	@property
	def executables(self):
		ret={}
		assetName=''
		for line in self._manifest:
			parts = line.split(':', 1)
			if len(parts) == 2:
				#put all executables into a dictionary 
				if parts[0] == "Archive-Asset-Name":
					assetName=parts[1].strip()
				if parts[0] == "Archive-Asset-Type" and parts[1].strip().lower() == 'qnx/elf':
					ret[assetName] = 1
		return ret
	
	@property
	def pkgid(self):
                # need to convert - in pkgid to . (see /scripts/bar-instal and PR168499		
                pkgid = self._getmf('Package-Id').replace("-","."); 
		return pkgid

	@property
	def pkgdir(self):
		name = self._getmf('Package-Name')
		return '%s.%s' % (name, self.pkgid)
	
	def mktarinfo(self, prefix='', gid=0):
		"""Returns an iterator that yields (tarinfo, file) for each entry.
file is None (for a directory), or a file-like object."""
		
		prefix += 'apps/%s/' % (self.pkgdir,)
		btt = _BarToTar(self, prefix=prefix, gid=gid)
		for (zi, ti) in btt.mklist(self.zipfile.infolist()):
			assert (zi is None) or isinstance(zi, _zipfile.ZipInfo)
			assert isinstance(ti, _tarfile.TarInfo)
			
			file = None
			if zi:
				file = self.zipfile.open(zi)
			yield (ti, file)
			if file:
				file.close()
	
	@property
	def menuentry(self):
		def _attr(key):
			try: return self._getmf(key)
			except KeyError: return ''
		
		return ','.join([
			'%(Entry-Point-Icon)s',
			'%(Entry-Point-Name)s',
			'%(Application-Category)s',
			'%(Entry-Point-Splash-Screen)s',
			'%(Entry-Point-Orientation)s',
			'',  # TODO: multitype
			'',  # TODO: hidden
		]) % _FnDict(_attr)
	
	@property
	def ppsmenuline(self):
		return '%s::%s\n' % (self.pkgdir, self.menuentry)

	@property
        # provide a minimal entry for the installer/registeredapps/applications object needed by the
        # Apkruntime runtime to know that an application has been installed
	def registeredAppLine(self):
		return '%s::%s\n' % (self.pkgdir, self.pkgid)

	@property
        # return bool - indicates is Bar has an Apkruntime Entry-Point-Type
	def isApkruntime(self):
		entryType = self._getmf('Entry-Point-Type');
		return "Apkruntime" in entryType


	# Build the name and content of the PPS object needed to let Apkruntime know this package needs	
	# to be installed
        # return <pps_relative_path>, <pps_contents>
	@property
	def apkruntimePpsInfo(self):
		name = self._getmf('Package-Name') 
                ppsData = ''.join(['apk::go\nactual_name::',name,'\nactual_id::',self.pkgid,'\nextras::source::developer\nppsline::',self.ppsmenuline,'\n'])
                return ('var/pps/system/installer/upd/current/job.' + self.pkgid, ppsData)

# _BarToTar is a private class that's just used to implement BarReader.to_tar.
class _BarToTar(object):
	def __init__(self, bar_reader, prefix='', gid=0):
		self.gid = gid
		self.seendirs = set()
		self.executables = bar_reader.executables
		self.prefix = prefix
	
	def _mktarinfo(self, path, isdir):
		ti = _tarfile.TarInfo()
		ti.name = self.prefix + path
		ti.mtime = _time.time()
		ti.uname = ''
		ti.gname = ''
		ti.uid = 0
		ti.gid = self.gid
		ti.mode = 0644
		ti.type = _tarfile.DIRTYPE if isdir else _tarfile.REGTYPE
		if ( isdir or (path in self.executables)):
			ti.mode = _add_x_perm_if_r(ti.mode)

		return ti
	
	def _mkdirs(self, dirname):
		if dirname in self.seendirs:
			return
		else:
			# note: even dirname=="" needs to be added
			self.seendirs.add(dirname)
		
		parent = _ospath.split(dirname)[0]
		for ti in self._mkdirs(parent):
			yield ti
		
		yield self._mktarinfo(dirname, isdir=1)
	
	def _mkparents(self, path):
		dirname = _ospath.split(path)[0]
		for ti in self._mkdirs(dirname):
			yield ti
	
	def _mkfileinfo(self, zi):
		isdir = False
		path = zi.filename.replace('\\', '/')
		if path.endswith('/'):
			path = path.rstrip('/')
			isdir = True
		if isdir:
			self.seendirs.add(path)
		
		for ti in self._mkparents(path):
			yield (None, ti)
		
		ti = self._mktarinfo(path, isdir=isdir)
		dt = _datetime.datetime(*zi.date_time, **{'tzinfo':_timeutil.UTC})
		ti.mtime = _time.mktime(dt.timetuple())
		ti.size = zi.file_size
		yield (zi, ti)
	
	def mklist(self, ziplist):
		for zi in ziplist:
			for x in self._mkfileinfo(zi):
				yield x
