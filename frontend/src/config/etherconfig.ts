import { ethers } from "ethers";
const sepoliaRpcUrl = "https://ethereum-sepolia-rpc.publicnode.com"; // or your Infura/Alchemy endpoint
const ETHRegisterController="0xFED6a969AaA60E4961FCD3EBF1A2e8913ac65B72";

const provider = new ethers.JsonRpcProvider(sepoliaRpcUrl)

export default provider;
export { ETHRegisterController };
