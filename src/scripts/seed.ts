import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

// Load env from .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import User from "../models/User";
import Carousel from "../models/Carousel";
import Program from "../models/Program";
import Announcement from "../models/Announcement";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI is not defined in .env.local");
  process.exit(1);
}

async function seed() {
  try {
    console.log("🔗 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI as string);
    console.log("✅ Connected to MongoDB");

    // --- Seed Admin User ---
    const existingAdmin = await User.findOne({ email: "admin@edulinks.com" });
    if (existingAdmin) {
      console.log("⏭️  Admin user already exists, skipping...");
    } else {
      await User.create({
        name: "Admin",
        email: "admin@edulinks.com",
        password: "Admin123!",
        role: "admin",
      });
      console.log("✅ Admin user created (admin@edulinks.com / Admin123!)");
    }

    // --- Seed Teacher User ---
    const existingTeacher = await User.findOne({ email: "teacher@edulinks.com" });
    if (existingTeacher) {
      console.log("⏭️  Teacher user already exists, skipping...");
    } else {
      await User.create({
        name: "Juan Dela Cruz",
        email: "teacher@edulinks.com",
        password: "Teacher123!",
        role: "teacher",
      });
      console.log("✅ Teacher user created (teacher@edulinks.com / Teacher123!)");
    }

    // --- Seed Student User ---
    const existingStudent = await User.findOne({ email: "student@edulinks.com" });
    if (existingStudent) {
      console.log("⏭️  Student user already exists, skipping...");
    } else {
      await User.create({
        name: "Maria Santos",
        email: "student@edulinks.com",
        password: "Student123!",
        role: "student",
      });
      console.log("✅ Student user created (student@edulinks.com / Student123!)");
    }

    // --- Seed Carousel Slides ---
    const carouselCount = await Carousel.countDocuments();
    if (carouselCount > 0) {
      console.log(`⏭️  ${carouselCount} carousel slides already exist, skipping...`);
    } else {
      await Carousel.insertMany([
        {
          title: "Welcome to Edulinks Learning Center",
          subtitle: "Nurturing Minds, Shaping Futures",
          imageUrl: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1200&h=600&fit=crop",
          buttonText: "Learn More",
          buttonLink: "/programs",
          order: 0,
          isActive: true,
        },
        {
          title: "Enroll for the New School Year",
          subtitle: "Applications are now open for SY 2025-2026",
          imageUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&h=600&fit=crop",
          buttonText: "Apply Now",
          buttonLink: "/apply",
          order: 1,
          isActive: true,
        },
        {
          title: "Excellence in Education",
          subtitle: "State-of-the-art facilities and dedicated faculty",
          imageUrl: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1200&h=600&fit=crop",
          buttonText: "View Programs",
          buttonLink: "/programs",
          order: 2,
          isActive: true,
        },
      ]);
      console.log("✅ 3 carousel slides created");
    }

    // --- Seed Programs ---
    const programCount = await Program.countDocuments();
    if (programCount > 0) {
      console.log(`⏭️  ${programCount} programs already exist, skipping...`);
    } else {
      await Program.insertMany([
        {
          title: "Elementary Program",
          description:
            "Our Elementary Program provides a strong foundation in literacy, numeracy, science, and social studies. We foster curiosity and critical thinking through interactive lessons, hands-on activities, and project-based learning for Grades 1-6.",
          imageUrl: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&h=400&fit=crop",
          order: 0,
        },
        {
          title: "Junior High School",
          description:
            "The Junior High School program builds on the elementary foundation with a deeper exploration of core subjects. Students develop advanced analytical skills, participate in extracurricular activities, and prepare for senior high school through a well-rounded curriculum for Grades 7-10.",
          imageUrl: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=600&h=400&fit=crop",
          order: 1,
        },
        {
          title: "Senior High School",
          description:
            "Our Senior High School offers specialized academic tracks including STEM, ABM, HUMSS, and TVL. Students receive focused instruction to prepare them for college, employment, or entrepreneurship, with access to modern laboratories and industry partnerships for Grades 11-12.",
          imageUrl: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=600&h=400&fit=crop",
          order: 2,
        },
      ]);
      console.log("✅ 3 programs created");
    }

    // --- Seed Announcements ---
    const announcementCount = await Announcement.countDocuments();
    if (announcementCount > 0) {
      console.log(`⏭️  ${announcementCount} announcements already exist, skipping...`);
    } else {
      await Announcement.insertMany([
        {
          title: "Welcome Back to School!",
          content:
            "<p>We are excited to welcome all students back for the new school year! Classes will officially begin on <strong>August 12, 2025</strong>.</p><p>Please make sure to complete your enrollment and submit all required documents before the first day.</p><ul><li>Report cards from previous year</li><li>Updated medical records</li><li>School ID photos (2x2)</li></ul>",
          isPublished: true,
        },
        {
          title: "Science Fair 2025",
          content:
            "<p>Edulinks Learning Center is hosting its annual <strong>Science Fair</strong> on <strong>September 20, 2025</strong>.</p><p>All students from Grades 4-12 are encouraged to participate. Registration is now open — see your Science teacher for details.</p><h3>Categories</h3><ul><li>Physical Science</li><li>Life Science</li><li>Technology & Innovation</li></ul>",
          isPublished: true,
        },
      ]);
      console.log("✅ 2 announcements created");
    }

    console.log("\n🎉 Seed completed successfully!");
    console.log("📧 Admin login: admin@edulinks.com");
    console.log("🔑 Admin password: Admin123!");
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

seed();
