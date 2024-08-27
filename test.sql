SELECT emp.id, emp.first_name, emp.last_name,
  role.title AS title, 
  department.name AS
  department, role.salary as salary,
  CONCAT(mgr.first_name, ' ', mgr.last_name) AS
  manager  FROM employee emp
  INNER JOIN role ON emp.role_id = role.id
  INNER JOIN department ON role.department = department.id
  LEFT JOIN employee mgr ON emp.manager_id = mgr.id ORDER BY emp.id ASC;