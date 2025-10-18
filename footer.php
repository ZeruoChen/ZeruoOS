<!-- WordPress底部 -->
<?php wp_footer(); ?>

<!-- 主题JavaScript -->
<script src="<?php echo get_template_directory_uri(); ?>/js/window-manager.js"></script>

<!-- 触摸设备优化 -->
<script>
// 触摸设备优化
if ('ontouchstart' in window) {
    document.body.classList.add('touch-device');
    
    // 增大触摸区域
    const controls = document.querySelectorAll('.window-control, .dock-item');
    controls.forEach(control => {
        control.style.minWidth = '44px';
        control.style.minHeight = '44px';
    });
}

// 移动端程序坞折叠功能
function setupMobileDock() {
    const dock = document.querySelector('.dock');
    const toggleBtn = document.createElement('div');
    toggleBtn.innerHTML = '≡';
    toggleBtn.style.cssText = `
        position: absolute;
        top: -30px;
        left: 50%;
        transform: translateX(-50%);
        width: 30px;
        height: 20px;
        background: rgba(249, 240, 233, 0.9);
        border: 1px solid #A0A0A0;
        border-bottom: none;
        border-radius: 5px 5px 0 0;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-size: 12px;
        z-index: 901;
    `;
    
    dock.appendChild(toggleBtn);
    
    let isCollapsed = false;
    toggleBtn.addEventListener('click', () => {
        isCollapsed = !isCollapsed;
        if (isCollapsed) {
            dock.style.transform = 'translateX(-50%) translateY(100%)';
            toggleBtn.innerHTML = '⊻';
        } else {
            dock.style.transform = 'translateX(-50%)';
            toggleBtn.innerHTML = '≡';
        }
    });
}

// 在移动设备上启用程序坞折叠
if (window.innerWidth <= 768) {
    document.addEventListener('DOMContentLoaded', setupMobileDock);
}

// 窗口拖拽优化（移动端）
function setupTouchDragging() {
    let activeWindow = null;
    let startX, startY, initialX, initialY;
    
    document.addEventListener('touchstart', (e) => {
        const header = e.target.closest('.window-header');
        if (header) {
            activeWindow = header.parentElement;
            const rect = activeWindow.getBoundingClientRect();
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            initialX = rect.left;
            initialY = rect.top;
            e.preventDefault();
        }
    });
    
    document.addEventListener('touchmove', (e) => {
        if (activeWindow) {
            const currentX = e.touches[0].clientX;
            const currentY = e.touches[0].clientY;
            const dx = currentX - startX;
            const dy = currentY - startY;
            
            activeWindow.style.left = (initialX + dx) + 'px';
            activeWindow.style.top = (initialY + dy) + 'px';
            e.preventDefault();
        }
    });
    
    document.addEventListener('touchend', () => {
        activeWindow = null;
    });
}

// 初始化触摸拖拽
if ('ontouchstart' in window) {
    document.addEventListener('DOMContentLoaded', setupTouchDragging);
}
</script>

</body>
</html>