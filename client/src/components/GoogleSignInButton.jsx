import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/useAuth';

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

function GoogleSignInButton({ onSuccess, onError }) {
  const { loginWithGoogle } = useAuth();
  const buttonRef = useRef(null);
  const [scriptReady, setScriptReady] = useState(false);

  useEffect(() => {
    if (!CLIENT_ID) return;

    let cancelled = false;
    const start = Date.now();

    const waitForGoogleScript = () => {
      if (cancelled) return;
      if (window.google?.accounts?.id) {
        setScriptReady(true);
        return;
      }
      if (Date.now() - start > 8000) return; // give up quietly after 8s
      setTimeout(waitForGoogleScript, 150);
    };

    waitForGoogleScript();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!scriptReady || !buttonRef.current) return;

    window.google.accounts.id.initialize({
      client_id: CLIENT_ID,
      callback: async ({ credential }) => {
        try {
          const user = await loginWithGoogle(credential);
          onSuccess?.(user);
        } catch (err) {
          onError?.(err.message);
        }
      },
    });

    window.google.accounts.id.renderButton(buttonRef.current, {
      theme: 'outline',
      size: 'large',
      width: 320,
      text: 'continue_with',
    });
  }, [scriptReady, loginWithGoogle, onSuccess, onError]);

  if (!CLIENT_ID) {
    return (
      <div className="auth-demo-hint">
        Google sign-in isn't configured yet — set <code>VITE_GOOGLE_CLIENT_ID</code> in{' '}
        <code>client/.env</code> (and <code>GOOGLE_CLIENT_ID</code> in <code>server/.env</code>) to enable it.
      </div>
    );
  }

  return <div ref={buttonRef} />;
}

export default GoogleSignInButton;
