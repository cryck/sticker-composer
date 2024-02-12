async function callWorker() {
    let inputVal = document.getElementById('stickerInput').value;
    // Remove spaces from the input
    inputVal = inputVal.replace(/\s+/g, '');
    const isBackwards = document.getElementById('isBackwards').checked;
    const apiUrl = `https://polished-bush-fd60.cryck.workers.dev/?input=${encodeURIComponent(inputVal)}&isBackwards=${isBackwards}`;

    try {
        const response = await fetch(apiUrl);
        const results = await response.json();
        const selectedStickers = []

        const resultsDiv = document.getElementById('results');
        resultsDiv.innerHTML = '';

            // Reverse the results if isBackwards is true to ensure they are displayed from left to right
            if (isBackwards) {
                results.reverse();
            }

            results.forEach((result, i) => {
                const groupDiv = document.createElement('div');
                groupDiv.classList.add('result-group');

                const matchedPartSpan = document.createElement('span');
                matchedPartSpan.classList.add('matched-part');
                matchedPartSpan.textContent = result.matchedPart.toUpperCase();
                groupDiv.appendChild(matchedPartSpan);

                result.stickers.forEach(sticker => {
                    const stickerWrapper = document.createElement('div');
                    stickerWrapper.classList.add('sticker-wrapper');
                    stickerWrapper.setAttribute('data-name', sticker.name); // Set the tooltip text in data attribute

                    const image = document.createElement('img');
                    image.src = sticker.image;
                    image.alt = sticker.name;
                    image.classList.add('sticker-image');

                    stickerWrapper.onclick = () => {
                        // Add sticker info to selectedStickers
                        selectedStickers[i].sticker = sticker
                        selectedStickers[i].index = i
                        renderSelectedStickers(selectedStickers)
                    };

                    stickerWrapper.appendChild(image);
                    groupDiv.appendChild(stickerWrapper);
                });

                selectedStickers.push({matchedPart: result.matchedPart}) // Create object for each matched part
                resultsDiv.appendChild(groupDiv);
            });

            if (results.length === 0) {
                const infoMessageDiv = document.createElement('div');
                infoMessageDiv.classList.add('info-message');
                infoMessageDiv.innerHTML = "No matches found for your input. Try another search term or try this other tool: ";

                const link = document.createElement('a');
                link.href = `https://stickertool.pcpie.nl/?input=${encodeURIComponent(inputVal)}`;
                link.textContent = 'stickertool.pcpie.nl';
                link.target = "_blank";

                infoMessageDiv.appendChild(link);
                resultsDiv.appendChild(infoMessageDiv);
            } 
            renderSelectedStickers(selectedStickers)
    } catch (error) {
        console.error('Error fetching data:', error);
        alert('Failed to fetch data from the worker.');
    }
}

document.getElementById('stickerInput').addEventListener('keypress', function(event) {
    if (event.key === "Enter") {
        callWorker();
    }
});

function renderSelectedStickers(selectedStickers) {
    const selectedStickersList = document.getElementById('selectedStickers');
    selectedStickersList.innerHTML = '';
    if(!selectedStickers.length) return

    const title = document.createElement('li');
    title.classList.add('selected-sticker-item');
    title.textContent = "Selected:";
    selectedStickersList.appendChild(title);

    selectedStickers.forEach(selected => {
        const selectedStickerItem = document.createElement('li');
        selectedStickerItem.classList.add('selected-sticker-item');
        selectedStickerItem.textContent = selected.matchedPart.toUpperCase();

        if (selected.sticker) {
            const image = document.createElement('img');
            image.src = selected.sticker.image;
            image.alt = selected.sticker.name;
            image.classList.add('sticker-image');

            // Remove sticker from selectedStickers on click
            image.onclick = () => {
                selectedStickers[selected.index].sticker = null
                renderSelectedStickers(selectedStickers)
            }
            selectedStickerItem.appendChild(image)

            const selectedStickerInfo = document.createElement('a');
            selectedStickerInfo.classList.add('selected-sticker-info');
            selectedStickerInfo.textContent = selected.sticker.name;
            selectedStickerInfo.href = `https://steamcommunity.com/market/listings/730/${encodeURIComponent(selected.sticker.name)}`;
            selectedStickerInfo.target = '_blank';
            selectedStickerInfo.draggable = false;
            selectedStickerItem.appendChild(selectedStickerInfo);
        }
        
        selectedStickersList.appendChild(selectedStickerItem);
    });
}

document.addEventListener('DOMContentLoaded', function() {
    const params = new URLSearchParams(window.location.search);
    const inputParam = params.get('input');
    if (inputParam) {
        document.getElementById('stickerInput').value = decodeURIComponent(inputParam);
        callWorker();
    }
});