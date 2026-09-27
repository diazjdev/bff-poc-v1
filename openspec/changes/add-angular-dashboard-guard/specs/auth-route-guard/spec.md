## Purpose

Define how the Angular app decides whether a visitor may open the protected dashboard route: the route is only reachable once an authenticated user has been resolved, and any other outcome sends the visitor to the login page.

## ADDED Requirements

### Requirement: Dashboard route requires a resolved authenticated user
The system SHALL allow navigation to the dashboard route only when the current session resolves to an authenticated user. The system SHALL deny navigation in every other case, including while the session is still being determined, when no user is present, and when the session cannot be determined at all.

#### Scenario: Authenticated user opens the dashboard
- **WHEN** a visitor with a valid session navigates to the dashboard route
- **THEN** the dashboard page is displayed and no redirect to the login page occurs

#### Scenario: Anonymous visitor opens the dashboard
- **WHEN** a visitor without a valid session navigates to the dashboard route
- **THEN** the dashboard page is not displayed and the visitor is redirected to the login page

#### Scenario: Session is still being determined
- **WHEN** a visitor navigates to the dashboard route before the session has been determined
- **THEN** the decision is deferred until the session is determined, and the dashboard page is never displayed for a visitor who turns out to be anonymous

#### Scenario: Session cannot be determined
- **WHEN** determining the session fails or never completes in a reasonable time
- **THEN** the dashboard page is not displayed and the visitor is redirected to the login page

### Requirement: Redirected visitors land on the login page
The system SHALL redirect denied visitors to the login route and SHALL NOT redirect the login route itself into a loop.

#### Scenario: Denied navigation lands on login
- **WHEN** a visitor is denied access to the dashboard route
- **THEN** the browser location is the login page and the dashboard content is not rendered

#### Scenario: Login page is reachable directly
- **WHEN** a visitor navigates directly to the login route
- **THEN** the login page is displayed without any further redirect

### Requirement: Session state is observable by other parts of the app
The system SHALL expose the current authentication state and whether that state has been determined yet, so that every part of the app can distinguish an anonymous visitor from an undetermined one.

#### Scenario: Session state becomes known
- **WHEN** the session has been determined
- **THEN** the exposed state reports the outcome together with the user when one exists

#### Scenario: Session starts undetermined
- **WHEN** the app starts and before the session has been determined
- **THEN** the exposed state reports the session as undetermined rather than reporting the visitor as anonymous

### Requirement: Server remains the authority
The system SHALL treat the client-side route decision as a usability measure only. The server SHALL continue to reject unauthenticated requests for dashboard data, so that a bypassed route decision does not expose protected data.

#### Scenario: Unauthenticated data request after bypassing the route
- **WHEN** a request for dashboard data is made without a valid session, regardless of the route decision
- **THEN** the server rejects the request and returns no protected data
