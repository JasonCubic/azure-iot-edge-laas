To start iotedgedev
* replace `F:\azure_sandbox\iotedge` with your working directory

```
docker run -ti -v /var/run/docker.sock:/var/run/docker.sock -v F:\azure_sandbox\iotedge:/home/iotedge microsoft/iotedgedev


docker run -ti -v /var/run/docker.sock:/var/run/docker.sock -v F:\azure_sandbox\iotedge:/home/iotedge -v f:\azure_sandbox\iotedge\modules\laas\src\:/home/iotedge/modules/laas/src microsoft/iotedgedev

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

TODO: have laas start after the mssql module
TODO: nodemon on laas module


## Credits
* https://github.com/Azure/iotedgedev
* https://youtu.be/l0fe5qAUBAg
* https://github.com/Azure-Samples/azure-iot-samples-node/blob/master/iot-hub/Samples/device/module/edge_input_output.js
* https://github.com/Azure/azure-iot-sdk-node
* https://docs.microsoft.com/en-us/javascript/api/azure-iot-device/moduleclient?view=azure-node-latest#sendoutputevent-string--message-
* https://github.com/Azure/iotedgedev
* https://github.com/Azure/iotedgedev/wiki/command-list
* https://docs.microsoft.com/en-us/azure/iot-edge/tutorial-node-module

---
volumes are done like this:  https://docs.microsoft.com/en-us/azure/iot-edge/how-to-access-host-storage-from-module
---
<!--
{
    "id": "sql-server-module",
    "labels": {},
    "priority": null,
    "targetCondition": "",
    "content": {
        "modulesContent": {
            "$edgeAgent": {
                "properties.desired": {
                    "modules": {
                        "SQLServerModule": {
                            "settings": {
                                "image": "microsoft/mssql-server-linux:2017-latest",
                                "createOptions": "{\"Env\": [\"ACCEPT_EULA=Y\",\"MSSQL_SA_PASSWORD=Strong!Passw0rd\"],\"HostConfig\": {\"Mounts\": [{\"Target\": \"/var/opt/mssql\",\"Source\": \"sqlVolume\",\"Type\": \"volume\"}],\"PortBindings\": {\"1433/tcp\": [{\"HostPort\": \"1401\"}]}}}"
                            },
                            "type": "docker",
                            "status": "running",
                            "restartPolicy": "always",
                            "version": "1.0"
                        }
                    },
                    "runtime": {
                        "settings": {
                            "minDockerVersion": "v1.25"
                        },
                        "type": "docker"
                    },
                    "schemaVersion": "1,0",
                    "systemModules": {
                        "edgeAgent": {
                            "settings": {
                                "image": "mcr.microsoft.com/azureiotedge-agent:1.0",
                                "createOptions": ""
                            },
                            "type": "docker"
                        },
                        "edgeHub": {
                            "settings": {
                                "image": "mcr.microsoft.com/azureiotedge-hub:1.0",
                                "createOptions": "{\"HostConfig\":{\"PortBindings\":{\"8883/tcp\":[{\"HostPort\":\"8883\"}],\"5671/tcp\":[{\"HostPort\":\"5671\"}],\"443/tcp\":[{\"HostPort\":\"443\"}]}}}"
                            },
                            "type": "docker",
                            "status": "running",
                            "restartPolicy": "always"
                        }
                    }
                }
            },
            "$edgeHub": {
                "properties.desired": {
                    "routes": {},
                    "schemaVersion": "1.0",
                    "storeAndForwardConfiguration": {
                        "timeToLiveSecs": 7200
                    }
                }
            }
        }
    },
    "metrics": {
        "queries": {},
        "results": {}
    },
    "etag": "*"
}

---


{
  "modulesContent": {
      "$edgeAgent": {
          "properties.desired": {
              "modules": {
                  "laas": {
                      "settings": {
                          "image": "localhost:5000/laas:0.0.1-amd64",
                          "createOptions": "{}"
                      },
                      "type": "docker",
                      "version": "1.0",
                      "status": "running",
                      "restartPolicy": "always"
                  },
                  "SQLServerModule": {
                      "settings": {
                          "image": "microsoft/mssql-server-linux:2017-latest",
                          "createOptions": "{\"Env\": [\"ACCEPT_EULA=Y\",\"MSSQL_SA_PASSWORD=Strong!Passw0rd\"],\"HostConfig\": {\"Mounts\": [{\"Target\": \"/var/opt/mssql\",\"Source\": \"sqlVolume\",\"Type\": \"volume\"}],\"PortBindings\": {\"1433/tcp\": [{\"HostPort\": \"1401\"}]}}}"
                      },
                      "type": "docker",
                      "status": "running",
                      "restartPolicy": "always",
                      "version": "1.0"
                  }
              },
              "runtime": {
                  "settings": {
                      "minDockerVersion": "v1.25"
                  },
                  "type": "docker"
              },
              "schemaVersion": "1.0",
              "systemModules": {
                  "edgeAgent": {
                      "settings": {
                          "image": "mcr.microsoft.com/azureiotedge-agent:1.0",
                          "createOptions": "{}"
                      },
                      "type": "docker"
                  },
                  "edgeHub": {
                      "settings": {
                          "image": "mcr.microsoft.com/azureiotedge-hub:1.0",
                          "createOptions": "{\"HostConfig\":{\"PortBindings\":{\"5671/tcp\":[{\"HostPort\":\"5671\"}],\"8883/tcp\":[{\"HostPort\":\"8883\"}],\"443/tcp\":[{\"HostPort\":\"443\"}]}}}"
                      },
                      "type": "docker",
                      "status": "running",
                      "restartPolicy": "always"
                  }
              }
          }
      },
      "$edgeHub": {
          "properties.desired": {
              "routes": {
                  "laasToIoTHub": "FROM /messages/modules/laas/outputs/* INTO $upstream"
              },
              "schemaVersion": "1.0",
              "storeAndForwardConfiguration": {
                  "timeToLiveSecs": 7200
              }
          }
      },
      "laas": {
          "properties.desired": {}
      }
  }
} -->


          "laas": {
            "version": "1.0",
            "type": "docker",
            "status": "running",
            "restartPolicy": "always",
            "settings": {
              "image": "${MODULES.laas}",
              "createOptions": {
                "HostConfig": {
                  "Mounts": [
                    {
                      "Type": "bind",
                      "Target": "/app/src",
                      "Source": "/home/iotedge/modules/laas/src"
                    }
                  ]
                },
                "Env": [
                  "MSSQL_USERNAME=SA",
                  "MSSQL_PASSWORD=Strong!Passw0rd",
                  "MSSQL_SERVER=192.168.1.14",
                  "MSSQL_DATABASE=rtls"
                ]
              }
            }
          }

"Source": "f:\\azure_sandbox\\iotedge\\modules\\laas\\src"