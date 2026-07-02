# Challenge Proposal

## 1. Project Description

A social media platform for BYU-Idaho students to rate, review, and share experiences about campus and local events. Similar to a social networking platform, students can post photos and reviews of activities they attend on or near campus. The goal is to help other students better understand what events are like before deciding whether to participate.

---

## 2. Team Members

- Brynlee
- Crystal
- Spencer

---

## 3. Technologies

### Frontend
- Astro
- Svelte

### Backend
- Express.js

### Database
- MongoDB

### Hosting
- Backend: Render
- Frontend: Netlify

---

## 4. Team Management & Communication Plan

### Communication

The team will maintain communication through:

- Group chat for quick discussions and updates
- Shared contact information for direct communication
- In-person meetings during class twice per week
- Scheduled check-ins at least two times per week via messaging or online meetings

Our goal is to maintain consistent communication and address blockers quickly throughout the project.

### Project Management

We will use Trello to:

- Track project progress
- Organize tasks into boards and lists
- Assign responsibilities
- Monitor completion of project milestones

---

## 5. Core Features

### User Profiles

Each user will have a profile containing:

- Name
- Username
- Review history
- Verification status

### User Authentication

Users can:

- Register with a username and password
- Log in to create reviews and posts
- Browse content without an account

### Dashboard / Feed

A scrolling feed displaying:

- Recent event reviews
- User posts
- Recent activity from the community

### Event Objects

Events will contain:

- Name
- Date/Day
- Image
- Description

### Event Reviews

Each event will display:

- Average rating
- User reviews
- User-submitted photos

---

## 6. Additional Features

### Place Objects

Local Rexburg locations will include:

- Name
- Location
- List of reviews

### Place Reviews

Each place will display:

- Average rating
- Review list
- User-submitted photos

### Event Sorting

Users can sort events by:

- Highest rating
- Lowest rating
- Most recent

### Upcoming Events Calendar

A calendar view showing:

- Upcoming events
- Average ratings
- Clickable event details

### Going / Interested System

Users can mark events as:

- Going
- Interested

### Profile Management

Users can update:

- Profile information
- Account details
- Preferences

---

## 7. Wireframes / Mockups

*To be added.*

---

## 8. Database Schema

### Users Collection

```json
{
  "_id": "ObjectId",
  "name": "String",
  "email": "String",
  "passwordHash": "String",
  "createdDate": "Date"
}