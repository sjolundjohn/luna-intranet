// Redirect to overview which contains the participants list
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function ParticipantsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/clinical-trial');
  }, [router]);

  return null;
}
