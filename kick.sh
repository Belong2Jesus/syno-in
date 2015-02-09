#!/bin/sh

nohup node server.js topPage 80 210.152.137.233 &
echo $! > pid


