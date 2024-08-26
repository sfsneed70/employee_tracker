class Role {
  private id: number;
  private title: string;
  private salary: number;
  private department: string;

  constructor(id: number, title: string, department: string, salary: number) {
    this.id = id;
    this.title = title;
    this.salary = salary;
    this.department = department;
  }
}

export default Role;
