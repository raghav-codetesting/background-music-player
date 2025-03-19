// 🎨 Canvas Setup
const canvas = document.getElementById("line-art");
const ctx = canvas.getContext("2d");
const particlesCanvas = document.getElementById("particles");
const particlesCtx = particlesCanvas.getContext("2d");
const textContainer = document.getElementById("text-container");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
particlesCanvas.width = window.innerWidth;
particlesCanvas.height = window.innerHeight;

// 🎨 Function to generate random positions
function getRandomPosition() {
    return {
        x: Math.random() * (canvas.width - 200) + 100,
        y: Math.random() * (canvas.height - 200) + 100
    };
}

function resizeCanvas() {
    const prevWidth = canvas.width;
    const prevHeight = canvas.height;

    // Scale factors
    const scaleX = window.innerWidth / prevWidth;
    const scaleY = window.innerHeight / prevHeight;

    // Resize canvas
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    particlesCanvas.width = window.innerWidth;
    particlesCanvas.height = window.innerHeight;

    // Adjust line positions
    lines.forEach(line => {
        line.start.x *= scaleX;
        line.start.y *= scaleY;
        line.end.x *= scaleX;
        line.end.y *= scaleY;
    });

    // Adjust particle positions
    particles.forEach(particle => {
        particle.x *= scaleX;
        particle.y *= scaleY;
    });
}

// Handle Window Resizing Smoothly
window.addEventListener("resize", resizeCanvas);


// 🖊 Line storage (history)
const lines = [];
const maxLines = 10; // Maximum number of visible lines

let startPos = getRandomPosition();
let endPos = getRandomPosition();
let progress = 0;

// Animation Control Flag
let animationActive = true;

// 🖊 Function to draw the animated lines with fading
function drawLines() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw stored lines with gradual fading
    lines.forEach((line, index) => {
        ctx.beginPath();
        ctx.moveTo(line.start.x, line.start.y);
        ctx.lineTo(line.end.x, line.end.y);
        ctx.strokeStyle = `rgba(255, 255, 255, ${line.alpha})`;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Fade out oldest lines gradually when exceeding maxLines
        if (lines.length > maxLines) {
            let excess = lines.length - maxLines;
            if (index < excess) {
                line.alpha -= 0.02; // Slow fade-out effect
            }
        }

        // If paused, fade out all lines gradually
        if (!animationActive) {
            line.alpha -= 0.01;
        }
    });

    // Get Text Container Dimensions
    const textContainer = document.getElementById("text-container");
    if (textContainer) {
        const rect = textContainer.getBoundingClientRect(); // Get its position & size

        // Apply Smooth Opacity Mask
        ctx.save();
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)"; // Semi-transparent black overlay
        ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
        ctx.restore();
    }

    // Feathering Effect (Soft Fade at Edges)
    ctx.save();
    const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, canvas.width / 2,
        canvas.width / 2, canvas.height / 2, canvas.width
    );
    gradient.addColorStop(0.85, "rgba(0, 0, 0, 0)");
    gradient.addColorStop(1, "rgba(0, 0, 0, 0.6)");

    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();

    // Remove fully faded-out lines smoothly
    while (lines.length > 0 && lines[0].alpha <= 0) {
        lines.shift();
    }

    if (animationActive) {
        // Calculate the current line position
        let currentX = startPos.x + (endPos.x - startPos.x) * progress;
        let currentY = startPos.y + (endPos.y - startPos.y) * progress;

        // Draw the newest segment
        ctx.beginPath();
        ctx.moveTo(startPos.x, startPos.y);
        ctx.lineTo(currentX, currentY);
        ctx.strokeStyle = "rgba(255, 255, 255, 1)";
        ctx.lineWidth = 2;
        ctx.stroke();

        progress += 0.01;

        if (progress >= 1) {
            // Store the completed line (full opacity)
            lines.push({ start: { ...startPos }, end: { ...endPos }, alpha: 1 });

            // Reset for the next line
            progress = 0;
            startPos = endPos;
            endPos = getRandomPosition();
        }
    }

    requestAnimationFrame(drawLines);
}   

drawLines();

// Get User's Geo Coordinates
function toDMS(deg) {
    const d = Math.floor(deg);
    const minFloat = (deg - d) * 60;
    const m = Math.floor(minFloat);
    const s = ((minFloat - m) * 60).toFixed(3);
    return `${d}° ${m}’ ${s}”`;
}

navigator.geolocation.getCurrentPosition(
    (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        document.getElementById("geo-coordinates").textContent = `${toDMS(lat)} (𝜙) | λ ${toDMS(lon)} (𝜆)`;
    },
    () => {
        document.getElementById("geo-coordinates").textContent = "Location unavailable";
    }
);

// Handle Window Resizing
window.onresize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    particlesCanvas.width = window.innerWidth;
    particlesCanvas.height = window.innerHeight;
};

// 🎵 Music Controls
const musicToggle = document.getElementById("music-toggle");
const audioPlayer = document.getElementById("audio-player");
const audioNext = document.getElementById("next-song");
const audioPrev = document.getElementById("prev-song")

const songTitleElement = document.getElementById("song-title");



let isPlaying = false;
let currentSongIndex = 0;

// List of songs
const songs = [
    "music/c h e r r y.mp3",
    "music/Dancing Days.mp3",
    "music/darling.mp3",
    "music/don't i make it look easy.mp3",
    "music/Endless Romance.mp3",
    "music/Euphoria (summer vibes).mp3",
    "music/exhale.mp3",
    "music/Feelinlonely.mp3",
    "music/flowerz.mp3",
    "music/i know where i'm going.mp3",
    "music/Look @ me.mp3",
    "music/piano loop.mp3",
    "music/Timeless.mp3",
    "music/Time-mp3",
    "music/TORIMICHI.mp3",
    "music/uber to your place.mp3",
    "music/wav.mp3",
    "music/x jhfly.mp3"
];

// Load first song
audioPlayer.src = songs[currentSongIndex];

// Play/Pause Music & Animations
musicToggle.addEventListener("click", () => {
    if (isPlaying) {
        audioPlayer.pause();
        musicToggle.textContent = "▶";
        animationActive = false; // Start fading out animations
    } else {
        audioPlayer.play();
        musicToggle.textContent = "⏸";
        animationActive = true; // Resume animations
    }
    isPlaying = !isPlaying;
});

// ⏭ Play Next Song
function playNextSong() {
    audioPlayer.pause();
    audioPlayer.currentTime = 0;

    currentSongIndex = (currentSongIndex + 1) % songs.length;
    audioPlayer.src = songs[currentSongIndex];
    audioPlayer.load();
    updateSongTitle();

    if (isPlaying) audioPlayer.play();
}

function playPrevSong() {
    audioPlayer.pause();
    audioPlayer.currentTime = 0;

    currentSongIndex = (currentSongIndex - 1) % songs.length;
    audioPlayer.src = songs[currentSongIndex];
    audioPlayer.load();
    updateSongTitle();

    if (isPlaying) audioPlayer.play();
}

function updateSongTitle() {
    // Extract filename without extension
    let filename = songs[currentSongIndex].split("/").pop().replace(/\.[^/.]+$/, ""); 
    songTitleElement.textContent = filename;
}

audioNext.addEventListener("click", playNextSong);

// Auto-play next song when one ends
audioPlayer.addEventListener("ended", playNextSong);

audioPrev.addEventListener("click", playPrevSong);
updateSongTitle();

// 🎨 Particle Animation
class Particle {
    constructor() {
        this.x = Math.random() * particlesCanvas.width;
        this.y = Math.random() * particlesCanvas.height;
        this.radius = Math.random() * 3 + 1;
        this.velocityX = Math.random() * 1 - 0.5;
        this.velocityY = Math.random() * 1 - 0.5;
        this.alpha = 1; // Opacity
    }

    update() {
        if (!animationActive) {
            this.alpha = Math.max(0, this.alpha - 0.02); // Fade out when paused
        } else {
            this.alpha = Math.min(1, this.alpha + 0.05); // Fade in when resumed
            this.x += this.velocityX;
            this.y += this.velocityY;

            if (this.x < 0 || this.x > particlesCanvas.width) this.velocityX *= -1;
            if (this.y < 0 || this.y > particlesCanvas.height) this.velocityY *= -1;
        }
    }

    draw() {
        particlesCtx.beginPath();
        particlesCtx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        particlesCtx.fillStyle = `rgba(255,255,255,${this.alpha})`;
        particlesCtx.fill();
    }
}

const particles = Array.from({ length: 50 }, () => new Particle());

function animateParticles() {
    particlesCtx.clearRect(0, 0, particlesCanvas.width, particlesCanvas.height);
    particles.forEach((particle) => {
        particle.update();
        particle.draw();
    });

    requestAnimationFrame(animateParticles);
}

animateParticles();