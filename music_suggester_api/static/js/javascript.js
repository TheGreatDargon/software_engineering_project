// Shared page elements: query each fixed element once.
const audioInput = document.getElementById('audioInput');
const audioPlayer = document.getElementById('audioPlayer');
const playButton = document.getElementById('playButton');
const playIcon = document.getElementById('playIcon');
const audioPlayerVisual = playButton.closest('.audioPlayerVisual');
const dropZone = document.getElementById('drop-zone');
const trackCard = document.getElementById('track-card');
const resultsSection = document.getElementById('results');
const selectionStatus = document.getElementById('selected-track');
const trackDetails = document.getElementById('track-details');
const playerStatus = document.getElementById('player-status');
const clearTrackButton = document.getElementById('clear-track');
const findSimilarButton = document.getElementById('find-similar');
const recommendationTable = document.querySelector('table.table');
const headers = Array.from(recommendationTable.querySelectorAll('th.table-header'));
let selectionVersion = 0;
let selectedAudioURL = null;
let playbackRequestVersion = 0;

// Loaded with defer after the page markup is available.
// Metadata and artwork are optional; local controls never wait for a CDN.
let parseBlob;
let Kuroshiro;
let KuromojiAnalyzer;
let metadataToolsPromise;

function loadMetadataTools() {
    if (!metadataToolsPromise) {
        metadataToolsPromise = Promise.all([
            import('https://esm.sh/music-metadata@11'),
            import('https://esm.sh/kuroshiro@1.2.0'),
            import('https://esm.sh/kuroshiro-analyzer-kuromoji@1.1.0')
        ]).then(([metadata, kuroshiro, analyzer]) => {
            parseBlob = metadata.parseBlob;
            Kuroshiro = kuroshiro.default;
            KuromojiAnalyzer = analyzer.default;
        }).catch(error => {
            metadataToolsPromise = null;
            throw error;
        });
    }
    return metadataToolsPromise;
}

var player;
function onYouTubeIframeAPIReady() {
    player = new YT.Player('youtubeButton', {
        height: '0',
        width: '0',
        videoId: '6-gUFisDUvM?si=R0VMdl2i4ZBISjVe', // Replace with your video ID
    });
}

function playVideo() {
    if (player) player.playVideo();
}

function stopVideo() {
    if (player) player.pauseVideo();
}

// Sorting Table Javascript

function setAriaSortAttributes(headers, index) {
    const ascending = headers[index].getAttribute('aria-sort') !== 'ascending';
    headers.forEach((header, headerIndex) => {
        header.setAttribute('aria-sort', headerIndex === index
            ? (ascending ? 'ascending' : 'descending')
            : 'none');
    });
    return ascending;
}

function sortTableByColumn(table, columnIndex, ascending) {
    const body = table.tBodies[0];
    const header = table.tHead.rows[0].cells[columnIndex];
    const direction = ascending ? 1 : -1;
    const collator = new Intl.Collator('en', { sensitivity: 'base', numeric: true });
    const numeric = header.dataset.sortType === 'number';
    const value = row => {
        const text = row.cells[columnIndex].textContent.trim();
        return numeric
            ? Number.parseFloat(row.dataset[header.dataset.sortKey] ?? text)
            : text;
    };
    const rows = Array.from(body.rows).sort((a, b) => {
        const left = value(a);
        const right = value(b);
        if (numeric) {
            if (Number.isNaN(left)) return Number.isNaN(right) ? 0 : 1;
            if (Number.isNaN(right)) return -1;
            return (left - right) * direction;
        }
        return collator.compare(left, right) * direction;
    });
    body.replaceChildren(...rows);
    rows.forEach((row, index) => {
        const number = row.querySelector('[data-row-number]');
        if (number) number.textContent = index + 1;
    });
}

headers.forEach((header, index) => {
    const button = header.querySelector('[data-sort-column]');
    if (!button) return;
    header.addEventListener('click', () => {
        if (button.disabled) return;
        const ascending = setAriaSortAttributes(headers, index);
        sortTableByColumn(recommendationTable, index, ascending);
    });
});

// Audio Javascript

audioInput.addEventListener('change', () => {
    // Once backend is setup fetch the cover art for the song
})

async function playAudio() {
    if (!selectedAudioURL) return;
    const requestVersion = ++playbackRequestVersion;
    playerStatus.textContent = '';
    if (audioPlayer.ended) audioPlayer.currentTime = 0;
    try {
        await audioPlayer.play();
    } catch (error) {
        // A deliberate pause, clear, or file replacement cancels the old request.
        if (requestVersion !== playbackRequestVersion || error.name === 'AbortError') return;
        audioPlayer.pause();
        syncPlayback();
        playerStatus.textContent = error.name === 'NotAllowedError'
            ? 'Playback was blocked. Press Play to try again.'
            : 'This file could not be played. Please choose another MP3.';
    }
}

function stopAudio() {
    playbackRequestVersion++;
    audioPlayer.pause();
}

function setButtonPlaying(button, playing) {
    const icon = button === playButton ? playIcon : button.querySelector('.playIcon');
    const visual = button === playButton ? audioPlayerVisual : button.closest('.audioPlayerVisual');
    icon.textContent = playing ? '⏸' : '▶';
    visual.style.animation = 'spin 7s infinite linear';
    visual.style.animationPlayState = playing ? 'running' : 'paused';
    button.setAttribute('aria-pressed', String(playing));
    button.setAttribute('aria-label', playing ? 'Pause preview' : 'Play preview');
}

function isButtonPlaying(button) {
    return button === playButton
        ? !audioPlayer.paused && !audioPlayer.ended && !audioPlayer.error
        : button.getAttribute('aria-pressed') === 'true';
}

playButton.addEventListener('click', () => {
    isButtonPlaying(playButton) ? stopAudio() : playAudio();
});


async function getiTunesCoverArt(query) {
    const kuroshiro = new Kuroshiro();
    await kuroshiro.init(new KuromojiAnalyzer({
        dictPath: "https://cdn.jsdelivr.net/npm/kuromoji@0.1.2/dict/"
    }));

    const result = await kuroshiro.convert(query, {
        to: "romaji"
    });

    const url = `https://itunes.apple.com/search?term=${query}&entity=album&limit=1`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.results && data.results.length > 0) {
            const albumData = data.results[0];
            // Default artworkUrl100 is 100x100px.
            // Replace '100x100bb' with higher resolution like '600x600bb'
            const lowResArt = albumData.artworkUrl100;
            const highResArt = lowResArt.replace('100x100bb', '600x600bb');

            return {
                albumName: albumData.collectionName,
                artistName: albumData.artistName,
                artworkUrl: highResArt
            };
        }
        return null;
    } catch (error) {
        console.error('Error fetching iTunes artwork:', error);
        return null;
    }
}

// One active selection handler coordinates immediate UI and optional metadata.
async function handleFileSelection(event) {
    const file = event.target.files[0];
    if (!file) return; // Cancelling the picker preserves the selection.
    if (!/\.mp3$/i.test(file.name)) {
        clearSelection('Please choose an MP3 file.');
        return;
    }
    const version = ++selectionVersion;
    resetPreview();
    selectedAudioURL = URL.createObjectURL(file);
    audioPlayer.src = selectedAudioURL;
    selectionStatus.classList.remove('track-error');
    selectionStatus.textContent = `Selected ${file.name}. Showing sample recommendations.`;
    trackDetails.textContent = file.name;
    dropZone.hidden = true;
    trackCard.hidden = resultsSection.hidden = false;
    document.body.classList.add('has-track');

    try {
        await loadMetadataTools();
        if (version !== selectionVersion) return;
        const metadata = await parseBlob(file);
        const query = [metadata.common.title, metadata.common.album].filter(Boolean).join(' ');
        if (!query || version !== selectionVersion) return;
        const coverArt = await getiTunesCoverArt(query);
        // A previous selection must never overwrite the current track's artwork.
        if (version !== selectionVersion) return;
        if (coverArt) {
            playButton.style.backgroundImage = `url('${coverArt.artworkUrl}')`;
            playButton.style.backgroundSize = 'cover';
        } else {
            playButton.style.backgroundImage = 'unset';
        }
    } catch (error) {
        console.error('Error parsing audio metadata:', error);
    }
}

audioInput.addEventListener('change', handleFileSelection);

// Dynamically add rows for songs that were inputted

function addRow(tableID) {
    // Get a reference to the table
    const tableRef = document.getElementById(tableID);

    // Insert a row at the end of the table
    const newRow = tableRef.insertRow(-1);

    // Insert a cell in the row at index 0
    const newCell = newRow.insertCell(0);
    const secondCell = newRow.insertCell(1);

    // Append a text node to the cell
    const newText = document.createTextNode("New bottom row");
    const secondText = document.createTextNode("Second column");
    newCell.appendChild(newText);
    secondCell.appendChild(secondText);
}

addRow('inputtedSongs');

function syncPlayback() {
    setButtonPlaying(playButton, isButtonPlaying(playButton));
}

function resetPreview() {
    stopAudio();
    audioPlayer.removeAttribute('src');
    audioPlayer.load();
    if (selectedAudioURL) URL.revokeObjectURL(selectedAudioURL);
    selectedAudioURL = null;
    playButton.style.removeProperty('background-image');
    playerStatus.textContent = '';
    syncPlayback();
}

function clearSelection(message = '') {
    selectionVersion++;
    resetPreview();
    audioInput.value = '';
    trackDetails.textContent = '';
    selectionStatus.textContent = message;
    selectionStatus.classList.toggle('track-error', Boolean(message));
    trackCard.hidden = resultsSection.hidden = true;
    dropZone.hidden = false;
    dropZone.classList.remove('dragging');
    document.body.classList.remove('has-track');
}

function initializePageInterface() {
    for (const name of ['dragenter', 'dragover']) {
        dropZone.addEventListener(name, event => {
            event.preventDefault();
            dropZone.classList.add('dragging');
        });
    }
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragging'));
    dropZone.addEventListener('drop', event => {
        event.preventDefault();
        dropZone.classList.remove('dragging');
        if (!event.dataTransfer.files.length) return;
        const selection = new DataTransfer();
        selection.items.add(event.dataTransfer.files[0]);
        audioInput.files = selection.files;
        audioInput.dispatchEvent(new Event('change', { bubbles: true }));
    });
    clearTrackButton.addEventListener('click', () => {
        clearSelection();
        audioInput.focus();
    });
    findSimilarButton.addEventListener('click', () => {
        if (!audioInput.files.length) return;
        resultsSection.hidden = false;
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    for (const name of ['play', 'pause', 'ended', 'emptied']) audioPlayer.addEventListener(name, syncPlayback);
    audioPlayer.addEventListener('error', () => {
        audioPlayer.pause();
        syncPlayback();
        playerStatus.textContent = 'This file could not be played. Please choose another MP3.';
    });

    playButton.disabled = false;
    recommendationTable.querySelectorAll('[data-sort-column]').forEach(control => control.disabled = false);
}

initializePageInterface();
