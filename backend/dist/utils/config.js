"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pinata = void 0;
const pinata_web3_1 = require("pinata-web3");
exports.pinata = new pinata_web3_1.PinataSDK({
    pinataJwt: `${process.env.PINATA_JWT}`,
    pinataGateway: `${process.env.PINATA_GATEWAY_URL}`,
});
