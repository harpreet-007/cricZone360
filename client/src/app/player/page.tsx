'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import PlayerProfileClient from '@/components/PlayerProfileClient';

const PlayerProfileQueryContent = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get('id') || '';

  return <PlayerProfileClient id={id} />;
};

export default function PlayerProfileQueryPage() {
  return (
    <Suspense fallback={<PlayerProfileClient id="" />}>
      <PlayerProfileQueryContent />
    </Suspense>
  );
}
