class SessionService {
    private totalActiveTime: number = parseInt(localStorage.getItem('cognia_total_active_seconds') || '0', 10);
    private deviceTotalSeconds: number = 0;
    private lastUpdate: number = Date.now();

    constructor() {
        if (typeof window !== 'undefined') {
            this.initListeners();
            this.startTicker();
        }
    }

    private initListeners() {
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pause();
            } else {
                this.resume();
            }
        });
    }

    private pause() {
        this.updateTotal();
    }

    private resume() {
        this.lastUpdate = Date.now();
    }

    private updateTotal() {
        const now = Date.now();
        const delta = Math.floor((now - this.lastUpdate) / 1000);
        if (delta > 0) {
            this.totalActiveTime += delta;
            localStorage.setItem('cognia_total_active_seconds', this.totalActiveTime.toString());
            this.lastUpdate = now;
        }
    }

    private async fetchDeviceStats() {
        try {
            const res = await fetch('http://localhost:8080/stats');
            if (res.ok) {
                const data = await res.json();
                this.deviceTotalSeconds = data.total_seconds;
            }
        } catch (e) {
            // Bridge might not be running, fail silently
        }
    }

    private startTicker() {
        setInterval(() => {
            if (!document.hidden) {
                this.updateTotal();
            }
            this.fetchDeviceStats();
        }, 5000); // Sync every 5 seconds
    }

    getDeviceTotalSeconds(): number {
        return this.deviceTotalSeconds;
    }

    formatSeconds(total: number): string {
        const hours = Math.floor(total / 3600);
        const minutes = Math.floor((total % 3600) / 60);
        const seconds = total % 60;

        if (hours > 0) return `${hours}h ${minutes}m`;
        if (minutes > 0) return `${minutes}m ${seconds}s`;
        return `${seconds}s`;
    }

    getFormattedTime(): string {
        return this.formatSeconds(this.getDailyTotalSeconds());
    }

    getFormattedDeviceTime(): string {
        return this.formatSeconds(this.deviceTotalSeconds);
    }

    getDailyTotalSeconds(): number {
        this.updateTotal();
        return this.totalActiveTime;
    }

    resetDaily() {
        const lastReset = localStorage.getItem('cognia_last_reset');
        const today = new Date().toDateString();

        if (lastReset !== today) {
            this.totalActiveTime = 0;
            localStorage.setItem('cognia_total_active_seconds', '0');
            localStorage.setItem('cognia_last_reset', today);
        }
    }
}

export const sessionService = new SessionService();
