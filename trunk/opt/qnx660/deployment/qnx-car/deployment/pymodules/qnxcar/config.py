"""
CarConfig is meant to be used as a top-level object for accessing properties
related the stage directory or current configuration, even if no specific
board is selected.

For example, we can always determine the stage root and access architecture-
independent files like users.xml.  And if an architecture is set, we can access
the architecture-specific files even if no board is set.
"""

import qnxcar.path as _carpath
import qnxcar.board_parser as _boardp
import qnxcar.passwd_parser as _passwdp
import qnxcar.apps_parser as _app_p

class CarConfig(object):
	def __init__(self):
		self._cpu = None
		self._symbols = None
		self._boardname = None
		self._profile = 'profile.xml'
		self._clearcache()
	
	def _clearcache(self):
		self.__cache = {}
	def _getcache(self, key, fn=None):
		if not key in self.__cache:
			if fn is not None:
				self.__cache[key] = fn()
		return self.__cache[key]
	
	def _get_cpu(self):
		if self._cpu is not None:
			return self._cpu
		elif self.board is not None:
			return self.board.cpu
	def _set_cpu(self, value):
		self._clearcache()
		self._cpu = value
	cpu = property(_get_cpu, _set_cpu)
	
	def _get_symbols(self):
		if self._symbols is not None:
			return self._symbols
	def _set_symbols(self, value):
		self._clearcache()
		self._symbols = value
	symbols = property(_get_symbols, _set_symbols)
	
	def _get_profile(self):
		if self._profile is not None:
			return self._profile
	def _set_profile(self, value):
		self._clearcache()
		self._profile = value
	profile = property(_get_profile, _set_profile)

	@property
	def board(self):
		def _init():
			name = self.boardname
			if name:
				b = _boardp.Board(name, self.profile, car_config=self)
				b.parse_xml()
				return b
		return self._getcache('board', _init)
	
	def _get_boardname(self):
		return self._boardname
	def _set_boardname(self, value):
		self._clearcache()
		self._boardname = value
	boardname = property(_get_boardname, _set_boardname)
	
	@property
	def locator(self):
		return _carpath.get_stage_locator(
				boardname=self.boardname, cpudir=self.cpu, includesymbols=self.symbols)
	
	@property
	def boarddir(self):
		return getattr(self.locator, 'boarddir', None)
	
	def __parsexml(self, cls, filename):
		path = self.locator.locate(filename, nofail=1)
		obj = cls()
		obj.parse_xml(path)
		return obj
	
	@property
	def userlist(self):
		def _init():
			return self.__parsexml( _passwdp.UserList,
					'deployment/share/users.xml' )
		return self._getcache('userlist', _init)
	
	@property
	def grouplist(self):
		def _init():
			return self.__parsexml( _passwdp.GroupList,
					'deployment/share/groups.xml' )
		return self._getcache('grouplist', _init)
	
	@property
	def applist(self):
		def _init():
			return self.__parsexml( _app_p.ApplicationList,
					'deployment/share/applications.xml' )
		return self._getcache('applist', _init)
	
	@property
	def oldapplist(self):
		def _init():
			return self.__parsexml( _app_p.OldStyleAppList,
					'deployment/share/old-style-applications.xml' )
		return self._getcache('oldapplist', _init)
	
	def find_fileset(self, name, nofail=False):
		return _carpath.find_fileset(self.locator, name, nofail=nofail)

__all__ = ('CarConfig')
