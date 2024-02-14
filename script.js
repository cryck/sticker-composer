let currentResultsList = []
let currentResultIndex = 0
const indexLabel = document.getElementById("result-index-label")

function decrementResultIndex() {
  const newIndex = currentResultIndex - 1

  if (newIndex >= 0 && newIndex < currentResultsList.length - 1) {
    currentResultIndex -= 1
    populateResults(currentResultIndex)
  }
}
function incrementResultIndex() {
  const newIndex = currentResultIndex + 1

  if (newIndex > 0 && newIndex <= currentResultsList.length - 1) {
    currentResultIndex += 1
    populateResults(currentResultIndex)
  }
}

function populateResults(resultIndex = 0) {
  let inputVal = document.getElementById("stickerInput").value
  let results = currentResultsList[resultIndex]
  const selectedStickers = []

  const resultIndexControls = document.getElementById("result-index-controls")

  if (currentResultsList.length > 1) {
    resultIndexControls.style.display = "flex"
  } else {
    resultIndexControls.style.display = "none"
  }
  
  indexLabel.innerText = `${currentResultIndex + 1}/${currentResultsList.length}`
  const resultsDiv = document.getElementById("results")
  resultsDiv.innerHTML = ""

  results.forEach((result, i) => {
    const groupDiv = document.createElement("div")
    groupDiv.classList.add("result-group")

    const matchedPartSpan = document.createElement("span")
    matchedPartSpan.classList.add("matched-part")
    matchedPartSpan.textContent = result.matchedLoc
      ? `${result.matchedLoc} : `
      : ""
    matchedPartSpan.textContent += result.matchedPart.toUpperCase()

    groupDiv.appendChild(matchedPartSpan)

    result.stickers.forEach((sticker) => {
      const stickerWrapper = document.createElement("div")
      stickerWrapper.classList.add("sticker-wrapper")
      stickerWrapper.setAttribute("data-name", sticker.name) // Set the tooltip text in data attribute

      const image = document.createElement("img")
      image.src = sticker.image
      image.alt = sticker.name
      image.classList.add("sticker-image")

      stickerWrapper.onclick = () => {
        // Add sticker info to selectedStickers
        selectedStickers[i].sticker = sticker
        selectedStickers[i].index = i
        renderSelectedStickers(selectedStickers)
      }

      stickerWrapper.appendChild(image)
      groupDiv.appendChild(stickerWrapper)
    })

    selectedStickers.push({ matchedPart: result.matchedPart }) // Create object for each matched part
    resultsDiv.appendChild(groupDiv)
  })

  const selectedStickersList = document.getElementById("selectedStickers")
  const inputValLower = inputVal.toLowerCase();

  if (results.length <= 0) {
    displayInfoMessage("No matches found for your input.", inputVal)
    selectedStickersList.style.display = "none"
  } else if (results.flat().map(x => x.matchedPart).join('') !== inputValLower) {
      displayInfoMessage("Could not match the entire input.", inputVal)
      selectedStickersList.style.display = "none"
  } else {
      selectedStickersList.style.display = "block"
  }
  renderSelectedStickers(selectedStickers)
}
function rotateResults(direction) {
  // direction is +-1
  const newIndex = currentResultIndex + direction

  if (newIndex < currentResultIndex.length - 1 && newIndex > 0) {
    populateResults(newIndex)
  }
}

async function callWorker() {
  let inputVal = document.getElementById("stickerInput").value
  // Remove spaces from the input
  inputVal = inputVal.replace(/\s+/g, "")
  const isBackwards = document.getElementById("isBackwards").checked
  const isDepth = document.getElementById("isDepth").checked

  const apiUrl = `https://5p-bush-rush.cryck.workers.dev/?input=${encodeURIComponent(
    inputVal
  )}&isBackwards=${isBackwards}&isDepth=${isDepth}`

  try {
    const response = await fetch(apiUrl)
    // results now has an additional layer for each permuation
    currentResultsList = await response.json()
    currentResultIndex = 0

    populateResults(currentResultIndex)
  } catch (error) {
    console.error("Error fetching data:", error)
  }
}

function displayInfoMessage(reason, inputVal) {
  const div = document.createElement("div")

  const text = document.createElement("span")
  text.classList.add("info-message")
  text.innerHTML = `${reason} Try another search term or try this other tool: `

  const link = document.createElement("a")
  link.href = `https://stickertool.pcpie.nl/?input=${encodeURIComponent(
    inputVal
  )}`
  link.textContent = "stickertool.pcpie.nl"
  link.target = "_blank"

  div.appendChild(text)
  div.appendChild(link)

  document.getElementById('infoContainer').replaceChildren(div)
}

function clearInfoMessage() {
  const infoContainer = document.getElementById('infoContainer');
  infoContainer.innerHTML = '';
}

document
  .getElementById("stickerInput")
  .addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      callWorker()
    }
  })

function renderSelectedStickers(selectedStickers) {
  const selectedStickersList = document.getElementById("selectedStickers")
  selectedStickersList.innerHTML = ""
  if (!selectedStickers.length) return

  const title = document.createElement("li")
  title.classList.add("selected-sticker-item")
  title.textContent = "Selected:"
  selectedStickersList.appendChild(title)

  selectedStickers.forEach((selected) => {
    const selectedStickerItem = document.createElement("li")
    selectedStickerItem.classList.add("selected-sticker-item")
    selectedStickerItem.textContent = selected.matchedPart.toUpperCase()

    if (selected.sticker) {
      const image = document.createElement("img")
      image.src = selected.sticker.image
      image.alt = selected.sticker.name
      image.classList.add("sticker-image")

      // Remove sticker from selectedStickers on click
      image.onclick = () => {
        selectedStickers[selected.index].sticker = null
        renderSelectedStickers(selectedStickers)
      }
      selectedStickerItem.appendChild(image)

      const selectedStickerInfo = document.createElement("a")
      selectedStickerInfo.classList.add("selected-sticker-info")
      selectedStickerInfo.textContent = selected.sticker.name
      selectedStickerInfo.href = `https://steamcommunity.com/market/listings/730/${encodeURIComponent(
        selected.sticker.name
      )}`
      selectedStickerInfo.target = "_blank"
      selectedStickerInfo.draggable = false
      selectedStickerItem.appendChild(selectedStickerInfo)
    }

    selectedStickersList.appendChild(selectedStickerItem)
  })
}

document.addEventListener("DOMContentLoaded", function () {
  const params = new URLSearchParams(window.location.search)
  const inputParam = params.get("input")
  if (inputParam) {
    document.getElementById("stickerInput").value =
      decodeURIComponent(inputParam)
    callWorker()
  }
})
