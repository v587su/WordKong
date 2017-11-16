const defaultSetting = {
  frequency: 25,  //弹窗频率
  dicType: 'CET6', //词库类型
  autoAudio: 0, //自动发音
  current: 0, //当前单词
  history: [] //单词背诵历史
};
const setting = defaultSetting;
chrome.storage.sync.get('wordKong', function(items) {
  console.log(items);
  if(items) {
    Object.assign(setting, items.wordKong);
  } else {
    chrome.storage.sync.set({wordKong:setting});
  }
});

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

