/*
 * $QNXLicenseC:
 * Copyright 2013, QNX Software Systems. All Rights Reserved.
 *
 * You must obtain a written license from and pay applicable license fees to QNX
 * Software Systems before you may reproduce, modify or distribute this software,
 * or any work that includes all or part of this software.   Free development
 * licenses are available for evaluation and non-commercial purposes.  For more
 * information visit http://licensing.qnx.com or email licensing@qnx.com.
 *
 * This file may contain contributions from others.  Please review this entire
 * file for other proprietary rights or license notices, as well as the QNX
 * Development Suite License Guide at http://licensing.qnx.com/license-guide/
 * for other information.
 * $
 */

#ifndef __MM_BROWSE_BROWSE_H_INCLUDED
#define __MM_BROWSE_BROWSE_H_INCLUDED

/* mm-browse - Browse media mountpoints
 */

#include <stdint.h>
#include <sys/strm.h>

typedef struct mmbrowse_hdl mmbrowse_hdl_t;		/* Browse session handle */
typedef struct mmbrowse_list_hdl mmbrowse_list_hdl_t;	/* List handle */
typedef struct mmbrowse_entry_hdl mmbrowse_entry_hdl_t;	/* Entry handle */

#define MMBROWSE_ENTRY_FLAG_LIST        (1<<0) /* entry is a list that can be entered */
#define MMBROWSE_ENTRY_FLAG_UNRESOLVED  (1<<1) /* "name" represents an item that is unresolved and probably not playable */
#define MMBROWSE_ENTRY_FLAG_NONUTF8     (1<<2) /* "name" is not in utf-8; look for a "name_encoding" metadata item */
#define MMBROWSE_ENTRY_FLAG_HASMETADATA (1<<3) /* entry has metadata */

typedef struct mmbrowse_entry_s {
	const mmbrowse_entry_hdl_t *handle;	/* an entry handle; unique to the list */
	uint32_t                    flags;	/* MMBROWSE_ENTRY_FLAG_* flags */
	uint32_t                    index;	/* offset into the current view of the list */
	const char                 *name;	/* name of the entry */
	const strm_dict_t          *metadata;	/* metadata dictionary; may be NULL */
} mmbrowse_entry_t;

#define MMBROWSE_LISTJUMP_ROOT	"/"


__BEGIN_DECLS

/* Initialize mm-browse library.
 *
 * config - path to configuration file; must not be NULL.
 * returns 0 on success, -1 on failure
 */
int mmbrowse_init(const char *config);

/* Start a browse session on a given mountpoint.
 *
 * When starting a browse sesion on a mountpoint mm-browse will give all
 * browsable plug-ins an opportunity to rate their ability to browse the
 * media.  After obtaining an mmbrowse handle most interaction using this
 * handle will be directed to the winning plug-in.
 *
 * A client will typically start jump to "/" using mmbrowse_list_jump()
 * after starting a browse session, unless browsing to a previously
 * known location or initiating a search using mmbrowse_search()..
 *
 * mountpoint - url for mountpoint
 * options - string dictionary of options for this browse session
 * returns mmbrowse_hdl_t pointer on success, NULL on failure.
 */
mmbrowse_hdl_t *mmbrowse_start(const char *mountpoint, const strm_dict_t *options);

/* End a browse session.
 *
 * bhdl - browse session handle from mmbrowse_start()
 */
void mmbrowse_end(mmbrowse_hdl_t *bhdl);

/* Jump to a specific list path in a browse session.
 *
 * It is always valid to jump to the listpath "/"; otherwise, the path
 * returned via mmbrowse_list_pathget() should be used to return to
 * a previous browse list.
 *
 * Note: A successful call into mmbrowse_list_jump() invalidates the
 *       browse session's previous list handles.
 * bhdl - browse session handle
 * listpath - path to the list being jumped to
 * returns mmbrowse_list_hdl_t pointer on success, NULL on failure.
 */
mmbrowse_list_hdl_t *mmbrowse_list_jump(mmbrowse_hdl_t *bhdl, const char *listpath);

/* Get the list's path to be used in mmbrowse_list_jump().
 *
 * lhdl - current list handle
 * returns pointer to list path string, valid as long as lhdl.
 */
const char *mmbrowse_list_pathget(mmbrowse_list_hdl_t *lhdl);

/* Enter a list entry by name.
 *
 * Note: A successful call into mmbrowse_list_enter() invalidates the
 *       current list handle.
 * lhdl - current list handle
 * name - name of the entry to enter
 * returns mmbrowse_list_hdl_t pointer on success, NULL on failure.
 */
mmbrowse_list_hdl_t *mmbrowse_list_enter_name(mmbrowse_list_hdl_t *lhdl, const char *name);

/* Enter a list entry by handle.
 *
 * Note: A successful call into mmbrowse_list_enter() invalidates the
 *       current list handle.
 * lhdl - current list handle
 * ehdl - handle of the entry to enter
 * returns mmbrowse_list_hdl_t pointer on success, NULL on failure.
 */
mmbrowse_list_hdl_t *mmbrowse_list_enter_handle(mmbrowse_list_hdl_t *lhdl, const mmbrowse_entry_hdl_t *ehdl);

/* Return to a list's parent list.
 *
 * Note: A successful call into mmbrowse_list_return() invalidates the
 *       current list handle.
 * lhdl - current list handle
 * returns mmbrowse_list_hdl_t pointer on success, NULL on failure.
 */
mmbrowse_list_hdl_t *mmbrowse_list_return(mmbrowse_list_hdl_t *lhdl);

/* Search a browse session.
 *
 * Note: A successful call into mmbrowse_search() invalidates the
 *       browse session's previous list handles.
 * bhdl - browse session handle
 * search_string - the search string
 * search_options - search options
 * returns mmbrowse_list_hdl_t pointer on success, NULL on failure.
 */
mmbrowse_list_hdl_t *mmbrowse_search(mmbrowse_hdl_t *bhdl, const char *search_string, const strm_dict_t *search_options);

/* Get entries from the current list.
 *
 * Note: The name and metadata pointers returned in the entry structures
 *       are only required to be valid until the next call to
 *       mmbrowse_list_entries_get(), or until the list is invalidated.
 *       Some plug-ins may keep these pointers valid for longer durations.
 *
 *	 If the function returns -1 because it is canceled by mmbrowse_list_cancel(),
 *	 the lhdl becomes invalid, the user has to call mmbrowse_list_jump() to obtain a new list handle.
 *
 * lhdl - current list handle
 * offset - 0-based offset from which to get entries
 * entries - pointer to memory to store entry structures
 * entries_cnt - the number of entry structures that can be safely
 *               stored in entries; may be 0.
 * returns the number of entries available from the given offset,
 *         or the number of entries returned if fewer.
 * returns 0 if offset is at the end of the list
 * returns -1 on error
 *         if entries_cnt is too big errno number will be E2BIG
 *         if browse is cancelled with mmbrowse_list_cancel() errno will be ECANCELED
 */
int mmbrowse_list_entries_get(mmbrowse_list_hdl_t *lhdl, uint32_t offset, mmbrowse_entry_t *entries, unsigned entries_cnt);

/* Get the number of entries in the current list.
 *
 * lhdl - current list handle
 * returns the number of entries in the current list, -1 on error
 */
int mmbrowse_list_nitems(mmbrowse_list_hdl_t *lhdl);

/* Cancel the current operation of getting entries from a list.
 *
 * lhdl - current list handle
 * returns 0 for success
 * returns -1 on error
 *
 * It is safe to call this function from a different thread without protecting lhdl.
 */
int mmbrowse_list_cancel(mmbrowse_list_hdl_t *lhdl);

/* Options:
 *
 * mm-browse supports session options.  These options are generally
 * passed to browse plug-ins and interpreted by the plug-ins.  As
 * such there is no specifically defined list of options available.
 *
 * First-party plug-ins will attempt to use consistent names and
 * interpretations of common browse options.  This list shall be
 * found in this comment block.
 *
 * Possible keys and values:
 *   sort_order    : natural, alpha, revalpha
 *   filter        : none, inclusive, exclusive
 *   filter_type   : pattern, regex
 *   filter_string : used if filter and filter_type are set
 *   metadata      : comma-separated list of requested metadata items
 *   charconv      : always, never
 *   entry_lifetime: call, list, session
 *   unknown_option: silent, failset, failsession
 */

/* Set an option on a browse session.
 *
 * Note: A successful call to mmbrowse_option_set() invalidates a
 *       previously returned options dictionary from mmbrowse_option_get().
 * hdl - browse session handle
 * okey - option key
 * oval - option value; NULL to clear
 * returns 0 on success, -1 on error
 */
int mmbrowse_option_set(mmbrowse_hdl_t *hdl, const char *okey, const char *oval);

/* Get browse session options.
 *
 * hdl - browse session handle
 * returns strm_dict_t pointer of current session options.
 */
const strm_dict_t *mmbrowse_options_get(mmbrowse_hdl_t *hdl);


__END_DECLS


#endif

#if defined(__QNXNTO__) && defined(__USESRCVERSION)
#include <sys/srcversion.h>
__SRCVERSION("$URL: http://svn/product/branches/6.6.0/trunk/lib/mm-browse/core/public/mm/browse/browse.h $ $Rev: 723444 $")
#endif
