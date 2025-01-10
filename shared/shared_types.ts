interface LoginRequestBody {
  username: string;
  password: string;
}

interface Department {
  department_id: number;
  department_name: string;
}
interface Ticket {
  ticket_id: string;
  author: string;
  title: string;
  description: string;
  status: string;
  images?: Base64<ImageType>[];
}
interface TicketEvent {
  event_id: number;
  author: string;
  created_at: number;
  event_type: string;
  description: string;
  content?: string;
  images?: Base64<ImageType>[];
}

interface TicketHistory {
  ticket_id: string;
  events: TicketEvent[];
}

type ImageType = "png" | "jpeg";
type Base64<imageType extends ImageType> =
  `data:image/${imageType};base64,${string}`;

export type {
  Base64,
  Department,
  ImageType,
  LoginRequestBody,
  Ticket,
  TicketEvent,
  TicketHistory,
};
