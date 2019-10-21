
# uBitWebUSB

JavaScript functions for interacting with micro:bit microcontrollers over WebUSB
(Only works in Chrome browsers;  Pages must be either HTTPS or local to have permission to access USB)

Main functions are: 

1. [`uBitConnectDevice(callback)`](./global.html#uBitConnectDevice):  Prompt user to connect to device and provide callback function for device events
   * See [`uBitEventCallback`](./global.html#uBitEventCallback) for callback format and argument descriptions.
2. [`uBitSend(device)`](./global.html#uBitSend): Send data (a `string`) to a micro:bit
3. [`uBitDisconnect(device)`](./global.html#uBitDisconnect): Disconnect from the designated `micro:bit`
