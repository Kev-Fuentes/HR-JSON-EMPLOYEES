const axios = require("axios").default;
const moment = require("moment");
const fs = require("fs");
const LIMIT_EMPLOYEE = 1;
const POSTHIRE_API = axios.create({
  baseURL: "https://posthire.evercheck.com",
  timeout: 1000,
});

const parsedDate = (date, formatDate) => {
  return moment(date).format(formatDate);
};

const getEmployee = async (employeeId) => {
  const employees = await POSTHIRE_API.get(
    `/upload/status?employerId=${employeeId}&limit=${LIMIT_EMPLOYEE}`
  );

  return employees.data.map((employee) => {
    const parsedEmployee = {
      employerId: employee.employer_id,
      totalItems: employee.total_items,
      employeeCountPrior: employee.employee_count_prior,
      employeeCountAfter: employee.employee_count_after,
      status: employee.status,
      ftp: employee.is_ftp,
      startDate: parsedDate(employee.created_at, "YYYY-MM-DD"),
      startDateAndTime: parsedDate(employee.created_at, "YYYY-MM-DD HH:mm:ss"),
      finishDate: parsedDate(employee.finished_at, "YYYY-MM-DD"),
      finishDateAndTime: parsedDate(
        employee.finished_at,
        "YYYY-MM-DD HH:mm:ss"
      ),
      completion: "100%",
    };
    return parsedEmployee;
  });
};

const start = async () => {
  const employees = await Promise.all([
    getEmployee(640),
    getEmployee(559),
    getEmployee(667),
  ]);
  const flatArrayEmployees = employees.flat(Infinity);

  const orderEmployees = flatArrayEmployees.sort(
    (prevEmployee, currentEmployee) =>
      new Date(currentEmployee.startDateAndTime) -
      new Date(prevEmployee.startDateAndTime)
  );

  const strOrderEmployees = JSON.stringify(orderEmployees);

  fs.writeFile("employee.txt", strOrderEmployees, (err) => {
    if (err) throw err;

    console.log("Employee saved!");
  });
};

start();
