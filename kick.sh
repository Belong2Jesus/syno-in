#!/bin/sh

NODE_ENV=develop nohup node server.js topPage &
echo $! > pid


