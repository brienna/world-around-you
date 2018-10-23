
window.onload = function() {

    /**************************** STORY PAGE SETUP ****************************/
    var pageComponentTracker = 0; // tracks which component is showing (pic, vid, glossary)
    var arrows = document.getElementsByClassName("arrow");
    var leftArrow = arrows[0];
    var rightArrow = arrows[1];
    var pageComponents = document.getElementsByClassName("component"); // may need to change
    
    // Set right arrow to go forward through story
    rightArrow.addEventListener('click', function() {
        // Increment the page component tracker
        pageComponentTracker++;

        if (pageComponentTracker > 2) {
            // Advance to the next page
            console.log("Turning the page...");
            // Reset page component tracker
            pageComponentTracker = 0;
        } else {
            // Replace current component with the next component
            toggleVisibility(pageComponents[pageComponentTracker-1]);
            toggleVisibility(pageComponents[pageComponentTracker]);
        }
    });

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
    })

    // Toggles visibility of passed element
    function toggleVisibility(element) {
        var computedDisplayValue = element.currentStyle ? element.currentStyle.display : getComputedStyle(element, null).display;
        if (computedDisplayValue == "none") {
            element.style.display = "block";
        } else {
            element.style.display = "none";
        }
    }

    /**************************** GLOSSARY ****************************/
    var whichStory = "story_2";
    var glossary = null;
    loadGlossary(whichStory);

    function loadGlossary(storyId) {
        if (window.XMLHttpRequest) {
            console.log("Loading text for " + storyId + "...");
            var xmlhttp = new XMLHttpRequest();
            var dataUrl = 'text/' + whichStory + '.json';
            xmlhttp.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    var storyData = JSON.parse(this.responseText);
                    parseStoryData(storyData);
                }
            };
            xmlhttp.open("GET", dataUrl);
            xmlhttp.send();
        }
    }


    function parseStoryData(data) {
        glossary = data[whichStory].glossary;

        var vid = document.createElement('video');
        vid.setAttribute('class', 'glossaryVid');
        vid.src = 'videos/example.mp4';
        //vid.muted = "muted";
        vid.autoplay = true;

        // Grab time stamps
        glossary.forEach(function(glossaryItem) {
            var timeStamp = glossaryItem.timeStamp;
            var text = glossaryItem.text;

            // If the phrase contains a time stamp, add it as button
            if (timeStamp) {
                $('<span></span>')
                    .addClass('glossaryWord')
                    .appendTo("#storyText")
                    .text(text) // need to fix so that it sets these time stamp onto the trigger & featherlight can read
                    .featherlight($(vid), {
                        afterOpen: playVideoInterval(vid, timeStamp[0], timeStamp[1]),
                        root: 'body',

                    });
            } else {
            // If the phrase contains no time stamp, add it as plain text
                $('<span></span>')
                    .appendTo('#storyText')
                    .text(text);
            }
        });
    }

    // Show featherlight if user clicks on a glossary word
    function playVideoInterval(glossaryVid, start, end) {
        //var glossaryVid = document.getElementsByClassName('glossaryVid')[1];
        glossaryVid.setAttribute('start', start);
        glossaryVid.setAttribute('end', end);
        $(glossaryVid).data('loop', true);
        glossaryVid.setAttribute('currentTime', $(glossaryVid).attr('start'));
        $(glossaryVid).on('timeupdate', loop);
        $(glossaryVid)[0].play();
        console.log($(glossaryVid)[0]);

        function loop() {
            if ($(this).attr('currentTime') >= $(glossaryVid).attr('end') && $(glossaryVid).data('loop')) {
                $(glossaryVid).attr('currentTime', $(glossaryVid).attr('start'));
            }
        }
    } 

}
