export default async function checkRoomPrivacy(codigo: string): Promise<boolean> {
  try {
    const host = process.env.NEXT_PUBLIC_SOCKET_URL || 'localhost';
    const port = process.env.NEXT_PUBLIC_SOCKET_PORT || '3001';
    const protocol = process.env.NEXT_PUBLIC_PROTOCOL || 'http';
    const url = `${protocol}://${host}:${port}/privacy/${encodeURIComponent(codigo.toLowerCase())}`;

    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return false;
    const data = await res.json();
    return !!data?.private;
  } catch (e) {
    return false;
  }
}
