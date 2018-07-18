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
		    "“":"",
		    "\"":"",
		    "\'":"",
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

    var div = document.createElement('DIV'); 
    div.setAttribute('id', 'JustTTS_CC'); 
    div.setAttribute('style','background-color:#3cba54; color:#FFFFFF; position:absolute;width:250px;height:106px;margin:auto;max-width:100%;max-height:100%;overflow:auto;cursor: move;z-index:1000;opacity: 0.9;');
    document.body.appendChild(div); 
    div.style.top = ccTop;
    div.style.left = ccLeft;

    var selection = window.getSelection().toString();
    div.innerHTML = "<table><tr height='64px'><td><label id='JustTTS_CC_Sentence'>&nbsp;</label></td></tr><tr height='32px'><td>\
    <img id='JustTTS_CC_Stop'/> \
    <img id='JustTTS_CC_PausePlay'/> \
    <img id='JustTTS_CC_Prev'/> \
    <img id='JustTTS_CC_Next' border='1px' border-color='Black'/> \
    <img id='JustTTS_CC_Repeat'/></td></tr></table>";

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
    if (cc !== null) 
        cc.innerHTML = text;
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
async function speak(textToSpeak, language, rate) {
    var convertedText = convertChinesePunctuation(textToSpeak);
    sentences = convertedText.split(/[.,!?:]+/).filter((x) => x.length > 0);  
    numSentences = sentences.length;
    var u = new SpeechSynthesisUtterance();
    u.lang = language; 
    u.rate = rate;
    initCC();
    for (index=0;index< sentences.length;) {
	// Update button status
	updateButtonStatus();
	// To speak
	u.text = sentences[index];
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


// main()


selection = window.getSelection().toString();
if (selection.length > 0) {
    speak(selection, savedLanguage, savedRate);
}

// https://icon-icons.com/pack/Music-Player-Controls-Blue-Icons/1134
