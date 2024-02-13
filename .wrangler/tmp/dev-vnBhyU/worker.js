(() => {
  // .wrangler/tmp/bundle-hoSxDI/checked-fetch.js
  var urls = /* @__PURE__ */ new Set();
  function checkURL(request, init) {
    const url = request instanceof URL ? request : new URL(
      (typeof request === "string" ? new Request(request, init) : request).url
    );
    if (url.port && url.port !== "443" && url.protocol === "https:") {
      if (!urls.has(url.toString())) {
        urls.add(url.toString());
        console.warn(
          `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:
 - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.
`
        );
      }
    }
  }
  globalThis.fetch = new Proxy(globalThis.fetch, {
    apply(target, thisArg, argArray) {
      const [request, init] = argArray;
      checkURL(request, init);
      return Reflect.apply(target, thisArg, argArray);
    }
  });

  // node_modules/wrangler/templates/middleware/common.ts
  var __facade_middleware__ = [];
  function __facade_register__(...args) {
    __facade_middleware__.push(...args.flat());
  }
  function __facade_registerInternal__(...args) {
    __facade_middleware__.unshift(...args.flat());
  }
  function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
    const [head, ...tail] = middlewareChain;
    const middlewareCtx = {
      dispatch,
      next(newRequest, newEnv) {
        return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
      }
    };
    return head(request, env, ctx, middlewareCtx);
  }
  function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
    return __facade_invokeChain__(request, env, ctx, dispatch, [
      ...__facade_middleware__,
      finalMiddleware
    ]);
  }

  // node_modules/wrangler/templates/middleware/loader-sw.ts
  var __FACADE_EVENT_TARGET__;
  if (globalThis.MINIFLARE) {
    __FACADE_EVENT_TARGET__ = new (Object.getPrototypeOf(WorkerGlobalScope))();
  } else {
    __FACADE_EVENT_TARGET__ = new EventTarget();
  }
  function __facade_isSpecialEvent__(type) {
    return type === "fetch" || type === "scheduled";
  }
  var __facade__originalAddEventListener__ = globalThis.addEventListener;
  var __facade__originalRemoveEventListener__ = globalThis.removeEventListener;
  var __facade__originalDispatchEvent__ = globalThis.dispatchEvent;
  globalThis.addEventListener = function(type, listener, options) {
    if (__facade_isSpecialEvent__(type)) {
      __FACADE_EVENT_TARGET__.addEventListener(
        type,
        listener,
        options
      );
    } else {
      __facade__originalAddEventListener__(type, listener, options);
    }
  };
  globalThis.removeEventListener = function(type, listener, options) {
    if (__facade_isSpecialEvent__(type)) {
      __FACADE_EVENT_TARGET__.removeEventListener(
        type,
        listener,
        options
      );
    } else {
      __facade__originalRemoveEventListener__(type, listener, options);
    }
  };
  globalThis.dispatchEvent = function(event) {
    if (__facade_isSpecialEvent__(event.type)) {
      return __FACADE_EVENT_TARGET__.dispatchEvent(event);
    } else {
      return __facade__originalDispatchEvent__(event);
    }
  };
  globalThis.addMiddleware = __facade_register__;
  globalThis.addMiddlewareInternal = __facade_registerInternal__;
  var __facade_waitUntil__ = Symbol("__facade_waitUntil__");
  var __facade_response__ = Symbol("__facade_response__");
  var __facade_dispatched__ = Symbol("__facade_dispatched__");
  var __Facade_ExtendableEvent__ = class extends Event {
    [__facade_waitUntil__] = [];
    waitUntil(promise) {
      if (!(this instanceof __Facade_ExtendableEvent__)) {
        throw new TypeError("Illegal invocation");
      }
      this[__facade_waitUntil__].push(promise);
    }
  };
  var __Facade_FetchEvent__ = class extends __Facade_ExtendableEvent__ {
    #request;
    #passThroughOnException;
    [__facade_response__];
    [__facade_dispatched__] = false;
    constructor(type, init) {
      super(type);
      this.#request = init.request;
      this.#passThroughOnException = init.passThroughOnException;
    }
    get request() {
      return this.#request;
    }
    respondWith(response) {
      if (!(this instanceof __Facade_FetchEvent__)) {
        throw new TypeError("Illegal invocation");
      }
      if (this[__facade_response__] !== void 0) {
        throw new DOMException(
          "FetchEvent.respondWith() has already been called; it can only be called once.",
          "InvalidStateError"
        );
      }
      if (this[__facade_dispatched__]) {
        throw new DOMException(
          "Too late to call FetchEvent.respondWith(). It must be called synchronously in the event handler.",
          "InvalidStateError"
        );
      }
      this.stopImmediatePropagation();
      this[__facade_response__] = response;
    }
    passThroughOnException() {
      if (!(this instanceof __Facade_FetchEvent__)) {
        throw new TypeError("Illegal invocation");
      }
      this.#passThroughOnException();
    }
  };
  var __Facade_ScheduledEvent__ = class extends __Facade_ExtendableEvent__ {
    #scheduledTime;
    #cron;
    #noRetry;
    constructor(type, init) {
      super(type);
      this.#scheduledTime = init.scheduledTime;
      this.#cron = init.cron;
      this.#noRetry = init.noRetry;
    }
    get scheduledTime() {
      return this.#scheduledTime;
    }
    get cron() {
      return this.#cron;
    }
    noRetry() {
      if (!(this instanceof __Facade_ScheduledEvent__)) {
        throw new TypeError("Illegal invocation");
      }
      this.#noRetry();
    }
  };
  __facade__originalAddEventListener__("fetch", (event) => {
    const ctx = {
      waitUntil: event.waitUntil.bind(event),
      passThroughOnException: event.passThroughOnException.bind(event)
    };
    const __facade_sw_dispatch__ = function(type, init) {
      if (type === "scheduled") {
        const facadeEvent = new __Facade_ScheduledEvent__("scheduled", {
          scheduledTime: Date.now(),
          cron: init.cron ?? "",
          noRetry() {
          }
        });
        __FACADE_EVENT_TARGET__.dispatchEvent(facadeEvent);
        event.waitUntil(Promise.all(facadeEvent[__facade_waitUntil__]));
      }
    };
    const __facade_sw_fetch__ = function(request, _env, ctx2) {
      const facadeEvent = new __Facade_FetchEvent__("fetch", {
        request,
        passThroughOnException: ctx2.passThroughOnException
      });
      __FACADE_EVENT_TARGET__.dispatchEvent(facadeEvent);
      facadeEvent[__facade_dispatched__] = true;
      event.waitUntil(Promise.all(facadeEvent[__facade_waitUntil__]));
      const response = facadeEvent[__facade_response__];
      if (response === void 0) {
        throw new Error("No response!");
      }
      return response;
    };
    event.respondWith(
      __facade_invoke__(
        event.request,
        globalThis,
        ctx,
        __facade_sw_dispatch__,
        __facade_sw_fetch__
      )
    );
  });
  __facade__originalAddEventListener__("scheduled", (event) => {
    const facadeEvent = new __Facade_ScheduledEvent__("scheduled", {
      scheduledTime: event.scheduledTime,
      cron: event.cron,
      noRetry: event.noRetry.bind(event)
    });
    __FACADE_EVENT_TARGET__.dispatchEvent(facadeEvent);
    event.waitUntil(Promise.all(facadeEvent[__facade_waitUntil__]));
  });

  // node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
  function reduceError(e) {
    return {
      name: e?.name,
      message: e?.message ?? String(e),
      stack: e?.stack,
      cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
    };
  }
  var jsonError = async (request, env, _ctx, middlewareCtx) => {
    try {
      return await middlewareCtx.next(request, env);
    } catch (e) {
      const error = reduceError(e);
      return Response.json(error, {
        status: 500,
        headers: { "MF-Experimental-Error-Stack": "true" }
      });
    }
  };
  var middleware_miniflare3_json_error_default = jsonError;

  // .wrangler/tmp/bundle-hoSxDI/middleware-insertion-facade.js
  __facade_registerInternal__([middleware_miniflare3_json_error_default]);

  // backend/worker.js
  addEventListener("fetch", (event) => {
    event.respondWith(handleRequest(event.request));
  });
  async function handleRequest(request) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };
    if (request.method === "GET") {
      const url = new URL(request.url);
      const input = url.searchParams.get("input").toLowerCase();
      const isBackwards = url.searchParams.get("isBackwards") === "true";
      const isDepth = url.searchParams.get("isDepth") === "true";
      let results = [];
      if (isDepth) {
        results = await depthSearch(input);
      } else {
        results = await mainSearch(input, isBackwards);
      }
      return new Response(JSON.stringify(results), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    } else {
      return new Response("Method not allowed", {
        status: 405,
        headers: corsHeaders
      });
    }
  }
  async function mainSearch(input, isBackwards) {
    const data = await getStickers();
    let results = [];
    let remainingInput = input;
    let iterations = 0;
    let filteredItems = [];
    while (remainingInput.length > 0 && iterations < 5) {
      let foundMatch = false;
      let matchPart = "";
      filteredItems = [];
      for (let length = remainingInput.length; length >= 1; length--) {
        const partialInput = isBackwards ? remainingInput.slice(-length) : remainingInput.substring(0, length);
        filteredItems = data.filter((item) => {
          item.matching ? console.log(item) : "";
          const matchAgainst = item.matching ? item.matching.toLowerCase() : item.name.split("|").map((part) => part.trim())[1].toLowerCase();
          const middlePartMain = matchAgainst.split(" ")[0];
          return isBackwards ? middlePartMain.endsWith(partialInput) : middlePartMain.startsWith(partialInput);
        });
        if (filteredItems.length > 0) {
          foundMatch = true;
          matchPart = partialInput;
          remainingInput = isBackwards ? remainingInput.slice(0, -length) : remainingInput.substring(length);
          break;
        }
      }
      if (foundMatch) {
        results.push({
          matchedPart: matchPart,
          stickers: filteredItems.map((item) => ({
            name: item.name,
            image: item.image
          }))
        });
      }
      if (!foundMatch || remainingInput.length === 0) {
        break;
      }
      iterations++;
    }
    return isBackwards ? [results.reverse()] : [results];
  }
  async function depthSearch(input) {
    class Token {
      static START = "START";
      static END = "END";
      static MID = "MID";
      static TOTAL = "TOTAL";
      constructor(location, text) {
        this.location = location;
        this.text = text;
      }
      static stringifyToken(location, text) {
        return `'<Token:${location}:${text}>'`;
      }
      stringifySelf() {
        return `'<Token:${this.location}:${this.text}>'`;
      }
    }
    function groupLetters(word) {
      let result = [];
      function backtrack(start, current, result2) {
        if (start === word.length) {
          result2.push(current);
          return;
        }
        for (let end = start + 1; end <= word.length; end++) {
          backtrack(end, current.concat([word.substring(start, end)]), result2);
        }
      }
      backtrack(0, [], result);
      return result;
    }
    function getTokensWithEachLoc(groupedLetters) {
      function aplit(token) {
        let tokenPossibilities = [];
        let tokenLocations = [Token.START, Token.END, Token.MID, Token.TOTAL];
        tokenLocations.forEach((tokenLoc) => {
          tokenPossibilities.push(new Token(tokenLoc, token));
        });
        return tokenPossibilities;
      }
      let allPossibleForEachTok = [];
      groupedLetters.forEach((token) => {
        allPossibleForEachTok.push(aplit(token));
      });
      return allPossibleForEachTok;
    }
    function cartesianProduct(localizedTokenGroups) {
      function cartesianHelper(inputArrays, output, currentIndex) {
        if (currentIndex === inputArrays.length) {
          result.push([...output]);
          return;
        }
        for (let i = 0; i < inputArrays[currentIndex].length; i++) {
          output[currentIndex] = inputArrays[currentIndex][i];
          cartesianHelper(inputArrays, output, currentIndex + 1);
        }
      }
      const result = [];
      cartesianHelper(localizedTokenGroups, [], 0);
      return result;
    }
    function checkViability(prevToken, potentialNextToken) {
      if (potentialNextToken.location === Token.TOTAL) {
        return prevToken.location === Token.START || prevToken.location === Token.END || prevToken.location === Token.MID || prevToken.location === Token.TOTAL;
      }
      if (potentialNextToken.location === Token.MID) {
        return prevToken.location === Token.END || prevToken.location === Token.TOTAL;
      }
      if (potentialNextToken.location === Token.START) {
        return prevToken.location === Token.START || prevToken.location === Token.END || prevToken.location === Token.MID || prevToken.location === Token.TOTAL;
      }
      if (potentialNextToken.location === Token.END) {
        return prevToken.location === Token.END || prevToken.location === Token.TOTAL;
      }
    }
    function stickerfyWord(word, tokenizationMap2) {
      const groupings = groupLetters(word).filter((group) => group.length <= 5);
      const results2 = [];
      for (const group of groupings) {
        const groupingWithLoc = getTokensWithEachLoc(group);
        const allGroupingPermutations = cartesianProduct(groupingWithLoc);
        const idxToKeep = [];
        for (let comboIdx = 0; comboIdx < allGroupingPermutations.length; comboIdx++) {
          const combo = allGroupingPermutations[comboIdx];
          let status = true;
          if (combo.length > 5) {
            continue;
          }
          for (let i = 0; i < combo.length; i++) {
            if (i - 1 >= 0) {
              const lastToken = combo[i - 1];
              if (!checkViability(lastToken, combo[i])) {
                status = false;
                break;
              }
            }
          }
          if (status) {
            idxToKeep.push(comboIdx);
          }
        }
        const filtered = [];
        idxToKeep.forEach((index) => {
          if (index >= 0 && index < allGroupingPermutations.length) {
            filtered.push(allGroupingPermutations[index]);
          } else {
            console.error(`Index ${index} is out of bounds.`);
          }
        });
        const aggregated_list = [];
        const combo_set = [];
        for (let i = 0; i < filtered.length; i++) {
          const combo = filtered[i];
          const stickers_matching_tokens = [];
          let status = true;
          for (const positionalToken of combo) {
            const list_of_stickers_match = tokenizationMap2[positionalToken.stringifySelf()] || null;
            if (list_of_stickers_match !== null) {
              stickers_matching_tokens.push(list_of_stickers_match);
            } else {
              status = false;
            }
          }
          if (status) {
            let stickersNeeded = combo.length;
            if (combo[0].location === Token.END || combo[0].location === Token.MID) {
              stickersNeeded = stickersNeeded + 1;
            }
            if (combo[combo.length - 1].location === Token.START || combo[combo.length - 1].location === Token.MID) {
              stickersNeeded = stickersNeeded + 1;
            }
            if (stickersNeeded <= 5) {
              combo_set.push(combo);
              aggregated_list.push(stickers_matching_tokens);
            }
          }
        }
        if (combo_set.length > 0) {
          for (let k = 0; k < combo_set.length; k++) {
            const combo = combo_set[k];
            const possibleTextSplit = [];
            for (let j = 0; j < combo.length; j++) {
              const matchedPart = combo[j].text;
              const matchedLoc = combo[j].location;
              const lst = aggregated_list[k][j];
              const stickers = lst;
              const result_to_add = {
                matchedPart,
                matchedLoc,
                stickers
              };
              possibleTextSplit.push(result_to_add);
            }
            results2.push(possibleTextSplit);
          }
        }
      }
      return results2;
    }
    const tokenizationMap = await getTokenizations();
    const results = stickerfyWord(input, tokenizationMap);
    return results;
  }
  async function getTokenizations() {
    const response = await fetch(
      "http://127.0.0.1:5500/sticker-composer/tokenized_player_names.json"
    );
    const tokenizationMap = await response.json();
    return tokenizationMap;
  }
  async function getStickers() {
    const response = await fetch(
      "http://127.0.0.1:5500/sticker-composer/stickers.json"
    );
    const allStickers = await response.json();
    return allStickers.filter((sticker) => !sticker.ignore).filter(
      (sticker) => sticker.description.toLowerCase().includes("autographed") || sticker.matching
    );
  }
})();
//# sourceMappingURL=worker.js.map
