
document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {

    /*var my_media = new Media(getCordovaPath() + "1_1.ogg",
        // success callback
        function () { alert("playAudio():Audio Success"); },
        // error callback
        function (err) { console.log(err);alert("playAudio():Audio Error: " + err.code); }
    );*/
    var my_media ;

    var counter = 0;
    var timerDur ;
    var mediaTimer;
    var currentMediaSrc = "";

    /** TEST */
    let categorieHtml = "";
    

    if(datas.fr.categories){
        let categories = datas.fr.categories;
        
        for (let i = 0; i < Object.keys(categories).length; i++) {
            //console.log(categories[i]);
            categorieHtml += " - " + categories[i+1].name + "<br>";

            // product
            let sessions = categories[i+1].sessions;
            let productHtml = "";
            
            for (let j = 0; j < Object.keys(sessions).length; j++) {
                productHtml += " --- " + sessions[j+1].name + "<br>";
            }

            categorieHtml += productHtml ;

        }

        document.getElementById('testDatas').innerHTML = categorieHtml ;

    }

  



   /* var timerDur = setInterval(function() {
        counter = counter + 100;
        if (counter > 2000) {
            clearInterval(timerDur);
        }
        var dur = my_media.getDuration();
        if (dur > 0) {
            clearInterval(timerDur);
            document.getElementById('audio_duration').innerHTML = (dur) + " sec";
        }
    }, 100);


    var mediaTimer = setInterval(function () {
        // get media position
        //var dur = my_media.getDuration();
        my_media.getCurrentPosition(
            // success callback
            function (position) {
                if (position > -1) {
                    console.log((position) + " position en sec");
                    document.getElementById('position').innerHTML = (position) + " sec";
                    
                }
            },
            // error callback
            function (e) {
                console.log("Error getting pos=" + e);
            }
        );
    }, 1000);*/

   /* document.getElementById('play_1').onclick = function () {
        console.log(my_media);
        if(my_media != undefined && my_media.hasOwnProperty('id')){
            console.log('stop by play : '+ my_media.id);
          //  my_media.stop();
        } else {
            my_media = new Media(getCordovaPath() + "1_1.ogg",
            // success callback
            function () { alert("playAudio():Audio Success 1"); },
            // error callback
            function (err) { console.log(err);alert("playAudio():Audio Error: " + err.code); }
        );
  
        }

        console.log(my_media.id);
        my_media.play();
    };*/

    $( ".play" ).on( "click", function() {

        let mediaSrc = $(this).data( "media_src" );

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


        timerDur = setInterval(function() {
            counter = counter + 100;
            if (counter > 2000) {
                clearInterval(timerDur);
            }
            var dur = my_media.getDuration();
            if (dur > 0) {
                clearInterval(timerDur);
                document.getElementById('audio_duration').innerHTML = (dur) + " sec";
            }
        }, 100);

        mediaTimer = setInterval(function () {
            // get media position
            //var dur = my_media.getDuration();
            my_media.getCurrentPosition(
                // success callback
                function (position) {
                    if (position > -1) {
                        console.log((position) + " position en sec");
                        document.getElementById('position').innerHTML = (position) + " sec";
                        
                    }
                },
                // error callback
                function (e) {
                    console.log("Error getting pos=" + e);
                }
            );
        }, 1000);


        currentMediaSrc = mediaSrc;
        my_media.play();
    });

   /* document.getElementById('play_2').onclick = function () {

        if(my_media != undefined && my_media.hasOwnProperty('id')){
            console.log('stop by play : '+ my_media.id);
            my_media.stop();
        }


        my_media = new Media(getCordovaPath() + "1_2.mp3",
            // success callback
            function () { alert("playAudio():Audio Success 2"); },
            // error callback
            function (err) { console.log(err);alert("playAudio():Audio Error: " + err.code); }
        );
        console.log(my_media.id);
        my_media.play();
    };
*/


/* document.getElementById('pause').onclick = function () {
        alert('pause');
        my_media.pause();
    };


    document.getElementById('stop').onclick = function () {
        alert('stop');
        console.log(my_media.id);
        my_media.stop();
    };


    document.getElementById('ff').onclick = function () {
        my_media.getCurrentPosition((pos)=>{
            let dur = my_media.getDuration();
            console.log('current position', pos);
            console.log('duration', dur);
            pos += 10;
            if(pos < dur){
                my_media.seekTo( pos * 1000 );
            }
        });
    };

    document.getElementById('rew').onclick = function () {
        my_media.getCurrentPosition((pos)=>{
            pos -= 10;
            if( pos > 0){
                my_media.seekTo( pos * 1000 );
            }else{
                my_media.seekTo(0);
            }
        });
    }; */
    

    /** Navigation */
    document.getElementById('cta').onclick = function () {
        document.getElementById('welcome').style.display = 'none';
        document.getElementById('listing').style.display = 'flex';
    };





}


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