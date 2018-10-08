
// Once the HTML has loaded, proceed with script
$(document).ready(function() {
    // Get HTML elements we need
    var video = document.getElementById('glossaryVideo');
    var storyVideo = document.getElementById('storyVideo');

    /**************************** LOAD STORY VIDEO PAGE ****************************/
    var whichStory = "story1";
    var glossary = null;
    loadGlossary(whichStory);

    function loadGlossary(storyId) {
        if (window.XMLHttpRequest) {
            console.log("Loading text for " + storyId + "...");
            var xmlhttp = new XMLHttpRequest();
            var dataUrl = whichStory + '.json';
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
        var glossary = data.vid1.glossary;

        // Grab time stamps
        glossary.forEach(function(glossaryItem) {
            var timeStamp = glossaryItem.timeStamp;
            var text = glossaryItem.text;

            // If the phrase contains a time stamp, add it as button
            if (timeStamp) {
                $('<span></span>')
                    .addClass('glossaryWord')
                    .appendTo("#storyText")
                    .text(text)
                    // Bind time stamp to video
                    .click(function() {
                        playVideoInterval(timeStamp[0], timeStamp[1]);
                    });
            } else {
            // If the phrase contains no time stamp, add it as plain text
                $('<span></span>')
                    .appendTo('#storyText')
                    .text(text);
            }
        }); 
    } 

    function playVideoInterval(start, end) {
        $(video).attr({
            start: start,
            end: end});
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

    $(document).on('click', function(event) {
        // If video is playing, pause it
        if ($(event.target).attr('class') != 'glossaryWord') {
            if ($(video).data('loop')) {
                $(video).data('loop', false);
                video.pause();
            }
        } 
    });  

    /**************************** INTERACTIVE TRANSCRIPT ****************************/
    // NOTE Adopt video.js for more advanced controls, eg removing volume button
    var trackElements = document.querySelectorAll('track');
    var transcript = document.getElementById('transcript');

    // For each track element
    for (var i = 0; i < trackElements.length; i++) {
        trackElements[i].addEventListener('load', function() {
            var textTrack = this.track; // HTMLTrackElement
            var isSubtitles = textTrack.kind === "subtitles"; 
            for (var j = 0; j < textTrack.cues.length; ++j) {
                var cue = textTrack.cues[j];

                // Build build transcript div
                var subtitleSpan = document.createElement('span');
                subtitleSpan.textContent = cue.text + " ";
                subtitleSpan.className += " subtitleSpan";
                transcript.appendChild(subtitleSpan);
            }

            // Handle event when the subtitle appears
            textTrack.oncuechange = function() {
                // "this" refers to textTrack
                var activeSubtitle;
                var activeCue;
                if (this.activeCues.length > 0) {
                    activeCue = this.activeCues[0];
                    activeSubtitle = activeCue.text.trim();
                } 
                subtitleSpans = document.getElementsByClassName('subtitleSpan');
                for (var k = 0; k < subtitleSpans.length; k++) {                       
                    subtitleSpanText = subtitleSpans.item(k).textContent.trim();
                    if (subtitleSpanText === activeSubtitle) {
                        subtitleSpans.item(k).style.backgroundColor = "orange";
                    } else {
                        subtitleSpans.item(k).style.backgroundColor = "";
                    }
                }
            };
        });

    }

});

