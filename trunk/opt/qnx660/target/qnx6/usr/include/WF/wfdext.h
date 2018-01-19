#ifndef __wfdext_h_
#define __wfdext_h_

#ifdef __cplusplus
extern "C" {
#endif

#include <WF/wfdplatform.h>

/*************************************************************/

#define WFD_WFDEXT_VERSION 1


#ifndef WFD_QNX_cbabc
#define WFD_QNX_cbabc 1
#define WFD_PORT_CBABC_MODE_QNX 0x7670
typedef enum
{   WFD_PORT_CBABC_MODE_NONE_QNX   = 0x7671,
	WFD_PORT_CBABC_MODE_VIDEO_QNX  = 0x7672,
	WFD_PORT_CBABC_MODE_UI_QNX     = 0x7673,
	WFD_PORT_CBABC_MODE_PHOTO_QNX  = 0x7674,
	WFD_PORT_CBABC_MODE_32BIT_QNX  = 0x7FFFFFFF
} WFDPortCBABCModeQNX;

#endif

#ifndef WFD_QNX_bchs_filter
#define WFD_QNX_bchs_filter 1
#define WFD_PIPELINE_BRIGHTNESS_QNX		0x7750
#define WFD_PIPELINE_CONTRAST_QNX		0x7751
#define WFD_PIPELINE_HUE_QNX			0x7752
#define WFD_PIPELINE_SATURATION_QNX		0x7753
#endif

#ifndef WFD_QNX_port_mode_info
#define WFD_QNX_port_mode_info 1
#define WFD_PORT_MODE_ASPECT_RATIO_QNX  0x7606
#define WFD_PORT_MODE_PREFERRED_QNX     0x7607
#endif

#ifndef WFD_QNX_vsync
#define WFD_QNX_vsync 1
#ifdef WFD_WFDEXT_PROTOTYPES
WFD_API_CALL WFDErrorCode WFD_APIENTRY
    wfdWaitForVSyncQNX(WFDDevice device, WFDPort port) WFD_APIEXIT;
#endif /* WFD_WFDEXT_PROTOTYPES */
typedef WFDErrorCode (WFD_APIENTRY PFNWFDWAITFORVSYNCQNX) (WFDDevice device, WFDPort port);
#endif

#ifndef WFD_QNX_egl_images
#define WFD_QNX_egl_images 1
#define WFD_USAGE_DISPLAY_QNX      (1 << 0)
#define WFD_USAGE_READ_QNX         (1 << 1)
#define WFD_USAGE_WRITE_QNX        (1 << 2)
#define WFD_USAGE_NATIVE_QNX       (1 << 3)
#define WFD_USAGE_OPENGL_ES1_QNX   (1 << 4)
#define WFD_USAGE_OPENGL_ES2_QNX   (1 << 5)
#define WFD_USAGE_OPENVG_QNX       (1 << 6)
#define WFD_USAGE_VIDEO_QNX        (1 << 7)
#define WFD_USAGE_CAPTURE_QNX      (1 << 8)
#define WFD_USAGE_ROTATION_QNX     (1 << 9)
#define WFD_USAGE_OVERLAY_QNX      (1 << 10)
#define WFD_USAGE_WRITEBACK_QNX    (1 << 31)
#define WFD_FORMAT_BYTE_QNX              1
#define WFD_FORMAT_RGBA4444_QNX          2
#define WFD_FORMAT_RGBX4444_QNX          3
#define WFD_FORMAT_RGBA5551_QNX          4
#define WFD_FORMAT_RGBX5551_QNX          5
#define WFD_FORMAT_RGB565_QNX            6
#define WFD_FORMAT_RGB888_QNX            7
#define WFD_FORMAT_RGBA8888_QNX          8
#define WFD_FORMAT_RGBX8888_QNX          9
#define WFD_FORMAT_YVU9_QNX             10
#define WFD_FORMAT_YUV420_QNX           11
#define WFD_FORMAT_NV12_QNX             12
#define WFD_FORMAT_YV12_QNX             13
#define WFD_FORMAT_UYVY_QNX             14
#define WFD_FORMAT_YUY2_QNX             15
#define WFD_FORMAT_YVYU_QNX             16
#define WFD_FORMAT_V422_QNX             17
#define WFD_FORMAT_AYUV_QNX             18
#define WFD_FORMAT_NV12_QC_SUPERTILE    ((1 << 16) | WFD_FORMAT_NV12_QNX)
#define WFD_FORMAT_NV12_QC_32M4KA       ((2 << 16) | WFD_FORMAT_NV12_QNX)
#ifdef WFD_WFDEXT_PROTOTYPES
WFD_API_CALL WFDErrorCode WFD_APIENTRY
    wfdCreateWFDEGLImagesQNX(WFDDevice device, WFDint width, WFDint height, WFDint format, WFDint usage, WFDint count, WFDEGLImage *images);
WFD_API_CALL WFDErrorCode WFD_APIENTRY
    wfdDestroyWFDEGLImagesQNX(WFDDevice device, WFDint count, WFDEGLImage *images);
#endif /* WFD_WFDEXT_PROTOTYPES */
typedef WFDErrorCode (WFD_APIENTRY PFNWFDCREATEWFDEGLIMAGESQNX) (WFDDevice device, WFDint width, WFDint height, WFDint usage, WFDint count, WFDEGLImage *images);
typedef WFDErrorCode (WFD_APIENTRY PFNWFDDESTROYWFDEGLIMAGESQNX) (WFDDevice device, WFDint count, WFDEGLImage *images);
#endif

#ifndef WFD_QNX_write_back
#define WFD_QNX_write_back 1
typedef WFDHandle WFDDestinationQNX;
#define WFD_PORT_WRITEBACK_SUPPORT_QNX               0x7640
#define WFD_PORT_WRITEBACK_SCALE_RANGE_QNX           0x7641
#define WFD_PORT_WRITEBACK_SOURCE_RECTANGLE_QNX      0x7642
#define WFD_PORT_WRITEBACK_DESTINATION_RECTANGLE_QNX 0x7643
#define WFD_EVENT_PORT_BIND_DESTINATION_COMPLETE_QNX 0x7587
#define WFD_EVENT_PORT_BIND_PORT_ID_QNX              0x75C9
#define WFD_EVENT_PORT_BIND_DESTINATION_QNX          0x75CA
#define WFD_EVENT_PORT_BIND_QUEUE_OVERFLOW_QNX       0x75CB
#ifdef WFD_WFDEXT_PROTOTYPES
WFD_API_CALL WFDDestinationQNX WFD_APIENTRY
    wfdCreateDestinationFromImageQNX(WFDDevice device, WFDPort port, WFDEGLImage image, const WFDint *attribList) WFD_APIEXIT;
WFD_API_CALL WFDDestinationQNX WFD_APIENTRY
    wfdCreateDestinationFromStreamQNX(WFDDevice device, WFDPort port, WFDNativeStreamType stream, const WFDint *attribList) WFD_APIEXIT;
WFD_API_CALL void WFD_APIENTRY
    wfdDestroyDestinationQNX(WFDDevice device, WFDDestinationQNX destination) WFD_APIEXIT;
WFD_API_CALL WFDErrorCode WFD_APIENTRY
    wfdBindDestinationToPortQNX(WFDDevice device, WFDPort port, WFDDestinationQNX destination, WFDTransition transition) WFD_APIEXIT;
#endif
typedef WFDDestinationQNX (WFD_APIENTRY PFNWFDCREATEDESTINATIONFROMIMAGEQNX) (WFDDevice device, WFDPort port, WFDEGLImage image, const WFDint *attribList);
typedef WFDDestinationQNX (WFD_APIENTRY PFNWFDCREATEDESTINATIONFROMSTREAMQNX) (WFDDevice device, WFDPort port, WFDNativeStreamType stream, const WFDint *attribList);
typedef void (WFD_APIENTRY PFNWFDDESTROYDESTINATIONQNX) (WFDDevice device, WFDDestinationQNX destination);
typedef void (WFD_APIENTRY PFNWFDBINDDESTINATIONTOPORTQNX) (WFDDevice device, WFDPort port, WFDDestinationQNX destination, WFDTransition transition);
#endif

#ifdef __cplusplus
}
#endif

#endif

#if defined(__QNXNTO__) && defined(__USESRCVERSION)
#include <sys/srcversion.h>
__SRCVERSION("$URL: http://svn/product/branches/6.6.0/trunk/lib/khronos/public/WF/wfdext.h $ $Rev: 697475 $")
#endif
