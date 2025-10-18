<?php
/**
 * 麦金塔经典主题 - 主模板文件
 */

get_header(); ?>

<div class="desktop">
    <!-- 菜单栏 -->
    <div class="menu-bar">
        <div class="menu-left">
            <div class="menu-icon">
                <img src="<?php echo get_template_directory_uri(); ?>/avicon.png" alt="泽若" style="width: 16px; height: 16px; margin-right: 5px;">
            </div>
            <span>泽若</span>
        </div>
        <div class="menu-right">
            <div class="clock"></div>
        </div>
    </div>

    <!-- 窗口容器 -->
    <div class="window-container">
        <!-- 窗口将通过JavaScript动态创建 -->
    </div>

    <!-- 程序坞 -->
    <div class="dock">
        <div class="dock-button" data-app="posts">
            <div class="dock-icon">
                <img src="<?php echo get_template_directory_uri(); ?>/Poolsuite/dock/newsroom.png" alt="文章列表">
            </div>
            <div class="dock-label">文章</div>
        </div>
        <div class="dock-separator"></div>
        <div class="dock-button" data-app="categories">
            <div class="dock-icon">
                <img src="<?php echo get_template_directory_uri(); ?>/Poolsuite/dock/mixtapes.png" alt="文章分类">
            </div>
            <div class="dock-label">分类</div>
        </div>
        <div class="dock-separator"></div>
        <div class="dock-button" data-app="links">
            <div class="dock-icon">
                <img src="<?php echo get_template_directory_uri(); ?>/Poolsuite/dock/guestbook.png" alt="友情链接">
            </div>
            <div class="dock-label">链接</div>
        </div>
        <div class="dock-separator"></div>
        <div class="dock-button" data-app="settings">
            <div class="dock-icon">
                <img src="<?php echo get_template_directory_uri(); ?>/Poolsuite/dock/settings.png" alt="设置">
            </div>
            <div class="dock-label">设置</div>
        </div>
        <div class="dock-separator"></div>
        <div class="dock-button" data-app="page">
            <div class="dock-icon">
                <img src="<?php echo get_template_directory_uri(); ?>/Poolsuite/dock/eventCalendar.png" alt="关于">
            </div>
            <div class="dock-label">关于</div>
        </div>
    </div>
</div>

<?php get_footer(); ?>