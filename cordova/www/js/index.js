const App = {
    currentCategory: null,
    currentSession: null,
    audioPlayer: new Audio(),

    init: function() {
        this.renderCategories();
        this.bindEvents();
        this.setupAudioListeners(); // Pour gérer la fin de piste par exemple
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
            self.showPlayer(sessionId);
        });

        // Retours
        $('.cta-return-categories').click(() => self.switchScreen('listing_categories'));
        $('.cta-return-sessions').click(() => self.switchScreen('listing_sessions'));

        // Player controls
        $('.cta-play').click(() => self.playAudio());
        $('.cta-pause').click(() => self.pauseAudio());
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

    showPlayer: function(sessionId) {
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

        // On ajuste l'état des boutons Play/Pause selon si l'audio tourne déjà
        this.updatePlayerButtons();
        this.switchScreen('player');
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
    }
};

// Initialisation Cordova
document.addEventListener('deviceready', () => {
    App.init();
}, false);