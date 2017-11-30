function showWordContainer() {
  chrome.runtime.sendMessage({
    word: true
  },(response) => {
    console.log('getword', response);
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {show: response});
    });
  });
}
function showHistoryContainer() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {history: true});
  });
}
console.log('test');
document.getElementById('word-still-learning').addEventListener('click', showWordContainer);
document.getElementById('word-show-history').addEventListener('click', showHistoryContainer);
document.getElementById('word-kong-version').innerText = 'Version:' + defaultSetting.version;