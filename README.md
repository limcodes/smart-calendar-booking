# Important Firebase Setting
- In Firebase Console, go to Authentication > Sign-in Method > Email/Password and enable it.
- For Firestore, go to Cloud > Firestore > Rules, replace the rules with the following rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Basic user profile data - readable by anyone, writable only by the user
    match /users/{userId}/profile {
      allow read: if true; // Public profiles for booking pages
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Places, areas, and availability rules
    match /users/{userId}/places/{placeId} {
      allow read: if true; // Anyone can read places for booking
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /users/{userId}/areas/{areaId} {
      allow read: if true; // Anyone can read areas for booking
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /users/{userId}/availabilityRules/{ruleId} {
      allow read: if true; // Anyone can read availability rules for booking
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Booked slots - public can create, but only owner can read all and modify
    match /users/{userId}/bookedSlots/{slotId} {
      allow read: if true; // Public can see booked slots to avoid double bookings
      allow create: if true; // Anyone can create a booking
      // Only the owner can update or delete bookings
      allow update, delete: if request.auth != null && request.auth.uid == userId;
    }
    
    // User usernames collection for username uniqueness check
    match /usernames/{username} {
      allow read: if true;
      allow write: if request.auth != null && 
                   (resource == null || resource.data.userId == request.auth.uid);
    }
  }
}
```
