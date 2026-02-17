import { headers } from 'next/headers';

export default async function getTicketCountsFromAPI() {
  try {
    const headersList = await headers(); // ✅ Await the headers() call
    const cookieHeader = headersList.get('cookie') || '';

    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/ticket/dashboard`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        cookie: cookieHeader, // ✅ Forward session_token cookie
      },
      cache: 'no-store',
    });

    return await res.json();
  } catch (error) {
    console.error('Error in getTicketCountsFromAPI:', error);
    throw error;
  }
}