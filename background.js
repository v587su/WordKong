const api = new Shanbei();

function showNotification(note, onClick = function(){}) {
  if (!Notification) {
    console.log('no Notification');
    return;
  }
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

function getWord(message) {
  console.log('getWord', message);
  const index = message === -1 ? setting.current : message;
  const content = wordArray[setting.dicType][index];
  return api.search(content.substring(1)).then(
    function (response) {
      const word = Object.assign({}, response, {
        index: index,
        message: message,  //true 为正常学习单词， false 为只查看单词
      });
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


promiseAjax('get', 'http://123.207.243.143:3000/version').then(response => {
  if(response.version) {
    if(response.version !== setting.version) {
      showNotification({
        title: '单词控有新的更新啦~',
        content: `单词控最新的版本是${response.version}，而你的是${setting.version}。快快点我更新，看看又加了什么炒鸡酷炫的功能！_(:з」∠)_`
      }, () => {
        const method = confirm('这里有两种下载方式：第一种是直接下载crx格式插件，但chrome对插件的来源要求比较严格，可能会出现插件失效的情况；第二种就是科学上网到chrome的插件商店下载（没错，单词控在chrome商店上线了）。总之！想直接下载请点确定，科学上网的同学点取消！');
        if(method) {
          window.open('http://123.207.243.143:3000/download');
        } else {
          window.open('https://chrome.google.com/webstore/detail/%E5%8D%95%E8%AF%8D%E6%8E%A7/nijnjokmkipjmpaplbkkimkfhggeleci?hl=zh-CN');
        }
      })
    }
  }
});

