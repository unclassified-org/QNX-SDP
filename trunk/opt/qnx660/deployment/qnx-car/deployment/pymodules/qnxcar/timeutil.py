import time as _time
import datetime as _datetime

_TD_ZERO = _datetime.timedelta(0)
class _FixedTZ(_datetime.tzinfo):
	def __init__(self, seconds, name='<unknown>'):
		self.name = name
		self.offset = _datetime.timedelta(seconds=seconds)
	def tzname(self, dt): return self.name
	def utcoffset(self, dt): return self.offset
	def dst(self, dt): return _TD_ZERO

UTC = _FixedTZ(0, 'UTC')

def datetime_utc(secs=None):
	if secs is None: secs = _time.time()
	return _datetime.datetime.fromtimestamp(secs, tz=UTC)

def datetime_local(secs=None):
	if secs is None: secs = _time.time()
	is_dst = _time.localtime(secs).tm_isdst
	if (is_dst == 1) and _time.daylight:
		tz = _FixedTZ(-_time.altzone, '<local_dst>')
	else:
		tz = _FixedTZ(-_time.timezone, '<local>')
	
	return _datetime.datetime.fromtimestamp(secs, tz=tz)
