const App = {
    currentCategory: null,
    currentSession: null,
    audioPlayer: null, // Sera soit un new Audio() soit un new Media()
    isNative: false,   // Pour savoir si on utilise le plugin Cordova
    favorites: JSON.parse(localStorage.getItem('hypno_favs')) || [],
    previousScreen: 'listing_categories',
    isDragging: false,
    isSeeking: false,

    init: function() {
        // Détecter si on est sur mobile avec le plugin Media disponible
        this.isNative = (typeof Media !== "undefined");
        
        this.renderCategories();
        this.bindEvents();
        this.bindNavEvents();
        this.renderMantras();
        this.bindPlayerEvents();
        
        // Timer pour l'update du slider (nécessaire pour le plugin Media)
        setInterval(() => this.updateProgressBar(), 1000);
    },

    // 1. Rendu des catégories
    renderCategories: function() {
        const container = $('#categories');
        container.empty();
        
        // On boucle sur l'objet 'datas' de ton fichier data.js
        $.each(datas.fr.categories, (id, cat) => {
            container.append(`
                <div class="card category-item" data-id="${id}">
                    <h3>${cat.name}</h3>
                    <p>${cat.description}</p>
                </div>
            `);
        });
    },

    // 2. Navigation et Events
    bindEvents: function() {
        const self = this;

        // Clic sur une catégorie
        $(document).on('click', '.category-item', function() {
            const id = $(this).data('id');
            self.showSessions(id);
        });

        // Clic sur une session
        $(document).on('click', '.session-item', function() {
            const sessionId = $(this).data('id');
            self.showPlayer(sessionId, 'listing_sessions');
        });

        // Retours
        $('.cta-return-categories').click(() => self.switchScreen('listing_categories'));
        $('.cta-return-sessions').click(() => self.switchScreen(self.previousScreen));

        // Player controls
        $('.cta-play').click(() => self.playAudio());
        $('.cta-pause').click(() => self.pauseAudio());

        $('#nav-mantras').click(() => self.switchScreen('listing_mantras'));
    },

    renderMantras: function() {
        const container = $('#mantras-container');
        container.empty();
    
        mantrasData.forEach(m => {
            container.append(`
                <div class="mantra-card">
                    <div class="mantra-text">"${m.text}"</div>
                    <div class="mantra-theme">${m.theme}</div>
                </div>
            `);
        });
    },

    showSessions: function(catId) {
        this.currentCategory = datas.fr.categories[catId];
        const container = $('#sessions');
        container.empty();

        $.each(this.currentCategory.sessions, (id, session) => {
            container.append(`
                <div class="card session-item" data-id="${session.id}">
                    <h4>${session.name}</h4>
                    <p>${session.description}</p>
                </div>
            `);
        });

        this.switchScreen('listing_sessions');
    },

    updateProgressBar: function() {
        if (!this.audioPlayer || this.isDragging) return;

        if (this.isNative) {
            // Logique Cordova Media
            this.audioPlayer.getCurrentPosition((pos) => {
                const dur = this.audioPlayer.getDuration();
                if (pos >= 0 && dur > 0) {
                    this.updateUI(pos, dur);
                }
            });
        } else {
            // Logique HTML5 classique
            if (!isNaN(this.audioPlayer.duration)) {
                this.updateUI(this.audioPlayer.currentTime, this.audioPlayer.duration);
            }
        }
    },

    updateUI: function(current, duration) {
        const pct = (current / duration) * 100;
        $('#seek-slider').val(pct);
        $('#current-time').text(this.formatTime(current));
        $('#duration').text(this.formatTime(duration));
    },

    // Fonction pour trouver une session par son ID unique n'importe où dans le JSON
    getSessionById: function(id) {
        let found = null;
        $.each(datas.fr.categories, (catKey, cat) => {
            $.each(cat.sessions, (sessKey, sess) => {
                if (sess.id == id) { found = sess; return false; }
            });
            if (found) return false;
        });
        return found;
    },

    showPlayer: function(sessionId, fromScreen) {
        const self = this;
        this.previousScreen = fromScreen;
        const targetSession = this.getSessionById(sessionId);

        if (targetSession && this.currentSessionId !== sessionId) {
            // Nettoyage de l'ancien player
            if (this.audioPlayer) {
                this.isNative ? this.audioPlayer.release() : this.audioPlayer.pause();
            }

            this.currentSession = targetSession;
            this.currentSessionId = sessionId;
            const fileName = this.currentSession.src || this.currentSession.file;

            if (fileName) {
                const fullPath = this.getPath() + fileName;

                if (this.isNative) {
                    // VERSION MOBILE (PLUGIN MEDIA)
                    this.audioPlayer = new Media(fullPath, 
                        () => { self.mediaStatus = 4; self.updatePlayerButtons(); }, // Terminé
                        (err) => console.log("Erreur Media", err),
                        (status) => { 
                            self.mediaStatus = status; // On stocke le statut (2 = playing, 3 = paused)
                            self.updatePlayerButtons(); 
                        }
                    );
                } else {
                    // VERSION PC (AUDIO CLASSIQUE)
                    this.audioPlayer = new Audio(fullPath);
                }
                
                this.audioPlayer.play(); // Lancement pour charger les metas
                setTimeout(() => { this.audioPlayer.pause(); this.updatePlayerButtons(); }, 150);
            }
        }

        $('#details').html(`<h2>${this.currentSession.name}</h2><p>${this.currentSession.description || ''}</p>`);
        this.updateFavUI();
        this.updatePlayerButtons();
        this.switchScreen('player');
    },

    updatePlayerButtons: function() {
        let isPlaying = false;
    
        if (this.isNative) {
            // Status 2 correspond à "Playing" dans le plugin Cordova Media
            isPlaying = (this.mediaStatus === 2);
        } else {
            // Logique PC classique
            isPlaying = this.audioPlayer && !this.audioPlayer.paused;
        }
    
        if (isPlaying) {
            $('.cta-play').hide();
            $('.cta-pause').show();
        } else {
            $('.cta-play').show();
            $('.cta-pause').hide();
        }
    },

    setupProgressListeners: function() {
        // On ne met rien ici qui écoute le 'input' ou 'change' du slider
        // car bindPlayerEvents s'en occupe déjà de manière sécurisée.
        this.audioPlayer.onloadedmetadata = () => {
            this.updateTimerDisplay();
        };
    },
    
    formatTime: function(seconds) {
        if (seconds < 0 || isNaN(seconds)) return "00:00";
        const min = Math.floor(seconds / 60);
        const sec = Math.floor(seconds % 60);
        return (min < 10 ? "0" + min : min) + ":" + (sec < 10 ? "0" + sec : sec);
    },

    bindPlayerEvents: function() {
        const self = this;
        const seekSlider = $('#seek-slider');

        seekSlider.on('touchstart mousedown', () => { this.isDragging = true; });

        seekSlider.on('touchend mouseup', function() {
            if (self.isDragging && self.audioPlayer) {
                const val = parseFloat($(this).val());
                
                if (self.isNative) {
                    // SEEK NATIVE (Millisecondes)
                    const duration = self.audioPlayer.getDuration();
                    if (duration > 0) {
                        self.audioPlayer.seekTo((val / 100) * duration * 1000);
                    }
                } else {
                    // SEEK PC (Secondes)
                    const duration = self.audioPlayer.duration;
                    if (duration > 0) {
                        self.audioPlayer.currentTime = (val / 100) * duration;
                    }
                }
                setTimeout(() => { self.isDragging = false; }, 500);
            }
        });
    },

    updateTimerDisplay: function() {
        const current = this.formatTime(this.audioPlayer.currentTime);
        $('#current-time').text(current); 
        if (!isNaN(this.audioPlayer.duration)) {
            const total = this.formatTime(this.audioPlayer.duration);
            $('#duration').text(total);
        }
    },

    switchScreen: function(screenId) {
        $('.screen').hide(); // On cache tout (ajoute class="screen" à tes divs parents)
        $('#' + screenId).fadeIn();
    },

    updatePlayerButtons: function() {
        // Sur le plugin Media, il faut parfois ruser pour savoir si ça joue
        let isPaused = true;
        if (this.isNative) {
            // Status 2 = Playing dans le plugin Media
            isPaused = (this.mediaStatus !== 2);
        } else {
            isPaused = this.audioPlayer ? this.audioPlayer.paused : true;
        }

        if (!isPaused) {
            $('.cta-play').hide(); $('.cta-pause').show();
        } else {
            $('.cta-play').show(); $('.cta-pause').hide();
        }
    },

    playAudio: function() {
        if (this.audioPlayer) {
            this.audioPlayer.play();
            if (this.isNative) {
                this.mediaStatus = 2; // On force l'état "Playing" pour l'UI
            }
            this.updatePlayerButtons();
        }
    },
    
    pauseAudio: function() {
        if (this.audioPlayer) {
            this.audioPlayer.pause();
            if (this.isNative) {
                this.mediaStatus = 3; // On force l'état "Paused" pour l'UI
            }
            this.updatePlayerButtons();
        }
    },

    switchScreen: function(screenId) {
        $('.screen').hide();
        $('#' + screenId).fadeIn();
    },

    setupAudioListeners: function() {
        // Si la piste se finit, on remet le bouton Play
        this.audioPlayer.onended = () => {
            this.updatePlayerButtons();
        };
    },

    bindNavEvents: function() {
        const self = this;
        
        // Navigation Menu
        $('#nav-home').click(() => self.switchScreen('listing_categories'));
        $('#nav-favorites').click(() => self.showFavorites());

        // Toggle Favori dans le Player
        $('#cta-fav').click(function() {
            self.toggleFavorite();
        });
    },

    toggleFavorite: function() {
        const id = this.currentSessionId;
        // On cherche si l'ID est déjà dans le tableau d'objets favoris
        const index = this.favorites.findIndex(f => f.id === id);
    
        if (index === -1) {
            // AJOUT : On stocke l'ID et les infos pour l'affichage
            this.favorites.push({
                id: id,
                name: this.currentSession.name,
                description: this.currentSession.description
            });
        } else {
            // SUPPRESSION : On retire l'élément à cet index
            this.favorites.splice(index, 1);
        }
    
        // SAUVEGARDE dans le téléphone
        localStorage.setItem('hypno_favs', JSON.stringify(this.favorites));
        
        this.updateFavUI();
    },

    updateFavUI: function() {
        const id = this.currentSessionId;
        const isFav = this.favorites.some(f => f.id === id);
        
        if (isFav) {
            $('#cta-fav').html('❤️').addClass('active');
        } else {
            $('#cta-fav').html('♡').removeClass('active');
        }
    },

    showFavorites: function() {
        const container = $('#favorites_list');
        container.empty();

        if (this.favorites.length === 0) {
            container.append('<p>Aucun favori pour le moment.</p>');
        } else {
            this.favorites.forEach(fav => {
                container.append(`
                    <div class="card fav-item" data-id="${fav.id}" data-cat="${fav.category}">
                        <h4>${fav.name}</h4>
                        <p>${fav.description}</p>
                    </div>
                `);
            });
        }

        // Event spécifique pour cliquer sur un favori
        $('.fav-item').off('click').on('click', function() {
            const catId = $(this).data('cat');
            const sessId = $(this).data('id');
            // On simule le passage par la catégorie pour charger les données
            App.currentCategory = datas.fr.categories[catId];
            App.showPlayer(sessId, 'listing_favorites');
        });

        this.switchScreen('listing_favorites');
    },

    switchScreen: function(screenId) {
        $('.screen').hide();
        console.log(screenId);
        $('#' + screenId).fadeIn();
    },

    getPath: function() {
        if (!this.isNative) return "";
        return (device.platform === "Android") ? "file:///android_asset/www/" : "";
    }
};

// Initialisation Cordova
document.addEventListener('deviceready', () => {
    App.init();
}, false);