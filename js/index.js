document.addEventListener('DOMContentLoaded', () => {

    // --- Navigation Logic ---
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.app-section');

    function switchSection(sectionId) {
        sections.forEach(s => s.classList.add('hidden'));
        const target = document.getElementById(sectionId);
        if (target) target.classList.remove('hidden');

        navLinks.forEach(link => {
            const isActive = link.dataset.section === sectionId;
            const icon = link.querySelector('i');
            
            if (isActive) {
                link.classList.remove('text-slate-300', 'hover:bg-slate-800');
                link.classList.add('bg-blue-500/10', 'text-blue-400');
                if (icon) icon.classList.add('text-blue-400');
            } else {
                link.classList.add('text-slate-300', 'hover:bg-slate-800');
                link.classList.remove('bg-blue-500/10', 'text-blue-400');
                if (icon) icon.classList.remove('text-blue-400');
            }
        });
    }

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            switchSection(link.dataset.section);
        });
    });


    // --- APOD (NASA Image of the Day) ---
    const apod = {
        img: document.getElementById('apod-image'),
        title: document.getElementById('apod-title'),
        desc: document.getElementById('apod-explanation'),
        dateLabel: document.getElementById('apod-date'),
        dateDetail: document.getElementById('apod-date-detail'),
        dateInput: document.getElementById('apod-date-input'),
        loading: document.getElementById('apod-loading'),
        copyright: document.getElementById('apod-copyright')
    };

    if (apod.dateInput) {
        apod.dateInput.max = new Date().toISOString().split('T')[0];
    }

    async function fetchAPOD(date = '') {
        try {
            if (apod.loading) apod.loading.classList.remove('hidden');
            if (apod.img) apod.img.classList.add('hidden');

            const apiKey = 'U0PqJ5UprbVQExkXc7ZgsGVfIM7Z1O8Uiv7g2hOO';
            const url = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}${date ? `&date=${date}` : ''}`;
            
            const res = await fetch(url);
            if (!res.ok) throw new Error('FETCH_ERROR');
            
            const data = await res.json();

            if (apod.img) {
                apod.img.src = data.media_type === 'video' ? (data.thumbnail_url || './images/placeholder.webp') : data.url;
                apod.img.onload = () => {
                    apod.loading?.classList.add('hidden');
                    apod.img.classList.remove('hidden');
                };
            }

            if (apod.title) apod.title.textContent = data.title;
            if (apod.desc) apod.desc.textContent = data.explanation;
            if (apod.dateLabel) apod.dateLabel.textContent = `APOD - ${data.date}`;
            if (apod.dateInput) apod.dateInput.value = data.date;
            if (apod.copyright) apod.copyright.textContent = data.copyright ? `© ${data.copyright}` : '';

            // Additional details
            const detail = document.getElementById('apod-date-detail');
            const info = document.getElementById('apod-date-info');
            const media = document.getElementById('apod-media-type');
            
            if(detail) detail.innerHTML = `<i class="far fa-calendar mr-2"></i>${data.date}`;
            if(info) info.textContent = data.date;
            if(media) media.textContent = data.media_type;

        } catch (err) {
            console.error(err);
            if (apod.loading) apod.loading.classList.add('hidden');
            if (apod.img) {
                apod.img.src = './images/placeholder.webp';
                apod.img.classList.remove('hidden');
            }
        }
    }

    fetchAPOD();

    document.getElementById('load-date-btn')?.addEventListener('click', () => fetchAPOD(apod.dateInput.value));
    document.getElementById('today-apod-btn')?.addEventListener('click', () => fetchAPOD());
    apod.dateInput?.addEventListener('change', () => fetchAPOD(apod.dateInput.value));


    // --- Upcoming Launches ---
    const launchesGrid = document.getElementById('launches-grid');

    async function fetchLaunches() {
        try {
            const res = await fetch('https://ll.thespacedevs.com/2.3.0/launches/upcoming/?limit=10');
            const data = await res.json();
            
            if (launchesGrid && data.results) {
                launchesGrid.innerHTML = '';
                data.results.forEach(launch => {
                    const date = new Date(launch.net);
                    
                    let img = './images/launch-placeholder.png';
                    if (launch.image?.image_url) img = launch.image.image_url;

                    const card = document.createElement('div');
                    card.className = 'bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden hover:border-blue-500/30 transition-all group cursor-pointer';
                    card.innerHTML = `
                        <div class="relative h-48 bg-slate-900/50 flex items-center justify-center overflow-hidden">
                            <img src="${img}" class="w-full h-full object-cover" onerror="this.src='./images/launch-placeholder.png'">
                            <div class="absolute top-3 right-3">
                                <span class="px-3 py-1 bg-blue-500/90 text-white rounded-full text-xs font-semibold">
                                    ${launch.status?.abbrev || 'TBD'}
                                </span>
                            </div>
                        </div>
                        <div class="p-5">
                            <h4 class="font-bold text-lg mb-2 group-hover:text-blue-400 transition-colors">${launch.name}</h4>
                            <p class="text-sm text-slate-400 mb-4"><i class="fas fa-building mr-2"></i>${launch.launch_service_provider?.name || 'Unknown'}</p>
                            <div class="space-y-2 text-sm text-slate-300">
                                <p><i class="fas fa-calendar w-5"></i>${date.toLocaleDateString()}</p>
                                <p><i class="fas fa-clock w-5"></i>${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                <p><i class="fas fa-rocket w-5"></i>${launch.rocket?.configuration?.name || 'Rocket'}</p>
                            </div>
                        </div>
                    `;
                    launchesGrid.appendChild(card);
                });

                const countEl = document.getElementById('launches-count');
                if (countEl) countEl.textContent = `${data.count} Launches`;
            }
        } catch (err) {
            console.error(err);
        }
    }

    fetchLaunches();


    // --- Planets Explorer ---
    const planetUI = {
        name: document.getElementById('planet-detail-name'),
        desc: document.getElementById('planet-detail-description'),
        img: document.getElementById('planet-detail-image'),
        stats: {
            distance: document.getElementById('planet-distance'),
            radius: document.getElementById('planet-radius'),
            mass: document.getElementById('planet-mass'),
            density: document.getElementById('planet-density'),
            orbit: document.getElementById('planet-orbital-period'),
            rotation: document.getElementById('planet-rotation'),
            gravity: document.getElementById('planet-gravity'),
            moons: document.getElementById('planet-moons')
        },
        discovery: {
            by: document.getElementById('planet-discoverer'),
            date: document.getElementById('planet-discovery-date'),
            type: document.getElementById('planet-body-type'),
            vol: document.getElementById('planet-volume')
        }
    };

    let planetsData = {};

    async function fetchPlanets() {
        try {
            const res = await fetch('https://solar-system-opendata-proxy.vercel.app/api/planets');
            const data = await res.json();
            
            data.bodies.forEach(body => {
                planetsData[body.englishName.toLowerCase()] = body;
            });
            
            updatePlanetUI('earth');
        } catch (err) {
            console.error(err);
        }
    }

    function updatePlanetUI(id) {
        const data = planetsData[id];
        if (!data) return;

        if (planetUI.name) planetUI.name.textContent = data.englishName;
        if (planetUI.img) planetUI.img.src = `./images/${id}.png`;
        if (planetUI.desc) planetUI.desc.textContent = getPlanetDesc(id);

        // Stats
        if (planetUI.stats.distance) planetUI.stats.distance.textContent = `${data.semimajorAxis.toLocaleString()} km`;
        if (planetUI.stats.radius) planetUI.stats.radius.textContent = `${data.meanRadius.toLocaleString()} km`;
        if (planetUI.stats.mass) planetUI.stats.mass.textContent = data.mass ? `${data.mass.massValue} x 10^${data.mass.massExponent} kg` : 'N/A';
        if (planetUI.stats.density) planetUI.stats.density.textContent = `${data.density} g/cm³`;
        if (planetUI.stats.orbit) planetUI.stats.orbit.textContent = `${data.sideralOrbit} days`;
        if (planetUI.stats.rotation) planetUI.stats.rotation.textContent = `${data.sideralRotation} hours`;
        if (planetUI.stats.gravity) planetUI.stats.gravity.textContent = `${data.gravity} m/s²`;
        if (planetUI.stats.moons) planetUI.stats.moons.textContent = data.moons?.length || 0;

        // Discovery
        const isAncient = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn'].includes(id);
        
        if (planetUI.discovery.by) {
            planetUI.discovery.by.textContent = isAncient ? 'Known since antiquity' : (data.discoveredBy || 'Unknown');
        }
        if (planetUI.discovery.date) {
            planetUI.discovery.date.textContent = isAncient ? 'Ancient times' : (data.discoveryDate || 'Unknown');
        }
        if (planetUI.discovery.type) planetUI.discovery.type.textContent = data.bodyType || 'Planet';
        if (planetUI.discovery.vol) planetUI.discovery.vol.textContent = data.vol ? `${data.vol.volValue} x 10^${data.vol.volExponent} km³` : 'N/A';
    }

    document.querySelectorAll('.planet-card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('.planet-card').forEach(c => c.classList.remove('border-blue-500'));
            card.classList.add('border-blue-500');
            updatePlanetUI(card.dataset.planetId);
        });
    });

    function getPlanetDesc(id) {
        const descs = {
            mercury: "Mercury is the smallest planet in the Solar System and the closest to the Sun. Its orbit around the Sun takes 87.97 Earth days, the shortest of all the Sun's planets.",
            venus: "Venus is the second planet from the Sun. It is named after the Roman goddess of love and beauty. As the brightest natural object in Earth's night sky after the Moon, Venus can cast shadows.",
            earth: "Earth is the third planet from the Sun and the only astronomical object known to harbor life. About 29% of Earth's surface is land consisting of continents and islands.",
            mars: "Mars is the fourth planet from the Sun and the second-smallest planet in the Solar System, being larger than only Mercury. In English, Mars carries the name of the Roman god of war.",
            jupiter: "Jupiter is the fifth planet from the Sun and the largest in the Solar System. It is a gas giant with a mass one-thousandth that of the Sun, but two-and-a-half times that of all the other planets in the Solar System combined.",
            saturn: "Saturn is the sixth planet from the Sun and the second-largest in the Solar System, after Jupiter. It is a gas giant with an average radius of about nine and a half times that of Earth.",
            uranus: "Uranus is the seventh planet from the Sun. Its name is a reference to the Greek god of the sky, Uranus, who, according to Greek mythology, was the great-grandfather of Ares (Mars), grandfather of Zeus (Jupiter) and father of Cronus (Saturn).",
            neptune: "Neptune is the eighth and farthest-known Solar planet from the Sun. In the Solar System, it is the fourth-largest planet by diameter, the third-most-massive planet, and the densest giant planet."
        };
        return descs[id] || "Exploring the cosmos...";
    }

    fetchPlanets();

});
