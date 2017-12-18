const api = new Shanbei();

//初次安装或更新
chrome.runtime.onInstalled.addListener(
  function (details) {
    if(details.reason === 'install') {
      showNotification({
        title: text.installWelcomeTitle,
        content: text.installWelcomeContent
      });
    } else if (details.reason === 'update') {
      showNotification({
        title: text.updateWelcomeTitle,
        content: text.updateWelcomeContent
      });
    }
  }
);

//监听器
chrome.runtime.onMessage.addListener(
  (message, sender,  sendResponse) => {
    console.log("on message", message, sender);
    //获取单词的监听器
    const check = sender.url.length < setting.frequency || sender.url.includes('chrome-extension');
    if(message.word > -10 && check) {
      console.log('run getWord');
      getWord(message.word).then(function (word) {
        sendResponse(word);
      });
      if(message.word === -1) {
        const nextCurrent = Math.round(Math.random() * wordArray[setting.dicType].length);
        chrome.storage.sync.set({wordKong:Object.assign(setting, {current: nextCurrent})});
      }
    }
    //修改历史的监听器
    if(message.history) {
      console.log('run setHistory');
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

//版本检查
promiseAjax('get', url.version).then(response => {
  if(response.version) {
    if(response.version !== setting.version) {
      showNotification({
        title: '单词控有新的更新啦~',
        content: `单词控最新的版本是${response.version}，而你的是${setting.version}。快快点我更新，看看又加了什么炒鸡酷炫的功能！_(:з」∠)_`
      }, () => {
        const method = confirm(text.updateConfirm);
        if(method) {
          window.open(url.download);
        } else {
          window.open(url.chromeStore);
        }
      })
    }
  }
});

