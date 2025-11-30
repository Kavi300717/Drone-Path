let map, path = [], markers = [], polyline, droneMarker, simInterval, simIndex = 0, isDark = true;

function initMap() {
    map = L.map('map', {
        zoomControl: false,
        attributionControl: false,
    }).setView([19.0760, 72.8777], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
    }).addTo(map);
    map.on('click', onMapClick);
    polyline = L.polyline([], { color: '#ff4bcd', weight: 4, dashArray: '10 10' }).addTo(map)
}

function onMapClick(e) {
    const marker = L.marker(e.latlng, { icon: waypointIcon() }).addTo(map);
    markers.push(marker);
    path.push([e.latlng.lat, e.latlng.lng]);
    polyline.setLatLngs(path);
    updateStates();

    setTimeout(() => {
        const pathE1 = document.querySelector('.leaflet-interactive');
        if (pathE1) {
            pathE1.style.strokeDasharray = '1000';
            pathE1.style.strokeDashoffset = '1000';
            pathE1.style.animation = 'path-draw 1.2s cubic-bezier(.6, 1.5, .6, 1) forwards';
        }
    }, 50);
}

function waypointIcon() {
    return L.divIcon({
        className: 'waypoint-icon',
        html: '<div class="waypoint-dot"></div>',
        iconSize: [18, 18],
        iconAnchor: [9, 9]
    });
}

function droneIcon() {
    return L.divIcon({
        className: 'drone-icon',
        html: '<div class="drone-emoji"></div>',
        iconSize: [36, 36],
        iconAnchor: [18, 18]
    })
}

function startSimulation() {
    if (path.length < 2) return;
    if (droneMarker) map.removeLayer(droneMarker);
    simIndex = 0;
    droneMarker = L.marker(path[0], { icon: droneIcon() }).addTo(map);
    setTimeout(() => {
        droneMarker.getElement().classList.remove('landing');
    }, 700);
    simInterval = setInterval(moveDrone, 50);
}

function moveDrone() {
    simIndex++;
    if (simIndex >= path.length) {
        clearInterval(simInterval);
        if (droneMarker && droneMarker.getElement()) {
            droneMarker.getElement().classList.add('landing');
            setTimeout(() => map.removeLayer(droneMarker), 700)
        }
        return;
    }
    droneMarker.setLatLng(path[simIndex])
}

function exportJSON() {
    const data = { path };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dronepath.json';
    a.click();
    URL.revokeObjectURL(url);
}

function clearPath() {
    path = [];
    markers.forEach(m => map.removeLayer(m));
    markers = [];
    polyline.setLatLngs([]);
    if (droneMarker) map.removeLayer(droneMarker);
    updateStates();
}

function updateStates() {
    let dist = 0;
    for (let i = 1; i < path.length; i++) {
        dist += map.distance(path[i - 1], path[i]);
    }
    document.getElementById('distance').textContent = `Distance: ${dist.toFixed(1)} m`;
    document.getElementById('eta').textContent = `ETA: ${(dist / 10).toFixed(1)}s`;
    document.getElementById('altitude').textContent = `Altitude: 30 m`;
}

function toggleTheme() {
    isDark = !isDark;
    document.body.classList.toggle('dark', isDark);
    document.body.classList.toggle('light', !isDark);
    document.getElementById('toggle-theme').textContent = isDark ? '🌙' : '🌞';
}

document.addEventListener('DOMContentLoaded', () => {
    initMap();
    document.getElementById('start-sim').onclick = startSimulation;
    document.getElementById('export-json').onclick = exportJSON;
    document.getElementById('clear-path').onclick = clearPath;
    document.getElementById('toggle-theme').onclick = toggleTheme;
});

