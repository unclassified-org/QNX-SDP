*** README for CAR2 directory: .../target/usr/hmi/ *** 

The contents of this directory are external links to the ../../../html5/ directory.
All elements are _native_ packages which are to be installed as the base system.

If you are simply adding an Application, an entry in this direcoty is most likely
not required.



To add native applications, add the path to the application in the [svn.externals] file
   (e.g. ../../../html5/<NEW_APPLICATION> <NEW_APPLICATION>

and run:
   svn propset svn:externals . -F svn.externals


This will add the external link to SVN so that all work in the html5/<NEW_APPLICATION> will
be available here.

No .bar file should be required nor any reference to it in the .../target/boards/<target>.<variant>/profile.xml file.
