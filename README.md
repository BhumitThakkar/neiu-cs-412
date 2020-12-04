# Application Name:
Profile Hunt.

# Project Topic/Objective:
### What is it?
“Profile Hunt” is a web app project that helps any employee to get the details of other employees with certain skill, that he or she is in a look for, in the same company. It also has capabilities of managing employees and department but only by the HR team. As a new employee, this web-application makes it easy to know about the company's horizons in terms of department, employees and their skills.
### What will it do?
The company employee network will be managed by the HR team. HR will be at the top of authorization. While other employees will only have view rights. It provides a "search for a profile" functionality based on skill. With this information, one can also contact him/her in need. This feature will be available for all the employees including HR. It gives a brief details about the company's employees.

# Motivation:
“Profile Hunt” makes employee management and search an easy job for HR employee specially. It helps to get an idea on the company's skill set. "Profile Hunt" is made easy and hence is much useful to the HR department in their employee recruiting decisions. It is a simple project making it a good pick that can help in learning MEAN stack technologies. This product can make its space when integrated with the job hunt websites like [indeed](https://www.indeed.com).

# Server-Side Components:
For this project, HR Team will **create/ view/ edit/ delete** employee profile.
Once employee profile is created, they can **login/ view/ manage(partial)** their job profile.
All employees will be able to view the whole company **employee list.**
All employees will be able to search skills and contact the employees in need.
> #### Employees
> - Id
> - Name (first, last)
> - Email
> - Password
> - Phone number
> - Skills
> - Job title
> - Job role
> - Department
> - Boss(Manager)

> #### Departments
> - Name
> - Department Head
> - Employees

> #### Skills
> - Name
> - Employees

> #### Relationships
> - Employees - Skills (Many to Many)
> - Employees - Department (Many to One)
