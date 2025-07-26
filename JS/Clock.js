const alarmAudio = document.getElementById("alarmAudio");
const customAlertModal = document.getElementById("customAlertModal");
const customAlertMessage = document.getElementById("customAlertMessage");
const audioControls = document.getElementById("audioControls");
let customAlertCallback = null;
let activeContentId = 'timer'; // To keep track of the currently active content

function showAlert(message, callback = null) {
    customAlertMessage.innerText = message;
    customAlertCallback = callback;
    customAlertModal.style.display = 'flex';
}

function hideCustomAlert() {
    customAlertModal.style.display = 'none';
    if (customAlertCallback) {
        customAlertCallback();
        customAlertCallback = null;
    }
}

function enterApp() {
    document.getElementById('welcome-page').style.display = 'none';
    const mainAppContainer = document.getElementById('main-app-container');
    mainAppContainer.classList.add('visible');
    showContent('timer');
}

// Section change with fade effect
function showContent(id) {
    const currentActiveContent = document.querySelector(".content.active");
    if (currentActiveContent) {
        currentActiveContent.style.opacity = '0';
        currentActiveContent.style.pointerEvents = 'none';
        setTimeout(() => {
            currentActiveContent.classList.remove("active");
            const nextContent = document.getElementById(id);
            nextContent.classList.add("active");
            nextContent.style.opacity = '1';
            nextContent.style.pointerEvents = 'all';
        }, 500);
    } else {
        const nextContent = document.getElementById(id);
        nextContent.classList.add("active");
        nextContent.style.opacity = '1';
        nextContent.style.pointerEvents = 'all';
    }

    stopTimer();
    stopStopwatch();
    alarmAudio.pause();
    alarmAudio.currentTime = 0;
    audioControls.style.display = 'none';
    activeContentId = id; // Update active content ID
}


// Dark/Light Mode Toggle
function toggleTheme() {
    document.body.classList.toggle('light-mode');
    const themeToggleIcon = document.getElementById('theme-toggle').querySelector('i');
    if (document.body.classList.contains('light-mode')) {
        themeToggleIcon.classList.remove('fa-moon');
        themeToggleIcon.classList.add('fa-sun');
    } else {
        themeToggleIcon.classList.remove('fa-sun');
        themeToggleIcon.classList.add('fa-moon');
    }
}


const circle = document.querySelector(".circle");
const circleRadius = 100;
const circleLength = 2 * Math.PI * circleRadius;
circle.style.strokeDasharray = circleLength;
circle.style.strokeDashoffset = circleLength;

let timerInterval;
let originalSeconds;
let timerSeconds;
let isTimerPaused = false;

function updateCircle(progress) {
    circle.style.strokeDashoffset = circleLength * (1 - progress);
}

function updateTimerDisplay(seconds) {
    const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
    const secs = String(seconds % 60).padStart(2, '0');
    document.getElementById("timerDisplay").innerText = `${mins}:${secs}`;
}

function startTimer() {
    if (timerInterval && !isTimerPaused) return;

    if (!isTimerPaused) {
        timerSeconds = parseInt(document.getElementById("timerInput").value);
        if (isNaN(timerSeconds) || timerSeconds <= 0) {
            showAlert("Please enter a valid number of seconds for the timer.");
            return;
        }
        originalSeconds = timerSeconds;
        updateCircle(1);
    }
    isTimerPaused = false;

    updateTimerDisplay(timerSeconds);

    timerInterval = setInterval(() => {
        timerSeconds--;
        updateTimerDisplay(timerSeconds);
        updateCircle(timerSeconds / originalSeconds);

        if (timerSeconds <= 0) {
            clearInterval(timerInterval);
            timerInterval = null;
            updateCircle(0);
            alarmAudio.play();
            showAlert("⏰ Time's up!", () => {
                alarmAudio.pause();
                alarmAudio.currentTime = 0;
            });
            document.getElementById("timerInput").value = "";
        }
    }, 1000);
}

function pauseTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
    isTimerPaused = true;
}

function stopTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
    isTimerPaused = false;
}

function resetTimer() {
    stopTimer();
    document.getElementById("timerInput").value = "";
    document.getElementById("timerDisplay").innerText = "00:00";
    updateCircle(0);
    timerSeconds = 0;
    originalSeconds = 0;
    alarmAudio.pause();
    alarmAudio.currentTime = 0;
}

let stopwatchInterval;
let swSeconds = 0;
let lapCounter = 0;
const lapList = document.getElementById("lapList");

function formatTime(totalSeconds) {
    const hrs = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    const mins = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    const secs = String(totalSeconds % 60).padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
}

function startStopwatch() {
    if (stopwatchInterval) return;
    stopwatchInterval = setInterval(() => {
        swSeconds++;
        document.getElementById("stopwatchDisplay").innerText = formatTime(swSeconds);
    }, 1000);
}

function stopStopwatch() {
    clearInterval(stopwatchInterval);
    stopwatchInterval = null;
}

function resetStopwatch() {
    stopStopwatch();
    swSeconds = 0;
    lapCounter = 0;
    document.getElementById("stopwatchDisplay").innerText = "00:00:00";
    lapList.innerHTML = "";
}

function lapStopwatch() {
    if (!stopwatchInterval) {
        showAlert("Stopwatch is not running.");
        return;
    }
    lapCounter++;
    const li = document.createElement("li");
    li.innerText = `Lap ${lapCounter}: ${formatTime(swSeconds)}`;
    lapList.prepend(li);
}

const customTimes = {};

function updateGlobalTime() {
    const now = new Date();
    document.getElementById("pakTime").innerText = "🇵🇰 Pakistan: " + now.toLocaleTimeString('en-PK', { timeZone: 'Asia/Karachi' });
    document.getElementById("nyTime").innerText = "🇺🇸 New York: " + now.toLocaleTimeString('en-US', { timeZone: 'America/New_York' });
    document.getElementById("ldnTime").innerText = "🇬🇧 London: " + now.toLocaleTimeString('en-GB', { timeZone: 'Europe/London' });

    for (const id in customTimes) {
        const region = customTimes[id].region;
        try {
            const time = now.toLocaleTimeString('en-US', { timeZone: region });
            document.getElementById(id).innerText = `${region}: ${time}`;
        } catch (e) {
            console.error(`Error updating time for region ${region}:`, e);
            document.getElementById(id).innerText = `${region}: Error`;
        }
    }
}

function addCustomTime() {
    const regionInput = document.getElementById("customRegion");
    const region = regionInput.value.trim();
    regionInput.value = "";

    if (!region) {
        showAlert("Please enter a region (e.g., America/Los_Angeles).");
        return;
    }

    try {
        new Date().toLocaleTimeString('en-US', { timeZone: region });
    } catch (e) {
        showAlert(`Invalid timezone identifier: "${region}". Please use a valid IANA timezone name (e.g., Asia/Tokyo, Europe/Berlin).`);
        return;
    }

    for (const key in customTimes) {
        if (customTimes[key].region.toLowerCase() === region.toLowerCase()) {
            showAlert(`Time for ${region} is already added!`);
            return;
        }
    }

    const div = document.createElement("div");
    div.className = "time-display";
    const id = `region-${Date.now()}`;
    div.id = id;
    document.getElementById("allGlobalTimes").appendChild(div);

    customTimes[id] = { region: region };

    updateGlobalTime();
}

setInterval(updateGlobalTime, 1000);
updateGlobalTime();

let alarms = [];
const alarmStatus = document.getElementById("alarmStatus");
const alarmList = document.getElementById("alarmList");

// Audio Controls
function playAlarm() {
    alarmAudio.play();
}

function pauseAlarm() {
    alarmAudio.pause();
}

function stopAlarm() {
    alarmAudio.pause();
    alarmAudio.currentTime = 0;
}

function setVolume(volume) {
    alarmAudio.volume = volume;
}

function setAlarm() {
    const alarmInput = document.getElementById("alarmTime").value;
    if (!alarmInput) {
        showAlert("Please select a time for the alarm.");
        return;
    }

    const [h, m] = alarmInput.split(":").map(Number);
    const now = new Date();
    let alarmTime = new Date();
    alarmTime.setHours(h, m, 0, 0);

    if (alarmTime <= now) {
        alarmTime.setDate(alarmTime.getDate() + 1);
    }

    const timeUntilAlarm = alarmTime.getTime() - now.getTime();

    const timeoutId = setTimeout(() => {
        if (activeContentId === 'alarm') { // Only play if alarm tab is active
            alarmAudio.play();
            audioControls.style.display = 'flex'; // Show audio controls when alarm rings
            showAlert(`⏰ Alarm ringing! It's ${alarmInput}`, () => {
                alarmAudio.pause();
                alarmAudio.currentTime = 0;
                audioControls.style.display = 'none'; // Hide audio controls after acknowledgement
            });
        } else {
            // If not on alarm tab, just set an alert that disappears after a few seconds
            showAlert(`⏰ Alarm for ${alarmInput} is ringing!`);
            alarmAudio.play();
            audioControls.style.display = 'flex';
            setTimeout(() => {
                hideCustomAlert();
                alarmAudio.pause();
                alarmAudio.currentTime = 0;
                audioControls.style.display = 'none';
            }, 5000); // Alert disappears after 5 seconds
        }

        alarms = alarms.filter(a => a.timeoutId !== timeoutId);
        updateAlarmList();
    }, timeUntilAlarm);

    alarms.push({ time: alarmInput, timeoutId: timeoutId, displayTime: alarmTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) });
    updateAlarmList();
    alarmStatus.innerText = `Alarm set for ${alarmTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`;
    document.getElementById("alarmTime").value = "";
}

function updateAlarmList() {
    alarmList.innerHTML = "";
    if (alarms.length === 0) {
        alarmStatus.innerText = "No alarm set.";
        return;
    }

    alarmStatus.innerText = "Active Alarms:";
    alarms.sort((a, b) => {
        const [hA, mA] = a.time.split(":").map(Number);
        const dateA = new Date();
        dateA.setHours(hA, mA, 0, 0);
        if (dateA <= new Date()) dateA.setDate(dateA.getDate() + 1);

        const [hB, mB] = b.time.split(":").map(Number);
        const dateB = new Date();
        dateB.setHours(hB, mB, 0, 0);
        if (dateB <= new Date()) dateB.setDate(dateB.getDate() + 1);

        return dateA - dateB;
    });

    alarms.forEach((a) => {
        const li = document.createElement("li");
        li.innerHTML = `Alarm at <strong>${a.displayTime}</strong>`;
        const btn = document.createElement("button");
        btn.innerText = "Delete";
        btn.onclick = () => {
            clearTimeout(a.timeoutId);
            alarms = alarms.filter(alarm => alarm.timeoutId !== a.timeoutId);
            updateAlarmList();
        };
        li.appendChild(btn);
        alarmList.appendChild(li);
    });
}