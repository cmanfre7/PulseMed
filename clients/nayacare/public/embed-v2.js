(function() {
  'use strict';
  
  // Load Inter font from Google Fonts
  const fontLink = document.createElement('link');
  fontLink.rel = 'preconnect';
  fontLink.href = 'https://fonts.googleapis.com';
  document.head.appendChild(fontLink);
  
  const fontLink2 = document.createElement('link');
  fontLink2.rel = 'preconnect';
  fontLink2.href = 'https://fonts.gstatic.com';
  fontLink2.crossOrigin = 'anonymous';
  document.head.appendChild(fontLink2);
  
  const fontLink3 = document.createElement('link');
  fontLink3.rel = 'stylesheet';
  fontLink3.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap';
  document.head.appendChild(fontLink3);
  
  // Add keyframes animation for bounce
  const style = document.createElement('style');
  style.textContent = `
    @keyframes gentle-bounce {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-8px); }
    }
    
    #nayacare-chat-button {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
      animation: gentle-bounce 3s ease-in-out infinite;
    }
    
    #nayacare-chat-button:hover {
      animation: none;
    }
  `;
  document.head.appendChild(style);
  
  // Create container
  const container = document.createElement('div');
  container.id = 'nayacare-widget-container';
  container.style.cssText = 'position: fixed; bottom: 24px; right: 24px; z-index: 999999;';
  
  // Create the button with EXACT styling from App.jsx
  const button = document.createElement('button');
  button.id = 'nayacare-chat-button';
  button.style.cssText = `
    position: relative;
    background: linear-gradient(to right, rgb(249, 168, 212), rgb(244, 114, 182));
    color: white;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    overflow: hidden;
    box-shadow: 0 8px 32px rgba(244, 114, 182, 0.4), 0 4px 16px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2);
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
    width: 380px;
    height: 90px;
    padding: 0;
    margin: 0;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  `;
  
  // Button HTML content - EXACT match from App.jsx
  button.innerHTML = `
    <div style="position: relative; padding: 12px 16px; z-index: 10; height: 100%; display: flex; align-items: center;">
      <div style="display: flex; align-items: center; gap: 12px; width: 100%;">
        <!-- Heart Icon -->
        <div style="flex-shrink: 0; background: rgba(255, 255, 255, 0.25); backdrop-filter: blur(4px); padding: 8px; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.3); box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.3);">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: block;">
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
          </svg>
        </div>
        
        <!-- Text Content -->
        <div style="flex: 1; text-align: left; min-width: 0; padding-right: 8px;">
          <h3 style="font-weight: 700; font-size: 16px; line-height: 1.3; color: white; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3); margin: 0; padding: 0; white-space: nowrap;">
            Questions About Your Baby?
          </h3>
          <p style="color: rgb(252, 231, 243); font-size: 10px; margin: 2px 0 0; padding: 0; line-height: 1.3; text-shadow: 0 1px 3px rgba(0, 0, 0, 0.4); font-weight: 400;">
            Naya: Your 4th Trimester Virtual Provider<br>Curated by Dr. Patel
          </p>
          <div style="display: flex; align-items: center; gap: 8px; margin-top: 3px;">
            <span style="font-size: 12px; font-weight: 500; color: rgb(253, 242, 248); text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);">
              Available 24/7
            </span>
            <span style="color: rgba(251, 207, 232, 0.8); font-size: 12px; text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);">
              • Click to start
            </span>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Hover effects - exact same as App.jsx
  button.addEventListener('mouseenter', function() {
    this.style.background = 'linear-gradient(to right, rgb(244, 114, 182), rgb(236, 72, 153))';
    this.style.transform = 'scale(1.05)';
  });
  
  button.addEventListener('mouseleave', function() {
    this.style.background = 'linear-gradient(to right, rgb(249, 168, 212), rgb(244, 114, 182))';
    this.style.transform = 'scale(1)';
  });
  
  button.addEventListener('mousedown', function() {
    this.style.transform = 'scale(0.95)';
  });
  
  button.addEventListener('mouseup', function() {
    this.style.transform = 'scale(1.05)';
  });
  
  // Create FULLSCREEN iframe (NOT a small widget)
  const iframe = document.createElement('iframe');
  iframe.id = 'nayacare-chat-iframe';
  iframe.src = 'https://nayacare.up.railway.app?embed=true';
  iframe.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: none;
    z-index: 999998;
    display: none;
    background: white;
  `;
  iframe.setAttribute('allow', 'camera; microphone');
  
  // Click handler - opens FULLSCREEN chat
  button.addEventListener('click', function() {
    iframe.style.display = 'block';
    button.style.display = 'none';
    container.style.display = 'none';
    document.body.style.overflow = 'hidden'; // Prevent scrolling when chat is open
  });
  
  // Listen for close message from iframe
  window.addEventListener('message', function(event) {
    if (event.data === 'closeNayaCareChat' || event.data === 'closeChat') {
      iframe.style.display = 'none';
      button.style.display = 'block';
      container.style.display = 'block';
      document.body.style.overflow = ''; // Restore scrolling
    }
  });
  
  // Add ESC key to close
  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && iframe.style.display === 'block') {
      iframe.style.display = 'none';
      button.style.display = 'block';
      container.style.display = 'block';
      document.body.style.overflow = '';
    }
  });
  
  // Add to page
  container.appendChild(button);
  document.body.appendChild(container);
  document.body.appendChild(iframe);
  
  console.log('✅ NayaCare widget loaded successfully!');
  
})();
