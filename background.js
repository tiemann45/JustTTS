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

async function speak(textToSpeak, language, rate) {
    var convertedText = convertChinesePunctuation(textToSpeak);
    sentences = convertedText.split(/[.!?:]+/);
    
    var u = new SpeechSynthesisUtterance();
    u.lang = language; 
    u.rate = rate;
    for (var i=0;i< sentences.length;i++) {
	u.text = sentences[i]; 
	//console.log(u.text);
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
