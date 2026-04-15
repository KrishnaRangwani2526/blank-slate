export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      applications: {
        Row: {
          ats_score: number | null
          created_at: string
          id: string
          job_id: string
          rank: number | null
          resume_url: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ats_score?: number | null
          created_at?: string
          id?: string
          job_id: string
          rank?: number | null
          resume_url?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ats_score?: number | null
          created_at?: string
          id?: string
          job_id?: string
          rank?: number | null
          resume_url?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      candidates: {
        Row: {
          about: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          education: Json | null
          email: string | null
          experience: Json | null
          github_url: string | null
          id: string
          kaggle_url: string | null
          leetcode_url: string | null
          name: string | null
          projects: Json | null
          skills: string[] | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          about?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          education?: Json | null
          email?: string | null
          experience?: Json | null
          github_url?: string | null
          id?: string
          kaggle_url?: string | null
          leetcode_url?: string | null
          name?: string | null
          projects?: Json | null
          skills?: string[] | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          about?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          education?: Json | null
          email?: string | null
          experience?: Json | null
          github_url?: string | null
          id?: string
          kaggle_url?: string | null
          leetcode_url?: string | null
          name?: string | null
          projects?: Json | null
          skills?: string[] | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      certificates: {
        Row: {
          created_at: string
          credential_url: string | null
          expiry_date: string | null
          id: string
          issue_date: string | null
          issuer: string | null
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          credential_url?: string | null
          expiry_date?: string | null
          id?: string
          issue_date?: string | null
          issuer?: string | null
          name?: string
          user_id: string
        }
        Update: {
          created_at?: string
          credential_url?: string | null
          expiry_date?: string | null
          id?: string
          issue_date?: string | null
          issuer?: string | null
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      companies: {
        Row: {
          created_at: string
          description: string | null
          email: string
          id: string
          industry: string | null
          logo_url: string | null
          name: string
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          email: string
          id?: string
          industry?: string | null
          logo_url?: string | null
          name: string
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          email?: string
          id?: string
          industry?: string | null
          logo_url?: string | null
          name?: string
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      education: {
        Row: {
          created_at: string
          degree: string
          description: string | null
          end_date: string | null
          field_of_study: string | null
          id: string
          school: string
          start_date: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          degree?: string
          description?: string | null
          end_date?: string | null
          field_of_study?: string | null
          id?: string
          school?: string
          start_date?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          degree?: string
          description?: string | null
          end_date?: string | null
          field_of_study?: string | null
          id?: string
          school?: string
          start_date?: string | null
          user_id?: string
        }
        Relationships: []
      }
      employee_requests: {
        Row: {
          company_id: string
          created_at: string
          department: string | null
          email: string
          id: string
          name: string
          role: string | null
          status: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          department?: string | null
          email: string
          id?: string
          name: string
          role?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          department?: string | null
          email?: string
          id?: string
          name?: string
          role?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_requests_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          avatar_url: string | null
          company_id: string
          created_at: string
          department: string | null
          email: string | null
          id: string
          joined_at: string | null
          name: string
          role: string | null
          status: string
        }
        Insert: {
          avatar_url?: string | null
          company_id: string
          created_at?: string
          department?: string | null
          email?: string | null
          id?: string
          joined_at?: string | null
          name: string
          role?: string | null
          status?: string
        }
        Update: {
          avatar_url?: string | null
          company_id?: string
          created_at?: string
          department?: string | null
          email?: string | null
          id?: string
          joined_at?: string | null
          name?: string
          role?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "employees_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      experience: {
        Row: {
          company: string
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          is_current: boolean | null
          location: string | null
          role: string
          start_date: string | null
          user_id: string
        }
        Insert: {
          company?: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          is_current?: boolean | null
          location?: string | null
          role?: string
          start_date?: string | null
          user_id: string
        }
        Update: {
          company?: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          is_current?: boolean | null
          location?: string | null
          role?: string
          start_date?: string | null
          user_id?: string
        }
        Relationships: []
      }
      feed_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feed_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "feed_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      feed_posts: {
        Row: {
          content: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      group_members: {
        Row: {
          group_id: string
          id: string
          joined_at: string
          user_id: string
        }
        Insert: {
          group_id: string
          id?: string
          joined_at?: string
          user_id: string
        }
        Update: {
          group_id?: string
          id?: string
          joined_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          category: string
          created_at: string
          created_by: string
          id: string
          name: string
        }
        Insert: {
          category?: string
          created_at?: string
          created_by: string
          id?: string
          name: string
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      habit_completions: {
        Row: {
          completed: boolean
          created_at: string
          date: string
          habit_id: string
          id: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          date: string
          habit_id: string
          id?: string
          user_id: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          date?: string
          habit_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "habit_completions_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "habits"
            referencedColumns: ["id"]
          },
        ]
      }
      habits: {
        Row: {
          archived: boolean
          category: string
          created_at: string
          frequency: string
          icon: string
          id: string
          name: string
          target_days: number[]
          updated_at: string
          user_id: string
        }
        Insert: {
          archived?: boolean
          category?: string
          created_at?: string
          frequency?: string
          icon?: string
          id?: string
          name: string
          target_days?: number[]
          updated_at?: string
          user_id: string
        }
        Update: {
          archived?: boolean
          category?: string
          created_at?: string
          frequency?: string
          icon?: string
          id?: string
          name?: string
          target_days?: number[]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      hr_members: {
        Row: {
          avatar_url: string | null
          company_id: string
          created_at: string
          email: string | null
          id: string
          name: string
          role: string | null
          status: string
        }
        Insert: {
          avatar_url?: string | null
          company_id: string
          created_at?: string
          email?: string | null
          id?: string
          name: string
          role?: string | null
          status?: string
        }
        Update: {
          avatar_url?: string | null
          company_id?: string
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          role?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "hr_members_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          ats_config: Json | null
          company_id: string
          created_at: string
          description: string | null
          github_requirement: Json | null
          id: string
          job_type: string
          kaggle_requirement: Json | null
          leetcode_requirement: Json | null
          location: string | null
          priority_order: Json | null
          requirements: Json | null
          status: string
          title: string
          updated_at: string
          work_mode: string
        }
        Insert: {
          ats_config?: Json | null
          company_id: string
          created_at?: string
          description?: string | null
          github_requirement?: Json | null
          id?: string
          job_type?: string
          kaggle_requirement?: Json | null
          leetcode_requirement?: Json | null
          location?: string | null
          priority_order?: Json | null
          requirements?: Json | null
          status?: string
          title: string
          updated_at?: string
          work_mode?: string
        }
        Update: {
          ats_config?: Json | null
          company_id?: string
          created_at?: string
          description?: string | null
          github_requirement?: Json | null
          id?: string
          job_type?: string
          kaggle_requirement?: Json | null
          leetcode_requirement?: Json | null
          location?: string | null
          priority_order?: Json | null
          requirements?: Json | null
          status?: string
          title?: string
          updated_at?: string
          work_mode?: string
        }
        Relationships: [
          {
            foreignKeyName: "jobs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      journeys: {
        Row: {
          color: string
          created_at: string
          description: string
          id: string
          name: string
          start_date: string
          target_days: number
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string
          created_at?: string
          description?: string
          id?: string
          name: string
          start_date?: string
          target_days?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string
          created_at?: string
          description?: string
          id?: string
          name?: string
          start_date?: string
          target_days?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      learning_goals: {
        Row: {
          completed: boolean | null
          created_at: string
          deadline: string | null
          id: string
          link: string | null
          proof: string | null
          title: string
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          created_at?: string
          deadline?: string | null
          id?: string
          link?: string | null
          proof?: string | null
          title?: string
          user_id: string
        }
        Update: {
          completed?: boolean | null
          created_at?: string
          deadline?: string | null
          id?: string
          link?: string | null
          proof?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      mood_entries: {
        Row: {
          created_at: string
          date: string
          id: string
          label: string
          mood: number
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          label?: string
          mood: number
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          label?: string
          mood?: number
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          company_id: string | null
          created_at: string
          id: string
          is_read: boolean
          message: string
          metadata: Json | null
          type: string
          user_id: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          metadata?: Json | null
          type?: string
          user_id?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          metadata?: Json | null
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          about: string | null
          avatar_url: string | null
          badges: string[]
          bio: string | null
          created_at: string
          display_name: string
          freezes: number
          full_name: string | null
          github_url: string | null
          id: string
          kaggle_url: string | null
          leetcode_url: string | null
          level: number
          location: string | null
          open_to_work: boolean | null
          phone: string | null
          seeking_type: string | null
          updated_at: string
          user_id: string
          work_mode: string | null
          xp: number
        }
        Insert: {
          about?: string | null
          avatar_url?: string | null
          badges?: string[]
          bio?: string | null
          created_at?: string
          display_name?: string
          freezes?: number
          full_name?: string | null
          github_url?: string | null
          id?: string
          kaggle_url?: string | null
          leetcode_url?: string | null
          level?: number
          location?: string | null
          open_to_work?: boolean | null
          phone?: string | null
          seeking_type?: string | null
          updated_at?: string
          user_id: string
          work_mode?: string | null
          xp?: number
        }
        Update: {
          about?: string | null
          avatar_url?: string | null
          badges?: string[]
          bio?: string | null
          created_at?: string
          display_name?: string
          freezes?: number
          full_name?: string | null
          github_url?: string | null
          id?: string
          kaggle_url?: string | null
          leetcode_url?: string | null
          level?: number
          location?: string | null
          open_to_work?: boolean | null
          phone?: string | null
          seeking_type?: string | null
          updated_at?: string
          user_id?: string
          work_mode?: string | null
          xp?: number
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string
          description: string | null
          end_date: string | null
          github_link: string | null
          id: string
          project_link: string | null
          start_date: string | null
          tech_stack: string[] | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          github_link?: string | null
          id?: string
          project_link?: string | null
          start_date?: string | null
          tech_stack?: string[] | null
          title?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          github_link?: string | null
          id?: string
          project_link?: string | null
          start_date?: string | null
          tech_stack?: string[] | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      screen_time_entries: {
        Row: {
          category: string
          created_at: string
          date: string
          hours: number
          id: string
          minutes: number
          user_id: string
        }
        Insert: {
          category?: string
          created_at?: string
          date: string
          hours?: number
          id?: string
          minutes?: number
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          date?: string
          hours?: number
          id?: string
          minutes?: number
          user_id?: string
        }
        Relationships: []
      }
      skills: {
        Row: {
          category: string | null
          created_at: string
          id: string
          name: string
          percentage: number | null
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          name?: string
          percentage?: number | null
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          name?: string
          percentage?: number | null
          user_id?: string
        }
        Relationships: []
      }
      sleep_entries: {
        Row: {
          bedtime: string
          created_at: string
          date: string
          id: string
          notes: string
          quality: number
          user_id: string
          wake_up: string
        }
        Insert: {
          bedtime?: string
          created_at?: string
          date: string
          id?: string
          notes?: string
          quality?: number
          user_id: string
          wake_up?: string
        }
        Update: {
          bedtime?: string
          created_at?: string
          date?: string
          id?: string
          notes?: string
          quality?: number
          user_id?: string
          wake_up?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          id: string
          notifications: boolean
          reminder_time: string
          updated_at: string
          user_id: string
          week_start: string
        }
        Insert: {
          id?: string
          notifications?: boolean
          reminder_time?: string
          updated_at?: string
          user_id: string
          week_start?: string
        }
        Update: {
          id?: string
          notifications?: boolean
          reminder_time?: string
          updated_at?: string
          user_id?: string
          week_start?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
