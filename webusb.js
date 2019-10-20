
const MICROBIT_VENDOR_ID = 0x0d28
const MICROBIT_PRODUCT_ID = 0x0204
const MICROBIT_DAP_INTERFACE = 4;

const controlTransferGetReport = 0x01;
const controlTransferSetReport = 0x09;
const controlTransferOutReport = 0x200;
const controlTransferInReport = 0x100;

const DAPOutReportRequest = {
    requestType: "class",
    recipient: "interface",
    request: controlTransferSetReport,
    value: controlTransferOutReport,
    index: MICROBIT_DAP_INTERFACE
}

const DAPInReportRequest =  {
    requestType: "class",
    recipient: "interface",
    request: controlTransferGetReport,
    value: controlTransferInReport,
    index: MICROBIT_DAP_INTERFACE
}

// Callbacks:
//   1) onConnect
//   2) onDisconnect 
//   3) onData(Graph, Series, Data)
//   4) onConnectionFailure

const uBitCallbacks = {
    onConnect: function() {},
    onDisconnect: function() {},
    onData: function() {}, 
    onConnectionFailure: function() {}
}

function uBitSetCallbacks(onConnect, onDisconnect, onData, onConnectionFailure) {
    if(onConnect)
        uBitCallbacks.onConnect = onConnect
    if(onDisconnect)
        uBitCallbacks.onDisconnect = onDisconnect
    if(onData)
        uBitCallbacks.onData = onData
    if(onConnectionFailure)
        uBitCallbacks.onConnectionFailure = onConnectionFailure
}


// Add a delay() method to promises 
// NOTE: I found this on-line somewhere but didn't note the source and haven't been able to find it!
Promise.delay = function(duration){
    return new Promise(function(resolve, reject){
        setTimeout(function(){
            resolve();
        }, duration)
    });
}

var uBitConnectedDevice = null

function uBitConnectDevice(device) {

    function controlTransferOutFN(data) {
        return () => { return device.controlTransferOut(DAPOutReportRequest, data) }
    }

    var buffer=""
    var decoder = new TextDecoder("utf-8");

    var transferLoop = function () {
        device.controlTransferOut(DAPOutReportRequest, Uint8Array.from([0x83])) // DAP ID_DAP_Vendor3: https://github.com/ARMmbed/DAPLink/blob/0711f11391de54b13dc8a628c80617ca5d25f070/source/daplink/cmsis-dap/DAP_vendor.c
        .then(() => device.controlTransferIn(DAPInReportRequest, 64))
        .then((data) => { 
            if (data.status != "ok") {
                return Promise.delay(500).then(transferLoop);
            }
            // First byte is echo of get UART command


            let arr = new Uint8Array(data.data.buffer)
            if(arr.length<2)  // Not a valid array: Delay
                return Promise.delay(100).then(transferLoop)

            // Data: Process and get more
            var len = arr[1]  // Second byte is length of remaining message
            if(len==0) // If no data: delay
                return Promise.delay(20).then(transferLoop)
            
            var msg = arr.slice(2,2+len)
            let string =  decoder.decode(msg);
            buffer += string;
            var firstNewline = buffer.indexOf("\n")
            while(firstNewline>=0) {
                var messageToNewline = buffer.slice(0,firstNewline)

                // Deal with line
                // Parse data and add in time stamp
                uBitCallbacks.onData(messageToNewline)

                buffer = buffer.slice(firstNewline+1)
                firstNewline = buffer.indexOf("\n")
            }
            // Delay long enough for complete message
            return Promise.delay(5).then(transferLoop);
        })
        // Error here probably means micro:bit disconnected
        .catch(error => uBitCallbacks.onDisconnect(error));
    }

    device.open()
        .then(() => device.selectConfiguration(1))
        .then(() => device.claimInterface(4))
        .then(controlTransferOutFN(Uint8Array.from([2, 0])))  // Connect in default mode: https://arm-software.github.io/CMSIS_5/DAP/html/group__DAP__Connect.html
        .then(controlTransferOutFN(Uint8Array.from([0x11, 0x80, 0x96, 0x98, 0]))) // Set Clock: 0x989680 = 10MHz : https://arm-software.github.io/CMSIS_5/DAP/html/group__DAP__SWJ__Clock.html
        .then(controlTransferOutFN(Uint8Array.from([0x13, 0]))) // SWD Configure (1 clock turn around; no wait/fault): https://arm-software.github.io/CMSIS_5/DAP/html/group__DAP__SWD__Configure.html
        .then(controlTransferOutFN(Uint8Array.from([0x82, 0x00, 0xc2, 0x01, 0x00]))) // Vendor Specific command 2 (ID_DAP_Vendor2): https://github.com/ARMmbed/DAPLink/blob/0711f11391de54b13dc8a628c80617ca5d25f070/source/daplink/cmsis-dap/DAP_vendor.c ;  0x0001c200 = 115,200kBps
        .then( () => { uBitCallbacks.onConnect(); uBitConnectedDevice = device;  return Promise.resolve()}) 
        .then(transferLoop)
        .catch(error => uBitCallbacks.onConnectionFailure(error));
}

function uBitDisconnect() {
    if(uBitConnectedDevice)
        uBitConnectedDevice.close()
    uBitConnectedDevice = null;
}



function uBitSend(data) {
    // Need to sent 0x84 (command), length (including newline), data's caracters, newline
    let fullLine = data+'\n'
    let encoded = new TextEncoder("utf-8").encode(fullLine);
    let message = new Uint8Array(1+1+fullLine.length)
    message[0] = 0x84
    message[1] = encoded.length
    message.set(encoded, 2)
    uBitConnectedDevice.controlTransferOut(DAPOutReportRequest, message) // DAP ID_DAP_Vendor3: https://github.com/ARMmbed/DAPLink/blob/0711f11391de54b13dc8a628c80617ca5d25f070/source/daplink/cmsis-dap/DAP_vendor.c
}

function uBitGetDevices() { 
    uBitDisconnect()

    navigator.usb.requestDevice({filters: [{ vendorId: MICROBIT_VENDOR_ID, productId: 0x0204 }]})
        .then(  d => uBitConnectDevice(d) )
        .catch( () => uBitCallbacks.onConnectionFailure("No micro:bit Connected"))
}