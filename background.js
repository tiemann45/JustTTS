// Copyright (c) 2018 Zhigang Wang. All rights reserved.
// Use of this source code is governed by a BSD-style license that can
// be found in the LICENSE files.

chrome.browserAction.onClicked.addListener(function(tab) {
    // Fetch saved setting
    var savedVoiceName = localStorage["JustTTS_VoiceName"];
    if (!savedVoiceName)
	savedVoiceName = "Unknown";

    var savedRate = localStorage["JustTTS_Rate"];
    if (!savedRate)
	savedRate = 1.0;

    chrome.tabs.executeScript(tab.id, {
	code: 'var savedVoiceName = "'+savedVoiceName+'"; var savedRate='+savedRate+';'
    }, function() {
        chrome.tabs.executeScript(tab.id, {'file': 'createPopup.js'}, function callBackStub(){})
    });
});
