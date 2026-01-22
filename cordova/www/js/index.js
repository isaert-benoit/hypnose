const App = {
    currentCategory: null,
    currentSession: null,
    audioPlayer: new Audio(),
    favorites: JSON.parse(localStorage.getItem('hypno_favs')) || [],
    previousScreen: 'listing_categories',
    isDragging: false,

    init: function() {
        this.renderCategories();
        this.bindEvents();
        this.setupAudioListeners();
        this.setupProgressListeners();
        this.bindNavEvents();
        this.renderMantras();
        this.bindPlayerEvents();
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
                <div class="card session-item" data-id="${id}">
                    <h4>${session.name}</h4>
                    <p>${session.description}</p>
                </div>
            `);
        });

        this.switchScreen('listing_sessions');
    },

    showPlayer: function(sessionId, fromScreen) {

        // Handle previous cta
        this.previousScreen = fromScreen;

        // On récupère la session visée
        const targetSession = this.currentCategory.sessions[sessionId];

        // LOGIQUE CRUCIALE : On vérifie si c'est une nouvelle session
        if (this.currentSessionId !== sessionId) {
            this.currentSession = targetSession;
            this.currentSessionId = sessionId;
            
            // On ne change la source que si c'est une nouvelle piste
            if(this.currentSession.src) {
                this.audioPlayer.src = this.currentSession.src;
                this.audioPlayer.load(); 
            }
        }

        // Mise à jour de l'UI (Détails de la session)
        $('#details').html(`
            <div class="player-view">
                <h2>${this.currentSession.name}</h2>
                <p>${this.currentSession.description}</p>
            </div>
        `);

        this.updateFavUI();

        // On ajuste l'état des boutons Play/Pause selon si l'audio tourne déjà
        this.updatePlayerButtons();
        this.switchScreen('player');
    },

    setupProgressListeners: function() {
        const slider = $('#seek-slider');
        
        // Met à jour la barre pendant la lecture
        this.audioPlayer.ontimeupdate = () => {
            const val = (this.audioPlayer.currentTime / this.audioPlayer.duration) * 100;
            slider.val(val || 0);
            $('#current-time').text(this.formatTime(this.audioPlayer.currentTime));
        };
    
        // Quand on charge une piste, on affiche la durée totale
        this.audioPlayer.onloadedmetadata = () => {
            $('#duration').text(this.formatTime(this.audioPlayer.duration));
        };
    
        // Quand l'utilisateur déplace le curseur
        slider.on('input', () => {
            const time = this.audioPlayer.duration * (slider.val() / 100);
            this.audioPlayer.currentTime = time;
        });
    },
    
    formatTime: function(seconds) {
        if (isNaN(seconds)) return "00:00";
        const min = Math.floor(seconds / 60);
        const sec = Math.floor(seconds % 60);
        return (min < 10 ? "0" + min : min) + ":" + (sec < 10 ? "0" + sec : sec);
    },

    bindPlayerEvents: function() {
        const self = this;
        const seekSlider = $('#seek-slider');
    
        // 1. Début du mouvement (Souris ou Doigt)
        seekSlider.on('mousedown touchstart', function() {
            self.isDragging = true; 
            console.log("Mouvement commencé - Mise à jour auto stoppée");
        });
    
        // 2. Fin du mouvement (On utilise 'input' pour plus de réactivité sur PC)
        seekSlider.on('change', function() {
            self.isDragging = false;
            const seekTo = self.audioPlayer.duration * (seekSlider.val() / 100);
            if (!isNaN(seekTo)) {
                self.audioPlayer.currentTime = seekTo;
            }
            console.log("Mouvement terminé - Audio repositionné");
        });
    
        // 3. Mise à jour automatique durant la lecture
        this.audioPlayer.ontimeupdate = function() {
            // Si l'utilisateur n'est pas en train de glisser le curseur
            if (!self.isDragging) {
                const percentage = (self.audioPlayer.currentTime / self.audioPlayer.duration) * 100;
                $('#seek-slider').val(percentage || 0);
                
                // On met à jour ton affichage textuel "current-time"
                self.updateTimerDisplay();
            }
        };
    },

    updateTimerDisplay: function() {
        // On formate le temps actuel
        const current = this.formatTime(this.audioPlayer.currentTime);
        
        // On l'injecte dans ton élément existant
        $('#current-time').text(current); 
        
        // Si tu as aussi un élément pour la durée totale (ex: #duration)
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
        if (!this.audioPlayer.paused) {
            $('.cta-play').hide();
            $('.cta-pause').show();
        } else {
            $('.cta-play').show();
            $('.cta-pause').hide();
        }
    },

    playAudio: function() {
        this.audioPlayer.play();
        this.updatePlayerButtons();
    },

    pauseAudio: function() {
        this.audioPlayer.pause();
        this.updatePlayerButtons();
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
        const index = this.favorites.findIndex(f => f.id === id);

        if (index > -1) {
            this.favorites.splice(index, 1); // Enlever
        } else {
            // On stocke l'ID ET les infos pour pouvoir les afficher dans la liste favoris
            this.favorites.push({
                id: id,
                name: this.currentSession.name,
                description: this.currentSession.description,
                category: this.currentCategory.id // On garde la catégorie pour pouvoir y retourner
            });
        }

        localStorage.setItem('hypno_favs', JSON.stringify(this.favorites));
        this.updateFavUI();
    },

    updateFavUI: function() {
        // On vérifie si l'ID de la session actuelle est présent dans le tableau des favoris
        // On utilise .toString() par sécurité pour être sûr de comparer des choux avec des choux
        const isFav = this.favorites.some(f => f.id.toString() === this.currentSessionId.toString());
        
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
};

// Initialisation Cordova
document.addEventListener('deviceready', () => {
    App.init();
}, false);