async function callWorker() {
    let inputVal = document.getElementById('stickerInput').value;
    // Remove spaces from the input
    inputVal = inputVal.replace(/\s+/g, '');
    const isBackwards = document.getElementById('isBackwards').checked;
    const apiUrl = `https://polished-bush-fd60.cryck.workers.dev/?input=${encodeURIComponent(inputVal)}&isBackwards=${isBackwards}`;

    try {
        const response = await fetch(apiUrl);
        const results = await response.json();

        const resultsDiv = document.getElementById('results');
        resultsDiv.innerHTML = '';

            // Reverse the results if isBackwards is true to ensure they are displayed from left to right
            if (isBackwards) {
                results.reverse();
            }

            results.forEach(result => {
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

                    // Encode sticker name for URL
                    stickerWrapper.onclick = () => {
                        let stickerNameForURL = encodeURIComponent(sticker.name);
                        window.open(`https://steamcommunity.com/market/listings/730/${stickerNameForURL}`, '_blank');

                        // Copy sticker name to clipboard
                        document.body.focus(); // Attempt to focus the document
                        navigator.clipboard.writeText(sticker.name).then(() => {
                            console.log('Sticker name copied to clipboard');
                        }).catch(err => {
                            console.error('Failed to copy sticker name to clipboard', err);
                        });
                    };

                    stickerWrapper.appendChild(image);
                    groupDiv.appendChild(stickerWrapper);
                });

                resultsDiv.appendChild(groupDiv);
            });

            if (results.length === 0) {
                const infoMessageDiv = document.createElement('div');
                infoMessageDiv.classList.add('info-message');
                infoMessageDiv.textContent = "No matches found for your input. Try another search term.";
                resultsDiv.appendChild(infoMessageDiv);
            }
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