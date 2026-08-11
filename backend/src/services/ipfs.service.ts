import axios from 'axios';
import FormData from 'form-data';

export const uploadFileToIPFS = async (fileBuffer: Buffer, filename: string, mimetype: string) => {
    const pinataJwt = process.env.PINATA_JWT;
    if (!pinataJwt) {
        throw new Error("PINATA_JWT is not defined in environment variables");
    }

    try {
        const formData = new FormData();
        formData.append('file', fileBuffer, {
            filename: filename,
            contentType: mimetype
        });

        const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
            maxBodyLength: Infinity,
            headers: {
                'Content-Type': `multipart/form-data; boundary=${formData.getBoundary()}`,
                'Authorization': `Bearer ${pinataJwt}`
            }
        });
        
        return res.data;
    } catch (error: any) {
        console.error("Error uploading file to IPFS:", error.response?.data || error.message);
        throw error;
    }
}

export const uploadJSONToIPFS = async (jsonBody: any) => {
    const pinataJwt = process.env.PINATA_JWT;
    if (!pinataJwt) {
        throw new Error("PINATA_JWT is not defined in environment variables");
    }

    try {
        const res = await axios.post("https://api.pinata.cloud/pinning/pinJSONToIPFS", jsonBody, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${pinataJwt}`
            }
        });
        
        return res.data;
    } catch (error: any) {
        console.error("Error uploading JSON to IPFS:", error.response?.data || error.message);
        throw error;
    }
}
