import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const userSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["admin", "principal", "teacher", "student"]),
});

export const userUpdateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  role: z.enum(["admin", "principal", "teacher", "student"]).optional(),
});

export const carouselSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  subtitle: z.string().max(500).optional().default(""),
  imageUrl: z.string().min(1, "Image is required"),
  buttonText: z.string().max(100).optional().default(""),
  buttonLink: z.string().max(500).optional().default(""),
  order: z.number().int().min(0).optional().default(0),
  isActive: z.boolean().optional().default(true),
});

export const programSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().min(1, "Description is required").max(2000),
  imageUrl: z.string().min(1, "Image is required"),
  order: z.number().int().min(0).optional().default(0),
});

export const gallerySchema = z.object({
  imageUrl: z.string().min(1, "Image is required"),
  caption: z.string().max(500).optional().default(""),
  category: z.enum(["Nursery", "Kinder", "Preschool"], { error: "Category is required" }),
});

export const announcementSchema = z.object({
  title: z.string().min(1, "Title is required").max(300),
  content: z.string().min(1, "Content is required"),
  images: z.array(z.string()).max(3, "Maximum 3 images allowed").optional().default([]),
  category: z.enum(["All", "Nursery", "Kinder", "Preschool"]).optional().default("All"),
  isPublished: z.boolean().optional().default(false),
  scheduledAt: z.string().nullable().optional().default(null),
});

export const aboutMemberSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  role: z.string().min(1, "Role/position is required").max(100),
  bio: z.string().max(1000).optional().default(""),
  imageUrl: z.string().optional().default(""),
  type: z.enum(["founder", "teacher"]),
  order: z.number().int().min(0).optional().default(0),
});

export const testimonialSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  role: z.string().min(1, "Role is required").max(100),
  content: z.string().min(1, "Content is required").max(2000),
  imageUrl: z.string().optional().default(""),
  rating: z.coerce.number().int().min(1).max(5).optional().default(5),
  isPublished: z.boolean().optional().default(true),
});

export const applicationSchema = z.object({
  lastName: z.string({ error: "Last name is required" }).min(1, "Last name is required").max(100),
  firstName: z.string({ error: "First name is required" }).min(1, "First name is required").max(100),
  middleName: z.string().max(100).optional().default(""),
  suffix: z.string().max(10).optional().default(""),
  age: z.coerce.number().int().min(3, "Age must be at least 3").max(25, "Age must be at most 25"),
  dateOfBirth: z.string({ error: "Date of birth is required" }).min(1, "Date of birth is required"),
  gender: z.string({ error: "Gender is required" }).min(1, "Gender is required"),
  address: z.string({ error: "Address is required" }).min(5, "Address must be at least 5 characters").max(500),
  gradeLevel: z.string({ error: "Grade level is required" }).min(1, "Grade level is required").max(50),
  parentGuardianName: z.string({ error: "Parent/guardian name is required" }).min(2, "Parent/guardian name is required").max(200),
  parentGuardianRelationship: z.string({ error: "Relationship is required" }).min(1, "Relationship is required").max(50),
  contactNumber: z.string({ error: "Contact number is required" }).min(7, "Contact number must be at least 7 digits").max(20),
  email: z.union([z.string().email("Invalid email address"), z.literal("")]).optional().default(""),
  previousSchool: z.string().max(200).optional().default(""),
});

export const reorderSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      order: z.number().int().min(0),
    })
  ),
});

export const gradeSchema = z.object({
  studentId: z.string().min(1, "Student is required"),
  subject: z.string().min(1, "Subject is required").max(100),
  score: z.coerce.number().min(0, "Score must be at least 0").max(100, "Score must be at most 100"),
  term: z.enum(["1st", "2nd", "3rd", "4th", "final"], { error: "Term is required" }),
  remarks: z.string().max(500).optional().default(""),
});

export const classSchema = z.object({
  name: z.string().min(1, "Class name is required").max(100),
  section: z.string().max(50).optional().default(""),
  teacherId: z.string().min(1, "Teacher is required"),
  subject: z.string().min(1, "Subject is required").max(100),
  students: z.array(z.string()).optional().default([]),
  schedule: z.string().max(200).optional().default(""),
});
