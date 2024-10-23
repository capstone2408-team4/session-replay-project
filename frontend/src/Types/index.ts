export interface Session {
  id: 1,
  session_id: string
  project_id: string
  file_name: string
  session_summary: null | string
  session_start: string
  session_end: string
  last_activity_at: string
  is_active: boolean
}
