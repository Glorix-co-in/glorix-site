import { useParams } from '@solidjs/router';
import EventPage from '../../../components/EventPage';
export default function EventDetailsRoute() { const params = useParams(); return <EventPage id={params.id} />; }
