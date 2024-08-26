class Employee {
  private id: number;
  private first_name: string;
  private last_name: string;
  private title: string;
  private department: string;
  private salary: number;
  private manager: string;

  constructor(
    id: number,
    first_name: string,
    last_name: string,
    title: string,
    department: string,
    salary: number,
    manager: string
  ) {
    this.id = id;
    this.first_name = first_name;
    this.last_name = last_name;
    this.title = title;
    this.department = department;
    this.salary = salary;
    this.manager = manager;
  }
}

export default Employee;
