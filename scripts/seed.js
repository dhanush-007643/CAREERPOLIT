const mongoose = require('mongoose');
const config = require('../src/config/env');
const User = require('../src/models/User');
const FresherProfile = require('../src/models/FresherProfile');
const Company = require('../src/models/Company');
const Job = require('../src/models/Job');
const Application = require('../src/models/Application');
const Skill = require('../src/models/Skill');
const Assessment = require('../src/models/Assessment');
const AssessmentSubmission = require('../src/models/AssessmentSubmission');
const Follow = require('../src/models/Follow');
const Invitation = require('../src/models/Invitation');
const Interview = require('../src/models/Interview');
const Notification = require('../src/models/Notification');
const MatchResult = require('../src/models/MatchResult');
const CareerRecommendation = require('../src/models/CareerRecommendation');
const matchingEngine = require('../src/ai/MatchingEngine');
const { ROLES, APPLICATION_STATUS, INVITATION_STATUS, INTERVIEW_STATUS, ASSESSMENT_CATEGORY, WORK_MODE, EMPLOYMENT_TYPE } = require('../src/utils/constants');

const { connectDB, disconnectDB } = require('../src/config/db');

const seedData = async (options = {}) => {
  const { standalone = false, clearExisting = true } = options;

  if (config.nodeEnv === 'production' && !process.env.FORCE_SEED) {
    console.error('⚠️ Seeding is disabled in production environment for data safety.');
    if (standalone) process.exit(1);
    return;
  }

  try {
    if (standalone) {
      console.log('Connecting to database...');
      await connectDB();
      console.log('Connected to MongoDB for database seeding.');
    }

    // Clear existing collections if requested
    if (clearExisting) {
      console.log('Clearing old collections...');
      await Promise.all([
        User.deleteMany({}),
        FresherProfile.deleteMany({}),
        Company.deleteMany({}),
        Job.deleteMany({}),
        Application.deleteMany({}),
        Skill.deleteMany({}),
        Assessment.deleteMany({}),
        AssessmentSubmission.deleteMany({}),
        Follow.deleteMany({}),
        Invitation.deleteMany({}),
        Interview.deleteMany({}),
        Notification.deleteMany({}),
        MatchResult.deleteMany({}),
        CareerRecommendation.deleteMany({})
      ]);
    }

    console.log('Seeding Demo Users...');
    // 1. Admin Users
    const adminUser = await User.create({
      name: 'CareerPilot Admin',
      email: 'admin@careerpilot.io',
      password: 'Password123!',
      role: ROLES.ADMIN,
      isEmailVerified: true
    });

    await User.create({
      name: 'Demo Admin',
      email: 'admin@demo.com',
      password: 'Password123!',
      role: ROLES.ADMIN,
      isEmailVerified: true
    });

    // 2. Startup Founders / Companies
    const startupUser1 = await User.create({
      name: 'Sarah Connor',
      email: 'recruiter@techpulse.io',
      password: 'Password123!',
      role: ROLES.STARTUP,
      isEmailVerified: true
    });

    const startupUserDemo = await User.create({
      name: 'Startup Demo Recruiter',
      email: 'startup@demo.com',
      password: 'Password123!',
      role: ROLES.STARTUP,
      isEmailVerified: true
    });

    const company1 = await Company.create({
      user: startupUser1._id,
      companyName: 'TechPulse Innovations',
      logo: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=150',
      description: 'Pioneering next-gen AI cloud solutions for global enterprises.',
      aboutCompany: 'TechPulse is a fast-growing hyper-scale startup backed by top tier venture funds. We value ownership, agile velocity, and continuous craft excellence.',
      industry: 'Artificial Intelligence & SaaS',
      location: 'San Francisco, CA (Remote Friendly)',
      website: 'https://techpulse.io',
      companySize: '51-200',
      foundedYear: 2021,
      technologies: ['React', 'Node.js', 'TypeScript', 'MongoDB', 'AWS', 'Docker', 'Python'],
      isPublic: true
    });

    const startupUser2 = await User.create({
      name: 'David Vance',
      email: 'hiring@nexuscodes.com',
      password: 'Password123!',
      role: ROLES.STARTUP
    });

    const company2 = await Company.create({
      user: startupUser2._id,
      companyName: 'Nexus Codes Labs',
      logo: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=150',
      description: 'Modern developer tools & high-performance APIs.',
      aboutCompany: 'Building developer infrastructure and distributed microservices with unmatched speed.',
      industry: 'Developer Tools & Cloud',
      location: 'New York, NY',
      website: 'https://nexuscodes.com',
      companySize: '11-50',
      foundedYear: 2022,
      technologies: ['Go', 'Node.js', 'React', 'Kubernetes', 'PostgreSQL', 'GraphQL'],
      isPublic: true
    });

    await Company.create({
      user: startupUserDemo._id,
      companyName: 'Apex Innovations Demo',
      logo: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=150',
      description: 'Demo high-growth tech startup.',
      industry: 'Software & Technology',
      location: 'Remote',
      website: 'https://apex-demo.io',
      isPublic: true
    });

    // 3. Fresher Candidates
    const fresherUser1 = await User.create({
      name: 'Alex Johnson',
      email: 'alex.johnson@example.com',
      password: 'Password123!',
      role: ROLES.FRESHER,
      isEmailVerified: true
    });

    const fresherUserDemo = await User.create({
      name: 'Demo Candidate',
      email: 'fresher@demo.com',
      password: 'Password123!',
      role: ROLES.FRESHER,
      isEmailVerified: true
    });

    const fresherProfile1 = await FresherProfile.create({
      user: fresherUser1._id,
      fullName: 'Alex Johnson',
      email: fresherUser1.email,
      phone: '+1 (555) 234-5678',
      location: 'San Francisco, CA',
      education: [
        {
          degree: 'Bachelor of Science in Computer Science',
          university: 'University of California, Berkeley',
          fieldOfStudy: 'Computer Science',
          graduationYear: 2024,
          grade: '3.85 GPA'
        }
      ],
      skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Express', 'MongoDB', 'REST API', 'Git', 'HTML5', 'CSS3', 'TailwindCSS'],
      preferredRoles: ['Full Stack Developer', 'Frontend Engineer'],
      certifications: [
        {
          name: 'Meta Front-End Developer Professional Certificate',
          issuingOrganization: 'Coursera / Meta',
          issueDate: new Date('2024-01-15'),
          credentialUrl: 'https://coursera.org/verify/meta-frontend'
        }
      ]
    });

    await FresherProfile.create({
      user: fresherUserDemo._id,
      fullName: 'Demo Candidate',
      email: 'fresher@demo.com',
      skills: ['React', 'Node.js', 'TypeScript', 'MongoDB'],
      preferredRoles: ['Full Stack Developer']
    });
        {
          degree: 'Bachelor of Science in Computer Science',
          university: 'University of California, Berkeley',
          fieldOfStudy: 'Computer Science',
          graduationYear: 2024,
          grade: '3.85 GPA'
        }
      ],
      skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Express', 'MongoDB', 'REST API', 'Git', 'HTML5', 'CSS3', 'TailwindCSS'],
      certifications: [
        {
          name: 'Meta Front-End Developer Professional Certificate',
          issuingOrganization: 'Coursera / Meta',
          issueDate: new Date('2024-01-15'),
          credentialUrl: 'https://coursera.org/verify/meta-frontend'
        }
      ],
      projects: [
        {
          title: 'CareerPilot Fullstack Job Portal',
          description: 'A responsive job discovery platform with AI matching, real-time status pipelines, and resume parsing.',
          technologies: ['React', 'Node.js', 'Express', 'MongoDB', 'TailwindCSS'],
          githubUrl: 'https://github.com/demo/careerpilot-client',
          liveUrl: 'https://careerpilot.vercel.app'
        },
        {
          title: 'Cloud Kanban Board',
          description: 'Drag-and-drop task tracking tool with optimistic updates and role-based permissions.',
          technologies: ['TypeScript', 'React', 'Node.js', 'MongoDB'],
          githubUrl: 'https://github.com/demo/cloud-kanban'
        }
      ],
      experience: [
        {
          title: 'Software Engineering Intern',
          company: 'Acme Cloud Labs',
          location: 'San Francisco, CA',
          startDate: new Date('2023-06-01'),
          endDate: new Date('2023-09-01'),
          isCurrent: false,
          description: 'Built REST APIs, optimized MongoDB queries, and implemented frontend UI components in React.'
        }
      ],
      careerInterests: ['Full Stack Developer', 'Frontend Developer', 'Backend Developer'],
      preferredJobRoles: ['Full Stack Developer', 'Software Engineer', 'Frontend Engineer'],
      preferredLocations: ['San Francisco, CA', 'Remote'],
      workMode: 'REMOTE',
      portfolioUrl: 'https://alexjohnson.dev',
      gitHubUrl: 'https://github.com/alexjohnson',
      linkedInUrl: 'https://linkedin.com/in/alexjohnson-dev',
      resumeUrl: 'https://res.cloudinary.com/demo/raw/upload/v1/careerpilot/resumes/alex_johnson_resume.pdf',
      completionPercentage: 100
    });

    const fresherUser2 = await User.create({
      name: 'Maya Patel',
      email: 'maya.patel@example.com',
      password: 'Password123!',
      role: ROLES.FRESHER
    });

    const fresherProfile2 = await FresherProfile.create({
      user: fresherUser2._id,
      fullName: 'Maya Patel',
      email: fresherUser2.email,
      phone: '+1 (555) 876-5432',
      location: 'Austin, TX',
      education: [
        {
          degree: 'Bachelor of Science in Information Technology',
          university: 'University of Texas at Austin',
          fieldOfStudy: 'Software Engineering',
          graduationYear: 2024,
          grade: '3.90 GPA'
        }
      ],
      skills: ['Python', 'Node.js', 'PostgreSQL', 'MongoDB', 'Docker', 'FastAPI', 'Git', 'AWS'],
      careerInterests: ['Backend Developer', 'DevOps Engineer'],
      preferredJobRoles: ['Backend Developer', 'Cloud Engineer'],
      preferredLocations: ['Austin, TX', 'Remote'],
      workMode: 'HYBRID',
      gitHubUrl: 'https://github.com/mayapatel',
      linkedInUrl: 'https://linkedin.com/in/mayapatel-tech',
      resumeUrl: 'https://res.cloudinary.com/demo/raw/upload/v1/careerpilot/resumes/maya_patel_resume.pdf',
      completionPercentage: 85
    });

    console.log('Seeding Job Postings...');
    const job1 = await Job.create({
      company: company1._id,
      postedBy: startupUser1._id,
      title: 'Junior Full Stack Engineer (MERN)',
      description: 'We are seeking an ambitious Junior Full Stack Engineer eager to build scalable web applications using React, Node.js, Express, and MongoDB.',
      responsibilities: [
        'Develop responsive web interfaces with React and modern CSS',
        'Implement robust RESTful APIs in Node.js and Express',
        'Write clean, modular code following SOLID and OOAD principles',
        'Collaborate with product designers and engineering leads'
      ],
      qualifications: [
        'Solid foundation in JavaScript / TypeScript and ES6+',
        'Hands-on experience with React, Node.js, and MongoDB',
        'Understanding of RESTful API design and Git version control'
      ],
      requiredSkills: ['React', 'Node.js', 'MongoDB', 'Express', 'JavaScript'],
      preferredSkills: ['TypeScript', 'Docker', 'TailwindCSS', 'AWS'],
      education: { degree: 'Bachelor', field: 'Computer Science or related' },
      experience: { minYears: 0, maxYears: 2 },
      location: 'San Francisco, CA',
      workMode: WORK_MODE.REMOTE,
      employmentType: EMPLOYMENT_TYPE.FULL_TIME,
      salaryRange: { min: 75000, max: 95000, currency: 'USD', isNegotiable: true },
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: 'OPEN',
      visibility: 'PUBLIC'
    });

    const job2 = await Job.create({
      company: company1._id,
      postedBy: startupUser1._id,
      title: 'Frontend React Developer',
      description: 'Join our design system and frontend core engineering squad to create stunning user experiences.',
      responsibilities: [
        'Build and maintain scalable UI components in React',
        'Ensure web accessibility, performance optimization, and responsiveness',
        'Integrate GraphQL and REST API endpoints'
      ],
      qualifications: ['Expertise in React, JavaScript, HTML5, and CSS3'],
      requiredSkills: ['React', 'JavaScript', 'HTML5', 'CSS3'],
      preferredSkills: ['TypeScript', 'TailwindCSS', 'Next.js'],
      location: 'San Francisco, CA',
      workMode: WORK_MODE.HYBRID,
      employmentType: EMPLOYMENT_TYPE.FULL_TIME,
      salaryRange: { min: 70000, max: 90000, currency: 'USD', isNegotiable: true },
      deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
      status: 'OPEN',
      visibility: 'PUBLIC'
    });

    const job3 = await Job.create({
      company: company2._id,
      postedBy: startupUser2._id,
      title: 'Associate Backend Developer',
      description: 'Help architect microservices, database schemas, and caching layers.',
      requiredSkills: ['Node.js', 'Express', 'MongoDB', 'REST API'],
      preferredSkills: ['Docker', 'PostgreSQL', 'Redis'],
      location: 'New York, NY',
      workMode: WORK_MODE.REMOTE,
      employmentType: EMPLOYMENT_TYPE.FULL_TIME,
      salaryRange: { min: 80000, max: 100000, currency: 'USD', isNegotiable: true },
      deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      status: 'OPEN',
      visibility: 'PUBLIC'
    });

    console.log('Calculating AI Match results...');
    const matchAnalysis1 = matchingEngine.calculateMatch(fresherProfile1, job1);
    await MatchResult.create({
      fresher: fresherUser1._id,
      job: job1._id,
      ...matchAnalysis1
    });

    const matchAnalysis2 = matchingEngine.calculateMatch(fresherProfile2, job3);
    await MatchResult.create({
      fresher: fresherUser2._id,
      job: job3._id,
      ...matchAnalysis2
    });

    console.log('Seeding Applications & ATS Stages...');
    const app1 = await Application.create({
      job: job1._id,
      company: company1._id,
      fresher: fresherUser1._id,
      fresherProfile: fresherProfile1._id,
      resumeUrl: fresherProfile1.resumeUrl,
      coverLetter: 'I am excited to apply for the Junior Full Stack position. My experience building fullstack MERN apps makes me an ideal fit.',
      status: APPLICATION_STATUS.SHORTLISTED,
      matchScore: matchAnalysis1.matchScore,
      statusHistory: [
        { status: APPLICATION_STATUS.APPLIED, changedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), note: 'Application received' },
        { status: APPLICATION_STATUS.SHORTLISTED, changedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), note: 'Candidate has strong MERN stack foundation' }
      ]
    });

    const app2 = await Application.create({
      job: job3._id,
      company: company2._id,
      fresher: fresherUser2._id,
      fresherProfile: fresherProfile2._id,
      resumeUrl: fresherProfile2.resumeUrl,
      coverLetter: 'Excited about building high-performance backend pipelines.',
      status: APPLICATION_STATUS.APPLIED,
      matchScore: matchAnalysis2.matchScore,
      statusHistory: [
        { status: APPLICATION_STATUS.APPLIED, changedAt: new Date(), note: 'Applied via CareerPilot Portal' }
      ]
    });

    console.log('Seeding Follows, Invitations & Interviews...');
    await Follow.create({
      fresher: fresherUser1._id,
      company: company1._id
    });

    const invitation = await Invitation.create({
      company: company2._id,
      fresher: fresherUser1._id,
      job: job3._id,
      message: 'Alex, your fullstack projects caught our attention! We invite you to interview for our Backend role.',
      status: INVITATION_STATUS.PENDING
    });

    const interview = await Interview.create({
      application: app1._id,
      fresher: fresherUser1._id,
      company: company1._id,
      scheduledBy: startupUser1._id,
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      time: '14:00 PST',
      durationMinutes: 45,
      meetingLink: 'https://meet.google.com/abc-careerpilot-demo',
      interviewType: 'TECHNICAL',
      notes: 'Initial technical walkthrough of MERN projects and data modeling.',
      status: INTERVIEW_STATUS.SCHEDULED
    });

    console.log('Seeding Assessments & Questions...');
    const assessment1 = await Assessment.create({
      title: 'MERN Stack & Node.js Core Assessment',
      description: 'Validate your understanding of Node.js event loops, Express routing, MongoDB aggregation, and REST API architecture.',
      category: ASSESSMENT_CATEGORY.FULLSTACK,
      skillName: 'Node.js',
      durationMinutes: 20,
      passingScorePercentage: 70,
      questions: [
        {
          questionText: 'What is the primary function of the Node.js event loop?',
          options: [
            { text: 'To coordinate non-blocking I/O operations by offloading tasks to the system kernel when possible', isCorrect: true },
            { text: 'To execute synchronous multi-threading across 16 CPU cores simultaneously', isCorrect: false },
            { text: 'To compile JavaScript into machine bytecode at runtime', isCorrect: false },
            { text: 'To manage MongoDB indexes automatically', isCorrect: false }
          ],
          explanation: 'The event loop allows Node.js to perform non-blocking I/O operations despite JavaScript being single-threaded.',
          points: 25
        },
        {
          questionText: 'Which HTTP method should be used for idempotent full resource replacement in REST?',
          options: [
            { text: 'POST', isCorrect: false },
            { text: 'PUT', isCorrect: true },
            { text: 'PATCH', isCorrect: false },
            { text: 'DELETE', isCorrect: false }
          ],
          explanation: 'PUT is idempotent and replaces the entire target resource with the requested representation.',
          points: 25
        },
        {
          questionText: 'In MongoDB, which index type optimizes full-text keyword searches across multiple fields?',
          options: [
            { text: 'Compound text index', isCorrect: true },
            { text: 'Geospatial 2dsphere index', isCorrect: false },
            { text: 'Hashed index', isCorrect: false },
            { text: 'TTL Index', isCorrect: false }
          ],
          explanation: 'Text indexes support text search queries on string content across multiple schema fields.',
          points: 25
        },
        {
          questionText: 'In React, what hook is best suited to perform side-effects like fetching data after render?',
          options: [
            { text: 'useState', isCorrect: false },
            { text: 'useEffect', isCorrect: true },
            { text: 'useMemo', isCorrect: false },
            { text: 'useCallback', isCorrect: false }
          ],
          explanation: 'useEffect is specifically designed for side-effects such as HTTP requests and subscriptions.',
          points: 25
        }
      ]
    });

    // Record demo passed submission
    await AssessmentSubmission.create({
      assessment: assessment1._id,
      fresher: fresherUser1._id,
      answers: [
        { questionId: assessment1.questions[0]._id, selectedOptionId: assessment1.questions[0].options[0]._id, isCorrect: true },
        { questionId: assessment1.questions[1]._id, selectedOptionId: assessment1.questions[1].options[1]._id, isCorrect: true },
        { questionId: assessment1.questions[2]._id, selectedOptionId: assessment1.questions[2].options[0]._id, isCorrect: true },
        { questionId: assessment1.questions[3]._id, selectedOptionId: assessment1.questions[3].options[1]._id, isCorrect: true }
      ],
      score: 100,
      maxScore: 100,
      percentage: 100,
      isPassed: true
    });

    console.log('Seeding Notifications...');
    await Notification.create({
      recipient: fresherUser1._id,
      sender: startupUser1._id,
      type: 'INTERVIEW_SCHEDULED',
      title: 'Interview Scheduled: Junior Full Stack Engineer',
      message: 'TechPulse Innovations has scheduled a Technical Interview on ' + new Date(interview.date).toLocaleDateString(),
      entityId: interview._id,
      entityType: 'Interview',
      actionUrl: `/interviews/${interview._id}`,
      isRead: false
    });

    console.log('====================================================');
    console.log('✅ CareerPilot Database Seeding Completed Successfully!');
    console.log('====================================================');
    console.log('Demo Credentials:');
    console.log('  👑 Admin:     admin@careerpilot.io        / Password123!');
    console.log('  🚀 Startup:   recruiter@techpulse.io      / Password123!');
    console.log('  🚀 Startup 2: hiring@nexuscodes.com       / Password123!');
    console.log('  🎓 Fresher:   alex.johnson@example.com    / Password123!');
    console.log('  🎓 Fresher 2: maya.patel@example.com      / Password123!');
    console.log('====================================================');

    if (standalone) {
      await mongoose.disconnect();
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    if (standalone) process.exit(1);
    throw error;
  }
};

if (require.main === module) {
  seedData({ standalone: true, clearExisting: true });
}

module.exports = { seedData };
