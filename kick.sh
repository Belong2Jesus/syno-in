#!/bin/sh

export NODE_ENV=production
export NODE_CONFIG_DIR=/home/rtc/node-scripts/syno-in/config
/root/.nodebrew/current/bin/node /root/.nodebrew/current/bin/forever start /home/rtc/node-scripts/syno-in/server.js --pidfile /var/log/syno-in.pid -l /var/log/node-app-syno-in.log -a -w




