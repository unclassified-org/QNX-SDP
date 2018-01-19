from struct import *

class PartitionTable:
        
	class Entry:
 		def __init__(self, isboot, type, numsectors):
			self.isboot = isboot
			self.type = type
			self.numsectors = numsectors

		def encode(self, partitiontable, startingsector):
			# calculate the end sector
			endingsector = startingsector + self.numsectors - 1
			# generate the CHS data
			startchs = self.__chs(partitiontable.sectorspertrack, partitiontable.heads, startingsector)
			endchs = self.__chs(partitiontable.sectorspertrack, partitiontable.heads, endingsector)
			# if this is a boot sector it starts with a different header
			if self.isboot:
				header = pack('B', 0x80)
			else:
				header = pack('B', 0)
			# encode the type
			type = pack('B', self.type)
			# formulate the partition table entry from the raw bits
			entry = header + startchs + pack('B', self.type) + endchs + pack('<I', startingsector) + pack('<I', self.numsectors)
			# done
			return entry
		
		def __chs(self, spt, hpc, lba):
			# convert LBA to CHS
			c = int(int(lba) / int(spt * hpc));
			h = int((int(lba) / int(spt)) % int(hpc));
			s = int(int(lba) % int(spt)) + int(1);
			# if we've moved beyond the max allowed in CHS then return the well-known max
			if (c > 1024):
				return pack('B', 0xFE) + pack('B', 0xFF) + pack('B', 0xFF)
			# convert the values into bit strings
			c_bin = "{0:010b}".format(c)
			h_bin = "{0:08b}".format(h)
			s_bin = "{0:06b}".format(s)
			# create the 3-byte tuple in bit string form
			chs_bin = h_bin + c_bin[:2] + s_bin + c_bin[2:];
                        # parse the bit string
			bits = self.__bits_to_bytes(chs_bin)
			return bits

		def __bits_to_bytes(self, bits):
			# start with an empty string
			bytes = []
			# iterate as long as there are bits left
			while (0 < len(bits)):
				# take the leading 8 bits
                                byte_bin = bits[:8]
				# convert to an binary byte
				byte = int(byte_bin, 2)
				bytes.append(pack('B', byte))
				# drop the leading 8 bits
				bits = bits[8:]
			# done
			return ''.join(bytes)
			
	def __init__(self, heads, sectorspertrack, cylinders, startingsector):
                self.heads = heads
                self.sectorspertrack = sectorspertrack
                self.cylinders = cylinders
		self.startingsector = startingsector
		self.entries = [None] * 4;

	def add_entry(self, index, entry): 
		if ((1 > index) or (4 < index)): 
			raise ValueError("invalid partition index")
		self.entries[index - 1] = entry

	def encode(self):
		# generate the padding
		data = self.__padding(446)
		# start at the starting sector
		startingsector = self.startingsector
		# for each entry create the data then write it
		for i in range(len(self.entries)):
			try:
				# encode the data if we have an entry
				entry = self.entries[i]
				bytes = entry.encode(self, startingsector)
 				# append the entry
				data = data + bytes
				# move the starting sector forward 
				startingsector += entry.numsectors
			except IndexError:
				# no entry so append padding
				data = data + self.__padding(16)
		# append the boot signature
		return data + pack('B', 0x55) + pack('B', 0xAA)
		
	def __padding(self, size):
		# create a zero byte
		byte = pack('B', 0)
		# copy 'size' times
		data = byte * size;
		return data 
