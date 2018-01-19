ifndef QCONFIG
QCONFIG=qconfig.mk
endif
include $(QCONFIG)

INSTALLDIR=appinstall/bars/unsigned/html5/

all:
	true
clean:
	true
iclean:
	true
hinstall:
	true
install:
	../../gen-wwpkg.py -Oo $(INSTALL_ROOT_nto)/$(INSTALLDIR) -vvvvvv
