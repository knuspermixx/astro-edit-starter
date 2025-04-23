import { createAuth0Client } from "@auth0/auth0-spa-js";

console.log("Auth0 Client Loaded");

(async () => {
  const auth0 = await createAuth0Client({
    domain: "https://knuspermixx.github.io/astro-edit-starter",
    clientId: "Ov23liKVZrrbX5HhF2lb",
    authorizationParams: {
      redirect_uri: "https://knuspermixx.github.io/astro-edit-starter",
    },
  });

  document.getElementById("login")?.addEventListener("click", async () => {
    await auth0.loginWithRedirect();
  });

  window.addEventListener("load", async () => {
    try {
      const redirectResult = await auth0.handleRedirectCallback();
      const user = await auth0.getUser();
      console.log(user);
    } catch (e) {
      // Kein Redirect, kein Problem
    }
  });
})();
