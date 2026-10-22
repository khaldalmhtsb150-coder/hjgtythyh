async function fetchStats() {
    try {
        const response = await fetch('/api/stats');
        const data = await response.json();
        
        if (data.error) {
            console.error('Bot not ready:', data.error);
            return;
        }

        document.getElementById('botName').textContent = data.botName;
        document.getElementById('botAvatar').src = data.botAvatar;
        document.getElementById('serverCount').textContent = data.serverCount.toLocaleString();
        document.getElementById('userCount').textContent = data.userCount.toLocaleString();
        document.getElementById('commandCount').textContent = data.commandCount;
        document.getElementById('ping').textContent = `${data.ping}ms`;
        document.getElementById('uptime').textContent = data.uptime;
        document.getElementById('lastUpdate').textContent = new Date().toLocaleTimeString();
    } catch (error) {
        console.error('Error fetching stats:', error);
    }
}

async function fetchServers() {
    try {
        const response = await fetch('/api/servers');
        const servers = await response.json();
        
        if (servers.error) {
            console.error('Bot not ready:', servers.error);
            return;
        }

        const serversList = document.getElementById('serversList');
        const serverBadge = document.getElementById('serverBadge');
        
        serverBadge.textContent = servers.length;

        if (servers.length === 0) {
            serversList.innerHTML = '<div class="empty-state">No servers yet</div>';
            return;
        }

        serversList.innerHTML = servers.map(server => `
            <div class="list-item">
                <div class="list-item-header">
                    <img src="${server.icon}" alt="${server.name}" class="server-icon">
                    <div class="list-item-title">${escapeHtml(server.name)}</div>
                </div>
                <div class="list-item-info">
                    <span>👥 ${server.memberCount.toLocaleString()} members</span>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error fetching servers:', error);
        document.getElementById('serversList').innerHTML = '<div class="empty-state">Error loading servers</div>';
    }
}

async function fetchGiveaways() {
    try {
        const response = await fetch('/api/giveaways');
        const giveaways = await response.json();
        
        const giveawaysList = document.getElementById('giveawaysList');
        const giveawayBadge = document.getElementById('giveawayBadge');
        
        giveawayBadge.textContent = giveaways.length;

        if (giveaways.length === 0) {
            giveawaysList.innerHTML = '<div class="empty-state">No active giveaways</div>';
            return;
        }

        giveawaysList.innerHTML = giveaways.map(giveaway => {
            const endDate = new Date(giveaway.endTime);
            const timeLeft = getTimeLeft(giveaway.endTime);
            
            return `
                <div class="list-item giveaway-item">
                    <div class="giveaway-prize">🎉 ${escapeHtml(giveaway.prize)}</div>
                    <div class="giveaway-info">
                        <span>🏆 ${giveaway.winnersCount} winner${giveaway.winnersCount > 1 ? 's' : ''}</span>
                        <span>⏰ Ends ${timeLeft}</span>
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Error fetching giveaways:', error);
        document.getElementById('giveawaysList').innerHTML = '<div class="empty-state">Error loading giveaways</div>';
    }
}

function getTimeLeft(endTime) {
    const now = Date.now();
    const diff = endTime - now;
    
    if (diff <= 0) return 'soon';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `in ${days}d ${hours}h`;
    if (hours > 0) return `in ${hours}h ${minutes}m`;
    return `in ${minutes}m`;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function updateAll() {
    fetchStats();
    fetchServers();
    fetchGiveaways();
}

updateAll();
setInterval(updateAll, 5000);
