export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "principal" | "teacher" | "student";
  firstName?: string;
  lastName?: string;
  middleName?: string;
  suffix?: string;
  age?: number;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  gradeLevel?: string;
  parentGuardianName?: string;
  parentGuardianRelationship?: string;
  contactNumber?: string;
  previousSchool?: string;
  createdAt: string;
}

export interface ICarousel {
  _id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  buttonText: string;
  buttonLink: string;
  order: number;
  isActive: boolean;
  createdAt: string;
}

export interface IProgram {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  order: number;
  createdAt: string;
}

export interface IGallery {
  _id: string;
  imageUrl: string;
  caption: string;
  category: "Nursery" | "Kinder" | "Preschool";
  createdAt: string;
}

export interface IAnnouncement {
  _id: string;
  title: string;
  content: string;
  images: string[];
  category: "All" | "Nursery" | "Kinder" | "Preschool";
  isPublished: boolean;
  scheduledAt: string | null;
  expiresAt: string | null;
  createdAt: string;
}

export interface IAboutMember {
  _id: string;
  name: string;
  role: string;
  bio: string;
  imageUrl: string;
  type: "founder" | "teacher";
  order: number;
  createdAt: string;
}

export interface ITestimonial {
  _id: string;
  name: string;
  role: string;
  content: string;
  imageUrl: string;
  rating: number;
  isPublished: boolean;
  createdAt: string;
}

export interface IStudentApplication {
  _id: string;
  lastName: string;
  firstName: string;
  middleName?: string;
  suffix?: string;
  age: number;
  dateOfBirth: string;
  gender: string;
  address: string;
  gradeLevel: string;
  parentGuardianName: string;
  parentGuardianRelationship: string;
  contactNumber: string;
  email?: string;
  previousSchool?: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface IGrade {
  _id: string;
  studentId: string | { _id: string; name: string; email: string };
  teacherId: string | { _id: string; name: string };
  subject: string;
  score: number;
  term: "1st" | "2nd" | "3rd" | "4th" | "final";
  remarks: string;
  status: "approved" | "pending" | "rejected";
  previousScore: number | null;
  approvedBy: string | { _id: string; name: string } | null;
  requestedAt: string | null;
  createdAt: string;
}

export interface IClass {
  _id: string;
  name: string;
  section: string;
  teacherId: string | { _id: string; name: string };
  subject: string;
  students: string[] | { _id: string; name: string; email: string }[];
  schedule: string;
  createdAt: string;
}
