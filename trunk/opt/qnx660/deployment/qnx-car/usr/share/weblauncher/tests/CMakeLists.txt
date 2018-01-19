FILE(GLOB files "${CMAKE_CURRENT_SOURCE_DIR}/*.*")
install(FILES ${files} DESTINATION ${CMAKE_SYSTEM_PROCESSOR}/usr/share/weblauncher/tests/)

install(PROGRAMS ${CMAKE_CURRENT_SOURCE_DIR}/test-weblauncher DESTINATION ${CMAKE_SYSTEM_PROCESSOR}/usr/bin)
