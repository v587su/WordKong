const defaultSetting = {
  frequency: 25,  //弹窗频率
  dicType: 'CET6', //词库类型 CET6\CET4\NETEM
  autoAudio: 0, //自动发音
  current: 0, //当前单词
  history: [], //单词背诵历史
  version: '0.2.1', //单词控版本
  analysis: {}, //数据分析
};

const text = {
  installWelcomeTitle: '欢迎使用单词控！',
  installWelcomeContent: '这是一个用较为诡异的方式督促你背单词的拓展！目前默认的词库是英语六级, 不要忘了去设置一下你想背的词库哟！ヾ(o◕∀◕)ﾉ',
  updateWelcomeTitle: '单词控更新啦！',
  updateWelcomeContent: '本次更新的内容有：巴拉巴拉',
  updateConfirm: '这里有两种下载方式：第一种是直接下载crx格式插件，但chrome对插件的来源要求比较严格，可能会出现插件失效的情况；第二种就是科学上网到chrome的插件商店下载（没错，单词控在chrome商店上线了）。总之！想直接下载请点确定，科学上网的同学点取消！',
};

const url = {
  version: 'http://123.207.243.143:3000/version',
  download: 'http://123.207.243.143:3000/download',
  chromeStore: 'https://chrome.google.com/webstore/detail/%E5%8D%95%E8%AF%8D%E6%8E%A7/nijnjokmkipjmpaplbkkimkfhggeleci?hl=zh-CN'
};

const setting = defaultSetting;

//载入储存内容setting
chrome.storage.sync.get('wordKong', function(items) {
  console.log(items);
  if(items.wordKong.version) {
    if(items.wordKong.version === defaultSetting.version) {
      Object.assign(setting, items.wordKong);
      console.log('载入后',setting);
    }
  } else if(!items.wordKong) {
    chrome.storage.sync.set({wordKong:setting});
    console.log('初始化',setting);
  }
});

//监听储存变化
chrome.storage.onChanged.addListener(function (changes) {
  if(changes.wordKong.newValue) {
    Object.assign(setting, changes.wordKong.newValue);
  }
  console.log(setting);
});

function promiseAjax(method, url, data) {
  const promise = new Promise(function (resolve, reject) {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    xhr.responseType = "json";
    xhr.setRequestHeader("Accept", "application/json");
    xhr.onreadystatechange = function () {
      if (this.readyState !== 4) {
        return;
      }
      if(this.status === 200) {
        resolve(this.response);
      } else {
        reject(new Error(this.statusText));
      }
    };
    xhr.send(data);
  });
  return promise;
}

function Shanbei(){
  const self = this;
  self.url = {
    word: (word) => (
      `https://api.shanbay.com/bdc/search/?word=${word}`
    ),
    example: (wordId) => (
      `https://api.shanbay.com/bdc/example/?vocabulary_id=${wordId}`
    )
  };
  self.search = function(word) {
    return promiseAjax('GET', self.url.word(word)).then(
      function (response) {
        console.log('扇贝api的search方法单词查询成功', response);
        return response.data;
      }
    ).then(function(word){
      return promiseAjax('GET', self.url.example(word.content_id)).then(
        function (response) {
          console.log('扇贝api的search方法例句查询成功', response);
          return Object.assign({}, word, { example: response.data});
        }
      )
    }).catch(function (error) {
      console.log('扇贝api的search方法错误', error);
    });
  }
}

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
      return Object.assign({}, response, {
        index: index,
        dicType: setting.dicType,
        message: message,  // -1 为正常学习单词， >0 为只查看对应单词
      });
    }
  );
}