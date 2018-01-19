#!/usr/bin/python
"""
Controller script to instigate complete CAR2 imaging mechanism including:   .
- Generation of IFS                                                          .
- Generation of mktar archive                                                .
- Generation of image file                                                   .
"""

from optparse import OptionParser
import os.path
import sys
import logging
import re
import ConfigParser

class image_variant:
    def __init__(self,name,default_ifs,profiles,image_tars,image_config):
        self.name = name
        self.default_ifs = default_ifs
        self.profiles = profiles
        self.image_tars = image_tars
        self.image_config = image_config

def main(argv):

    # --------------------------
    # Set PYTHON_PATH to include qnxcar2 modules
    # --------------------------
    srcroot = os.path.realpath(os.path.dirname(__file__))
    qnxcarPath = os.path.realpath(os.path.join(srcroot, "..", "pymodules"))
    os.putenv('PYTHONPATH', qnxcarPath)

    # --------------------------
    # handle command-line options
    # --------------------------
    opt = OptionParser()
    opt.description = __doc__
    opt.set_usage("usage: %prog [options] [platform].[variant] -o output-path")

    opt.add_option("-v", "--verbose",
            action='count', dest='verbosity',
            help="increase verbosity")

    opt.add_option("-f", "--force",
            action='store_true', dest='force', default=False,
            help="Force overwriting existing tar files")

    opt.add_option("-q", "--quiet",
            action='store_true', dest='quiet', default=False,
            help="prevent output")

    opt.add_option("-G", "--no-gen", "--no-generation",
            action='store_true', dest='no_gen', default=False,
            help="Only run mktar and imaging components")

    opt.add_option("--no-gen-ifs",
            action='store_true', dest='no_gen_ifs', default=False,
            help="")

    opt.add_option("--no-gen-osversion",
            action='store_true', dest='no_gen_osversion', default=False,
            help="")

    opt.add_option("--no-mktar",
            action='store_true', dest='no_mktar', default=False,
            help="")

    opt.add_option("--no-mkimage",
            action='store_true', dest='no_mkimage', default=False,
            help="")

    opt.add_option("--image-config-path",
            action='store', type="string", dest='image_config_path',
            help="specify the path of config files for mkimage")

    opt.add_option("-c", "--mksysimage-config-file",
            action='store', type="string", dest='mksysimage_config_file',
            help="specify the config file for mksysimage")

    opt.add_option("-g", "--osversion-content",
            action='store', type="string", dest='osversion_content',
            help="specify additional content for the os.version file")

    opt.add_option("-k", "--mkimage-options",
            action='store', type="string", dest='mkimage_options',
            help="mkimage.py options (see mkimage.py --help)")

    opt.add_option("-m", "--mktar-options",
            action='store', type="string", dest='mktar_options',
            help="mktar.py options (see mktar.py --help)")

    opt.add_option("-o", "--output-path",
            action='store', type="string", dest='output_path',
            help="write image and tar files to the specified path (if -t option is used, tar files are written to the path that is specified by -t option)")

    opt.add_option("-p", "--keep-partition-images",
            action='store_true', dest='keepPartitionImages', default=False,
            help="keep the partition images")

    opt.add_option("-t", "--tar-file-path",
            action='store', type="string", dest='tar_file_path',
            help="write/read tar files to/from the specified path")

    opt.add_option("-w", "--workspace",
            action='store', type="string", dest='qnx_car2_workspace',
            help="Specify the path to the QNX CAR2 workspace")

    opt.add_option("--gen-ifs-options",
            action='store', type="string", dest='gen_ifs_options',
            help="gen-ifs.py options (see gen-ifs.py --help)")

    opt.set_defaults(verbosity=0)
    opt.set_defaults(mktar_options="")
    opt.set_defaults(mkimage_options="")
    opt.set_defaults(mksysimage_config_file="")
    opt.set_defaults(tar_file_path="")
    opt.set_defaults(image_config_path="")
    opt.set_defaults(osversion_content="")
    opt.set_defaults(gen_ifs_options="")
    opt.set_defaults(qnx_car2_workspace=os.environ.get('QNX_CAR2_WORKSPACE', os.path.realpath(os.path.join(srcroot,"..", ".."))))

    (options, args) = opt.parse_args(args=argv[1:], values=None)

    if len(args) != 1:
        opt.error("Got unexpected argument(s)")
    if not options.no_mkimage and not options.output_path:
        opt.error("No output path specified")
    if not options.no_mktar and not options.tar_file_path and not options.output_path:
        opt.error("No output path specified")
    if not os.path.isdir(options.output_path):
	opt.error("Output path does not exist or is not a directory")

    board = args[0]
    (platform, variant) = board.split('.')

    if options.no_gen:
        options.no_gen_ifs = True
        options.no_gen_osversion = True


    # --------------------------
    # Set Paths
    # --------------------------
    os.environ['QNX_CAR2_WORKSPACE'] = options.qnx_car2_workspace
    TARGET_DIR = options.qnx_car2_workspace
    BOARDS_DIR = os.path.join(TARGET_DIR, "boards")
    IFS_DIR    = os.path.join(BOARDS_DIR, platform, "ifs")
    PPS_INFO = os.path.join(TARGET_DIR, "var", "pps", "qnxcar", "system", "info")
    OS_VERSION = os.path.join(TARGET_DIR,"etc","os.version")
    QNX_PYTHON_PATH = os.environ.get('QNX_PYTHON_PATH','')
    if QNX_PYTHON_PATH == '':
	raise RuntimeError("[error]: QNX_PYTHON_PATH is not set")
    QNX_PYTHON = os.path.join(QNX_PYTHON_PATH,"python")

    if not options.image_config_path:
        CONFIGS_DIR =  os.path.join(BOARDS_DIR,platform,"sd-boot","config")
    else:
        CONFIGS_DIR = options.image_config_path

    if options.verbosity > 1:
        print >> sys.stderr, ("[debug]: Target Path:     [%s]" % TARGET_DIR)
        print >> sys.stderr, ("[debug]: Boards Path:     [%s]" % BOARDS_DIR)
        print >> sys.stderr, ("[debug]: PPS Info Path:   [%s]" % PPS_INFO)
        print >> sys.stderr, ("[debug]: OS Version Path: [%s]" % OS_VERSION)


    # --------------------------
    # Read config file
    # --------------------------
    if not options.mksysimage_config_file:
        options.mksysimage_config_file = os.path.join(CONFIGS_DIR,platform + "-mksysimage.cfg")

    # open and read the config file
    config = ConfigParser.RawConfigParser()
    configfile = open(options.mksysimage_config_file, 'r')
    config.readfp(configfile)
    configfile.close

    # extract the content from config file
    imageVariants = []
    sections = config.sections()
    for section in sections:
        default_ifs = config.get(section, "default-ifs")
        profiles = config.get(section, "profiles").split(',')
        image_tars = config.get(section, "image-tars")
        image_config = config.get(section, "image-config")
        image_var = image_variant(section, default_ifs, profiles, image_tars, image_config)
        imageVariants.append(image_var)


    # --------------------------
    # Append Options
    # --------------------------

    # Default tar folder
    if not options.tar_file_path:
        options.tar_file_path = options.output_path

    options.mkimage_options += " -t " + options.tar_file_path

    # Append verbosity to each utility
    if options.verbosity > 0:
        options.mktar_options += " -" + "v" * options.verbosity
        options.mkimage_options += " -" + "v" * options.verbosity
    	options.gen_ifs_options += " -" + "v" * options.verbosity

    # --------------------------
    # Generate an image for each image Variant
    # --------------------------
    for imageVariant in imageVariants:

        # --------------------------
        # OS.VERSION GENERATION
        # --------------------------
        if not options.no_gen_osversion:
            if not options.quiet:
                print "[info]: Generating os.version file..."

            osversionScriptPath = os.path.join(srcroot, "gen-osversion.py")
            osversionCommand = QNX_PYTHON
            osversionCommand += " " + osversionScriptPath + " -v "
            if options.osversion_content:
                osversionCommand += " -p \"%s\" " % (options.osversion_content)
            osversionCommand += board
    
            if options.verbosity > 1:
                print >> sys.stderr, ("[debug]: Calling os.version generation with: [%s]" % osversionCommand)
    
            returnCode = os.system(osversionCommand)
            if returnCode != 0:
                raise RuntimeError("[error]: Running [%s]" % osversionCommand)
    
    
            # --------------------------
            # Populate the system/info PPS object
            # --------------------------
            if not options.quiet:
                print "[info]: Generating qnxcar/system/info PPS file..."
            osVersionFileHandle = open(OS_VERSION, 'rb')
            ppsInfoFileHandle = open(PPS_INFO, 'wb')
    
            ppsInfoFileHandle.write("@info\n")
            for line in osVersionFileHandle:
                if "#" in line:
                    continue
                if line.strip() == "":
                    continue
                line = re.sub(r":\s*", "::", line, count=1)
                ppsInfoFileHandle.write(line)

            ppsInfoFileHandle.close()
            osVersionFileHandle.close()


        # --------------------------
        # IFS GENERATION
        # --------------------------
        if not options.no_gen_ifs:

            if not options.quiet:
                print "[info]: Generating IFS [%s]..." % imageVariant.default_ifs

            gen_ifsPath = os.path.join(srcroot, "gen-ifs.py")
            ifs_config = os.path.join(IFS_DIR, platform + "-ifs.cfg")

            gen_ifsCommand = QNX_PYTHON
            gen_ifsCommand += " " + gen_ifsPath
            gen_ifsCommand += " -c " +  ifs_config
            gen_ifsCommand += " -d " +  imageVariant.default_ifs
            gen_ifsCommand += " --output-path " + IFS_DIR
            gen_ifsCommand += " " +options.gen_ifs_options
            gen_ifsCommand += " " +  platform

            os.chdir(IFS_DIR)
            returnCode = os.system(gen_ifsCommand)

            if options.verbosity > 1:
                print >> sys.stderr, ("[debug]: Calling gen-ifs.py with: [%s]" % gen_ifsCommand)
                print >> sys.stderr, ("[debug]: CWD: [%s]" % os.getcwd())

            if returnCode != 0:
                raise RuntimeError("[error]: Running gen-ifs.py with [%s] with default-ifs [%s]" % (gen_ifsCommand, imageVariant.default_ifs) )


        # --------------------------
        # RUN MKTAR
        # --------------------------
        if not options.no_mktar:

            if not options.quiet:
                print "[info]: Generating Archive..."

            mktarScriptPath = os.path.join(srcroot, "mktar.py")

            for profile in imageVariant.profiles:
                (name ,ext) = profile.split('.')
                tarfile = os.path.join(options.tar_file_path, platform + "-" + name + ".tar")
                if options.verbosity > 0:
                    print >> sys.stderr, ("[debug]: Profile: [%s]" % profile)
                    print >> sys.stderr, ("[debug]: Tarfile to generate: [%s]" % tarfile)



                if not os.path.exists(tarfile) or options.force == True:
                    mktarScriptCommand = QNX_PYTHON
                    mktarScriptCommand += " " + mktarScriptPath
                    mktarScriptCommand += " -o " + tarfile
                    mktarScriptCommand += " --profile=" + profile
                    mktarScriptCommand += " " + board
                    mktarScriptCommand += " " + options.mktar_options

                    if options.verbosity > 1:
                        print >> sys.stderr, ("[debug]: Calling mktar.py with: [%s]" % mktarScriptCommand)
                        print >> sys.stderr, ("[debug]: CWD: [%s]" % os.getcwd())

                    returnCode = os.system(mktarScriptCommand)
                    if returnCode != 0:
                        raise RuntimeError("[error]: Running [%s]" % mktarScriptCommand)
                else:
                    print >> sys.stdout, "[warning]: Tar file already exists. (Use --force to force overwriting): [%s]." % tarfile


        # --------------------------
        # RUN MKIMAGE
        # --------------------------
        if not options.no_mkimage:

            if not options.quiet:
                print "[info]: Generating Image..."

            mkimageScriptPath = os.path.join(srcroot, "mkimage.py")
            output_file = platform + "-" + imageVariant.name + ".img"
            if not os.path.exists(os.path.join(CONFIGS_DIR, imageVariant.image_config)):
                print >> sys.stdout, ("[error]: Missing cofig file - %s, skipped image [%s]" % (imageVariant.image_config,output_file))
                sys.exit(1)

            mkimageScriptCommand = QNX_PYTHON
            mkimageScriptCommand += " " + mkimageScriptPath
            mkimageScriptCommand += " " + options.mkimage_options
            mkimageScriptCommand += " -c " + os.path.join(CONFIGS_DIR, imageVariant.image_config)
            mkimageScriptCommand += " -o " + os.path.join(options.output_path, output_file)
            mkimageScriptCommand += " --tars " + imageVariant.image_tars
            if options.verbosity > 1:
                print >> sys.stderr, ("[debug]: Calling mksysimage.py with: [%s]" % mkimageScriptCommand )
                print >> sys.stderr, ("[debug]: CWD: [%s]" % os.getcwd())

	    if options.keepPartitionImages:
		partitionOutputDirectory = os.path.join(options.output_path, "partitions", platform + "-" + imageVariant.name)
		mkimageScriptCommand += " -p " + partitionOutputDirectory

            returnCode = os.system(mkimageScriptCommand)
            if returnCode != 0:
                raise RuntimeError("[error]: Running [%s]" % mkimageScriptCommand)


if __name__ == '__main__':
    import sys
    sys.stdout = os.fdopen(sys.stdout.fileno(), 'w', 0)
    sys.exit(main(sys.argv) or 0)
