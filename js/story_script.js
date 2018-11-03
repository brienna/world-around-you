
window.onload = function() {
    
    /**************************** LOAD STORY JSON FILE ****************************/

    var whichStory = "story_2"; // the ID of the story in the JSON file
    var currStoryData = null;
    var numOfPages = 0;
    var currPage = 0;
    var languages = [];
    var chosenLanguage = "";
    loadStory(whichStory);

    // Load JSON file for one story
    function loadStory(storyId) {
        if (window.XMLHttpRequest) {
            console.log("Loading text for " + storyId + "...");
            var xmlhttp = new XMLHttpRequest();
            var dataUrl = 'text/' + whichStory + '.json';
            xmlhttp.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    // Save story and parse title and first page
                    currStoryData = JSON.parse(this.responseText);
                    console.log('This story has ' + numOfPages + ' pages');
                    languages = parseLanguageChoices();
                    chosenLanguage = languages[0]; // placeholder, user will set later
                    numOfPages = Object.keys(currStoryData.languages[chosenLanguage]).length;  // -1 due to title 
                    parseTitle();
                    parsePage(currPage);
                    createSlider();
                    bindArrowListener();
                    bindVideoHoverListener();
                    bindChangeLanguage();
                }
            };
            xmlhttp.open("GET", dataUrl);
            xmlhttp.send();
        }
    }

    /**************************** PARSE PAGE INTO HTML ELEMENTS ****************************/

    // Get title from JSON file
    function parseTitle() {
        var title = currStoryData["languages"][chosenLanguage][0].glossary[0].text;
        var titleElement = document.getElementById('title');
        titleElement.textContent = title;
    }

    // Get available language choices from JSON file
    function parseLanguageChoices() {
        return Object.keys(currStoryData.languages);
    }

    // Parse story JSON by page into components
    function parsePage(pageNum) {
        console.log('Parsing page ' + pageNum + ' of ' + whichStory);

        // Set the picture component
        var picComponent = document.getElementsByClassName('component')[0];
        picComponent.src = 'img/' + whichStory + '/' + pageNum + '.png';
        // Set the video component
        vidComponent = document.getElementsByClassName('component')[1];
        vidComponent.src = 'videos/' + whichStory + '/' + pageNum + '.mp4';

        // Set the glossary component according to chosen language, first removing current text
        storyText = document.getElementById('storyText');
        while (storyText.firstChild) {
            storyText.removeChild(storyText.firstChild);
        }

        var glossary = currStoryData["languages"][chosenLanguage][pageNum].glossary;
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

        // Add video and picture to first row of text component
        var textComponent = document.getElementsByClassName('parent')[2]; // third parent
        var textVid = textComponent.getElementsByTagName('video')[0];
        var textPic = textComponent.getElementsByTagName('img')[0];
        textVid.src = 'videos/' + whichStory + '/' + pageNum + '.mp4';
        textPic.src = 'img/' + whichStory + '/' + pageNum + '.png';

        // Set initial size at large so it can be resized down to fit
        $('#storyText').css('font-size', '40px');
        console.log('AUTOSIZING....');
         
    }

    $.fn.resizeText = function (options) {//is getting called but is not working with left arrow...? probably cuz of display: none, yep. it works with right arrow cuz 3rd component is display: block so it can be resized immediately before it disappears, but with the left arrow it is display: none so it can't be resized at all https://stackoverflow.com/questions/363276/hide-something-with-css-without-displaynone-or-javascript
        var settings = $.extend({ maxfont: 40, minfont: 15 }, options);

        var style = $('<style>').html('.nodelays ' +
        '{ ' +
            '-moz-transition: none !important; ' +
            '-webkit-transition: none !important;' +
            '-o-transition: none !important; ' +
            'transition: none !important;' +
        '}');

        function shrink(el, fontsize, minfontsize) {
            if (fontsize < minfontsize) return;

            el.style.fontSize = fontsize + 'px';
            console.log(el.scrollHeight + ' < ' + el.offsetHeight);
            if (el.scrollHeight > el.offsetHeight) shrink(el, fontsize - 1, minfontsize);
        }

        $('head').append(style);

        $(this).each(function(index, el) {
            var element = $(el);

            element.addClass('nodelays');

            shrink(el, settings.maxfont, settings.minfont);

            element.removeClass('nodelays');
        });

        style.remove();
    }

    /**************************** HANDLE EVENTS ****************************/

    // Bind event handlers to clicks on paginating arrows
    function bindArrowListener() {
        var arrows = document.getElementsByClassName("arrow"); 
        var leftArrow = arrows[0];
        var rightArrow = arrows[1];

        // Deactivate left arrow at the beginning
        leftArrow.classList.add('deactivated');

        // Set right arrow to advance forward through story
        rightArrow.addEventListener('click', function() {
            var currComponent = ($('#slider').slider('value') - 1) % 3;
            var nextIndex = (currPage * 3) + currComponent + 2;
            console.log('on page ' + currPage + ' and component ' + nextIndex);
            $('#slider').slider('value', nextIndex); // (slider has change event handler that will show/hide correct components/arrows)
        }); 

        // Set left arrow to go backward through story
        leftArrow.addEventListener('click', function() {
            var currComponent = ($('#slider').slider('value') - 1) % 3; 
            var lastIndex = (currPage * 3) + currComponent;
            console.log('on page ' + currPage + ' and component ' + currComponent);
            $('#slider').slider('value', lastIndex); // (slider has change event handler that will show/hide correct components/arrows)
        });
    }

    // Deactivates or activates arrow when appropriate
    function checkArrows(componentNum) {
        var arrows = document.getElementsByClassName("arrow"); 
        var leftArrow = arrows[0];
        var rightArrow = arrows[1];

        // If on the first component, 
        if (componentNum == 1) {
            // Deactivate left arrow
            if (!leftArrow.classList.contains('deactivated')) {
                leftArrow.classList.add('deactivated');
            }
        } else {
            // Activate left arrow
            if (leftArrow.classList.contains('deactivated')) {
                leftArrow.classList.remove('deactivated');
            }
        }

        // If on the last component,
        if (componentNum == (numOfPages * 3)) {
            // Deactivate right arrow
            if (!rightArrow.classList.contains('deactivated')) {
                rightArrow.classList.add('deactivated');
            }
        } else { // If not on the last component,
            // Activate right arrow
            if (rightArrow.classList.contains('deactivated')) {
                rightArrow.classList.remove('deactivated');
            }
        }
    }

    // Binds event handler to video hover event
    function bindVideoHoverListener() {
        var components = document.getElementsByClassName('parent');

        // When hovering over video element, show overlay
        for (var i = 0; i < components.length; i++) {
            if (components[i].children[0].nodeName.toLowerCase() == 'video') {
                var vidEle = components[i].children[0];
                vidEle.addEventListener('mouseenter', function() {
                    console.log('hovering over video');
                    console.log(this.videoWidth + ' ' + this.offsetWidth);
                    $('#videoOverlay').css({width: '100vw', height: '520px'}); // same as panel
                });
                vidEle.addEventListener('mouseleave', function() {
                    $('#videoOverlay').css({width: 0, height: 0});
                });
            }
        }
    }

    // Shows specified component, hiding all other components
    function showThisComponent(components, id) {
        // Show the desired component, ensuring other components are hidden first
        if (getDisplayValue(components[id]) == "none") {
            for (var i = 0; i < components.length; i++) {
                if (i != id && getDisplayValue(components[i]) != "none") {
                    components[i].style.display = "none";
                    // If another component is a video, ensure it is paused & reset
                    if (components[i].children[0].nodeName.toLowerCase() == 'video') {

                        components[i].children[0].pause();
                        components[i].children[0].currentTime = 0;
                    }
                }
            }

            // Show the desired component
            components[id].style.display = "block";

            // If desired component is a video, start playing
            if (components[id].children[0].nodeName.toLowerCase() == 'video') {

                components[id].children[0].play();
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
        // Get value of slider
        var desiredId = $('#slider').slider('value') - 1;
        var desiredPage = Math.floor(desiredId/3);
        var desiredComponent = desiredId % 3; 

        // Make the desired page the current page 
        if (currPage != desiredPage) {
            console.log('turning page');
            currPage = desiredPage;
            parsePage(currPage); 
            $('#storyText').resizeText();
        }

        // Check if any arrow should be activated/deactivated
        checkArrows(desiredId + 1);

        // Show the desired component and hide undesired components
        var components = document.getElementsByClassName('parent');
        showThisComponent(components, desiredComponent);
    } 

    // Set tick marks on slider
    function setSliderTicks(){
        var $slider =  $('#slider');
        var max =  $slider.slider("option", "max");    
        var spacing =  100 / (max - 1);

        $slider.find('.tickmark').remove();
        for (var i = 0; i < max ; i++) {
            $('<span class="tickmark"></span>').css('left', (spacing * i) +  '%').appendTo($slider); 
         }
    }

    // Let user change language
    function bindChangeLanguage() {
        triggerDivs = document.getElementsByClassName('changeLang');
        for (var i = 0; i < triggerDivs.length; i++) {
            triggerDivs[i].addEventListener('click', function() {
                // Get languages menu and clear it
                var menu = document.getElementById('languages');
                $(menu).empty();
                // Add languages
                for (var i in languages) {
                    var menuItem = document.createElement('div');
                    var text = document.createElement('p');
                    text.textContent = languages[i];
                    text.style.padding = '10px 20px 0px 20px';
                    menuItem.appendChild(text);
                    menuItem.style.display = 'block';
                    menuItem.style.height = '100%';
                    menu.appendChild(menuItem);
                    $(menuItem).on('click', function() {
                        console.log('choosing ' + this.textContent);
                    });
                }
                // Show the menu
                $(menu).toggle();
                $(menu).css({
                    'top': -($(menu).height())});
            });
        }
    }

    // Change the language
    function changeLanguage(e) {

    }

    /**************************** THUMBNAIL SLIDER ****************************/

    var thumbnailSliderOptions = {
        sliderId: "thumbnail-slider",
        orientation: "horizontal",
        thumbWidth: "280px",
        thumbHeight: "152px",
        showMode: 1,
        autoAdvance: false,
        selectable: false,
        slideInterval: 3000,
        transitionSpeed: 1500,
        shuffle: false,
        startSlideIndex: 0, //0-based
        pauseOnHover: true,
        initSliderByCallingInitFunc: false,
        rightGap: 0,
        keyboardNav: true,
        mousewheelNav: false,
        before: null,
        license: "mylicense"
    };

    var mcThumbnailSlider = new ThumbnailSlider(thumbnailSliderOptions);








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
