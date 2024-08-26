// importing classes from other files
import pg from "pg";
import inquirer from "inquirer";
import Employee from "./Employee.js";
import Role from "./Role.js";
import Department from "./Department.js";

const clientConfig = {
  user: "postgres",
  host: "localhost",
  database: "employee_db",
};

// define the Cli class
class Cli {
  // quit: boolean = false;

  async getAllEmployees() {
    const client = new pg.Client(clientConfig);
    await client.connect();

    const employee = await client
      .query(
        `SELECT emp.id, emp.first_name, emp.last_name,
  role.title AS title, 
  department.name AS
  department, role.salary as salary,
  CONCAT(mgr.first_name, ' ', mgr.last_name) AS
  manager  FROM employee emp
  INNER JOIN role ON emp.role_id = role.id
  INNER JOIN department ON role.department = department.id
  LEFT JOIN employee mgr ON emp.manager_id = mgr.id ORDER BY emp.id ASC`
      )
      .then(async (employee) => {
        let employees: Employee[] = [];

        for (let i = 0; i < employee.rows.length; i++) {
          if (employee.rows[i].manager === ' ') {
            employee.rows[i].manager = 'Null';
          }
          employees.push(
            new Employee(
              employee.rows[i].id,
              employee.rows[i].first_name,
              employee.rows[i].last_name,
              employee.rows[i].title,
              employee.rows[i].department,
              employee.rows[i].salary,
              employee.rows[i].manager
            )
          );
        }

        await client.end();
        console.table(employees);
      })
      .then(() => this.performActions());
  }

  async getAllRoles() {
    const client = new pg.Client(clientConfig);
    await client.connect();

    const role = await client
      .query(
        `SELECT role.id, role.title,
   dept.name AS department,
   role.salary FROM role
   INNER JOIN department dept ON role.department = dept.id order by role.id ASC`
      )
      .then(async (role) => {
        let roles: Role[] = [];

        for (let i = 0; i < role.rows.length; i++) {
          roles.push(
            new Role(
              role.rows[i].id,
              role.rows[i].title,
              role.rows[i].department,
              role.rows[i].salary
            )
          );
        }

        await client.end();
        console.table(roles);
      })
      .then(() => this.performActions());
  }

  async getAllDepartments() {
    const client = new pg.Client(clientConfig);
    await client.connect();

    const department = await client
      .query(`SELECT * FROM department order by id ASC`)
      .then(async (department) => {
        let departments: Department[] = [];

        for (let i = 0; i < department.rows.length; i++) {
          departments.push(
            new Department(department.rows[i].id, department.rows[i].name)
          );
        }

        await client.end();
        console.table(departments);
      })
      .then(() => this.performActions());
    // return departments;
  }

  // method to create an employee
  async addEmployee() {
    const client = new pg.Client(clientConfig);
    client.connect();

    const roles = await client.query(`SELECT title AS name FROM role`);
    const employees = await client.query(
      `select CONCAT(first_name, ' ', last_name) AS name from employee`
    );

    employees.rows.unshift({ name: "None" });

    inquirer
      .prompt([
        {
          type: "input",
          name: "first_name",
          message: "What is the employee's first name?",
        },
        {
          type: "input",
          name: "last_name",
          message: "What is the employee's last name?",
        },
        {
          type: "list",
          name: "role",
          message: "What is the employee's role?",
          choices: roles.rows,
        },
        {
          type: "list",
          name: "manager",
          message: "Who is the employee's manager?",
          choices: employees.rows,
        },
      ])
      .then(async (answers) => {
        let manager_id;
        const role = await client.query(
          `select id from role where title = '${answers.role}'`
        );
        if (answers.manager === "None") {
          manager_id = null;
        } else {
          const manager = await client.query(
            `select id from employee where CONCAT(first_name, ' ', last_name) = '${answers.manager}'`
          );
          manager_id = manager.rows[0].id;
        }
        await client.query(
          `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ('${answers.first_name}', '${answers.last_name}', ${role.rows[0].id}, ${manager_id})`
        );
        await client.end();
      })
      .then(async () => this.performActions());
  }

  // method to update an employee's role
  async updateEmployeeRole() {
    const client = new pg.Client(clientConfig);
    client.connect();

    const roles = await client.query(`SELECT title AS name FROM role`);
    console.log(roles.rows);
    const employees = await client.query(
      `select CONCAT(first_name, ' ', last_name) AS name from employee`
    );

    inquirer
      .prompt([
        {
          type: "list",
          name: "name",
          message: "Which employee's role do you want to update?",
          choices: employees.rows,
        },
        {
          type: "list",
          name: "role",
          message: "Which role do you want to assign to the selected employee?",
          choices: roles.rows,
        },
      ])
      .then(async (answers) => {
        const role = await client.query(
          `select id from role where title = '${answers.role}'`
        );
        const employee = await client.query(
          `select id from employee where CONCAT(first_name, ' ', last_name) = '${answers.name}'`
        );
        await client.query(
          `UPDATE employee SET role_id = ${role.rows[0].id} WHERE id = ${employee.rows[0].id}`
        );
        await client.end();
      })
      .then(() => this.performActions());
  }

  // method to create a department
  async addDepartment() {
    const client = new pg.Client(clientConfig);
    await client.connect();

    inquirer
      .prompt([
        {
          type: "input",
          name: "name",
          message: "What is the name of the department?",
        },
      ])
      .then(async (answers) => {
        await client.query(
          `INSERT INTO department (name) VALUES ('${answers.name}')`
        );
        await client.end();
      })
      .then(() => this.performActions());
  }

  // method to create a role
  async addRole() {
    const client = new pg.Client(clientConfig);
    await client.connect();

    const departments = await client.query(`SELECT name FROM department`);
    inquirer
      .prompt([
        {
          type: "input",
          name: "name",
          message: "What is the name of the role?",
        },
        {
          type: "input",
          name: "salary",
          message: "What is the salary of the role?",
        },
        {
          type: "list",
          name: "department",
          message: "What department does the role belong to?",
          choices: departments.rows,
        },
      ])
      .then(async (answers) => {
        const department = await client.query(
          `SELECT id FROM department WHERE name = '${answers.department}'`
        );
        await client.query(
          `INSERT INTO role (title, salary, department) VALUES ('${answers.name}', '${answers.salary}', ${department.rows[0].id})`
        );
        await client.end();
      })
      .then(() => this.performActions());
  }

  // method to perform actions on employee_db
  performActions(): void {
    inquirer
      .prompt([
        {
          type: "list",
          name: "action",
          message: "What would you like to do?",
          choices: [
            "View All Employees",
            "Add Employee",
            "Update Employee Role",
            "View All Roles",
            "Add Role",
            "View All Departments",
            "Add Department",
            "Quit",
          ],
        },
      ])
      .then((answers) => {
        // perform the selected action
        if (answers.action === "View All Employees") {
          // display all employees
          this.getAllEmployees();
        } else if (answers.action === "Add Employee") {
          // add employee
          this.addEmployee();
        } else if (answers.action === "Update Employee Role") {
          // update employee role
          this.updateEmployeeRole();
        } else if (answers.action === "View All Roles") {
          // display all roles
          this.getAllRoles();
        } else if (answers.action === "Add Role") {
          // add role
          this.addRole();
        } else if (answers.action === "View All Departments") {
          this.getAllDepartments();
        } else if (answers.action === "Add Department") {
          // add department
          this.addDepartment();
        } else if (answers.action === "Quit") {
          // exit the cli if the user selects quit
          return;
        }
      });
  }
}

// export the Cli class
export default Cli;
