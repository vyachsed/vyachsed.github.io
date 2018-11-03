let fullTable, _fullTable, allTables, allSearchTables, curPage;
let img_dir = './img'; // папка с картинками
let sort_case_sensitive = false; // вид сортировки (регистрозависимый или нет)

// ф-ция, определяющая алгоритм сортировки
const _sort = (a_, b_) => {
  let a = a_[0];
  let b = b_[0];
  let _a = (a + '').replace(/,/, '.');
  let _b = (b + '').replace(/,/, '.');
  if (parseFloat(_a) && parseFloat(_b))
    return sort_numbers(parseFloat(_a), parseFloat(_b));
  else if (!sort_case_sensitive) return sort_insensitive(a, b);
  else return sort_sensitive(a, b);
};

// ф-ция сортировки чисел
const sort_numbers = (a, b) => {
  return a - b;
};

// ф-ция регистронезависимой сортировки
const sort_insensitive = (a, b) => {
  let anew = a.toLowerCase();
  let bnew = b.toLowerCase();
  if (anew < bnew) return -1;
  if (anew > bnew) return 1;
  return 0;
};

// ф-ция регистрозависимой сортировки
const sort_sensitive = (a, b) => {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
};

// вспомогательная ф-ция, выдирающая из дочерних узлов весь текст
const getConcatenedTextContent = node => {
  let _result = '';
  if (node == null) {
    return _result;
  }
  let childrens = node.childNodes;
  let i = 0;
  while (i < childrens.length) {
    let child = childrens.item(i);
    switch (child.nodeType) {
      case 1: // ELEMENT_NODE
      case 5: // ENTITY_REFERENCE_NODE
        _result += getConcatenedTextContent(child);
        break;
      case 3: // TEXT_NODE
      case 2: // ATTRIBUTE_NODE
      case 4: // CDATA_SECTION_NODE
        _result += child.nodeValue;
        break;
      case 6: // ENTITY_NODE
      case 7: // PROCESSING_INSTRUCTION_NODE
      case 8: // COMMENT_NODE
      case 9: // DOCUMENT_NODE
      case 10: // DOCUMENT_TYPE_NODE
      case 11: // DOCUMENT_FRAGMENT_NODE
      case 12: // NOTATION_NODE
        // skip
        break;
    }
    i++;
  }
  return _result;
};

// суть скрипта
const sort = e => {
  let el = window.event ? window.event.srcElement : e.currentTarget;
  while (el.tagName.toLowerCase() != 'td') el = el.parentNode;
  let a = new Array();
  let name = el.lastChild.nodeValue;
  let dad = el.parentNode;
  let table = document.getElementById('myTable'); //dad.parentNode.parentNode;
  let up = table.up;
  let node, arrow, curcol;
  /*eslint no-cond-assign: 0*/
  for (let i = 0; (node = dad.getElementsByTagName('td').item(i)); i++) {
    if (node.lastChild.nodeValue == name) {
      curcol = i;
      if (node.className == 'curcol') {
        arrow = node.firstChild;
        table.up = Number(!up);
      } else {
        node.className = 'curcol';
        arrow = node.insertBefore(
          document.createElement('img'),
          node.firstChild,
        );
        table.up = 0;
      }
      arrow.src = img_dir + table.up + '.gif';
      arrow.alt = '';
    } else {
      if (node.className == 'curcol') {
        node.className = '';
        if (node.firstChild) node.removeChild(node.firstChild);
      }
    }
  }
  let tbody = table.getElementsByTagName('tbody').item(0);
  for (let i = 0; (node = tbody.getElementsByTagName('tr').item(i)); i++) {
    a[i] = new Array();
    a[i][0] = getConcatenedTextContent(
      node.getElementsByTagName('td').item(curcol),
    );
    a[i][1] = getConcatenedTextContent(node.getElementsByTagName('td').item(1));
    a[i][2] = getConcatenedTextContent(node.getElementsByTagName('td').item(0));
    a[i][3] = node;
  }
  a.sort(_sort);
  if (table.up) a.reverse();
  for (let i = 0; i < a.length; i++) {
    tbody.appendChild(a[i][3]);
  }
};

// ф-ция инициализации всего процесса
const init = () => {
  let thead, td_for_event, initial_sort_id, initial_sort_up, evt;
  if (!document.getElementsByTagName) return;

  for (
    let j = 0;
    (thead = document.getElementsByTagName('thead').item(j));
    j++
  ) {
    let node;
    for (let i = 0; (node = thead.getElementsByTagName('td').item(i)); i++) {
      if (node.addEventListener) node.addEventListener('click', sort, false);
      else if (node.attachEvent) node.attachEvent('onclick', sort);
      node.title = 'Нажмите на заголовок, чтобы отсортировать колонку';
    }
    thead.parentNode.up = 0;

    if (typeof initial_sort_id != 'undefined') {
      td_for_event = thead.getElementsByTagName('td').item(initial_sort_id);
      if (document.createEvent) {
        let evt = document.createEvent('MouseEvents');
        evt.initMouseEvent(
          'click',
          false,
          false,
          window,
          1,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          1,
          td_for_event,
        );
        td_for_event.dispatchEvent(evt);
      } else if (td_for_event.fireEvent) td_for_event.fireEvent('onclick');
      if (typeof initial_sort_up != 'undefined' && initial_sort_up) {
        if (td_for_event.dispatchEvent) td_for_event.dispatchEvent(evt);
        else if (td_for_event.fireEvent) td_for_event.fireEvent('onclick');
      }
    }
  }
};
/*let root = window.addEventListener || window.attachEvent ? window : document.addEventListener ? document : null;
    if (root){
        if (root.addEventListener) {
          root.addEventListener('load', init, false);
          console.log(1);
        }
        else if (root.attachEvent) {
          root.attachEvent('onload', init);
          console.log(2);
        }
        root.addEventListener('load', init);
    }*/
window.onload = () => {
  let searchDiv = document.createElement('div');
  searchDiv.className = 'search-block';
  searchDiv.innerHTML = `<span>Search:</span>
  <input id='myInput' type='text'>
  <button onclick='searchTable()'>search</button>`;
  document.getElementById('main').appendChild(searchDiv);
  let data = fetchFakeData();
  let thead = '<thead><tr>';
  for (let key in data[0]) {
    let first = key[0].toString().toUpperCase();
    key = first + key.slice(1);
    thead += `<td>${key}</td>`;
  }
  thead += '</tr></thead>';
  let tbody = '<tbody>';
  for (let obj of data) {
    tbody += '<tr>';
    for (let key in obj) {
      tbody += `<td>${obj[key]}</td>`;
    }
    tbody += '</tr>';
  }
  tbody += '</tbody>';
  fullTable = document.createElement('table');
  fullTable.id = 'myTable';
  fullTable.innerHTML = thead + tbody;
  _fullTable = fullTable.cloneNode(true);
  document.getElementById('main').appendChild(fullTable);
  curPage = 1;
  allTables = sliceTable(document.getElementById('myTable').cloneNode(true), 4);
  document.getElementById('myTable').innerHTML =
    allTables[curPage - 1].innerHTML;
  let div = document.createElement('div');
  div.id = 'pagination';
  div.style.textAlign = 'right';
  div.innerHTML += `<button class='navbutton' id='prev' onclick='handleButton(this)' disabled>prev</button>`;
  for (let i in allTables) {
    if (i == 0) {
      div.innerHTML += `<button style='background-color: rgba(1, 1, 1, 0.1);' class='navbutton' onclick='handleButton(this)'>${i -
        0 +
        1}</button>`;
    } else {
      div.innerHTML += `<button class='navbutton' onclick='handleButton(this)'>${i -
        0 +
        1}</button>`;
    }
  }
  div.innerHTML += `<button class='navbutton' id='next' onclick='handleButton(this)'>next</button>`;
  document.body.appendChild(div);
  if (allTables.length == 1) {
    document.getElementById('next').disabled = true;
  }
  init();
};
const sliceTable = (largeTable, chunk) => {
  let lesserTables = [];
  let thead = largeTable.getElementsByTagName('thead')[0].cloneNode(true);
  largeTable = largeTable.getElementsByTagName('tbody')[0].cloneNode(true);
  largeTable = lesserTables.slice.call(largeTable.children);

  for (let t = 0, len = largeTable.length, table; t < len; t += chunk) {
    table = document.createElement('table');
    table.className = 'sortable';
    table.innerHTML = thead.outerHTML + '<tbody></tbody>';
    table.id = 'myTable';
    largeTable
      .slice(t, t + chunk)
      .map(tr => table.getElementsByTagName('tbody')[0].appendChild(tr));
    lesserTables.push(table);
  }
  return lesserTables;
};
/*eslint-disable no-unused-vars*/
const searchTable = () => {
  let input, filter, found, table, tr, td, i, j;
  input = document.getElementById('myInput');
  filter = input.value.toUpperCase();
  table = _fullTable.cloneNode(true);
  tr = table.getElementsByTagName('tbody')[0].getElementsByTagName('tr');
  for (i = 0; i < tr.length; i++) {
    td = tr[i].getElementsByTagName('td');
    for (j = 0; j < td.length; j++) {
      if (td[j].innerHTML.toUpperCase().indexOf(filter) > -1) {
        found = true;
      }
    }
    if (found) {
      tr[i].style.display = '';
      found = false;
    } else {
      tr[i].style.display = 'none';
    }
  }
  let tbody = table.getElementsByTagName('tbody')[0].outerHTML;
  for (i = 0; i < tr.length; i++) {
    if (tr[i].style.display) {
      tbody = tbody.replace(tr[i].outerHTML, '');
    }
  }
  document
    .getElementById('myTable')
    .getElementsByTagName('tbody')[0].innerHTML = tbody;
  allSearchTables = sliceTable(
    document.getElementById('myTable').cloneNode(true),
    4,
  );
  allTables = allSearchTables;
  document.getElementById('myTable').innerHTML =
    allSearchTables[curPage - 1].innerHTML;
  let div = document.getElementById('pagination');
  div.innerHTML = '';
  div.innerHTML += `<button class='navbutton' id='prev' onclick='handleButton(this)' disabled>prev</button>`;
  for (let i in allSearchTables) {
    if (i == 0) {
      div.innerHTML += `<button style='background-color: rgba(1, 1, 1, 0.1);' class='navbutton' onclick='handleButton(this)'>${i -
        0 +
        1}</button>`;
    } else {
      div.innerHTML += `<button class='navbutton' onclick='handleButton(this)'>${i -
        0 +
        1}</button>`;
    }
  }
  div.innerHTML += `<button class='navbutton' id='next' onclick='handleButton(this)'>next</button>`;
  if (allSearchTables.length === 1) {
    document.getElementById('next').disabled = true;
  }
  init();
};
const handleButton = button => {
  let navbuttons = document.getElementsByClassName('navbutton');
  switch (button.innerHTML) {
    case 'prev':
      if (curPage > 1)
        document.getElementById('myTable').innerHTML =
          allTables[--curPage - 1].innerHTML;
      break;
    case 'next':
      if (curPage < allTables.length)
        document.getElementById('myTable').innerHTML =
          allTables[++curPage - 1].innerHTML;
      break;
    default:
      curPage = button.innerHTML;
      document.getElementById('myTable').innerHTML =
        allTables[curPage - 1].innerHTML;
      break;
  }
  let prev = document.getElementById('prev');
  let next = document.getElementById('next');
  if (curPage == 1) {
    prev.disabled = true;
    if (allTables.length > 1) {
      next.disabled = false;
    } else {
      next.disabled = true;
    }
  } else {
    prev.disabled = false;
    if (curPage < allTables.length) {
      next.disabled = false;
    } else {
      next.disabled = true;
    }
  }
  for (let key in navbuttons) {
    if (navbuttons[key].innerHTML - 0 == +(navbuttons[key].innerHTML - 0)) {
      if (navbuttons[key].innerHTML - 0 == curPage) {
        navbuttons[key].style.backgroundColor = 'rgba(1, 1, 1, 0.1)';
        //console.log(curPage);
      } else {
        navbuttons[key].style.backgroundColor = 'white';
      }
    }
  }
  init();
};
const fetchFakeData = () => {
  const jsonData = `
      [
          {
            "name": "Thor Walton",
            "position": "Developer",
            "office": "New York",
            "age": 61,
            "start date": "2013/08/11",
            "salary": "$98,540"
          },
          {
            "name": "Quinn Flynn",
            "position": "Support Lead",
            "office": "Edinburgh",
            "age": 22,
            "start date": "2013/03/03",
            "salary": "$342,000"
          },
          {
            "name": "Jennifer Acosta",
            "position": "Junior JavaScript Developer",
            "office": "Edinburgh",
            "age": 43,
            "start date": "2013/02/01",
            "salary": "$75,650"
          },
          {
            "name": "Haley Kennedy",
            "position": "Senior Marketing Designer",
            "office": "London",
            "age": 43,
            "start date": "2012/12/18",
            "salary": "$313,500"
          },
          {
            "name": "Brielle Williamson",
            "position": "Integration Specialist",
            "office": "New York",
            "age": 61,
            "start date": "2012/12/02",
            "salary": "$372,000"
          },
          {
            "name": "Michael Silva",
            "position": "Marketing Designer",
            "office": "London",
            "age": 66,
            "start date": "2012/11/27",
            "salary": "$198,500"
          },
          {
            "name": "Bradley Greer",
            "position": "Software Engeneer",
            "office": "London",
            "age": 41,
            "start date": "2012/10/13",
            "salary": "$132,000"
          },
          {
            "name": "Dai Rios",
            "position": "Personnel Lead",
            "office": "Edinburgh",
            "age": 35,
            "start date": "2012/09/26",
            "salary": "$217,500"
          },
          {
            "name": "Herrod Chandler",
            "position": "Sales Assistant",
            "office": "San Francisco",
            "age": 59,
            "start date": "2012/08/06",
            "salary": "$137,500"
          },
          {
            "name": "Zorita Serrano",
            "position": "Software Engeneer",
            "office": "San Francisco",
            "age": 56,
            "start date": "2012/06/01",
            "salary": "$115,000"
          },
          {
            "name": "",
            "position": "",
            "office": "",
            "age": 1,
            "start date": "2013/08/11",
            "salary": "$98,540"
          },
          {
            "name": "",
            "position": "",
            "office": "",
            "age": 1,
            "start date": "2013/08/11",
            "salary": "$98,540"
          },
          {
            "name": "",
            "position": "",
            "office": "",
            "age": 1,
            "start date": "2013/08/11",
            "salary": "$98,540"
          }
        ]
        `;
  const loadData = () => JSON.parse(jsonData);
  return loadData();
};
