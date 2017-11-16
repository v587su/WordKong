const api = new Shanbei();

function showNotification(note, onClick = function(){}) {
  if (!Notification) {
    console.log('no Notification');
    return;
  }
  console.log(Notification.permission);
  let permission = Notification.permission;
  if (permission === 'granted') {
    const notification = new Notification(
      note.title || "单词控",
      {
        body: note.content,
        icon: note.icon || chrome.extension.getURL("asset/pic3.jpg")
      }
    );
    notification.onclick = () => onClick(note.word);
  } else {
    Notification.requestPermission();
    showNotification(note, onClick);
  }
}

function getWord(index) {
  console.log(index);
  const content = wordArray[setting.dicType][index];
  return api.search(content.substring(1)).then(
    function (response) {
      const word = Object.assign({}, response, {
        index: index,
        showTime: 0,
        passTime: 0,
      });
      console.log('word', word);
      return word;
    }
  );
}

chrome.runtime.onInstalled.addListener(
  function () {
    console.log("installed");
    showNotification({
      title: '欢迎使用单词控！',
      content: '这是一个用较为诡异的方式督促你背单词的拓展！目前默认的词库是英语六级, 不要忘了去设置一下你想背的词库哟！ヾ(o◕∀◕)ﾉ'
    });
  }
);


chrome.runtime.onMessage.addListener(
  (message, sender,  sendResponse) => {
    console.log("on message", message, sender);
    //获取单词的监听器
    const check = sender.url.length < setting.frequency || sender.url.includes('chrome-extension');
    if(message.word && check) {
      getWord(setting.current).then(function (word) {
        sendResponse(word);
      });
      const nextCurrent = Math.round(Math.random() * wordArray[setting.dicType].length);
      chrome.storage.sync.set({wordKong:Object.assign(setting, {current: nextCurrent})});
    }
    //修改历史的监听器
    if(message.history) {
      const nextHistory = setting.history;
      nextHistory.unshift(message.history);
      if(nextHistory.length > 20) {
        nextHistory.pop();
      }
      chrome.storage.sync.set({wordKong:Object.assign(setting, {history: nextHistory})});
    }
    return true;
  }
);



