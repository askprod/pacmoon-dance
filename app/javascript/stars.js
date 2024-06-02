const canvas = document.getElementById('starryBackground');
const context = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const introAudio = document.getElementById('crazySpinIntroAudio');
const loopAudio = document.getElementById('crazySpinLoopAudio');
let stars = [];
let spinAngle = 0;
let trails = []; // Array to store trails
let images = [];
let loadedImages = 0;
let imageStarsCount = 0; // Counter for the number of image stars
let flashInterval; // Interval ID for periodic flashing
let twitterInterval;

function loadImages(paths, callback) {
  paths.forEach(item => {
    let img = new Image();
    img.onload = () => {
      loadedImages++;
      if (loadedImages === paths.length) {
        callback();
      }
    };
    img.onerror = (error) => {
      console.error('Error loading image:', item.img, error); // Log loading errors
      loadedImages++; // Increment counter even if there's an error to ensure the callback is eventually called
      if (loadedImages === paths.length) {
        callback();
      }
    };
    img.src = item.img; // Accessing the 'img' property of each object
    images.push(img);
  });
}

function getRandomColor() {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return `rgba(${r},${g},${b},1)`;
}

const colorMap = {
  red: 'rgba(255, 0, 0, 1)',
  green: 'rgba(0, 255, 0, 1)',
  blue: 'rgba(0, 0, 255, 1)',
  yellow: 'rgba(255, 255, 0, 1)',
  cyan: 'rgba(0, 255, 255, 1)',
  magenta: 'rgba(255, 0, 255, 1)',
  white: 'rgba(255, 255, 255, 1)',
  black: 'rgba(0, 0, 0, 1)',
  pink: 'rgba(227, 61, 148, 1)'
};

function initStars(numStars) {
  let imageCount = 0;
  const pacmoonImages = Object.values(__global_pacmoon_logos); // Extract values from the object
  const pacmoonImagesToAdd = 10;

  while (imageCount < pacmoonImagesToAdd) {
    const img = new Image();
    img.src = pacmoonImages[imageCount % pacmoonImages.length].img;
    const originalImageRadius = Math.random() * 50 + 50; // Calculate original radius for each star
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: originalImageRadius,
      alpha: 1,
      speed: Math.random() * 0.5 + 0.1,
      angle: Math.random() * Math.PI * 2,
      color: null,
      hasTrail: false,
      trail: [],
      angleChange: 0,
      rotation: 0,
      rotationSpeed: 0,
      image: img,
      originalRadius: originalImageRadius, // Use the calculated original radius
      flashing: false,
      flashAlpha: 0,
      flashStartTime: null,
      flashColor: colorMap.yellow, // Default flash color (yellow)
      isCurrentUser: false
    });
    imageCount++;
  }

  // Add one image from each __other_participants with specific flash colors
  Object.entries(__other_participants).forEach(([key, participant]) => {
    const img = new Image();
    img.src = participant.img;
    const originalImageRadius = Math.random() * 20 + 50; // Calculate original radius for each star

    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: originalImageRadius,
      alpha: 1,
      speed: Math.random() * 0.5 + 0.1,
      angle: Math.random() * Math.PI * 2,
      color: participant.color,
      hasTrail: false,
      trail: [],
      angleChange: 0,
      rotation: 0,
      rotationSpeed: 0,
      image: img,
      originalRadius: originalImageRadius, // Use the calculated original radius
      flashing: false,
      flashAlpha: 0,
      flashStartTime: null,
      flashColor: participant.color, // Use the specific flash color
      isCurrentUser: (participant.name === __current_user)
    });
    imageCount++;
  });

  // Add remaining stars without images
  while (stars.length < numStars) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 2 + 0.5,
      alpha: Math.random(),
      speed: Math.random() * 0.5 + 0.1,
      angle: Math.random() * Math.PI * 2,
      color: 'rgba(255, 255, 255, 1)',
      hasTrail: false,
      trail: [],
      angleChange: 0,
      rotation: 0,
      rotationSpeed: 0,
      image: null,
      originalRadius: Math.random() * 1.5, // Set originalRadius to a random value between 1.5 and 3
      flashing: false,
      flashAlpha: 0,
      flashStartTime: null,
      flashColor: colorMap.white, // Default flash color (white)
      isCurrentUser: false
    });
  }
}

function drawStars() {
  context.clearRect(0, 0, canvas.width, canvas.height);

  // Draw trails
  trails.forEach(trail => {
    context.beginPath();
    context.strokeStyle = trail.color;
    context.globalAlpha = 0.5; // Make the trail slightly transparent
    context.moveTo(trail.positions[0].x, trail.positions[0].y);
    for (let i = 1; i < trail.positions.length; i++) {
      context.lineTo(trail.positions[i].x, trail.positions[i].y);
    }
    context.stroke();
  });

  // Draw stars
  // First loop to draw stars and images
  stars.forEach(star => {
    context.save();
    context.globalAlpha = star.alpha;

    if (star.flashing) {
      context.fillStyle = star.flashColor.replace('1)', `${star.flashAlpha})`); // Use flashColor with varying alpha
      context.beginPath();
      context.arc(star.x, star.y, star.radius, 0, Math.PI * 2, false); // Larger radius for flash
      context.fill();
    }

    if (star.image) {
      // Draw rotating image
      const size = star.radius; // Use the current size for images
      context.translate(star.x, star.y);
      context.rotate(star.rotation);

      // Create a clipping path for the circle
      context.beginPath();
      context.arc(0, 0, size / 2, 0, Math.PI * 2);
      context.closePath();
      context.clip();

      // Draw the image within the clipping path
      context.drawImage(star.image, -size / 2, -size / 2, size, size);

      context.rotate(-star.rotation);
      context.translate(-star.x, -star.y);
    } else {
      // Draw star
      context.fillStyle = star.color; // Use the star's color
      context.beginPath();
      context.arc(star.x, star.y, star.radius, 0, Math.PI * 2, false);
      context.fill();
    }

    context.restore();
  });

  stars.forEach(star => {
    if (star.isCurrentUser && star.image) {
      const size = star.radius; // Use the current size for images

      // Draw the yellow mask
      context.save();
      context.globalAlpha = 0.5; // Set alpha for a soft mask
      context.fillStyle = star.color; // Set the mask color to yellow
      context.beginPath();
      context.arc(star.x, star.y, size / 2, 0, Math.PI * 2);
      context.closePath();
      context.fill();
      context.restore();

      // Draw the styled text box
      const text = 'You are here';
      context.font = '10px Arial'; // Set font style
      const textWidth = context.measureText(text).width; // Get width of the text
      const textHeight = parseInt(context.font); // Get height of the text (assuming the font size is in pixels)
      const padding = 8; // Padding around the text
      const rectWidth = textWidth + padding * 2; // Total width of the rectangle
      const rectHeight = textHeight + padding * 2; // Total height of the rectangle
      const rectX = star.x - rectWidth / 2; // X position of the rectangle
      const rectY = star.y + size / 2 + textHeight / 2; // Y position of the rectangle

      // Draw the black mask (background of the text box)
      context.fillStyle = 'black';
      context.fillRect(rectX, rectY, rectWidth, rectHeight);

      // Draw the border around the rectangle
      context.strokeStyle = star.color;
      context.lineWidth = 1;
      context.strokeRect(rectX, rectY, rectWidth, rectHeight);

      // Draw the text inside the rectangle
      context.fillStyle = star.color; // Set text color to white
      context.fillText(text, rectX + padding, rectY + padding + textHeight / 1.2); // Draw text
    }
  });


}

function animateStars(timestamp) {
  stars.forEach(star => {
    star.angle += star.angleChange; // Change the angle for curved paths
    star.x += star.speed * Math.cos(star.angle);
    star.y += star.speed * Math.sin(star.angle);

    if (star.x > canvas.width) star.x = 0;
    if (star.x < 0) star.x = canvas.width;
    if (star.y > canvas.height) star.y = 0;
    if (star.y < 0) star.y = canvas.height;

    // Rotate image stars
    if (star.image) {
      star.rotation += star.rotationSpeed;
    }

    // Add current position to the trail
    if (star.hasTrail) {
      star.trail.push({ x: star.x, y: star.y });
      if (star.trail.length > 10) star.trail.shift(); // Limit the trail length
    }

    // Handle progressive flash effect
    if (star.flashing) {
      if (!star.flashStartTime) star.flashStartTime = timestamp;
      const flashDuration = 300; // Total flash duration in milliseconds
      const elapsed = timestamp - star.flashStartTime;

      if (elapsed < flashDuration) {
        star.flashAlpha = 1 - (elapsed / flashDuration); // Decrease alpha over time
        star.radius = star.originalRadius * (1 + elapsed / flashDuration); // Increase size over time
      } else {
        // Reset properties when flashing ends
        star.flashing = false;
        star.flashAlpha = 0;
        star.radius = star.originalRadius; // Reset size to original
        star.flashStartTime = null; // Reset start time for next flash
      }
    }
  });

  // Update trails array with current trails
  trails = stars.filter(star => star.hasTrail).map(star => ({
    color: star.color, // Yellow color for trails
    positions: star.trail
  }));

  drawStars();
  requestAnimationFrame(animateStars);
}


function crazySpin() {
  stars.forEach(star => {
    // Limit the maximum speed of stars
    const maxSpeed = 10;
    const minSpeed = 0.1; // Minimum speed for stars
    const speed =  Math.min(Math.random() * maxSpeed + minSpeed, maxSpeed);
    star.speed = speed;

    star.angle = Math.random() * Math.PI * 2;
    star.color = star.image ? star.color : getRandomColor();
    star.hasTrail = Math.random() < 0.03;
    star.trail = [];
    star.angleChange = Math.random() * 0.2 - 0.1;

    if (star.image && Math.random() < 0.5) {
      star.rotationSpeed = Math.random() * 0.2 - 0.1;
    }

    setInterval(() => {
      star.angleChange = Math.random() * 0.2 - 0.1;
    }, 1000);
  });
  spinAngle = 0.01;
}


// Flash effect function for the intro kicks
function flashImages() {
  stars.forEach(star => {
    if (star.image) {
      star.flashing = true; // Set flashing flag
      star.flashAlpha = 1; // Start with full alpha
      star.radius = star.originalRadius; // Start with original size
    }
  });
}

// Flash effect function for the loop audio
function flashRandomImages() {
  const imageStars = stars.filter(star => star.image); // Filter out only the stars that are images
  const numberOfImagesToFlash = Math.ceil(0.3 * imageStars.length); // 10% of the number of image stars
  const flashedIndices = new Set(); // Set to keep track of flashed stars to avoid duplicates
  while (flashedIndices.size < numberOfImagesToFlash) {
    const index = Math.floor(Math.random() * imageStars.length);
    if (!flashedIndices.has(index)) {
      const star = imageStars[index];
      star.flashing = true; // Set flashing flag
      star.flashAlpha = 1; // Start with full alpha
      star.radius = star.originalRadius; // Start with original size
      flashedIndices.add(index);
    }
  }
}

function setRandomTwitterHandle() {
  const userNames = Object.keys(__other_participants);
  const randomUserName = userNames[Math.floor(Math.random() * userNames.length)];
  const linkElement = document.getElementById('twitter-handle');
  linkElement.textContent = `@${randomUserName}`;
  linkElement.href = linkElement.href.replace(/https:\/\/x\.com\/.*/, 'https://x.com/' + randomUserName);
}


// Start periodic flashing for the loop audio
function startPeriodicFlashing() {
  setTimeout(function() {
    flashRandomImages();
    setRandomTwitterHandle();
  }, 450); // First clap sync

  setTimeout(function() {
    flashInterval = setInterval(flashRandomImages, 950);
    twitterInterval = setInterval(setRandomTwitterHandle, 950);
  }, 600); // Other synced claps
}

// Stop periodic flashing for the loop audio
function stopPeriodicFlashing() {
  clearInterval(flashInterval);
  clearInterval(twitterInterval);
}

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  stars = [];
  imageStarsCount = 0; // Reset image star counter on resize
  introAudio.stop();
  loopAudio.stop();
  initStars(500);
});

const allParticipants = { ...__global_pacmoon_logos, ...__other_participants };

// Load images and start animation after all images are loaded
loadImages(Object.values(allParticipants), () => {
  initStars(500);
  drawStars();
  requestAnimationFrame(animateStars);
});

const btnTexts = [
  "I told you not to click...",
  "Sorry, there's no stopping the $PAC now...",
  "You should have read the disclaimer!",
  "YOU GOT $PAC-REKT",
  "You'll never stop us from going to the moon!",
  "AAAAHAHAHAHAHAHAHA",
  "😈👻🤘👾😈👻🤘👾😈👻🤘👾😈👻🤘👾😈👻"
];

function changeButtonText(event) {
  var button = event.target;
    let currentText = button.textContent;
    let newText = currentText;

    // Ensure the new text is different from the current text
    while (newText === currentText) {
        newText = btnTexts[Math.floor(Math.random() * btnTexts.length)];
    }
    button.textContent = newText;
}

// Add event listener to the input element
document.getElementById('startCrazySpin').addEventListener('click', (btnEvent) => {
  const btn = btnEvent.target

  introAudio.play();

  btn.textContent = "Wait what is happening??"
  btn.disabled = true;
  btn.classList.remove("text-yellow-400", "border-yellow-400", "hover:bg-yellow-500");
  btn.classList.add("text-orange-400", "border-orange-400", "hover:bg-orange-500");

  // Flash images with the kicks in the intro song
  const flashTimings = [0, 450, 900, 1350]; // Adjust timings as needed
  flashTimings.forEach(time => {
    setTimeout(flashImages, time);
  });

  introAudio.addEventListener('ended', () => {
      loopAudio.play();
      btn.textContent = "WHAT HAVE YOU DONE??";
      btn.classList.remove("text-yellow-400", "border-yellow-400", "hover:bg-yellow-500");
      btn.classList.add("text-red-400", "border-red-400", "hover:bg-red-500");
      btn.addEventListener("pointerdown", changeButtonText);
      crazySpin();
  });

  loopAudio.addEventListener('play', () => {
    stopPeriodicFlashing(); // Stop any existing interval to avoid multiple intervals
    startPeriodicFlashing(); // Start periodic flashing
  });

  loopAudio.addEventListener('pause', stopPeriodicFlashing); // Stop flashing when paused
  loopAudio.addEventListener('ended', stopPeriodicFlashing); // Stop flashing when ended

  loopAudio.addEventListener('timeupdate', function() {
    var buffer = 0.3;
    if (this.currentTime > this.duration - buffer) {
      this.currentTime = 0;
      stopPeriodicFlashing(); // Stop any existing interval to avoid multiple intervals
      startPeriodicFlashing(); // Start periodic flashing
      this.play();
    }
  });

});

document.querySelectorAll('.toggle-content-link').forEach(link => {
  link.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('data-content-target'));
    const currentlyVisible = document.querySelector('#disclaimer:not(.hidden), #info:not(.hidden), #settings:not(.hidden)');

    // If the target is currently visible, do nothing
    if (currentlyVisible === target) {
      return;
    }

    // Hide the currently visible div
    if (currentlyVisible) {
      currentlyVisible.classList.add('hidden');
      setTimeout(() => {
        currentlyVisible.classList.add('animate-slide-up');
        currentlyVisible.classList.remove('animate-slide-down');
      }, 250); // Add a slight delay to match the duration of the slide-up animation
    }

    // Remove active class from all links
    document.querySelectorAll('.toggle-content-link').forEach(link => {
      link.classList.remove('active');
    });

    // Show the new target div
    if (target) {
      target.classList.remove('hidden');
      target.classList.add('animate-slide-down');
      target.classList.remove('animate-slide-up');

      // Add active class to the clicked link
      this.classList.add('active');
    }
  });
});

document.querySelector("[data-content-target='#main-box']").addEventListener('click', function(e) {
  e.preventDefault();
  const target = document.querySelector(this.getAttribute('data-content-target'));
  const currentlyVisible = document.querySelector('#main-box:not(.hidden)');
  const svgClosed = this.querySelector('#eye-closed');
  const svgOpened = this.querySelector('#eye-opened');

  // Hide the currently visible div
  if (currentlyVisible) {
    currentlyVisible.classList.add('animate-slide-up');
    currentlyVisible.classList.remove('animate-slide-down');
    svgClosed.classList.add('animate-fade-out');
    svgClosed.classList.remove('animate-fade-in');
    svgOpened.classList.add('animate-fade-in');
    svgOpened.classList.remove('animate-fade-out');
    setTimeout(() => {
      currentlyVisible.classList.add('hidden');
      svgClosed.classList.add('hidden');
      svgOpened.classList.remove('hidden');
    }, 250); // Add a slight delay to match the duration of the slide-up animation
  } else {
    target.classList.remove('hidden');
    target.classList.add('animate-slide-down');
    target.classList.remove('animate-slide-up');

    svgOpened.classList.add('animate-fade-out');
    svgOpened.classList.remove('animate-fade-in');
    svgClosed.classList.add('animate-fade-in');
    svgClosed.classList.remove('animate-fade-out');
    setTimeout(() => {
      svgOpened.classList.add('hidden');
      svgClosed.classList.remove('hidden');
    }, 250); // Add a slight delay to match the duration of the slide-up animation
  }
});

document.addEventListener('DOMContentLoaded', function() {
  const radioButtons = document.querySelectorAll('input[name="color"]');

  radioButtons.forEach(function(radioButton) {
    radioButton.addEventListener('change', function() {
      if (this.checked) {
        const color = this.value;
        const form = this.closest('form');
        updateUserColor(form, color); // Call function to make AJAX request
        updateColor(color); // Call function to update color classes
      }
    });
  });

  function updateUserColor(form, color) {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', form.getAttribute('action'), true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
    xhr.setRequestHeader('X-CSRF-Token', csrfToken); // Include CSRF token
    xhr.onerror = function() {
      console.error('Color change failed.');
    };
    xhr.send(JSON.stringify({ user: {color: color} }));
  }

  function updateColor(color) {
    const circles = document.querySelectorAll('.color-choice');
    circles.forEach(function(circle) {
      circle.classList.remove('border-2', 'border-yellow-400', 'ring-2', 'ring-yellow-400');
      if (circle.classList.contains(`color-${color}`)) {
        circle.classList.add('border-2', 'border-yellow-400', 'ring-2', 'ring-yellow-400');
      }
    });

    const currentUserStar = stars.find(star => star.isCurrentUser === true);

    if (currentUserStar) {
      currentUserStar.color = color;
      currentUserStar.flashColor = color;
    }
  }
});

