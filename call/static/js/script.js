document.addEventListener("DOMContentLoaded", () => {
    fetchData();
});

async function fetchData() {
    try {
        const response = await fetch('/api/analyze');
        const data = await response.json();

        updateUI(data);
    } catch (error) {
        console.error("Error fetching data:", error);
        document.getElementById("status-heading").innerText = "Error";
        document.getElementById("status-reason").innerText = "Could not connect to analysis engine.";
    }
}

function updateUI(data) {
    // 1. Status Section
    const statusCard = document.getElementById("status-card");
    const statusIcon = document.getElementById("status-icon");
    const statusHeading = document.getElementById("status-heading");
    const statusReason = document.getElementById("status-reason");

    statusHeading.innerText = data.status;
    statusReason.innerText = data.reason;

    // Determine Color Theme based on status text
    statusCard.classList.remove("loading", "status-good", "status-warn", "status-bad");

    if (data.status.includes("Normal")) {
        statusCard.classList.add("status-good");
        statusIcon.innerText = "✓";
    } else if (data.status.includes("Slightly")) {
        statusCard.classList.add("status-warn");
        statusIcon.innerText = "!";
    } else {
        statusCard.classList.add("status-bad");
        statusIcon.innerText = "⚠";
    }

    // 2. Suggestion Banner
    if (data.suggestion) {
        const box = document.getElementById("suggestion-box");
        const text = document.getElementById("suggestion-text");
        text.innerText = data.suggestion;
        box.classList.remove("hidden");
    }

    // 3. Metrics
    document.getElementById("val-freq").innerText = data.metrics.calls_per_day;
    document.getElementById("trend-freq").innerText = `vs Baseline: ${data.comparison.baseline_freq}`;

    document.getElementById("val-dur").innerText = data.metrics.avg_duration;
    document.getElementById("trend-dur").innerText = `vs Baseline: ${data.comparison.baseline_dur}`;

    document.getElementById("val-contact").innerText = data.metrics.most_contacted;

    // 4. Chart (Time Distribution)
    renderChart(data.time_distribution);

    // 5. Recent Logs
    renderLogs(data.recent_logs);
}

function renderChart(dist) {
    const ctx = document.getElementById('timeChart').getContext('2d');

    // Convert object {Morning: X, ...} to arrays
    const labels = Object.keys(dist);
    const values = Object.values(dist);

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Calls',
                data: values,
                backgroundColor: [
                    'rgba(251, 191, 36, 0.7)', // Morning (Amber)
                    'rgba(56, 189, 248, 0.7)', // Afternoon (Blue)
                    'rgba(139, 92, 246, 0.7)'  // Night (Purple)
                ],
                borderColor: [
                    'rgba(251, 191, 36, 1)',
                    'rgba(56, 189, 248, 1)',
                    'rgba(139, 92, 246, 1)'
                ],
                borderWidth: 1,
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { color: '#94a3b8' }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#94a3b8' }
                }
            }
        }
    });
}

function renderLogs(logs) {
    const list = document.getElementById("log-list");
    list.innerHTML = "";

    logs.forEach(log => {
        const li = document.createElement("li");
        li.className = "log-item";

        li.innerHTML = `
            <div class="log-info">
                <span class="log-name">${log.name}</span>
                <span class="log-meta">${log.type} • ${log.date}</span>
            </div>
            <div class="log-duration">${formatDuration(log.duration)}</div>
        `;
        list.appendChild(li);
    });
}

function formatDuration(sec) {
    if (sec < 60) return `${sec}s`;
    const min = Math.floor(sec / 60);
    return `${min}m ${sec % 60}s`;
}
