// scripts/seed.js
// Run: MONGO_URI="mongodb://..." node scripts/seed.js
import mongoose, { mongo } from "mongoose";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import { faker } from "@faker-js/faker";

// import your models (adjust paths if necessary)
import Department from "../odoo-clone-backend/models/Department.js";
import Education from "../odoo-clone-backend/models/Education.js";
import EducationPrivate from "../odoo-clone-backend/models/EducationPrivate.js";
import EmergencyContact from "../odoo-clone-backend/models/EmergencyContact.js";
import Employee from "../odoo-clone-backend/models/Employee.js";

import EmployeeSettings from "../odoo-clone-backend/models/EmployeeSettings.js";
import Experience from "../odoo-clone-backend/models/Experience.js";
import FamilyStatus from "../odoo-clone-backend/models/FamilyStatus.js";
import LanguageSkill from "../odoo-clone-backend/models/LanguageSkill.js";
import OtherSkill from "../odoo-clone-backend/models/OtherSkill.js";
import PrivateContact from "../odoo-clone-backend/models/PrivateContact.js";
import ProgrammingSkill from "../odoo-clone-backend/models/ProgrammingSkill.js";
import WorkInfo from "../odoo-clone-backend/models/WorkInfo.js";
import WorkPermit from "../odoo-clone-backend/models/WorkPermit.js";
import User from "../odoo-clone-backend/models/user.js";


const SALT_ROUNDS = 10;

function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randomTags() {
  const tags = ["full-time", "part-time", "remote", "contractor", "senior", "junior"];
  return faker.helpers.uniqueArray(tags, randInt(0, 3));
}

async function connect() {
  await mongoose.connect("mongodb+srv://hr_app_user:zoSTeF8tXGbgBulk@cluster0.elyy2t1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");
  console.log("Connected to", mongo.Employee);
}

async function clearAll() {
  // Collections to clear - be careful
  const models = [
    Department, Education, EducationPrivate, EmergencyContact, Employee,
     EmployeeSettings, Experience, FamilyStatus,
    LanguageSkill, OtherSkill, PrivateContact, ProgrammingSkill,
    WorkInfo, WorkPermit, User
  ];

  for (const M of models) {
    try {
      await M.deleteMany({});
      console.log(`Cleared ${M.modelName}`);
    } catch (err) {
      console.warn(`Failed to clear ${M.modelName}:`, err.message);
    }
  }
}

/**
 * Create support docs for an employee
 * Note: your schemas mostly use employee_id fields (per your models).
 */
async function createSupportFor(emp) {
  const employeeId = emp._id;

  // Some random chance to include certain docs
  if (Math.random() > 0.1) {
    await Education.create({
      employee_id: employeeId,
      title: pick(["BSc Computer Science", "MSc Software Engineering", "BBA", "Diploma"]),
      from_date: faker.date.past(8),
      to_date: faker.date.recent(365),
      school: faker.company.name()
    });
  }

  if (Math.random() > 0.05) {
    await Experience.create({
      employee_id: employeeId,
      date_from: faker.date.past(6),
      date_to: faker.date.recent(),
      title: emp.job_position,
      job_description: faker.lorem.sentences(2)
    });
  }

  // programming skills 0..3
  const progCount = randInt(0, 3);
  for (let i = 0; i < progCount; i++) {
    await ProgrammingSkill.create({
      employee_id: employeeId,
      name: pick(["JavaScript", "TypeScript", "Python", "Java", "C#", "Go"]),
      level: pick(["Beginner","Intermediate","Advanced","Expert"]),
      percentage: randInt(40, 100)
    });
  }

  // languages
  const langCount = randInt(0, 2);
  for (let i = 0; i < langCount; i++) {
    await LanguageSkill.create({
      employee_id: employeeId,
      language_name: pick(["English","Spanish","French","German","Arabic"]),
      level: pick(["Basic","Good","Fluent","Native"]),
      percentage: randInt(50, 100)
    });
  }

  // other skills
  const otherCount = randInt(0, 2);
  for (let i = 0; i < otherCount; i++) {
    await OtherSkill.create({
      employee_id: employeeId,
      category: pick(["Communication","Management","Design","QA"]),
      skill_name: faker.hacker.verb(),
      level: pick(["Good","Average","Excellent"]),
      percentage: randInt(40, 95)
    });
  }

await PrivateContact.create({
  employee_id: employeeId,
  street: faker.location.streetAddress(),
  city: faker.location.city(),
  state: faker.location.state(),
  zip: faker.location.zipCode(),
  country: faker.location.country(),
  private_email: `private.${faker.internet.email()}`,
  private_phone: faker.phone.number()
});


 await EmergencyContact.create({
  employee_id: employeeId,
  contact_name: faker.person.fullName(),
  contact_phone: faker.phone.number()
});


  await FamilyStatus.create({
    employee_id: employeeId,
    marital_status: pick(["Single","Married","Divorced"]),
    spouse_name: Math.random() > 0.7 ? faker.person.fullName() : "",
    spouse_birthday: Math.random() > 0.7 ? faker.date.past(20) : null,
    dependent_children: Math.random() > 0.6 ? randInt(0,4) : 0
  });

  await WorkPermit.create({
    employee_id: employeeId,
    visa_no: faker.string.alphanumeric(8).toUpperCase(),
    work_permit: faker.string.alphanumeric(8),
    visa_expiration: faker.date.future(2),
    permit_expiration: faker.date.future(1)
  });

  await EmployeeSettings.create({
    employee_id: employeeId,
    employee_type: pick(["Full-time","Part-time","Contractor"]),
    related_user: emp.full_name,
    hourly_cost: randInt(10, 120),
    pos_pin_code: ("" + randInt(1000,9999)),
    badge_id: `B${String(employeeId).slice(-6)}`
  });

  await WorkInfo.create({
    employee_id: employeeId,
    work_address: faker.location.streetAddress(),
    work_location: pick(["Office","Remote","Hybrid"]),
    approver_timeoff_id: null,
    approver_timesheet_id: null,
    working_hours: pick(["9:00 - 17:00","10:00 - 18:00","Flexible"]),
    timezone: pick(["UTC","PST","EST","CET"])
  });
}

/**
 * Create a user + employee pair.
 * role = one of "admin","manager","team_lead","employee"
 * For team lead we will set the emp.coach_id to the lead (so coach_id acts as team_lead)
 */
async function createEmployeeUser({ full_name, job_position, email, password, role, department = null, manager = null, teamLead = null }) {
  const empDoc = await Employee.create({
    full_name,
    status: pick(["online","offline"]),
    job_position,
    work_email: email,
    work_phone: faker.phone.number(),
    work_mobile: faker.phone.number(),
    image: faker.image.avatar(),
    tags: randomTags(),
    company: "Tech Solutions Inc.",
    department_id: department ? department._id : null,
    manager_id: manager ? manager._id : null,
    coach_id: teamLead ? teamLead._id : null
  });

  await createSupportFor(empDoc);

  const pwHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await User.create({
    email,
    passwordHash: pwHash,
    role,
    employee: empDoc._id
  });

  return { emp: empDoc, user };
}

async function seed() {
  await connect();
  console.log("Clearing collections...");
  await clearAll();

  // Create departments
  const deptNames = ["Engineering", "HR", "Sales"];
  const departments = [];
  for (const name of deptNames) {
    const d = await Department.create({ name, company: "Tech Solutions Inc." });
    departments.push(d);
  }
  console.log("Departments:", deptNames.join(", "));

  // We'll create 20 employees total (including managers and team leads).
  const TOTAL_EMPLOYEES = 20;

  // Make an admin account (admin user + employee profile)
  const adminCreds = { email: "admin@example.com", password: "admin123" };
  const { emp: adminEmp, user: adminUser } = await createEmployeeUser({
    full_name: "System Administrator",
    job_position: "Administrator",
    email: adminCreds.email,
    password: adminCreds.password,
    role: "admin",
    department: null,
    manager: null,
    teamLead: null
  });

  // We'll collect credentials to write to file for quick UI testing:
  const seedAccounts = [
    { role: "admin", email: adminCreds.email, password: adminCreds.password }
  ];

  // We need at least one manager and one team_lead per department.
  // We'll create employees by department; for each department:
  //  - create a manager (role: manager)
  //  - create a team lead (role: team_lead) reporting to manager
  //  - create remaining employees reporting to manager and team lead
  //
  // Distribute total employees evenly across departments.
  const perDeptBase = Math.floor(TOTAL_EMPLOYEES / departments.length); // e.g. 6
  let remaining = TOTAL_EMPLOYEES - perDeptBase * departments.length; // remainder

  let created = []; // store created employees

  for (let di = 0; di < departments.length; di++) {
    const dept = departments[di];
    const count = perDeptBase + (remaining > 0 ? 1 : 0);
    if (remaining > 0) remaining--;

    // Manager
    const mgrEmail = `${dept.name.toLowerCase().replace(/\s+/g,'')}.manager@seed.local`;
    const mgrPass = "manager123";
    const { emp: mgrEmp, user: mgrUser } = await createEmployeeUser({
      full_name: `${dept.name} Manager`,
      job_position: "Department Manager",
      email: mgrEmail,
      password: mgrPass,
      role: "manager",
      department: dept
    });
    // set department's manager
    dept.manager_id = mgrEmp._id;
    await dept.save();

    // Save one manager credential to seedAccounts (first one only)
    if (!seedAccounts.some(a => a.role === "manager")) seedAccounts.push({ role: "manager", email: mgrEmail, password: mgrPass });

    // Team lead
    const leadEmail = `${dept.name.toLowerCase().replace(/\s+/g,'')}.lead@seed.local`;
    const leadPass = "teamlead123";
    const { emp: leadEmp, user: leadUser } = await createEmployeeUser({
      full_name: `${dept.name} Team Lead`,
      job_position: "Team Lead",
      email: leadEmail,
      password: leadPass,
      role: "team_lead",
      department: dept,
      manager: mgrEmp
    });

    if (!seedAccounts.some(a => a.role === "team_lead")) seedAccounts.push({ role: "team_lead", email: leadEmail, password: leadPass });

    // Create remaining employees for this dept: (count - 2) since manager + lead already created
    const empCount = Math.max(0, count - 2);
    for (let i = 1; i <= empCount; i++) {
      const eEmail = `${dept.name.toLowerCase().replace(/\s+/g,'')}.emp${i}@seed.local`;
      const ePass = `employee${i}pass`;
      const name = `${dept.name} Employee ${i}`;
      const { emp: eEmp, user: eUser } = await createEmployeeUser({
        full_name: name,
        job_position: pick(["Software Engineer","HR Specialist","Sales Rep","QA Engineer"]),
        email: eEmail,
        password: ePass,
        role: "employee",
        department: dept,
        manager: mgrEmp,
        teamLead: leadEmp
      });

      // Save first normal employee credentials for testing
      if (!seedAccounts.some(a => a.role === "employee")) {
        seedAccounts.push({ role: "employee", email: eEmail, password: ePass });
      }

      created.push({ dept: dept.name, emp: eEmp, user: eUser });
    }

    // keep manager and lead also in created list
    created.push({ dept: dept.name, emp: mgrEmp, user: mgrUser, role: "manager" });
    created.push({ dept: dept.name, emp: leadEmp, user: leadUser, role: "team_lead" });
  }

  // If we created fewer than TOTAL_EMPLOYEES (edge cases), create extra employees in first department
  while (created.filter(c => c.emp).length < TOTAL_EMPLOYEES) {
    const dept = departments[0];
    const idx = created.filter(c => c.emp).length + 1;
    const eEmail = `${dept.name.toLowerCase().replace(/\s+/g,'')}.extra${idx}@seed.local`;
    const ePass = `employee${idx}pass`;
    const { emp: eEmp, user: eUser } = await createEmployeeUser({
      full_name: `${dept.name} Extra ${idx}`,
      job_position: pick(["Software Engineer","Designer","Sales Rep"]),
      email: eEmail,
      password: ePass,
      role: "employee",
      department: dept,
      manager: null,
      teamLead: null
    });
    created.push({ dept: dept.name, emp: eEmp, user: eUser });
  }

  // Write accounts file
  const outPath = path.join(process.cwd(), "scripts", "seed-accounts.json");
  fs.writeFileSync(outPath, JSON.stringify(seedAccounts, null, 2));
  console.log("Seed accounts written to:", outPath);
  console.log("Accounts (first ones):", seedAccounts);

  // Done
  await mongoose.disconnect();
  console.log("Seeding finished and DB connection closed.");
}

seed().catch(err => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
