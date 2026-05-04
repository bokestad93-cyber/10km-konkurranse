const teamNames = {
  team1: "Team Lotre",
  team2: "Team Hystad",
  team3: "Team Bøkestad",
};

function addRunner(teamId) {
  const container = document.getElementById(teamId);

  const div = document.createElement("div");
  div.className = "runner";

  div.innerHTML = `
    <input placeholder="Navn" class="name" />
    <input placeholder="mm:ss" class="time" inputmode="numeric" maxlength="5" oninput="formatTime(this)" />
    <button class="remove-btn" onclick="removeRunner(this)">X</button>
  `;

  container.appendChild(div);
  div.querySelector(".name").focus();
}

function formatTime(input) {
  let value = input.value.replace(/\D/g, "");
  if (value.length > 4) value = value.slice(0, 4);

  if (value.length >= 3) {
    input.value = value.slice(0, 2) + ":" + value.slice(2);
  } else {
    input.value = value;
  }
}

function removeRunner(btn) {
  btn.parentElement.remove();
}

function timeToSeconds(timeStr) {
  const parts = timeStr.split(":");
  if (parts.length !== 2) return NaN;

  const min = parseInt(parts[0]);
  const sec = parseInt(parts[1]);

  if (isNaN(min) || isNaN(sec)) return NaN;

  return min * 60 + sec;
}

function secondsToTime(sec) {
  const min = Math.floor(sec / 60);
  const s = sec % 60;
  return `${min}:${s.toString().padStart(2, "0")}`;
}

function getTeamData(teamId) {
  const rows = document.getElementById(teamId).querySelectorAll(".runner");

  let team = [];

  rows.forEach((row) => {
    const name = row.querySelector(".name").value;
    const time = row.querySelector(".time").value;

    const seconds = timeToSeconds(time);

    if (name && !isNaN(seconds)) {
      team.push({ name, seconds });
    }
  });

  return team;
}

function getAverage(team) {
  if (team.length === 0) return NaN;

  let sum = 0;
  team.forEach((r) => (sum += r.seconds));

  return sum / team.length;
}

function displayTeam(team, elementId) {
  const container = document.getElementById(elementId);
  container.innerHTML = "";

  team.forEach((runner, index) => {
    const div = document.createElement("div");

    div.innerText = `${index + 1}. ${runner.name} - ${secondsToTime(runner.seconds)}`;

    if (index === 0) {
      div.style.fontWeight = "bold";
      div.style.color = "green";
    }

    container.appendChild(div);
  });
}

function calculate() {
  const team1 = getTeamData("team1");
  const team2 = getTeamData("team2");
  const team3 = getTeamData("team3");

  team1.sort((a, b) => a.seconds - b.seconds);
  team2.sort((a, b) => a.seconds - b.seconds);
  team3.sort((a, b) => a.seconds - b.seconds);

  displayTeam(team1, "team1Results");
  displayTeam(team2, "team2Results");
  displayTeam(team3, "team3Results");

  const avg1 = getAverage(team1);
  const avg2 = getAverage(team2);
  const avg3 = getAverage(team3);

  if (isNaN(avg1) || isNaN(avg2) || isNaN(avg3)) {
    alert("Alle lag må ha minst én gyldig løper");
    return;
  }

  document.getElementById("team1Avg").innerText =
    `Snitt: ${secondsToTime(Math.round(avg1))}`;
  document.getElementById("team2Avg").innerText =
    `Snitt: ${secondsToTime(Math.round(avg2))}`;
  document.getElementById("team3Avg").innerText =
    `Snitt: ${secondsToTime(Math.round(avg3))}`;

  const lowest = Math.min(avg1, avg2, avg3);

  let winners = [];

  if (avg1 === lowest) winners.push(teamNames.team1);
  if (avg2 === lowest) winners.push(teamNames.team2);
  if (avg3 === lowest) winners.push(teamNames.team3);

  document
    .querySelectorAll(".team")
    .forEach((t) => t.classList.remove("winner-team"));

  if (avg1 === lowest)
    document.getElementById("team1Box").classList.add("winner-team");
  if (avg2 === lowest)
    document.getElementById("team2Box").classList.add("winner-team");
  if (avg3 === lowest)
    document.getElementById("team3Box").classList.add("winner-team");

  if (winners.length === 1) {
    document.getElementById("winner").innerText = `🏆 Vinner: ${winners[0]}`;
  } else {
    document.getElementById("winner").innerText =
      `🤝 Uavgjort: ${winners.join(" & ")}`;
  }

  const allRunners = [
    ...team1.map((r) => ({ ...r })),
    ...team2.map((r) => ({ ...r })),
    ...team3.map((r) => ({ ...r })),
  ];

  allRunners.sort((a, b) => a.seconds - b.seconds);

  const leaderboard = document.getElementById("leaderboard");
  leaderboard.innerHTML = "<h3>🏅 Samlet oversikt</h3>";

  allRunners.forEach((runner, index) => {
    let medal = "";
    if (index === 0) medal = "🥇";
    else if (index === 1) medal = "🥈";
    else if (index === 2) medal = "🥉";

    const div = document.createElement("div");

    div.innerText = `${medal} ${runner.name} - ${secondsToTime(runner.seconds)}`;

    if (index === 0) {
      div.style.fontWeight = "bold";
      div.style.color = "green";
    }

    leaderboard.appendChild(div);
  });

  // ✅ riktig plassering
  const winnerEl = document.getElementById("winner");
  winnerEl.classList.remove("animate");
  void winnerEl.offsetWidth;
  winnerEl.classList.add("animate");

  launchConfetti();
}

function launchConfetti() {
  const canvas = document.getElementById("confettiCanvas");
  const ctx = canvas.getContext("2d");

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  let particles = [];

  for (let i = 0; i < 200; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      size: Math.random() * 8 + 3,
      speed: Math.random() * 2 + 1,
      color: `hsl(${Math.random() * 360}, 100%, 50%)`,
    });
  }

  function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach((p) => {
      p.y += p.speed;

      if (p.y > canvas.height) {
        p.y = -10;
        p.x = Math.random() * canvas.width;
      }

      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size);
    });

    requestAnimationFrame(update);
  }

  update();

  setTimeout(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles = [];
  }, 20000);
}
