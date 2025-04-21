// Script to populate bookedDates collection from existing confirmed bookings
// Run with: node scripts/create-booked-dates.js

// Import the Firebase SDK
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs, addDoc, Timestamp } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function createBookedDatesFromConfirmedBookings() {
  try {
    console.log('Starting to create booked dates from confirmed bookings...');
    
    // Get all confirmed bookings
    const bookingsRef = collection(db, 'bookings');
    const q = query(bookingsRef, where('status', '==', 'confirmed'));
    const bookingsSnapshot = await getDocs(q);
    
    if (bookingsSnapshot.empty) {
      console.log('No confirmed bookings found.');
      return;
    }
    
    console.log(`Found ${bookingsSnapshot.size} confirmed bookings.`);
    
    // Process each confirmed booking
    const promises = [];
    
    bookingsSnapshot.forEach((doc) => {
      const booking = doc.data();
      console.log(`Processing booking: ${doc.id} (${booking.bookingId || 'No bookingId'})`);
      
      // Add to bookedDates collection
      const promise = addDoc(collection(db, 'bookedDates'), {
        bookingId: booking.bookingId || doc.id,
        startDate: booking.checkIn,
        endDate: booking.checkOut,
        createdAt: Timestamp.now(),
      });
      
      promises.push(promise);
    });
    
    await Promise.all(promises);
    console.log('Successfully created booked dates for all confirmed bookings.');
  } catch (error) {
    console.error('Error creating booked dates:', error);
  }
}

// Run the function
createBookedDatesFromConfirmedBookings()
  .then(() => {
    console.log('Script completed successfully.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  }); 