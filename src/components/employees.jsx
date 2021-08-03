import React, { Component } from "react";
import _ from "lodash";
import Moment from "moment";
import cuid from "cuid";
import { extendMoment } from "moment-range";
import EmployeesTable from "./employeesTable";
import Pagination from "./common/pagination";
import { paginate } from "../utils/paginate";
import SearchBox from "./searchBox";
import FileUpload from "./fileUpload";

class Employees extends Component {
  state = {
    employees: [],
    currentPage: 1,
    pageSize: 4,
    searchQuery: "",
    sortColumn: { path: "title", order: "asc" },
  };

  getPagedData = () => {
    const {
      pageSize,
      currentPage,
      sortColumn,
      searchQuery,
      employees: allEmployees,
    } = this.state;

    let filtered = allEmployees;
    if (searchQuery)
      filtered = allEmployees.filter((m) =>
        m["Project"].toLowerCase().startsWith(searchQuery.toLowerCase())
      );

    const sorted = _.orderBy(filtered, [sortColumn.path], [sortColumn.order]);

    const employees = paginate(sorted, currentPage, pageSize);

    return { totalCount: filtered.length, data: employees };
  };

  handleSearch = (query) => {
    this.setState({ searchQuery: query, currentPage: 1 });
  };

  handleSort = (sortColumn) => {
    this.setState({ sortColumn });
  };

  handleFileUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target.result
        .replace(/ /g, "")
        .trim()
        .split("\r\n")
        .map((m) => m.split(","));

      data.forEach((m, index, arr) => {
        if (m[3].toUpperCase() === "NULL") m[3] = Moment().format("YYYY-MM-DD");
        arr[index] = {
          employees: m[0],
          project: m[1],
          startDate: this.parseDateType(m[2]),
          endDate: this.parseDateType(m[3]),
          pass: false,
        };
      });
      this.groupEmployeesByProject(data);
    };
    reader.readAsText(file);
  };

  groupEmployeesByProject = (data) => {
    const groupedByProject = Object.values(_.groupBy(data, "project"));
    let employees = [];
    groupedByProject.map((group) => {
      employees.push(this.checkForIntersection(group));
    });
    employees = _.without(employees, undefined);
    this.setState({ employees });
  };

  checkForIntersection = (data) => {
    const moment = extendMoment(Moment);
    let obj;
    const employeesWithDays = [];
    for (let i = 0; i < data.length; i++) {
      const lStartDate = Moment(data[i]["startDate"]);
      const lEndDate = Moment(data[i]["endDate"]);
      const range1 = moment.range(lStartDate, lEndDate);

      for (let j = i + 1; j < data.length; j++) {
        const rStartDate = Moment(data[j]["startDate"]);
        const rEndDate = Moment(data[j]["endDate"]);
        const range2 = moment.range(Moment(rStartDate, rEndDate));

        if (range1.overlaps(range2)) {
          obj = this.calculateIntersectionDays(data[i], data[j]);
        }
      }
      if (obj) employeesWithDays.push(obj);
    }
    const topEmployeeHours = _.maxBy(employeesWithDays, "Days");
    return topEmployeeHours;
  };

  calculateIntersectionDays = (timeEntry1, timeEmtry2) => {
    const lStartDate = Moment(timeEntry1["startDate"]);
    const lEndDate = Moment(timeEntry1["endDate"]);
    const rStartDate = Moment(timeEmtry2["startDate"]);
    const rEndDate = Moment(timeEmtry2["endDate"]);

    const lData = _.max([lStartDate, rStartDate]);
    const rData = _.min([lEndDate, rEndDate]);
    const WorkingDays = Math.abs(lData.diff(rData, "Days"));

    return {
      _id: cuid(),
      employees1: timeEntry1["employees"],
      employees2: timeEmtry2["employees"],
      Project: timeEntry1["project"],
      Days: WorkingDays,
    };
  };

  findEmployeesByProject = (data, dataFormat) => {
    const employees = [];
    let _id = 0;
    for (let i = 0; i < data.length - 1; i++) {
      const item = data[i];
      const next = data[i + 1];
      if (item["pass"]) continue;
      const startDateCur = Moment(item["startDate"]);
      const startDateNext = Moment(next["startDate"]);
      const endDateNext = Moment(next["endDate"]);
      const projectId = item["project"] === next["project"];
      const outterPeriod = startDateCur < endDateNext;
      const innerPeriod = startDateCur >= startDateNext;
      if (projectId && outterPeriod && innerPeriod) {
        item["pass"] = true;
        next["pass"] = true;
        _id++;
        employees.push({
          _id,
          employees1: item["employees"],
          employees2: next["employees"],
          Project: item["project"],
          Days: endDateNext.diff(startDateCur, "Days"),
        });
      }
    }
    this.setState({
      employees,
    });
  };

  parseDateType = (data) => {
    const dateMil = Date.parse(data);
    const dateStr = Moment(dateMil).format("YYYY-MM-DD");
    return dateStr;
  };

  handlePageChange = (page) => {
    this.setState({ currentPage: page });
  };

  render() {
    const { currentPage, pageSize, sortColumn, searchQuery } = this.state;
    const { totalCount, data: employees } = this.getPagedData();
    return (
      <div className="row">
        <div className="col">
          <FileUpload onChange={this.handleFileUpload} />
          <SearchBox
            value={searchQuery}
            onChange={this.handleSearch}
            placeholder="Search by project id ..."
          />
          <EmployeesTable
            employees={employees}
            sortColumn={sortColumn}
            onSort={this.handleSort}
          />
          <Pagination
            itemsCount={totalCount}
            pageSize={pageSize}
            currentPage={currentPage}
            onPageChange={this.handlePageChange}
          />
        </div>
      </div>
    );
  }
}

export default Employees;
