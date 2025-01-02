import axios from 'axios';

export async function getCoordinatesAndRegionFromKakao(
  address: string
): Promise<{
  coordinates: { lat: number; lng: number };
  region: { province: string; city: string; district: string };
} | null> {
  const kakaoApiUrl = 'https://dapi.kakao.com/v2/local/search/address.json';
  const kakaoApiKey = 'ad75ae7d0be70cf49b159db06b601e9a';

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
    return null;
  }
}
