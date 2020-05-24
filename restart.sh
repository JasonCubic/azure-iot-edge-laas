#!/bin/bash

sudo iotedgedev stop

sudo iotedgedev build

# sudo iotedgedev start --setup --file config/deployment.amd64.json
# iotedgedev monitor

sudo iotedgedev start --setup --file config/deployment.amd64.json --verbose
