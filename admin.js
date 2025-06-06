document.addEventListener('DOMContentLoaded', () => {
    const blogFormSection = document.getElementById('blog-form-section');
    const newsFormSection = document.getElementById('news-form-section');
    const showBlogFormBtn = document.getElementById('show-blog-form-btn');
    const showNewsFormBtn = document.getElementById('show-news-form-btn');

    const blogForm = document.getElementById('blog-form');
    const newsForm = document.getElementById('news-form');

    const blogTitleInput = document.getElementById('blog-title');
    const blogSlugInput = document.getElementById('blog-slug');
    const newsTitleInput = document.getElementById('news-title');
    const newsSlugInput = document.getElementById('news-slug');

    const generateBlogJsonBtn = document.getElementById('generate-blog-json-btn');
    const generateNewsJsonBtn = document.getElementById('generate-news-json-btn');
    const jsonOutputTextarea = document.getElementById('generated-json-output');

    // --- Slug Generation ---
    function generateSlug(title) {
        if (!title) return '';
        return title
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')           // Replace spaces with -
            .replace(/[^\w-]+/g, '')       // Remove all non-word chars
            .replace(/--+/g, '-')         // Replace multiple - with single -
            .replace(/^-+/, '')           // Trim - from start of text
            .replace(/-+$/, '');          // Trim - from end of text
    }

    if (blogTitleInput && blogSlugInput) {
        blogTitleInput.addEventListener('input', () => {
            blogSlugInput.value = generateSlug(blogTitleInput.value);
        });
    }

    if (newsTitleInput && newsSlugInput) {
        newsTitleInput.addEventListener('input', () => {
            newsSlugInput.value = generateSlug(newsTitleInput.value);
        });
    }

    // --- Form Switching ---
    function showForm(formToShow, buttonToActivate) {
        blogFormSection.style.display = 'none';
        newsFormSection.style.display = 'none';
        showBlogFormBtn.classList.remove('active');
        showNewsFormBtn.classList.remove('active');

        formToShow.style.display = 'block';
        buttonToActivate.classList.add('active');
    }

    if (showBlogFormBtn) {
        showBlogFormBtn.addEventListener('click', () => showForm(blogFormSection, showBlogFormBtn));
    }
    if (showNewsFormBtn) {
        showNewsFormBtn.addEventListener('click', () => showForm(newsFormSection, showNewsFormBtn));
    }

    // Show blog form by default
    if (blogFormSection && showBlogFormBtn) {
         showForm(blogFormSection, showBlogFormBtn);
    }


    // --- Form Data Collection ---
    function getBlogFormData() {
        const data = {
            id: document.getElementById('blog-id').value.trim(),
            title: document.getElementById('blog-title').value.trim(),
            slug: document.getElementById('blog-slug').value.trim(),
            featured_image_url: document.getElementById('blog-featured-image-url').value.trim(),
            alt_text: document.getElementById('blog-alt-text').value.trim(),
            meta_title: document.getElementById('blog-meta-title').value.trim(),
            meta_description: document.getElementById('blog-meta-description').value.trim(),
            author: document.getElementById('blog-author').value.trim(),
            publish_date: '', // Will be formatted
            tags: document.getElementById('blog-tags').value.split(',').map(tag => tag.trim()).filter(tag => tag),
            status: document.getElementById('blog-status').value,
            content: document.getElementById('blog-content').value.trim()
        };
        // Format date to ISO string with time, assuming UTC for consistency
        const rawDate = document.getElementById('blog-publish-date').value;
        if (rawDate) {
            data.publish_date = new Date(rawDate + "T00:00:00Z").toISOString();
        }
        return data;
    }

    function getNewsFormData() {
        const data = {
            id: document.getElementById('news-id').value.trim(),
            title: document.getElementById('news-title').value.trim(),
            slug: document.getElementById('news-slug').value.trim(),
            meta_title: document.getElementById('news-meta-title').value.trim(),
            meta_description: document.getElementById('news-meta-description').value.trim(),
            publish_date: '', // Will be formatted
            category: document.getElementById('news-category').value,
            status: document.getElementById('news-status').value,
            content: document.getElementById('news-content').value.trim()
        };
        const rawDate = document.getElementById('news-publish-date').value;
        if (rawDate) {
            data.publish_date = new Date(rawDate + "T00:00:00Z").toISOString();
        }
        return data;
    }

    // --- JSON Generation ---
    if (generateBlogJsonBtn) {
        generateBlogJsonBtn.addEventListener('click', () => {
            const blogData = getBlogFormData();
            if (!blogData.id || !blogData.title || !blogData.content || !blogData.slug || !blogData.publish_date) {
                alert('Please fill in at least ID, Title, Slug, Publish Date, and Content for the blog post.');
                return;
            }
            jsonOutputTextarea.value = JSON.stringify(blogData, null, 2);
            appendInstructions("blog-posts.json");
        });
    }

    if (generateNewsJsonBtn) {
        generateNewsJsonBtn.addEventListener('click', () => {
            const newsData = getNewsFormData();
            if (!newsData.id || !newsData.title || !newsData.content || !newsData.slug || !newsData.publish_date) {
                alert('Please fill in at least ID, Title, Slug, Publish Date, and Content for the news article.');
                return;
            }
            jsonOutputTextarea.value = JSON.stringify(newsData, null, 2);
            appendInstructions("news-articles.json");
        });
    }
    
    function appendInstructions(fileName) {
        const instructionsDiv = document.querySelector('.instructions ol'); // Assuming the ol is always there
        if (instructionsDiv) {
            // Check if specific instruction already exists to avoid duplication on multiple clicks
            if (!document.getElementById('json-file-instruction')) {
                const fileInstruction = document.createElement('li');
                fileInstruction.id = 'json-file-instruction';
                fileInstruction.innerHTML = `For the generated JSON, update the <strong>${fileName}</strong> file.`;
                
                // Insert it as the new point 4, shifting others.
                // The static instructions are 1,2,3. The new 4 becomes the filename. Old 4 becomes 5, etc.
                // This is a bit crude; better would be to have a placeholder for this.
                // For now, let's find the 4th li (index 3) and insert before it, or append if not enough items.
                const existingLiItems = instructionsDiv.querySelectorAll('li');
                if (existingLiItems.length >= 3) { // expecting at least 3 static items
                    instructionsDiv.insertBefore(fileInstruction, existingLiItems[3]);
                } else {
                    instructionsDiv.appendChild(fileInstruction);
                }
            } else {
                 document.getElementById('json-file-instruction').innerHTML = `For the generated JSON, update the <strong>${fileName}</strong> file.`;
            }
        }
    }
});
