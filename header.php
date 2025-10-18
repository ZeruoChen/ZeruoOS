<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php bloginfo('name'); ?> - <?php bloginfo('description'); ?></title>
    
    <!-- 主题样式 -->
    <link rel="stylesheet" href="<?php echo get_template_directory_uri(); ?>/style.css">
    
    <!-- WordPress头部 -->
    <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>

<!-- 加载动画 -->
<div id="loading" style="
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: #F6D5D5;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    font-family: 'Chicago', 'Monaco', monospace;
    font-size: 14px;
    color: #000;
">
    <div style="text-align: center;">
        <img src="<?php echo get_template_directory_uri(); ?>/avicon.png" alt="Logo" style="width: 64px; height: 64px; margin-bottom: 20px;">
        <p>正在启动ZeruoOS...</p>
        <div style="width: 200px; height: 4px; background: #A0A0A0; margin: 20px auto; border: 1px solid #000;">
            <div id="loading-bar" style="width: 0%; height: 100%; background: #000;"></div>
        </div>
    </div>
</div>

<script>
// 模拟启动加载
window.addEventListener('load', function() {
    const loadingBar = document.getElementById('loading-bar');
    let progress = 0;
    
    const interval = setInterval(() => {
        progress += Math.random() * 10;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            setTimeout(() => {
                document.getElementById('loading').style.display = 'none';
            }, 500);
        }
        loadingBar.style.width = progress + '%';
    }, 100);
});
</script>