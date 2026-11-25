export type Role = "user" | "admin";
export type PostStatus = "pending" | "approved" | "rejected";

export type Profile = {
  id: string;
  email: string;
  name: string | null;
  batch: string;
  role: Role;
};

export type Post = {
  id: string;
  title: string;
  url: string;
  note: string | null;
  deadline: string | null; // ISO; null = TBA
  status: PostStatus;
  reject_reason: string | null;
  batch: string;
  author_id: string | null;
  author_name: string | null;
  created_at: string;
  approved_at: string | null;
};
