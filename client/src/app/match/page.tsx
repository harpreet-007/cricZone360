'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import MatchDetailsClient from '@/components/MatchDetailsClient';

const MatchDetailsQueryContent = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get('id') || '';

  return <MatchDetailsClient id={id} />;
};

export default function MatchDetailsQueryPage() {
  return (
    <Suspense fallback={<MatchDetailsClient id="" />}>
      <MatchDetailsQueryContent />
    </Suspense>
  );
}
