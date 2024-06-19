const books = [];
const RENDER_EVENT = 'render-book';
const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOK_APPS';

function isStorageExist() /* boolean */ {
    if (typeof (Storage) === undefined) {
        alert('Browser kamu tidak mendukung local storage');
        return false;
    }
    return true;
}

function generateId() {
    return +new Date();
}

function generateBookObject(id, title, author, year, isComplete) {
    return {
        id,
        title,
        author,
        year,
        isComplete
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const submitForm = document.getElementById('form');
    submitForm.addEventListener('submit', function (event) {
        event.preventDefault();
        addBook();
    });

    if (isStorageExist()) {
        loadDataFromStorage();
    }
});

document.addEventListener(RENDER_EVENT, function () {
    console.log(books);
    
    const uncompletedBOOKList = document.getElementById('books');
    uncompletedBOOKList.innerHTML = '';
    
    const completedBOOKList = document.getElementById('completed-books');
    completedBOOKList.innerHTML = '';
    
    for (const bookItem of books) {
        const bookElement = makeBook(bookItem);
        if (!bookItem.isComplete) {
            uncompletedBOOKList.append(bookElement);
        }
        else {
            completedBOOKList.append(bookElement);
        }
    }
    
    updateBookCount();
});

function showToast(message) {
    var toast = document.createElement('div');
    toast.textContent = message;
    toast.className = 'toast';
    document.body.appendChild(toast);
    
    setTimeout(function() {
        document.body.removeChild(toast);
    }, 3000);
}

function showToastAlert(message) {
    var toast = document.createElement('div');
    toast.textContent = message;
    toast.className = 'toastAlert';
    document.body.appendChild(toast);
    
    setTimeout(function() {
        document.body.removeChild(toast);
    }, 3000);
}

function makeBook(bookObject) {
    const textTitle = document.createElement('h2');
    textTitle.innerText = bookObject.title;
    
    const textAuthor = document.createElement('p');
    textAuthor.innerText = bookObject.author;

    const textYear = document.createElement('p');
    textYear.innerText = bookObject.year;
    
    const textContainer = document.createElement('div');
    textContainer.classList.add('inner');
    textContainer.append(textTitle, textAuthor, textYear);
    
    const container = document.createElement('div');
    container.classList.add('item', 'shadow');
    container.append(textContainer);
    container.setAttribute('id', `book-${bookObject.id}`);
    
    if (bookObject.isComplete) {
        const undoButton = document.createElement('button');
        undoButton.classList.add('undo-button');
        
        undoButton.addEventListener('click', function () {
            undoBookFromCompleted(bookObject.id);
        });
        
        const trashButton = document.createElement('button');
        trashButton.classList.add('trash-button');
     
        trashButton.addEventListener('click', function () {
            removeBookFromCompleted(bookObject.id);
        });
        
        container.append(undoButton, trashButton);
    } else {
        const checkButton = document.createElement('button');
        checkButton.classList.add('check-button');
        
        checkButton.addEventListener('click', function () {
            addBookToCompleted(bookObject.id);
        });

        const trashButton = document.createElement('button');
        trashButton.classList.add('trash-button');
    
        trashButton.addEventListener('click', function () {
            removeBookFromCompleted(bookObject.id);
        });
        
        container.append(checkButton, trashButton);
    }
    
    return container;
}

function addBook() {
    let textBook = document.getElementById('title').value.toUpperCase();
    const author = document.getElementById('penulis').value;
    const bookyear = document.getElementById('year').value;
    const isComplete = document.getElementById('checkBookIsComplete').checked;

    if (books.some(book => book.title === textBook)) {
        showToastAlert("Buku sudah ada di rak!");
        return;
    }

    const generatedID = generateId();
    const bookObject = generateBookObject(generatedID, textBook, author, parseInt(bookyear), isComplete);
    books.push(bookObject);

    document.getElementById('title').value = '';
    document.getElementById('penulis').value = '';
    document.getElementById('year').value = '';
    document.getElementById('checkBookIsComplete').checked = false;

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
    if (isComplete) {
        showToast("Buku berhasil ditambahkan ke rak sudah selesai dibaca!");
    } else {
        showToast("Buku berhasil ditambahkan ke rak belum selesai dibaca!");
    }
}


function addBookToCompleted (bookId) {
    const bookTarget = findBook(bookId);
    
    if (bookTarget == null) return;
    
    bookTarget.isComplete = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
    showToast("Buku berhasil dipindahkan ke rak sudah selesai dibaca!");
}

function removeBookFromCompleted(bookId) {
    const bookTarget = findBookIndex(bookId);
    
    if (bookTarget === -1) return;
    
    const confirmation = confirm("Apakah anda yakin ingin menghapus buku dari rak?");
    if (confirmation) {
        books.splice(bookTarget, 1);
        document.dispatchEvent(new Event(RENDER_EVENT));
        saveData();
        showToast("Buku berhasil dihapus dari rak!");
    } else {
        showToast("Penghapusan buku dibatalkan.");
    }
}

function undoBookFromCompleted(bookId) {
    const bookTarget = findBook(bookId);
    
    if (bookTarget == null) return;
    
    bookTarget.isComplete = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
    showToast("Buku berhasil dipindahkan ke rak belum selesai dibaca!");
}

function findBook(bookId) {
    for (const bookItem of books) {
        if (bookItem.id === bookId) {
            return bookItem;
        }
    }
    return null;
}

function findBookIndex(bookId) {
    for (const index in books) {
        if (books[index].id === bookId) {
            return index;
        }
    }

    return -1;
}

function saveData() {
    if (isStorageExist()) {
        const parsed = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(SAVED_EVENT));
    }
}

function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);

    if (data !== null) {
        for (const book of data) {
            books.push(book);
        }
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
    updateBookCount();
}

function updateBookCount() {
    const bookCount = books.length;
    document.getElementById('book-count').innerText = bookCount;
}
