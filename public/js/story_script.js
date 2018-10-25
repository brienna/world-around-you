
window.onload = function() {
    
    /**************************** LOAD STORY JSON FILE ****************************/

    var whichStory = "story_2"; // the ID of the story in the JSON file
    var currStoryData = null;
    var numOfPages = 0;
    var currPage = 0;
    loadStory(whichStory);

    // Load JSON file for one story
    function loadStory(storyId) {
        if (window.XMLHttpRequest) {
            console.log("Loading text for " + storyId + "...");
            var xmlhttp = new XMLHttpRequest();
            var dataUrl = 'text/' + whichStory + '.json';
            xmlhttp.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    // Save story and parse first page
                    currStoryData = JSON.parse(this.responseText);
                    numOfPages = Object.keys(currStoryData).length - 1;  // -1 due to title
                    currPage = 1;
                    parsePage(currPage);
                    createSlider();
                    bindEventListeners();
                }
            };
            xmlhttp.open("GET", dataUrl);
            xmlhttp.send();
        }
    }

    /**************************** PARSE PAGE INTO HTML ELEMENTS ****************************/

    var picFilepathRoot = "pictures/" + whichStory + "/" + whichStory + '_';
    var vidFilepathRoot = "videos/" + whichStory + "/" + whichStory + '_';

    // Parse story JSON by page into components
    function parsePage(pageNum) {
        console.log('Parsing page ' + pageNum + ' of ' + whichStory);

        // Set the picture component
        var picComponent = document.getElementsByClassName('component')[0];
        picComponent.src = picFilepathRoot + pageNum + '.png';

        // Set the video component
        vidComponent = document.getElementsByClassName('component')[1];
        vidComponent.src = vidFilepathRoot + pageNum + '.mp4';

        // Set the glossary component
        // Delete current text
        storyText = document.getElementById('storyText');
        while (storyText.firstChild) {
            storyText.removeChild(storyText.firstChild);
        }
        var glossary = currStoryData[pageNum].glossary;
        console.log(glossary);
        glossary.forEach(function(phrase) {
            var timestamp = phrase.timestamp;
            var text = phrase.text;

            // If the phrase contains timestamp, identify as glossary word
            if (timestamp) {
                $('<span></span>')
                    .addClass('glossary')
                    .appendTo($(storyText))
                    .text(text) // need to fix so that it sets these time stamp onto the trigger & featherlight can read
            } else {
                // If the phrase contains no time stamp, add it as plain text
                $('<span></span>')
                    .appendTo('#storyText')
                    .text(text);
            }
        });
    }

    /**************************** ACTIVATE NEXT/BACK ARROWS ****************************/

    function bindEventListeners() {
        var components = document.getElementsByClassName('component');
        var currComponent = 0;  // tracks which component is currently showing
        var arrows = document.getElementsByClassName("arrow"); 
        var leftArrow = arrows[0];
        var rightArrow = arrows[1];

        console.log('Currently showing component ' + currComponent);

        // Set right arrow to advance forward through story
        rightArrow.addEventListener('click', function() {
            // Increment component tracker 
            currComponent++;

            // If past the last component of current page, advance to the next page
            if (currComponent > 2) {
                console.log('Turning from page ' + currPage + ' to page ' + (currPage + 1)); 
                // Turn to new page
                currPage++; 
                // Parse new page
                parsePage(currPage); 
                // Hide current component
                toggleVisibility(components[currComponent - 1]);
                // Reset component tracker and show first component of new page
                currComponent = 0;  
                toggleVisibility(components[currComponent]);
                console.log('Moving to component ' + currComponent);
            } else {
                // Replace current component with the next component
                console.log('Moving to component ' + currComponent);
                toggleVisibility(components[currComponent - 1]);
                toggleVisibility(components[currComponent]);

            }
            
            
        });
    }

    // Toggles visibility of passed element
    function toggleVisibility(element) {
        var computedDisplayValue = element.currentStyle ? element.currentStyle.display : getComputedStyle(element, null).display;
        if (computedDisplayValue == "none") {
            element.style.display = "block";
        } else {
            element.style.display = "none";
        }
    }
    

        
        /*
        var vid = document.createElement('video');
        vid.setAttribute('class', 'glossaryVid');
        vid.src = 'videos/example.mp4';
        vid.autoplay = true;
        vid.muted = true;
        */


    /**************************** STORY PAGE SETUP ****************************/
    /*
    // Set left arrow to go backward through story
    leftArrow.addEventListener('click', function() {
        // Decrease the page component tracker
        pageComponentTracker--;

        if (pageComponentTracker < 0) {
            // Go back to the last page
            console.log("Going back one page...");
            // Reset page component tracker
            pageComponentTracker = 2;
        } else {
            // Replace current component with the last component
            toggleVisibility(pageComponents[pageComponentTracker+1]);
            toggleVisibility(pageComponents[pageComponentTracker]);
        }
    });*/

    /**************************** SLIDER BAR ****************************/
    function createSlider() {
        $("#slider").slider({
            min: 1,
            max: numOfPages * 3, // will change this based on how many pages we have. For we have 3 components, not pages
            step: 1, 
            change: slideTo,
            range: false,
            orientation: 'horizontal',
            create: function(event, ui) { // set ticks
                setSliderTicks(event.target);
            }
        });
    }

    // Handles "next button" 
    function slideTo(event, ui) {
        $("#val").html(ui.value);
    } // https://codepen.io/nevcanuludas/pen/nFfsb

    function setSliderTicks(){
        var $slider =  $('#slider');
        var max =  $slider.slider("option", "max");    
        var spacing =  100 / (max - 1);
        console.log(spacing);

        $slider.find('.tickmark').remove();
        for (var i = 0; i < max ; i++) {
            $('<span class="tickmark"></span>').css('left', (spacing * i) +  '%').appendTo($slider); 
         }
    }

    /**************************** GLOSSARY ****************************/
 

    // Show featherlight if user clicks on a glossary word
    function playVideoInterval(glossaryVid, start, end) {
        //var glossaryVid = document.getElementsByClassName('glossaryVid')[1];
        glossaryVid.setAttribute('start', start);
        glossaryVid.setAttribute('end', end);
        $(glossaryVid).data('loop', true);
        glossaryVid.setAttribute('currentTime', $(glossaryVid).attr('start'));
        //$(glossaryVid).on('timeupdate', loop);
        $(glossaryVid)[0].play();
        console.log($(glossaryVid)[0]);

        function loop() {
            if ($(this).attr('currentTime') >= $(glossaryVid).attr('end') && $(glossaryVid).data('loop')) {
                $(glossaryVid).attr('currentTime', $(glossaryVid).attr('start'));
            }
            console.log(glossaryVid);
            glossaryVid.setAttribute('start', start);
            glossaryVid.setAttribute('end', end);
            $(glossaryVid).data('loop', true);
            glossaryVid.currentTime = $(glossaryVid).attr('start');
            glossaryVid.addEventListener('timeupdate', loop);
            console.log(glossaryVid.currentTime);
            glossaryVid.play();

            function loop() {
                console.log('playing loop');
                console.log(this.currentTime);
                if (this.currentTime >= $(glossaryVid).attr('end') && $(glossaryVid).data('loop')) {
                    glossaryVid.currentTime = $(glossaryVid).attr('start');
                }
            }
        }
    } 

}
