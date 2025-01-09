interface Department {
  department_id: number;
  department_name: string;
}
interface Ticket {
  ticket_id: string;
  author: string;
  title: string;
  description?: string;
  status: string;
  images: Blob;
}
interface TicketEvent {
  event_id: number;
  author: string;
  created_at: number;
  event_type: string;
  description: string;
  content?: string;
  images?: Blob;
}

interface TicketHistory {
  ticket_id: string;
  events: TicketEvent[];
}

export type { Department, Ticket, TicketEvent, TicketHistory };
