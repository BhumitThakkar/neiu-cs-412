# Application Name:
Profile Hunt.

# Project Topic/Objective:
### What is it?
It is a web-app with employees containing a job profile.
### What will it do?
The company employee network will be managed by the HR team. HR will be at the top of authorization. While other employees will only have view rights. It is supposed to provide a search for a profile based on skill. With this information, one can also contact him/her in need. This feature will be available for all the employees including HR. It will give a brief idea about the company's employees.

# Motivation:
This makes employee management and exploring an easy job.  It will help to get an idea on the company's skill. "Profile Hunt" is made easy and will be much useful to the HR department in their employee recruiting decisions. It is a simple project at the same time important enough making it a good pick that can help in learning MEAN stack technologies. This product can make its space when integrated with the job hunt websites like [indeed](https://www.indeed.com). As a new employee, this web-application makes it easy to know about the company's horizons in terms of department, employees and their skills.

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
