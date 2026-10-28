import { parseBlob } from 'https://esm.sh/music-metadata@11';
import Kuroshiro from "kuroshiro";
import KuromojiAnalyzer from "kuroshiro-analyzer-kuromoji";

// Youtube Iframe API
var tag = document.createElement('script');
tag.src = "https://youtube.com";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

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
    for (let i = 0; i < headers.length; i++) {
        if (index != i) {
            headers[i].setAttribute("aria-sort", "none");
        }
        else if (headers[i].getAttribute("aria-sort") == "ascending") {
            headers[i].setAttribute("aria-sort", "descending");
        }
        else {
            headers[i].setAttribute("aria-sort", "ascending");
        }
    };
}

function sortTableByColumn(table, columnIndex, ascending) {
    const direction = ascending ? 1 : -1;
    const theaders = Array.from(table.querySelectorAll('th.table-header'));
    const rows = Array.from(table.querySelectorAll("tr:nth-child(n+2)"));
    const rowsToDelete = table.querySelectorAll('tr.table-row');
    const sortedRows = rows.sort((a, b) => {
        a = a.querySelector(`td:nth-child(${columnIndex + 1})`).textContent.trim();
        b = b.querySelector(`td:nth-child(${columnIndex + 1})`).textContent.trim();
        return a > b ? (1 * direction) : (-1 * direction);
    });
    rowsToDelete.forEach(row => row.remove());
    table.replaceChildren(...theaders, ...sortedRows);
}

const headers = document.getElementsByClassName("table-header");

for (let i = 0; i < headers.length; i++) {
    document.getElementsByClassName("table-header")[i].addEventListener("click", function () {
        setAriaSortAttributes(headers, i);
        const tableElement = document.getElementsByClassName("table")[0];
        const currentIsAscending = this.getAttribute("aria-sort") === "ascending";
        sortTableByColumn(tableElement, i, !currentIsAscending);
    });
};

// Audio Javascript

const audioInput = document.getElementById('audioInput');
const audioPlayer = document.getElementById('audioPlayer');

audioInput.addEventListener('change', () => {
    // Once backend is setup fetch the cover art for the song
})

function playAudio() {
    const file = audioInput.files[0];

    if (file) {
        // Generate a temporary object URL for the local file
        const objectURL = URL.createObjectURL(file);

        // Assign the URL to the audio tag
        audioPlayer.src = objectURL;

        // Optional: auto-play once loaded
        audioPlayer.play();
    }
};

function stopAudio() {
    audioPlayer.pause();
}

const playButtons = document.querySelectorAll('.playButton');
var playButton = document.getElementById('playButton');
var playIcon = document.getElementById('playIcon');
const audioPlayerVisual = playButton.closest('.audioPlayerVisual');
const youtubeButton = document.querySelector('.youtubeButton');

// Shared visual state for every play button: swaps the icon and spins/pauses its wrapper
function setButtonPlaying(button, playing) {
    const icon = button.querySelector('.playIcon');
    const visual = button.closest('.audioPlayerVisual');
    icon.textContent = playing ? "⏸" : "▶";
    visual.style.animation = 'spin 7s infinite linear';
    visual.style.animationPlayState = playing ? 'running' : 'paused';
}

function isButtonPlaying(button) {
    return button.querySelector('.playIcon').textContent == "⏸";
}

playButtons.forEach(button => button.addEventListener('click', () => {
    const playing = !isButtonPlaying(button);

    // Only one button can be playing at a time
    if (playing) {
        playButtons.forEach(other => {
            if (other != button && isButtonPlaying(other)) {
                setButtonPlaying(other, false);
                if (other == playButton) stopAudio();
            }
        });
    }

    setButtonPlaying(button, playing);

    if (button == playButton) {
        playing ? playAudio() : stopAudio();
    }

    if (button == youtubeButton) {
        playing ? playVideo() : stopVideo();
    }

}));


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

audioInput.addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {

        const metadata = await parseBlob(file);


        var query = `${metadata.common.title} ${metadata.common.album}`;

        // Fetch and display Album Art if it exists
        const coverArt = await getiTunesCoverArt(query);
        console.log(query);

        if (coverArt) {
            playButton.style.backgroundImage = `url('${coverArt.artworkUrl}')`;
            playButton.style.backgroundSize = 'cover';
            audioPlayerVisual.style.animationName = 'none';
            audioPlayerVisual.style.rotate = 'none';
            playIcon.textContent = "▶"
        }
        else {
            console.log("No album art found")
            playButton.style.backgroundImage = 'unset';
        }
    } catch (error) {
        console.error("Error parsing audio metadata:", error);
    }
});

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