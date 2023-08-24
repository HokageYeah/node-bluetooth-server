import BluetoothSerialPort from "node-bluetooth-serial-port";
import { stringToBuffer } from "../utils.js";
interface Defer {
    reject: (reason?: any) => void;
    resolve: (value: unknown) => void;
    promise: Promise<unknown>;
    new (): Defer;
}
function Defer(this: Defer) {
  this.promise = new Promise((resolve, reject) => {
    this.resolve = resolve;
    this.reject = reject;
  });
}
function sleep(ms: number | undefined) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
export class Bluetooth {
  private _config: {
    deviceMAC: any;
    connectionTimeout: any;
    maxConnectAttempts: any;
    connectionAttemptDelay: any;
  };
  private _dataBuffer: any[];
  server: BluetoothSerialPort.BluetoothSerialPort;
    private _defer: any;
  constructor({
    deviceMAC,
    connectionTimeout,
    maxConnectAttempts,
    connectionAttemptDelay,
  }: any) {
    this._config = {
      deviceMAC,
      connectionTimeout,
      maxConnectAttempts,
      connectionAttemptDelay,
    };
    this._dataBuffer = [];
    this.server = new BluetoothSerialPort.BluetoothSerialPort();
  }
  async connect(times = this._config.maxConnectAttempts) {
    const { connectionAttemptDelay } = this._config;
    let attempts = 0;
    for (let i = 0; i < times; i += 1) {
      try {
        console.log("connection attempt %d/%d", attempts, times); // eslint-disable-next-line no-await-in-loop
        await this._connect();
        break;
      } catch (error: any) {
        console.error("error", error.message);
        attempts++; // eslint-disable-next-line no-await-in-loop
        await sleep(connectionAttemptDelay);
      }
    }
    await sleep(500); // wait for device ready
    return this.server;
  }
  _connect() {
    const { deviceMAC, connectionTimeout } = this._config;
    const server = this.server;
    return new Promise((resolve, reject) => {
      // Find the device
      setTimeout(() => {
        reject(new Error("Connection timeout"));
      }, connectionTimeout);
      server.findSerialPortChannel(
        deviceMAC,
        (channel) => {
          // Connect to the device
          server.connect(
            deviceMAC,
            channel,
            () => {
              // We connected, resolve
              resolve(server);
            },
            () => reject(new Error("Cannot connect"))
          );
        },
        () => reject(new Error("Not found"))
      );
    });
  }
  /**
   * Write a buffer to the device
   */
  write(buffer: undefined) {
    const server = this.server;
    return new Promise((resolve, reject) => {
      server.write(buffer, (error) => {
        console.log("==>", error, buffer);
        if (error) {
          server.close(); // 重新连接
          this.connect(1000).then(() => {
            console.log("reconnected!");
            this.write(buffer);
          });
        }
        return error ? reject(error) : resolve('bytes');
      });
    });
  }
  async writeMessage(command: any) {
    const buffers = stringToBuffer(command) as Array<any>;
    const status = [];
    const len = this._dataBuffer.length;
    this._dataBuffer.push(...buffers);
    if (len === 0) {
      this._defer = new (Defer as any)(); // eslint-disable-next-line no-restricted-syntax
      do {
        const buffer = this._dataBuffer.shift(); // eslint-disable-next-line no-await-in-loop
        status.push(await this.write(buffer));
      } while (this._dataBuffer.length > 0);
      this._defer.resolve();
      this._defer = null;
    } else {
      await this._defer.promise;
    }
    return status;
  }
  async disconnect() {
    if (this._defer) await this._defer.promise;
    this.server.close();
  }
}
