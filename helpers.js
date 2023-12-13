const db = require('./db');
async function getRoles() {
  try {
    const results = await db.query('SELECT * FROM roles');
    return results[0].map((role) => ({
      name: role.title,
      value: role.id,
    }));
  } catch (error) {
    console.error(error);
    return [];
  }
}

// Get list of managers
async function getManagers() {
  try {
    const results = await db.query('SELECT * FROM employee');
    const managers = results[0].map((employee) => ({
      name: `${employee.first_name} ${employee.last_name}`,
      value: employee.id,
    }));

    // Option for null manager
    managers.unshift({
      name: 'No manager',
      value: null,
    });

    return managers;
  } catch (error) {
    console.error(error);
    return [];
  }
}

// Get list of employees
async function getEmployees() {
  try {
    const [results, _] = await db.query('SELECT * FROM employee');
    return results.map((employee) => ({
      name: `${employee.first_name} ${employee.last_name}`,
      value: employee.id,
    }));
  } catch (error) {
    console.error(error);
    return [];
  }
}

// Get list of departments
async function getDepartments() {
  try {
    const query = 'SELECT * FROM department';
    const [results] = await db.query(query);

    return results.map((department) => ({
      name: department.names,
      value: department.id,
    }));
  } catch (error) {
    console.error(error);
    return [];
  }
}

// Update Employee Role
async function updateEmployeeRole(employeeId, newRoleId) {
  try {
    const sql = 'UPDATE employee SET role_id = ? WHERE id = ?';
    const values = [newRoleId, employeeId];
    await db.query(sql, values);
  } catch (error) {
    console.error(error);
  }
}

// Update Employee Salary
async function updateEmployeeSalary(employeeId, newSalary) {
  try {
    const sql = 'UPDATE employee SET salary = ? WHERE id = ?';
    const values = [newSalary, employeeId];
    await db.query(sql, values);
  } catch (error) {
    console.error(error);
  }
}

// Update Employee Department
async function updateEmployeeDepartment(employeeId, newDepartmentId) {
  try {
    const sql = 'UPDATE employee SET department_id = ? WHERE id = ?';
    const values = [newDepartmentId, employeeId];
    await db.query(sql, values);
  } catch (error) {
    console.error(error);
  }
}

// Update Employee Manager
async function updateEmployeeManager(employeeId, newManagerId) {
  try {
    const sql = 'UPDATE employee SET manager_id = ? WHERE id = ?';
    const values = [newManagerId, employeeId];
    await db.query(sql, values);
  } catch (error) {
    console.error(error);
  }
}

module.exports = {
  getRoles,
  getManagers,
  getEmployees,
  getDepartments,
  updateEmployeeRole,
  updateEmployeeSalary,
  updateEmployeeDepartment,
  updateEmployeeManager,
};
