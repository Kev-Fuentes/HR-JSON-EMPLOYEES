const axios = require('axios').default;
const moment = require('moment');
const fs = require('fs');
const LIMIT_EMPLOYEE = 19;
const POSTHIRE_API = axios.create({
  baseURL: 'https://posthire.evercheck.com',
});

const parsedDate = (date, formatDate, utc = false) => {
  return utc
    ? moment(date).utc().format(formatDate)
    : moment(date).format(formatDate);
};

const getEmployee = async (employeeId) => {
  const employees = await POSTHIRE_API.get(
    `/upload/status?employerId=${employeeId}&limit=${LIMIT_EMPLOYEE}`
  );

  return employees.data.map((employee) => {
    console.log(employee);
    const parsedEmployee = {
      employerId: employee.employer_id,
      totalItems: employee.total_items,
      employeeCountPrior: employee.employee_count_prior,
      employeeCountAfter: employee.employee_count_after,
      status: employee.status,
      ftp: employee.is_ftp,
      startDate: parsedDate(employee.created_at, 'YYYY-MM-DD', true),
      startDateAndTime: parsedDate(
        employee.created_at,
        'YYYY-MM-DD HH:mm:ss',
        true
      ),
      finishDate: parsedDate(employee.finished_at, 'YYYY-MM-DD', true),
      finishDateAndTime: parsedDate(
        employee.finished_at,
        'YYYY-MM-DD HH:mm:ss',
        true
      ),
      completion: '100%',
    };
    return parsedEmployee;
  });
};

const start = async () => {
  const employees = await Promise.all([getEmployee(719)]);
  const flatArrayEmployees = employees.flat(Infinity);

  const orderEmployees = flatArrayEmployees.sort(
    (prevEmployee, currentEmployee) =>
      new Date(currentEmployee.startDateAndTime) -
      new Date(prevEmployee.startDateAndTime)
  );

  const strOrderEmployees = JSON.stringify(orderEmployees);

  fs.writeFile('employee.txt', strOrderEmployees, (err) => {
    if (err) throw err;

    console.log('Employee saved!');
  });
};

start();
