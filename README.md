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

---

## Notes:

zebra reader:
* http://fx9600f05ec9/index.html

## how marriage works
* prerequisite: tag must already exist in the system before it can be married to an attribute
* docker express webserver/API that updates the DB to do the DB marriage actions
  * api has a mssql dependency to the laas database for reads and writes
  * the source for this is vue-cli but it just generates static html that is placed into this module
  * consider mono-repo example for this
* keeps track of marriage change data in its own history tables
* laas module enriches with marriage relationships every time it sends out history data

## how location enrichment works
* docker express webserver/API updates laas location data
* can CRUD location tags attached to reader mac address and antenna ID
  * data has attribute and value such as
    * entity: reader mac address
    * attribute: antenna 1
    * value: station 1
    * entity: reader mac address
    * attribute: antenna 1
    * value: pool 1


## how history works
* listens to upstream data coming out of laas
* has its own location_history database with no relations at all to the rtls database
* store as json: https://channel9.msdn.com/Shows/Data-Exposed/SQL-Server-2016-and-JSON-Support
  * https://docs.microsoft.com/en-us/sql/relational-databases/json/json-data-sql-server?view=sql-server-ver15


## marriage user interface
* Menu
  * Create a new value? (such as axle line, chassis line, cab line)
  * Select tag for marriage (see section below)
  * Divorce by tag (build into a report?)
  * reports

* Reports
  * Search by tag - (also shows all other tags that have the same attribute)
  * Search by attribute - (shows all tags with that attribute)
  * Search by value - shows all tags with a set value
  * See all last known locations by RFID tag
  * See all last known locations by attribute
  * See all last known locations by value? (or just allow filter on the see all marriages)
  * See all current marriages
  * see a history of activity in the system

* Select tag for marriage
  * user can autocomplete a tag or pick one from a list
  * When user selects tag they see any current relationships
    * if it already has attribute they see a warning
  * When user selects attribute they see current tags with that attribute
    * if attribute is assigned to another tag they see a warning
     * the warning says that the attributes on the other tag will be transferred to this tag
  * If user selects to do a marriage to a tag that already exists they get an error modal and can not submit
  * User selects value like axle line or chassis line (from a list of possible values)
  * Has checkbox to auto divorce tag
    * if checked it will remove the attribute from another rfid tag in the system so that is can add it to this one
  * Has verification screen that shows all marriages and divorces about to take place with the users name on it.
    * user has to enter username and password to continue (potentially an ldap auth?)
    * validation to make sure another user hasn't changed the tag out from under them?
  * when completed goes to the search by tag screen for the rfid tag that was modified so user can see its current state
  * Has completed screen with undo button?

* manual tests
  * CRUD on a value - check that value table in DB gets updated (axle line, chassis line, etc, etc,)
  * divorce a tag - removes all attributes attached to it in database (should be history in history DB)
  * reports all work
  * create a marriage on an unmarried tag
  * create a marriage on a married tag and transfer that tag's attribute relationship to new tag
    * new tag should end up with more than one attribute
    * old tag should end up with no marriage events
    * do this same test again to end up with a tag that has 3 attributes
  * create a marriage on a married tag and do not transfer that tag's attribute relationship to new tag
    * new tag should end up with one new attribute
    * old tag should end up with same number of attributes that it started with
  * create a forklift attribute with 4 RFID tags on it with value of rover
  * create a new marriage and use auto divorce checkbox to remove attribute from multiple tags
    * new tag should have the attribute
    * all of the other tags should not have that attribute
  * use two windows to simulate concurrency problems
    * when get to verification screen the tag data has changed should get error (worded in plain english)
    * when submit if tag data has changed should get error (worded in plain english)
  * show marriage info page for a rfid tag that has not been put into the rfid_tag_reads table yet but it is in the marriage_eav table

* Questions
  * How to have 4 tags on forklift
    * do not check the auto divorce checkbox when adding a new marriage (the attribute must already be on another tag in the system)
  * How to have more than one relation on a tag like one tag for both a chassis and axle
    * do check the auto divorce checkbox when adding a new marriage
  * when do you see the auto divorce checkbox?
    * when you have just entered an attribute and it is married to another rfid tag
  * what is the default value for the auto divorce checkbox?
    * if its checked we could potentially accidentally have tags not tied to an asset that is supposed to have multiple tags attached to it
    * if its not checked we could potentially accidentally have attributes that are on more than one tag
    * the answer is clear: the default value should be checked
  * can you use the auto divorce checkbox to divorce multiple tags from an attributes?
    * yes

---

TODO:

* menu item see location history
* get status by tag epc report (shows all data in rtls about the tag) (just json to start)
  * build it as a composable component so we can use it in multiple places










