import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const PINATA_JWT = Deno.env.get('PINATA_JWT');
const PINATA_API_URL = 'https://api.pinata.cloud/pinning/pinJSONToIPFS';
const PINATA_FILE_URL = 'https://api.pinata.cloud/pinning/pinFileToIPFS';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const contentType = req.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      // Upload JSON data
      const { data, name } = await req.json();
      
      console.log('Uploading JSON to Pinata:', name);
      
      const response = await fetch(PINATA_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${PINATA_JWT}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pinataContent: data,
          pinataMetadata: {
            name: name || 'FIR Data',
          },
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('Pinata error:', error);
        throw new Error(`Pinata upload failed: ${error}`);
      }

      const result = await response.json();
      console.log('Upload successful, CID:', result.IpfsHash);

      return new Response(
        JSON.stringify({ cid: result.IpfsHash }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
      
    } else if (contentType.includes('multipart/form-data')) {
      // Upload file
      const formData = await req.formData();
      const file = formData.get('file');
      
      if (!file || !(file instanceof File)) {
        throw new Error('No file provided');
      }

      console.log('Uploading file to Pinata:', file.name);

      const pinataFormData = new FormData();
      pinataFormData.append('file', file);
      pinataFormData.append('pinataMetadata', JSON.stringify({
        name: file.name,
      }));

      const response = await fetch(PINATA_FILE_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${PINATA_JWT}`,
        },
        body: pinataFormData,
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('Pinata file upload error:', error);
        throw new Error(`Pinata file upload failed: ${error}`);
      }

      const result = await response.json();
      console.log('File upload successful, CID:', result.IpfsHash);

      return new Response(
        JSON.stringify({ cid: result.IpfsHash }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      throw new Error('Unsupported content type');
    }
    
  } catch (error) {
    console.error('Error in upload-to-ipfs function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
