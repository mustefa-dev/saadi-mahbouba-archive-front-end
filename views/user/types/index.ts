import type { Project } from "~/views/projects/types";

export interface User {
    id?: number;
    fullName?: string;
    password?: string;
    location?: string;
    role?: string|number;
    email?: string;
    isActive?: boolean;
    isDeleted?: boolean;
    project?: Project|string;
    projectId?: string;
}
