import { type PropsWithChildren } from 'react';

import { ScrollViewStyleReset } from 'expo-router/html';

/**
 * This file is web-only and used to configure the root HTML for every web page during static rendering.
 * The contents of this function only run in Node.js environments and do not have access to the DOM or browser APIs.
 */
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="title" content="المصحف مفتوح المصدر" />
        <meta
          name="description"
          content="مصحف إلكتروني مفتوح المصدر لتلاوة القرآن الكريم، مع دعم لمختلف التفاسير والروايات."
        />

        {/* Preload Amiri and Tajawal fonts */}
        <link
          rel="preload"
          href="https://fonts.gstatic.com/s/amiri/v24/J7aRnpd8CGxBHpUrtLMA7w.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="https://fonts.gstatic.com/s/amiri/v24/J7acnpd8CGxBHp2VkaY6zp5yGw.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="https://fonts.gstatic.com/s/tajawal/v9/Iura6YBj_oCad4k1nzSBC45I.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="https://fonts.gstatic.com/s/tajawal/v9/Iurf6YBj_oCad4k1l5qjHrRpiYlJ.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        {/* Digital Asset Links for Android App Links */}
        <link rel="assetlinks.json" href="/.well-known/assetlinks.json" />
        {/*} <!-- Safari PWA specific tags -->*/}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        {/*<!-- Safari splash screens -->*/}
        <link
          rel="apple-touch-startup-image"
          href="splash/apple-splash-2048-2732.png"
          media="(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
        />
        <link
          rel="apple-touch-startup-image"
          href="splash/apple-splash-1668-2388.png"
          media="(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
        />
        <link
          rel="apple-touch-startup-image"
          href="splash/apple-splash-1536-2048.png"
          media="(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
        />
        <link
          rel="apple-touch-startup-image"
          href="splash/apple-splash-1125-2436.png"
          media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
        />
        <link
          rel="apple-touch-startup-image"
          href="splash/apple-splash-1242-2688.png"
          media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
        />
        <link
          rel="apple-touch-startup-image"
          href="splash/apple-splash-828-1792.png"
          media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
        />
        <link
          rel="apple-touch-startup-image"
          href="splash/apple-splash-1242-2208.png"
          media="(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
        />
        <link
          rel="apple-touch-startup-image"
          href="splash/apple-splash-750-1334.png"
          media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
        />
        <link
          rel="apple-touch-startup-image"
          href="splash/apple-splash-640-1136.png"
          media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
        />
        {/*<!-- Apple touch icon -->*/}
        <link
          rel="apple-touch-icon"
          href="icons/apple-touch-icon.png"
          sizes="180x180"
        />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        {/* Link the PWA manifest file. */}
        <link rel="manifest" href="/manifest.json" />
        {/* Bootstrap the service worker. */}
        <script dangerouslySetInnerHTML={{ __html: sw }} />
        {/*
          Disable body scrolling on web. This makes ScrollView components work closer to how they do on native.
          However, body scrolling is often nice to have for mobile web. If you want to enable it, remove this line.
        */}
        <ScrollViewStyleReset />
        {/* Using raw CSS styles as an escape-hatch to ensure the background color never flickers in dark-mode. */}
        <style dangerouslySetInnerHTML={{ __html: responsiveBackground }} />
        {/* Add any additional <head> elements that you want globally available on web... */}
      </head>
      <body style={{ overscrollBehavior: 'none' }}>
        {children}

        {/* Enhanced Floating Notification Area */}
        <div
          id="sw-notification"
          style={{
            position: 'fixed',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '16px 24px',
            borderRadius: '8px',
            zIndex: 10000,
            display: 'none',
            fontFamily: 'Tajawal_400Regular, Arial, sans-serif',
            fontSize: '16px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            textAlign: 'center',
            minWidth: '250px',
            maxWidth: '90%',
            transition: 'opacity 0.3s ease-in-out',
            opacity: '1',
            borderColor: '#CCC',
            backgroundColor: '#333',
            color: '#FFF',
          }}
        >
          {/* Add loading spinner */}
          <div
            id="sw-spinner"
            style={{
              display: 'inline-block',
              width: '20px',
              height: '20px',
              marginRight: '10px',
              marginLeft: '10px',
              borderRadius: '50%',
              border: '3px solid rgba(255,255,255,0.3)',
              borderTopColor: 'white',
              animation: 'spin 1s linear infinite',
              verticalAlign: 'middle',
            }}
          ></div>
          <span
            id="sw-status-message"
            style={{
              verticalAlign: 'middle',
            }}
          ></span>
        </div>

        {/* Add animation keyframes */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `,
          }}
        />

        {/* Enhanced Script to handle Service Worker messages for the notification */}
        <script dangerouslySetInnerHTML={{ __html: notificationHandler }} />
      </body>
    </html>
  );
}

const responsiveBackground = `
body {
  background-color: #fff;
}
@media (prefers-color-scheme: dark) {
  body {
    background-color: #000;
  }
}`;

const sw = `
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      // Show initial loading message
      const notificationElement = document.getElementById('sw-notification');
      const statusMessageElement = document.getElementById('sw-status-message');
      const spinnerElement = document.getElementById('sw-spinner');

      if (notificationElement && statusMessageElement) {
        statusMessageElement.textContent = 'جاري تحميل التطبيق...';
        notificationElement.style.display = 'block';
      }
      
      // Add timeout fallback to ensure the app continues loading even if service worker registration takes too long
      let swRegistrationTimeout = setTimeout(() => {
        // console.warn('Service worker registration timed out');
        if (notificationElement) {
          notificationElement.style.display = 'none';
        }
      }, 10000); // hide after 10 seconds
      
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
          // console.log('Service Worker registered with scope:', registration.scope);
          
          // Clear the timeout since registration was successful
          clearTimeout(swRegistrationTimeout);
          
          // Hide the loading notification after successful registration
          if (notificationElement) { 
            setTimeout(() => { 
              notificationElement.style.display = 'none'; 
            }, 1000); // Give a short delay so user can see it was successful 
          }
          
          // Check if there's an update available
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (notificationElement && statusMessageElement) {
                  if (newWorker.state === 'installing') {
                    statusMessageElement.textContent = 'جاري تثبيت التحديث...';
                    notificationElement.style.display = 'block';
                  } else if (newWorker.state === 'installed') {
                    if (navigator.serviceWorker.controller) {
                      statusMessageElement.textContent = 'تم تثبيت التحديث! سيتم تحديث الصفحة قريبًا.';
                      notificationElement.style.display = 'block';
                      
                      // Offer to update immediately
                      setTimeout(() => {
                        if (confirm('تم تثبيت تحديث جديد. هل تريد تحديث الصفحة الآن؟')) {
                          window.location.reload();
                        }
                      }, 1000);
                    }
                  }
                }
              });
            }
          });
        })
        .catch(error => {
          console.error('Service Worker registration failed:', error);
          if (notificationElement && statusMessageElement) {
            statusMessageElement.textContent = 'حدث خطأ أثناء تحميل التطبيق.';
            spinnerElement.style.display = 'none';
            setTimeout(() => {
              notificationElement.style.display = 'none';
            }, 3000);
          }
        });
    });
}
`;

const notificationHandler = `
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', event => {
    const notificationElement = document.getElementById('sw-notification');
    const statusMessageElement = document.getElementById('sw-status-message');
    const spinnerElement = document.getElementById('sw-spinner');

    if (notificationElement && statusMessageElement && spinnerElement && event.data) {
      if (event.data.type === 'SW_STATE_UPDATE') {
        statusMessageElement.textContent = event.data.message || 'جاري التحديث...';
        notificationElement.style.display = 'block';
        
        // Show or hide spinner based on state
        if (event.data.state === 'activated') {
          spinnerElement.style.display = 'none';
        } else {
          spinnerElement.style.display = 'inline-block';
        }

        // If a duration is provided, auto-hide the notification
        if (typeof event.data.duration === 'number' && event.data.duration > 0) {
          setTimeout(() => {
            notificationElement.style.opacity = '0';
            setTimeout(() => {
              notificationElement.style.display = 'none';
              notificationElement.style.opacity = '1';
            }, 300);
          }, event.data.duration);
        }
        
        // Explicitly hide if requested
        if (event.data.hide === true) {
           notificationElement.style.display = 'none';
        }
      }
    }
  });
  
  // Check service worker status on page load
  if (navigator.serviceWorker.controller) {
    // Create a message channel
    const messageChannel = new MessageChannel();
    
    // Handler for messages coming back from the service worker
    messageChannel.port1.onmessage = (event) => {
      console.log('Service Worker Status:', event.data);
    };
    
    // Ask the service worker for its current state
    navigator.serviceWorker.controller.postMessage({
      type: 'GET_SW_STATE'
    }, [messageChannel.port2]);
  }
}

// Example: To test this from your browser's developer console (after the page loads):
// navigator.serviceWorker.controller.postMessage({ type: 'SW_STATE_UPDATE', message: 'Test notification!', duration: 3000 });
// navigator.serviceWorker.controller.postMessage({ type: 'SW_STATE_UPDATE', message: 'Another message, stays until hidden.' });
// navigator.serviceWorker.controller.postMessage({ type: 'SW_STATE_UPDATE', hide: true });
`;
