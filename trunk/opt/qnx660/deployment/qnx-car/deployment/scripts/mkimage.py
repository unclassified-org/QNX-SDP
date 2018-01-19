#!/usr/bin/python
import tarfile
import sys
import os
import tempfile
import shutil
import ConfigParser
import optparse 
import subprocess
import inspect
import stat

# these are the partition types we support
PARTITIONTYPES = set([12, 177, 178, 179])

# constants for the types used in mkxfs build files
DIR = "dir"
FILE = "file"
LINK = "link"

# this class models a partition to be created in the disk image created by this utility
class Partition: 
	def __init__(self, name, path, type, numsectors, order):
		self.name = name
		# strip any leading slashes or spaces for later comparisons
		self.path = path.lstrip('/ ')
		self.type = type
		self.numsectors = numsectors
		self.order = order

# this class models a file that will be created one of the partitions in the disk image created by this utility
class File:
	def __init__(self, sourcepath, destpath, uid, gid, mode, type):
		self.sourcepath = sourcepath
		self.destpath = destpath
		self.uid = uid
		self.gid = gid
		self.mode = mode
		self.type = type

# this class encapsulates the logic of creating a QNX6 file system .build file for mkxfs 
class QNX6Builder:
	def __init__(self, path, partition, sectorsize):
		self.build = path + '/' + partition.name + ".build"
		self.image = path + '/' + partition.name + ".image"
		self.handle = open(self.build, 'w')
		self.handle.write("[num_sectors=" + str(partition.numsectors) + "]\n")
		self.handle.write("[sector_size=" + str(sectorsize) + "]\n")

	def process_file(self, file):
		#for case that first digit of mode is not 0
		if file.mode >= 512:  # Octal: 01000 (Sticky bit) is 512 decimal
			file_mode = oct(file.mode)[1:]
		else:
			file_mode = oct(file.mode)
		if file.type == 'dir':
			line = "[type=" + file.type + " uid=" + str(file.uid) + " gid=" + str(file.gid) + " dperms=" + file_mode + '] "' + file.destpath.rstrip('/') + '"\n'
		else:	
			line = "[type=" + file.type + " uid=" + str(file.uid) + " gid=" + str(file.gid) + " perms=" + file_mode + '] "' + file.destpath + '"="' + file.sourcepath + '"\n'
		self.handle.write(line)

	def finish(self):
		# close the file handle
		self.handle.close()
		# call mkxfs to build the image
		if os.path.exists(os.path.join(currentdir, "mkxfs")):
			command = os.path.join(currentdir, "mkxfs") + " -t qnx6fsimg " + self.build + ' ' + self.image
		else:
			command = "mkxfs -t qnx6fsimg " + self.build + ' ' + self.image
		print >> sys.stdout, "invoking: " + command
		try:
			subprocess.check_call(command, shell=True)
		except subprocess.CalledProcessError as e:
			raise RuntimeError(e)

# this class encapsulates the logic of creating a FAT file system .build file for mkxfs
class FATBuilder:
	def __init__(self, path, partition, sectorsize):
		self.build = path + '/' + partition.name + ".build"
		self.image = path + '/' + partition.name + ".image"
		self.handle = open(self.build, 'w')
		self.handle.write("[num_sectors=" + str(partition.numsectors) + "]\n")
		self.handle.write("[sector_size=" + str(sectorsize) + "]\n")
		self.handle.write("[fat=16]\n")

	def process_file(self, file):
		if file.type is LINK:
			print >> sys.stdout, "WARNING: skipping " + file.sourcepath + " symbolic link in FAT partition\n"
			return
		line = "[type=" + file.type + "] " + '"' + file.destpath + '"="' + file.sourcepath + '"\n'
		self.handle.write(line)

	def finish(self):
		# close the file handle
		self.handle.close()
		# call mkxfs to build the image
		if os.path.exists(os.path.join(currentdir, "mkxfs")):
			command = os.path.join(currentdir, "mkxfs") + " -t fatfsimg " + self.build + ' ' + self.image
		else:
			command = "mkxfs -t fatfsimg " + self.build + ' ' + self.image
		print >> sys.stdout, "invoking: " + command
		try:
			subprocess.check_call(command, shell=True)
		except subprocess.CalledProcessError as e:
			raise RuntimeError(e)


# sort function for Partition objects to order by path length
def path_sort(val1, val2):
	length1 = len(val1.path)
	length2 = len(val2.path)
	return (length2 - length1)
	
# sort function for Partition objects to order by specified order
def order_sort(val1, val2):
	return val1.order - val2.order

# create the options parser
optionsparser = optparse.OptionParser()

# define the options we require/support
optionsparser.add_option("-c", "--config", help="use the specified config file")
optionsparser.add_option("-o", "--output", help="write to the specified image file")
optionsparser.add_option("-p", "--partition_path", help="path to save the partition images")
optionsparser.add_option("-t", "--tar_path", help="specify the path where tar files are located")
optionsparser.add_option("--tars", help="specify the list of tar files")
optionsparser.add_option("-v", "--verbose",
		action='count', dest='verbosity',
		help="increase verbosity")


# set the default options
optionsparser.set_defaults(output='')
optionsparser.set_defaults(tar_path='')
optionsparser.set_defaults(config='')
optionsparser.set_defaults(tars = '')
optionsparser.set_defaults(partition_path='')
optionsparser.set_defaults(verbosity=0)

# parse the options
(options, args) = optionsparser.parse_args()

# validate options
if (not options.tar_path): optionsparser.error("No tar files' directory specified")
if (not options.output): optionsparser.error("No output file specified")
if (not options.config): optionsparser.error("No config file specified")

# make sure that QNX_HOST is specified
hostdir = os.environ.get('QNX_HOST');
if (hostdir is None): 
	print >> sys.stderr, "QNX_HOST is not defined"
	sys.exit(1)
targetdir = os.environ.get('QNX_TARGET');
if (hostdir is None): 
	print >> sys.stderr, "QNX_TARGET is not defined"
	sys.exit(1)
currentdir = os.path.dirname(os.path.realpath(__file__))

# open and read the config file
config = ConfigParser.RawConfigParser()
configfile = open(options.config, 'r')
config.readfp(configfile)
configfile.close

# extract the content
tar_file_list = options.tars.split(',')

# extract the disk geometry
heads = config.getint('disk', 'heads')
sectorspertrack = config.getint('disk', 'sectors_per_track')
cylinders = config.getint('disk', 'cylinders')
sectorsize = config.getint('disk', 'sector_size')

# remove the disk section as it is 'special'
config.remove_section('disk')

# we create two lists for lookups later
# - one sorted by partition order 
# - the other sorted by the length of the path
orderlist = []
pathlist = []

# go through all sections
for section in config.sections():
	# extract the information for this partition
	path=config.get(section, 'path')
	type=config.getint(section, 'type')
	numsectors=config.getint(section, 'num_sectors')
	order=config.getint(section, 'order')
	# validate the partition type
	if not type in PARTITIONTYPES:
		print  >> sys.stderr, "Illegal partition type: " + str(type)
		sys.exit(1)
	# create the partition object
	partition = Partition(section, path, type, numsectors, order)
	# insert into our lists
	orderlist.append(partition)
	pathlist.append(partition)

# sort the lists so that we will iterate through them in the right order
pathlist.sort(path_sort)
orderlist.sort(order_sort)

# put all tar file paths into list
tarPaths = []
for tar_file in tar_file_list:
	tarPaths.append(os.path.join(options.tar_path, tar_file))

# open the input tar files	
tars = []
for tarPath in tarPaths:
	name = os.path.expanduser(tarPath)
	print >>sys.stdout, "Open tar: " + name
	tars.append(tarfile.TarFile.open(name, mode='r'))


# create a temporary directory where we'll:
# - extract the file from the TAR file
# - create the .build files
# - create temporary .image files for each partition
# - create the diskimage config file to create the final disk image
tempdir = tempfile.mkdtemp()
print >> sys.stdout, "Created temporary directory " + tempdir

# do all of the rest in a try so that we're sure that the temporary directory is cleaned up
try:
	# create the .build builders for each partition
	builders = dict()
	for partition in pathlist:
		# create the builder for this partition type
		if (12 == partition.type):
			builder = FATBuilder(tempdir, partition, sectorsize)
		elif ((177 == partition.type) or (178 == partition.type) or (179 == partition.type)):
			builder = QNX6Builder(tempdir, partition, sectorsize)
		# store the builder in the lookup
		builders[partition.name] = builder

	for tar in tars:
		# iterate through all files in the tar file
		for tarinfo in tar:
			# skip special directories that end in a period
			if tarinfo.name.endswith('.'):
				continue
			# extract the file to the temporary directory
			sourcepath = tempdir + '/' + tarinfo.name
			tar.extract(tarinfo, tempdir)
			# figure out what type of file we have
			if tarinfo.isfile():
				type = FILE
			elif tarinfo.isdir():
				type = DIR
			elif tarinfo.issym():
				type = LINK
			else:
				# skip all other types of file 
				continue
			# see which partition this file belongs in
			found = False
			for partition in pathlist:
				# strip any leading slashes for the comparison
				destpath = tarinfo.name.lstrip('/')
				# if the file starts with this partition's path then we've found its home
				if destpath.startswith(partition.path):
					# found a home
					found = True
					# if this is a symbolic link the source path is the link info from the tar file
					if type == LINK:
						sourcepath = tarinfo.linkpath
					# remove the partition path from the destination path
					destpath = destpath[len(partition.path):]
					# create the file object
					file = File(sourcepath, destpath, tarinfo.uid, tarinfo.gid, tarinfo.mode, type)
					# get the builder
					builder = builders[partition.name]
					# let the builder write out an entry
					builder.process_file(file)
					print  >> sys.stdout, partition.name + ' <-- ' + destpath + ' [' + file.type + ']'
					# done with this file
					break
			# if not found then we've skipped it
			if not found:
				print >> sys.stdout, 'skipped ' + tarinfo.name	

	# build the partition images 
	for builder in builders.values():
		builder.finish()
	
	# create the disk image config file
	imageconfigpath = tempdir + '/image.cfg'
  	imageconfigfile = open(imageconfigpath, 'w')
	# write the disk section
	print >> imageconfigfile, "[heads=" + str(heads) +"]"
	print >> imageconfigfile, "[sectors_per_track=" + str(sectorspertrack) + "]" 
	print >> imageconfigfile, "[sector_size=" + str(sectorsize) + "]"
	print >> imageconfigfile, "[cylinders=" + str(cylinders) + "]"
	print >> imageconfigfile, "[start_at_cylinder=1]" 
	# create a section for each partition
	for i in range(len(orderlist)):
		partition = orderlist[i]
		partitionid = i + 1
		output = "[partition=" + str(partitionid) + " "
		# the first partition is marked as bootable
		if partitionid == 1:
			output += "boot=true "
		output += "type=" + str(partition.type) + " "
		output += "num_sectors=" + str(partition.numsectors) + "]"
		builder = builders[partition.name]
		output +=  " \"" + builder.image + "\""
		print >> imageconfigfile, output
	# close the config file to flush it to disk
	imageconfigfile.close()

	# call diskimage to create the disk image
	currentdir = os.path.dirname(os.path.abspath(inspect.getfile(inspect.currentframe())))
	command = "diskimage -c " + imageconfigpath + " -o " + options.output 
	if options.verbosity > 0:
		command += " -" + "v" * options.verbosity
	print >> sys.stdout, "invoking: " + command
	try:
			subprocess.check_call(command, shell=True)

			# Save the partition images
			if options.partition_path:
 				if not os.path.exists(options.partition_path):
					if options.verbosity > 2:
						print >> sys.stdout, "[verbo]: Creating partition directory: [%s]." % options.partition_path
					os.makedirs(options.partition_path)

				for directoryItem in os.listdir(tempdir):
					if directoryItem.endswith('.image') and os.path.isfile(os.path.join(tempdir, directoryItem)):
						if options.verbosity > 2:
							print >> sys.stdout, "[verbo]: Saving Partition Image File: [%s] to: [%s]." % (directoryItem, options.partition_path)
						shutil.copy(os.path.join(tempdir, directoryItem), options.partition_path)
			else:
				if options.verbosity > 2:
					print >> sys.stdout, "[verbo]: Not saving partitions."
	except subprocess.CalledProcessError as e:
			print >> sys.stdout, "WARNING: diskimage returned " + str(e.returncode) + "\n"

finally: # always remove the temporary directory
	def ReadOnlyHandler(func, path, info):
		if not os.access(path, os.W_OK):
			os.chmod(path, stat.S_IWUSR)
			func(path)
		else:
			raise

	shutil.rmtree(tempdir, ignore_errors=False, onerror=ReadOnlyHandler)
	print >> sys.stdout, "Removed temporary directory " + tempdir + "\n"
print >> sys.stdout, "Disk image created at " + options.output

