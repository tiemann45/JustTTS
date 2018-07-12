// Copyright (c) 2018 Zhigang Wang. All rights reserved.
// Use of this source code is governed by a BSD-style license that can
// be found in the LICENSE files.

// Constants
const punctuations = {"。":".",
	        "，":",",
		"！":"!",
		"？":"?",
		"：":":",
		"“":"",
		"”":"",
		"\"":"",
		"、":","
	       };

// Utilities
String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function convertChinesePunctuation(text) {
    var res = text;
    for (const [key, value] of Object.entries(punctuations)) 
	res = res.replaceAll(key, value);
    return res;
}

function openCC() {
    var injection = " \
    var div = document.getElementById('JustTTS_CC'); \
    if (div === null) { \
	var div = document.createElement('DIV'); \
	div.setAttribute('id', 'JustTTS_CC'); \
	div.setAttribute('style','background-color:#DDDDDD;width:400px;height:50px;position:absolute;left:0;right:0;top:90%; bottom:10%;margin:auto;max-width:100%;max-height:100%;overflow:auto;cursor: move;z-index:1000'); \
	document.body.appendChild(div); \
} ; ";

    chrome.tabs.executeScript(null, {
	code: injection
    });
    
}

function closeCC() {
    var injection = " \
    var cc = document.getElementById('JustTTS_CC'); \
    if (cc !== null) \
        cc.parentNode.removeChild(cc);";

    chrome.tabs.executeScript(null, {
	code: injection
    });
}

function setCC(text) {
    var injection = " \
    var cc = document.getElementById('JustTTS_CC'); \
    if (cc !== null) \
        cc.innerHTML = '" + text + "'; ";
    
    chrome.tabs.executeScript(null, {
	code: injection
    });
}

async function speak(textToSpeak, language, rate) {
    var convertedText = convertChinesePunctuation(textToSpeak);
    sentences = convertedText.split(/[.,!?:]+/);
    
    var u = new SpeechSynthesisUtterance();
    u.lang = language; 
    u.rate = rate;
    openCC();
    for (var i=0;i< sentences.length;i++) {
	u.text = sentences[i];
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
    }
    closeCC();

}

// Event Handler
chrome.browserAction.onClicked.addListener(function(tab) {
    if (typeof speechSynthesis !== 'undefined' && speechSynthesis.onvoiceschanged !== undefined) {
	chrome.tabs.executeScript( {
	    code: "window.getSelection().toString();"
	}, function(selection) {
	    if (selection.length > 0) {
		// Fetch saved setting
		var savedLanguage = localStorage["JustTTS_Lang"];
		if (!savedLanguage)
		    savedLanguage = "en-US";

		var savedRate = localStorage["JustTTS_Rate"];
		if (!savedRate)
		    savedRate = 1.0;

		speak(selection[0], savedLanguage, savedRate);
	    }
	});
    } else {
	window.alert("Chrome speech synthesis is not available!!!");
    }
});
