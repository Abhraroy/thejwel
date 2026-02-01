import axios from "axios";

const sandbox = "https://api-preprod.phonepe.com/apis/pg-sandbox";

const requestHeaders = {
  "Content-Type": "application/x-www-form-urlencoded",
};

const requestBody = new URLSearchParams({
  client_version: process.env.PHONEPE_CLIENT_VERSION!,
  grant_type: process.env.PHONEPE_GRANT_TYPE!,
  client_id: process.env.PHONEPE_CLIENT_ID!,
  client_secret: process.env.PHONEPE_CLIENT_SECRET!,
}).toString();

let cachedToken: {
  access_token: string;
  expires_at: number;
} | null = null;

export async function getAuthToken(): Promise<string | null> {
  try {
    const res = await axios.post(
      `${sandbox}/v1/oauth/token`,
      requestBody,
      { headers: requestHeaders }
    );

    cachedToken = {
      access_token: res.data.access_token,
      expires_at:res.data.expires_at,
    };

    return res.data?.access_token ?? null;
  } catch (error: any) {
    console.error(
      "PhonePe auth token error:",
      error.response?.data || error.message
    );
    return null;
  }
}
