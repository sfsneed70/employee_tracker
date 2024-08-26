// import classes
import Truck from "./classes/Truck.js";
import Car from "./classes/Car.js";
import Motorbike from "./classes/Motorbike.js";
import Wheel from "./classes/Wheel.js";
import Cli from "./classes/Cli.js";

// // setup database connection
// const { Client } = pg;
// const client = new Client({
//   user: "postgres",
//   host: "localhost",
//   database: "employee_db",
// });

// // create an array of vehicles
const vehicles = [];

// TODO: uncomment once trucks are implemented
const truck1 = new Truck(
  Cli.generateVin(),
  "red",
  "Ford",
  "F-150",
  2021,
  5000,
  120,
  [],
  10000
);

// will use default wheels
const car1 = new Car(
  Cli.generateVin(),
  "blue",
  "Toyota",
  "Camry",
  2021,
  3000,
  130,
  []
);

// TODO: uncomment once motorbikes are implemented
const motorbike1Wheels = [new Wheel(17, "Michelin"), new Wheel(17, "Michelin")];
const motorbike1 = new Motorbike(
  Cli.generateVin(),
  "black",
  "Harley Davidson",
  "Sportster",
  2021,
  500,
  125,
  motorbike1Wheels
);

// push vehicles to array
// TODO: uncomment once trucks are implemented
vehicles.push(truck1);
vehicles.push(car1);
// TODO: uncomment once motorbikes are implemented
vehicles.push(motorbike1);

// // create a new instance of the Cli class
const cli = new Cli(vehicles);

// start the cli
cli.performActions();



// await client.connect();

// let myname = "stuff";
// const insert = await client.query(`INSERT INTO department (name) VALUES ('${myname}')`);

// const department = await client.query('SELECT * FROM department');
// console.table(department.rows);
// const role = await client.query(`SELECT role.id, role.title,
//    dept.name AS department,
//    role.salary FROM role
//    INNER JOIN department dept ON role.department = dept.id`);
// console.table(role.rows);
// const employee =
//   await client.query(`SELECT emp.id, emp.first_name, emp.last_name,
//     role.title AS title, 
//     department.name AS
//   department, role.salary as salary,
//   CONCAT(mgr.first_name, ' ', mgr.last_name) AS
//   manager  FROM employee emp
//   INNER JOIN role ON emp.role_id = role.id
//   INNER JOIN department ON role.department = department.id
//   LEFT JOIN employee mgr ON emp.manager_id = mgr.id`);
// console.table(employee.rows);

// await client.end();
// console.log(client);
