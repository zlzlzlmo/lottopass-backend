import * as os from 'os';
import axios from 'axios';

// 서버 내부 IP 가져오기
export function getLocalIp(): string[] {
  const interfaces = os.networkInterfaces();
  const ips: string[] = [];
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      if (iface.family === 'IPv4' && !iface.internal) {
        ips.push(iface.address);
      }
    }
  }
  return ips;
}

// 서버 공인 IP 가져오기
export async function getPublicIp(): Promise<string | null> {
  try {
    const response = await axios.get('https://api.ipify.org?format=json');
    return response.data.ip;
  } catch (error: any) {
    console.error('Failed to fetch public IP:', error.message);
    return null;
  }
}
