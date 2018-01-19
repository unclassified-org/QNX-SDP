import xml.dom.minidom as _minidom
import qnxcar.path as _carpath
import qnxcar.xmlutil as _xmlutil
import os.path as _ospath
import qnxcar.fileset_parser as _fsparser
import sys

_filetype = file
_elattr = _xmlutil.get_node_attr
_ElWrap = _xmlutil.ElementWrapper

class _Package(_ElWrap):
	def __init__(self, board, xmlnode):
		self._board = board
		_xmlutil.ElementWrapper.__init__(self, xmlnode, name='package')
	
	@property
	def board(self):
		return self._board
	
	def _chnodes(self, *names):
		return _xmlutil.find_direct_children(self.get_xml_node(), *names)
	
	def get_fileset_names(self):
		ret = []
		for el in self._chnodes('include-fileset'):
			ret.append( _elattr(el, 'name', None) )
		return ret
	
	def get_filesets(self):
		loc = _carpath.get_stage_locator(self.board.boardname)
		
		ret = []
		for name in self.get_fileset_names():
			path = _carpath.find_fileset(loc, name, nofail=False)
			if path == None:
				print >> sys.stderr, "Warning: file not found: " + name
				continue
			fs = _fsparser.parse_fileset(path, package=self)
			ret.append(fs)
		return ret
	
	def get_appset_names(self):
		ret = []
		for el in self._chnodes('include-appset'):
			ret.append( _elattr(el, 'name', None) )
		return ret
	
	name = _ElWrap._make_xml_attrprop('name')
	install_path = _ElWrap._make_xml_attrprop('install_path')

class _App(_xmlutil.ElementWrapper):
	def __init__(self, board, xmlnode):
		self._board = board
		_xmlutil.ElementWrapper.__init__(self, xmlnode,
				name='include-application')
	
	@property
	def name(self):
		return _elattr(self.get_xml_node(), 'name')
	
	@property
	def seeded(self):
		return _elattr(self.get_xml_node(), 'seeded', None)
	
	@property
	def secure(self):
		val = _elattr(self.get_xml_node(), 'secure', None, bool)
		return val if (val is not None) else self._board.secure

def _root_attr_prop(*args, **kw):
	return property(lambda self: self._get_root_attr(*args, **kw))

class Board(_xmlutil.ElementWrapper):
	def __init__(self, name, profilename, car_config=None):
    
		_xmlutil.ElementWrapper.__init__(self, name='board')
		self.boardname = name
		self.profilename = profilename
		self.car_config = car_config
	
	def find_profile(self):
		loc = _carpath.get_stage_locator(self.boardname)
		file = _ospath.join(loc.boarddir, self.profilename)
		if not _ospath.exists(file):
			raise IOError("file not found: " + file)
		return file
	
	def parse_xml(self, file=None):
		if file is None:
			file = self.find_profile()
		
		if isinstance(file, _filetype):
			filename = file.name
		else:
			filename = file
		
		self.xmlfile = filename
		_xmlutil.ElementWrapper.parse_xml(self, file)
	
	### internal XML parsing functions
	
	def _get_packaging_node(self):
		return _xmlutil.find_unique_child(
				self.get_xml_node(), 'packaging')
	
	def _get_package_nodes(self):
		return _xmlutil.find_direct_children(
				self._get_packaging_node(), 'package')
	
	def _get_apps_node(self):
		return _xmlutil.find_unique_child(
				self._get_packaging_node(), 'applications')
	
	def _get_app_includes(self):
		return _xmlutil.find_direct_children(
				self._get_apps_node(), 'include-application')
	
	def _get_root_attr(self, *args, **kw):
		return _elattr(self.get_xml_node(), *args, **kw)
	
	### external accessor functions
	
	def get_packages(self):
		return [ _Package(self,n) for n in self._get_package_nodes() ]
	
	def get_included_apps(self):
		return [ _App(self,n) for n in self._get_app_includes() ]
	
	type = _root_attr_prop('type')
	cpu = _root_attr_prop('cpu')
	profile = _root_attr_prop('profile')
	description = _root_attr_prop('description', '')
	secure = _root_attr_prop('secure', False, bool)

__all__ = ('Board',)
