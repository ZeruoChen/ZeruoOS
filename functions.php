<?php
/**
 * 麦金塔经典主题功能文件
 */

// 主题设置
function macintosh_classic_setup() {
    // 添加主题支持
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
    add_theme_support('custom-logo');
    add_theme_support('html5', array(
        'search-form',
        'comment-form',
        'comment-list',
        'gallery',
        'caption',
    ));
    
    // 注册菜单
    register_nav_menus(array(
        'primary' => __('主菜单', 'macintosh-classic'),
    ));
}
add_action('after_setup_theme', 'macintosh_classic_setup');

// 加载样式和脚本
function macintosh_classic_scripts() {
    // 主题样式
    wp_enqueue_style('macintosh-classic-style', get_stylesheet_uri());
    
    // 主题脚本
    wp_enqueue_script('macintosh-classic-window-manager', 
        get_template_directory_uri() . '/js/window-manager.js', 
        array(), '1.0.0', true
    );
    
    // WordPress API支持
    wp_localize_script('macintosh-classic-window-manager', 'wpApiSettings', array(
        'root' => esc_url_raw(rest_url()),
        'nonce' => wp_create_nonce('wp_rest')
    ));
}
add_action('wp_enqueue_scripts', 'macintosh_classic_scripts');

// 自定义文章类型和分类
function macintosh_classic_custom_post_types() {
    // 可以在这里添加自定义文章类型
}
add_action('init', 'macintosh_classic_custom_post_types');

// AJAX处理文章数据
function macintosh_classic_get_posts() {
    $posts = get_posts(array(
        'numberposts' => 10,
        'post_status' => 'publish'
    ));
    
    $formatted_posts = array();
    foreach ($posts as $post) {
        $formatted_posts[] = array(
            'id' => $post->ID,
            'title' => $post->post_title,
            'excerpt' => wp_trim_words($post->post_content, 20),
            'date' => get_the_date('', $post->ID),
            'permalink' => get_permalink($post->ID)
        );
    }
    
    wp_send_json_success($formatted_posts);
}
add_action('wp_ajax_get_posts', 'macintosh_classic_get_posts');
add_action('wp_ajax_nopriv_get_posts', 'macintosh_classic_get_posts');

// 自定义小工具区域
function macintosh_classic_widgets_init() {
    register_sidebar(array(
        'name'          => __('侧边栏', 'macintosh-classic'),
        'id'            => 'sidebar-1',
        'description'   => __('添加小工具到这里', 'macintosh-classic'),
        'before_widget' => '<section id="%1$s" class="widget %2$s">',
        'after_widget'  => '</section>',
        'before_title'  => '<h3 class="widget-title">',
        'after_title'   => '</h3>',
    ));
}
add_action('widgets_init', 'macintosh_classic_widgets_init');

// 自定义CSS类
function macintosh_classic_body_classes($classes) {
    // 添加设备类型类
    if (wp_is_mobile()) {
        $classes[] = 'is-mobile';
    }
    
    return $classes;
}
add_filter('body_class', 'macintosh_classic_body_classes');

// 主题自定义选项
function macintosh_classic_customize_register($wp_customize) {
    // 主题颜色设置
    $wp_customize->add_section('macintosh_classic_colors', array(
        'title'    => __('主题颜色', 'macintosh-classic'),
        'priority' => 30,
    ));
    
    $wp_customize->add_setting('primary_color', array(
        'default'   => '#F6D5D5',
        'transport' => 'refresh',
    ));
    
    $wp_customize->add_control(new WP_Customize_Color_Control($wp_customize, 'primary_color', array(
        'label'    => __('主色调', 'macintosh-classic'),
        'section'  => 'macintosh_classic_colors',
        'settings' => 'primary_color',
    )));
}
add_action('customize_register', 'macintosh_classic_customize_register');

// 输出自定义CSS
function macintosh_classic_custom_css() {
    $primary_color = get_theme_mod('primary_color', '#F6D5D5');
    ?>
    <style type="text/css">
        .desktop { background-color: <?php echo $primary_color; ?>; }
        .menu-bar { background: linear-gradient(to bottom, <?php echo $primary_color; ?>, #E8E0D9); }
    </style>
    <?php
}
add_action('wp_head', 'macintosh_classic_custom_css');

// 短代码支持
function macintosh_classic_window_shortcode($atts, $content = null) {
    $atts = shortcode_atts(array(
        'title' => '窗口',
        'width' => '400',
        'height' => '300'
    ), $atts);
    
    return '<div class="custom-window" data-title="' . esc_attr($atts['title']) . 
           '" data-width="' . esc_attr($atts['width']) . '" data-height="' . 
           esc_attr($atts['height']) . '">' . do_shortcode($content) . '</div>';
}
add_shortcode('window', 'macintosh_classic_window_shortcode');

// 启用WordPress REST API支持
if (function_exists('add_action')) {
    add_action('rest_api_init', 'macintosh_classic_rest_api_init');
}

function macintosh_classic_rest_api_init() {
    // 确保REST API已启用
    if (function_exists('register_rest_route')) {
        // 添加自定义端点用于获取友情链接
        register_rest_route('macintosh-classic/v1', '/links', array(
            'methods' => 'GET',
            'callback' => 'macintosh_classic_get_links',
            'permission_callback' => '__return_true'
        ));
    }
}

function macintosh_classic_get_links() {
    // 尝试从WordPress链接管理器获取链接
    if (function_exists('get_bookmarks')) {
        $links = get_bookmarks(array(
            'orderby' => 'name',
            'order' => 'ASC'
        ));
        
        $formatted_links = array();
        foreach ($links as $link) {
            // 获取链接的图片地址，优先使用link_image字段，如果没有则使用默认图标
            $image_url = '';
            if (!empty($link->link_image)) {
                $image_url = $link->link_image;
            } else {
                // 使用默认图标作为备用
                $image_url = get_template_directory_uri() . '/Poolsuite/dock/settings.png';
            }
            
            $formatted_links[] = array(
                'id' => $link->link_id,
                'name' => $link->link_name,
                'url' => $link->link_url,
                'description' => $link->link_description,
                'image' => $image_url
            );
        }
        
        return $formatted_links;
    }
    
    // 如果没有链接管理器，返回默认链接
    return array(
        array('name' => 'Poolsuite', 'url' => 'https://poolsuite.net', 'description' => '复古风格的在线音乐平台', 'image' => get_template_directory_uri() . '/Poolsuite/img/leisure-buck.f37fdecd.svg'),
        array('name' => 'WordPress', 'url' => 'https://wordpress.org', 'description' => '开源的内容管理系统', 'image' => get_template_directory_uri() . '/Poolsuite/dock/settings.png'),
        array('name' => 'WordPress中文', 'url' => 'https://cn.wordpress.org', 'description' => 'WordPress中文官方网站', 'image' => get_template_directory_uri() . '/Poolsuite/dock/settings.png')
    );
}

// 主题激活时的设置
function macintosh_classic_activation() {
    // 设置默认选项
    if (!get_option('macintosh_classic_activated')) {
        update_option('macintosh_classic_activated', true);
    }
}
add_action('after_switch_theme', 'macintosh_classic_activation');

add_filter('pre_option_link_manager_enabled', '__return_true');