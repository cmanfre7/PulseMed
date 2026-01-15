// Embed Helper Script for Dr. Patel's Website
// Add this script to the parent page that contains the NayaCare iframe

window.addEventListener('message', function(event) {
  // Verify the message is from your Railway domain
  if (event.origin !== 'https://nayacare.up.railway.app') {
    return;
  }
  
  // Handle YouTube video opening
  if (event.data.type === 'OPEN_YOUTUBE_VIDEO') {
    // Open YouTube video in new tab from the parent window context
    window.open(event.data.url, '_blank', 'noopener,noreferrer');
  }
});
