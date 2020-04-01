To start iotedgedev
* replace `F:\azure_sandbox\iotedge` with your working directory

```
docker run -ti -v /var/run/docker.sock:/var/run/docker.sock -v F:\azure_sandbox\iotedge:/home/iotedge microsoft/iotedgedev
```

## shortcut to get the project going
ctrl-c and run this after every code change you make
```
bash ./restart.sh
```


## to add a new nodejs module
```
iotedgedev add -t nodejs youNameHere
```

## Build IoT Edge module images
```
sudo iotedgedev build

```

## Setup and start the IoT Edge Simulator to run the solution
```
sudo iotedgedev start --setup --file config/deployment.amd64.json

```

## Monitor messages sent from IoT Edge Simulator to IoT Hub
```
iotedgedev monitor
```

## stop the IoT Edge Simulator
```
sudo iotedgedev stop

```

## Credits
* https://github.com/Azure/iotedgedev
* https://youtu.be/l0fe5qAUBAg
* https://github.com/Azure-Samples/azure-iot-samples-node/blob/master/iot-hub/Samples/device/module/edge_input_output.js
* https://github.com/Azure/azure-iot-sdk-node
* https://docs.microsoft.com/en-us/javascript/api/azure-iot-device/moduleclient?view=azure-node-latest#sendoutputevent-string--message-
* https://github.com/Azure/iotedgedev
* https://github.com/Azure/iotedgedev/wiki/command-list
* https://docs.microsoft.com/en-us/azure/iot-edge/tutorial-node-module