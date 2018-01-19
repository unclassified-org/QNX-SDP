import re as _re
import os.path as _ospath
import unittest as _unittest

def _getseps():
	ret = [ _ospath.sep ]
	if _ospath.altsep != None:
		ret.append(_ospath.altsep)
	
	# we assume elsewhere that os.path recognises '/' as a separator
	assert '/' in ret
	
	return tuple(ret)

_seps = _getseps()
_seps_esc = tuple( _re.escape(x) for x in _seps )
_sep_class_one = '[%s]' % (''.join(_seps_esc),)
_nonsep_class_one = '[^%s]' % (''.join(_seps_esc),)
_nonsep_class_any = _nonsep_class_one + '*'
_sep_pipe_str = '|'.join(_seps_esc)

_special_re_str = r"""(?x)  # identify this string as a verbose regex
      \\(.|$)               # escape sequence
    | / \*? \*? \*?         # '/', possibly followed by '*', '**', or '***'
    | \* \*? \*?            # '*', '**', '***'
    | \?                    # "?"
    | \[ (      # opening '[' (or '[' alone)
         \!?    #   optional '!'
         \]?    #   allow ']' as first character
         [^]]*  #   remaining text
      \] )?     # closing ']'

    # special characters which need escaping
    | [   . ^ $ + { \\ | ( )  ]+
"""
_special_re = _re.compile(_special_re_str)


def _translate(pat):
	"Translate an rsync pattern to a Python regular expression."
	
#	if not iswild(pat):
		# rsync only treats backslash as an escape in wildcard patterns
	pat = pat.replace('\\', '\\\\')
	ret = '(?s)'      # dot matches any character
	
	if pat and (pat[0] in _seps) and not (pat[1:2] in _seps):
		# match at beginning of string only
		pat = pat[1:]
		ret += '^'
	elif pat and (pat[0] == '\\') and (pat[1:2] == '\\'):
		# match at beginning of string only(for Windows)
		pat = pat[2:]
		ret += '^'
	else:
		# match after '/' or at beginning of string
		ret += '(%s|^)' % (_sep_pipe_str,)
	
	# for every substring matching _special_re, call _patrepl
	# and replace the substring with its return value
	ret += _special_re.sub(_patrepl, pat)
	
	# ensure a directory will match, even if the pattern
	# didn't include '/'
	ret += (_sep_class_one + '?')
	
	# the pattern must match to the end of the string
	return ret + '$'

# Convert the given pattern fragment to regular expression syntax.
# Used by _translate.
def _patrepl(match, escape_unknown=True):
	text = match.group(0)
	if text in ('***', '/***'):
		return '.*'
	elif '*' in text:
		prefix = ''
		if text[0] == '/' or text[0] == '\\':
			# given pattern 'PAT/*' or 'PAT/**', don't match 'PAT/';
			# we need at least one character after '/'
			# (but use (?=...) so we don't consume the character)
			assert text in ('/*', '/**', '\\*','\\**')
			prefix += '%s(?=%s)' % (_sep_class_one, _nonsep_class_one)
		else:
			assert text in ('*', '**')
		
		if text.endswith('**'):
			ret = prefix + '.*'
		else:
			ret = prefix + _nonsep_class_one + '*'
		return ret
	elif text == '?':
		# match one character, excluding directory separators
		return _nonsep_class_one
	elif text == '/':
		# match one directory separator
		return _sep_class_one
	elif text.startswith('[') and len(text) > 1:
		# match any character in the given group
		
		assert text.endswith(']')
		text = text[1:-1]         # strip '['
		
		prefix = '['
		if text.startswith('!'):  # invert the match
			prefix += '^'
			text = text[1:]
		
		if text.startswith(']'):  # match a literal ']'
			prefix += ']'
			text = text[1:]
		
		# escape the rest of the string (the set of characters to match)
		text = text.replace('\\', '\\\\')
		text = text.replace('^', '\\^')
		return prefix + text + ']'
	elif text.startswith('\\'):
		if text in ('\\', '\\/'):
			# '\' at end of string or path component; treat it literally
			# (treating r'\/' as '/' would break splitwild)
			return re.escape(text)
		else:
			# escaped character
			return text
	elif escape_unknown:
		# other characters just need to be escaped
		return _re.escape(text)

def compile(pat):
	"Compile the given rsync pattern to a Python regular expression object."
	return _re.compile(_translate(pat))

def iswild(pat):
	"Returns True iff the given string is a wildcard pattern."
	return ('*' in pat) or ('?' in pat) or ('[' in pat)

def splitwild(pat):
	"""Use os.split to split off the wildcard portion of the filename.
Returns a tuple (static_part, wild_part).
wild_part is None if iswild(pat) is False."""
	
	pat_static = pat
	pat_wild = None
	while iswild(pat_static):
		(pat_static, x) = _ospath.split(pat_static)
		if pat_wild is None:
			pat_wild = x
		else:
			pat_wild = _ospath.join(x, pat_wild)
	return (pat_static, pat_wild)

def _norm_gen(text, ispat):
	if ispat: isdir = text.endswith('/')
	else: isdir = (text[-1:] in _seps)
	
	text = _ospath.normcase(_ospath.normpath(text))
	if isdir:  # append '/'
		if ispat: text += '/'
		else: text = _ospath.join(text, '')
	return text

def _normpath(path): return _norm_gen(path, ispat=False)
def _normpattern(path): return _norm_gen(path, ispat=True)

def matchfn(pat, norm=True):
	"Return a function fn(path) that returns True iff path matches the pattern."
	
	if norm: pat = _normpattern(pat)
	c = compile(pat)
	def fn(path):
		if norm: path = _normpath(path)
		return bool(c.search(path))
	return fn

class _TestMatcher(_unittest.TestCase):
	def test_star(self):
		match = matchfn('a/b/*')
		self.assertTrue(match('a/b/ccc'))
		self.assertFalse(match('a/b/ccc/ddd'))
	
	def test_doublestar(self):
		match = matchfn('a/b/**')
		self.assertTrue(match('a/b/ccc'))
		self.assertTrue(match('a/b/ccc/ddd'))
	
	def test_slash_star(self):
		match = matchfn('a/b/*c')
		self.assertTrue(match('a/b/c'))
		self.assertFalse(match('a/b/'))

if __name__ == '__main__':
	_unittest.main()
