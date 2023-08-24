// https://github.com/RomRider/node-divoom-timebox-evo/blob/master/PROTOCOL.md
function int2hexlittle(value) {
  if (value > 65535 || value < 0) {
    throw new TypeError(
      "int2hexlittle only supports value between 0 and 65535"
    );
  }
  const byte1 = (value & 0xff).toString(16).padStart(2, "0");
  const byte2 = ((value >> 8) & 0xff).toString(16).padStart(2, "0");
  return `${byte1}${byte2}`;
}
const _START = "01";
const _END = "02";
export class TimeboxEvoMessage {
  constructor(msg = "") {
    this._message = null;
    this.append(msg);
  }
  _calcCRC() {
    if (!this._message) return undefined;
    const msg = this.lengthHS + this._message;
    let sum = 0;
    for (let i = 0, l = msg.length; i < l; i += 2) {
      sum += parseInt(msg.substr(i, 2), 16);
    }
    return sum % 65536;
  }
  get crc() {
    if (!this._message) return undefined;
    return this._calcCRC();
  }
  get crcHS() {
    if (!this._message) return undefined;
    return int2hexlittle(this.crc);
  }
  get length() {
    if (!this._message) return undefined;
    return (this._message.length + 4) / 2;
  }
  get lengthHS() {
    if (!this._message) return undefined;
    return int2hexlittle(this.length);
  }
  get payload() {
    return this._message;
  }
  set payload(payload) {
    this._message = payload;
  }
  get message() {
    if (!this._message) return undefined;
    return _START + this.lengthHS + this._message + this.crcHS + _END;
  }
  append(msg) {
    if (msg) {
      this._message = this._message
        ? this._message + msg.toLowerCase()
        : msg.toLowerCase();
    }
    return this;
  }
  prepend(msg) {
    if (msg) {
      this._message = this._message
        ? msg.toLowerCase() + this._message
        : msg.toLowerCase();
    }
    return this;
  }
  toString() {
    return this.message;
  }
}
