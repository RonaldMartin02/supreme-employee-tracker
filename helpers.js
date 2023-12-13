const db = require('./db/db');
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

async function getManagers() {
  try {
    const results = await db.query('SELECT * FROM employee');
    const managers = results[0].map((employee) => ({
      name: `${employee.first_name} ${employee.last_name}`,
      value: employee.id,
    }));

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

async function updateEmployeeRole(employeeId, newRoleId) {
  try {
    const sql = 'UPDATE employee SET role_id = ? WHERE id = ?';
    const values = [newRoleId, employeeId];
    await db.query(sql, values);
  } catch (error) {
    console.error(error);
  }
}

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
  updateEmployeeManager
};
