export interface IModelService<T> {
    getAll: (params?: Record<string, any>) => Promise<void>;
    getSingle: (id:string) => Promise<void>;
    create: (data?: T) => Promise<void>;
    update: (data: T) => Promise<void>;
    delete: (data: T) => Promise<void>;
    restore?: (data: T) => Promise<void>;
    createBtnAction: () => void;
    editButtonAction: (data: T) => void;
}
