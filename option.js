function onSelectChange(e) {
  e.preventDefault();
  console.log(e.target.value, e.target.id.substring(5));
  if(e.target.value) {
    const obj = {};
    obj[e.target.id.substring(5)] = e.target.value;
    chrome.storage.sync.set({wordKong:obj});
    alert('设置好啦~');
  }
}
const ids = ['dicType', 'frequency', 'autoAudio'];
ids.forEach(item => {
  document.getElementById(`word-${item}`).addEventListener('change', onSelectChange);
});
