const canvasContainer = document.getElementById("canvasContainer")
const canvas = document.getElementById("canvas")
const ctx = canvas.getContext("2d")
let stickersById = undefined

canvas.width = canvasContainer.getBoundingClientRect().width
canvas.height = canvasContainer.getBoundingClientRect().height

const stickerSearchInput = document.getElementById("stickerSearch")
const stickerSearchButton = document.getElementById("stickerSearchBtn")
const searchResultDiv = document.getElementById("search-result-div")
stickerSearchButton.addEventListener("click", handleSearchStickerChange)

let images = []
let selectedImageIndex = null
let offsetX, offsetY
let rotationPrecision = 1

function handleSearchStickerChange(e) {
  console.log("CALLED")
  const searchValue = stickerSearchInput.value.toLowerCase()

  if (searchValue && searchValue !== null && searchValue !== "") {
    searchResultDiv.style.display = "block"
    const stickers = Object.values(stickersById)
    const matchedItems = stickers.filter((item) =>
      item.name.toLowerCase().includes(searchValue)
    )
    // FIXME: Im pretty sure garbage collection would auto remove the event listeners here,
    // but if not fix
    searchResultDiv.innerHTML = ""
    const closeBtn = document.createElement("div")
    closeBtn.className = "sticker-result-close"
    closeBtn.innerText = "Close"
    closeBtn.addEventListener("click", (e) => {
      searchResultDiv.innerHTML = ""
      searchResultDiv.style.display = "none"
    })
    searchResultDiv.appendChild(closeBtn)
    for (let index = 0; index < matchedItems.length; index++) {
      const sticker = matchedItems[index]

      const div = document.createElement("div")
      div.className = "matched-sticker-result"
      const span = document.createElement("span")
      span.innerText = sticker.name
      const button = document.createElement("button")
      button.addEventListener("click", (e) => {
        // add sticker to canvas

        const imagePath = sticker.image
        // Calculate the offset for each sticker
        const offSet = 50
        selectedImageIndex = null
        updateSelectedImageInfo()
        loadImage(imagePath, offSet)
        searchResultDiv.style.display = "none"
        searchResultDiv.innerHTML = ""
      })
      button.innerText = "+"
      const smallImage = document.createElement("img")
      smallImage.loading = "lazy"
      smallImage.src = sticker.image
      smallImage.alt = "N/A"
      div.appendChild(smallImage)
      div.appendChild(span)
      div.appendChild(button)
      searchResultDiv.appendChild(div)
    }
  } else {
    searchResultDiv.innerHTML = ""
    searchResultDiv.style.display = "none"
  }
}

function drawImages() {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  images.forEach((image, index) => {
    ctx.save()
    ctx.translate(image.x, image.y)
    ctx.rotate(getAdjustedRotation(image.rotation))
    ctx.drawImage(
      image.element,
      -image.width / 2,
      -image.height / 2,
      image.width,
      image.height
    )
    ctx.restore()
  })
}

function getAdjustedRotation(rotation) {
  return rotation
}

function saveCanvas() {
  const dataURL = canvas.toDataURL("image/png")
  const link = document.createElement("a")
  link.href = dataURL
  link.download = "canvas.png"
  link.click()
}

function loadImage(path, offSet) {
  const image = new Image()
  image.onload = function () {
    images.push({
      element: image,
      x: canvas.width / 2 + offSet,
      y: canvas.height / 2,
      width: 200,
      height: 200,
      rotation: 0,
    })
    drawImages()
  }
  image.src = path
}

function handleMouseDown(event) {
  const mouseX = event.clientX - canvas.getBoundingClientRect().left
  const mouseY = event.clientY - canvas.getBoundingClientRect().top
  for (let i = images.length - 1; i >= 0; i--) {
    const image = images[i]
    const dx = Math.abs(mouseX - image.x)
    const dy = Math.abs(mouseY - image.y)

    if (dx <= image.width / 2 && dy <= image.height / 2) {
      selectedImageIndex = i
      offsetX = mouseX - image.x
      offsetY = mouseY - image.y
      canvas.addEventListener("mousemove", handleMouseMove)
      canvas.addEventListener("mouseup", handleMouseUp)
      updateSelectedImageInfo()
      return
    }
  }
}

function handleMouseMove(event) {
  const mouseX = event.clientX - canvas.getBoundingClientRect().left
  const mouseY = event.clientY - canvas.getBoundingClientRect().top
  images[selectedImageIndex].x = mouseX - offsetX
  images[selectedImageIndex].y = mouseY - offsetY
  drawImages()
}

function handleMouseUp() {
  canvas.removeEventListener("mousemove", handleMouseMove)
  canvas.removeEventListener("mouseup", handleMouseUp)
  updateSelectedImageInfo()
}

function handleWheel(event) {
  event.preventDefault()
  const delta = Math.sign(event.deltaY)
  const rotationAmount = ((delta * Math.PI) / 180) * rotationPrecision
  images[selectedImageIndex].rotation += rotationAmount
  drawImages()
}

function handleKeyDown(event) {
  if (
    event.key === "Backspace" &&
    selectedImageIndex !== null &&
    document.activeElement !== document.getElementById("searchInput")
  ) {
    images.splice(selectedImageIndex, 1)
    selectedImageIndex = null
    drawImages()
    updateSelectedImageInfo()
  } else if (event.key === "ArrowUp") {
    moveImageUp()
    event.preventDefault()
  } else if (event.key === "ArrowDown") {
    moveImageDown()
    event.preventDefault()
  }
}

function getStickerIdsFromUrl() {
  const params = new URLSearchParams(window.location.search)
  const slot0 = params.get("slot0")
  const slot1 = params.get("slot1")
  const slot2 = params.get("slot2")
  const slot3 = params.get("slot3")
  const slot4 = params.get("slot4")

  return [slot0, slot1, slot2, slot3, slot4]
}

async function findStickersById(idsToFind) {
  const response = await fetch("https://cs-sticker.com/stickers_by_id.json")
  stickersById = await response.json()

  return idsToFind.map((_id) => stickersById[_id])
}

async function placeSticker() {
  const stickerIds = getStickerIdsFromUrl()
  const foundStickers = await findStickersById(stickerIds)
  const validStickers = foundStickers.filter((sticker) => sticker !== undefined)
  validStickers.forEach((validSticker, index) => {
    const imagePath = validSticker.image
    // Calculate the offset for each sticker
    const offSet = 50 * index
    loadImage(imagePath, offSet)
  })
}

function updateSelectedImageInfo() {
  const selectedImage = images[selectedImageIndex]
  const selectedImageInfoDiv = document.getElementById("selectedImageInfo")
  if (selectedImage) {
    selectedImageInfoDiv.innerHTML = `<p style="color: #fff; font-size: 1rem;">Currently selected: </p><img src="${selectedImage.element.src}" class="selected-image"/>`
  } else {
    selectedImageInfoDiv.innerText = "No Image Selected"
  }
}

function moveImageDown() {
  if (selectedImageIndex !== null && selectedImageIndex > 0) {
    const temp = images[selectedImageIndex]
    images[selectedImageIndex] = images[selectedImageIndex - 1]
    images[selectedImageIndex - 1] = temp
    selectedImageIndex--
    drawImages()
  }
}

function moveImageUp() {
  if (selectedImageIndex !== null && selectedImageIndex < images.length - 1) {
    const temp = images[selectedImageIndex]
    images[selectedImageIndex] = images[selectedImageIndex + 1]
    images[selectedImageIndex + 1] = temp
    selectedImageIndex++
    drawImages()
  }
}

canvas.addEventListener("mousedown", handleMouseDown)
canvas.addEventListener("wheel", handleWheel)
window.addEventListener("keydown", handleKeyDown)

window.addEventListener("load", async () => {
  placeSticker()
})

// Get references to the canvas and overlay div elements
const canvasDiv = document.getElementById("canvas")
const overlayDiv = document.getElementById("selectedImageInfo")

// Calculate the position of the overlay div relative to the canvas
function positionOverlayDiv() {
  const canvasRect = canvas.getBoundingClientRect()

  // Calculate the position of the overlay div
  const overlayTop = canvasRect.top
  const overlayRight = canvasRect.left

  // Set the position of the overlay div
  overlayDiv.style.top = `${overlayTop}px`
  overlayDiv.style.right = `${overlayRight}px`
}

// Call the positionOverlayDiv function initially and on window resize
positionOverlayDiv()
window.addEventListener("resize", positionOverlayDiv)
