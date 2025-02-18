import { ethers } from "ethers";
const sepoliaRpcUrl = "https://ethereum-sepolia-rpc.publicnode.com";

const provider = new ethers.JsonRpcProvider(sepoliaRpcUrl)

export default provider;
