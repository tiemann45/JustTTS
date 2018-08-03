// Copyright (c) 2018 Zhigang Wang. All rights reserved.
// Use of this source code is governed by a BSD-style license that can
// be found in the LICENSE files.

// Constants

// Utilities
String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function convertChinesePunctuation(text) {
    punctuations = {"。":".",
		    "，":",",
		    "！":"!",
		    "？":"?",
		    "：":":",
		    "；":";",
		    "“":"",
		    "\"":"",
		    //"\'":"",
		    "”":"",
		    "\"":"",
		    "\n":",",
		    "、":","
		   };
    var res = text;
    for (const [key, value] of Object.entries(punctuations)) 
	res = res.replaceAll(key, value);
    return res;
}

function selectElement(element) {
    //Before we copy, we are going to select the text.
    var text = document.getElementById(element);
    var selection = window.getSelection();
    var range = document.createRange();
    range.selectNodeContents(text);
    selection.removeAllRanges();
    selection.addRange(range);
}

// Global Variables
var sentences = [];
var index = -1;
var numSentences = -1;
var state = 'play';

function initCC(){
    if (window.getSelection().rangeCount == 0)
	return;
    var r=window.getSelection().getRangeAt(0).getBoundingClientRect();
    var relative=document.body.parentNode.getBoundingClientRect();
    var ccTop = (r.bottom -relative.top)+'px';
    var ccLeft = (r.left - relative.left)+'px';

    var div = document.createElement('SPAN'); 
    div.setAttribute('id', 'JustTTS_CC');
    div.setAttribute('padding','0');
    div.setAttribute('style',
		     'all:unset;background-color:#3cba54; color:#FFFFFF; position:absolute;width:400px;height:122px;margin:auto;max-width:100%;max-height:100%;overflow:auto;z-index:1000;opacity: 0.9;border-radius: 10px;padding:10px');
    document.body.appendChild(div); 
    div.style.top = ccTop;
    div.style.left = ccLeft;

    var selection = window.getSelection().toString();
    div.innerHTML = "<table width=400px height=122px style='all:unset;border-width:0px;border-spacing:0px;width:400px;height:122px;display:grid'>\
    <tbody style='all:unset;'>\
    <tr style='all: unset;height:90px;display:grid'>\
        <td style='all:unset;'><div style='all:unset; overflow:auto'><label id='JustTTS_CC_Sentence' style='all:unset;font-size:1.25em;font-family:Helvetica;'>&nbsp;</label></div></td>\
    </tr>\
    <tr  style='all: unset;height:32px;display:grid'>\
        <td style='all: unset;height:32px '>\
            <img id='JustTTS_CC_Stop' style='all:unset;display:inline; height:auto; width:auto'/> \
	    <img id='JustTTS_CC_PausePlay' style='all:unset;display:inline; height:auto; width:auto'/> \
	    <img id='JustTTS_CC_Prev' style='all:unset;display:inline; height:auto; width:auto'/> \
	    <img id='JustTTS_CC_Next' style='all:unset;display:inline; height:auto; width:auto'/> \
	    <img id='JustTTS_CC_Repeat' style='all:unset;display:inline; height:auto; width:auto'/>\
        </td>\
    </tr>\
    </tbody>\
</table>";
    // Controls
    var imgPrev = chrome.extension.getURL("img/Prev32.png");
    var btnPrev = document.getElementById('JustTTS_CC_Prev');
    btnPrev.src = imgPrev;
    btnPrev.addEventListener('click', function() {
	if (state === "pause") {
	    index--;
	    state = "playone";
	}
    });

    var imgNext = chrome.extension.getURL("img/Next32.png");
    var btnNext = document.getElementById('JustTTS_CC_Next');
    btnNext.src = imgNext;
    btnNext.addEventListener('click', function() {
	if (state === "pause") {
	    index++;
	    state = "playone";
	}
    });

    var imgPause = chrome.extension.getURL("img/Pause32.png");
    var imgPlay = chrome.extension.getURL("img/Play32.png");
    var btnPausePlay = document.getElementById('JustTTS_CC_PausePlay');
    btnPausePlay.src = imgPause;
    btnPausePlay.addEventListener('click', function() {
	if (state === "play") {
	    state = "pause";
	    btnPausePlay.src = imgPlay;
	} else {
	    state = "play";
	    btnPausePlay.src = imgPause;
	}
    });

    var imgRepeat = chrome.extension.getURL("img/Repeat32.png");
    var btnRepeat = document.getElementById('JustTTS_CC_Repeat');
    btnRepeat.src = imgRepeat;
    btnRepeat.addEventListener('click', function() {
	if (state === "pause") {
	    state = "playone";
	}
    });

    var imgStop = chrome.extension.getURL("img/Stop32.png");
    var btnStop = document.getElementById('JustTTS_CC_Stop');
    btnStop.src = imgStop;
    btnStop.addEventListener('click', function() {
	// Play the last sentence
	state = "play";
	index = numSentences;
    });
}

function closeCC() {
    var cc = document.getElementById('JustTTS_CC'); 
    if (cc !== null) 
        cc.parentNode.removeChild(cc);
}

function setCC(text) {
    var cc = document.getElementById('JustTTS_CC_Sentence'); 
    if (cc !== null) { 
        cc.innerHTML = text;
	if (savedAutoSelect){
            selectElement('JustTTS_CC_Sentence'); 
	}
    }
}

function msg(m) {
    alert(m);
}

function updateButtonStatus() {
    var btnPrev = document.getElementById('JustTTS_CC_Prev');
    var btnNext = document.getElementById('JustTTS_CC_Next');
    var btnRepeat = document.getElementById('JustTTS_CC_Repeat');
    btnPrev.style.visibility = (state !== "play" && index > 0 ? "visible" : "hidden");
    btnNext.style.visibility = (state !== "play" && index < (numSentences - 1) ? "visible" : "hidden");
    btnRepeat.style.visibility = (state === "play" ? "hidden" : "visible");
}

async function speak(textToSpeak, voice, rate) {
    // Convert Chinese punctuations
    var convertedText = convertChinesePunctuation(textToSpeak);
    // Preserve numeric period and comma
    convertedText = convertedText.replace(/\.(\d+)/g,'<period>$1');
    convertedText = convertedText.replace(/\,(\d+)/g,'<comma>$1');
    // Split into sentences
    sentences = convertedText.split(/[.,!?:;]+/).filter((x) => x.length > 0);  
    numSentences = sentences.length;
    var u = new SpeechSynthesisUtterance();
    u.voice = voice; 
    u.rate = rate;
    initCC();
    for (index=0;index< sentences.length;) {
	// Update button status
	updateButtonStatus();
	// To speak
	u.text = sentences[index].replace(/<period>/g,'.').replace(/<comma>/g,','); // Restore numeric period and comma
	setCC(u.text);
	speechSynthesis.speak(u);

	// Wait until finish
	while(true) {
	    await sleep(100);
	    if (speechSynthesis.speaking === false) {
		await sleep(100);
		break;
	    }
	}

	// Check state
	if (state === "play")
	    index++;
	else if (state === "pause") {
	    updateButtonStatus();
	    while(true) {
		await sleep(100);
		if (state !== "pause") {
		    break;
		}
	    }
	    if (state === "play")
		index++;
	    else if (state === "playone")
		state = "pause"; // Play one then pause
	} if (state === "playone")
	    state = "pause";
    }
    closeCC();
}



async function readSelection() {
    selection = window.getSelection().toString();
    if (selection.length > 0) {
	var savedVoice = null;
	var tryCount = 0;
	while(savedVoice === null && tryCount++ < 30) {
	    await sleep(100);
	    var voices = speechSynthesis.getVoices();
	    if (voices.length > 0 && savedVoice === null) {
		for (var i=0;i< voices.length;i++) {
		    if (voices[i].name === savedVoiceName ||
			(savedVoiceName === "Unknown" && voices[i].lang === "en-US")) {
			savedVoice = voices[i];
		    }
		}
	    }
	}

	if (savedVoice !== null)
	    speak(selection, savedVoice, savedRate);
	else 
	    msg("No voice available!!!");
    }
}

readSelection();
// https://icon-icons.com/pack/Music-Player-Controls-Blue-Icons/1134
