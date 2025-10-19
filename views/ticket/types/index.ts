export interface Ticket {
  id: number;
  user?: {
    fullName: string;
  };
  title?: string;
  description?: string;
  creationDate?: string;
  status?: number;
  assignedUsers?: {
    fullName: string;
  }[];
}

