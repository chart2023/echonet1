var device = require('./device.info');
var export_write = require('./export_write');
var http = require('http'); //require the 'http' module
var EchonetLite = require('node-echonet-lite');
var moment = require('moment');
var uuid=require("node-uuid");
var parser = require('xml2json');
var math = require('mathjs');
var fs = require('fs');
var parseString = require('xml2js').parseString;
var time1=moment().format();
var min10=moment().subtract({minutes: 10}).format();
var address = device.aircondition;
var TempUpper = device.TempUpper;
var TempLower = device.TempLower;
var TempSet = device.TempSet;
console.log('START TIME:'+time1);
var body = '<?xml version="1.0" encoding="utf-8"?>'
+'<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">'
+'<soapenv:Body><ns2:queryRQ xmlns:ns2="http://soap.fiap.org/"><transport xmlns="http://gutp.jp/fiap/2009/11/">'
+'<header><query id="'+uuid.v4()+'" type="storage">'
+'<key id="http://bems.ee.eng.chula.ac.th/eng4/fl13/north/room_server/z1/sensor1/monitor/temperature" attrName="time" gteq="'+min10+'" lteq="'+time1+'" />'
+'</query></header></transport></ns2:queryRQ></soapenv:Body></soapenv:Envelope>';
var body_ok = "<?xml version='1.0' encoding='UTF-8'?><soapenv:Envelope xmlns:soapenv='http://schemas.xmlsoap.org/soap/envelope/'><soapenv:Body><ns2:dataRS xmlns:ns2='http://soap.fiap.org/'><transport xmlns='http://gutp.jp/fiap/2009/11/'><header><OK/></header></transport></ns2:dataRS></soapenv:Body></soapenv:Envelope>";
console.log(body);
var postRequest = {

    host: "161.200.90.122",
    path: "/axis2/services/FIAPStorage",
    port: 80,
    method: "POST",
    headers: {

        'Content-Type': 'text/xml charset=UTF-8',
        'SOAPAction': 'http://soap.fiap.org/query',
        'Content-Length': Buffer.byteLength(body)
    }
};
var req_fetch = http.request( postRequest, function ( res ) {
           console.log( res.statusCode );
           var buffer = "";
                var body = '';
                var jsonbody
                res.setEncoding('utf8');
                res.on( "data", function( data ) {
                buffer = buffer + data;
                } );
           res.on( "end", function() {
                console.log( buffer );
                parseString(buffer, function (err,result){
                jsonbody = JSON.stringify(result);
                return jsonbody;
                })
                try{
                        var idc=[];
        var timec=[];
        var valuec=[];
   /*-----------------parsing json-----------------------------------*/
        JSON.parse(jsonbody, function (key, value) {
                if (key==='id'&& value[0]==='h'){
                        idc.push(value);
                }
                else if (key==='time1'){
                        timec.push(value);
                }
                else if (key==='_'){
                        valuec.push(value);
                }
                });
                //console.log(valuec);
                var numofvaluec=valuec.length;
                if (Array.isArray(valuec) == true && numofvaluec > 5){
                        //console.log('bb');
                        console.log(valuec);
                        var valuecsum=0;
                        for (var jk =0 , len1 = valuec.length; jk < len1; jk++){
                                var valuecint
                                valuecint = Number.parseFloat(valuec[jk]);
                                 valuecsum= valuecsum+valuecint;
                        }
                                var roomtemp=math.round(valuecsum/len1,2);
                               console.log('avg:'+roomtemp+'celcius');
                                                           writeieee('servertemp',roomtemp);
                                var el = new EchonetLite({'type': 'lan'});
                                // Initialize the EchonetLite object
                                el.init((err) => {
                                if(err) { // An error was occurred
                                showErrorExit(err);
                                } else {
                                //var address = "192.168.0.100";
                                var eoj1 = [0x01, 0x30, 0x01];
                                var epc = 0x80;
                                el.getPropertyValue(address, eoj1, 0x80, (err, res) => {
                                var status = res['message']['data']['status'];
                                var desc = (status ? 'on' : 'off');
                                if (roomtemp >= TempUpper && desc == "off"){
                                        console.log("CASE1: Turn on the air condition");
                                        var edt = { 'status': true };
                                        el.setPropertyValue(address, eoj1, epc, edt, (err, res) => {
                                                var edt = {'temperature': TempSet};
                                                var epc2 = 0xB3;
                                                el.setPropertyValue(address, eoj1, epc2, edt, (err, res) => {
                                                el.close(() =>{
                                                console.log('socket closed');
                                                });
                                        });
                                });
                                        var newStatus="CHANGED";
                                }else if (roomtemp >= TempUpper && desc == "on"){
                                        console.log("CASE2: The air condition is running and the temp. is high");
                                        var newStatus="UNCHANGE";
                                        el.getPropertyValue(address, eoj1, 0x80, (err, res) => {
                                        var status = res['message']['data']['status'];
                                        el.close(() =>{
                                        console.log('socket closed');
                                        });
                                        });
                                }else if (roomtemp < TempLower && desc == "off"){
                                        console.log("CASE3: The air condition is not running and the temp. is low");
                                        el.getPropertyValue(address, eoj1, 0x80, (err, res) => {
                                        var status = res['message']['data']['status'];
                                        el.close(() =>{
                                        console.log('socket closed');
                                                });
                                        });
                                }else if (roomtemp < TempLower && desc == "on"){
                                        console.log("CASE4: Turn off the air condition");
                                         var edt = { 'status': false };
                                        el.setPropertyValue(address, eoj1, epc, edt, (err, res) => {
                                        el.close(() =>{
                                        console.log('socket closed');
                                                });
                                        });
                                }else{
                                        console.log("CASE:5");
                                }
                        });
  }
});



                }else{
                        console.log('aa');
                }
        } catch (er) {
                console.log(er);
        }
                } );
        });
        req_fetch.write( body );
        req_fetch.end();
setTimeout( function(){
//var address="192.168.0.100";
var eoj2 = [0x01, 0x30, 0x01];
var epc = 0x80;
var el2 = new EchonetLite({'type': 'lan'});
el2.init((err) => {
  if(err) { // An error was occurred
    showErrorExit(err);
  } else { // Start to discover devices
 var epc = 0x80; // An property code which means operation status
  el2.getPropertyValue(address, eoj2, 0x80, (err, res) => {
    // this value is true if the air conditione is on
    var status = res['message']['data']['status'];
    var desc = (status ? 'on' : 'off');
        writeieee("airstatus",desc);
        el2.close(() => {
        console.log('Closed.');
        console.log('#######################################################');
        });
  });
}
});}, 1000);
function changePowerStatus(address, eoj, epc, status) {
  var edt = { 'status': status };
  el.setPropertyValue(address, eoj, epc, edt, (err, res) => {
    var desc = (status ? 'on' : 'off');
    console.log('The air conditionaer was turned ' + desc + '.');
   // el.close(() => {
     // console.log('Closed.');
            // This script terminates here.
    //});
  });
}

function writeieee(pointname,status) {
        var pointset      = "http://xhat2.test.chula.ac.th/echonet/eng4/fl13/north/server_room/z1/monitor/"+pointname;
        var time=moment().format();
        var fiap_element = [[pointset, status, time]];
        console.log(pointset, fiap_element);
        export_write.write(pointset, fiap_element);
        console.log("Handled content");

}
function getOperationStatus(address, eoj) {
  var epc = 0x80; // An property code which means operation status
  el.getPropertyValue(address, eoj, 0x80, (err, res) => {
    // this value is true if the air conditione is on
    var status = res['message']['data']['status'];
    var desc = (status ? 'on' : 'off');
    console.log('The air conditioner is ' + desc + '.');
        writeieee('airstatus',desc2);
  });
}
