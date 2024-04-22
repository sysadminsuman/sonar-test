#!/bin/bash
#chkconfig crond on
service cron restart
systemctl enable cron
crond 2>&1
pm2-runtime src/server.js
