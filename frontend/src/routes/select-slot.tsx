import { useSearchParams } from '@solidjs/router';
import SlotPage from '../components/SlotPage';
export default function SelectSlot() { const [search] = useSearchParams(); return <SlotPage id={typeof search.id === 'string' ? search.id : undefined} />; }
