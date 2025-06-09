const url = 'UQ6HTs8cyctXRHAaAeDdTRr7OKtukWZ7';
function customHttp() {
  return {
    get(url, cb) {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.addEventListener('load', (e) => {
          if (Math.floor(xhr.status / 100) !== 2) {
            cb(`Error. Status code: ${xhr.status}`, xhr);
            return;
          };
          const response = JSON.parse(xhr.responseText);
          cb(null, response);
        });
    
        xhr.addEventListener('error', (e) => {
          cb(`Error. Status code: ${xhr.status}`, xhr);
        })
        xhr.send();
      } catch (error) {
        cb(error);
      };
    },
    post(url, body, headers, cb) {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', url);
      xhr.addEventListener('load', (e) => {
        if (Math.floor(xhr.status / 100) !== 2) {
          cb(`Error. Status code: ${xhr.status}`, xhr);
          return;
        };
    
        const response = JSON.parse(xhr.responseText);
        cb(null, response);
      });
    
      xhr.setRequestHeader('Content-type', 'application/json; charset=UTF-8');
    
      xhr.addEventListener('error', () => {
        cb(`Error. Status code: ${xhr.status}`, xhr);
      });
    
      // Устанавливаем пользовательские заголовки
      Object.entries(headers).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value);
      });
      // Устанавливаем Content-Type по умолчанию, если не передан
      if (!headers['Content-Type'] && !headers['content-type']) {
        xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
      };
    
      xhr.send(JSON.stringify(body));
    },
  };
};

//Такой подход позволяет программисту легко обрабатывать результат:
// get('https://api.example.com/data', (err, res) => {
//   if (err) {
//     console.log('Произошла ошибка:', err);
//     return;
//   }
//   console.log('Ответ от сервера:', res);
// });

// function get(url, cb) {
//   try {
//     const xhr = new XMLHttpRequest();
//     xhr.open('GET', url);
//     xhr.addEventListener('load', (e) => {
//       if (Math.floor(xhr.status / 100) !== 2) {
//         cb(`Error. Status code: ${xhr.status}`, xhr);
//         return;
//       };
//       const response = JSON.parse(xhr.responseText);
//       cb(null, response);
//     });

//     xhr.addEventListener('error', (e) => {
//       cb(`Error. Status code: ${xhr.status}`, xhr);
//     })
//     xhr.send();
//   } catch (error) {
//     cb(error);
//   };
// };

// function post(url, body, headers, cb) {
//   const xhr = new XMLHttpRequest();
//   xhr.open('POST', url);
//   xhr.addEventListener('load', (e) => {
//     if (Math.floor(xhr.status / 100) !== 2) {
//       cb(`Error. Status code: ${xhr.status}`, xhr);
//       return;
//     };

//     const response = JSON.parse(xhr.responseText);
//     cb(null, response);
//   });

//   xhr.setRequestHeader('Content-type', 'application/json; charset=UTF-8');

//   xhr.addEventListener('error', () => {
//     cb(`Error. Status code: ${xhr.status}`, xhr);
//   });

//   // Устанавливаем пользовательские заголовки
//   Object.entries(headers).forEach(([key, value]) => {
//     xhr.setRequestHeader(key, value);
//   });
//   // if (headers) {
//   //   Object.entries(headers).forEach(([key, value]) => {
//   //     xhr.setRequestHeader(key, value);
//   //   });
//   // };
//   // Устанавливаем Content-Type по умолчанию, если не передан
//   if (!headers['Content-Type'] && !headers['content-type']) {
//     xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
//   };

//   xhr.send(JSON.stringify(body));
// };


// Init http module
const http = customHttp();

const nytService = (function () {
  
  const baseUrl = '/.netlify/functions/nyt';// путь к серверной функции

  return {
    // getTopStories(section = 'home', cb) {
    //   http.get(`${baseUrl}/topstories/v2/${section}.json?api-key=${apiKey}`, cb);
    // },
    // searchArticles(query, cb) {
    //   http.get(`${baseUrl}/search/v2/articlesearch.json?q=${query}&api-key=${apiKey}`, cb);
    // }
    getTopStories(section = 'home', cb) {
      http.get(`${baseUrl}?section=${section}`, cb);
    },
    searchArticles(query, cb) {
      http.get(`${baseUrl}?query=${query}`, cb);
    }
  }
})();

// Elements
const form = document.forms['newsControls'];
const categorySelect = form.elements['category'];
const searchInput = form.elements['search'];

form.addEventListener('submit', (e) => {
  e.preventDefault();
  loadNews();
});

//  init selects
document.addEventListener('DOMContentLoaded', function() {
  M.AutoInit();

  loadNews();
});

// load news
function loadNews() {
  showLoader();
  const category = categorySelect.value;
  const searchText = searchInput.value;
  console.log(category);

  if (!searchText) {
    nytService.getTopStories(category, onGetResponse);
  } else {
    nytService.searchArticles(searchText, onGetResponse);
  }

  //nytService.getTopStories(category, onGetResponse);
  // nytService.getTopStories('us', onGetResponse);
};

function onGetResponse(err, res) {
  removePreloader();
  console.log(res);
  const newsContainer = document.querySelector('.news-container .row');
  if (err) {
    showAlert(err, 'error-msg');
    console.error(err);
    newsContainer.innerHTML = '<p>Error loading news. Please try again later.</p>';
    return;
  };

  let articles = [];

  if (res.results && res.results.length) {
    articles = res.results;
  } else if (res.response?.docs?.length) {
    articles = res.response.docs;
  };

  if (!articles.length) {
    newsContainer.innerHTML = '<p>No news found.</p>'
  }

  renderNews(articles);
};

function renderNews(news) {
  const newContainer = document.querySelector('.news-container .row');
  if (newContainer.children.length) {
    clearContainer(newContainer);// <--- очищаем перед рендером
  };

  let fragment = '';

  news.forEach(item => {
    const el = newsTemplate(item);
    fragment += el;
  });

  newContainer.insertAdjacentHTML('afterbegin', fragment);

};

function clearContainer(container) {
  let child = container.lastElementChild;
  while (child) {
    container.removeChild(child);
    child = container.lastElementChild;//когда удалится последний - будет null, и он запишется в child
  };
};



function newsTemplate(item) {
  const {
    abstract = '',
    title = '',
    headline,
    multimedia,
    url,
    web_url,
  } = item;//abstract, title, headline, multimedia, url, web_url вытаскиваются через деструктуризацию

  // Выбор заголовка
  const finalTitle = title || headline?.main || '';

  // Выбор URL
  const finalUrl = url || web_url || '#';

  let imgUrl = 'https://placehold.co/600x400?text=No+Image';

  // Выбор изображения
  if (Array.isArray(multimedia)) {
    imgUrl = multimedia?.[0]?.url || imgUrl;
  } else if (multimedia?.default?.url) {
    imgUrl = multimedia.default.url;
  };

  return `
    <div class="col s12">
      <div class="card">
        <div class="card-image">
          <img src="${imgUrl}" class="newImage" alt="Image">
          <span class="card-title">${finalTitle}</span>
        </div>
        <div class="card-content">
          <p>${abstract}</p>
        </div>
        <div class="card-action">
          <a href="${finalUrl}" target="_blank" rel="noopener noreferrer">Read more</a>
        </div>
      </div>
    </div>
  `;
};
// function newsTemplate({ abstract, title, multimedia, url}) {
//   const imgUrl = multimedia?.[0]?.url || 'https://placehold.co/600x400?text=No+Image';
//   return `
//     <div class="col s12">
//       <div class="card">
//         <div class="card-image">
//           <img src="${imgUrl}" class="newImage" alt="Image">
//           <span class="card-title">${title || ''}</span>
//         </div>
//         <div class="card-content">
//           <p>${abstract || ''}</p>
//         </div>
//         <div class="card-action">
//           <a href="${url}" target="_blank" rel="noopener noreferrer">Read more</a>
//         </div>
//       </div>
//     </div>
//   `;
// };
function showAlert(msg, type = 'success') {
  const finalMsg = msg || 'I am toast';
  M.toast({ html: finalMsg, classes: `${type} rounded` });
}

function showLoader() {
  document.body.insertAdjacentHTML('afterbegin',
    `<div class="progress">
      <div class="indeterminate"></div>
    </div>`);
};

function removePreloader() {
  const loader = document.querySelector('.progress');
  if (loader) {
    loader.remove();
  };
};
