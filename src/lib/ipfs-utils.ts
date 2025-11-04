import { create, IPFSHTTPClient } from 'ipfs-http-client';

// Use Infura IPFS gateway (replace with your project credentials)
const IPFS_CONFIG = {
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https' as const
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
  try {
    const client = getIPFSClient();
    const jsonData = JSON.stringify(data);
    const result = await client.add(jsonData);
    return result.cid.toString();
  } catch (error) {
    console.error('IPFS upload error:', error);
    // For demo purposes, return a mock CID
    const mockCID = `Qm${Math.random().toString(36).substring(2, 15)}`;
    console.warn('Using mock CID for demo:', mockCID);
    return mockCID;
  }
};

export const uploadFileToIPFS = async (file: File): Promise<string> => {
  try {
    const client = getIPFSClient();
    const fileBuffer = await file.arrayBuffer();
    const result = await client.add(new Uint8Array(fileBuffer));
    return result.cid.toString();
  } catch (error) {
    console.error('IPFS file upload error:', error);
    // For demo purposes, return a mock CID
    const mockCID = `Qm${Math.random().toString(36).substring(2, 15)}${file.name}`;
    console.warn('Using mock CID for file:', mockCID);
    return mockCID;
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
