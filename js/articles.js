class ArticleManager {
    constructor() {
        this.articles = {};
        this.loadArticles();
    }

    async loadArticles() {
        try {
            const response = await fetch('data/articles.json');
            this.articles = await response.json();
            this.renderArticles();
            this.initializeFilters();
        } catch (error) {
            console.error('Error loading articles:', error);
            // 如果加载失败，保持现有的静态内容
            this.handleLoadError();
        }
    }

    handleLoadError() {
        console.log('Failed to load articles from JSON, keeping existing static content');
        // 如果JSON加载失败，仍然初始化过滤器功能
        this.initializeFilters();
    }

    renderArticles() {
        this.renderNeuroscienceArticles();
        this.renderMathematicsArticles();
        this.renderBooks();
    }

    renderNeuroscienceArticles() {
        const container = document.getElementById('articlesGrid');
        if (!container || !this.articles.neuroscience) return;
        
        container.innerHTML = '';
        
        this.articles.neuroscience.forEach(article => {
            const articleHTML = this.createArticleHTML(article, 'neuroscience');
            container.innerHTML += articleHTML;
        });
    }

    renderMathematicsArticles() {
        const container = document.getElementById('mathArticlesGrid');
        if (!container || !this.articles.mathematics) return;
        
        container.innerHTML = '';
        
        this.articles.mathematics.forEach(article => {
            const articleHTML = this.createArticleHTML(article, 'mathematics');
            container.innerHTML += articleHTML;
        });
    }

    renderBooks() {
        const container = document.getElementById('booksGrid');
        if (!container || !this.articles.books) return;
        
        container.innerHTML = '';
        
        this.articles.books.forEach(book => {
            const bookHTML = this.createBookHTML(book);
            container.innerHTML += bookHTML;
        });
    }

    createArticleHTML(article, type) {
        const cardClass = type === 'mathematics' ? 'math-article-card' : 'article-card';
        const clickFunction = type === 'mathematics' ? 'openMathArticle' : 'openArticle';
        
        return `
            <div class="${cardClass} rounded-lg p-6 border border-gray-100" 
                 data-tags="${article.tags.join(',')}" 
                 onclick="${clickFunction}('${article.id}')">
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div class="flex-1">
                        <h3 class="text-2xl font-bold text-slate-800 hover:text-sky-600 transition-colors mb-3">
                            ${article.title}
                        </h3>
                        <p class="text-slate-600 mb-4 leading-relaxed">
                            ${article.description}
                        </p>
                        <div class="flex items-center text-sm text-slate-500">
                            <span>${article.date}</span>
                        </div>
                    </div>
                    <div class="w-full md:w-48 h-32 bg-gradient-to-br ${article.gradient} rounded-lg overflow-hidden">
                        <img src="images/articles/${article.image}" alt="${article.title}" class="w-full h-full object-cover" 
                             onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                        <div class="w-full h-full bg-gradient-to-br ${article.gradient} rounded-lg flex items-center justify-center" style="display: none;">
                            <svg class="w-16 h-16 ${article.iconColor}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${article.icon}"></path>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    createBookHTML(book) {
        return `
            <div class="book-card bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer" onclick="openBookNotes('${book.id}')">
                <div class="mb-4">
                    <div class="w-full h-48 bg-gradient-to-br ${book.gradient} rounded-lg overflow-hidden mb-4">
                        <img src="images/books/${book.image}" alt="${book.title}" class="w-full h-full object-cover" 
                             onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                        <div class="w-full h-full bg-gradient-to-br ${book.gradient} rounded-lg flex items-center justify-center" style="display: none;">
                            <svg class="w-16 h-16 ${book.iconColor}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                            </svg>
                        </div>
                    </div>
                    <h3 class="text-xl font-bold text-slate-800 mb-2">${book.title}</h3>
                    <p class="text-sm text-slate-600 mb-2">${book.authors}</p>
                    <p class="text-sm text-slate-500 mb-3">${book.description}</p>
                    <div class="flex items-center justify-between">
                        <span class="text-xs text-slate-400">进度: ${book.progress}%</span>
                        <div class="w-20 bg-gray-200 rounded-full h-2">
                            <div class="bg-green-500 h-2 rounded-full" style="width: ${book.progress}%"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // 添加新文章的方法
    addArticle(type, articleData) {
        if (!this.articles[type]) {
            this.articles[type] = [];
        }
        
        // 添加唯一ID和默认值
        articleData.id = articleData.id || this.generateId(articleData.title);
        
        this.articles[type].unshift(articleData); // 添加到开头
        this.saveArticles();
        this.renderArticles();
        this.initializeFilters(); // 重新初始化过滤器
    }

    generateId(title) {
        return title.toLowerCase()
            .replace(/[^\w\s]/gi, '')
            .replace(/\s+/g, '-');
    }

    saveArticles() {
        // 下载更新后的JSON文件
        this.downloadJSON();
        console.log('Articles updated:', this.articles);
    }

    downloadJSON() {
        const dataStr = JSON.stringify(this.articles, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'articles.json';
        link.click();
        URL.revokeObjectURL(url);
    }

    initializeFilters() {
        this.initializeTagFilters();
        this.initializeMathTagFilters();
    }

    initializeTagFilters() {
        const tagFilters = document.querySelectorAll('#tagFilters .tag-filter');
        const articles = document.querySelectorAll('.article-card');

        tagFilters.forEach(filter => {
            filter.addEventListener('click', function() {
                const selectedTag = this.getAttribute('data-tag');
                
                if (selectedTag === 'all') {
                    tagFilters.forEach(f => f.classList.remove('active'));
                    this.classList.add('active');
                    articles.forEach(article => article.classList.remove('hidden'));
                } else {
                    const allFilter = document.querySelector('#tagFilters .tag-filter[data-tag="all"]');
                    if (allFilter) allFilter.classList.remove('active');
                    this.classList.toggle('active');
                    
                    const activeTags = Array.from(document.querySelectorAll('#tagFilters .tag-filter.active'))
                        .map(f => f.getAttribute('data-tag'))
                        .filter(tag => tag !== 'all');
                    
                    if (activeTags.length === 0) {
                        if (allFilter) allFilter.classList.add('active');
                        articles.forEach(article => article.classList.remove('hidden'));
                    } else {
                        articles.forEach(article => {
                            const articleTags = article.getAttribute('data-tags').split(',');
                            const hasMatchingTag = activeTags.some(tag => articleTags.includes(tag));
                            
                            if (hasMatchingTag) {
                                article.classList.remove('hidden');
                            } else {
                                article.classList.add('hidden');
                            }
                        });
                    }
                }
            });
        });
    }

    initializeMathTagFilters() {
        const mathTagFilters = document.querySelectorAll('#mathTagFilters .tag-filter');
        const mathArticles = document.querySelectorAll('.math-article-card');

        mathTagFilters.forEach(filter => {
            filter.addEventListener('click', function() {
                const selectedTag = this.getAttribute('data-tag');
                
                if (selectedTag === 'all') {
                    mathTagFilters.forEach(f => f.classList.remove('active'));
                    this.classList.add('active');
                    mathArticles.forEach(article => article.classList.remove('hidden'));
                } else {
                    const allFilter = document.querySelector('#mathTagFilters .tag-filter[data-tag="all"]');
                    if (allFilter) allFilter.classList.remove('active');
                    this.classList.toggle('active');
                    
                    const activeTags = Array.from(document.querySelectorAll('#mathTagFilters .tag-filter.active'))
                        .map(f => f.getAttribute('data-tag'))
                        .filter(tag => tag !== 'all');
                    
                    if (activeTags.length === 0) {
                        if (allFilter) allFilter.classList.add('active');
                        mathArticles.forEach(article => article.classList.remove('hidden'));
                    } else {
                        mathArticles.forEach(article => {
                            const articleTags = article.getAttribute('data-tags').split(',');
                            const hasMatchingTag = activeTags.some(tag => articleTags.includes(tag));
                            
                            if (hasMatchingTag) {
                                article.classList.remove('hidden');
                            } else {
                                article.classList.add('hidden');
                            }
                        });
                    }
                }
            });
        });
    }
}

// 全局变量
let articleManager;

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', function() {
    articleManager = new ArticleManager();
});

// 全局函数供HTML调用
function openArticle(articleId) {
    window.location.href = `article.html?id=${articleId}&type=neuroscience`;
}

function openMathArticle(articleId) {
    window.location.href = `article.html?id=${articleId}&type=mathematics`;
}

function openBookNotes(bookId) {
    window.location.href = `article.html?id=${bookId}&type=book-notes`;
}
