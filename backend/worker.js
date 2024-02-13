addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  // Set CORS headers
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, HEAD, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  }

  if (request.method === "GET") {
    const url = new URL(request.url)

    const input = url.searchParams.get("input").toLowerCase()

    const isBackwards = url.searchParams.get("isBackwards") === "true"
    const isDepth = url.searchParams.get("isDepth") === "true"

    let results = []
    if (isDepth) {
      results = await depthSearch(input)
    } else {
      results = await mainSearch(input, isBackwards)
    }

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  } else {
    return new Response("Method not allowed", {
      status: 405,
      headers: corsHeaders,
    })
  }
}

async function mainSearch(input, isBackwards) {
  // The original Search Method

  const data = await getStickers()

  let results = []
  let remainingInput = input
  let iterations = 0
  let filteredItems = []

  while (remainingInput.length > 0 && iterations < 5) {
    let foundMatch = false
    let matchPart = ""
    // Reset filteredItems at the start of each iteration
    filteredItems = []

    for (let length = remainingInput.length; length >= 1; length--) {
      const partialInput = isBackwards
        ? remainingInput.slice(-length)
        : remainingInput.substring(0, length)

      filteredItems = data.filter((item) => {
        item.matching ? console.log(item) : ""
        // Determine the string to match against (either item.matching or the middle part of the sticker name)
        const matchAgainst = item.matching
          ? item.matching.toLowerCase()
          : item.name
              .split("|")
              .map((part) => part.trim())[1]
              .toLowerCase()
        const middlePartMain = matchAgainst.split(" ")[0]

        return isBackwards
          ? middlePartMain.endsWith(partialInput)
          : middlePartMain.startsWith(partialInput)
      })

      if (filteredItems.length > 0) {
        foundMatch = true
        matchPart = partialInput
        remainingInput = isBackwards
          ? remainingInput.slice(0, -length)
          : remainingInput.substring(length)
        break
      }
    }

    if (foundMatch) {
      results.push({
        matchedPart: matchPart,
        stickers: filteredItems.map((item) => ({
          name: item.name,
          image: item.image,
        })),
      })
    }

    if (!foundMatch || remainingInput.length === 0) {
      break
    }

    iterations++
  }

  // have to nest it one deeper
  return isBackwards ? [results.reverse()] : [results]
}

async function depthSearch(input) {
  class Token {
    static START = "START"
    static END = "END"
    static MID = "MID"
    static TOTAL = "TOTAL"

    constructor(location, text) {
      this.location = location
      this.text = text
    }

    static stringifyToken(location, text) {
      return `'<Token:${location}:${text}>'`
    }
    stringifySelf() {
      return `'<Token:${this.location}:${this.text}>'`
    }
  }

  // Functions
  // group letters into all possible substring groupings
  function groupLetters(word) {
    let result = []

    function backtrack(start, current, result) {
      if (start === word.length) {
        result.push(current)
        return
      }
      for (let end = start + 1; end <= word.length; end++) {
        backtrack(end, current.concat([word.substring(start, end)]), result)
      }
    }

    backtrack(0, [], result)
    return result
  }

  // add each possible localization to each token
  function getTokensWithEachLoc(groupedLetters) {
    function aplit(token) {
      /**
       * Get all possible token locations for each token in each string split.
       */
      let tokenPossibilities = []
      let tokenLocations = [Token.START, Token.END, Token.MID, Token.TOTAL]
      tokenLocations.forEach((tokenLoc) => {
        tokenPossibilities.push(new Token(tokenLoc, token))
      })
      return tokenPossibilities
    }

    let allPossibleForEachTok = []
    groupedLetters.forEach((token) => {
      allPossibleForEachTok.push(aplit(token))
    })
    return allPossibleForEachTok
  }

  // Get all permutations of the tokens treating differntly localized tokens as different
  function cartesianProduct(localizedTokenGroups) {
    // Recursive function to generate the cartesian product
    function cartesianHelper(inputArrays, output, currentIndex) {
      if (currentIndex === inputArrays.length) {
        result.push([...output])
        return
      }

      for (let i = 0; i < inputArrays[currentIndex].length; i++) {
        output[currentIndex] = inputArrays[currentIndex][i]
        cartesianHelper(inputArrays, output, currentIndex + 1)
      }
    }

    const result = []
    cartesianHelper(localizedTokenGroups, [], 0)
    return result
  }
  // only certain token localizations can be next to each other to spell words without gaps
  function checkViability(prevToken, potentialNextToken) {
    if (potentialNextToken.location === Token.TOTAL) {
      return (
        prevToken.location === Token.START ||
        prevToken.location === Token.END ||
        prevToken.location === Token.MID ||
        prevToken.location === Token.TOTAL
      )
    }
    if (potentialNextToken.location === Token.MID) {
      return (
        prevToken.location === Token.END || prevToken.location === Token.TOTAL
      )
    }
    if (potentialNextToken.location === Token.START) {
      return (
        prevToken.location === Token.START ||
        prevToken.location === Token.END ||
        prevToken.location === Token.MID ||
        prevToken.location === Token.TOTAL
      )
    }
    if (potentialNextToken.location === Token.END) {
      return (
        prevToken.location === Token.END || prevToken.location === Token.TOTAL
      )
    }
  }

  function stickerfyWord(word, tokenizationMap) {
    // Get all possible string splits with less than 5 tokens(stickers)
    const groupings = groupLetters(word).filter((group) => group.length <= 5)

    const results = []

    for (const group of groupings) {
      const groupingWithLoc = getTokensWithEachLoc(group)
      const allGroupingPermutations = cartesianProduct(groupingWithLoc)

      // Filtering Possibilities
      const idxToKeep = []
      for (
        let comboIdx = 0;
        comboIdx < allGroupingPermutations.length;
        comboIdx++
      ) {
        // A Single Combination Example ["ap","pl","e"] or ["ap","pl", "e"] with different locations
        // At this point these strings are instances of the Token class and also have spacial information
        /*  [Token { location: "START", text: "appl" },Token { location: "START", text: "e" }], */
        const combo = allGroupingPermutations[comboIdx]

        let status = true
        // If the required tokens are > 5 the sticker combo is not possible
        if (combo.length > 5) {
          continue
        }

        for (let i = 0; i < combo.length; i++) {
          if (i - 1 >= 0) {
            const lastToken = combo[i - 1]
            if (!checkViability(lastToken, combo[i])) {
              status = false
              break
            }
          }
        }

        if (status) {
          idxToKeep.push(comboIdx)
        }

        //  End of allGroupingPermutations loop
      }

      // Now we have the allGroupingPermutations indexes that are plausible

      // Array to hold the elements at specified indices
      const filtered = []
      // Loop through each index and push the corresponding element into the filtered array
      idxToKeep.forEach((index) => {
        if (index >= 0 && index < allGroupingPermutations.length) {
          filtered.push(allGroupingPermutations[index])
        } else {
          // Handle out-of-bounds indices if needed
          console.error(`Index ${index} is out of bounds.`)
        }
      })

      const aggregated_list = []
      const combo_set = []
      for (let i = 0; i < filtered.length; i++) {
        const combo = filtered[i]
        const stickers_matching_tokens = []
        let status = true

        for (const positionalToken of combo) {
          const list_of_stickers_match =
            tokenizationMap[positionalToken.stringifySelf()] || null

          if (list_of_stickers_match !== null) {
            stickers_matching_tokens.push(list_of_stickers_match)
          } else {
            status = false
          }
        }

        // If all tokens exist we need to check if the combination will result in >5 stickers accounting for coverings
        if (status) {
          let stickersNeeded = combo.length
          if (
            combo[0].location === Token.END ||
            combo[0].location === Token.MID
          ) {
            stickersNeeded = stickersNeeded + 1
          }

          if (
            combo[combo.length - 1].location === Token.START ||
            combo[combo.length - 1].location === Token.MID
          ) {
            stickersNeeded = stickersNeeded + 1
          }

          if (stickersNeeded <= 5) {
            combo_set.push(combo)
            aggregated_list.push(stickers_matching_tokens)
          }
        }
      }

      if (combo_set.length > 0) {
        for (let k = 0; k < combo_set.length; k++) {
          const combo = combo_set[k]

          const possibleTextSplit = []
          for (let j = 0; j < combo.length; j++) {
            const matchedPart = combo[j].text
            const matchedLoc = combo[j].location
            const lst = aggregated_list[k][j]

            const stickers = lst
            const result_to_add = {
              matchedPart: matchedPart,
              matchedLoc: matchedLoc,
              stickers: stickers,
            }

            possibleTextSplit.push(result_to_add)
          }

          results.push(possibleTextSplit)
        }
      }
    }

    return results
  }
  const tokenizationMap = await getTokenizations()

  // results consists of all N permutations of tokens that spell input with various locations
  const results = stickerfyWord(input, tokenizationMap)

  return results
}

async function getTokenizations() {
  const response = await fetch(
    "http://127.0.0.1:5500/sticker-composer/tokenized_player_names.json"
  )
  // <Token:${token-location}:${token-string}>
  const tokenizationMap = await response.json()

  return tokenizationMap
}

async function getStickers() {
  const response = await fetch(
    "http://127.0.0.1:5500/sticker-composer/stickers.json"
  )
  const allStickers = await response.json()
  return allStickers
    .filter((sticker) => !sticker.ignore)
    .filter(
      (sticker) =>
        sticker.description.toLowerCase().includes("autographed") ||
        sticker.matching
    )
}
