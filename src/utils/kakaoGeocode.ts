import axios from 'axios';
import { getLocalIp, getPublicIp } from './ip';

export async function getCoordinatesAndRegionFromKakao(
  address: string
): Promise<{
  coordinates: { lat: number; lng: number };
  region: { province: string; city: string; district: string };
} | null> {
  const kakaoApiUrl = 'https://dapi.kakao.com/v2/local/search/address.json';
  const kakaoApiKey = process.env.KAKAO_API_KEY;

  try {
    const response = await axios.get(kakaoApiUrl, {
      headers: {
        Authorization: `KakaoAK ${kakaoApiKey}`,
      },
      params: { query: address },
    });

    if (response.data.documents.length > 0) {
      const { x, y, address: addressInfo } = response.data.documents[0];
      const region = addressInfo
        ? {
            province: addressInfo.region_1depth_name || '',
            city: addressInfo.region_2depth_name || '',
            district: addressInfo.region_3depth_name || '',
          }
        : { province: '', city: '', district: '' };

      return {
        coordinates: { lat: parseFloat(y), lng: parseFloat(x) },
        region,
      };
    } else {
      return null;
    }
  } catch (error: any) {
    console.error(
      `Kakao Geocoding failed for address: ${address}`,
      error.message
    );

    const localIps = getLocalIp().join(', ');
    const publicIp = await getPublicIp();

    console.error(
      `Failed to fetch coordinates for address: ${address}.`,
      `Local IPs: ${localIps}`,
      `Public IP: ${publicIp}`,
      `Error: ${error.message || error}`
    );
    // 오류 발생 시 데이터를 스킵
    return null;
  }
}
