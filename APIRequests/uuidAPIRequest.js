const fetchTimeout = (url, ms, { signal, ...options } = {}) => { //Yoinked from https://stackoverflow.com/a/57888548 under CC BY-SA 4.0
    const controller = new AbortController();
    const promise = fetch(url, { signal: controller.signal, ...options });
    if (signal) signal.addEventListener("abort", () => controller.abort());
    const timeout = setTimeout(() => controller.abort(), ms);
    return promise.finally(() => clearTimeout(timeout));
};

export async function requestUUID(username, undefinedIfHasntAborted) {
    let controller = new AbortController();
    return Promise.all([
        fetchTimeout(`https://playerdb.co/api/player/minecraft/${username}`, 2000, {
          signal: controller.signal
        }).then(async function(response) {
          if (response.status === 500) {let newError = new Error("HTTP status " + response.status); newError.name = "NotFound"; throw newError;}
          if (!response.ok) {
            let responseJson = await response.json();
            let newError = new Error(`HTTP status ${response.status}; ${responseJson.cause}`);
            newError.name = "HTTPError";
            throw newError;
          }
          return response.json();
        })
      ])
      .then((response) => {
        return response[0].data.player.id;
      })
      .catch(async (err) => {
        if (err.name === "AbortError") {
            if (undefinedIfHasntAborted === undefined) return requestUUID(player, true); //Simple way to try again without an infinite loop
        }
        console.error(new Date().toLocaleTimeString('en-IN', { hour12: true }), err.stack);
        throw err;
      });
  };