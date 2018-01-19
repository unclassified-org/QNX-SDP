import os as _os
import os.path as _ospath
import qnxcar.fswalker as _fswalker
import qnxcar.pathmatch as _pathmatch
import imp as _imp

def _pymodule_relpath(modname, relpath=None):
	"""Find the named module, and return its path; or if relpath is given,
combine it with the module's path using os.path.join, and return the result."""
	
	path = _imp.find_module(modname)[1]
	if relpath:
		path = _ospath.join(path, relpath)
	return _ospath.abspath(path)

def _env_path(var, optional=False):
	"Return the absolute path specified by the named environment variable."
	
	path = _os.getenv(var)
	if path is None:
		if optional: return None
		raise EnvironmentError("$%s not set" % (var,))
	return _ospath.abspath(path)

class Locator(object):
	"""Usage: locator = Locator(searchpath)
This class has various methods to search for files in a specified list
of directories (the searchpath).  See also: get_stage_locator.
"""
	
	def __init__(self, searchpath):
		assert iter(searchpath)
		self.searchpath = searchpath
	
	def locatelist(self, pathlist, single=False,
			oneperstage=False, acceptfn=None, nofail=False):
		def stagegen():
			yield None
			for x in self.searchpath:
				yield x
		
		if acceptfn is None:
			acceptfn = _ospath.exists
		
		ret = []
		for stage in stagegen():
			for p in pathlist:
				fullpath = None
				if _ospath.isabs(p):
					if stage is None:
						fullpath = p
				elif stage is not None:
					fullpath = _ospath.join(stage, p)
				
				if (fullpath is not None) and acceptfn(fullpath):
					ret.append(fullpath)
					if single or oneperstage: break
			
			if single and ret:
				break
		
		if nofail and not ret:
			if len(pathlist) == 1: name = pathlist[0]
			else: name = str(tuple(pathlist))
			raise IOError("file not found: " + name)
		return ret
	
	def multilocate(self, path, **kw):
		return self.locatelist((path,), **kw)
	
	def locate(self, path, **kw):
		rv = self.multilocate(path, single=True, **kw)
		return rv[0] if rv else None
	
	def makenode(self, path):
		return _LocatorNode(locpath=path, locator=self)
	
	def recurse(self, path, **kw):
		includeroot = kw.pop('includeroot', True)
		
		node = self.makenode(path, **kw)
		if includeroot:
			yield node
		for ch in node:
			yield ch
	
	def match(self, pat, **kw):
		# If yieldall is true, we'll return non-matching nodes too
		# (for further processing).  node.match will be False.
		# node.childnames will be empty, to disable recursion,
		# but the caller can reset it.
		
		yieldall = kw.pop('yieldall', False)
		
		searchroot = _pathmatch.splitwild(pat)[0]
		patmatcher = _pathmatch.matchfn(pat)
		if searchroot.startswith('/') and not searchroot.startswith('//'):
			searchroot = searchroot[1:]
		
		for node in self.recurse(searchroot, **kw):
			isdir = node.getchildnames() is not None
			if isdir:
				# the node is a directory (possibly empty);
				# append '/' so directory patterns will match
				node.locpath = _ospath.join(node.locpath, '')
			
			node.match = patmatcher(node.locpath)
			if isdir and not node.match:
				# avoid recursion, unless this is the root node
				if node.parent is not None:
					node.childnames = ()
			
			if node.match or yieldall:
				yield node

class _LocatorNode(_fswalker.Node):
	"""This node class is used to implement Locator.recurse
(via Locator.makenode)."""
	
	def __init__(self, locpath, locator, parent=None):
		_fswalker.Node.__init__(self, parent=parent)
		self.locator = locator
		self.locpath = locpath
	
	def _makechild(self, name):
		return _LocatorNode( parent=self, locator=self.locator,
				locpath=_ospath.join(self.locpath, name) )
	
	def _locate(self, **kw):
		return self.locator.multilocate(self.locpath, **kw)
	
	def _find_child_nameset(self):
		nameset = set()
		anydir = False
		for path in self._locate():
			childnames = self._listdir(path)
			if childnames is not None:
				anydir = True
				for name in childnames:
					nameset.add(name)
		
		return nameset if anydir else None
	
	def _findchildnames(self):
		names = self._find_child_nameset()
		if names is not None:
			names = list(names)
			names.sort()
		return names
	
	def _os_listdir(self, path):
		# no need to sort; _findchildnames will do it
		return _os.listdir(path)

def get_stage_root_locator(cpudir=None, includesymbols=None, cls=Locator):
	"""Return a Locator object, optionally including a CPU-specific directory.

Example: locator = get_stage_locator('omap5uevm.test')
The search path is accessible as locator.searchpath.

The preferred way to get a Locator is via a qnxcar.config.CarConfig object.
"""
	# NOTE: The order these are listed in roots defines the search order
	car = _os.environ.get('QNX_CAR2_WORKSPACE', _pymodule_relpath('qnxcar', '../../..'))
	
	symbols = None
	if includesymbols:
		symbols = _env_path('EXTERNAL_SYMBOLS', optional=1)
		if symbols is None:
			symbols = _ospath.join(car, 'runtime-symbols')
		else:
		    if not _ospath.isdir(symbols):
				raise EnvironmentError( ("$EXTERNAL_SYMBOLS not set,"
						" and no such directory: %r") % (symbols,))
				roots.append(x)
	
	externals = _env_path('EXTERNAL_STAGE', optional=1)
	if externals is None:
		externals = _ospath.join(car, 'runtime-external')
		if not _ospath.isdir(externals):
		    externals = None
	
	qnx = _env_path('QNX_TARGET', optional=1)
	
	roots = []
	for dir in (car, symbols, externals, qnx):
		if dir is None: continue
		
		if cpudir:
			x = _ospath.join(dir, cpudir)
			if _ospath.isdir(x): roots.append(x)
		
		roots.append(dir)
	
	return cls(tuple(roots))

def get_stage_locator(boardname=None, cpudir=None, includesymbols=None,
		includeroots=True, cls=Locator):
	"""Return a Locator object for the specified board.
cpudir must be specified to get architecture-specific files.

Example: locator = get_stage_locator('beaglexm.test', cpudir='armle-v7')
The search path is accessible as locator.searchpath,
and the main (most specific) board directory is locator.boarddir.

The preferred way to get a Locator is via a qnxcar.config.CarConfig object.
"""
	
	rootloc = get_stage_root_locator(cpudir, includesymbols, cls=cls)
	
	top_boarddir = None
	stages = []
	if boardname:
		strip_parts = 0
		while 1:
			parts = boardname.rsplit('.', strip_parts)
			if len(parts) <= strip_parts: break
			
			board_dir = rootloc.locate('boards/' + parts[0])
			if top_boarddir is None:
				top_boarddir = board_dir
			
			if board_dir is not None:
			    #Append ifs/ and sd-boot/ directories for dosfs fileset search
				x = _ospath.join(board_dir, 'ifs')
				if _ospath.isdir(x): stages.append(x)
				x = _ospath.join(board_dir, 'sd-boot')
				if _ospath.isdir(x): stages.append(x)
			    
				if cpudir:
					x = _ospath.join(board_dir, cpudir)
					if _ospath.isdir(x): stages.append(x)
				
				stages.append(board_dir)
			elif strip_parts == 0:
				raise ValueError("couldn't find top-level board directory")
			
			strip_parts += 1
	
	if includeroots:
		stages.extend(rootloc.searchpath)
	
	rootloc.searchpath = tuple(stages)
	rootloc.boarddir = top_boarddir
	return rootloc

def is_vcs_path(path):
	"Determine whether path is a version control (e.g., SVN) file/directory."
	path = _ospath.normpath(path)
	return _ospath.split(path)[1] in ('.svn','.git')

def find_fileset(locator, name, nofail=False):
	filename = name + '.xml'
	pathlist = (
		'deployment/share/filesets/' + filename,
		'deployment/filesets/' + filename,
		filename,
	)
	pathlist = locator.locatelist(pathlist,
			single=True, nofail=nofail)
	assert len(pathlist) <= 1
	return pathlist[0] if pathlist else None
