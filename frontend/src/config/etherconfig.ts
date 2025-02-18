import { ethers } from "ethers";
const sepoliaRpcUrl = "https://ethereum-sepolia-rpc.publicnode.com"; // or your Infura/Alchemy endpoint

const provider = new ethers.JsonRpcProvider(sepoliaRpcUrl)

export default provider;
