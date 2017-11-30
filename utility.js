const defaultSetting = {
  frequency: 25,  //弹窗频率
  dicType: 'CET6', //词库类型
  autoAudio: 0, //自动发音
  current: 0, //当前单词
  history: [], //单词背诵历史
  version: '0.2.1' //单词控版本
};
const setting = defaultSetting;

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
        message: message,  //true 为正常学习单词， false 为只查看单词
      });
    }
  );
}