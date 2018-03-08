(function () {
  const attribute = (item) => {
    const ele = document.createElement(item.type);
    if(item.class) {
      item.class.forEach(name => {
        ele.classList.add(name);
      })
    }
    if(item.content) {
      ele.innerText = item.content;
    }
    if(item.onclick) {
      ele.onclick = item.onclick;
    }
    if(item.id) {
      ele.id = item.id;
    }
    if(item.columns) {
      const tableRow = ele.insertRow(0);
      item.columns.forEach((column, index) => {
        const tableCell = tableRow.insertCell(index);
        if(item.headRender) {
          tableCell.innerHTML = item.headRender(column.text);
        } else {
          tableCell.innerText = column.text;
        }
      })
    }
    if(item.tableContent && item.columns) {
      item.tableContent.forEach((content) => {
        const tableRow = ele.insertRow(ele.rows.length);
        if(item.onRowClick) {
          tableRow.onclick = () => item.onRowClick(content.index);
        }
        item.columns.forEach((column, index) => {
          const tableCell = tableRow.insertCell(index);
          if(column.cellRender) {
            tableCell.innerHTML = column.cellRender(content[column.key]);
          } else {
            tableCell.innerText = content[column.key];
          }
        })
      })
    }
    return ele;
  };
  const append = (elements) => {
    elements.forEach(item => {
      const ele = attribute(item);
      function checkChildren(father, object) {
        if(object.children){
          object.children.forEach(childItem => {
            const child = attribute(childItem);
            father.appendChild(child);
            checkChildren(child, childItem);
          });
        }
      }
      checkChildren(ele, item);
      document.documentElement.appendChild(ele);
    });
  };
  const close = (elements) => {
    elements.forEach(item => {
      document.documentElement.removeChild(document.getElementById(item.id));
    });
  };
  // 以上函数为make...container函数会用到的重复操作
  const makeWordContainer = (word) => {
    const addHistory = (state) => {
      if(word.message !== word.index) {
        chrome.runtime.sendMessage({history: {
          content: word.content,
          definition: word.definition,
          state: state,
          dicType: word.dicType,
          date: new Date().toLocaleString(),
          index: word.index,
        }});
      }
    };
    const elements = [{
      type: 'div',
      name: 'filter',
      class: ['word-filter'],
      id: 'word-filter',
      onclick() {
        addHistory('跳过');
        close(elements);
      }
    },{
      type: 'div',
      name: 'word-container',
      class: ['word-container'],
      id: 'word-container',
      children: [{
        type: 'div',
        name: 'content',
        class: ['word-content'],
        content: word.content,
      },{
        type: 'button',
        name: 'close',
        class: ['word-button'],
        content: '我认识',
        onclick(){
          addHistory('认识');
          close(elements);
          sendMessage();
        }
      },{
        type: 'button',
        name: 'jump',
        class: ['word-button'],
        content: '我不认识',
        onclick(){
          document.getElementById('word-container').classList.add('word-none');
          document.getElementById('word-unknownContainer').classList.remove('word-none');
          addHistory('不认识');
          if(setting.autoAudio === '1') {
            voice.play();
          }
        }
      }
      ]
    },{
      type: 'div',
      name: 'unknownContainer',
      class: ['word-container', 'word-none'],
      id: 'word-unknownContainer',
      children: [{
        type: 'div',
        name: 'unknown-content',
        class: ['word-unknown-closer','word-content'],
        content: word.content
      },{
        type: 'button',
        name: 'unknown-pronunciation',
        class: ['word-unknown-closer','word-button'],
        content: `[${word.pronunciation}]`,
        onclick() {
          voice.play();
        }
      },{
        type: 'div',
        name: 'definition',
        content: word.definition,
        class: ['word-definition'],
      },{
        type: 'div',
        name: 'example',
        class: ['word-example-container'],
        children: [{
          type: 'div',
          name: 'example-content',
          content: word.example[0].first + word.example[0].mid + word.example[0].last
        },{
          type: 'div',
          name: 'example-translation',
          content: word.example[0].translation
        }]
      },{
        type: 'button',
        name: 'close',
        content: '我学到了!',
        class: ['word-button'],
        onclick() {
          close(elements);
        }
      },{
        type: 'button',
        name: 'again',
        content: '再来一个!',
        class: ['word-button'],
        onclick() {
          close(elements);
          sendMessage();
        }
      }]
    }];
    const voice = document.createElement('audio');
    voice.proload = 'auto';
    if(word.audio) {
      voice.src = word.audio;
    }
    append(elements);
  };
  const makeHistoryContainer = () => {
    const elements = [{
      type: 'div',
      name: 'filter',
      class: ['word-filter'],
      id: 'word-filter',
      onclick() {
        close(elements);
      }
    },{
      type: 'div',
      name: 'history-container',
      class: ['history-container'],
      id: 'history-container',
      children: [{
        type: 'div',
        name: 'history-table-container',
        class: ['history-table-container'],
        children: [{
          type: 'table',
          name: 'history-table',
          class: ['history-table'],
          id: 'history-table',
          columns: [{
            text: '单词',
            key: 'content',
            cellRender: (text) => (`<div>${text}</div>`)
          },{
            text: '时间',
            key: 'date',
            cellRender: (text) => (`<div>${text}</div>`)
          },{
            text: '释义',
            key: 'definition',
            cellRender: (text) => (`<div style="text-align: left;padding-left: 5px">${text}</div>`)
          },{
            text: '状态',
            key: 'state',
            cellRender: (text) => (`<div>${text}</div>`)
          }],
          headRender: (text) => {
            return `<div class="history-table-header">${text}</div>`
          },
          tableContent: setting.history,
          onRowClick: (index) => {
            close(elements);
            sendMessage(index)
          }
        }]
      }]
    }];
    append(elements);
  };
  const makeAnalysisContainer = () => {
    const elements = [{
      type: 'div',
      name: 'filter',
      class: ['word-filter'],
      id: 'word-filter',
      onclick() {
        close(elements);
      }
    },{
      type: 'div',
      name: 'analysis-container',
      class: ['word-container'],
      id: 'analysis-container',
      children: [{
       type: 'div',
       name: 'analysis-box-1',
       class: ['analysis-box'],
       children: [{
         type: 'div',
         name: 'analysis-dicType-title',
         content: '当前词库',
         class: ['analysis-dicType-title'],
       },{
         type: 'div',
         name: 'analysis-dicType-number',
         content: setting.dicType,
         id: 'analysis-dicType-number',
         class: ['analysis-number'],
       }]
      },{
        type: 'div',
        name: 'analysis-box-2',
        class: ['analysis-box'],
        children: [{
          type: 'div',
          name: 'analysis-dicNumber-title',
          content: '词库单词总数',
          class: ['analysis-dicNumber-title'],
        },{
          type: 'div',
          name: 'analysis-dicNumber-number',
          content: setting.analysis[setting.dicType].length,
          id: 'analysis-dicNumber-number',
          class: ['analysis-number'],
        }]
      },{
        type: 'div',
        name: 'analysis-box-3',
        class: ['analysis-box'],
        children: [{
          type: 'div',
          name: 'analysis-total-title',
          content: '累计蹦出单词数',
          id: 'analysis-total-title',
          class: ['analysis-total-title'],
        },{
          type: 'div',
          name: 'analysis-total-number',
          content: setting.analysis[setting.dicType].total,
          id: 'analysis-total-number',
          class: ['analysis-number'],
        }],
      },{
        type: 'div',
        name: 'analysis-box-4',
        class: ['analysis-box'],
        children: [{
          type: 'div',
          name: 'analysis-recognition-title',
          content: '累计认识单词数',
          id: 'analysis-recognition-title',
          class: ['analysis-recognition-title'],
        },{
          type: 'div',
          name: 'analysis-recognition-number',
          content: setting.analysis[setting.dicType].recognition,
          id: 'analysis-recognition-number',
          class: ['analysis-number'],
        }],
      },{
        type: 'div',
        name: 'analysis-box-5',
        class: ['analysis-box'],
        children: [{
          type: 'div',
          name: 'analysis-percentage-title',
          content: '认识率',
          id: 'analysis-percentage-title',
          class: ['analysis-percentage-title'],
        },{
          type: 'div',
          name: 'analysis-percentage-number',
          content: (setting.analysis[setting.dicType].recognition/setting.analysis[setting.dicType].total*100).toFixed(1) + '%',
          id: 'analysis-percentage-number',
          class: ['analysis-number'],
        }],
      },{
        type: 'div',
        name: 'analysis-box-6',
        class: ['analysis-box'],
        children: [{
          type: 'div',
          name: 'analysis-cover-title',
          content: '词库覆盖率',
          id: 'analysis-cover-title',
          class: ['analysis-cover-title'],
        },{
          type: 'div',
          name: 'analysis-cover-number',
          content: (setting.analysis[setting.dicType].total/setting.analysis[setting.dicType].length*100).toFixed(1) + '%',
          id: 'analysis-cover-number',
          class: ['analysis-number'],
        }],
      }]
    }];
    append(elements);
  };
  const sendMessage = (index = -1) =>{
    chrome.runtime.sendMessage({
      word: index
    },(response) => {
      console.log('response word', response);
      makeWordContainer(response);
    });
  };
  console.log(setting);
  sendMessage();
  chrome.runtime.onMessage.addListener(
    (message, sender, sendResponse) => {
      console.log("script on message", message, sender, sendResponse);
      if(message.popup) {
        makeWordContainer(message.popup);
      }
      if(message.history) {
        makeHistoryContainer();
      }
      if(message.analysis) {
        makeAnalysisContainer();
      }
      return true;
    }
  );
})();