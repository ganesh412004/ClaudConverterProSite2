// Global Variables
const BLOG_POSTS_URL = 'data/blog-posts.json';
const NEWS_ARTICLES_URL = 'data/news-articles.json';

// --- Utility Functions ---

/**
 * Fetches and parses JSON data from a given URL.
 * @param {string} url - The URL to fetch JSON from.
 * @returns {Promise<any>} - A promise that resolves with the parsed JSON data.
 */
async function fetchJSON(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error fetching JSON from ${url}:`, error);
        return null; // Or handle more gracefully
    }
}

/**
 * Finds a post by its slug from an array of posts.
 * @param {string} slug - The slug to search for.
 * @param {Array<Object>} posts - An array of post objects.
 * @returns {Object|null} - The found post object or null if not found.
 */
function getPostBySlug(slug, posts) {
    if (!Array.isArray(posts)) {
        console.error("getPostBySlug: posts is not an array", posts);
        return null;
    }
    return posts.find(post => post.slug === slug);
}

/**
 * Formats an ISO date string to a more readable format (e.g., "July 28, 2024").
 * @param {string} isoDateString - The ISO date string.
 * @returns {string} - The formatted date string.
 */
function formatDate(isoDateString) {
    if (!isoDateString) return 'Date not available';
    try {
        const date = new Date(isoDateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } catch (e) {
        console.error("Error formatting date:", e);
        return "Invalid Date";
    }
}

/**
 * Generates a URL-friendly slug from a title.
 * @param {string} title - The title to slugify.
 * @returns {string} - The slugified title.
 */
function generateSlug(title) {
    return title
        .toLowerCase()
        .replace(/\s+/g, '-') // Replace spaces with -
        .replace(/[^\w-]+/g, '') // Remove all non-word chars
        .replace(/--+/g, '-') // Replace multiple - with single -
        .replace(/^-+/, '') // Trim - from start of text
        .replace(/-+$/, ''); // Trim - from end of text
}

// --- Dynamic Meta Tag & Schema.org Functions ---

/**
 * Updates document meta tags for SEO and social sharing.
 * @param {string} title - The page title.
 * @param {string} description - The meta description.
 * @param {string} imageUrl - URL for Open Graph image.
 * @param {string} pageUrl - The canonical URL of the page.
 */
function setMetaTags(title, description, imageUrl, pageUrl) {
    document.title = title;

    let metaDescTag = document.querySelector('meta[name="description"]');
    if (!metaDescTag) {
        metaDescTag = document.createElement('meta');
        metaDescTag.setAttribute('name', 'description');
        document.head.appendChild(metaDescTag);
    }
    metaDescTag.setAttribute('content', description);

    // Open Graph Tags
    updateOrCreateMetaTag('og:title', title);
    updateOrCreateMetaTag('og:description', description);
    updateOrCreateMetaTag('og:image', imageUrl);
    updateOrCreateMetaTag('og:url', pageUrl);
    updateOrCreateMetaTag('og:type', 'article'); // Assuming it's an article page

    // Twitter Card Tags
    updateOrCreateMetaTag('twitter:card', 'summary_large_image');
    updateOrCreateMetaTag('twitter:title', title);
    updateOrCreateMetaTag('twitter:description', description);
    updateOrCreateMetaTag('twitter:image', imageUrl);
}

function updateOrCreateMetaTag(propertyOrName, content, isProperty = true) {
    const selector = isProperty ? `meta[property="${propertyOrName}"]` : `meta[name="${propertyOrName}"]`;
    let tag = document.querySelector(selector);
    if (!tag) {
        tag = document.createElement('meta');
        if (isProperty) tag.setAttribute('property', propertyOrName);
        else tag.setAttribute('name', propertyOrName);
        document.head.appendChild(tag);
    }
    tag.setAttribute('content', content);
}

/**
 * Generates a JSON-LD script tag for Article or BlogPosting schema.
 * @param {Object} post - The post object.
 * @param {string} type - "BlogPosting" or "Article" (for news)
 */
function generateArticleSchema(post, type = "BlogPosting") {
    const schema = {
        "@context": "https://schema.org",
        "@type": type,
        "headline": post.title,
        "name": post.title, // Added for completeness
        "description": post.meta_description,
        "image": post.featured_image_url || "https://claudconverter.com/default-image.jpg", // Provide a fallback
        "author": {
            "@type": "Person",
            "name": post.author || "ClaudConverter Pro Team" // Fallback author
        },
        "publisher": {
            "@type": "Organization",
            "name": "ClaudConverter Pro",
            "logo": {
                "@type": "ImageObject",
                "url": "https://claudconverter.com/logo.png" // Replace with actual logo URL
            }
        },
        "datePublished": post.publish_date,
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": window.location.href
        }
    };
    if (post.tags) {
        schema.keywords = post.tags.join(", ");
    }
    if (post.category && type === "Article") { // Specific to NewsArticle
         schema.articleSection = post.category;
    }


    let schemaScript = document.getElementById('article-schema');
    if (!schemaScript) {
        schemaScript = document.createElement('script');
        schemaScript.setAttribute('type', 'application/ld+json');
        schemaScript.setAttribute('id', 'article-schema');
        document.head.appendChild(schemaScript);
    }
    schemaScript.textContent = JSON.stringify(schema, null, 2);
}

// --- Rendering Functions ---

/**
 * Implements lazy loading for a given image element.
 * @param {HTMLImageElement} imgElement - The image element to lazy load.
 */
function lazyLoadImage(imgElement) {
    const dataSrc = imgElement.getAttribute('data-src');
    if (!dataSrc) return;

    const observer = new IntersectionObserver((entries, observerInstance) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                imgElement.setAttribute('src', dataSrc);
                imgElement.removeAttribute('data-src'); // Optional: clean up
                observerInstance.unobserve(imgElement); // Stop observing once loaded
            }
        });
    }, { threshold: 0.1 }); // Adjust threshold as needed

    observer.observe(imgElement);
}

/**
 * Renders a list of articles into the specified container.
 * @param {Array<Object>} articles - Array of article objects.
 * @param {string} containerId - ID of the HTML container to render into.
 * @param {string} type - 'blog' or 'news'.
 */
function renderArticleList(articles, containerId, type) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container with ID ${containerId} not found.`);
        return;
    }
    container.innerHTML = ''; // Clear existing content

    if (!articles || articles.length === 0) {
        container.innerHTML = '<p>No articles found.</p>';
        return;
    }

    const listElement = document.createElement('div');
    listElement.className = type === 'blog' ? 'blog-list' : 'news-list';

    articles.filter(article => article.status === 'published').forEach(article => {
        const item = document.createElement('article');
        item.className = type === 'blog' ? 'blog-post-item' : 'news-article-item';

        let featuredImageHtml = '';
        if (article.featured_image_url) {
            // Using a placeholder for src, actual image in data-src for lazy loading
            featuredImageHtml = `
                <img src="https://via.placeholder.com/300x150.png?text=Loading..."
                     data-src="${article.featured_image_url}"
                     alt="${article.alt_text || article.title}"
                     style="max-width:100%; height:auto; border-radius: var(--border-radius); margin-bottom: 15px;"
                     class="lazy-image">`;
        }

        const queryParam = type === 'blog' ? 'post' : 'article';
        const link = `${type}.html?${queryParam}=${article.slug}`;

        item.innerHTML = `
            ${featuredImageHtml}
            <h3><a href="${link}">${article.title}</a></h3>
            <p class="publish-date">Published on: <time datetime="${article.publish_date}">${formatDate(article.publish_date)}</time></p>
            ${type === 'news' && article.category ? `<p class="news-category">Category: <strong>${article.category}</strong></p>` : ''}
            <p>${article.meta_description.substring(0, 150)}...</p> {/* Snippet */}
            <a href="${link}" class="btn btn-outline btn-read-more">Read More</a>
        `;
        listElement.appendChild(item);
    });

    container.appendChild(listElement);
    document.querySelectorAll('.lazy-image').forEach(img => lazyLoadImage(img));
}

/**
 * Renders a single blog post or news article.
 * @param {Object} article - The article object.
 * @param {string} containerId - ID of the HTML container.
 * @param {string} type - 'blog' or 'news'.
 */
function renderSingleArticle(article, containerId, type) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container with ID ${containerId} not found.`);
        return;
    }
    container.innerHTML = ''; // Clear existing content

    // 1. Set Meta Tags and Schema
    const pageUrl = window.location.href;
    setMetaTags(article.meta_title || article.title, article.meta_description, article.featured_image_url, pageUrl);
    generateArticleSchema(article, type === 'blog' ? 'BlogPosting' : 'Article');

    // 2. Render Breadcrumbs
    renderBreadcrumbs(type, article.title);

    // 3. Main Article Content
    let featuredImageHtml = '';
    if (article.featured_image_url) {
        featuredImageHtml = `
            <figure class="featured-image-placeholder">
                <img src="https://via.placeholder.com/800x400.png?text=Loading..."
                     data-src="${article.featured_image_url}"
                     alt="${article.alt_text || article.title}"
                     class="lazy-image">
                ${article.alt_text ? `<figcaption>${article.alt_text}</figcaption>` : ''}
            </figure>`;
    }

    let authorInfoHtml = '';
    if (article.author) {
        authorInfoHtml = `<p>By: <strong>${article.author}</strong></p>`;
    }

    let newsCategoryHtml = '';
    if (type === 'news' && article.category) {
        newsCategoryHtml = `<p class="news-category">Category: <strong>${article.category}</strong></p>`;
    }

    container.innerHTML = `
        <article class="${type === 'blog' ? 'sample-blog-article' : 'sample-news-article'}">
            <h2>${article.title}</h2>
            <div class="article-meta">
                <p class="publish-date">Published on: <time datetime="${article.publish_date}">${formatDate(article.publish_date)}</time></p>
                ${authorInfoHtml}
                ${newsCategoryHtml}
            </div>
            ${featuredImageHtml}
            <div class="article-body">
                ${article.content}
            </div>
        </article>
    `;
    document.querySelectorAll('.lazy-image').forEach(img => lazyLoadImage(img));


    // 4. Social Sharing Buttons (simple links)
    const socialShareSection = document.createElement('section');
    socialShareSection.className = 'social-sharing-placeholder';
    const encodedUrl = encodeURIComponent(pageUrl);
    const encodedTitle = encodeURIComponent(article.title);
    socialShareSection.innerHTML = `
        <h4>Share this ${type === 'blog' ? 'post' : 'article'}:</h4>
        <a href="https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}" target="_blank" title="Share on Facebook"><i class="fab fa-facebook-f"></i></a>
        <a href="https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}" target="_blank" title="Share on Twitter"><i class="fab fa-twitter"></i></a>
        <a href="https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}&summary=${encodeURIComponent(article.meta_description)}" target="_blank" title="Share on LinkedIn"><i class="fab fa-linkedin-in"></i></a>
        <a href="mailto:?subject=${encodedTitle}&body=Check%20out%20this%20article:%20${encodedUrl}" title="Share via Email"><i class="fas fa-envelope"></i></a>
    `;
    container.appendChild(socialShareSection);

    // 5. Related Posts (Placeholder Logic)
    // This is a simplified version. A real version would fetch all posts and filter.
    const relatedPostsSection = document.createElement('section');
    relatedPostsSection.className = type === 'blog' ? 'related-posts-placeholder' : 'related-news-placeholder';
    relatedPostsSection.innerHTML = `<h3>Related ${type === 'blog' ? 'Posts' : 'News'}</h3><ul><li><a href="#">Related Item 1</a></li><li><a href="#">Related Item 2</a></li></ul>`;
    // TODO: Implement actual related posts logic by fetching all posts and filtering.
    container.appendChild(relatedPostsSection);


    // 6. Disqus Comments
    const disqusSection = document.createElement('section');
    disqusSection.className = 'disqus-comments-placeholder';
    disqusSection.innerHTML = `
        <h3>Comments</h3>
        <div id="disqus_thread"></div>
        <noscript>Please enable JavaScript to view the <a href="https://disqus.com/?ref_noscript">comments powered by Disqus.</a></noscript>
    `;
    container.appendChild(disqusSection);
    // Initialize Disqus
    if (window.DISQUS) { // Check if Disqus script is loaded
        DISQUS.reset({
            reload: true,
            config: function () {
                this.page.url = pageUrl;
                this.page.identifier = article.slug;
                this.page.title = article.title;
            }
        });
    } else {
        // Fallback or load Disqus script dynamically if not present
        // For now, just a placeholder message if Disqus main script isn't loaded.
        const disqusThread = document.getElementById('disqus_thread');
        if(disqusThread) disqusThread.innerHTML = "<p><em>Disqus comments would load here. Ensure Disqus universal embed code is on the page.</em></p>";
    }
}

/**
 * Renders breadcrumbs dynamically.
 * @param {string} type - 'blog' or 'news'.
 * @param {string} [currentPageTitle] - Optional title for the current page (e.g., article title).
 */
function renderBreadcrumbs(type, currentPageTitle) {
    const breadcrumbContainer = document.getElementById('breadcrumb-container'); // Ensure this ID exists in HTML
    if (!breadcrumbContainer) return;

    let listItems = `
        <li class="breadcrumb-item"><a href="index.html">Home</a></li>
    `;

    if (type === 'blog') {
        listItems += `<li class="breadcrumb-item"><a href="blog.html">Blog</a></li>`;
    } else if (type === 'news') {
        listItems += `<li class="breadcrumb-item"><a href="news.html">News</a></li>`;
    }

    if (currentPageTitle) {
        listItems += `<li class="breadcrumb-item active" aria-current="page">${currentPageTitle}</li>`;
    } else {
        // If it's the main listing page, the 'Blog' or 'News' link is the active one
        // We need to reconstruct to mark the last one as active.
        if (type === 'blog') {
            listItems = `
                <li class="breadcrumb-item"><a href="index.html">Home</a></li>
                <li class="breadcrumb-item active" aria-current="page">Blog</li>`;
        } else if (type === 'news') {
             listItems = `
                <li class="breadcrumb-item"><a href="index.html">Home</a></li>
                <li class="breadcrumb-item active" aria-current="page">News</li>`;
        }
    }
    breadcrumbContainer.innerHTML = `<ol class="breadcrumb">${listItems}</ol>`;
}


// --- Routing/Page Initialization Logic ---

/**
 * Initializes the Blog page.
 * Fetches blog posts and renders either the list or a single post based on URL query params.
 */
async function initBlogPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const postSlug = urlParams.get('post');
    const posts = await fetchJSON(BLOG_POSTS_URL);

    if (!posts) {
        document.getElementById('blog-content-area').innerHTML = "<p>Error loading blog posts. Please try again later.</p>";
        renderBreadcrumbs('blog'); // Render default breadcrumb
        return;
    }

    if (postSlug) {
        const post = getPostBySlug(postSlug, posts);
        if (post && post.status === 'published') {
            renderSingleArticle(post, 'blog-content-area', 'blog');
        } else {
            document.getElementById('blog-content-area').innerHTML = "<p>Blog post not found or not available.</p>";
            renderBreadcrumbs('blog', 'Not Found');
        }
    } else {
        renderArticleList(posts, 'blog-content-area', 'blog');
        renderBreadcrumbs('blog'); // For the main blog listing page
    }
}

/**
 * Initializes the News page.
 * Fetches news articles and renders either the list or a single article based on URL query params.
 */
async function initNewsPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const articleSlug = urlParams.get('article'); // Changed from 'post' to 'article' for news
    const articles = await fetchJSON(NEWS_ARTICLES_URL);

    if (!articles) {
        document.getElementById('news-content-area').innerHTML = "<p>Error loading news articles. Please try again later.</p>";
        renderBreadcrumbs('news'); // Render default breadcrumb
        return;
    }

    if (articleSlug) {
        const article = getPostBySlug(articleSlug, articles);
        if (article && article.status === 'published') {
            renderSingleArticle(article, 'news-content-area', 'news');
        } else {
            document.getElementById('news-content-area').innerHTML = "<p>News article not found or not available.</p>";
            renderBreadcrumbs('news', 'Not Found');
        }
    } else {
        renderArticleList(articles, 'news-content-area', 'news');
        renderBreadcrumbs('news'); // For the main news listing page
    }
}

// Note: A more robust solution for Disqus would involve checking if the Disqus script
// is already on the page and loading it if not, then initializing.
// For this example, it assumes `window.DISQUS` might be available if included in HTML.
// A placeholder for `DISQUS_SHORTNAME` would also be needed for a real integration.
// Example: if (!window.disqus_shortname) { window.disqus_shortname = 'YOUR_DISQUS_SHORTNAME'; }
// And the universal embed code should be in the HTML files.
// For now, the disqus_thread div will just show a placeholder message if Disqus isn't set up.

// Lazy loading for images with class 'lazy-image' and data-src attribute will be handled
// by the IntersectionObserver in lazyLoadImage, called after content rendering.
// Ensure images in HTML content from JSON also use this pattern if lazy loading is desired there.
// (Currently, HTML content from JSON is rendered as-is).
