export interface Task {
  id: string;
  label: string;
  completed: boolean;
}

export interface Step {
  id: string;
  title: string;
  description: string;
  tip?: string;
  tasks: Task[];
}

export interface Module {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: string;
  color: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  steps: Step[];
}

export const modules: Module[] = [
  // Tambahkan modul panduan kamu di sini
  // Copy template di bawah ini dan isi sesuai kebutuhan:

  /*
  {
    id: 'unique-id-modul',
    title: 'Judul Panduan',
    description: 'Deskripsi singkat masalah atau prosedur',
    category: 'Kategori (Printer/Internet/Sistem/dll)',
    icon: '🔧',
    color: 'from-blue-500 to-purple-500',
    difficulty: 'Beginner',
    steps: [
      {
        id: 'step-1',
        title: 'Langkah 1',
        description: 'Penjelasan langkah',
        tip: 'Tips tambahan (opsional)',
        tasks: [
          { id: 't1', label: 'Checklist tugas 1', completed: false },
          { id: 't2', label: 'Checklist tugas 2', completed: false },
        ],
      },
    ],
  },
  */
];
