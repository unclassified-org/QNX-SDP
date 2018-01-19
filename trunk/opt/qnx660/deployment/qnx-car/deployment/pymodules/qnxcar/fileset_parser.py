import qnxcar.util as _carutil
import qnxcar.xmlutil as _xmlutil

_elattr = _xmlutil.get_node_attr
_ElWrap = _xmlutil.ElementWrapper

class _octint(int):
	def __repr__(self): return oct(self).lstrip('0').zfill(4)
	def __str__(self): return repr(self)

class FilesetEntry(_ElWrap):
	FILE = _carutil.Key('FilesetEntry file')
	DIRECTORY = _carutil.Key('FilesetEntry dir')
	DIRCONTENTS = _carutil.Key('FilesetEntry dirContents')
	SYMLINK = _carutil.Key('FilesetEntry symlink')
	_XML_TYPENAMES = ( ('file', FILE),
			('directory', DIRECTORY),
			('directory-all', DIRCONTENTS),
			('symlink', SYMLINK) )
	
	def __init__(self, node, fileset=None, **kw):
		_xmlutil.ElementWrapper.__init__(self, node, **kw)
		if node is not None:
			# verify the node name is valid
			dummy = self.kind
		self.fileset = fileset
	
	def __copy__(self):
		node = self._clone_xml_node()
		return type(self)(node, name=self._nodename,
				fileset=self.fileset)
	
	def _get_path(self):
		path = _elattr(self.get_xml_node(), 'name')
		while path != '/' and path.endswith('/'):
			path = path[:-1]
		return path
	
	def _set_path(self, value):
		self.get_xml_node().setAttribute('name', value)
	
	path = property(_get_path, _set_path)
	
	uid = _ElWrap._make_xml_attrprop('uid')
	gid = _ElWrap._make_xml_attrprop('gid')
	dest = _ElWrap._make_xml_attrprop('dest')
	target = _ElWrap._make_xml_attrprop('target')

	def set_dest(self,value):
		self.get_xml_node().setAttribute('dest', value)
	def set_target(self, value):
		self.get_xml_node().setAttribute('target', value)
	def _get_mode(self):
		return _octint(_elattr(self.get_xml_node(), 'mode'), 8)
	def _set_mode(self, value):
		if not isinstance(value, int):
			value = int(value, 8)
		self.get_xml_node().setAttribute( 'mode', str(_octint(value)) )
	mode = property(_get_mode, _set_mode)
	
	def _get_kind(self):
		nn = self.get_xml_node().nodeName
		for (tname,tobj) in self._XML_TYPENAMES:
			if nn == tname: return tobj
		raise ValueError("unknown fileset entry type %r" % (nn,))
	
	def _set_kind(self, value):
		for (tname,tobj) in self._XML_TYPENAMES:
			if value is tobj:
				self.get_xml_node().nodeName = tname
				return
		raise ValueError("unknown fileset entry type %r" % (kind,))
	
	kind = property(_get_kind, _set_kind)
	
	def isfile(self): return self.kind is self.FILE
	def isdir(self): return self.kind is self.DIRECTORY
	def isdircontents(self): return self.kind is self.DIRCONTENTS
	def issymlink(self): return self.kind is self.SYMLINK

class Fileset(_xmlutil.ElementWrapper):
	def __init__(self, node=None, package=None):
		_xmlutil.ElementWrapper.__init__(self, node, name='fileset')
		self.package = package
	
	@property
	def name(self):
		return _elattr(self.get_xml_node(), 'name')
	
	@property
	def entries(self):
		ret = []
		for ch in self.get_xml_node().childNodes:
			if (ch.nodeType == ch.ELEMENT_NODE
					and not ch.nodeName in ('notes', 'description')):
				ret.append(FilesetEntry(ch, fileset=self))
		return ret

def parse_fileset(file, package=None):
	p = Fileset(package=package)
	p.parse_xml(file)
	return p

__all__ = ('Fileset', 'FilesetParser', 'parse_fileset',)
