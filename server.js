const mysql = require('mysql2');
const inquirer = require('inquirer');
const clc = require("cli-color");
const db = require('./db/db');
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
            'Delete Department',
            'Delete Role',
            'View Department Budget',
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
            case 'Delete Department':
                deleteDepartments();
                break;
            case 'Delete Role':
                deleteRoles();
                break;
            case 'View Department Budget':
                viewDepartmentBudget();
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
        const [res, _] = await db.query(query);
        console.table(res);
        init();
    } catch (error) {
        console.error(clc.red("Department table was not found! This error occurred: " + error));
        init();
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
        const [res, _] = await db.query(query);
        console.table(res);
        init();
    } catch (error) {
        console.error(clc.red("Roles table was not found! This error occurred: " + error));
        init();
    }
};
async function viewAllEmployees() {
    try {
            const query = `
        SELECT employee.id, 
               CONCAT(employee.first_name, ' ', employee.last_name) AS employee_name, 
               roles.title AS job_title,
               roles.salary,
               department.names AS department,
               CONCAT(manager.first_name, ' ', manager.last_name) AS manager
               FROM employee
               LEFT JOIN employee manager ON employee.manager_id = manager.id
               INNER JOIN roles ON employee.role_id = roles.id
               INNER JOIN department ON roles.department_id = department.id`;
        const [res] = await db.query(query);
        console.table(res);
        init();
    } catch (error) {
        console.error(clc.red("Employee table was not found! This error occurred: " + error));
        init();
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

        console.log(clc.green("Department successfully added!"));
        init();
    } catch (error) {
        console.error(clc.red("Department wasn't added! This error occurred: " + error));
        init();
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
        console.log(clc.green("Role successfully added!"));
        init();
    } catch (error) {
        console.error(clc.red("Role wasn't added! This error occurred: " + error));
        init();
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
        var sql = 'INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?) ';
        const values = [
            answers.firstNameForNewEmployee,
            answers.lastNameForNewEmployee,
            answers.roleForNewEmployee,
            answers.managerForNewEmployee,
        ];
        await db.query(sql, values);
        console.log(clc.green("Employee successfully added!"));
        init();
    } catch (error) {
        console.error(clc.red("Employee wasn't added! This error occurred: " + error));
        init();
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
                choices: ['Role', 'Manager']
            }
        ];

        const { infoToUpdate, employeeToUpdate } = await inquirer.prompt(questions);

        switch (infoToUpdate) {
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
                console.log(clc.green('Employee role successfully updated!'));
                break;
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
                console.log(clc.green('Employee manager successfully updated!'));
                break;
            default:
                console.log(clc.red('Invalid selection'));
                break;
        }
    } catch (error) {
        console.error(clc.red("Employee wasn't update! This error occurred: " + error));
        init();
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

        console.log(clc.green('Employee successfully deleted!'));
        init();
    } catch (error) {
        console.error(clc.red("Employee wasn't deleted!"));
        init();
    }
};
async function deleteRoles() {
    try {
        const Roles = await helpers.getRoles();

        const { RoleToDelete } = await inquirer.prompt([
            {
                type: 'list',
                message: `!!!You need to delete or change employee roles connected to this department before you can do this!!!
***CAUTION ALL ROLE INFORMATION IS DELETED IMMEDIATELY AFTER SELECTION*** 
If you're sure you'd like to move forward, select the role you'd like to delete:`,
                name: 'RoleToDelete',
                choices: Roles,
            },
        ]);

        // Delete the employee from the database
        const sql = 'DELETE FROM roles WHERE id = ?';
        const values = [RoleToDelete];
        await db.query(sql, values);

        console.log(clc.green('Role successfully deleted!'));
        init();
    } catch (error) {
        console.error(clc.red("Role wasn't deleted! You still have employees conneceted to this role."));
        init();
    }
};
async function deleteDepartments() {
    try {
        const Departments = await helpers.getDepartments();

        const { DepartmentToDelete } = await inquirer.prompt([
            {
                type: 'list',
                message: `!!!You need to change or delete employees and roles connected to this department before you can do this!!!
***CAUTION ALL DAPARTMENT INFORMATION IS DELETED IMMEDIATELY AFTER SELECTION***
If you're sure you'd like to move forward, select the department you'd like to delete:`,
                name: 'DepartmentToDelete',
                choices: Departments,
            },
        ]);

        // Delete the employee from the database
        const sql = 'DELETE FROM department WHERE id = ?';
        const values = [DepartmentToDelete];
        await db.query(sql, values);

        console.log(clc.green('Department successfully deleted!'));
        init();
    } catch (error) {
        console.error(clc.red("Department wasn't deleted! You still have employees and/or roles conneceted to this department"));
        init();
    }
};
async function viewDepartmentBudget() {
    try {
        const departments = await helpers.getDepartments();

        const { departmentId } = await inquirer.prompt([
            {
                type: 'list',
                message: 'Select the department to view the budget:',
                name: 'departmentId',
                choices: departments,
            },
        ]);

        const query = `
            SELECT SUM(roles.salary) AS total_budget            FROM employee INNER JOIN roles ON employee.role_id = roles.id WHERE roles.department_id = ?
        `;
        const [result] = await db.query(query, [departmentId]);

        console.log(clc.green(`Total Utilized Budget for the Department: $${result[0].total_budget}`));
        init();
    } catch (error) {
        console.error(clc.red("Error occurred while calculating department budget: " + error));
        init();
    }
}
function quit() {
    process.exit();
};
init();
