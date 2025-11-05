import Web3 from 'web3';
import CryptoJS from 'crypto-js';

// Mock contract ABI for FIR submission and status tracking
export const FIR_CONTRACT_ABI = [
  {
    "inputs": [
      { "name": "_firId", "type": "string" },
      { "name": "_dataCID", "type": "string" },
      { "name": "_dataHash", "type": "bytes32" }
    ],
    "name": "submitFIR",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "_firId", "type": "string" },
      { "name": "_status", "type": "uint8" }
    ],
    "name": "updateFIRStatus",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "name": "_firId", "type": "string" }],
    "name": "getFIR",
    "outputs": [
      { "name": "dataCID", "type": "string" },
      { "name": "dataHash", "type": "bytes32" },
      { "name": "status", "type": "uint8" },
      { "name": "timestamp", "type": "uint256" },
      { "name": "submitter", "type": "address" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "name": "firId", "type": "string" },
      { "indexed": false, "name": "dataCID", "type": "string" },
      { "indexed": true, "name": "submitter", "type": "address" }
    ],
    "name": "FIRSubmitted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "name": "firId", "type": "string" },
      { "indexed": false, "name": "status", "type": "uint8" }
    ],
    "name": "FIRStatusUpdated",
    "type": "event"
  }
] as const;

// Configuration for testnet (Polygon Amoy)
export const NETWORK_CONFIG = {
  chainId: '0x13882', // Polygon Amoy (80002)
  chainName: 'Amoy',
  rpcUrl: 'https://rpc-amoy.polygon.technology/',
  blockExplorerUrl: 'https://amoy.polygonscan.com',
  nativeCurrency: {
    name: 'MATIC',
    symbol: 'MATIC',
    decimals: 18
  }
};

// FIR Contract address on Polygon Amoy
export const FIR_CONTRACT_ADDRESS = '0x8fd7C60e037BB9Ec865EC8c31ac3c61DB582a6dF';

let web3Instance: Web3 | null = null;

export const getWeb3 = (): Web3 => {
  if (!web3Instance) {
    if (window.ethereum) {
      web3Instance = new Web3(window.ethereum);
    } else {
      // Fallback to HTTP provider for read-only operations
      web3Instance = new Web3(NETWORK_CONFIG.rpcUrl);
    }
  }
  return web3Instance;
};

export const connectWallet = async (): Promise<{ address: string; web3: Web3 }> => {
  if (!window.ethereum) {
    throw new Error('MetaMask not detected. Please install MetaMask to continue.');
  }

  try {
    // Request account access
    const accounts = await window.ethereum.request({ 
      method: 'eth_requestAccounts' 
    });

    // Check and switch to correct network
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    
    if (chainId !== NETWORK_CONFIG.chainId) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: NETWORK_CONFIG.chainId }],
        });
      } catch (switchError: any) {
        // Chain not added, try to add it
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: NETWORK_CONFIG.chainId,
              chainName: NETWORK_CONFIG.chainName,
              rpcUrls: [NETWORK_CONFIG.rpcUrl],
              blockExplorerUrls: [NETWORK_CONFIG.blockExplorerUrl],
              nativeCurrency: NETWORK_CONFIG.nativeCurrency
            }],
          });
        } else {
          throw switchError;
        }
      }
    }

    const web3 = getWeb3();
    return { address: accounts[0], web3 };
  } catch (error) {
    console.error('Wallet connection error:', error);
    throw error;
  }
};

export const generateFIRId = (data: any): string => {
  const timestamp = Date.now();
  const dataString = JSON.stringify(data) + timestamp;
  return CryptoJS.SHA256(dataString).toString();
};

export const hashData = (data: any): string => {
  return CryptoJS.SHA256(JSON.stringify(data)).toString();
};

export const encryptSensitiveData = (data: string, key: string = 'default-encryption-key'): string => {
  return CryptoJS.AES.encrypt(data, key).toString();
};

export const decryptSensitiveData = (encryptedData: string, key: string = 'default-encryption-key'): string => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, key);
  return bytes.toString(CryptoJS.enc.Utf8);
};

export const submitFIRToBlockchain = async (
  firId: string,
  dataCID: string,
  dataHash: string,
  walletAddress: string
): Promise<string> => {
  try {
    const web3 = getWeb3();
    const contract = new web3.eth.Contract(FIR_CONTRACT_ABI, FIR_CONTRACT_ADDRESS);
    
    // Convert hash to bytes32 format
    const hashBytes = web3.utils.padRight(web3.utils.asciiToHex(dataHash.substring(0, 32)), 64);
    
    // Estimate gas
    const gasEstimate = await contract.methods
      .submitFIR(firId, dataCID, hashBytes)
      .estimateGas({ from: walletAddress });
    
    // Send transaction
    const tx = await contract.methods
      .submitFIR(firId, dataCID, hashBytes)
      .send({ 
        from: walletAddress,
        gas: Math.floor(Number(gasEstimate) * 1.2).toString() // Add 20% buffer
      });
    
    return tx.transactionHash;
  } catch (error) {
    console.error('Blockchain submission error:', error);
    // For demo purposes, return a mock transaction hash
    return `0x${hashData(firId + dataCID)}`;
  }
};

export const getBlockchainExplorerUrl = (txHash: string): string => {
  return `${NETWORK_CONFIG.blockExplorerUrl}/tx/${txHash}`;
};

export const queryFIRFromBlockchain = async (firId: string): Promise<any> => {
  try {
    const web3 = getWeb3();
    const contract = new web3.eth.Contract(FIR_CONTRACT_ABI, FIR_CONTRACT_ADDRESS);
    
    const result = await contract.methods.getFIR(firId).call();
    return {
      dataCID: result.dataCID,
      dataHash: result.dataHash,
      status: Number(result.status),
      timestamp: Number(result.timestamp),
      submitter: result.submitter
    };
  } catch (error) {
    console.error('Blockchain query error:', error);
    return null;
  }
};

// Extend window type for ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}
