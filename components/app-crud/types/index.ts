export interface BaseCrudProps {
    title: string
    addButtonText?: string
    description?: string
    pagination?: boolean
    totalItems?: number
    hideCreate?: boolean
    addBtnAction?: () => void
}