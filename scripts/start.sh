#!/bin/bash
cd /home/ec2-user/clindar/server
authbind --deep pm2 start dist/main.js