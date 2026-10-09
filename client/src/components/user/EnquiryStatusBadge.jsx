import { Badge } from '@/components/ui/card';

const TONES = { NEW: 'accent', IN_PROGRESS: 'primary', QUOTED: 'success', CLOSED: 'default' };
const LABELS = { NEW: 'New', IN_PROGRESS: 'In progress', QUOTED: 'Quoted', CLOSED: 'Closed' };

export default function EnquiryStatusBadge({ status }) {
  return <Badge tone={TONES[status]}>{LABELS[status] ?? status}</Badge>;
}

export const ENQUIRY_STATUSES = Object.entries(LABELS).map(([value, label]) => ({ value, label }));
