document.addEventListener('DOMContentLoaded', () => {
  const usernameInput = document.getElementById('username');

  document.getElementById('btn-register').addEventListener('click', async () => {
    const username = usernameInput.value;
    if (!username) return alert('Please enter a username.');

    try {
  const resp = await fetch('/webauthn/register-options', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username })
  });

  console.log('[Fetch Response Status]', resp.status); // 🔍 Status code
  console.log('[Fetch Response OK?]', resp.ok);         // 🔍 Boolean success
  const options = await resp.json();
  console.log('[Register Options]', options);           // 🔍 Server response body


      // Convert base64 to ArrayBuffer
      options.challenge = Uint8Array.from(atob(options.challenge), c => c.charCodeAt(0)).buffer;
      options.user.id = Uint8Array.from(atob(options.user.id), c => c.charCodeAt(0)).buffer;

      let credential;
      try {
        console.log('[Decoded Challenge]', options.challenge);
console.log('[Decoded User ID]', options.user.id);
console.log('[Final Options]', options);
        credential = await navigator.credentials.create({ publicKey: options });
        console.log('[Created Credential]', credential);
      } catch (err) {
        console.error('[WebAuthn Create Error]:', err);
        alert('Registration failed at navigator.credentials.create. See console.' + err.message);
        return;
      }

      const credentialJSON = {
        id: credential.id,
        rawId: btoa(String.fromCharCode(...new Uint8Array(credential.rawId))),
        type: credential.type,
        response: {
          attestationObject: btoa(String.fromCharCode(...new Uint8Array(credential.response.attestationObject))),
          clientDataJSON: btoa(String.fromCharCode(...new Uint8Array(credential.response.clientDataJSON)))
        }
      };

      const result = await fetch('/webauthn/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: credentialJSON, username })
      });

      if (result.ok) {
        alert('Security key registered!');
      } else {
        const error = await result.json();
        alert('Register failed: ' + error.error);
      }
    } catch (err) {
      console.error('[Register Error]', err);
      alert('Register failed. Check console for details.');
    }
  });

  document.getElementById('btn-login').addEventListener('click', async () => {
    const username = usernameInput.value;
    if (!username) return alert('Please enter a username.');

    try {
      const resp = await fetch('/webauthn/login-options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      });

      const options = await resp.json();
      console.log('[Login Options]', options);

      options.challenge = Uint8Array.from(atob(options.challenge), c => c.charCodeAt(0)).buffer;
      options.allowCredentials = options.allowCredentials.map(cred => ({
        ...cred,
        id: Uint8Array.from(atob(cred.id), c => c.charCodeAt(0)).buffer
      }));

      let assertion;
      try {
        assertion = await navigator.credentials.get({ publicKey: options });
        console.log('[Assertion]', assertion);
      } catch (err) {
        console.error('[WebAuthn Get Error]:', err);
        alert('Login failed at navigator.credentials.get. See console.');
        return;
      }

      const credentialJSON = {
        id: assertion.id,
        rawId: btoa(String.fromCharCode(...new Uint8Array(assertion.rawId))),
        type: assertion.type,
        response: {
          authenticatorData: btoa(String.fromCharCode(...new Uint8Array(assertion.response.authenticatorData))),
          clientDataJSON: btoa(String.fromCharCode(...new Uint8Array(assertion.response.clientDataJSON))),
          signature: btoa(String.fromCharCode(...new Uint8Array(assertion.response.signature))),
          userHandle: assertion.response.userHandle ? btoa(String.fromCharCode(...new Uint8Array(assertion.response.userHandle))) : null
        }
      };

      const loginResp = await fetch('/webauthn/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: credentialJSON, username })
      });

      if (loginResp.ok) {
        alert('Login successful! Reloading...');
        window.location.reload();
      } else {
        const error = await loginResp.json();
        alert('Login failed: ' + error.error);
      }
    } catch (err) {
      console.error('[Login Error]', err);
      alert('Login failed. Check console for details.');
    }
  });
});