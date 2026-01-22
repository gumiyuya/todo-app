export type Task = {
  id: string;
  title: string;
  isCompleted: boolean;
  createdAt: Date;
  completedAt: Date | null;
};
