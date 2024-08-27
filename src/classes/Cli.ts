// importing classes from other files
import pg from "pg";
import inquirer from "inquirer";
import Employee from "./Employee.js";
import Role from "./Role.js";
import Department from "./Department.js";
import { pool, connectToDb } from "../connections.js";
import { printTable } from "console-table-printer";

// define the Cli class
class Cli {
  async getAllEmployees() {
    const employee = await pool
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
          if (employee.rows[i].manager === " ") {
            employee.rows[i].manager = "null";
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

        printTable(employees);
      })
      .then(() => this.performActions());
  }

  async getAllRoles() {
    const role = await pool
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

        printTable(roles);
      })
      .then(() => this.performActions());
  }

  async getAllDepartments() {
    const department = await pool
      .query(`SELECT * FROM department order by id ASC`)
      .then(async (department) => {
        let departments: Department[] = [];

        for (let i = 0; i < department.rows.length; i++) {
          departments.push(
            new Department(department.rows[i].id, department.rows[i].name)
          );
        }

        printTable(departments);
      })
      .then(() => this.performActions());
  }

  async getAllEmployeesByManager() {
    const managers = await pool.query(
      `select CONCAT(first_name, ' ', last_name) AS name from employee ORDER BY id ASC`
    );

    managers.rows.unshift({ name: "None" });

    inquirer
      .prompt([
        {
          type: "list",
          name: "manager",
          message: "Which manager's employees do you want to view?",
          choices: managers.rows,
        },
      ])
      .then(async (answers) => {
        let query;
        let employee;
        if (answers.manager === "None") {
          employee = await pool.query(`SELECT emp.id, emp.first_name, emp.last_name,
          role.title AS title, 
          department.name AS
          department, role.salary as salary,
          CONCAT(mgr.first_name, ' ', mgr.last_name) AS
          manager  FROM employee emp
          INNER JOIN role ON emp.role_id = role.id
          INNER JOIN department ON role.department = department.id
          LEFT JOIN employee mgr ON emp.manager_id = mgr.id WHERE emp.manager_id IS NULL ORDER BY emp.id ASC`);
        } else {
          const manager = await pool.query(
            `select id from employee where CONCAT(first_name, ' ', last_name) = $1`, [answers.manager]
          );
          employee = await pool.query(`SELECT emp.id, emp.first_name, emp.last_name,
          role.title AS title, 
          department.name AS
          department, role.salary as salary,
          CONCAT(mgr.first_name, ' ', mgr.last_name) AS
          manager  FROM employee emp
          INNER JOIN role ON emp.role_id = role.id
          INNER JOIN department ON role.department = department.id
          LEFT JOIN employee mgr ON emp.manager_id = mgr.id WHERE emp.manager_id = $1 ORDER BY emp.id ASC`, [manager.rows[0].id]);
        }

        // const employee = await pool.query(query, [manager.rows[0].id]);

        let employees: Employee[] = [];

        if (employee.rows.length === 0) {
          console.log("No employees found for the selected manager.");
        } else {
          for (let i = 0; i < employee.rows.length; i++) {
            if (employee.rows[i].manager === " ") {
              employee.rows[i].manager = "Null";
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
          printTable(employees);
        }
      })
      .then(async () => this.performActions());
  }

  async getAllEmployeesByDepartment() {
    const departments = await pool.query(
      `SELECT name FROM department ORDER BY id ASC`
    );
    inquirer
      .prompt([
        {
          type: "list",
          name: "department",
          message: "Which department's employees do you want to view?",
          choices: departments.rows,
        },
      ])
      .then(async (answers) => {
        const department = await pool.query(
          `SELECT id FROM department WHERE name = $1`, [answers.department]
        );
        const employee = await pool
          .query(
            `SELECT emp.id, emp.first_name, emp.last_name,
  role.title AS title, 
  department.name AS
  department, role.salary as salary,
  CONCAT(mgr.first_name, ' ', mgr.last_name) AS
  manager  FROM employee emp
  INNER JOIN role ON emp.role_id = role.id
  INNER JOIN department ON role.department = department.id
  LEFT JOIN employee mgr ON emp.manager_id = mgr.id WHERE department.id = $1 ORDER BY emp.id ASC`, [department.rows[0].id]
          )
          .then(async (employee) => {
            let employees: Employee[] = [];

            for (let i = 0; i < employee.rows.length; i++) {
              if (employee.rows[i].manager === " ") {
                employee.rows[i].manager = "Null";
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

            printTable(employees);
          })
          .then(() => this.performActions());
      });
  }

  // method to create an employee
  async addEmployee() {
    const roles = await pool.query(
      `SELECT title AS name FROM role ORDER BY id ASC`
    );
    const managers = await pool.query(
      `select CONCAT(first_name, ' ', last_name) AS name from employee ORDER BY id ASC`
    );

    managers.rows.unshift({ name: "None" });

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
          choices: managers.rows,
        },
      ])
      .then(async (answers) => {
        let manager_id;
        const role = await pool.query(
          `select id from role where title = '${answers.role}'`
        );
        if (answers.manager === "None") {
          manager_id = null;
        } else {
          const manager = await pool.query(
            `select id from employee where CONCAT(first_name, ' ', last_name) = $1`, [answers.manager]
          );
          manager_id = manager.rows[0].id;
        }
        await pool.query(
          `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)`,
          [answers.first_name, answers.last_name, role.rows[0].id, manager_id]
        );
      })
      .then(async () => this.performActions());
  }

  // method to update an employee's role
  async updateEmployeeRole() {
    const roles = await pool.query(
      `SELECT title AS name FROM role ORDER BY id ASC`
    );
    console.log(roles.rows);
    const employees = await pool.query(
      `select CONCAT(first_name, ' ', last_name) AS name from employee ORDER BY id ASC`
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
        const role = await pool.query(
          `select id from role where title = '${answers.role}'`
        );
        const employee = await pool.query(
          `select id from employee where CONCAT(first_name, ' ', last_name) = $1`, [answers.name]
        );
        await pool.query(
          `UPDATE employee SET role_id = $1 WHERE id = $2`, [role.rows[0].id, employee.rows[0].id]
        );
      })
      .then(() => this.performActions());
  }

  // method to update an employee's role
  async updateEmployeeManager() {
    const employees = await pool.query(
      `select CONCAT(first_name, ' ', last_name) AS name from employee ORDER BY id ASC`
    );
    const managers = await pool.query(
      `select CONCAT(first_name, ' ', last_name) AS name from employee ORDER BY id ASC`
    );
    managers.rows.unshift({ name: "None" });

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
          name: "manager",
          message:
            "Which manager do you want to assign to the selected employee?",
          choices: managers.rows,
        },
      ])
      .then(async (answers) => {
        let manager_id;

        if (answers.manager === "None") {
          manager_id = null;
        } else {
          const manager = await pool.query(
            `select id from employee where CONCAT(first_name, ' ', last_name) = $1`, [answers.manager]
          );
          manager_id = manager.rows[0].id;
        }
        console.log(manager_id, answers.name);
        await pool.query(
          `UPDATE employee SET manager_id = $1 WHERE CONCAT(first_name, ' ', last_name) = $2`, [manager_id, answers.name]
        );
      })
      .then(() => this.performActions());
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
        // await pool.query(
        //   `INSERT INTO department (name) VALUES ('${answers.name}')`
        // );
        await pool.query(
          `INSERT INTO department (name) VALUES ($1)`, [answers.name]
        );
      })
      .then(() => this.performActions());
  }

  // method to create a role
  async addRole() {
    const departments = await pool.query(
      `SELECT name FROM department ORDER BY id ASC`
    );
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
        const department = await pool.query(
          `SELECT id FROM department WHERE name = $1`, [answers.department]
        );
        await pool.query(
          `INSERT INTO role (title, salary, department) VALUES ($1, $2, $3)`,
          [answers.name, answers.salary, department.rows[0].id]
        );
      })
      .then(() => this.performActions());
  }

  // method to perform actions on employee_db
  performActions() {
    inquirer
      .prompt([
        {
          type: "list",
          name: "action",
          message: "What would you like to do?",
          choices: [
            "View All Employees",
            "View All Employees By Manager",
            "View All Employees By Department",
            "Add Employee",
            "Update Employee Role",
            "Update Employee Manager",
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
        } else if (answers.action === "View All Employees By Manager") {
          // display all employees by manager
          this.getAllEmployeesByManager();
        } else if (answers.action === "View All Employees By Department") {
          // display all employees by department
          this.getAllEmployeesByDepartment();
        } else if (answers.action === "Add Employee") {
          // add employee
          this.addEmployee();
        } else if (answers.action === "Update Employee Role") {
          // update employee role
          this.updateEmployeeRole();
        } else if (answers.action === "Update Employee Manager") {
          // update employee manager
          this.updateEmployeeManager();
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
          // return;
          process.exit(0);
        }
      });
  }
}

// export the Cli class
export default Cli;
