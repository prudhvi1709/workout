// Hand-authored to mirror supabase/migrations. If the schema changes,
// update both. (Can later be replaced by `supabase gen types typescript`.)
//
// NOTE: these MUST be `type` aliases, not `interface`. Supabase's typed client
// requires each Row/Insert/Update to satisfy `Record<string, unknown>`, and
// interfaces (being open to augmentation) lack the implicit index signature
// that object `type` aliases have. Using `interface` makes every query `never`.

export type Sex = "male" | "female";

export type Profile = {
  id: string; // = auth.users.id
  display_name: string;
  sex: Sex | null;
  height_cm: number | null;
  start_weight_kg: number | null;
  goal_weight_kg: number | null;
  birthday_goal_weight_kg: number | null;
  goal_date: string | null; // ISO date
  created_at: string;
};

export type DailyLog = {
  id: string;
  user_id: string;
  log_date: string; // ISO date (YYYY-MM-DD)
  morning_weight_kg: number | null;
  waist_cm: number | null;
  body_fat_pct: number | null;
  calories: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  water_l: number | null;
  steps: number | null;
  cardio_min: number | null;
  bike_commute: boolean;
  swimming: boolean;
  sleep_hours: number | null;
  sleep_quality: number | null; // 1-10
  energy_score: number | null; // 1-10
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type WorkoutSession = {
  id: string;
  user_id: string;
  session_date: string;
  day_label: string | null;
  notes: string | null;
  created_at: string;
};

export type WorkoutSet = {
  id: string;
  session_id: string;
  user_id: string;
  exercise_name: string;
  weight_kg: number | null;
  sets: number | null;
  reps: number | null;
  rir: number | null;
  position: number;
  notes: string | null;
};

export type ProgramTemplate = {
  id: string;
  user_id: string;
  day_label: string;
  exercise_name: string;
  target_sets: number | null;
  target_reps: string | null;
  position: number;
};

type TableDef<Row, Ins = Partial<Row>, Upd = Partial<Row>> = {
  Row: Row;
  Insert: Ins;
  Update: Upd;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      profiles: TableDef<Profile>;
      daily_logs: TableDef<DailyLog>;
      workout_sessions: TableDef<WorkoutSession>;
      workout_sets: TableDef<WorkoutSet>;
      program_templates: TableDef<ProgramTemplate>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: { sex: Sex };
    CompositeTypes: Record<string, never>;
  };
};
