// Load the node-echonet-lite module
var EchonetLite = require('node-echonet-lite');
var fs=require('fs');
// Create an EchonetLite object
//   The type of network layer must be passed.
var el = new EchonetLite({'type': 'lan'});

// Initialize the EchonetLite object
el.init((err) => {
  if(err) { // An error was occurred
    showErrorExit(err);
  } else { // Start to discover devices
    discoverDevices();
  }
});

// Start to discover devices
function discoverDevices() {
  // Start to discover Echonet Lite devices
  el.startDiscovery((err, res) => {
    if(err) { // Error handling
      showErrorExit(err);
    }
    // Determine the type of the found device
    var device = res['device'];
    var address = device['address'];
    var eoj = device['eoj'][0];
    var group_code = eoj[0]; // Class group code
    var class_code = eoj[1]; // Class code
    if(group_code === 0x01 && class_code === 0x30) {
      // This means that the found device belongs to the home air conditioner class
      console.log('Found an air conditioner (' + address + ').');
        fs.writeFile("/home/ubuntu/echonetlite/device.info", "exports.aircondition='"+address+"';", function(err) {
                console.log("ip"+ address + "was saved!");
        });
      // Stop to discovery process
      el.stopDiscovery();
      // Get the operation status
      getOperationStatus(address, eoj);
    }
  });
}

// Get the operation status
function getOperationStatus(address, eoj) {
  var epc = 0x80; // An property code which means operation status
  el.getPropertyValue(address, eoj, 0x80, (err, res) => {
    // this value is true if the air conditione is on
    var status = res['message']['data']['status'];
    var desc = (status ? 'on' : 'off');
    console.log('The air conditioner is ' + desc + '.');
        el.close(() => {
        console.log('Closed.');
            // This script terminates here.
    });
  });
}

// Change the status of the operation status
function changePowerStatus(address, eoj, epc, status) {
  var edt = { 'status': status };
  el.setPropertyValue(address, eoj, epc, edt, (err, res) => {
    var desc = (status ? 'on' : 'off');
    console.log('The air conditionaer was turned ' + desc + '.');
    el.close(() => {
      console.log('Closed.');
            // This script terminates here.
    });
  });
}

// Print an error then terminate the process of this script
function showErrorExit(err) {
  console.log('[ERROR] '+ err.toString());
  process.exit();
}
