#!/bin/bash
echo "START"
echo "START at:" $(date)
/usr/bin/node /home/ubuntu/echonetlite/findechonet.js
/usr/bin/node /home/ubuntu/echonetlite/echonetmain.js
echo "FINISH at:" $(date)
echo "##########FINISHED############"
