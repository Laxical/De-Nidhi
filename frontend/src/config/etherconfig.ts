import { ethers } from "ethers";
import ETHRegister from "./ethcontroller.json"
const sepoliaRpcUrl = "https://ethereum-sepolia-rpc.publicnode.com"; // or your Infura/Alchemy endpoint
const provider = new ethers.JsonRpcProvider(sepoliaRpcUrl)
export { ETHRegister ,provider};
