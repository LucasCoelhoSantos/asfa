<div align="center">
	<img src="./public/asfa-logo.png" alt="ASFA" widthwidth="250" height="250" />
	<h1>ASFA - ASFA - Catholic Association of the Holy Family</h1>
	<h2>Elderly People Management System</h2>
	<a href="./README.md">[br]</a>
</div>

## About the Project

**ASFA** is a web application developed using **Angular 20.1.0** and **Firebase**. The goal of the system is to facilitate the management of elderly individuals who attend the Catholic Association of the Holy Family, allowing the registration of their personal information, dependent data, and the generation of PDF reports for documentation and printing purposes.

## Features

- Registration of elderly individuals with detailed information;
- Registration of dependents linked to the elderly individuals;
- Uploading documents linked to the elderly individuals;
- Registration of system users (only admin users have this functionality);
- Record consultation (with filters), updates, and deactivation;
- Data export in PDF format for printing;
- User-friendly interface;
- Automatic data backup;
- Email notification services.

## Technologies Used

### Frontend
- **Angular 20.1.0** - Core Framework
- **TypeScript 5.8.2** - Programming Language
- **Bootstrap 5.3.8** - CSS Framework
- **Bootstrap Icons 1.13.1** - Icons
- **SCSS** - CSS Preprocessor

### Backend
- **Firebase Authentication** - User authentication
- **Firestore** - NoSQL database
- **Firebase Storage** - File storage
- **Firebase Functions** - Serverless functions
- **Firebase Hosting** - Hosting

### APIs Externas
- **ViaCEP**: Postal Code Web Service

## Requirements

- A computer or mobile device with an internet connection.

## Project Structure

```
/asfa
    /public                 	// Shared files
    /src
	    /app
		    /core           	// Services, singletons, guards, interceptors, helpers
			    /guards
				/interceptors
			    /services
		    /features       	// Feature modules
		    /models         	// Interfaces and types
		    /shared         	// Reusable components, pipes, directives
		/environments   		// Environment configurations
        app.config.ts       	// Global providers
        app.routes.ts       	// Main routes
```

## Available Screens

Currently, the system includes the following implemented screens:

1. User Login Screen:
Allows user authentication.

2. Main Menu:
Main screen for managing records. Allows viewing, adding, editing, or deactivating registrations of elderly individuals.

3. Elderly Registration:
Form for entering or editing data of elderly individuals.

4. Dependent Registration:
Part of the elderly registration form, used to record dependents associated with elderly individuals.

5. User Registration:
Form for entering or editing system user data.

## Future Implementations

- Referrals;
- Home visit scheduling;
- Phone calls;
- Donation of food kits;
- Various donations;
- Service appointments.

## License

This project is for the exclusive use of the Catholic Association of the Holy Family. Unauthorized distribution or commercial use is prohibited.