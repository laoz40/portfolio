---
section:
  variant: media
  media:
    type: image
    image: ../../assets/horus/light.png
    alt: Workout form screen mockup
---

## App Features

### What does this app do?

#### Features

- Create, view, edit, and delete workouts
- Track exercises, sets, and workout history
- Save workouts to a database
- Secure login with protection against repeated login attempts
- Private workout data for each user
- Automatically calculate total workout volume and personal records

#### UX/UI

- Clear notifications when actions succeed or fail
- Mobile-first layouts that work across screen sizes
- Three themes to choose from
- Loading indicators and helpful messages when there's no data

#### Architecture & Implementation

- Reduce unnecessary requests to keep the app responsive
- Reusable UI components for easier maintenance
- Shared types between the frontend and backend
- Handle invalid inputs, failed requests, and database errors
- Organise workout data to track progress over time
- Consistent exercise names for accurate personal records
