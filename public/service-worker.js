const FETCH_INTERVAL = 1000 * 60 * 5; // 5 seconds

// Fetch updates from the server
const fetchUpdates = async () => {
  try {
    // Simulated API response
    const data = {
      newUpdatesAvailable: {
        update1: "This is the first update"
      }
    };

    // Show notification if new updates are available
    if (data.newUpdatesAvailable) {
      console.log('update');
      self.registration.showNotification('New Updates!', {
        body: 'Click to view the latest updates.', // Plain text notification
        tag: 'update-notification', // Prevent duplicate notifications
      });
    }
  } catch (error) {
    console.error('Error fetching updates:', error);
  }
};

// Activate event listener to show an activation notification
self.addEventListener('activate', (event) => {
  console.log('Service worker activated');
  event.waitUntil(
    self.registration.showNotification('Service Worker Activated!', {
      body: 'Notifications are enabled.',
    })
  );
});

// Periodic fetching setup
setInterval(fetchUpdates, FETCH_INTERVAL);

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close(); // Close the notification when clicked
  event.waitUntil(
    clients.openWindow('/user/parties') // Replace with the correct URL for updates
  );
});
