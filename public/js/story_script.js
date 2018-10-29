
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
                    numOfPages = Object.keys(currStoryData).length;  // -1 due to title
                    console.log('This story has ' + numOfPages + ' pages');
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
        vidComponent.src = vidFilepathRoot + pageNum + '.MP4';

        // Set the glossary component
        // Delete current text
        storyText = document.getElementById('storyText');
        while (storyText.firstChild) {
            storyText.removeChild(storyText.firstChild);
        }

        var glossary = currStoryData[pageNum].glossary;
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

        console.log('Done parsing page ' + pageNum);
    }

    /**************************** ACTIVATE NEXT/BACK ARROWS ****************************/

    function bindEventListeners() {
        var components = document.getElementsByClassName('component');
        var arrows = document.getElementsByClassName("arrow"); 
        var leftArrow = arrows[0];
        var rightArrow = arrows[1];

        // Deactivate left arrow at the beginning
        leftArrow.classList.add('deactivated');

        // Set right arrow to advance forward through story
        rightArrow.addEventListener('click', function() {
            var currComponent = ($('#slider').slider('value') - 1) % 3;
            var nextIndex = (currPage * 3) + currComponent + 2;
            $('#slider').slider('value', nextIndex); // (slider has change event handler that will show/hide correct components)

            // If not on first component on first page, ensure left arrow activated 
            if (!(currComponent == 0 && currPage == 0)) {
                if (leftArrow.classList.contains('deactivated')) {
                    leftArrow.classList.remove('deactivated');
                }
            } 
            // If on last component on last page, ensure right arrow deactivated
            if (currComponent == 2 && currPage == numOfPages) {
                if (!rightArrow.classList.contains('deactivated')) {
                    rightArrow.classList.add('deactivated');
                }
            }
        }); 

        // Set left arrow to go backward through story
        leftArrow.addEventListener('click', function() {
            var currComponent = ($('#slider').slider('value') - 1) % 3; 
            var lastIndex = (currPage * 3) + currComponent;
            $('#slider').slider('value', lastIndex); // (slider has change event handler that will show/hide correct components)

            // If on first component on first page, ensure left arrow deactivated
            if (currComponent == 0 && currPage == 0) {
                if (!leftArrow.classList.contains('deactivated')) {
                    leftArrow.classList.add('deactivated');
                }
            }
            // If not on last component on last page, ensure right arrow activated
            if (!(currComponent == 2 && currPage == numOfPages)) {
                if (rightArrow.classList.contains('deactivated')) {
                    rightArrow.classList.remove('deactivated');
                }
            }
        });
    }   

    // Shows specified component, hiding all other components
    function showThisComponent(components, id) {
        // Show the desired component, ensuring other components are hidden first
        if (getDisplayValue(components[id]) == "none") {
            for (var i = 0; i < components.length; i++) {
                if (i != id && getDisplayValue(components[i]) != "none") {
                    components[i].style.display = "none";
                    // If another component is a video, ensure it is paused & reset 
                    if (components[i].nodeName.toLowerCase() == 'video') {
                        components[i].pause();
                        components[i].currentTime = 0;
                    }
                }
            }

            components[id].style.display = "block";

            // If desired component is a video, start playing
            if (components[id].nodeName.toLowerCase() == 'video') {
                components[id].play();
            }
        } 
    }

    // Returns calculated display value for given element
    function getDisplayValue(element) {
        return element.currentStyle ? element.currentStyle.display : getComputedStyle(element, null).display;
    }

    /**************************** SLIDER BAR ****************************/
    function createSlider() {
        $("#slider").slider({
            min: 1,
            max: numOfPages * 3, 
            step: 1, 
            change: slideTo, // on manual change
            range: false,
            orientation: 'horizontal',
            create: function(event, ui) { // set ticks
                setSliderTicks(event.target);
            }
        });
    }

    // If the slider changes, update the view
    function slideTo(event, ui) {
        console.log('this played');
        // Get value of slider
        var desiredId = $('#slider').slider('value') - 1;
        var desiredPage = Math.floor(desiredId/3);
        var desiredComponent = desiredId % 3; 

        // Make the desired page the current page 
        currPage = desiredPage;
        parsePage(currPage);

        // Show the desired component and hide undesired components
        var components = document.getElementsByClassName('component');
        showThisComponent(components, desiredComponent);
    } 

    function setSliderTicks(){
        var $slider =  $('#slider');
        var max =  $slider.slider("option", "max");    
        var spacing =  100 / (max - 1);

        $slider.find('.tickmark').remove();
        for (var i = 0; i < max ; i++) {
            $('<span class="tickmark"></span>').css('left', (spacing * i) +  '%').appendTo($slider); 
         }
    }











    /**************************** GLOSSARY (UNUSED RIGHT NOW) ****************************/

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
