import PlayerProfileClient from '@/components/PlayerProfileClient';

const playerIds = [
  'demo-rohit-sharma',
  'demo-ms-dhoni',
  'demo-virat-kohli',
  'demo-jasprit-bumrah',
  'demo-smriti-mandhana',
  'demo-pat-cummins',
  'demo-ben-stokes',
];

export const generateStaticParams = () => playerIds.map((id) => ({ id }));

export default async function PlayerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PlayerProfileClient id={id} />;
}
