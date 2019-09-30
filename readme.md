
# Setup

1. Install a local web server
   1. Python 3 / Python: Use `pip` or `pip3` to install the `http` package.
   2. Run the `http.server` module in the directory containing the project:  `python -m http.server` or `python3 -m http.server` as appropriate.
   
# Use

1. Open browser to [http://localhost:8000/page.html](http://localhost:8000/page.html)
2. Click on "start"
3. Open the inspector to see events.

# Sample Code for Micro:Bit

~~~javascript
basic.forever(function () {
    serial.writeLine("Hi...")
    serial.writeValue("x", input.acceleration(Dimension.X))
})
~~~

# One-time Micro:Bit configuration

Upgrade the micro:bit firmware as describe at: [Updating your micro:bit firmware
](https://microbit.org/guide/firmware/)

# Micro:bit program configuration

The micro:bit retains it's program until it is explicitly re-programmed or the firmware is upgraded. The program below will send serial data and can be used for initial testing/debugging. 

1. Connect USB cable
2. Open the [MakeCode Editor](https://makecode.microbit.org/#editor)
3. Select JavaScript from the Blocks/JavaScript slider.
4. Paste in the code above
5. Select the Gear Menu in the upper right
6. Select the `Pair Device` option
7. Select the Micro:bit device
8. Download the code (Blue Download button at the bottom of the window)
9. Unplug/replug Micro:bit (to Un-Pair device)

# API

# Credits

* Basic HTML page layout from W3 schools: [https://www.w3schools.com/html/html5_intro.asp](https://www.w3schools.com/html/html5_intro.asp)