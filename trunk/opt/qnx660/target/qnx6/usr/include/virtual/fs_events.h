// WARNING: This is a generated file, do not modify directly!
#ifndef VIRTUAL_FS_EVENTS_H
#define VIRTUAL_FS_EVENTS_H

#include <virtual/event.h>

#ifdef __cplusplus
extern "C" {
#endif

enum vevt_fs_device_t {
    VIRT_FS_DEVICE_SDCARD,
};

static const uint16_t VEVT_FS_IDS[] = {VEVT_ID_FS_MOUNT, VEVT_ID_FS_UNMOUNT};

vevt_t vevt_fs_create(void);
void vevt_fs_set_id(vevt_t event, uint16_t id);
int vevt_fs_verify(vevt_t event);

uint8_t vevt_fs_get_device(vevt_t event);
int vevt_fs_set_device(vevt_t event, uint8_t device);

#ifdef __cplusplus
}
#endif

#endif


#if defined(__QNXNTO__) && defined(__USESRCVERSION)
#include <sys/srcversion.h>
__SRCVERSION("$URL: http://foundry51.qnx.com/svn/repos/internal-source/branches/6.6.0/trunk/simulator/lib/ves-events/library/public/virtual/fs_events.h $ $Rev: 54036 $")
#endif
