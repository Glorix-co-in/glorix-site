import { useParams } from '@solidjs/router';
import SlotPage from '../../../components/SlotPage';
export default function EventSlotsRoute() { const params = useParams(); return <SlotPage id={params.id} />; }
