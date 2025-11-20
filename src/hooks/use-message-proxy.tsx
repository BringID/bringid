import { useEffect } from "react";

function useMessageProxy(iframeRef) {
  useEffect(() => {
    function onMessage(event: MessageEvent) {
      const fromOrigin = event.origin;
      const data = event.data;

      // From WEBSITE SDK → forward to iframe
      if (fromOrigin === window.location.origin) {
        if (!iframeRef.current) return;

        iframeRef.current.contentWindow?.postMessage(
          data,
          "https://connect.bringid.org"
        );
        return;
      }

      // From CONNECT iframe → forward to SDK
      if (fromOrigin === "https://connect.bringid.org") {
        window.postMessage(data, window.location.origin);
        return;
      }
    }

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);
}

export default useMessageProxy