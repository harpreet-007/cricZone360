import MatchDetailsClient from '@/components/MatchDetailsClient';

const matchIds = [
  'demo-live-ind-v-aus',
  'demo-live-eng-v-nz',
  'demo-upcoming-ipl-final',
  'demo-upcoming-u19',
  'demo-result-pak-v-sa',
  'spotlight-rohit-2026-mi-csk',
  'spotlight-virat-rcb-gt',
  'ipl-2025-match-01',
];

export const generateStaticParams = () => matchIds.map((id) => ({ id }));

export default async function MatchDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <MatchDetailsClient id={id} />;
}
