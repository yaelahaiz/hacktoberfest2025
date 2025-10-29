/**
 * Reusable Countdown Timer
 * -----------------------------------------
 * Function: startCountdown(targetDate)
 * Usage: Call startCountdown("YYYY-MM-DDTHH:mm:ss")
 * Example: startCountdown("2025-12-31T23:59:59")
 *
 * Make sure your HTML contains elements with IDs:
 *   #days, #hours, #minutes, #seconds
 */

function startCountdown(targetDate) {
  const endDate = new Date(targetDate).getTime();

  const daysEl = document.getElementById("days");
  const hoursEl = document.getElementById("hours");
  const minutesEl = document.getElementById("minutes");
  const secondsEl = document.getElementById("seconds");

  if (!daysEl || !hoursEl || !minutesEl || !secondsEl) {
    console.error("Countdown timer elements not found!");
    return;
  }

  function updateTimer() {
    const now = new Date().getTime();
    const distance = endDate - now;

    if (distance < 0) {
      clearInterval(interval);
      document.getElementById("timer").innerHTML = "<h2>🎉 Time's up! 🎉</h2>";
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    daysEl.textContent = String(days).padStart(2, "0");
    hoursEl.textContent = String(hours).padStart(2, "0");
    minutesEl.textContent = String(minutes).padStart(2, "0");
    secondsEl.textContent = String(seconds).padStart(2, "0");
  }

  updateTimer();
  const interval = setInterval(updateTimer, 1000);
}
