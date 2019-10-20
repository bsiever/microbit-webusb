
# Overall Setup

1. Upgrade Micro:bit to latest firmware
2. Program the Micro:bit with one of the example programs that generates serial data
3. Setup a Web Server & Open the project's page

## Upgrade Micro:bit to latest firmware

This should only be needed one time for each micro:bit.

Upgrade the micro:bit firmware as describe at: [Updating your micro:bit firmware
](https://microbit.org/guide/firmware/)

## Program the Micro:bit from Shared Project

1. Plug the Micro:bit into the computer
2. Open [https://makecode.microbit.org/_Pya288iq3eo2](https://makecode.microbit.org/_Pya288iq3eo2)
3. Select the Gear Menu in the upper right
4. Select the `Pair Device` option
5. Select `Pair Device`
6. Select the Micro:bit device
7. Download the code (Blue Download button at the bottom of the window)
8. Unplug/re-plug Micro:bit (to Un-Pair device)

The micro:bit retains it's program until it is explicitly re-programmed or the firmware is upgraded. This programming process won't need to be repeated unless a different program is desired (which may be needed to demonstrate different the different ways to annotate graphs)

## Program the Micro:bit from JavaScript Source

This is an alternative to the above.  Either can be done, but there's no reason to do both.  

The program below will send serial data and can be used for initial testing/debugging.

1. Connect USB cable
2. Open the [MakeCode Editor](https://makecode.microbit.org/#editor)
3. Select JavaScript from the Blocks/JavaScript slider.
4. Paste in the code above
            ```javascript
            serial.onDataReceived(serial.delimiters(Delimiters.NewLine), function () {
                serial.writeLine("echo " + serial.readUntil(serial.delimiters(Delimiters.NewLine)))
            })
            basic.forever(function () {
                serial.writeValue("x", Math.map(Math.randomRange(0, 100), 0, 100, -2.4, 18.2))
                serial.writeValue("y data", Math.randomRange(0, 10))
                serial.writeValue("graph2.a", Math.randomRange(-5, 10))
                serial.writeValue("graph2.b data", Math.randomRange(-5, 10))
                if (Math.randomRange(0, 10) == 5) {
                    serial.writeLine("x:\"Hi\"")
                }
                if (Math.randomRange(0, 50) == 5) {
                    serial.writeLine("console log")
                }
                basic.pause(500)
            })
            ```
5. Select the Gear Menu in the upper right
6. Select the `Pair Device` option
7. Select `Pair Device`
8. Select the Micro:bit device
9. Download the code (Blue Download button at the bottom of the window)
10. Unplug/re-plug Micro:bit (to Un-Pair device)

# Setup a Web Server

1. Install a local web server
   1. Python 3 / Python: Use `pip` or `pip3` to install the `http` package. (ex: Open a terminal window / command prompt and run `pip install http`)
   2. Run the `http.server` module in the directory containing the project:  `python -m http.server` or `python3 -m http.server` as appropriate.

## Open the project's page

1. Open browser to [http://localhost:8000/page.html](http://localhost:8000/page.html) (Default page for Python Server)
2. Make sure the micro:bit is connected via the USB cable
3. Click on `Connect`
4. Select the micro:bit from the pop-up menu that appears

# API

There are four main functions:
1. `uBitConnectDevice(callback)`
2. `uBitSend(device)`
3. `uBitDisconnect(device)`


## Graph Message Types and Formats

Data may be shown in a combination of zero or more graphs that show a single series and zero or more graphs that show multiple series. There may also be "events" (descriptive items with a string)

The number of graphs and series will now be known in advance.  It must be determined from the streaming data.

## Values for a graph with a single series

Format: `NAME:NUMBER`
* `NAME` is a string name of the graph (and the name of the series)
* `NUMBER` is a numeric value to graph
  
Format: `NAME:STRING`
* `NAME` is a string name of the graph
* `String` is a string for an event

## Values for a graph with multiple series

Format: `NAME.SERIES:NUMBER`
* `NAME` is a string name of the graph (and the name of the series)
* `SERIES` is a string name of the series for the data
* `NUMBER` is a numeric value to graph
  
Format: `NAME.SERIES:STRING`
* `NAME` is a string name of the graph
* `SERIES` is a string name of the series for the data
* `String` is a string for an event

## Console messages

Any message that doesn't start with a key should be treated as a console message and logged to a window. Ex: `This is a message`

# USB & Console Data

The micro:bit console messages (`serial write` blocks and `serial.*` TypeScript commands) are directed over the USB interface.  They actually go through ARM's [CMSIS-DAP](https://arm-software.github.io/CMSIS_5/DAP/html/index.html). DAP is described as:
> CMSIS-DAP is a specification and a implementation of a Firmware that supports access to the CoreSight Debug Access Port (DAP).

DAP has several [well defined commands](https://arm-software.github.io/CMSIS_5/DAP/html/group__DAP__Commands__gr.html) as well as the ability to support custom vendor commands.  Messages begin with a byte indicating the command type.  The firmware in the micro:bit supports two custom messages that are used to configure the baud rate ()

## USB Configuration Sequence

Immediately after connection to micro:bit (this assumes the connected device is a micro:bit and all control transfers in/out go to endpoint 4, the CMSIS-DAP endpoint):

1. Select device configuration 1
2. Claim interface 4 (CMSIS-DAP)
3. Control Transfer Out [`DAP_Connect`](https://arm-software.github.io/CMSIS_5/DAP/html/group__DAP__Connect.html) to default (connect the default device)
   * Bytes: `[2, 0]`
4. Control Transfer Out [`DAP_SWJ_Clock`](https://arm-software.github.io/CMSIS_5/DAP/html/group__DAP__SWJ__Clock.html) to 10MHz
   * Bytes: `[0x11, 0x80, 0x96, 0x98, 0]`
5. Control Transfer Out [`DAP_SWD_Configure`](https://arm-software.github.io/CMSIS_5/DAP/html/group__DAP__SWD__Configure.html) to configure the software debug (1 clock turn around, no Wait/Fault phases)
   * Bytes: `[0x13, 0]]`
6. Control Transfer Out [DAP Vendor Specific Command (`ID_DAP_Vendor2` or `0x82`)](https://github.com/ARMmbed/DAPLink/blob/0711f11391de54b13dc8a628c80617ca5d25f070/source/daplink/cmsis-dap/DAP_vendor.c) to set the UART baud to 115,200bps
   * Bytes: `[[0x82, 0x00, 0xc2, 0x01, 0x00]`

## USB UART Data Read

1. Control Transfer Out [DAP Vendor Specific Command (`ID_DAP_VEndor3` or `0x83`)](https://github.com/ARMmbed/DAPLink/blob/0711f11391de54b13dc8a628c80617ca5d25f070/source/daplink/cmsis-dap/DAP_vendor.c) request UART data up to 64 bytes.
2. Control Transfer In of up to 64 bytes

## DAP UART Packets

Being read from `ID_DAP_Vendor3`.  Based on [https://github.com/ARMmbed/DAPLink/blob/0711f11391de54b13dc8a628c80617ca5d25f070/source/daplink/cmsis-dap/DAP_vendor.c](https://github.com/ARMmbed/DAPLink/blob/0711f11391de54b13dc8a628c80617ca5d25f070/source/daplink/cmsis-dap/DAP_vendor.c)

Packed format:

1. First byte is echo back of command (i.e., `0x83` or `131` decimal)
2. Second Byte is length of message, `len`
3. Bytes [2..2+len) are the actual bytes of the messages

Misc: Lines are delimited by newline character (`\n`)


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

Use Wireshark for capture.  Filter based on device's location ID (get it from Apple Menu, `About this Mac...`, `System Report`, `USB`, select the device and look at the Location ID): `usb.darwin.location_id == 0x14200000`

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

## Serial Data Details

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



DAP Link Vendor Stuff : [https://arm-software.github.io/CMSIS_5/DAP/html/group__DAP__Info.html](https://arm-software.github.io/CMSIS_5/DAP/html/group__DAP__Info.html)




# USB Misc

[http://www.usbmadesimple.co.uk/ums_3.htm](http://www.usbmadesimple.co.uk/ums_3.htm)

[http://markdingst.blogspot.com/2014/06/implementing-usb-communication-device.html](http://markdingst.blogspot.com/2014/06/implementing-usb-communication-device.html)




# TODOs

1. Charting libraries
2. Blurb
3. Project Page / Repos
4. Clean up Docs
5. Parsing
   Single call-back with type-tag/data  All have time-stamp (connect, disconnect, connectionFailure, console, graph-data(graph, series, data), graph-event(graph, series, event string));  Include device / multi-device
6. JSDoc 
7. GitHub page
