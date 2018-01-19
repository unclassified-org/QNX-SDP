/*
 * $QNXLicenseC: $
 */
#ifndef _FS_RCFS_H_
#define _FS_RCFS_H_

#ifndef __PLATFORM_H_INCLUDED
#include <sys/platform.h>
#endif
#include <sys/types.h>

/*  Read-only Compressed File System

	0            4KiB          Inode Offset  Name Offset  Data Offset
    | Hash Block | Super Block | Inode Table | Name Table | Data Streams ...

    The hash block consists of a fixed size block that holds hash and
    signature information of the file system.

    The super block holds information that describes the remaining volume
    information such as the identification means, start of important information
    such as inodes, name table, data, size of the volume.

    The inode table consists of a linear array of inodes of fixed size.

    There is a unidirectional one-to-one association between each inode
    and that name of that inode.  Each inode describes an offset to the name
    that is associated with that same inode.

    Each inode provides a length and offset to the start of the data stream
    of that inode.

	Directory support is accomplished by pointing an inode's data offset back
	into the inode table.  The data and size fields then describe a range
	of inodes that belong to that directory.

	Data streams for uncompressed data are raw, the entire extent of the file
	exists where the inode's data offset points and for the given size.

	Compressed streams have a header at the start of each data stream.  This
	header is composed of an array of 32-bit values.  One entry for each
	compression buffer size of the file plus one additional entry at the end
	that represents the total size of the file.

	Each value in the array represents a physical offset within the data
	stream where a compression block starts.  Data at this address can be
	decompressed into a full compression block buffer.  Only the last block
	of the file will have a partial compression block and the length of that
	block can be determined by looking at the subsequent entry in the array.

	Random reads of file data can be accomplished by using the address to
	index into the array.  The super block holds the size of each compression
	block: address DIV compression block size provides the index into the
	array and the value at that index describes where the related compression
	block is found.

	Symbolic links are achieved by simply treating the file data as the link
	path for that file and are never compressed.


	Write Support

	Write support is extremely limited and intended only for minor changes to
	the file system during test and development efforts.

	Write support is accomplished by appending data to the end of the
	formatted volume.  This reqruires there is physical space available in the
	media, between the end of the volume and the media end.

	To prepare for write ability the file system extends the volume with a
	second inode table at the end of the volume.  This inode table holds larger
	inodes than the primary volume.  These are organized such that the lower
	bytes of each entry is the same as those in the primary, but are larger
	to accomodate parent information.

	Names are allocated and stored for each inode on an as needed basis
	generally placed immediately prior to the inode data stream.

	Data written into the extended volume is *not* compressed.
*/


/*  Compile time configuration items - these are candidates for command
	line options.
*/
#define RCFS_DATA_READ_AHEAD        ((128) * 1024)
#define RCFS_META_READ_AHEAD        ((16) * 1024)


/*  Limits imposed by the file system and returned by various pathconf()
*/
#define RCFS_NAME_MAX        510
#define RCFS_DIR_LINK_MAX    USHRT_MAX
#define RCFS_SYMLINK_MAX     RCFS_NAME_MAX
#define RCFS_LINK_MAX        (1)
#define RCFS_PATH_MAX        1024
#define RCFS_MAX_FSIZE       UINT_MAX
#define RCFS_BLOCK_SIZE      (4096)
#define RCFS_VOLUME_MAX      (UINT32_MAX & ~RCFS_BLOCK_SIZE)


/*  Size used to complete meta-data reads
*/
#define RCFS_META_SIZE       (4096)

/*  The hash block is always at offset zero and the superblock at address 4KiB
*/
#define RCFS_HASH_ADDR       (0)
#define RCFS_SUPER_ADDR      (4096)
#define RCFS_INODE_START     (8192)
#define RCFS_DATA_ALIGNMENT  (4)

#define RCFS_INODE_SIZE      (32)
#define RCFS_INODE_ROOT      (1)
#define RCFS_INODE_INVALID   (0xFFFFFFFFU)
#define RCFS_ADDR_INVALID    (0xFFFFFFFFU)

#define RCFS_ENODE_SIZE      (64)

/*  Minimum size of an RCFS volume has a size to hold one file, one name of
	one character in length, and a file length of zero.  This is used to assist
	in validation of the superblock size.
*/
#define RCFS_MIN_VOLUME_SIZE (RCFS_INODE_START + RCFS_INODE_SIZE + 1)

/*  The compression buffer length is limited to one of the following values
*/
#define RCFS_MIN_CBUFLEN     (1)
#define RCFS_MAX_CBUFLEN     (64*1024U)


/*  Inode numbering is included here for consistency between the file system
	and the utility.

	Numbering is one based to prevent exposing a zero inode number to
	applications which may consider zero as invalid.

	The inodes a simply numbered as an count from 1 to the super blocks
	count of inodes.
*/
#define RCFS_INODE_ADDR_TO_NUM(inode_addr, inode_start)   \
	(1 + (((inode_addr) - (inode_start)) / RCFS_INODE_SIZE))

#define RCFS_INODE_NUM_TO_ADDR(inode_num, inode_start)   \
	((((inode_num) - 1) * RCFS_INODE_SIZE)+ (inode_start))

#define RCFS_ENODE_ADDR_TO_NUM(inode_addr, inode_start)   \
	(1 + (((inode_addr) - (inode_start)) / RCFS_ENODE_SIZE))

#define RCFS_ENODE_NUM_TO_ADDR(inode_num, inode_start)   \
	((((inode_num) - 1) * RCFS_ENODE_SIZE)+ (inode_start))


/*  Index tables map a logical offset in the file system to a physical offset
	in the media.  Each entry is 4 bytes in size and the subsequent entry is
	used to determine the size of the extent.  (Two indices are used to
	determine the starting offset and the length of that extent)
*/
struct _rcfs_index_s {
	uint32_t	offset;
};

#define RCFS_INDEX_ENTRY_SIZE		(sizeof (struct _rcfs_index_s))
#define RCFS_INDEX_EXTENT_SIZE		(2*RCFS_INDEX_ENTRY_SIZE)


/*  Inode flags can be retrieved or assigned with the following macros.
*/
#define RCFS_IFLAG_GET_PERCENT(n)     (( (n) >>  0) & 0x7f)
#define RCFS_IFLAG_SET_PERCENT(n, v)  ((n) = ((n)&0xff80) | (((v)&0x007f) << 0))
#define RCFS_IFLAG_GET_CTYPE(n)       (( (n) >>  7) & 0x03)
#define RCFS_IFLAG_SET_CTYPE(n, v)    ((n) = ((n)&0xfc7f) | (((v)&0x0003) << 7))

/*  The CTYPE (Compression Type) employed by an inode is recorded in the flags
	and accessed with the IFLAG get/set macros.
*/
typedef enum _rcfs_ctype_e {
	RCFS_CTYPE_NONE = 0,
	RCFS_CTYPE_LZO,                     /* Lempel-Ziv-Oberhumer 1x compression */
	RCFS_CTYPE_UCL,                     /* Oberhumer's UCL NRV2b decompressor */
	RCFS_CTYPE_COUNT,
} rcfs_ctype_t;


/*  UUID and plain string identification for the RCFS
*/
#define RCFS_UUID "\x61\x62\xf1\xeb\xcd\x96\x4d\xcd\xf5\x0b\x97\xa1\x1b\x3d\xe5\x64"
#define RCFS_SIGNATURE "r-c-f-s"



typedef struct _rcfs_super_s rcfs_super_t;
typedef struct _rcfs_inode_s rcfs_inode_t;
typedef struct _rcfs_einfo_s rcfs_einfo_t;
typedef struct _rcfs_enode_s rcfs_enode_t;
typedef struct _rcfs_index_s rcfs_index_t;

/*  RCFS Signature Block
*/
struct _rcfs_sig_block_s {

	uint32_t begoff;            /* Start byte offset (inclusive) to hash */
	uint32_t endoff;            /* Last byte offset (exclusive) of the hash */
	uint8_t  hash[3][64];       /* Three 512-bit hash of the range described */
	uint8_t  bwrap[3][128];     /* Three 1024-bit signature blocks */
	uint8_t  zero[3512];
};
typedef char __size_check_sig_block[ (sizeof(struct _rcfs_sig_block_s) == RCFS_META_SIZE) ? 1 : -1 ];


/*  RCFS Super Block
*/
struct _rcfs_super_s {

	uint8_t  uuid[16];          /* 000 RCFS UUID (Identifies RCSF format (GPT)) */
	uint8_t  fuuid[16];         /* 010 Format UUID (changed at every format) */
	uint8_t  signature[8];      /* 020 Fixed "r-c-f-s" identifyer */
	uint16_t version;           /* 028 Updated to accomodate media format changes */
	uint16_t flags;             /* 02a Endian order, capabilites, ... */
	uint32_t ftime;             /* 02c Time of format in seconds time() */

	uint32_t size;              /* 030 Size of the volume in bytes */
	uint32_t ninodes;           /* 034 Number of inodes in volume */
	uint32_t inode_off;         /* 038 Offset of the inode table */
	uint32_t inode_len;         /* 03c Size of the inode table in bytes */

	uint32_t fname_off;         /* 040 Offset of name table from volume start */
	uint32_t fname_len;         /* 044 Size of the name table in bytes */
	uint32_t data_off;          /* 048 Offset of data extents from volume start */
	uint32_t data_len;          /* 04c Size of the data region in bytes */

	uint32_t cbuflen;           /* 050 Size of compression blocks in bytes */

	uint32_t reserved[35];      /* 054 Reserved for future use */

	uint8_t  label[32];         /* 0e0 Plain text volume descriptor (label) */

	/*  The following extended volume fields are zero on initial creation
		and shall be non-zero if any data has become intentionally modified
		in a development environment.  The label is used to improve a visual
		recognition of the changed volume.
	*/

	uint8_t  ext_label[16];     /* 100 non-zero string describing extended region */
	uint32_t ext_size;          /* 110 New size of the entire volume */
	uint32_t ext_flags;         /* 114 State flags for the extended volume */
	uint32_t ext_inode_off;     /* 118 Starting offset of the inode table */
	uint32_t ext_inode_len;     /* 11c Size in bytes of the inode table */
	uint32_t ext_data_off;      /* 120 Extended volume size */
	uint32_t ext_data_len;      /* 124 Size of the extended data area */

	uint32_t ext_next_inode;    /* 128 Next inode relative to inode_off */
	uint32_t ext_next_data;     /* 12c Next data address relative to data_off */

	uint8_t  zero[RCFS_META_SIZE - 0x130];
};
typedef char __size_check_super_block[ (sizeof(struct _rcfs_super_s) == RCFS_META_SIZE) ? 1 : -1 ];


/*  RCFS inode
*/
struct _rcfs_inode_s {
	uint8_t  type;          /* 00  Zero for inodes */
	uint8_t  reserved;      /* 01  Reserved for future use */
	uint16_t nhash;         /* 02  Folded 32-bit elf hash of the associated name */
	uint16_t mode;          /* 04  POSIX file mode bits */
	uint16_t flags;         /* 06  inode flags */
	uint32_t fname;         /* 08  Offset in volume to the UTF-8 name */
	uint32_t data;          /* 0C  Offset to file index table and data stream */
	uint32_t size;          /* 10  Size of the file in bytes */
	uint32_t mtime;         /* 14  File creation time */
	uint32_t uid;           /* 18  POSIX User ID */
	uint32_t gid;           /* 1C  POSIX Group ID */
};
typedef char __size_check_inode[ (sizeof(struct _rcfs_inode_s) == RCFS_INODE_SIZE) ? 1 : -1 ];


/*  Extended volume flags.  Anything other than the DISABLED value indicates
	the extension has been enabled.  The ENABLE flag provides the explicit
	check for the volume extension and must always be set.
*/
#define RCFS_EXT_FLAG_DISABLED 0x00000000
#define RCFS_EXT_FLAG_ENABLE   0x80000000

/*  Extended volume limitations (note these are a bit arbitrary)
*/
#define RCFS_EXT_INODE_MIN        64
#define RCFS_EXT_INODE_DEFAULT    1024
#define RCFS_EXT_INODE_MAX        8192


/*  Minimum size is that required to hold the minimum inode count, names for
	each, and a data area with a minimal sized file (1KiB)
*/
#define RCFS_EXT_MIN_SIZE             \
	( (RCFS_EXT_INODE_MIN * 64)      \
	  + (RCFS_EXT_INODE_MIN * 64)    \
	  + (RCFS_EXT_INODE_MIN * 1024)  \
	  + (RCFS_META_SIZE * 2) )


/*  This is the standard inode type used for all inodes located in the original
	inode table created by the mkrcfs tool.
*/
#define RCFS_INODE_TYPE_STD    0x00

/*  Indicates the inode has been deleted or replaced in the extended region since
	production of the initial volume.  All other feilds are to be ignored,
	however all other fields are preserved in their original state.
*/
#define RCFS_INODE_TYPE_DEL    0x80

/*  This type is used in the extended region for all inodes.  It basically
	defines a tuple that emcompasses extended information and the standard
	inode information.
*/
#define RCFS_INODE_TYPE_EXT    0x81


/*  Value used for memsets in the extended volume t o improve identification
	of uninitialized data
*/
#define RCFS_INVALID_BYTE      (0x8F)


struct _rcfs_einfo_s {
	uint32_t parent;        /* 00  Offset of the parent of this inode */
	uint32_t spares[7];     /* 04  Reserved for alignment and expansion */
};
typedef char __size_check_einfo[ (sizeof(struct _rcfs_einfo_s) == RCFS_INODE_SIZE) ? 1 : -1 ];

struct _rcfs_enode_s {
	rcfs_inode_t  inode;    /* 00  Inode of this file */
	rcfs_einfo_t  info;     /* 20  Extended inode information */
};
typedef char __size_check_enode[ (sizeof(struct _rcfs_enode_s) == RCFS_ENODE_SIZE) ? 1 : -1 ];



#endif

#if defined(__QNXNTO__) && defined(__USESRCVERSION)
#include <sys/srcversion.h>
__SRCVERSION("$URL: http://svn/product/branches/6.6.0/trunk/services/blk/fs/rcfs/public/sys/fs_rcfs.h $ $Rev: 733094 $")
#endif
