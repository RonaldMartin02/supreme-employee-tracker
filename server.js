const mysql = require('mysql2');
const inquirer = require('inquirer');
const db = require('./db');
const helpers = require('./helpers');
const options = [
  {
    type: 'list',
    message: "What would you like to do:",
    name: 'options',
    choices: [
      'View All Departments',
      'View All Roles',
      'View All Employees',
      'Add Department',
      'Add Role',
      'Add Employee',
      'Update Employee',
      'Delete Employee',
      'Quit'
    ]
  },
];
function init() {
      promptUser();
};
function promptUser() {
  inquirer.prompt(options).then((answer) => {
      switch (answer.options) {
        case 'View All Departments':
          viewAllDepartments();
          break;
        case 'View All Roles':
          viewAllRoles();
          break;
        case 'View All Employees':
          viewAllEmployees();
          break;
        case 'Add Department':
          addDepartment();
          break;
        case 'Add Role':
          addRole();
          break;
        case 'Add Employee':
          addEmployee();
          break;
        case 'Update Employee':
          updateEmployee();
          break;
        case 'Delete Employee':
          deleteEmployee();
          break;
        case 'Quit':
          quit();
          break;
      }
    });
};
async function viewAllDepartments() {
  try {
    const query = 'SELECT * FROM department';
    const [results, _] = await db.query(query);
    console.table(results);
    init();
  } catch (error) {
    console.error(error);
  }
};
async function viewAllRoles() {
  try {
    const query = `
    SELECT 
      roles.id, 
      roles.title, 
      roles.salary, 
      roles.department_id 
    FROM roles`;
    const [results, _] = await db.query(query);
    console.table(results);
    init();
  } catch (error) {
    console.error(error);
  }
};
async function viewAllEmployees() {
  try {
    const query = `
    SELECT 
      employee.id, 
      CONCAT(employee.first_name, ' ', employee.last_name) AS employee_name, 
      roles.title AS job_title,
      roles.salary,
      department.names AS department,
      CONCAT(manager.first_name, ' ', manager.last_name) AS manager
    FROM employee
    LEFT JOIN employee manager ON employee.manager_id = manager.id
    INNER JOIN roles ON employee.role_id = roles.id
    INNER JOIN department ON roles.department_id = department.id`;
    const [results] = await db.query(query);
    console.table(results);
    init();
  } catch (error) {
    console.error(error);
  }
};
async function addDepartment() {
  try {
    const question = [
      {
        type: 'input',
        message: 'Enter the department name:',
        name: 'departmentName'
      }
    ];

    const answer = await inquirer.prompt(question);

    // Insert the department into the database
    const sql = 'INSERT INTO department (names) VALUES (?)';
    const values = [answer.departmentName];
    await db.query(sql, values);

    console.log("Department successfully added!");
    init();
  } catch (error) {
    console.error(error);
  }
};
async function addRole() {
  try {
    const departments = await helpers.getDepartments();

    const questions = [
      {
        type: 'input',
        message: 'Enter the role title:',
        name: 'roleTitle'
      },
      {
        type: 'input',
        message: 'Enter the role salary:',
        name: 'roleSalary'
      },
      {
        type: 'list',
        message: 'Select the department for the role:',
        name: 'roleDepartment',
        choices: departments
      }
    ];
    const answers = await inquirer.prompt(questions);
    const sql = 'INSERT INTO roles (title, salary, department_id) VALUES (?, ?, ?)';
    const values = [answers.roleTitle, answers.roleSalary, answers.roleDepartment];
    await db.query(sql, values);
    console.log("Role successfully added!");
    init();
  } catch (error) {
    console.error(error);
  }
};
async function addEmployee() {
  try {
    const roles = await helpers.getRoles();
    const managers = await helpers.getManagers();

    const questions = [
      {
        type: 'input',
        message: 'Enter employees first name:',
        name: 'firstNameForNewEmployee'
      },
      {
        type: 'input',
        message: 'Enter employees last name:',
        name: 'lastNameForNewEmployee'
      },
      {
        type: 'list',
        message: 'Select the employees role:',
        name: 'roleForNewEmployee',
        choices: roles
      },
      {
        type: 'list',
        message: 'Select the employees manager:',
        name: 'managerForNewEmployee',
        choices: managers
      }
    ];

    const answers = await inquirer.prompt(questions);
    // Insert the employee into the database
    const sql = 'INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)';
    const values = [
      answers.firstNameForNewEmployee,
      answers.lastNameForNewEmployee,
      answers.roleForNewEmployee,
      answers.managerForNewEmployee,
    ];
    await db.query(sql, values);

    console.log("Employee successfully added!");
    init();
  } catch (error) {
    console.error(error);
  }
};
async function updateEmployee() {

  try {
    const employees = await helpers.getEmployees();
    const roles = await helpers.getRoles();
    const departments = await helpers.getDepartments();
    const managers = await helpers.getManagers();

    const questions = [
      {
        type: 'list',
        message: "Select the employee you'd like to update:",
        name: 'employeeToUpdate',
        choices: employees
      },
      {
        type: 'list',
        message: 'Select the information to update:',
        name: 'infoToUpdate',
        choices: ['Role', 'Salary', 'Department', 'Manager']
      }
    ];

    const { infoToUpdate, employeeToUpdate } = await inquirer.prompt(questions);

    switch (infoToUpdate) {
      // UPDATE EMPLOYEE ROLE
      case 'Role':
        const { newRoleId } = await inquirer.prompt([
          {
            type: 'list',
            message: 'Select the employees new role:',
            name: 'newRoleId',
            choices: roles
          }
        ]);
        await helpers.updateEmployeeRole(employeeToUpdate, newRoleId);
        console.log('Employee role successfully updated!');
        break;
      // UPDATE EMPLOYEE SALARY
      case 'Salary':
        const { newSalary } = await inquirer.prompt([
          {
            type: 'input',
            message: 'Enter the employees new salary:',
            name: 'newSalary'
          }
        ]);
        await helpers.updateEmployeeSalary(employeeToUpdate, newSalary);
        console.log('Employee salary successfully updated!');
        break;
      // UPDATE EMPLOYEE DEPARTMENT
      case 'Department':
        const { newDepartmentId } = await inquirer.prompt([
          {
            type: 'list',
            message: 'Select the employees new department:',
            name: 'newDepartmentId',
            choices: departments
          }
        ]);
        await helpers.updateEmployeeDepartment(employeeToUpdate, newDepartmentId);
        console.log('Employee department successfully updated!');
        break;
      // UPDATE EMPLOYEE MANAGER
      case 'Manager':
        const { newManagerId } = await inquirer.prompt([
          {
            type: 'list',
            message: 'Select the employees new manager:',
            name: 'newManagerId',
            choices: managers
          }
        ]);
        await helpers.updateEmployeeManager(employeeToUpdate, newManagerId);
        console.log('Employee manager successfully updated!');
        break;
      default:
        console.log('Invalid selection');
        break;
    }
  } catch (error) {
    console.error(error);
  }
  init();
};
async function deleteEmployee() {
  try {
    const employees = await helpers.getEmployees();

    const { employeeToDelete } = await inquirer.prompt([
      {
        type: 'list',
        message: `***CAUTION ALL EMPLOYEE INFORMATION IS DELETED IMMEDIATELY AFTER SELECTION*** If you're sure you'd like to move forward, select the employee you'd like to delete:`,
        name: 'employeeToDelete',
        choices: employees,
      },
    ]);

    // Delete the employee from the database
    const sql = 'DELETE FROM employee WHERE id = ?';
    const values = [employeeToDelete];
    await db.query(sql, values);

    console.log('Employee successfully deleted!');
    init();
  } catch (error) {
    console.error(error);
  }
};
function quit() {
      process.exit();
};
init();
