const GOOGLE_ANALYTICS_ID = "G-HJ657FXBM7";

let initialized = false;

export function initAppEvents() {
  if (typeof window === "undefined" || initialized) return;

  initialized = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    function gtag() {
      window.dataLayer.push(arguments);
    };

  window.gtag("js", new Date());
  window.gtag("config", GOOGLE_ANALYTICS_ID);

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ANALYTICS_ID}`;
  document.head.appendChild(script);
}

export function trackEvent(eventName, params = {}) {
  if (typeof window === "undefined") return;

  window.gtag?.("event", eventName, params);
}
