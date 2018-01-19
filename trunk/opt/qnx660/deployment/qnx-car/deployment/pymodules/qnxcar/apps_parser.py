import qnxcar.util as _carutil
import qnxcar.xmlutil as _xmlutil

_elattr = _xmlutil.get_node_attr
_ElWrap = _xmlutil.ElementWrapper
def _error(): pass

class _NewStyleApp(_ElWrap):
	name = _ElWrap._make_xml_attrprop('name')
	srcPath = _ElWrap._make_xml_attrprop('srcPath')
	extras = _ElWrap._make_xml_attrprop('extras')
	classification = _ElWrap._make_xml_attrprop('classification')

class _OldStyleApp(_ElWrap):
	name = _ElWrap._make_xml_attrprop('name')
	icon = _ElWrap._make_xml_attrprop('icon')
	description = _ElWrap._make_xml_attrprop('description')
	group = _ElWrap._make_xml_attrprop('group')
	
	@property
	def menuentry(self):
		return ','.join([
			self.icon,
			self.description,
			self.group,
			'',
			'',
		])
	
	@property
	def ppsmenuline(self):
		return '%s::%s\n' % (self.name, self.menuentry)

class _BaseApplicationList(_xmlutil.ElementWrapper):
	def __init__(self, node=None, oldstyle=False):
		if oldstyle:
			name = 'old-style-applications'
			self.__appclass = _OldStyleApp
		else:
			name = 'applications'
			self.__appclass = _NewStyleApp
		
		_xmlutil.ElementWrapper.__init__(self, node, name=name)
	
	@property
	def apps(self):
		def init():
			chnodes = _xmlutil.find_direct_children(
					self.get_xml_node(), 'application')
			return tuple(self.__appclass(ch) for ch in chnodes)
		
		return self._cache_xml_attr('apps', init)
	
	def get_app(self, name, default=_error):
		def init():
			d = {}
			for a in self.apps:
				d[a.name] = a
			return d
		
		d = self._cache_xml_attr('appdict', init)
		if default is _error:
			return d[name]
		else:
			return d.get(name, default)

class ApplicationList(_BaseApplicationList):
	def __init__(self, node=None):
		_BaseApplicationList.__init__(self, node, oldstyle=False)

class OldStyleAppList(_BaseApplicationList):
	def __init__(self, node=None):
		_BaseApplicationList.__init__(self, node, oldstyle=True)

__all__ = ('ApplicationList', 'OldStyleAppList')
