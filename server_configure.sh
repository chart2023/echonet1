#!/bin/bash
echo "configure"
echo "START at:" $(date)
echo "*/10 * * * * /usr/bin/nodejs /home/ubuntu/echonetlite/echonetmain.js >> /home/ubuntu/echonetlite/airresult.log" | tee --append /etc/cron.d/echonetlite
echo "FINISH at:" $(date)
echo "##########FINISHED############"
