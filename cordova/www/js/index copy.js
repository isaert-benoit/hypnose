document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {

    fillCatgories();

    $( "#categories .cta-category" ).on( "click", function() {
        hideAndShow(
            $( "#listing_categories"),
            $( "#listing_sessions")
        );
        let clickedCategory = $(this).attr('data-category-id');
        fillSessions(clickedCategory); 
    } );

    $( ".cta-return-categories" ).on( "click", function() {
        hideAndShow(
            $( "#listing_sessions"),
            $( "#listing_categories")            
        );
    } );

    $( ".cta-return-sessions" ).on( "click", function() {
        hideAndShow(
            $( "#player"),
            $( "#listing_sessions")        
        );
    } );

  };    

 /** Fill Player on click cta */
 function fillPlayer(categoryId, sessionId){

    if(
        categoryId != null
        && categoryId != undefined
        && sessionId != null
        && sessionId != undefined
    ){
        let session = datas.fr.categories[categoryId].sessions[sessionId];

        let sessionHtml = "<div>"+session.name+"</div>";
        $('#player #details').html(sessionHtml) ;

        var my_media;
        var currentMediaSrc;

        /** Handle play cta */
        $( "#player .cta-play" ).on( "click", function() {

            hideAndShow(
                $( "#player .cta-play"),
                $( "#player .cta-pause")            
            );

            let mediaSrc = session.src;
            

            if(mediaSrc != currentMediaSrc){

                if(my_media != undefined && my_media.hasOwnProperty('id')){
                    console.log('stop by play : '+ my_media.id);
                    my_media.stop();
                }

                my_media = new Media(getCordovaPath() + mediaSrc,
                    // success callback
                    function () { 
                        // alert("playAudio():Audio Success 2"); 
                    },
                    // error callback
                    function (err) { 
                        console.log(err);
                        //alert("playAudio():Audio Error: " + err.code); 
                    }
                );
            }    


            console.log(my_media.id);


            // timerDur = setInterval(function() {
            //     counter = counter + 100;
            //     if (counter > 2000) {
            //         clearInterval(timerDur);
            //     }
            //     var dur = my_media.getDuration();
            //     if (dur > 0) {
            //         clearInterval(timerDur);
            //         document.getElementById('audio_duration').innerHTML = (dur) + " sec";
            //     }
            // }, 100);

            // mediaTimer = setInterval(function () {
            //     // get media position
            //     //var dur = my_media.getDuration();
            //     my_media.getCurrentPosition(
            //         // success callback
            //         function (position) {
            //             if (position > -1) {
            //                 console.log((position) + " position en sec");
            //                 document.getElementById('position').innerHTML = (position) + " sec";
                            
            //             }
            //         },
            //         // error callback
            //         function (e) {
            //             console.log("Error getting pos=" + e);
            //         }
            //     );
            // }, 1000);


                currentMediaSrc = mediaSrc;
                my_media.play();
            });

        /** Handle pause cta */
        $( "#player .cta-pause" ).on( "click", function() {
            
            hideAndShow(
                $( "#player .cta-pause"),
                $( "#player .cta-play")            
            );

            my_media.pause();

        });



    }
  }


  /** Fill Session on click cta */
  function fillSessions(categoryId){

    if(categoryId != null && categoryId != undefined){

        let dataCategory = datas.fr.categories[categoryId];
        let sessions = dataCategory.sessions;
        let productHtml = "";

        for (let j = 0; j < Object.keys(sessions).length; j++) {
            productHtml += "<div data-session-id='"+(j+1)+"' data-category-id='"+categoryId+"' class='cta-session'>"+sessions[j+1].name+"</div>";
        }
        
        $('#listing_sessions #sessions').html(productHtml) ;

    }

    /** Add click event on session cta */
    $( "#sessions .cta-session" ).on( "click", function() {
        hideAndShow(
            $( "#listing_sessions"),
            $( "#player")            
        );
        let clickedCategory = $(this).attr('data-category-id');
        let clickedSession = $(this).attr('data-session-id');
        fillPlayer(
            clickedCategory,
            clickedSession
        ); 
    } );


  }

  /** Fill Categories on load */
  function fillCatgories(){

    let categorieHtml = "";

    if(datas.fr.categories){
        let categories = datas.fr.categories;
        
        for (let i = 0; i < Object.keys(categories).length; i++) {
            
            categorieHtml += "<div data-category-id='"+(i+1)+"' class='cta-category'>"+categories[i+1].name+"</div>";

        }

        $('#listing_categories #categories').html(categorieHtml) ;

    }

  }

  function hideAndShow(hideElmt, showElmt){
    hideElmt.hide();
    showElmt.show();
  }

/** Player */
function getCordovaPath() {

    var path = "";
    if (device.platform == "Android") {
       path = "file:///android_asset/www/";
    } 
    return path;
}

function playAudio(url) {
    // Play the audio file at url
   // alert(getCordovaPath() + url);
    //my_media = 

    // Play audio
    my_media.play();

}