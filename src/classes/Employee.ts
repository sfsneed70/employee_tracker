class Employee {
  private first_name: string;
  private last_name: string;
  private role: number;
  private manager: number;

  constructor(
    first_name: string,
    last_name: string,
    role: number,
    manager: number
  ) {
    this.first_name = first_name;
    this.last_name = last_name;
    this.role = role;
    this.manager = manager;
  }
}
