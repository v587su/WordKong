(function () {
  const makeWordContainer = (word) => {
    const voice = document.createElement('audio');
    voice.proload = 'auto';
    if(word.audio) {
      voice.src = word.audio;
    }
    const elements = [{
      type: 'div',
      name: 'filter',
      class: ['word-filter'],
      id: 'word-filter',
      onclick() {
        addHistory('跳过');
        close();
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
          close();
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
          close();
        }
      }]
    }];
    function close() {
      elements.forEach(item => {
        document.documentElement.removeChild(document.getElementById(item.id));
      })
    }
    function attribute(item) {
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
      return ele;
    }
    function addHistory(state) {
      if(word.message !== word.index) {
        chrome.runtime.sendMessage({history: {
          content: word.content,
          definition: word.definition,
          state: state,
          date: new Date().toLocaleString(),
          index: word.index,
        }});
      }
    }
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
  const makeHistoryContianer = () => {
    const elements = [{
      type: 'div',
      name: 'filter',
      class: ['word-filter'],
      id: 'word-filter',
      onclick() {
        close();
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
            close();
            sendMessage(index)
          }
        }]
      }]
    }];
    function close() {
      elements.forEach(item => {
        document.documentElement.removeChild(document.getElementById(item.id));
      });
    }
    function attribute(item) {
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
    }
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
  const sendMessage = (index = -1) =>{
    chrome.runtime.sendMessage({
      word: index
    },(response) => {
      console.log('response word', response);
      makeWordContainer(response);
    });
  };
  sendMessage();
  chrome.runtime.onMessage.addListener(
    (message, sender, sendResponse) => {
      console.log("script on message", message, sender, sendResponse);
      if(message.show) {
        makeWordContainer(message.show)
      }
      if(message.history) {
        makeHistoryContianer()
      }
      return true;
    }
  )
})();