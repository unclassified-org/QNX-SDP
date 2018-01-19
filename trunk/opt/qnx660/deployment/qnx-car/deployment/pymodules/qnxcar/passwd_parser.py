import qnxcar.util as _carutil
import qnxcar.xmlutil as _xmlutil

_elattr = _xmlutil.get_node_attr
_ElWrap = _xmlutil.ElementWrapper

class _User(_ElWrap):
	name = _ElWrap._make_xml_attrprop('name')
	uid = _ElWrap._make_xml_attrprop('uid', parse_as=int)
	gid = _ElWrap._make_xml_attrprop('gid', parse_as=int)
	home = _ElWrap._make_xml_attrprop('home')
	shell = _ElWrap._make_xml_attrprop('shell')
	fullname = _ElWrap._make_xml_attrprop('fullname')

class _Group(_ElWrap):
	name = _ElWrap._make_xml_attrprop('name')
	gid = _ElWrap._make_xml_attrprop('gid', parse_as=int)
	members = _ElWrap._make_xml_attrprop('members',
			parse_as=lambda text: text.split(','),
			encode_fn=lambda lst: ','.join(lst) )

class _DummyResult(object):
	def __init__(self, **kw):
		for (k,v) in kw.items():
			setattr(self, k, v)
	def __nonzero__(self): return False

def _ug_lookup(cls, lst, key, nofail, dummy):
	try: key = int(key, 10)
	except ValueError: pass
	
	class _FieldSet(object):
		def __init__(self, num, name):
			self.num = num
			self.name = name
	
	if cls is UserList: fields = _FieldSet(num='uid', name='user')
	elif cls is GroupList: fields = _FieldSet(num='gid', name='group')
	else: assert False
	
	for item in lst:
		num = getattr(item, fields.num)
		name = getattr(item, 'name')
		if key in (name, num):
			return item
	
	if dummy is None:
		dummy = False if nofail else True
	
	if dummy:
		if isinstance(key, int):
			return _DummyResult(fields.num, val)
		elif isinstance(key, str) or isinstance(key, unicode):
			return _DummyResult(fields.name, val)
	elif nofail:
		raise ValueError("no such %s: %r" % (fields.name, key))

class UserList(_xmlutil.ElementWrapper):
	def __init__(self, node=None):
		_xmlutil.ElementWrapper.__init__(self, node, name='users')
	
	@property
	def users(self):
		chnodes = _xmlutil.find_direct_children(
				self.get_xml_node(), 'user')
		return [ _User(ch) for ch in chnodes ]
	
	def lookup(self, user, nofail=False, dummy=None):
		return _ug_lookup(UserList, self.users, user, nofail, dummy)

class GroupList(_xmlutil.ElementWrapper):
	def __init__(self, node=None):
		_xmlutil.ElementWrapper.__init__(self, node, name='groups')
	
	@property
	def groups(self):
		chnodes = _xmlutil.find_direct_children(
				self.get_xml_node(), 'group')
		return [ _Group(ch) for ch in chnodes ]
	
	def lookup(self, group, nofail=False, dummy=None):
		return _ug_lookup(GroupList, self.groups, group, nofail, dummy)

class _Passwd(object):
	pass

def parse_passwd(locator):
	p = _Passwd()
	
	p.userlist = UserList()
	p.userlist.parse_xml(
			locator.locate('deployment/share/users.xml', nofail=1) )
	
	p.grouplist = GroupList()
	p.grouplist.parse_xml(
			locator.locate('deployment/share/groups.xml', nofail=1) )
	
	return p

__all__ = ('UserList', 'GroupList', 'parse_passwd')
