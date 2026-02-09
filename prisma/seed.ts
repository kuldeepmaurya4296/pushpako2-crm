
// ... (imports remain same as previous seed.ts)
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database for MongoDB...');

    // Hash passwords (using bcryptjs)
    const superAdminPassword = await bcrypt.hash(
        process.env.SUPER_ADMIN_PASSWORD || 'Adiksha1920#',
        10
    );
    const hrPassword = await bcrypt.hash(
        process.env.HR_PASSWORD || 'Navneetisbest#',
        10
    );
    const defaultPassword = await bcrypt.hash('Password123!', 10);

    const superAdminEmail = (process.env.SUPER_ADMIN_EMAIL || 'Aditya@pushpako2.com').toLowerCase();
    const hrEmail = (process.env.HR_EMAIL || 'Hr@pushpako2.com').toLowerCase();
    const teamLeaderEmail = 'leader@pushpako2.com'.toLowerCase();
    const teamMemberEmail = 'employee@pushpako2.com'.toLowerCase();
    const projectManagerEmail = 'manager@pushpako2.com'.toLowerCase();

    // Create Super Admin
    const superAdmin = await prisma.user.upsert({
        where: { email: superAdminEmail },
        update: {},
        create: {
            email: superAdminEmail,
            password: superAdminPassword,
            fullName: process.env.SUPER_ADMIN_NAME || 'Aditya Kumar',
            role: 'SUPER_ADMIN',
            isActive: true,
        },
    });
    console.log('✅ Super Admin created:', superAdmin.email);

    // Create HR
    const hr = await prisma.user.upsert({
        where: { email: hrEmail },
        update: {},
        create: {
            email: hrEmail,
            password: hrPassword,
            fullName: process.env.HR_NAME || 'HR Department',
            role: 'HR',
            isActive: true,
        },
    });
    console.log('✅ HR created:', hr.email);

    // Create Project Manager
    const projectManager = await prisma.user.upsert({
        where: { email: projectManagerEmail },
        update: {},
        create: {
            email: projectManagerEmail,
            password: defaultPassword,
            fullName: 'Project Manager',
            role: 'PROJECT_MANAGER',
            isActive: true,
        },
    });
    console.log('✅ Project Manager created:', projectManager.email);

    // Create Team Leader
    const teamLeader = await prisma.user.upsert({
        where: { email: teamLeaderEmail },
        update: {},
        create: {
            email: teamLeaderEmail,
            password: defaultPassword,
            fullName: 'Team Leader',
            role: 'TEAM_LEADER',
            isActive: true,
        },
    });
    console.log('✅ Team Leader created:', teamLeader.email);

    // Create Team Member
    const teamMember = await prisma.user.upsert({
        where: { email: teamMemberEmail },
        update: {},
        create: {
            email: teamMemberEmail,
            password: defaultPassword,
            fullName: 'John Doe',
            role: 'TEAM_MEMBER',
            isActive: true,
        },
    });
    console.log('✅ Team Member created:', teamMember.email);

    // Create sample team
    const sampleTeam = await prisma.team.create({
        data: {
            name: 'Development Team',
            description: 'Core development team',
            leaderId: teamLeader.id, // Assign to Team Leader
            members: {
                create: [
                    { userId: teamLeader.id },
                    { userId: teamMember.id },
                    { userId: projectManager.id }
                ]
            }
        },
    });
    console.log('✅ Sample team created:', sampleTeam.name);

    // Create sample group
    const sampleGroup = await prisma.group.create({
        data: {
            name: 'Engineering Department',
            description: 'All engineering personnel',
        },
    });
    console.log('✅ Sample group created:', sampleGroup.name);

    // Create dummy projects and tasks
    const project1 = await prisma.project.create({
        data: {
            name: 'CRM Migration',
            description: 'Migrating Legacy CRM to Next.js',
            teamId: sampleTeam.id,
            managerId: projectManager.id, // Assign to Project Manager
            status: 'ACTIVE',
            startDate: new Date(),
        }
    });
    console.log('✅ Sample project created:', project1.name);

    const task1 = await prisma.task.create({
        data: {
            title: 'Setup Project Structure',
            description: 'Initialize Next.js and Prisma',
            projectId: project1.id,
            teamId: sampleTeam.id,
            assignedToId: teamMember.id, // Assign to Member
            createdById: projectManager.id,
            status: 'COMPLETED',
            priority: 'HIGH',
            deadline: new Date(new Date().setDate(new Date().getDate() + 7)),
        }
    });

    const task2 = await prisma.task.create({
        data: {
            title: 'Database Migration',
            description: 'Migrate to MongoDB',
            projectId: project1.id,
            teamId: sampleTeam.id,
            assignedToId: teamLeader.id, // Assign to Leader
            createdById: projectManager.id,
            status: 'TODO',
            priority: 'HIGH',
            deadline: new Date(new Date().setDate(new Date().getDate() + 3)),
        }
    });

    console.log('✅ Sample tasks created');

    console.log('🎉 Seeding completed successfully!');
    console.log('\n📝 Credentials:');
    console.log('Super Admin:', superAdminEmail);
    console.log('HR:', hrEmail);
    console.log('Project Manager:', projectManagerEmail);
    console.log('Team Leader:', teamLeaderEmail);
    console.log('Team Member:', teamMemberEmail);
    console.log('Default Password for new users: Password123!');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
