console.log("Loading..")

const MICROBIT_VENDOR_ID = 0x0d28
const MICROBIT_PRODUCT_ID = 0x0204


Promise.delay = function(duration){
    return new Promise(function(resolve, reject){
        setTimeout(function(){
            resolve();
        }, duration)
    });
}
var dev; 

// Based on https://github.com/microsoft/pxt/blob/83dcac3c75b8681cd2451919840a297d7e0b3c20/pxtlib/webusb.ts
function recvPacketAsync() {
    console.log(3); 
    return dev.controlTransferIn({
        requestType: 'class',
        recipient: 'interface',
        request: 0x01,
        value: 0x100,
        // request: 0x22,
        // value: 0x01,
        index: 2},64)
}

function recvPacketAsync2() {
   // console.log(3.1); 
    return dev.transferIn(4, 64)
}

function receiveLoop(result) {
//        console.log('Received: ');
        console.dir(result)

        if (result.status != "ok") {
            console.log("USB IN transfer failed")
            return Promise.delay(500).then(recvPacketAsync2).then(receiveLoop)
        }

        let arr = new Uint8Array(result.data.buffer)
        if(arr.length>0) {
            // Data: Process and get more
            console.dir(arr)
            return recvPacketAsync2().then(receiveLoop)
        } else {
            return Promise.delay(500).then(recvPacketAsync2).then(receiveLoop)
        }
}

function connectDevice(device) {
    console.log("Connecting")
    console.dir(device)
//            (navigator as any).usb.addEventListener('disconnect', (event: any) => {

// NOTES: 
//  Works when running Arduino FIRST.  Must be a config / control transfer thing...
dev = device;
    device.open()
        .then(() => {console.log(1) ; return device.selectConfiguration(1)} ) // Select configuration #1 for the device.
        .then(() => {console.log(2); return device.claimInterface(2)}) // Request exclusive control over interface #2.
       // .then(() => {console.log(2); device.selectAlternateInterface(2,0)}) // Request exclusive control over interface #2.
        // .then(() => {console.log(3); return device.controlTransferOut({
        //                     requestType: 'class',
        //                     recipient: 'interface',
        //                     request: 0x22,
        //                     value: 0x01,
        //                     index: 0x02})}) // Ready to receive data
        .then(recvPacketAsync) // Ready to receive data
        //.then(() => {console.log(4); return device.transferIn(4, 64)}) // Waiting for 64 bytes of data from endpoint #5.
        .then(recvPacketAsync2)
        .then(receiveLoop)
        .catch(error => { console.log(error); });
}

function getDevices() {
    navigator.usb.requestDevice({filters: [{ vendorId: MICROBIT_VENDOR_ID, productId: 0x0204 }]})
        .then(  d => connectDevice(d) )
        .catch( () => console.log("Failed to find Micro:bit.  Is it plugged in? Did you pick it and select connect?"))
}