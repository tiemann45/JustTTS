// Copyright (c) 2018 Zhigang Wang. All rights reserved.
// Use of this source code is governed by a BSD-style license that can
// be found in the LICENSE files.
function populateData() {
    if(typeof speechSynthesis === 'undefined') {
        return;
    }

    // Fetch saved setting
    var savedVoiceName = localStorage["JustTTS_VoiceName"];
    if (!savedVoiceName)
	savedVoiceName = "Unknown";

    var savedRate = localStorage["JustTTS_Rate"];
    if (!savedRate)
	savedRate = 1.0;

    var savedAutoSelect = localStorage["JustTTS_AutoSelect"];
    if ("savedAutoSelect" == undefined){
	savedAutoSelect = false;
    }
    // Update UI
    var voiceSelect = document.getElementById("voiceSelect");
    var voices = speechSynthesis.getVoices();
    if (voices.length > 0 && voiceSelect.options.length == 0) {
	for (var i=0;i< voices.length;i++) {
	    var option = document.createElement('option');
	    option.textContent = voices[i].name;
	    option.value = voices[i].lang;
	    if (option.textContent === savedVoiceName ||
		(savedVoiceName === "Unknown" && option.value === "en-US"))
		option.selected = "true";
	    voiceSelect.appendChild(option);
	}
    }
    document.getElementById('rate').value = savedRate;
    document.getElementById('autoSelect').checked = (savedAutoSelect === 'true');
}

function saveData() {
    var voiceSelect = document.getElementById("voiceSelect");
    var rateInput = document.getElementById("rate");
    var autoSelectInput = document.getElementById("autoSelect");
    var message = document.getElementById("message");
    localStorage["JustTTS_VoiceName"] = voiceSelect.children[voiceSelect.selectedIndex].textContent;
    localStorage["JustTTS_Rate"] = rateInput.value;
    localStorage["JustTTS_AutoSelect"] = autoSelectInput.checked;
    message.innerHTML = "Data saved successfully";
    setTimeout(function(){
	message.innerHTML = "";
    }, 5000);
    
}

window.speechSynthesis.onvoiceschanged = function() {
    populateData();
};
document.getElementById('save').onclick = saveData;

