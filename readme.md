
# Overall Setup

1. Upgrade Micro:bit to latest firmware
2. Setup a Web Server
3. Program the Micro:bit with one of the example programs that generates serial data


# Web Server Setup

1. Install a local web server
   1. Python 3 / Python: Use `pip` or `pip3` to install the `http` package.
   2. Run the `http.server` module in the directory containing the project:  `python -m http.server` or `python3 -m http.server` as appropriate.

# Accessing the Served Page

1. Open browser to [http://localhost:8000/page.html](http://localhost:8000/page.html) (Default page for Python Server)
2. Click on "go"

## One-time Micro:Bit configuration

Upgrade the micro:bit firmware as describe at: [Updating your micro:bit firmware
](https://microbit.org/guide/firmware/)

## Micro:bit program from Shared Project

1. Open [https://makecode.microbit.org/_20p49eD2uRiP](https://makecode.microbit.org/_20p49eD2uRiP)
2. Select the Gear Menu in the upper right
3. Select the `Pair Device` option
4. Select `Pair Device`
5. Select the Micro:bit device
6. Download the code (Blue Download button at the bottom of the window)
7. Unplug/re-plug Micro:bit (to Un-Pair device)

# Micro:bit program configuration from JavaScript Source

The micro:bit retains it's program until it is explicitly re-programmed or the firmware is upgraded. The program below will send serial data and can be used for initial testing/debugging. 

1. Connect USB cable
2. Open the [MakeCode Editor](https://makecode.microbit.org/#editor)
3. Select JavaScript from the Blocks/JavaScript slider.
4. Paste in the code above
            ```javascript
            basic.forever(function () {
                serial.writeLine("message")
                serial.writeValue("x", Math.map(Math.randomRange(0, 100), 0, 100, -2.4, 18.2))
                serial.writeValue("y", Math.randomRange(0, 10))
                basic.pause(500)
            })
            ```
5. Select the Gear Menu in the upper right
6. Select the `Pair Device` option
7. Select `Pair Device`
8. Select the Micro:bit device
9. Download the code (Blue Download button at the bottom of the window)
10. Unplug/re-plug Micro:bit (to Un-Pair device)

# API

# Credits

* Basic HTML page layout from W3 schools: [https://www.w3schools.com/html/html5_intro.asp](https://www.w3schools.com/html/html5_intro.asp)

# Capturing All USB functions in JavaScript

This can be done to identify all the messages being sent to a USB device from a WebUSB page, like [MakeCode](http://makecode.microbit.org)

1. Open the page in question
2. Open the JavaScript console (Inspect the page via developer tools;  Right-click on page and select Insepct)
3. Paste in the following code, which adds a debugging print message to all calls to most USB functions
            ```javascript
var trackerLogOn = true;

function addTracker(methodName, object) {
    var temp = object[methodName];
    object[methodName] = function() {
        if(trackerLogOn) {
            console.log(methodName + ":");
            console.dir(arguments);
            console.log("----------------")
        }
        // this is a USBDevice object
        return temp.apply(this, arguments)
    }
}

addTracker("claimInterface",USBDevice.prototype)
addTracker("selectAlternateInterface", USBDevice.prototype)
addTracker("controlTransferIn", USBDevice.prototype)
addTracker("controlTransferOut", USBDevice.prototype)
addTracker("transferIn", USBDevice.prototype)
addTracker("transferOut", USBDevice.prototype)
addTracker("selectConfiguration", USBDevice.prototype)
addTracker("isochronousTransferIn", USBDevice.prototype)
addTracker("isochronousTransferOut", USBDevice.prototype)
            ```
4. Use the page to trigger USB operations
5. Enter `trackerLogOn = false` in the Console to stop collecting data, then scroll back and examine all messages/traffic.

# Capturing USB Packets on Mac

Based on [https://www.umpah.net/how-to-sniff-usb-traffic-reverse-engineer-usb-device-interactions/](https://www.umpah.net/how-to-sniff-usb-traffic-reverse-engineer-usb-device-interactions/)

Enable virtual port for monitoring:

```
sudo ifconfig XHC20 up
```

(`sudo ifconfig XHC20 down` when done)

Use Wireshark for capture.  Filter based on device's location ID (get it from Apple Menu, `About this Mac...`, `System Report`, `USB`, select the device and look at the Loation ID): `usb.darwin.location_id == 0x14200000`

* Start port capture of XH20 interface (wired)

# Misc: App Notes / Docs on USB replacing Serial

* [http://ww1.microchip.com/downloads/en/appnotes/doc4322.pdf](http://ww1.microchip.com/downloads/en/appnotes/doc4322.pdf)
* [https://www.xmos.com/download/AN00124:-USB-CDC-Class-as-Virtual-Serial-Port(2.0.2rc1).pdf](https://www.xmos.com/download/AN00124:-USB-CDC-Class-as-Virtual-Serial-Port(2.0.2rc1).pdf)
  * Section on USB descriptors helpful
* [https://github.com/microsoft/pxt/blob/83dcac3c75b8681cd2451919840a297d7e0b3c20/pxtlib/webusb.ts](https://github.com/microsoft/pxt/blob/83dcac3c75b8681cd2451919840a297d7e0b3c20/pxtlib/webusb.ts)
  * Micro:bit webusb connection 

# Misc: USB Enumeration for Micro:Bit and communication details

* 0: USBInterface ***USB Mass Storage***
  * interfaceClass: 8  
  * interfaceProtocol: 80
  * interfaceSubclass: 6
  * interfaceNumber: 0
* 1: USBInterface ***CDC Control***
  * interfaceClass: 2  
  * interfaceProtocol: 1
  * interfaceSubclass: 2
  * interfaceNumber: 1
* 2: USBInterface ***CDC - Data***
  * interfaceClass: 10
  * interfaceProtocol: 0
  * interfaceSubclass: 0
  * interfaceNumber: 2
* 3: USBInterface
  * interfaceNumber: 3
* 4: USBInterface ***CMSIS-DAP***
  * interfaceNumber: 4

Most interactions utilize the CMSIS-DAP interface. See [https://arm-software.github.io/CMSIS_5/DAP/html/index.html](https://arm-software.github.io/CMSIS_5/DAP/html/index.html)

## Serial Data

Serial Data is sent via CMSIS-DAP [Vendor Commands](https://arm-software.github.io/CMSIS_5/DAP/html/group__DAP__Vendor__gr.html#details)

Source code for Vendor Specific commands is at [https://github.com/ARMmbed/DAPLink/blob/0711f11391de54b13dc8a628c80617ca5d25f070/source/daplink/cmsis-dap/DAP_vendor.c](https://github.com/ARMmbed/DAPLink/blob/0711f11391de54b13dc8a628c80617ca5d25f070/source/daplink/cmsis-dap/DAP_vendor.c)









# Example to `ControlTransferOut`

controlTransferOut: (`set_report`)
Arguments(2)
0: {requestType: "class", recipient: "interface", request: 9, value: 512, index: 4}
index: 4
recipient: "interface"
request: 9
requestType: "class"
value: 512

controlTransferIn: (`get_report_req`)
Arguments(2)
0: {requestType: "class", recipient: "interface", request: 1, value: 256, index: 4}
1: 64

This is a DAPLink HID request [https://github.com/ARMmbed/DAPLink/blob/b4c90ae660c0067151b22129be350e29cb47a982/test/usb_hid.py](https://github.com/ARMmbed/DAPLink/blob/b4c90ae660c0067151b22129be350e29cb47a982/test/usb_hid.py) (a `set_report_req`)

It looks like this is a DAPLink Serial Wire Out (SWO): [https://arm-software.github.io/CMSIS_5/DAP/html/group__DAP__swo__gr.html](https://arm-software.github.io/CMSIS_5/DAP/html/group__DAP__swo__gr.html)





Setup: [https://arm-software.github.io/CMSIS_5/DAP/html/group__DAP__SWD__Configure.html](https://arm-software.github.io/CMSIS_5/DAP/html/group__DAP__SWD__Configure.html)

DAP_SWJ_CLOCK
[17,128,150,152,0]

DAP_Connect
[2,0]

DAP_TransferConfigure
[4, 0, 80, 0, 0, 0]

SWD Configure
[19, 0]


[18, 56, 255, 255, 255, 255, 255, 255, 255]  // DAP_SWJ_Sequence
[18, 16, 158, 231]
 [18, 8, 0]

DAP_Transfer
[5, ...]
...

[130, 0, 194, 1, 0]      // Set UART Config [https://github.com/ARMmbed/DAPLink/blob/0711f11391de54b13dc8a628c80617ca5d25f070/source/daplink/cmsis-dap/DAP_vendor.c](https://github.com/ARMmbed/DAPLink/blob/0711f11391de54b13dc8a628c80617ca5d25f070/source/daplink/cmsis-dap/DAP_vendor.c)
[0, 254]                  // DAP_Info / Get Packet Size
[17, 128, 150, 152, 0]   // DAP_SWJ_Clock
[2, 0]                  // DAP_Connect Defaults
[17, 128, 150, 152, 0]   // DAP_SWJ_Clock
[4, 0, 80, 0, 0, 0]      // DAP_TransferConfigure 
[19, 0]                  // DAP_SWD_Configure default
[18, 56, 255, 255, 255, 255, 255, 255, 255]  // DAP_SWJ_Sequence

...
[5, 0, 1, 2]


[131] = uart read



DAP Link Vendo Stuff : [https://arm-software.github.io/CMSIS_5/DAP/html/group__DAP__Info.html](https://arm-software.github.io/CMSIS_5/DAP/html/group__DAP__Info.html)


# DAP UART Packets

Being read from `ID_DAP_Vendor3`.  Based on [https://github.com/ARMmbed/DAPLink/blob/0711f11391de54b13dc8a628c80617ca5d25f070/source/daplink/cmsis-dap/DAP_vendor.c](https://github.com/ARMmbed/DAPLink/blob/0711f11391de54b13dc8a628c80617ca5d25f070/source/daplink/cmsis-dap/DAP_vendor.c)

Packed format: 
1. First byte is echo back of command (i.e., `131` decimal)
2. Second Byte is length of message, `len`
3. Bytes [2..2+len) are the actual bytes of the messages

Misc: Lines are delimited by newline character (`\n`)