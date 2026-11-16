const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Course = require('./models/Course');
const Application = require('./models/Application');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/college_admission_db';

const seedData = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB for database seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Course.deleteMany({});
    await Application.deleteMany({});
    console.log('Cleared existing records.');

    // 1. Seed Admin User
    const adminUser = await User.create({
      name: 'Admission Office (Admin)',
      email: 'admin@iem.edu',
      contactNumber: '9876543210',
      password: 'Admin@123',
      role: 'admin'
    });
    console.log(' Created Admin: admin@iem.edu / Admin@123');

    // 2. Seed Academic Courses
    const courses = await Course.insertMany([
      { code: 'CSE', name: 'Computer Science & Engineering', department: 'Computer Science', intakeSeats: 180 },
      { code: 'CSE-AIML', name: 'CSE (Artificial Intelligence & Machine Learning)', department: 'Computer Science', intakeSeats: 120 },
      { code: 'CSE-DS', name: 'CSE (Data Science)', department: 'Computer Science', intakeSeats: 120 },
      { code: 'IT', name: 'Information Technology', department: 'Information Technology', intakeSeats: 120 },
      { code: 'ECE', name: 'Electronics & Communication Engineering', department: 'Electronics', intakeSeats: 120 },
      { code: 'EE', name: 'Electrical Engineering', department: 'Electrical', intakeSeats: 60 },
      { code: 'ME', name: 'Mechanical Engineering', department: 'Mechanical', intakeSeats: 60 }
    ]);
    console.log(` Created ${courses.length} Academic Programs.`);

    // 3. Seed Sample Applicants in various workflow statuses

    // Applicant 1: Submitted (Ready for review)
    const user1 = await User.create({
      name: 'Rohan Sharma',
      email: 'rohan.sharma@example.com',
      contactNumber: '9830112233',
      password: 'User@123',
      role: 'applicant'
    });

    await Application.create({
      applicationId: 'IEM-842910',
      user: user1._id,
      status: 'Submitted',
      submittedAt: new Date(Date.now() - 3600 * 1000 * 24),
      personalDetails: {
        fullName: 'Rohan Sharma',
        dateOfBirth: '2005-04-12',
        gender: 'Male',
        email: user1.email,
        mobile: user1.contactNumber,
        guardianName: 'Sunil Sharma',
        category: 'General',
        state: 'West Bengal',
        address: 'Sector V, Salt Lake, Kolkata, West Bengal - 700091'
      },
      class10: {
        board: 'CBSE',
        school: 'Delhi Public School Kolkata',
        passingYear: 2021,
        totalMarks: 500,
        marksObtained: 465,
        percentage: 93.00
      },
      class12: {
        board: 'CBSE',
        school: 'Delhi Public School Kolkata',
        passingYear: 2023,
        physics: 92,
        chemistry: 89,
        mathematics: 95,
        totalMarks: 500,
        marksObtained: 462,
        percentage: 92.40
      },
      entranceExam: {
        examType: 'JEE_MAIN',
        examYear: 2024,
        rollNumber: '240310892110',
        jeeMainPercentile: 97.45
      },
      coursePreferences: {
        admissionSession: '2025-2026',
        course: 'Computer Science & Engineering',
        coursePreference2: 'CSE (Artificial Intelligence & Machine Learning)',
        coursePreference3: 'Information Technology'
      },
      feePayment: {
        amount: 100000,
        currency: 'INR',
        status: 'Paid',
        paymentReference: 'UPI/HDFC/20261114/891278',
        paidAt: new Date(Date.now() - 3600 * 1000 * 25)
      },
      verification: {
        isVerified: false,
        remarks: ''
      },
      timeline: [
        { status: 'Draft', timestamp: new Date(Date.now() - 3600 * 1000 * 48), note: 'Application draft created.', actor: 'Rohan Sharma' },
        { status: 'Submitted', timestamp: new Date(Date.now() - 3600 * 1000 * 24), note: 'Final application submitted by student.', actor: 'Rohan Sharma' }
      ]
    });

    // Applicant 2: Under Review
    const user2 = await User.create({
      name: 'Ananya Sen',
      email: 'ananya.sen@example.com',
      contactNumber: '9831998877',
      password: 'User@123',
      role: 'applicant'
    });

    await Application.create({
      applicationId: 'IEM-619203',
      user: user2._id,
      status: 'Under Review',
      submittedAt: new Date(Date.now() - 3600 * 1000 * 72),
      personalDetails: {
        fullName: 'Ananya Sen',
        dateOfBirth: '2005-08-25',
        gender: 'Female',
        email: user2.email,
        mobile: user2.contactNumber,
        guardianName: 'Prabir Sen',
        category: 'General',
        state: 'West Bengal',
        address: 'Ballygunge Circular Road, Kolkata, West Bengal - 700019'
      },
      class10: {
        board: 'ICSE',
        school: 'South Point High School',
        passingYear: 2021,
        totalMarks: 500,
        marksObtained: 478,
        percentage: 95.60
      },
      class12: {
        board: 'ISC',
        school: 'South Point High School',
        passingYear: 2023,
        physics: 94,
        chemistry: 91,
        mathematics: 96,
        totalMarks: 500,
        marksObtained: 472,
        percentage: 94.40
      },
      entranceExam: {
        examType: 'WBJEE',
        examYear: 2024,
        rollNumber: '11094821',
        wbjeeRank: 1280
      },
      coursePreferences: {
        admissionSession: '2025-2026',
        course: 'CSE (Artificial Intelligence & Machine Learning)',
        coursePreference2: 'Computer Science & Engineering',
        coursePreference3: 'Electronics & Communication Engineering'
      },
      feePayment: {
        amount: 100000,
        currency: 'INR',
        status: 'Paid',
        paymentReference: 'AXIS/NEFT/0029104921',
        paidAt: new Date(Date.now() - 3600 * 1000 * 70)
      },
      verification: {
        isVerified: true,
        remarks: 'Class 10 & 12 marksheets verified against council records.',
        verifiedAt: new Date(Date.now() - 3600 * 1000 * 10),
        verifiedBy: adminUser._id
      },
      timeline: [
        { status: 'Draft', timestamp: new Date(Date.now() - 3600 * 1000 * 96), note: 'Draft initialized.', actor: 'Ananya Sen' },
        { status: 'Submitted', timestamp: new Date(Date.now() - 3600 * 1000 * 72), note: 'Application submitted.', actor: 'Ananya Sen' },
        { status: 'Under Review', timestamp: new Date(Date.now() - 3600 * 1000 * 10), note: 'Status moved to Under Review by Admission Team.', actor: 'Admission Office (Admin)' }
      ]
    });

    // Applicant 3: Selected
    const user3 = await User.create({
      name: 'Priyanka Mukherjee',
      email: 'priyanka.m@example.com',
      contactNumber: '9123456780',
      password: 'User@123',
      role: 'applicant'
    });

    await Application.create({
      applicationId: 'IEM-491024',
      user: user3._id,
      status: 'Selected',
      submittedAt: new Date(Date.now() - 3600 * 1000 * 120),
      personalDetails: {
        fullName: 'Priyanka Mukherjee',
        dateOfBirth: '2005-02-14',
        gender: 'Female',
        email: user3.email,
        mobile: user3.contactNumber,
        guardianName: 'Debabrata Mukherjee',
        category: 'General',
        state: 'West Bengal',
        address: 'Salt Lake City, Kolkata - 700064'
      },
      class10: {
        board: 'CBSE',
        school: 'Kendriya Vidyalaya Salt Lake',
        passingYear: 2021,
        totalMarks: 500,
        marksObtained: 480,
        percentage: 96.00
      },
      class12: {
        board: 'CBSE',
        school: 'Kendriya Vidyalaya Salt Lake',
        passingYear: 2023,
        physics: 96,
        chemistry: 95,
        mathematics: 98,
        totalMarks: 500,
        marksObtained: 485,
        percentage: 97.00
      },
      entranceExam: {
        examType: 'JEE_MAIN',
        examYear: 2024,
        rollNumber: '24031980011',
        jeeMainPercentile: 98.92
      },
      coursePreferences: {
        admissionSession: '2025-2026',
        course: 'Computer Science & Engineering',
        coursePreference2: 'Information Technology',
        coursePreference3: 'Electronics & Communication Engineering'
      },
      feePayment: {
        amount: 100000,
        currency: 'INR',
        status: 'Paid',
        paymentReference: 'UPI/ICICI/4491029199',
        paidAt: new Date(Date.now() - 3600 * 1000 * 115)
      },
      verification: {
        isVerified: true,
        remarks: 'All credentials and JEE rank card authenticated. Eligible for CSE allotment.',
        verifiedAt: new Date(Date.now() - 3600 * 1000 * 50),
        verifiedBy: adminUser._id
      },
      timeline: [
        { status: 'Draft', timestamp: new Date(Date.now() - 3600 * 1000 * 130), note: 'Draft created.', actor: 'Priyanka Mukherjee' },
        { status: 'Submitted', timestamp: new Date(Date.now() - 3600 * 1000 * 120), note: 'Application submitted.', actor: 'Priyanka Mukherjee' },
        { status: 'Under Review', timestamp: new Date(Date.now() - 3600 * 1000 * 60), note: 'Verification in progress.', actor: 'Admission Office (Admin)' },
        { status: 'Selected', timestamp: new Date(Date.now() - 3600 * 1000 * 12), note: 'Candidate provisionally selected for B.Tech Computer Science & Engineering.', actor: 'Admission Office (Admin)' }
      ]
    });

    console.log(' Sample applicant test accounts seeded.');
    console.log('Database seeding successfully finished!');
    process.exit(0);
  } catch (err) {
    console.error('Database seeding failed:', err);
    process.exit(1);
  }
};

seedData();
