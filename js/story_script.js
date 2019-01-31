
window.onload = function() {
    
    /**************************** LOAD DATA FROM TEMPORARY JSON DATABASE ****************************/

    var whichStory = "story_2"; // the ID of the story in the JSON file
    var currStoryData = null;
    var numOfPages = 0;
    var currPage = 0;
    var languages = [];
    var chosenLanguage = "";
    var signLanguages = ['FSL: Luzon', 'FSL: Visayas', 'FSL: Mindanao']; // placeholder for now
    var chosenSignLanguage = "FSL: Luzon";
    loadStory(whichStory);

    // Load JSON file for one story
    function loadStory(storyId) {
        if (window.XMLHttpRequest) {
            var xmlhttp = new XMLHttpRequest();
            var dataUrl = 'text/' + whichStory + '.json';
            xmlhttp.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    // Save story and parse title and first page
                    currStoryData = JSON.parse(this.responseText);
                    languages = parseLanguageChoices();
                    chosenLanguage = languages[0]; // placeholder, user will set later
                    numOfPages = Object.keys(currStoryData.languages[chosenLanguage]).length;  // -1 due to title 
                    parseTitle();
                    parsePage(currPage);
                    createSlider();
                    bindArrowListener();
                    bindVideoHoverListener();
                    bindChangeLanguages();
                    setupCarousel();
                    setupFullScreen();
                    bindMenuButtons();
                }
            };
            xmlhttp.open("GET", dataUrl);
            xmlhttp.send();
        }
    }

    /**************************** PARSE DATA INTO HTML ELEMENTS ****************************/

    // Get title from JSON data
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
        // Set the picture component
        var picComponent = document.getElementsByClassName('component')[0];
        picComponent.src = 'img/' + whichStory + '/' + pageNum + '.png';
        // Set the video component according to language
        var chosenSignLanguageFormatted = chosenSignLanguage.replace(": ", "_").toLowerCase();
        var vidPath = 'videos/' + whichStory + '/' + chosenSignLanguageFormatted + '/' + pageNum + '.mp4';
        vidComponent = document.getElementsByClassName('component')[1];
        vidComponent.src = vidPath;

        // Set the glossary component according to chosen language, first removing current text
        storyText = document.getElementById('storyText');
        while (storyText.firstChild) {
            storyText.removeChild(storyText.firstChild);
        }

        // Add video and picture to first row of text component
        var textComponent = document.getElementsByClassName('parent')[2]; // third parent
        var textVid = textComponent.getElementsByTagName('video')[0];
        var textPic = textComponent.getElementsByTagName('img')[0];
        textPicPath = 'img/' + whichStory + '/' + pageNum + '.png';
        textVid.src = vidPath;
        textPic.src = textPicPath;

        // Add glossary
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
                    .on('click', function() {
                        // Change out picture
                        textPic.src = 'img/glossary/' + text.toLowerCase() + '.png';
                        // Loop video if timestamp is provided
                        if (timestamp.length > 0) {
                            playVideoInterval(timestamp[0], timestamp[1]);
                        }
                    });
            } else {
                // If the phrase contains no time stamp, add it as plain text
                $('<span></span>')
                    .appendTo('#storyText')
                    .text(text);
            }
        });

        // Set event listener to component so that if user clicks anywhere and it is not glossary word, the video will stop looping
        $('.panel').on('click', function(e) {
            if (!e.target.classList.contains('glossary')) {
                // If video is playing, pause it and reset
                if (!$('#glossaryVid')[0].paused) {
                    $('#glossaryVid')[0].pause();
                    $('#glossaryVid')[0].currentTime = 0;
                }
                
                // If picture is a glossary pic, return it to story pic
                if (textPic.src != textPicPath) {
                    textPic.src = textPicPath;
                }
            }
        })
    }

    /**************************** SPECIFY SOME HELPER FUNCTIONS ****************************/

    // Loops video at given time interval (in seconds)
    function playVideoInterval(start, end) {
        video = document.getElementById('glossaryVid');

        $(video).attr({
            start: start,
            end: end
        });
        $(video).data('loop', true);
        video.currentTime = $(video).attr('start');
        video.addEventListener('timeupdate', loop);
        video.play();

        function loop() {
            if (this.currentTime >= $(video).attr('end') && $(video).data('loop')) {
                video.currentTime = $(video).attr('start');
            }
        }
    }

    // Resizes story text (which varies from page to page) to always fit within the constant sized div
    $.fn.resizeText = function(options) {
        var settings = $.extend({ maxfont: 40, minfont: 15 }, options);

        var style = $('<style>').html('.nodelays ' +
        '{ ' +
            '-moz-transition: none !important; ' +
            '-webkit-transition: none !important;' +
            '-o-transition: none !important; ' +
            'transition: none !important;' +
        '}');

        function shrink(el, fontsize, minfontsize) {
            if (fontsize < minfontsize) {
                return;
            }
            el.style.fontSize = fontsize + 'px';
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

    // Bind event handler to menu buttons to show text 
    function bindMenuButtons() {
        // Get all menu buttons
        var menuBtns = document.getElementsByClassName('menuBtn');
        // Get the description element
        var description = document.getElementById('btnDesc');
        // For each menu button
        for (var i = 0; i < menuBtns.length; i++) {
            // Add an event handler
            menuBtns[i].addEventListener('mouseenter', function(e) {
                thisBtn = this;
                // Delay showing description by 1/2 second (if user is not sure, they will hover longer)
                timerToWaitForUser = window.setTimeout(function(){
                    // Get data for the menu element to use as description
                    description.textContent = thisBtn.getAttribute('data');
                    // Position & show description
                    description.style.visibility = 'visible'; // quickly show then...
                    $(description).css({
                        'left': thisBtn.offsetLeft-(description.offsetWidth-thisBtn.offsetWidth)/2,
                        'opacity': 1
                    });
                }, 500);
            });
            menuBtns[i].addEventListener('mouseleave', function() {
                // Clear timeout
                window.clearTimeout(timerToWaitForUser);
                // Hide btn description
                $(description).css({
                    'visibility': 'hidden',
                    'opacity': 0
                });
            })
        }
    }

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
            $('#slider').slider('value', nextIndex); // (slider has change event handler that will show/hide correct components/arrows)
        }); 

        // Set left arrow to go backward through story
        leftArrow.addEventListener('click', function() {
            var currComponent = ($('#slider').slider('value') - 1) % 3; 
            var lastIndex = (currPage * 3) + currComponent;
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
        var vidEle = document.getElementById('mainVid');

        // When hovering over video element, show overlay
        vidEle.addEventListener('mouseenter', function() {
            // Show video overlay if component has been told to listen for mouseenter
            if (!this.classList.contains('ignore-mouseenter')) {
                $('#videoOverlay').css({
                    display: 'block',
                    height: $(this).parent().height()
                });
                // Pause video
                this.pause();
            }
        });

        // When mouse leaves video overlay
        $('#videoOverlay').on('mouseleave', function() {
            // Hide video overlay
            $('#videoOverlay').css({
                display: 'none'
            });
            // Resume video
            if (!vidEle.ended) {
                vidEle.play();
            }
        });

        $(vidEle).parent().on('mouseleave', function() {
            // Tell component to listen for mouseenter event again
            vidEle.classList.remove('ignore-mouseenter');
        });
        
        // When click replay button
        $('#videoOverlay img').on('click', function() {
            // Tell component to ignore mouseenter event, otherwise 
            // it will pop up the overlay right away again
            vidEle.classList.add('ignore-mouseenter');
            $('#videoOverlay').css({
                display: 'none'
            });
            // Restart video
            vidEle.currentTime = 0;
        });
    }

    // Shows specified component, hiding all other components
    function showThisComponent(id) {
        var components = document.getElementsByClassName('parent');

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

            // If desired component is text, make it fit
            // Set initial size at large so it can be resized down to fit later
            $('#storyText').css('font-size', '40px');
            if (components[id].lastElementChild.firstElementChild == $('#storyText')[0]) {
                $('#storyText').resizeText();
            }
            // NOTE: The text resize occurs here, immediately after the text component is made visible, since the resize function uses scrollHeight and offsetHeight which cannot be calculated if display = none
        } 
    }

    // Returns calculated display value for given element
    function getDisplayValue(element) {
        return element.currentStyle ? element.currentStyle.display : getComputedStyle(element, null).display;
    }

    /**************************** SLIDER BAR ****************************/
    
    // Create slider bar for pagination
    function createSlider() {
        $("#slider").slider({
            min: 1,
            max: numOfPages * 3, 
            step: 0.00001, // smoother 
            change: slideTo, // on manual change
            range: false,
            animate: "slow",
            orientation: 'horizontal',
            create: function(event, ui) { // set ticks
                setSliderTicks(event.target);
            },
            stop: function(event, ui) {
                // Move handle to closest value, since steps are tiny to allow for smoother sliding
                $('#slider').slider('value', Math.round(ui.value)); 
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
            currPage = desiredPage;
            parsePage(currPage); 
        }

        // Check if any arrow should be activated/deactivated
        checkArrows(desiredId + 1);

        // Show the desired component and hide undesired components
        showThisComponent(desiredComponent);
    } 

    // Set tick marks on slider
    function setSliderTicks(){
        var $slider =  $('#slider');
        var max =  $slider.slider("option", "max");    
        var spacing =  100 / (max - 1);

        $slider.find('.tickmark').remove();
        for (var i = 0; i < max ; i+=3) {
            $('<span class="tickmark"></span>').css('left', (spacing * i) +  '%').appendTo($slider); 
         }
    }

    // Let user change language
    function bindChangeLanguages() {
        changeTextLanguage();
        changeSignLanguage();
    }

    // Change language
    function changeTextLanguage() {
        var triggerDiv = document.getElementById('changeTextLang');
        triggerDiv.addEventListener('click', function(e) {
            // Get languages menu 
            var menu = document.getElementById('languages');
            // If it's already showing, hide and exit function
            if ($(menu).css('display') != 'none' && $(menu).attr('type') == 'text') {
                $(menu).attr('type', '');
                $(menu).hide();
                return;
            }
            // Clear it
            $(menu).empty();
            // If cursor leaves menu, close it
            $('.controls').on('mouseleave', function() {
                $(menu).hide();
            });
            // Add languages to menu
            $(menu).attr('type', 'text');
            for (var i in languages) {
                var menuItem = document.createElement('div');
                var text = document.createElement('p');
                text.textContent = languages[i];
                text.style.padding = '10px 20px 20px 20px';
                text.style.margin = '0px';
                menuItem.appendChild(text);
                menuItem.style.display = 'block';
                menuItem.style.height = '100%';
                // Highlight item if current chosen language
                if (languages[i] == chosenLanguage) {
                    menuItem.style.fontWeight = "bold";
                }
                menu.appendChild(menuItem);
                // Bind event listener for user click on menu item
                $(menuItem).on('click', function(e) {
                    // Remove any highlighting all  menu items
                    for (var j = 0; j < menu.children.length; j++) {
                        menu.children[j].style.fontWeight = 'normal';
                    }
                    // Highlight current menu item 
                    e.target.parentNode.style.fontWeight = 'bold';
                    // Get the language choice 
                    chosenLanguage = this.textContent.trim();
                    // Parse page again, with this language
                    parsePage(currPage);
                    // If current component is storyText, resize text 
                    if ($('#storyText').css('display') != 'none') {
                        $('#storyText').resizeText();
                    }
                });
            }
            // Show the menu, positioning it above trigger icon
            $(menu).show();
            $(menu).css({
                'top': -($(menu).height()),
                'left': 0
            });         
        });
    }

    // Change sign language 
    function changeSignLanguage() {
        var triggerDiv = document.getElementById('changeSignLang');
        triggerDiv.addEventListener('click', function(e) {
            // Get languages menu 
            var menu = document.getElementById('languages');
            // If it's already showing, hide and exit function
            if ($(menu).css('display') != 'none' && $(menu).attr('type') == 'sign') {
                $(menu).attr('type', '');
                $(menu).hide();
                return;
            }

            // Clear it
            $(menu).empty();
            // If cursor leaves menu, close it
            $('.controls').on('mouseleave', function() {
                $(menu).hide();
            });

            // Add sign languages to menu
            $(menu).attr('type', 'sign');
            for (var i in signLanguages) {
                var menuItem = document.createElement('div');
                var text = document.createElement('p');
                text.textContent = signLanguages[i];
                text.style.padding = '10px 20px 20px 20px';
                text.style.margin = '0px';
                menuItem.appendChild(text);
                menuItem.style.display = 'block';
                menuItem.style.height = '100%';

                // Highlight item if current chosen language
                if (signLanguages[i] == chosenSignLanguage) {
                    menuItem.style.fontWeight = "bold";
                }

                menu.appendChild(menuItem);

                // Bind event listener for user click on menu item
                $(menuItem).on('click', function(e) {
                    // Remove any highlighting all menu items
                    for (var j = 0; j < menu.children.length; j++) {
                        menu.children[j].style.fontWeight = 'normal';
                    }
                    // Highlight current menu item 
                    e.target.parentNode.style.fontWeight = 'bold';
                    // Get the language choice 
                    chosenSignLanguage = this.textContent.trim();
                    // Parse page again for the new sign language
                    parsePage(currPage);
                    // If current component is video, start it
                    var mainVid = document.getElementById('mainVid');
                    if (mainVid.parentNode.style.display != 'none') {

                        mainVid.play();
                    }
                });
            }

            // Show the menu, positioning it above trigger icon
            $(menu).show();
            $(menu).css({
                'top': -($(menu).height()),
                'left': '15%'
            });  
        });    
    }

    /**************************** THUMBNAIL CAROUSEL ****************************/

    // Set up the thumbnail carousel
    function setupCarousel() {
        $(".regular").slick({
            dots: true,
            infinite: true,
            slidesToShow: 3,
            slidesToScroll: 3
        });
    }

    /**************************** FULL SCREEN ****************************/
    
    // Set up full screen 
    function setupFullScreen() {
        // If browser enables Fullscreen API
        if (document.fullscreenEnabled ||
            document.webkitFullscreenEnabled ||
            document.mozFullScreenEnabled ||
            document.msFullscreenEnabled) {

            // Get the full screen icon
            var trigger = document.getElementById('fullscreenTrigger');
            // Get full screen trigger
            var panel = document.getElementsByClassName('panel')[0];
            
            // Toggle fullscreen on click of trigger
            trigger.addEventListener('click', function() {
                // If not full screen, go fullscreen
                if (!document.fullscreenElement && 
                    !document.webkitFullscreenElement &&
                    !document.mozFullScreenElement &&
                    !document.msFullscreenElement) {

                    if (panel.requestFullscreen) {
                        panel.requestFullscreen();
                    } else if (panel.webkitRequestFullscreen) {
                        panel.webkitRequestFullscreen();
                    } else if (panel.mozRequestFullScreen) {
                        panel.mozRequestFullScreen();
                    } else if (panel.msRequestFullscreen) {
                        panel.msRequestFullscreen();
                    } else {
                    }
                } else {
                    // if full screen, exit
                    if (document.exitFullscreen) {
                        document.exitFullscreen();
                    } else if (document.mozCancelFullScreen) {
                        document.mozCancelFullScreen();
                    } else if (document.webkitExitFullscreen) {
                        document.webkitExitFullscreen();
                    }
                }
            });

            // When going fullscreen or exiting fullscreen,
            $(document).on('webkitfullscreenchange mozfullscreenchange fullscreenchange', function(e) {
                // Change trigger icon 
                $(trigger).find('i').toggle();
                $(trigger).find('img').toggle();
            });

        } else {
            // If browser doesn't have the API, make only movie fullscreen
        }
    }

}
