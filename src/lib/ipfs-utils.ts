import { supabase } from '@/integrations/supabase/client';

// Public IPFS gateway for reading (Pinata)
const IPFS_GATEWAY = 'https://gateway.pinata.cloud/ipfs/';

export const uploadToIPFS = async (data: any): Promise<string> => {
  try {
    console.log('Uploading data to IPFS via Pinata...');
    
    const { data: result, error } = await supabase.functions.invoke('upload-to-ipfs', {
      body: {
        data,
        name: `FIR_${Date.now()}`
      },
    });

    if (error) {
      console.error('IPFS upload error:', error);
      throw error;
    }

    if (!result?.cid) {
      throw new Error('No CID returned from upload');
    }

    console.log('Successfully uploaded to IPFS, CID:', result.cid);
    return result.cid;
  } catch (error) {
    console.error('Failed to upload to IPFS:', error);
    throw new Error('Failed to upload data to IPFS');
  }
};

export const uploadFileToIPFS = async (file: File): Promise<string> => {
  try {
    console.log('Uploading file to IPFS via Pinata:', file.name);
    
    const formData = new FormData();
    formData.append('file', file);

    // Call edge function with FormData
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/upload-to-ipfs`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('File upload error:', error);
      throw new Error(`File upload failed: ${error}`);
    }

    const result = await response.json();
    
    if (!result?.cid) {
      throw new Error('No CID returned from file upload');
    }

    console.log('Successfully uploaded file to IPFS, CID:', result.cid);
    return result.cid;
  } catch (error) {
    console.error('Failed to upload file to IPFS:', error);
    throw new Error('Failed to upload file to IPFS');
  }
};

export const uploadMultipleFilesToIPFS = async (files: File[]): Promise<string[]> => {
  const uploadPromises = files.map(file => uploadFileToIPFS(file));
  return Promise.all(uploadPromises);
};

export const fetchFromIPFS = async (cid: string): Promise<any> => {
  try {
    console.log('Fetching from IPFS via Pinata gateway:', cid);
    const response = await fetch(`${IPFS_GATEWAY}${cid}`);
    
    if (!response.ok) {
      throw new Error(`Gateway fetch failed: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('IPFS fetch error:', error);
    throw new Error('Failed to retrieve data from IPFS');
  }
};

export const getIPFSGatewayUrl = (cid: string): string => {
  return `${IPFS_GATEWAY}${cid}`;
};

export const pinToIPFS = async (cid: string): Promise<boolean> => {
  // Pinata automatically pins all uploaded content
  console.log('Content is automatically pinned by Pinata:', cid);
  return true;
};
