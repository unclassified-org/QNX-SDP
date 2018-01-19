import copy as _copy
import sys as _sys
import qnxcar.util as _carutil
import xml.dom.minidom as _minidom

_error = _carutil.Key('xmlutil _error')
def get_node_attr(el, name, default=_error, parse_as=None):
	if el.hasAttribute(name):
		val = el.getAttribute(name)
		return parse_attr(val, parse_as)
	else:
		if default is _error:
			raise KeyError("no such attribute: %r (on node %r)"
			               % (name, el.nodeName))
		else:
			return default

def parse_attr(value, kind=None):
	if kind is None:
		return value
	elif isinstance(kind, type) and isinstance(value, kind):
		return value
	elif kind is bool:
		if value in ('0', 'false'):
			return False
		elif value in ('1', 'true'):
			return True
		else:
			raise ValueError("invalid boolean value %r" % (value,))
	else:
		return kind(value)

class get_node_attrmap(object):
	def __init__(self, el, default=_error):
		self.el = el
		self.default = default
	def __getitem__(self, k):
		return get_node_attr(self.el, k, self.default)

def find_direct_children(node, *names, **kw):
	_carutil.limit_kwargs(kw, 'nofail', 'single')
	nofail = kw.get('nofail', False)
	single = kw.get('single', False)
	
	ret = []
	for ch in getattr(node, 'childNodes', ()):
		if (ch.nodeType == ch.ELEMENT_NODE) and (ch.tagName in names):
			ret.append(ch)
	
	if nofail and not ret:
		raise ValueError("no child node %r" % (name,))
	elif single and len(ret) > 1:
		raise ValueError("multiple child nodes named %r" % (name,))
	return ret

def find_unique_child(node, *names, **kw):
	_carutil.limit_kwargs(kw, 'nofail')
	
	kw = kw.copy()
	kw['single'] = True
	ret = find_direct_children(node, *names, **kw)
	return ret[0] if ret else None

class ElementWrapper(object):
	def __init__(self, node=None, name=None):
		self._nodename = name
		if (node is None) and (name is not None):
			node = _minidom.Element(name)
			#e.ownerDocument = TODO
		self.set_xml_node(node)
	
	def __copy__(self):
		node = self._clone_xml_node()
		return type(self)(node, name=self._nodename)
	
	def get_xml_node(self):
		return self.__node
	
	def _clone_xml_node(self):
		node = self.get_xml_node()
		if node is not None:
			node = node.cloneNode(deep=0)
		return node
	
	def set_xml_node(self, node):
		if node.nodeType != node.ELEMENT_NODE:
			raise ValueError("expected element node")
		elif (self._nodename is not None) and (node is not None):
			name = node.tagName
			if name != self._nodename:
				raise ValueError("expected root element %r, got %r" % (
						self._nodename, name))
		
		self._clear_xml_cache()
		self.__node = node
	
	def parse_xml(self, file):
		"""parse 'file', a path string or file object"""
		try:
			dom = _minidom.parse(file)
		except Exception, e:
			print >> _sys.stderr, "Failed to parse XML file: %s" % (file,)
			raise
		
		self.set_xml_node(dom.documentElement)
	
	def _clear_xml_cache(self):
		self.__cache = {}
	def _get_xml_cache(self):
		return self.__cache
	
	def _cache_xml_attr(self, attr, fn):
		if attr in self.__cache:
			val = self.__cache[attr]
		else:
			val = fn()
			self.__cache[attr] = val
		return val
	
	@classmethod
	def _make_xml_attrprop(self, name, default=_error,
				parse_as=None, encode_fn=str):
		def get(s):
			node = s.get_xml_node()
			return get_node_attr(node, name, default, parse_as)
		def set(s,v):
			node = s.get_xml_node()
			node.setAttribute(encode_fn(v))
		return property(get, set)

def xml_to_wrapper(wrapcls, xmlfile):
	"Construct a subclass of ElementWrapper and load some XML into it."
	w = wrapcls()
	w.parse_xml(xmlfile)
	return w
