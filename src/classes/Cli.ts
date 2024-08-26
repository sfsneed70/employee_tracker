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

  async getAllEmployees(): Promise<Employee[]> {
    const client = new pg.Client(clientConfig);
    let employees: Employee[] = [];

    await client.connect();

    const employee =
      await client.query(`SELECT emp.id, emp.first_name, emp.last_name,
  role.title AS title, 
  department.name AS
  department, role.salary as salary,
  CONCAT(mgr.first_name, ' ', mgr.last_name) AS
  manager  FROM employee emp
  INNER JOIN role ON emp.role_id = role.id
  INNER JOIN department ON role.department = department.id
  LEFT JOIN employee mgr ON emp.manager_id = mgr.id`);

    await client.end();

    for (let i = 0; i < employee.rows.length; i++) {
      if (employee.rows[i].manager === " ") {
        employee.rows[i].manager = "None";
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
    return employees;
  }

  async getAllRoles(): Promise<Role[]> {
    const client = new pg.Client(clientConfig);

    let roles: Role[] = [];

    await client.connect();

    const role = await client.query(`SELECT role.id, role.title,
   dept.name AS department,
   role.salary FROM role
   INNER JOIN department dept ON role.department = dept.id`);

    await client.end();

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
    return roles;
  }

  async getAllDepartments(): Promise<Department[]> {
    const client = new pg.Client(clientConfig);

    let departments: Department[] = [];

    await client.connect();

    const department = await client.query(`SELECT * FROM department`);

    await client.end();

    for (let i = 0; i < department.rows.length; i++) {
      departments.push(
        new Department(department.rows[i].id, department.rows[i].name)
      );
    }
    return departments;
  }

  // method to create an employee
  addEmployee(): void {
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
          type: "input",
          name: "role",
          message: "What is the employee's role?",
        },
        {
          type: "input",
          name: "manager",
          message: "Who is the employee's manager?",
        },
      ])
      .then((answers) => {});
  }

  // method to update an employee's role
  updateEmployeeRole(): void {
    inquirer
      .prompt([
        {
          type: "input",
          name: "name",
          message: "Which employee's role do you want to update?",
        },
        {
          type: "input",
          name: "role",
          message: "Which role do you want to assign to the selected employee?",
        },
      ])
      .then((answers) => {});
  }

  // method to create a department
  async addDepartment() {
    inquirer
      .prompt([
        {
          type: "input",
          name: "name",
          message: "What is the name of the department?",
        },
      ])
      .then(async (answers) => {
        const client = new pg.Client(clientConfig);

        await client.connect();

        const department = await client.query(
          `INSERT INTO department (name) VALUES ('${answers.name}')`
        );

        await client.end();
      })
      .then(() => this.performActions());
  }

  // method to create a role
  async addRole() {
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
          type: "input",
          name: "department",
          message: "What department does the role belong to?",
        },
      ])
      .then(async (answers) => {
        const client = new pg.Client(clientConfig);
        await client.connect();
        const role = await client.query(
          `INSERT INTO role (title, salary, department) VALUES ('${answers.name}', '${answers.salary}', '${answers.department}')`
        );
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
          this.getAllEmployees()
            .then((employees: Employee[]) => {
              console.table(employees);
            })
            .then(() => this.performActions());
        } else if (answers.action === "Add Employee") {
          // add employee
        } else if (answers.action === "Update Employee Role") {
          // update employee role
        } else if (answers.action === "View All Roles") {
          // display all roles
          this.getAllRoles()
            .then((roles: Role[]) => {
              console.table(roles);
            })
            .then(() => this.performActions());
        } else if (answers.action === "Add Role") {
          // add role
          this.addRole();
        } else if (answers.action === "View All Departments") {
          // display all departments
          this.getAllDepartments()
            .then((departments: Department[]) => {
              console.table(departments);
            })
            .then(() => this.performActions());
        } else if (answers.action === "Add Department") {
          // add department
          this.addDepartment();
        } else if (answers.action === "Quit") {
          // exit the cli if the user selects quit
          // this.quit = true;
          return;
        }
        // if (!this.quit) {
        //   // this.performActions();
        // }
      });
  }
}

// export the Cli class
export default Cli;
