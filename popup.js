function showWordContainer(e) {
  _gaq.push(['_trackEvent', e.target.id, 'clicked']);
  chrome.runtime.sendMessage({
    word: -1
  },(response) => {
    console.log('getword', response);
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {popup: response});
    });
  });
}
function showHistoryContainer(e) {
  _gaq.push(['_trackEvent', e.target.id, 'clicked']);
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {history: true});
  });
}
function openOptionsPage(e) {
  _gaq.push(['_trackEvent', e.target.id, 'clicked']);
  chrome.runtime.openOptionsPage();
}
(() =>{
  document.getElementById('word-still-learning').addEventListener('click', showWordContainer);
  document.getElementById('word-show-history').addEventListener('click', showHistoryContainer);
  document.getElementById('word-show-option').addEventListener('click', openOptionsPage);
  document.getElementById('word-kong-version').innerHTML = 'Version:' + defaultSetting.version;
})();
