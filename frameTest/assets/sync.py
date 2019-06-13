#!/usr/bin/python

import os
from myutil.utils import copyFile,addToSVN

inlist = ["TestScrollver.js","Main"]


fr = "./scripts/core"
project = "/Users/apple/Documents/projects/baseFrameworke"
to = os.path.join(project,"scripts")

for item in ["GameInit.js","Preload.js","core/core.d.ts"]:
	copyFile(os.path.join("./scripts",item), os.path.join(to, item))

to = os.path.join(to,"core")

for (root,_,_items) in os.walk(fr):
	if _items:
		for item in _items:
			ext = os.path.splitext(item)[1]
			if ext == ".js" and not item in inlist:
				f = os.path.join(root, item)
				copyFile(f, f.replace(fr,to))
				
os.system("open %s"%project)	
#os.chdir(project)
addToSVN(project,"test")
		

