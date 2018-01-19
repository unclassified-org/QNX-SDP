#ifndef _NW_TLS_H_INCLUDED
#include <sys/neutrino.h>

#if _NTO_VERSION >= 640
#define NW_TLS_TID __tid
#define NW_TLS_STACKADDR __stackaddr
#define NW_TLS_OWNER __owner
#else
#define NW_TLS_TID tid
#define NW_TLS_STACKADDR stackaddr
#define NW_TLS_OWNER owner
#endif
#endif /* !_NW_TLS_H_INCLUDED */

#if defined(__QNXNTO__) && defined(__USESRCVERSION)
#include <sys/srcversion.h>
__SRCVERSION("$URL: http://svn/product/branches/6.6.0/trunk/lib/io-pkt/sys/nw_tls.h $ $Rev: 680336 $")
#endif
