import { useEffect } from "react";

function useMessageProxy(
  iframeRef,
  connectUrl: string,
  onLogin?: () => void,
  onLogout?: () => void
) {
  useEffect(() => {
    function onMessage(event: MessageEvent) {
      const fromOrigin = event.origin;
      const data = event.data;
      console.log('useMessageProxy: ', {
        data,
        fromOrigin
      })
      // From WEBSITE SDK → forward to iframe
      if (fromOrigin === window.location.origin) {
        if (!iframeRef.current) return;

        iframeRef.current.contentWindow?.postMessage(
          data,
          connectUrl
        );
        return;
      }

      // From CONNECT iframe → forward to SDK
      if (fromOrigin === connectUrl) {
        console.log('fromOrigin === connectUrl: ', { data })
        if (data.type === 'LOGIN') {
          onLogin && onLogin()
          return
        }

        if (data.type === 'LOGOUT') {
          onLogout && onLogout()
          return
        }

        window.postMessage(data, window.location.origin);
        return;
      }
    }

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);
}

export default useMessageProxy