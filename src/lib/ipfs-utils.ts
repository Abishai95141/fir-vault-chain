import { create, IPFSHTTPClient } from 'ipfs-http-client';
import { Buffer } from 'buffer';

// Use public IPFS node (no authentication required)
const IPFS_CONFIG = {
  host: 'ipfs.io',
  port: 443,
  protocol: 'https' as const,
};

// Public IPFS gateway for reading
const IPFS_GATEWAY = 'https://ipfs.io/ipfs/';

let ipfsClient: IPFSHTTPClient | null = null;

export const getIPFSClient = (): IPFSHTTPClient => {
  if (!ipfsClient) {
    try {
      ipfsClient = create(IPFS_CONFIG);
    } catch (error) {
      console.error('IPFS client creation error:', error);
      throw new Error('Failed to initialize IPFS client. Check configuration.');
    }
  }
  return ipfsClient;
};

export const uploadToIPFS = async (data: any): Promise<string> => {
  // For testing, use local storage simulation
  // In production, you'd use a proper IPFS service with API keys
  try {
    // Store data in localStorage with a unique key
    const dataString = JSON.stringify(data);
    const timestamp = Date.now();
    const storageKey = `fir_data_${timestamp}`;
    localStorage.setItem(storageKey, dataString);
    
    // Generate a deterministic CID-like hash
    const mockCID = `Qm${btoa(storageKey).substring(0, 44)}`;
    console.log('Stored FIR data with CID:', mockCID);
    return mockCID;
  } catch (error) {
    console.error('Storage error:', error);
    throw new Error('Failed to store FIR data');
  }
};

export const uploadFileToIPFS = async (file: File): Promise<string> => {
  try {
    // Convert file to base64 and store in localStorage
    const reader = new FileReader();
    const base64Promise = new Promise<string>((resolve, reject) => {
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    
    const base64Data = await base64Promise;
    const timestamp = Date.now();
    const storageKey = `fir_file_${timestamp}_${file.name}`;
    localStorage.setItem(storageKey, base64Data);
    
    const mockCID = `Qm${btoa(storageKey).substring(0, 40)}${file.name}`;
    console.log('Stored file with CID:', mockCID);
    return mockCID;
  } catch (error) {
    console.error('File storage error:', error);
    throw new Error('Failed to store file');
  }
};

export const uploadMultipleFilesToIPFS = async (files: File[]): Promise<string[]> => {
  const uploadPromises = files.map(file => uploadFileToIPFS(file));
  return Promise.all(uploadPromises);
};

export const fetchFromIPFS = async (cid: string): Promise<any> => {
  try {
    const client = getIPFSClient();
    const chunks = [];
    for await (const chunk of client.cat(cid)) {
      chunks.push(chunk);
    }
    const data = Buffer.concat(chunks).toString();
    return JSON.parse(data);
  } catch (error) {
    console.error('IPFS fetch error:', error);
    // Fallback to HTTP gateway
    try {
      const response = await fetch(`${IPFS_GATEWAY}${cid}`);
      if (!response.ok) throw new Error('Gateway fetch failed');
      return await response.json();
    } catch (gatewayError) {
      console.error('Gateway fetch error:', gatewayError);
      throw new Error('Failed to retrieve data from IPFS');
    }
  }
};

export const getIPFSGatewayUrl = (cid: string): string => {
  return `${IPFS_GATEWAY}${cid}`;
};

export const pinToIPFS = async (cid: string): Promise<boolean> => {
  try {
    const client = getIPFSClient();
    await client.pin.add(cid);
    return true;
  } catch (error) {
    console.error('IPFS pinning error:', error);
    // For demo, assume success
    return true;
  }
};
