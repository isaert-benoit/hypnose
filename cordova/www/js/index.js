/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

// Wait for the deviceready event before using any of Cordova's device APIs.
// See https://cordova.apache.org/docs/en/latest/cordova/events/events.html#deviceready
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
            //console.log(categories[i]);
            categorieHtml += "<div data-category-id='"+(i+1)+"' class='cta-category'>"+categories[i+1].name+"</div>";

            // product
            // let sessions = categories[i+1].sessions;
            // let productHtml = "";

            // for (let j = 0; j < Object.keys(sessions).length; j++) {
            //     productHtml += " --- " + sessions[j+1].name + "<br>";
            // }

            // categorieHtml += productHtml ;

        }

        $('#listing_categories #categories').html(categorieHtml) ;

    }

  }

  function hideAndShow(hideElmt, showElmt){
    hideElmt.hide();
    showElmt.show();
  }