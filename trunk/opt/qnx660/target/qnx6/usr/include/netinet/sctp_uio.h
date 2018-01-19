/*	$KAME: sctp_uio.h,v 1.9 2003/11/25 06:40:54 ono Exp $	*/

#ifndef _NETINET_SCTP_UIO_H_INCLUDED
#define _NETINET_SCTP_UIO_H_INCLUDED

/*
 * Copyright (c) 2001, 2002, 2003, 2004 Cisco Systems, Inc.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 * 1. Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 * 3. All advertising materials mentioning features or use of this software
 *    must display the following acknowledgement:
 *      This product includes software developed by Cisco Systems, Inc.
 * 4. Neither the name of the project nor the names of its contributors
 *    may be used to endorse or promote products derived from this software
 *    without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY CISCO SYSTEMS AND CONTRIBUTORS ``AS IS'' AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED.  IN NO EVENT SHALL CISCO SYSTEMS OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS
 * OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
 * LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY
 * OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF
 * SUCH DAMAGE.
 */

#ifndef __TYPES_H_INCLUDED
#include <sys/types.h>
#endif

#ifndef __SOCKET_H_INCLUDED
#include <sys/socket.h>
#endif

#ifndef _INTTYPES_H_INCLUDED
#include <inttypes.h>
#endif

typedef caddr_t sctp_assoc_t;

/* On/Off setup for subscription to events */
struct sctp_event_subscribe {
	uint8_t sctp_data_io_event;
	uint8_t sctp_association_event;
	uint8_t sctp_address_event;
	uint8_t sctp_send_failure_event;
	uint8_t sctp_peer_error_event;
	uint8_t sctp_shutdown_event;
	uint8_t sctp_partial_delivery_event;
	uint8_t sctp_adaption_layer_event;
	uint8_t sctp_stream_reset_events;
};

/* ancillary data types */
#define SCTP_INIT	0x0001
#define SCTP_SNDRCV	0x0002

/*
 * ancillary data structures
 */
struct sctp_initmsg {
	uint16_t sinit_num_ostreams;
	uint16_t sinit_max_instreams;
	uint16_t sinit_max_attempts;
	uint16_t sinit_max_init_timeo;
};

struct sctp_sndrcvinfo {
	uint16_t sinfo_stream;
	uint16_t sinfo_ssn;
	uint16_t sinfo_flags;
	uint32_t sinfo_ppid;
	uint32_t sinfo_context;
	uint32_t sinfo_timetolive;
	uint32_t sinfo_tsn;
	uint32_t sinfo_cumtsn;
	sctp_assoc_t sinfo_assoc_id;
};


/* send/recv flags */
/* MSG_EOF (0x0100) is reused from sys/socket.h */
#define MSG_PR_SCTP_TTL	0x0400	/* Partial Reliable on this msg */
#define MSG_PR_SCTP_BUF	0x0800	/* Buffer based PR-SCTP */
#ifndef MSG_EOF
#define MSG_EOF 	0x1000	/* Start shutdown procedures */
#endif
#define MSG_UNORDERED 	0x2000	/* Message is un-ordered */
#define MSG_ADDR_OVER	0x4000	/* Override the primary-address */
#define MSG_ABORT	0x8000	/* Send an ABORT to peer */

/* Stat's */
struct sctp_pcbinfo {
	uint32_t ep_count;
	uint32_t asoc_count;
	uint32_t laddr_count;
	uint32_t raddr_count;
	uint32_t chk_count;
	uint32_t sockq_count;
	uint32_t mbuf_track;
};

struct sctp_sockstat {
	sctp_assoc_t ss_assoc_id;
	uint32_t ss_total_sndbuf;
	uint32_t ss_total_mbuf_sndbuf;
	uint32_t ss_total_recv_buf;
};

/*
 * notification event structures
 */


/* association change events */

struct sctp_assoc_change {
	uint16_t sac_type;
	uint16_t sac_flags;
	uint32_t sac_length;
	uint16_t sac_state;
	uint16_t sac_error;
	uint16_t sac_outbound_streams;
	uint16_t sac_inbound_streams;
	sctp_assoc_t sac_assoc_id;
};
/* sac_state values */

#define SCTP_COMM_UP		0x0001
#define SCTP_COMM_LOST		0x0002
#define SCTP_RESTART		0x0003
#define SCTP_SHUTDOWN_COMP	0x0004
#define SCTP_CANT_STR_ASSOC	0x0005


/* Address events */
struct sctp_paddr_change {
	uint16_t spc_type;
	uint16_t spc_flags;
	uint32_t spc_length;
	struct sockaddr_storage spc_aaddr;
	uint32_t spc_state;
	uint32_t spc_error;
	sctp_assoc_t spc_assoc_id;
};
/* paddr state values */
#define SCTP_ADDR_AVAILABLE	0x0001
#define SCTP_ADDR_UNREACHABLE	0x0002
#define SCTP_ADDR_REMOVED	0x0003
#define SCTP_ADDR_ADDED		0x0004
#define SCTP_ADDR_MADE_PRIM	0x0005
#define SCTP_ADDR_CONFIRMED	0x0006

/*
 * CAUTION: these are user exposed SCTP addr reachability states
 *          must be compatible with SCTP_ADDR states in sctp_constants.h
 */
#ifndef SCTP_ACTIVE
#define SCTP_ACTIVE            0x0001  /* SCTP_ADDR_REACHABLE */
#endif
#ifndef SCTP_INACTIVE
#define SCTP_INACTIVE          0x0002  /* SCTP_ADDR_NOT_REACHABLE */
#endif
#ifdef SCTP_UNCONFIRMED
#define SCTP_UNCONFIRMED       0x0200
#endif

/* remote error events */
struct sctp_remote_error {
	uint16_t sre_type;
	uint16_t sre_flags;
	uint32_t sre_length;
	uint16_t sre_error;
	sctp_assoc_t sre_assoc_id;
	uint8_t  sre_data[4];
};

/* data send failure event */
struct sctp_send_failed {
	uint16_t ssf_type;
	uint16_t ssf_flags;
	uint32_t ssf_length;
	uint32_t ssf_error;
	struct sctp_sndrcvinfo ssf_info;
	sctp_assoc_t ssf_assoc_id;
	uint8_t ssf_data[4];
};

/* flag that indicates state of data */
#define SCTP_DATA_UNSENT	0x0001	/* inqueue never on wire */
#define SCTP_DATA_SENT		0x0002	/* on wire at failure */

/* shutdown event */
struct sctp_shutdown_event {
	uint16_t	sse_type;
	uint16_t	sse_flags;
	uint32_t	sse_length;
	sctp_assoc_t	sse_assoc_id;
};

/* Adaption layer indication stuff */
struct sctp_adaption_event {
	uint16_t	sai_type;
	uint16_t	sai_flags;
	uint32_t	sai_length;
        uint32_t	sai_adaption_ind;
	sctp_assoc_t	sai_assoc_id;
};

struct sctp_setadaption {
	uint32_t	ssb_adaption_ind;
};

/* pdapi indications */
struct sctp_pdapi_event {
	uint16_t	pdapi_type;
	uint16_t	pdapi_flags;
	uint32_t	pdapi_length;
        uint32_t	pdapi_indication;
	sctp_assoc_t	pdapi_assoc_id;
};

/* pdapi indications */
#define SCTP_PARTIAL_DELIVERY_ABORTED	0x0001

/* stream reset stuff */

struct sctp_stream_reset_event {
	uint16_t	strreset_type;
	uint16_t	strreset_flags;
	uint32_t	strreset_length;
	sctp_assoc_t    strreset_assoc_id;
	uint16_t       strreset_list[0];
};

/* flags in strreset_flags filed */
#define SCTP_STRRESET_INBOUND_STR  0x0001
#define SCTP_STRRESET_OUTBOUND_STR 0x0002
#define SCTP_STRRESET_ALL_STREAMS  0x0004
#define SCTP_STRRESET_STREAM_LIST  0x0008


/* notification types */
#define SCTP_ASSOC_CHANGE		0x0001
#define SCTP_PEER_ADDR_CHANGE		0x0002
#define SCTP_REMOTE_ERROR		0x0003
#define SCTP_SEND_FAILED		0x0004
#define SCTP_SHUTDOWN_EVENT		0x0005
#define SCTP_ADAPTION_INDICATION	0x0006
#define SCTP_PARTIAL_DELIVERY_EVENT	0x0007
#define SCTP_STREAM_RESET_EVENT         0x0008


struct sctp_tlv {
	uint16_t sn_type;
	uint16_t sn_flags;
	uint32_t sn_length;
};


/* notification event */
union sctp_notification {
	struct sctp_tlv sn_header;
	struct sctp_assoc_change sn_assoc_change;
	struct sctp_paddr_change sn_paddr_change;
	struct sctp_remote_error sn_remote_error;
	struct sctp_send_failed	sn_send_failed;
	struct sctp_shutdown_event sn_shutdown_event;
	struct sctp_adaption_event sn_adaption_event;
	struct sctp_pdapi_event sn_pdapi_event;
	struct sctp_stream_reset_event sn_strreset_event;
};

/*
 * socket option structs
 */
#define SCTP_ISSUE_HB 0xffffffff	/* get a on-demand hb */
#define SCTP_NO_HB    0x0		/* turn off hb's */

struct sctp_paddrparams {
	sctp_assoc_t spp_assoc_id;
	struct sockaddr_storage spp_address;
	uint32_t spp_hbinterval;
	uint16_t spp_pathmaxrxt;
};

struct sctp_paddrinfo {
	sctp_assoc_t spinfo_assoc_id;
	struct sockaddr_storage spinfo_address;
	int32_t spinfo_state;
	uint32_t spinfo_cwnd;
	uint32_t spinfo_srtt;
	uint32_t spinfo_rto;
	uint32_t spinfo_mtu;
};

struct sctp_rtoinfo {
	sctp_assoc_t srto_assoc_id;
	uint32_t srto_initial;
	uint32_t srto_max;
	uint32_t srto_min;
};

struct sctp_assocparams {
	sctp_assoc_t sasoc_assoc_id;
	uint16_t sasoc_asocmaxrxt;
        uint16_t sasoc_number_peer_destinations;
        uint32_t sasoc_peer_rwnd;
        uint32_t sasoc_local_rwnd;
        uint32_t sasoc_cookie_life;
};

struct sctp_setprim {
	sctp_assoc_t ssp_assoc_id;
	struct sockaddr_storage ssp_addr;
};

struct sctp_setpeerprim {
	sctp_assoc_t sspp_assoc_id;
	struct sockaddr_storage sspp_addr;
};

struct sctp_getaddresses {
	sctp_assoc_t sget_assoc_id;
	/* addr is filled in for N * sockaddr_storage */
	struct sockaddr addr[1];
};

struct sctp_setstrm_timeout {
	sctp_assoc_t ssto_assoc_id;
	uint32_t ssto_timeout;
	uint32_t ssto_streamid_start;
	uint32_t ssto_streamid_end;
};

struct sctp_status {
	sctp_assoc_t sstat_assoc_id;
	int32_t sstat_state;
	uint32_t sstat_rwnd;
	uint16_t sstat_unackdata;
	uint16_t sstat_penddata;
	uint16_t sstat_instrms;
	uint16_t sstat_outstrms;
	uint32_t sstat_fragmentation_point;
	struct sctp_paddrinfo sstat_primary;
};

struct sctp_cwnd_args {
	struct sctp_nets *net;          /* network to */
	uint16_t cwnd_new_value;       /* cwnd in k */
	uint16_t inflight;             /* flightsize in k */
	int cwnd_augment;               /* increment to it */
};

struct sctp_blk_args {
	uint16_t maxmb;                /* in 1k bytes */
	uint16_t onmb;                 /* in 1k bytes */
	uint16_t maxsb;                /* in 1k bytes */
	uint16_t onsb;                 /* in 1k bytes */
	uint16_t send_sent_qcnt;       /* chnk cnt */
	uint16_t stream_qcnt;          /* chnk cnt */
};

/* Max we can reset in one setting,
 * note this is dictated not by the 
 * define but the size of a mbuf cluster
 * so don't change this define and think
 * you can specify more. You must do multiple
 * resets if you want to reset more than
 * SCTP_MAX_EXPLICIT_STR_RESET.
 */
#define SCTP_MAX_EXPLICT_STR_RESET   1000 

#define SCTP_RESET_LOCAL_RECV  0x0001
#define SCTP_RESET_LOCAL_SEND  0x0002
#define SCTP_RESET_BOTH        0x0003

struct sctp_stream_reset {
	sctp_assoc_t strrst_assoc_id;
	uint16_t    strrst_flags;
	uint16_t    strrst_num_streams;	/* 0 == ALL */
	uint16_t    strrst_list[0];		/* list if strrst_num_streams is not 0*/
};


struct sctp_get_nonce_values {
	sctp_assoc_t gn_assoc_id;
	uint32_t    gn_peers_tag;
	uint32_t    gn_local_tag;
};

/* Debugging logs */
struct sctp_str_log{
	uint32_t n_tsn;
	uint32_t e_tsn;
	uint16_t n_sseq;
	uint16_t e_sseq;
};

struct sctp_fr_log {
	uint32_t largest_tsn;
	uint32_t largest_new_tsn;
	uint32_t tsn;
};

struct sctp_fr_map {
	uint32_t base;
	uint32_t cum;
	uint32_t high;
};

struct sctp_cwnd_log{
	union {
		struct sctp_blk_args blk;
		struct sctp_cwnd_args cwnd;
		struct sctp_str_log strlog;
	} x;
	uint8_t from;
	uint8_t event_type;
};

struct sctp_cwnd_log_req{
	int num_in_log;     /* Number in log */
	int num_ret;        /* Number returned */
	int start_at;       /* start at this one */
	int end_at;         /* end at this one */
	struct sctp_cwnd_log log[0];
};

/*
 * API system calls
 */
#ifndef _KERNEL

__BEGIN_DECLS
int	sctp_peeloff	__P((int, sctp_assoc_t));
int	sctp_bindx	__P((int, struct sockaddr *, int, int));
int     sctp_connectx   __P((int, struct sockaddr *, int));
int	sctp_getpaddrs	__P((int, sctp_assoc_t, struct sockaddr **));
void	sctp_freepaddrs	__P((struct sockaddr *));
int	sctp_getladdrs	__P((int, sctp_assoc_t, struct sockaddr **));
void	sctp_freeladdrs	__P((struct sockaddr *));
int     sctp_opt_info   __P((int, sctp_assoc_t, int, void *, size_t *));
int     sctp_sendmsg    __P((int, const void *, size_t, struct sockaddr *,
			     socklen_t, uint32_t, uint32_t,
			     uint16_t, uint32_t, uint32_t));
ssize_t sctp_recvmsg	__P((int, void *, size_t,
			     struct sockaddr *, socklen_t *,
			     struct sctp_sndrcvinfo *, int *));

__END_DECLS



#endif /* !_KERNEL */

#endif /* !_NETINET_SCTP_UIO_H_INCLUDED */

#if defined(__QNXNTO__) && defined(__USESRCVERSION)
#include <sys/srcversion.h>
__SRCVERSION("$URL: http://svn/product/branches/6.6.0/trunk/lib/sctp/public/netinet/sctp_uio.h $ $Rev: 680336 $")
#endif
