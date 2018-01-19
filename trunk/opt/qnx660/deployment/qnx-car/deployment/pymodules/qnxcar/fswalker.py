#!/usr/bin/python
# this module can be used to walk a filesystem

import errno as _errno
import os as _os
import os.path as _ospath

def _unset(): pass

class BaseNode(object):
	def __init__(self, parent=None):
		self.parent = parent
	
	def getchildnames(self):
		"""Return a list of child names; or None if the node is a leaf
(e.g., if the node is a not a directory).

This returns self.childnames if set; otherwise, it stores the return value
of self._findchildnames() as self.childnames and returns it."""
		
		ret = getattr(self, 'childnames', _unset)
		if ret is _unset:   # 'childnames' hasn't been set yet
			ret = self._findchildnames()
			self.childnames = ret
		
		return ret
	
	def resetchildnames(self):
		"""Delete self.childnames if present.
The next getchildnames call will reload it."""
		
		ret = getattr(self, 'childnames', _unset)
		if ret is not _unset:
			del self.childnames
	
	def _findchildnames(self):
		"""Called by getchildnames to generate a list of children.
This function isn't implemented, and must be overridden by a subclass."""
		
		raise NotImplementedError()
	
	def _makechild(self, name):
		"""Create a child node with the given name (as returned by getchildnames).
This function isn't implemented, and must be overridden by a subclass."""
		
		raise NotImplementedError()
	
	def __iter__(self):
		"""Iterate over all children in depth-first order."""
		
		childnames = self.getchildnames()
		if childnames is not None:
			for name in childnames:
				child = self._makechild(name)
				yield child
				
				# the caller can set/modify child.childnames now
				
				for x in child:
					yield x

def _undef(): pass
class Node(BaseNode):
	def __init__(self, path=_undef, parent=None):
		BaseNode.__init__(self, parent)
		if path is not _undef:
			self.path = path
	
	def _os_listdir(self, path):
		"""Call os.listdir and return the sorted result.
Override this function if a different sort order is needed."""
		
		ret = _os.listdir(path)
		ret.sort()
		return ret
	
	def _listdir(self, path):
		"Call self._os_listdir, but return None if we get an ENOTDIR error."
		try:
			return self._os_listdir(path)
		except OSError, e:
			if e.errno == _errno.ENOTDIR or e.errno == _errno.EINVAL:
				return None
			else:
				raise
	
	def _findchildnames(self):
		return self._listdir(self.path)
	
	def _makechild(self, name):
		return Node(parent=self, path=_ospath.join(self.path, name))

__all__ = ('BaseNode', 'Node')
