import { createHTTPRequest, errorHandler, localStorageBytes, getSyncStorage, setSyncStorage, syncStorageBytes } from "../utility.js";

errorEventCreate();

const apiKeyInput = document.getElementById("apiKey"),
      apiKeyOutput = document.getElementById("apiKeyOutput"),
      testKey = document.getElementById("testKey"),
      uuidV4 = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[45][0-9a-fA-F]{3}-[89ABab][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;

//eslint-disable-next-line init-declarations
let userOptions;

(async () => {
  try {
    userOptions = await getSyncStorage("userOptions");
    await loadSettings();
    saveCheckbox();
    saveAPIKey();
    testAPIKey();
  } catch (err) {
    errorHandler(err, document.getElementById("errorOutput"));
  }
})();

//eslint-disable-next-line max-statements
async function loadSettings() {
  if ((userOptions.paragraphOutput ?? false) === false) document.getElementById("authorNameOutputContainer").style.display = "none";
  document.getElementById("typewriterOutput").checked = userOptions.typewriterOutput ?? true;
  document.getElementById("persistentLastPlayer").checked = userOptions.persistentLastPlayer ?? true;
  document.getElementById("firstLogin").checked = userOptions.firstLogin ?? true;
  document.getElementById("lastLogout").checked = userOptions.lastLogout ?? true;
  document.getElementById("gameStats").checked = userOptions.gameStats ?? true;
  document.getElementById("paragraphOutput").checked = userOptions.paragraphOutput ?? false;
  document.getElementById("authorNameOutput").checked = userOptions.authorNameOutput ?? false;
  document.getElementById("useHypixelAPI").checked = userOptions.useHypixelAPI ?? false;
  document.getElementById("apiKey").value = userOptions.apiKey.replace(/^[0-9a-fA-F]{8}/g, "########") ?? "";

  //If there is no API key, disable the "Test Key" button
  if (userOptions.apiKey === "") {
    testKey.style.cursor = "not-allowed";
    testKey.disabled = true;
  } else {
    testKey.style.cursor = "pointer";
    testKey.disabled = false;
  }

  const localBytes = await localStorageBytes("playerHistory"),
        syncBytes = await syncStorageBytes("userOptions");

  document.getElementById("playerHistoryBytes").textContent = `Search History: ${(localBytes / 1024).toFixed(2)} Kilobytes`;
  document.getElementById("userOptionsBytes").textContent = `Settings: ${(syncBytes / 1024).toFixed(2)} Kilobytes`;
}

function saveCheckbox() {
  document.querySelectorAll("input[type=checkbox]").forEach(checkbox => {
    checkbox.addEventListener("change", async change => {
      if (change.target.id === "paragraphOutput") {
        const paragraphOutput = document.getElementById("authorNameOutputContainer");
        if (change.target.checked === true) paragraphOutput.style.display = "block";
        else paragraphOutput.style.display = "none";
      }
      userOptions[change.target.id] = change.target.checked;
      change.disabled = true;
      setTimeout(() => {
        change.disabled = false;
      }, 500);
      await setSyncStorage({ "userOptions": userOptions });
    });
  });
}

function saveAPIKey() {
  //eslint-disable-next-line max-statements
  apiKeyInput.addEventListener("input", async input => {
    userOptions.apiKey = input.target.value;
    if (uuidV4.test(input.target.value) || input.target.value === "") {
      apiKeyOutput.textContent = "";
      input.target.style.borderColor = "#FFFFFF";
      testKey.style.borderColor = "#FFFFFF";
      if (input.target.value === "") {
        testKey.style.cursor = "not-allowed";
        testKey.disabled = true;
      } else {
        testKey.style.cursor = "pointer";
        testKey.disabled = false;
      }
      await setSyncStorage({ "userOptions": userOptions });
    } else {
      testKey.style.cursor = "not-allowed";
      testKey.disabled = true;
      testKey.style.borderColor = "#FF5555";
      input.target.style.borderColor = "#FF5555";
      apiKeyOutput.style.color = "#FF5555";
      const temp = document.createElement("b");
      temp.textContent = "/api new";
      apiKeyOutput.textContent = "";
      apiKeyOutput.append("\u{26A0} Invalid API key! Hypixel API keys will follow the UUID v4 format. Get an API key with ", temp, " on Hypixel \u{26A0}");
    }
  });

  apiKeyInput.addEventListener("focus", focus => {
    focus.target.value = userOptions.apiKey ?? "";
  });

  apiKeyInput.addEventListener("blur", blur => {
    if (uuidV4.test(blur.target.value)) blur.target.value = userOptions.apiKey.replace(/^[0-9a-fA-F]{8}/gi, "########");
  });
}

function testAPIKey() {
  //eslint-disable-next-line max-statements
  testKey.addEventListener("click", async click => {
    try {
      //Prevent API Spam
      click.disabled = true;
      setTimeout(() => {
        click.disabled = false;
      }, 500);
      const response = await createHTTPRequest(`https://api.hypixel.net/key?key=${userOptions.apiKey}`, {});
      apiKeyOutput.style.color = "#FFFFFF";
      apiKeyOutput.textContent = `\u{2713} Valid API Key! Total uses: ${response?.record?.totalQueries} \u{2713}`;
    } catch (err) {
      err.api = "Hypixel";
      if (err?.status !== 403) throw err;
      apiKeyOutput.style.color = "#FF5555";
      const temp = document.createElement("b");
      temp.textContent = "/api new";
      apiKeyOutput.textContent = "";
      apiKeyOutput.append("\u{26A0} Invalid API key! Please either switch to the Slothpixel API or get a new API key with ", temp, " on Hypixel \u{26A0}");
    }
  });
}

function errorEventCreate() {
  window.addEventListener("error", error => errorHandler(error, document.getElementById("errorOutput"), error.constructor.name));
  window.addEventListener("unhandledrejection", error => errorHandler(error, document.getElementById("errorOutput"), error.constructor.name));
  window.onerror = () => true;
}

//eslint-disable-next-line multiline-comment-style
//Uuid for error tracing in the future - maybe.
//Absolutely incredible
//Function b(a){return a?Math.random().toString(16)[2]:(""+1e7+-1e3+-4e3+-8e3+-1e11).replace(/1|0/g,b)}
//https://gist.github.com/jed/982883
//Let uuid = () => ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,c =>(c^(window.crypto||window.msCrypto).getRandomValues(new Uint8Array(1))[0]&15>>c/4).toString(16));
//https://gist.github.com/jed/982883#gistcomment-3644691
