import { createAuth0Client } from "@auth0/auth0-spa-js";

console.log("auth0-client.ts loaded");
const auth0 = await createAuth0Client({
  domain: "https://dev-xt5nci8m2zxscg23.eu.auth0.com",
  clientId: "aum2VaJ1GHfp8CUJhnCMqLvdojKt66CU",
  authorizationParams: {
    redirect_uri: "http://localhost:4321/astro-edit-starter/",
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
  }
});
