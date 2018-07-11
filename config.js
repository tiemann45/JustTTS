// Copyright (c) 2018 Zhigang Wang. All rights reserved.
// Use of this source code is governed by a BSD-style license that can
// be found in the LICENSE files.
const languages = {
"Google Deutsch":"de-DE",
"Google US English":"en-US",
"Google UK English Female":"en-GB",
"Google español":"es-ES",
"Google español de Estados Unidos":"es-US",
"Google français":"fr-FR",
"Google हिन्दी":"hi-IN",
"Google Bahasa Indonesia":"id-ID",
"Google italiano":"it-IT",
"Google 日本語":"ja-JP",
"Google 한국의":"ko-KR",
"Google Nederlands":"nl-NL",
"Google polski":"pl-PL",
"Google português do Brasil":"pt-BR",
"Google русский":"ru-RU",
"Google 普通话（中国大陆）":"zh-CN",
"Google 粤語（香港）":"zh-HK",
"Google 國語（臺灣）":"zh-TW"};

function populateData() {
    if(typeof speechSynthesis === 'undefined') {
        return;
    }

    // Fetch saved setting
    var savedLanguage = localStorage["JustTTS_Lang"];
    if (!savedLanguage)
	savedLanguage = "en-US";

    var savedRate = localStorage["JustTTS_Rate"];
    if (!savedRate)
	savedRate = 1.0;

    var voiceSelect = document.getElementById("voiceSelect");
    var voices = speechSynthesis.getVoices();
    if (voices.length > 0) {
	for (var i=0;i< voices.length;i++) {
	    var option = document.createElement('option');
	    option.textContent = voices[i].name + ' (' + voices[i].lang + ')';
	    option.value = voices[i].lang;
	    if (option.value === savedLanguage)
		option.selected = "true";
	    voiceSelect.appendChild(option);
	}
    } else {
	for (const [key, value] of Object.entries(languages)) {
    	    var option = document.createElement('option');
    	    option.textContent = key + ' (' + value + ')';
    	    option.value = value;
    	    if (value === savedLanguage)
    		option.selected = "true";
    	    voiceSelect.appendChild(option);
	}
    }

    document.getElementById('rate').value = savedRate;

}

function saveData() {
    var voiceSelect = document.getElementById("voiceSelect");
    var rateInput = document.getElementById("rate");
    var message = document.getElementById("message");
    localStorage["JustTTS_Lang"] = voiceSelect.children[voiceSelect.selectedIndex].value;
    localStorage["JustTTS_Rate"] = rateInput.value;
    message.innerHTML = "Data saved successfully";
    setTimeout(function(){
	message.innerHTML = "";
    }, 5000);
    
}
populateData();
document.getElementById('save').onclick = saveData;

