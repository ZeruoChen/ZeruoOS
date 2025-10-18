class WindowManager {
    constructor() {
        this.windows = [];
        this.zIndex = 10;
        this.activeWindow = null;
        this.init();
    }

    init() {
        this.setupClock();
        this.setupDock();
        this.setupMenu();
        this.createDefaultWindow();
    }

    setupClock() {
        const updateClock = () => {
            const now = new Date();
            const timeString = now.toLocaleTimeString('zh-CN', { 
                hour12: false,
                hour: '2-digit',
                minute: '2-digit'
            });
            const dateString = now.toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });
            
            document.querySelector('.clock').textContent = `${dateString} ${timeString}`;
        };
        
        updateClock();
        setInterval(updateClock, 1000);
    }

    setupDock() {
        const dockButtons = document.querySelectorAll('.dock-button');
        dockButtons.forEach((button, index) => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleDockClick(index);
            });
        });
    }

    setupMenu() {
        const menuIcon = document.querySelector('.menu-icon');
        menuIcon.addEventListener('click', () => {
            this.createAboutWindow();
        });
    }

    handleDockClick(index) {
        switch(index) {
            case 0: // 文章列表
                this.createPostListWindow();
                break;
            case 1: // 文章分类
                this.createCategoryWindow();
                break;
            case 2: // 友情链接
                this.createLinksWindow();
                break;
            case 3: // WordPress页面（新的关于按钮）
                this.createAboutWindow();
                break;
            case 4: // 设置（旧的关于按钮）
                this.createPageWindow();
                break;
        }
    }

    createDefaultWindow() {
        this.createPostListWindow();
    }

    createWindow(title, content, width = 600, height = 400) {
        const windowId = 'window-' + Date.now();
        const windowElement = document.createElement('div');
        windowElement.className = 'window active';
        windowElement.id = windowId;
        
        // 移动端自适应窗口大小
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        
        if (screenWidth <= 480) {
            // 移动端：窗口占屏幕宽度的90%，高度的70%
            width = Math.min(screenWidth * 0.9, 400);
            height = Math.min(screenHeight * 0.7, 350);
        } else if (screenWidth <= 768) {
            // 平板端：窗口占屏幕宽度的80%，高度的60%
            width = Math.min(screenWidth * 0.8, 500);
            height = Math.min(screenHeight * 0.6, 400);
        }
        
        windowElement.style.width = width + 'px';
        windowElement.style.height = height + 'px';
        
        // 计算窗口居中位置
        const left = Math.max(0, (screenWidth - width) / 2);
        const top = Math.max(0, (screenHeight - height) / 2);
        
        windowElement.style.left = left + 'px';
        windowElement.style.top = top + 'px';
        
        windowElement.innerHTML = `
            <div class="window-header">
                <div class="window-controls">
                    <div class="window-control window-close" title="关闭">×</div>
                </div>
                <div class="window-title">${title}</div>
            </div>
            <div class="window-content">${content}</div>
        `;

        document.querySelector('.window-container').appendChild(windowElement);
        
        const windowObj = {
            id: windowId,
            element: windowElement,
            title: title,
            content: content
        };
        
        this.windows.push(windowObj);
        this.activateWindow(windowObj);
        this.setupWindowEvents(windowElement, windowObj);
        
        return windowObj;
    }

    setupWindowEvents(windowElement, windowObj) {
        const header = windowElement.querySelector('.window-header');
        const closeBtn = windowElement.querySelector('.window-close');

        // 窗口激活
        windowElement.addEventListener('mousedown', () => {
            this.activateWindow(windowObj);
        });

        // 窗口激活（触摸事件）
        windowElement.addEventListener('touchstart', () => {
            this.activateWindow(windowObj);
        });

        // 关闭窗口（鼠标事件）
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.closeWindow(windowObj);
        });

        // 关闭窗口（触摸事件）
        closeBtn.addEventListener('touchstart', (e) => {
            e.stopPropagation();
            this.closeWindow(windowObj);
        });

        // 窗口拖拽
        this.makeDraggable(windowElement, header);
        
        // 窗口缩放
        this.makeResizable(windowElement);
    }

    makeDraggable(element, handle) {
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        
        // 鼠标事件
        handle.onmousedown = dragMouseDown;
        
        // 触摸事件
        handle.addEventListener('touchstart', dragTouchStart, { passive: false });
        
        function dragMouseDown(e) {
            e = e || window.event;
            e.preventDefault();
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
        }
        
        function dragTouchStart(e) {
            e.preventDefault();
            const touch = e.touches[0];
            pos3 = touch.clientX;
            pos4 = touch.clientY;
            document.addEventListener('touchend', closeDragElement, { passive: false });
            document.addEventListener('touchmove', elementTouchDrag, { passive: false });
        }

        function elementDrag(e) {
            e = e || window.event;
            e.preventDefault();
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            
            updateElementPosition(element, pos1, pos2);
        }
        
        function elementTouchDrag(e) {
            e.preventDefault();
            const touch = e.touches[0];
            pos1 = pos3 - touch.clientX;
            pos2 = pos4 - touch.clientY;
            pos3 = touch.clientX;
            pos4 = touch.clientY;
            
            updateElementPosition(element, pos1, pos2);
        }
        
        function updateElementPosition(element, deltaX, deltaY) {
            // 计算新位置
            let newTop = element.offsetTop - deltaY;
            let newLeft = element.offsetLeft - deltaX;
            
            // 获取窗口尺寸和屏幕尺寸
            const windowWidth = element.offsetWidth;
            const windowHeight = element.offsetHeight;
            const screenWidth = window.innerWidth;
            const screenHeight = window.innerHeight;
            
            // 窗口限位：确保窗口不会移出屏幕
            // 左侧限位
            if (newLeft < 0) {
                newLeft = 0;
            }
            // 右侧限位
            if (newLeft + windowWidth > screenWidth) {
                newLeft = screenWidth - windowWidth;
            }
            // 顶部限位
            if (newTop < 0) {
                newTop = 0;
            }
            // 底部限位
            if (newTop + windowHeight > screenHeight) {
                newTop = screenHeight - windowHeight;
            }
            
            element.style.top = newTop + "px";
            element.style.left = newLeft + "px";
        }

        function closeDragElement() {
            document.onmouseup = null;
            document.onmousemove = null;
            document.removeEventListener('touchend', closeDragElement);
            document.removeEventListener('touchmove', elementTouchDrag);
        }
    }

    makeResizable(element) {
        const resizeHandle = document.createElement('div');
        resizeHandle.style.cssText = `
            position: absolute;
            bottom: 2px;
            right: 2px;
            width: 20px;
            height: 20px;
            background: #A0A0A0;
            cursor: nw-resize;
            border: 1px solid #000;
            border-radius: 2px;
            z-index: 30;
            touch-action: none;
        `;
        element.appendChild(resizeHandle);

        // 鼠标事件
        resizeHandle.addEventListener('mousedown', initResize);
        
        // 触摸事件
        resizeHandle.addEventListener('touchstart', initResizeTouch, { passive: false });

        function initResize(e) {
            e.preventDefault();
            window.addEventListener('mousemove', resize);
            window.addEventListener('mouseup', stopResize);
        }
        
        function initResizeTouch(e) {
            e.preventDefault();
            window.addEventListener('touchmove', resizeTouch, { passive: false });
            window.addEventListener('touchend', stopResizeTouch, { passive: false });
        }

        function resize(e) {
            e.preventDefault();
            updateSize(e.clientX, e.clientY);
        }
        
        function resizeTouch(e) {
            e.preventDefault();
            const touch = e.touches[0];
            updateSize(touch.clientX, touch.clientY);
        }
        
        function updateSize(clientX, clientY) {
            // 获取屏幕尺寸
            const screenWidth = window.innerWidth;
            const screenHeight = window.innerHeight;
            
            // 计算新尺寸
            let newWidth = clientX - element.offsetLeft;
            let newHeight = clientY - element.offsetTop;
            
            // 窗口缩放限位：确保窗口不会超出屏幕边界
            // 最小尺寸限制
            const minWidth = window.innerWidth <= 480 ? 280 : 300;
            const minHeight = window.innerHeight <= 480 ? 180 : 200;
            
            if (newWidth < minWidth) {
                newWidth = minWidth;
            }
            if (newHeight < minHeight) {
                newHeight = minHeight;
            }
            
            // 最大尺寸限制（不超过屏幕尺寸）
            if (newWidth > screenWidth - element.offsetLeft) {
                newWidth = screenWidth - element.offsetLeft;
            }
            if (newHeight > screenHeight - element.offsetTop) {
                newHeight = screenHeight - element.offsetTop;
            }
            
            element.style.width = newWidth + 'px';
            element.style.height = newHeight + 'px';
        }

        function stopResize() {
            window.removeEventListener('mousemove', resize);
            window.removeEventListener('mouseup', stopResize);
        }
        
        function stopResizeTouch() {
            window.removeEventListener('touchmove', resizeTouch);
            window.removeEventListener('touchend', stopResizeTouch);
        }
    }

    activateWindow(windowObj) {
        this.windows.forEach(win => {
            win.element.classList.remove('active');
            win.element.style.zIndex = this.zIndex++;
        });
        
        windowObj.element.classList.add('active');
        windowObj.element.style.zIndex = this.zIndex++;
        this.activeWindow = windowObj;
        
        this.updateDockState();
    }

    closeWindow(windowObj) {
        const index = this.windows.indexOf(windowObj);
        if (index > -1) {
            this.windows.splice(index, 1);
            windowObj.element.remove();
            this.updateDockState();
        }
    }



    updateDockState() {
        const dockButtons = document.querySelectorAll('.dock-button');
        dockButtons.forEach(button => button.classList.remove('active'));
        
        if (this.activeWindow) {
            const windowType = this.getWindowType(this.activeWindow.title);
            if (dockButtons[windowType]) {
                dockButtons[windowType].classList.add('active');
            }
        }
    }

    getWindowType(title) {
        const types = {
            '文章列表': 0,
            '文章分类': 1,
            '友情链接': 2,
            '关于 ZeruoOS': 3,
            '关于页面': 4
        };
        return types[title] || 0;
    }

    // 窗口创建方法
    createPostListWindow() {
        const content = `
            <div class="post-list">
                <h3>最新文章</h3>
                <div class="loading">正在加载文章列表...</div>
                <ul id="post-list-content"></ul>
                <div id="post-load-more"></div>
            </div>
        `;
        
        const window = this.createWindow('文章列表', content, 600, 400);
        this.loadPosts(window.element);
    }

    createCategoryWindow() {
        const content = `
            <div class="category-list">
                <h3>文章分类</h3>
                <div class="loading">正在加载分类列表...</div>
                <ul id="category-list-content"></ul>
            </div>
        `;
        const window = this.createWindow('文章分类', content, 500, 350);
        this.loadCategories(window.element);
    }

    createLinksWindow() {
        const content = `
            <div class="links-list">
                <h3>友情链接</h3>
                <div class="loading">正在加载友情链接...</div>
                <ul id="links-list-content" class="post-list"></ul>
            </div>
        `;
        const window = this.createWindow('友情链接', content, 600, 400);
        this.loadLinks(window.element);
    }

    createPageWindow() {
        const content = `
            <div class="page-content">
                <div class="loading">正在加载页面内容...</div>
                <div id="page-content"></div>
            </div>
        `;
        const window = this.createWindow('关于页面', content, 600, 400);
        this.loadPage(window.element);
    }

    // WordPress API 调用方法
    async loadPosts(windowElement, page = 1) {
        try {
            // 尝试从当前域名获取WordPress API数据
            const response = await fetch(`/wp-json/wp/v2/posts?_embed&per_page=10&page=${page}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const posts = await response.json();
            const totalPages = parseInt(response.headers.get('X-WP-TotalPages')) || 1;
            
            const postList = windowElement.querySelector('#post-list-content');
            const loading = windowElement.querySelector('.loading');
            
            if (loading) loading.remove();
            
            // 如果是第一页，清空列表
            if (page === 1) {
                postList.innerHTML = '';
            }
            
            if (posts && posts.length > 0) {
                posts.forEach(post => {
                    const li = document.createElement('li');
                    const featuredImage = post._embedded && post._embedded['wp:featuredmedia'] && post._embedded['wp:featuredmedia'][0] 
                        ? post._embedded['wp:featuredmedia'][0].source_url 
                        : null;
                    
                    li.innerHTML = `
                        <div class="post-item">
                            <div class="post-thumbnail">
                                ${featuredImage ? `<img src="${featuredImage}" alt="${post.title.rendered}" class="featured-image">` : '<div class="no-image"></div>'}
                            </div>
                            <div class="post-info">
                                <a href="#" class="post-link" data-id="${post.id}">
                                    ${post.title.rendered}
                                </a>
                                <span class="post-date">${new Date(post.date).toLocaleDateString('zh-CN')}</span>
                            </div>
                        </div>
                    `;
                    postList.appendChild(li);
                });
                
                this.setupPostLinks(windowElement);
                
                // 添加加载更多按钮
                this.setupLoadMoreButton(windowElement, 'posts', page, totalPages);
            } else {
                // 如果没有文章，显示演示数据
                const demoPosts = [
                    { id: 1, title: { rendered: '欢迎使用麦金塔主题' }, date: new Date().toISOString() },
                    { id: 2, title: { rendered: 'WordPress主题开发指南' }, date: new Date().toISOString() },
                    { id: 3, title: { rendered: '复古设计风格介绍' }, date: new Date().toISOString() }
                ];
                
                demoPosts.forEach(post => {
                    const li = document.createElement('li');
                    li.innerHTML = `
                        <div class="post-item">
                            <div class="post-thumbnail">
                                <div class="no-image"></div>
                            </div>
                            <div class="post-info">
                                <a href="#" class="post-link" data-id="${post.id}">
                                    ${post.title.rendered}
                                </a>
                                <span class="post-date">${new Date(post.date).toLocaleDateString('zh-CN')}</span>
                            </div>
                        </div>
                    `;
                    postList.appendChild(li);
                });
                
                this.setupPostLinks(windowElement);
            }
        } catch (error) {
            console.error('加载文章失败:', error);
            const postList = windowElement.querySelector('#post-list-content');
            const loading = windowElement.querySelector('.loading');
            if (loading) loading.remove();
            
            // 显示演示数据作为回退
            const demoPosts = [
                { id: 1, title: '欢迎使用麦金塔主题', date: new Date() },
                { id: 2, title: 'WordPress主题开发指南', date: new Date() },
                { id: 3, title: '复古设计风格介绍', date: new Date() }
            ];
            
            demoPosts.forEach(post => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <div class="post-item">
                        <div class="post-thumbnail">
                            <div class="no-image"></div>
                        </div>
                        <div class="post-info">
                            <a href="#" class="post-link" data-id="${post.id}">
                                ${post.title}
                            </a>
                            <span class="post-date">${post.date.toLocaleDateString('zh-CN')}</span>
                        </div>
                    </div>
                `;
                postList.appendChild(li);
            });
            
            this.setupPostLinks(windowElement);
        }
    }

    async loadCategories(windowElement) {
        try {
            const response = await fetch('/wp-json/wp/v2/categories?per_page=20');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const categories = await response.json();
            
            const categoryList = windowElement.querySelector('#category-list-content');
            const loading = windowElement.querySelector('.loading');
            
            if (loading) loading.remove();
            
            if (categories && categories.length > 0) {
                categories.forEach(category => {
                    const li = document.createElement('li');
                    li.innerHTML = `
                        <a href="#" class="category-link" data-id="${category.id}">
                            ${category.name} (${category.count})
                        </a>
                    `;
                    categoryList.appendChild(li);
                });
                
                this.setupCategoryLinks(windowElement);
            } else {
                // 显示演示分类数据
                const demoCategories = [
                    { id: 1, name: '技术文章', count: 5 },
                    { id: 2, name: '设计分享', count: 3 },
                    { id: 3, name: '生活随笔', count: 2 }
                ];
                
                demoCategories.forEach(category => {
                    const li = document.createElement('li');
                    li.innerHTML = `
                        <a href="#" class="category-link" data-id="${category.id}">
                            ${category.name} (${category.count})
                        </a>
                    `;
                    categoryList.appendChild(li);
                });
                
                this.setupCategoryLinks(windowElement);
            }
        } catch (error) {
            console.error('加载分类失败:', error);
            const categoryList = windowElement.querySelector('#category-list-content');
            const loading = windowElement.querySelector('.loading');
            if (loading) loading.remove();
            
            // 显示演示分类数据作为回退
            const demoCategories = [
                { id: 1, name: '技术文章', count: 5 },
                { id: 2, name: '设计分享', count: 3 },
                { id: 3, name: '生活随笔', count: 2 }
            ];
            
            demoCategories.forEach(category => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <a href="#" class="category-link" data-id="${category.id}">
                        ${category.name} (${category.count})
                    </a>
                `;
                categoryList.appendChild(li);
            });
            
            this.setupCategoryLinks(windowElement);
        }
    }

    async loadPage(windowElement) {
        try {
            // 尝试从WordPress API获取页面内容（ID为2）
            const response = await fetch('/wp-json/wp/v2/pages/2');
            
            if (response.ok) {
                const page = await response.json();
                const pageContent = windowElement.querySelector('#page-content');
                const loading = windowElement.querySelector('.loading');
                
                if (loading) loading.remove();
                
                // 显示页面内容
                pageContent.innerHTML = `
                    <h3>${page.title.rendered}</h3>
                    <div class="page-body">${page.content.rendered}</div>
                `;
            } else {
                throw new Error('页面加载失败');
            }
        } catch (error) {
            console.error('加载页面失败:', error);
            const pageContent = windowElement.querySelector('#page-content');
            const loading = windowElement.querySelector('.loading');
            if (loading) loading.remove();
            
            // 显示演示内容作为回退
            pageContent.innerHTML = `
                <h3>关于页面</h3>
                <div class="page-body">
                    <p>这是WordPress页面ID为2的演示内容。</p>
                    <p>如果您看到这条消息，说明WordPress API暂时不可用，或者页面ID 2不存在。</p>
                    <p>请确保您的WordPress网站已启用REST API功能。</p>
                </div>
            `;
        }
    }

    async loadLinks(windowElement) {
        try {
            // 首先尝试自定义API端点获取友情链接
            try {
                const customResponse = await fetch('/wp-json/macintosh-classic/v1/links');
                if (customResponse.ok) {
                    const links = await customResponse.json();
                    
                    const linksList = windowElement.querySelector('#links-list-content');
                    const loading = windowElement.querySelector('.loading');
                    
                    if (loading) loading.remove();
                    
                    if (links && links.length > 0) {
                        links.forEach(link => {
                            const li = document.createElement('li');
                            const url = link.url || link.link_url || '#';
                            const name = link.name || link.link_name || '未知链接';
                            const description = link.description || link.link_description || link.notes || '暂无描述';
                            const image = link.image || link.link_image || './Poolsuite/dock/settings.png';
                            
                            li.innerHTML = `
                                <div class="post-item">
                                    <div class="post-thumbnail">
                                        <img src="${image}" alt="${name}" class="featured-image" onerror="this.src='./Poolsuite/dock/settings.png'">
                                    </div>
                                    <div class="post-info">
                                        <a href="${url}" target="_blank" class="post-link">
                                            ${name}
                                        </a>
                                        <span class="post-date">${description}</span>
                                    </div>
                                </div>
                            `;
                            linksList.appendChild(li);
                        });
                        return; // 成功加载后直接返回
                    }
                }
            } catch (customError) {
                console.log('自定义API不可用，使用默认链接:', customError);
            }
            
            // 如果自定义API不可用或返回空数据，使用默认链接
            const linksList = windowElement.querySelector('#links-list-content');
            const loading = windowElement.querySelector('.loading');
            if (loading) loading.remove();
            
            const defaultLinks = [
                { name: 'Poolsuite', url: 'https://poolsuite.net', description: '复古风格的在线音乐平台', image: './Poolsuite/img/leisure-buck.f37fdecd.svg' },
                { name: 'WordPress', url: 'https://wordpress.org', description: '开源的内容管理系统', image: './Poolsuite/dock/settings.png' },
                { name: 'WordPress中文', url: 'https://cn.wordpress.org', description: 'WordPress中文官方网站', image: './Poolsuite/dock/settings.png' }
            ];
            
            defaultLinks.forEach(link => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <div class="post-item">
                        <div class="post-thumbnail">
                            <img src="${link.image}" alt="${link.name}" class="featured-image" onerror="this.src='./Poolsuite/dock/settings.png'">
                        </div>
                        <div class="post-info">
                            <a href="${link.url}" target="_blank" class="post-link">
                                ${link.name}
                            </a>
                            <span class="post-date">${link.description}</span>
                        </div>
                    </div>
                `;
                linksList.appendChild(li);
            });
        } catch (error) {
            console.error('加载链接失败:', error);
            const linksList = windowElement.querySelector('#links-list-content');
            const loading = windowElement.querySelector('.loading');
            if (loading) loading.remove();
            
            // 显示默认链接作为回退
            const defaultLinks = [
                { name: 'Poolsuite', url: 'https://poolsuite.net', description: '复古风格的在线音乐平台', image: './Poolsuite/img/leisure-buck.f37fdecd.svg' },
                { name: 'WordPress', url: 'https://wordpress.org', description: '开源的内容管理系统', image: './Poolsuite/dock/settings.png' },
                { name: 'WordPress中文', url: 'https://cn.wordpress.org', description: 'WordPress中文官方网站', image: './Poolsuite/dock/settings.png' }
            ];
            
            defaultLinks.forEach(link => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <div class="post-item">
                        <div class="post-thumbnail">
                            <img src="${link.image}" alt="${link.name}" class="featured-image" onerror="this.src='./Poolsuite/dock/settings.png'">
                        </div>
                        <div class="post-info">
                            <a href="${link.url}" target="_blank" class="post-link">
                                ${link.name}
                            </a>
                            <span class="post-date">${link.description}</span>
                        </div>
                    </div>
                `;
                linksList.appendChild(li);
            });
        }
    }

    setupCategoryLinks(windowElement) {
        const links = windowElement.querySelectorAll('.category-link');
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const categoryId = link.getAttribute('data-id');
                const categoryName = link.textContent.split(' (')[0];
                this.openCategoryPosts(categoryId, categoryName);
            });
        });
    }

    async openCategoryPosts(categoryId, categoryName, page = 1) {
        try {
            const response = await fetch(`/wp-json/wp/v2/posts?categories=${categoryId}&per_page=10&page=${page}&_embed`);
            const posts = await response.json();
            const totalPages = parseInt(response.headers.get('X-WP-TotalPages')) || 1;
            
            // 如果是第一页，创建新窗口
            if (page === 1) {
                let content = `
                    <h3>${categoryName} 分类下的文章</h3>
                    <div class="loading">正在加载文章...</div>
                    <ul id="category-posts-content" class="post-list"></ul>
                    <div id="category-load-more"></div>
                `;
                
                const window = this.createWindow(`${categoryName} - 文章列表`, content, 600, 400);
                this.windowCategoryPosts = window.element; // 保存窗口引用
            }
            
            const postList = this.windowCategoryPosts.querySelector('#category-posts-content');
            const loading = this.windowCategoryPosts.querySelector('.loading');
            
            if (loading) loading.remove();
            
            // 如果是第一页，清空列表
            if (page === 1) {
                postList.innerHTML = '';
            }
            
            if (posts.length > 0) {
                posts.forEach(post => {
                    const li = document.createElement('li');
                    const featuredImage = post._embedded && post._embedded['wp:featuredmedia'] && post._embedded['wp:featuredmedia'][0] 
                        ? post._embedded['wp:featuredmedia'][0].source_url 
                        : null;
                    
                    li.innerHTML = `
                        <div class="post-item">
                            <div class="post-thumbnail">
                                ${featuredImage ? `<img src="${featuredImage}" alt="${post.title.rendered}" class="featured-image">` : '<div class="no-image"></div>'}
                            </div>
                            <div class="post-info">
                                <a href="#" class="post-link" data-id="${post.id}">
                                    ${post.title.rendered}
                                </a>
                                <span class="post-date">${new Date(post.date).toLocaleDateString('zh-CN')}</span>
                            </div>
                        </div>
                    `;
                    postList.appendChild(li);
                });
                
                this.setupPostLinks(this.windowCategoryPosts);
                
                // 添加加载更多按钮
                this.setupLoadMoreButton(this.windowCategoryPosts, 'category', page, totalPages, categoryId, categoryName);
            } else {
                if (page === 1) {
                    postList.innerHTML = '<p>该分类下暂无文章</p>';
                }
            }
        } catch (error) {
            console.error('加载分类文章失败:', error);
            if (page === 1) {
                const content = `<p>加载分类文章失败: ${error.message}</p>`;
                this.createWindow(`${categoryName} - 文章列表`, content, 500, 300);
            }
        }
    }

    createSettingsWindow() {
        const content = `
            <div class="settings">
                <h3>系统设置</h3>
                <div class="setting-item">
                    <label>主题颜色:</label>
                    <select id="theme-color">
                        <option value="default">默认</option>
                        <option value="blue">蓝色</option>
                        <option value="green">绿色</option>
                    </select>
                </div>
                <div class="setting-item">
                    <label>字体大小:</label>
                    <input type="range" id="font-size" min="10" max="16" value="12">
                </div>
            </div>
        `;
        this.createWindow('系统设置', content, 400, 300);
    }

    createAboutWindow() {
        const content = `
            <div class="about-window">
                <div class="about-header">
                    <div class="system-logo">ZeruoOS</div>
                    <div class="system-version">版本 1.0.0</div>
                </div>
                <div class="about-content">
                    <div class="copyright">© 2024 Zeruo. 保留所有权利。</div>
                    <div class="description">
                        <p>ZeruoOS 是我的一个休闲作品，灵感来自经典的麦金塔系统和 Poolsuite 的复古风格。</p>
                        <p>这个主题还在完善中，欢迎反馈和建议。</p>
                        <p>Brought to you by Zeruo</p>
                    </div>
                    <div class="author-info">
                        <h4>作者介绍</h4>
                        <p>Zeruo - 泽若</p>
                        <p>就读（摆烂）于中南大学湘雅医学院检验系。</p>
                        <p>爱好电脑硬件/读书/面向ChatGPT编程。</p>
                    </div>
                    <div class="contact-info">
                        <h4>联系作者</h4>
                        <p>邮箱: ZeruoChen@iCloud.com</p>
                        <p>网站: https://zeruo.net</p>
                    </div>
                </div>
            </div>
        `;
        this.createWindow('关于 ZeruoOS', content, 500, 450);
    }

    setupPostLinks(windowElement) {
        const links = windowElement.querySelectorAll('.post-link');
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const postId = link.getAttribute('data-id');
                this.openPostWindow(postId, link.textContent);
            });
        });
    }

    setupLoadMoreButton(windowElement, type, currentPage, totalPages, categoryId = null, categoryName = null) {
        // 移除现有的加载更多按钮
        const existingButton = windowElement.querySelector('.load-more-button');
        if (existingButton) {
            existingButton.remove();
        }
        
        // 如果还有更多页面，添加加载更多按钮
        if (currentPage < totalPages) {
            const loadMoreContainer = windowElement.querySelector(type === 'posts' ? '#post-load-more' : '#category-load-more');
            const button = document.createElement('button');
            button.className = 'load-more-button';
            button.innerHTML = '加载更多文章';
            
            button.addEventListener('click', () => {
                button.disabled = true;
                button.innerHTML = '正在加载...';
                
                if (type === 'posts') {
                    this.loadPosts(windowElement, currentPage + 1);
                } else if (type === 'category') {
                    this.openCategoryPosts(categoryId, categoryName, currentPage + 1);
                }
            });
            
            loadMoreContainer.appendChild(button);
        }
    }

    async openPostWindow(postId, title) {
        try {
            // 尝试从WordPress API获取文章内容
            const response = await fetch(`/wp-json/wp/v2/posts/${postId}?_embed`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const post = await response.json();
            
            let content = `
                <div class="post-content">
                    <h2>${post.title.rendered}</h2>
                    <div class="post-meta">
                        <span class="post-date">${new Date(post.date).toLocaleDateString('zh-CN')}</span>
                    </div>
                    <div class="post-body">
                        ${post.content.rendered}
                    </div>
                </div>
            `;
            
            this.createWindow(post.title.rendered, content, 700, 500);
        } catch (error) {
            console.error('加载文章内容失败:', error);
            
            // 如果API调用失败，显示演示内容
            const demoContent = `
                <div class="post-content">
                    <h2>${title}</h2>
                    <div class="post-meta">
                        <span class="post-date">${new Date().toLocaleDateString('zh-CN')}</span>
                    </div>
                    <div class="post-body">
                        <p>这是文章 ${postId} 的演示内容。</p>
                        <p>麦金塔经典主题为您提供复古的桌面体验。</p>
                        <p>如果您看到这条消息，说明WordPress API暂时不可用，或者文章ID ${postId} 不存在。</p>
                        <p>请确保您的WordPress网站已启用REST API功能。</p>
                    </div>
                </div>
            `;
            
            this.createWindow(title, demoContent, 600, 400);
        }
    }
}

// 初始化窗口管理器
document.addEventListener('DOMContentLoaded', () => {
    window.windowManager = new WindowManager();
});