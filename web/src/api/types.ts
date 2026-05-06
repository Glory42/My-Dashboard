export interface User {
  id: string
  email: string
  createdAt: string
}

export interface Workspace {
  id: string
  userId: string
  name: string
  description?: string
  color: string
  position: number
  createdAt: string
}

export interface Card {
  id: string
  columnId: string
  title: string
  description?: string | null
  tag?: string | null
  tagColor?: string | null
  position: number
  createdAt: string
  updatedAt: string
}

export interface Column {
  id: string
  workspaceId: string
  name: string
  color: string
  position: number
  createdAt: string
  cards: Card[]
}

export interface WorkspaceDetail extends Workspace {
  columns: Column[]
}
