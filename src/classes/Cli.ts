// importing classes from other files
import pg from "pg";
import inquirer from "inquirer";
import Truck from "./Truck.js";
import Car from "./Car.js";
import Motorbike from "./Motorbike.js";
import Wheel from "./Wheel.js";
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
  // TODO: update the vehicles property to accept Truck and Motorbike objects as well
  // TODO: You will need to use the Union operator to define additional types for the array
  // TODO: See the AbleToTow interface for an example of how to use the Union operator
  vehicles: (Car | Truck | Motorbike)[];
  selectedVehicleVin: string | undefined;
  exit: boolean = false;

  //  TODO: Update the constructor to accept Truck and Motorbike objects as well
  constructor(vehicles: (Car | Truck | Motorbike)[]) {
    this.vehicles = vehicles;
  }

  // static method to generate a vin
  static generateVin(): string {
    // return a random string
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }

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
    // this.performActions();
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
    // this.performActions();
  }

  async getAllDepartments(): Promise<Department[]> {
    const client = new pg.Client(clientConfig);

    let departments: Department[] = [];

    await client.connect();

    const department = await client.query('SELECT * FROM department');

    await client.end();

    for (let i = 0; i < department.rows.length; i++) {
      departments.push(
        new Department(
          department.rows[i].id,
          department.rows[i].name
        )
      );
    }
    return departments;
    // this.performActions();
  }

  // method to choose a vehicle from existing vehicles
  chooseVehicle(): void {
    inquirer
      .prompt([
        {
          type: "list",
          name: "selectedVehicleVin",
          message: "Select a vehicle to perform an action on",
          choices: this.vehicles.map((vehicle) => {
            return {
              name: `${vehicle.vin} -- ${vehicle.make} ${vehicle.model}`,
              value: vehicle.vin,
            };
          }),
        },
      ])
      .then((answers) => {
        // set the selectedVehicleVin to the vin of the selected vehicle
        this.selectedVehicleVin = answers.selectedVehicleVin;
        // perform actions on the selected vehicle
        this.performActions();
      });
  }

  // method to create a vehicle
  createVehicle(): void {
    inquirer
      .prompt([
        {
          type: "list",
          name: "vehicleType",
          message: "Select a vehicle type",
          // TODO: Update the choices array to include Truck and Motorbike
          choices: ["Car", "Truck", "Motorbike"],
        },
      ])
      .then((answers) => {
        if (answers.vehicleType === "Car") {
          // create a car
          this.addEmployee();
        }
        // TODO: add statements to create a truck or motorbike if the user selects the respective vehicle type
        else if (answers.vehicleType === "Truck") {
          this.addDepartment();
        } else if (answers.vehicleType === "Motorbike") {
          this.addRole();
        }
      });
  }

  // method to create a car
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
        // That's it.
        {
          type: "input",
          name: "weight",
          message: "Enter Weight",
        },
        {
          type: "input",
          name: "topSpeed",
          message: "Enter Top Speed",
        },
      ])
      .then((answers) => {
        const car = new Car(
          // TODO: The generateVin method is static and should be called using the class name Cli, make sure to use Cli.generateVin() for creating a truck and motorbike as well!
          Cli.generateVin(),
          answers.color,
          answers.make,
          answers.model,
          parseInt(answers.year),
          parseInt(answers.weight),
          parseInt(answers.topSpeed),
          []
        );
        // push the car to the vehicles array
        this.vehicles.push(car);
        // set the selectedVehicleVin to the vin of the car
        this.selectedVehicleVin = car.vin;
        // perform actions on the car
        this.performActions();
      });
  }

  // method to create a car
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
        // That's it.
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
        {
          type: "input",
          name: "weight",
          message: "Enter Weight",
        },
        {
          type: "input",
          name: "topSpeed",
          message: "Enter Top Speed",
        },
      ])
      .then((answers) => {
        const car = new Car(
          // TODO: The generateVin method is static and should be called using the class name Cli, make sure to use Cli.generateVin() for creating a truck and motorbike as well!
          Cli.generateVin(),
          answers.color,
          answers.make,
          answers.model,
          parseInt(answers.year),
          parseInt(answers.weight),
          parseInt(answers.topSpeed),
          []
        );
        // push the car to the vehicles array
        this.vehicles.push(car);
        // set the selectedVehicleVin to the vin of the car
        this.selectedVehicleVin = car.vin;
        // perform actions on the car
        this.performActions();
      });
  }

  // method to create a truck
  addDepartment(): void {
    inquirer
      .prompt([
        {
          type: "input",
          name: "name",
          message: "What is the name of the department?",
        },
        // That's it.
        {
          type: "input",
          name: "make",
          message: "Enter Make",
        },
        {
          type: "input",
          name: "model",
          message: "Enter Model",
        },
        {
          type: "input",
          name: "year",
          message: "Enter Year",
        },
        {
          type: "input",
          name: "weight",
          message: "Enter Weight",
        },
        {
          type: "input",
          name: "topSpeed",
          message: "Enter Top Speed",
        },
        {
          type: "input",
          name: "towingCapacity",
          message: "Enter Towing Capacity",
        },
      ])
      .then((answers) => {
        // TODO: Use the answers object to pass the required properties to the Truck constructor
        // TODO: push the truck to the vehicles array
        // TODO: set the selectedVehicleVin to the vin of the truck
        // TODO: perform actions on the truck
        const truck = new Truck(
          Cli.generateVin(),
          answers.color,
          answers.make,
          answers.model,
          parseInt(answers.year),
          parseInt(answers.weight),
          parseInt(answers.topSpeed),
          [],
          parseInt(answers.towingCapacity)
        );
        this.vehicles.push(truck);
        this.selectedVehicleVin = truck.vin;
        this.performActions();
      });
  }

  // method to create a motorbike
  addRole(): void {
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
        // That's it.
        {
          type: "input",
          name: "make",
          message: "Enter Make",
        },
        {
          type: "input",
          name: "model",
          message: "Enter Model",
        },
        {
          type: "input",
          name: "year",
          message: "Enter Year",
        },
        {
          type: "input",
          name: "weight",
          message: "Enter Weight",
        },
        {
          type: "input",
          name: "topSpeed",
          message: "Enter Top Speed",
        },
        {
          type: "input",
          name: "frontWheelDiameter",
          message: "Enter Front Wheel Diameter",
        },
        {
          type: "input",
          name: "frontWheelBrand",
          message: "Enter Front Wheel Brand",
        },
        {
          type: "input",
          name: "rearWheelDiameter",
          message: "Enter Rear Wheel Diameter",
        },
        {
          type: "input",
          name: "rearWheelBrand",
          message: "Enter Rear Wheel Brand",
        },
      ])
      .then((answers) => {
        // TODO: Use the answers object to pass the required properties to the Motorbike constructor
        // TODO: push the motorbike to the vehicles array
        // TODO: set the selectedVehicleVin to the vin of the motorbike
        // TODO: perform actions on the motorbike
        const motorbike = new Motorbike(
          Cli.generateVin(),
          answers.color,
          answers.make,
          answers.model,
          parseInt(answers.year),
          parseInt(answers.weight),
          parseInt(answers.topSpeed),
          [
            new Wheel(
              parseInt(answers.frontWheelDiameter),
              answers.frontWheelBrand
            ),
            new Wheel(
              parseInt(answers.rearWheelDiameter),
              answers.rearWheelBrand
            ),
          ]
        );
        this.vehicles.push(motorbike);
        this.selectedVehicleVin = motorbike.vin;
        this.performActions();
      });
  }

  // method to find a vehicle to tow
  // TODO: add a parameter to accept a truck object
  findVehicleToTow(truck: Truck): void {
    inquirer
      .prompt([
        {
          type: "list",
          name: "vehicleToTow",
          message: "Select a vehicle to tow",
          choices: this.vehicles.map((vehicle) => {
            return {
              name: `${vehicle.vin} -- ${vehicle.make} ${vehicle.model}`,
              value: vehicle,
            };
          }),
        },
      ])
      .then((answers) => {
        // TODO: check if the selected vehicle is the truck
        // TODO: if it is, log that the truck cannot tow itself then perform actions on the truck to allow the user to select another action
        // TODO: if it is not, tow the selected vehicle then perform actions on the truck to allow the user to select another action
        if (answers.vehicleToTow === truck) {
          // truck cannot tow itself
          console.log("A truck cannot tow itself");
          this.performActions();
        } else {
          // tow the selected vehicle
          truck.tow(answers.vehicleToTow);
          this.performActions();
        }
      });
  }

  // method to perform actions on a vehicle
  performActions(): void {
    inquirer
      .prompt([
        {
          type: "list",
          name: "action",
          message: "What would you like to do?",
          // TODO: add options to tow and wheelie
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
        } else if (answers.action === "Start vehicle") {
          // find the selected vehicle and start it
          for (let i = 0; i < this.vehicles.length; i++) {
            if (this.vehicles[i].vin === this.selectedVehicleVin) {
              this.vehicles[i].start();
            }
          }
        } else if (answers.action === "Accelerate 5 MPH") {
          // find the selected vehicle and accelerate it by 5 MPH
          for (let i = 0; i < this.vehicles.length; i++) {
            if (this.vehicles[i].vin === this.selectedVehicleVin) {
              this.vehicles[i].accelerate(5);
            }
          }
        } else if (answers.action === "View All Roles") {
          // display all roles
          this.getAllRoles()
            .then((roles: Role[]) => {
              console.table(roles);
            })
            .then(() => this.performActions());
        } else if (answers.action === "Stop vehicle") {
          // find the selected vehicle and stop it
          for (let i = 0; i < this.vehicles.length; i++) {
            if (this.vehicles[i].vin === this.selectedVehicleVin) {
              this.vehicles[i].stop();
            }
          }
        } else if (answers.action === "View All Departments") {
          // display all departments
          this.getAllDepartments()
            .then((departments: Department[]) => {
              console.table(departments);
            })
            .then(() => this.performActions());
        } else if (answers.action === "Turn left") {
          // find the selected vehicle and turn it left
          for (let i = 0; i < this.vehicles.length; i++) {
            if (this.vehicles[i].vin === this.selectedVehicleVin) {
              this.vehicles[i].turn("left");
            }
          }
        } else if (answers.action === "Reverse") {
          // find the selected vehicle and reverse it
          for (let i = 0; i < this.vehicles.length; i++) {
            if (this.vehicles[i].vin === this.selectedVehicleVin) {
              this.vehicles[i].reverse();
            }
          }
        }
        // TODO: add statements to perform the tow action only if the selected vehicle is a truck. Call the findVehicleToTow method to find a vehicle to tow and pass the selected truck as an argument. After calling the findVehicleToTow method, you will need to return to avoid instantly calling the performActions method again since findVehicleToTow is asynchronous.
        // TODO: add statements to perform the wheelie action only if the selected vehicle is a motorbike
        else if (answers.action === "Tow") {
          for (let i = 0; i < this.vehicles.length; i++) {
            if (this.vehicles[i].vin === this.selectedVehicleVin) {
              if (this.vehicles[i] instanceof Truck) {
                // find a vehicle to tow
                this.findVehicleToTow(this.vehicles[i] as Truck);
                return;
              } else {
                // not a truck so display message
                console.log("This action is only available for trucks");
              }
            }
          }
        } else if (answers.action === "Wheelie") {
          for (let i = 0; i < this.vehicles.length; i++) {
            if (this.vehicles[i].vin === this.selectedVehicleVin) {
              if (this.vehicles[i] instanceof Motorbike) {
                // perform a wheelie on the motorbike
                (this.vehicles[i] as Motorbike).wheelie();
              } else {
                // not a motorbike so display message
                console.log("This action is only available for motorbikes");
              }
            }
          }
          // } else if (answers.action === "Select or create another vehicle") {
          //   // start the cli to return to the initial prompt if the user wants to select or create another vehicle
          //   this.startCli();
          //   return;
        } else if (answers.action === "Quit") {
          // exit the cli if the user selects exit
          this.exit = true;
        }
        if (!this.exit) {
          // if the user does not want to exit, perform actions on the selected vehicle
          // this.performActions();
        }
      });
  }

  // method to start the cli
  // startCli(): void {
  //   this.performActions();
  // }
}

// export the Cli class
export default Cli;
