#!/bin/bash
echo "STEP1: INSTANTIATE echonet gw"
echo "START at:" $(date)
NSCL_START_TIME=$(date)
myhome=${HOME}
route add -net 192.168.9.0/24 gw 10.0.14.1
route add -net 10.0.14.0/24 gw 10.0.14.1
route add -net 161.200.90.0/24 gw 10.0.14.1
route add -net 91.189.88.0/24 gw 10.0.14.1
route add default gw 192.168.0.1
route del default gw 10.0.14.1
bash -c "echo $private1 `cat /etc/hostname` >> /etc/hosts"
wget -q --tries=10 --timeout=20 --spider  http://archive.ubuntu.com
if [[ $? -eq 0 ]]; then
        echo "Server can connect to Internet"
else
        echo "Server cannot connect to Internet"
fi
ifconfig ens3 $private_echonet netmask 255.255.255.0
node /home/ubuntu/echonetlite/findechonet.js
echo "exports.TempUpper='$TempUpper';" | tee --append /home/ubuntu/echonetlite/device.info
echo "exports.TempLower='$TempLower';" | tee --append /home/ubuntu/echonetlite/device.info
echo "exports.TempSet='$TempSet';" | tee --append /home/ubuntu/echonetlite/device.info
echo "exports.ipself='$private_echonet';" | tee --append /home/ubuntu/echonetlite/device.info
echo "FINISH at:" $(date)
echo "##########FINISHED############"
