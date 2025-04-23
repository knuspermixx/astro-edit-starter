import { createAuth0Client } from "@auth0/auth0-spa-js";

console.log("Auth0 Client Loaded");

async function main() {
  const auth0 = await createAuth0Client({
    domain: "dev-xt5nci8m2zxscg23.eu.auth0.com",
    clientId: "8XDuHzBPEG4eOlPTdTvzjRU0vUtZ9O4a",
    authorizationParams: {
      redirect_uri: "https://localhost:4321/astro-edit-starter/",
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
      // ignore if not a callback
    }
  });
}

main();
