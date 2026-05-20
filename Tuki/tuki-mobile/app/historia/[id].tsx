import { useLocalSearchParams } from 'expo-router';
import HistoriaTrilhaScreen from '../../src/screens/HistoriaTrilhaScreen';

export default function HistoriaPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <HistoriaTrilhaScreen idLicao={Number(id)} />;
}
