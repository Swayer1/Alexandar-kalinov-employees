import React, { Component } from "react";
import Table from "./common/table";

class EmployeesTable extends Component {
  columns = [
    { path: "employees1", label: "Employee 1" },
    { path: "employees2", label: "Employee 2" },
    { path: "Project", label: "Project" },
    { path: "Days", label: "Days" },
  ];

  render() {
    const { employees, onSort, sortColumn } = this.props;
    return (
      <Table
        columns={this.columns}
        data={employees}
        sortColumn={sortColumn}
        onSort={onSort}
      />
    );
  }
}

export default EmployeesTable;
