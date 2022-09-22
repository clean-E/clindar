#!/bin/bash
cd /home/ec2-user/clindar/server
sudo npm install -f
sudo npm install pm2@latest -g
sudo apt-get update
sudo apt-get install authbind
sudo touch /etc/authbind/byport/80
sudo chown ec2-user /etc/authbind/byport/80
sudo chmod 755 /etc/authbind/byport/80