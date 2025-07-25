// project_detail.js

// Initialize Firebase with your provided configuration
const firebaseConfig = {
    apiKey: "AIzaSyBWoqHihUtSWubkoOTzykbxjtuiIFfgDWg",
    authDomain: "portfolio-baf28.firebaseapp.com",
    databaseURL: "https://portfolio-baf28-default-rtdb.firebaseio.com",
    projectId: "portfolio-baf28",
    storageBucket: "portfolio-baf28.firebasestorage.app",
    messagingSenderId: "631350351739",
    appId: "1:631350351739:web:1a1352cc2b9384b5924fde",
    measurementId: "G-103VQ05CTT"
};

// Check if Firebase is already initialized
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
} else {
    firebase.app(); // if already initialized, use that one
}

const db = firebase.firestore();

document.addEventListener('DOMContentLoaded', () => {
    const projectDetailsPage = document.getElementById('projectDetailsPage');
    const projectDetailSpinnerContainer = document.getElementById('projectDetailSpinnerContainer');
    const pageTitle = document.getElementById('pageTitle');

    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('id');

    // Global variable to hold the fetched project data
    let currentProjectData = null;

    if (projectId) {
        fetchProjectDetails(projectId);
    } else {
        displayErrorMessage("Project ID not found in URL. Please go back to the <a href='projects.html'>Projects List</a> to select a project.");
        hideSpinner();
    }

    async function fetchProjectDetails(id) {
        try {
            projectDetailSpinnerContainer.style.display = 'flex'; // Show spinner, changed to flex for centering
            const docRef = db.collection("projects").doc(id);
            const doc = await docRef.get();

            if (doc.exists) {
                currentProjectData = { id: doc.id, ...doc.data() }; // Store fetched data
                renderProjectDetails(currentProjectData);
                pageTitle.textContent = currentProjectData.title + " Details"; // Use 'title' field for page title
            } else {
                displayErrorMessage("Project not found.");
            }
        } catch (error) {
            console.error("Error fetching project details:", error);
            displayErrorMessage("Failed to load project details. Please try again later.");
        } finally {
            hideSpinner();
        }
    }

    function renderProjectDetails(project) {
        projectDetailsPage.innerHTML = `
            <h2>${project.title || project.id || 'Untitled Project'}</h2>
            <div class="meta-info">
                ${project.client ? `<div><strong>Client:</strong> ${project.client}</div>` : ''}
                ${project.date ? `<div><strong>Date:</strong> ${project.date}</div>` : ''}
                ${project.duration ? `<div><strong>Duration:</strong> ${project.duration}</div>` : ''}
                ${project.status ? `<div><strong>Status:</strong> ${project.status}</div>` : ''}
                ${project.upload_date ? `<div><strong>Uploaded:</strong> ${project.upload_date}</div>` : ''}
                ${project.last_updated ? `<div><strong>Last Updated:</strong> ${project.last_updated}</div>` : ''}
                ${project.views !== undefined ? `<div><strong>Views:</strong> ${project.views}</div>` : ''}
                ${project.downloads !== undefined ? `<div><strong>Downloads:</strong> ${project.downloads}</div>` : ''}
                ${project.difficulty ? `<div><strong>Difficulty:</strong> ${project.difficulty}</div>` : ''}
            </div>

            <div class="tags">
                <h3>Tags:</h3>
                ${project.tags && project.tags.length > 0 ? project.tags.map(tag => `<span>${tag}</span>`).join('') : '<p>No tags available.</p>'}
            </div>

            <div class="technologies">
                <h3>Technologies Used:</h3>
                ${project.technologies && project.technologies.length > 0 ? project.technologies.map(tech => `<span>${tech}</span>`).join('') : '<p>No technologies listed.</p>'}
            </div>

            ${project.image_urls && project.image_urls.length > 0 ? `
                <h3>Project Images</h3>
                <div class="image-carousel-container">
                    <div class="image-carousel" id="imageCarousel">
                        ${project.image_urls.map(image => `<img src="${image}" alt="Project Image" class="carousel-image">`).join('')}
                    </div>
                    ${project.image_urls.length > 1 ? `
                        <button class="carousel-button left" id="prevImage">❮</button>
                        <button class="carousel-button right" id="nextImage">❯</button>
                    ` : ''}
                </div>
            ` : ''}

            <h3>Project Overview</h3>
            <p class="short-description">${project.short_description || 'No short description provided.'}</p>
            <p class="long-description">${project.long_description || 'No detailed description provided.'}</p>

            ${project.video_url ? `
                <h3>Project Video</h3>
                <div class="video-embed">
                    <iframe src="https://www.youtube.com/embed/${getYouTubeVideoId(project.video_url)}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                </div>
            ` : ''}

            ${project.code ? `
                <h3>Code Snippet</h3>
                <pre class="code-block"><code>${escapeHtml(project.code)}</code></pre>
            ` : ''}

            ${project.sponsors && project.sponsors.length > 0 ? `
                <div class="sponsors-section">
                    <h3>Our Sponsors</h3>
                    <div class="sponsors-list">
                        ${project.sponsors.map(sponsor => `<span class="sponsor-name">${sponsor}</span>`).join('')}
                    </div>
                </div>
            ` : ''}

            ${project.members && project.members.length > 0 ? `
                <div class="members-section">
                    <h3>Team Members</h3>
                    <div class="members-scroll-container">
                        <div class="members-list">
                            ${project.members.map(member => `<span class="member-name">${member}</span>`).join('')}
                        </div>
                    </div>
                </div>
            ` : ''}

            <div class="action-buttons-container">
                ${project.button_url ? `<a href="${project.button_url}" target="_blank" rel="noopener noreferrer" class="action-button" id="projectActionButton">${project.button_label || 'View Project'}</a>` : ''}
                ${project.status !== "Completed" ? `
                <a href="join_project.html?projectName=${encodeURIComponent(project.title || project.id || '')}&projectId=${encodeURIComponent(project.id)}" class="action-button join-project-button">Join This Project</a>
                ` : ''}
            </div>
        `;
        setupCarousel(project.image_urls);
        setupLightbox();
        setupActionButtonListener(project);
    }

    function hideSpinner() {
        if (projectDetailSpinnerContainer) {
            projectDetailSpinnerContainer.style.display = 'none';
        }
    }

    function displayErrorMessage(message) {
        projectDetailsPage.innerHTML = `<p class="error-message">${message}</p>`;
        hideSpinner(); // Also hide spinner on error
    }

    // Helper to extract YouTube video ID
    function getYouTubeVideoId(url) {
        // Regex to extract video ID from various YouTube URL formats
        const match = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
        return match ? match[1] : null;
    }

    let currentImageIndex = 0;
    let images = []; // Array to hold image URLs for the carousel

    function setupCarousel(projectImages) {
        images = projectImages || [];
        const imageCarousel = document.getElementById('imageCarousel');
        const prevButton = document.getElementById('prevImage');
        const nextButton = document.getElementById('nextImage');

        if (!imageCarousel || images.length === 0) {
            if (prevButton) prevButton.style.display = 'none';
            if (nextButton) nextButton.style.display = 'none';
            return;
        }

        function updateCarousel() {
            if (imageCarousel) {
                imageCarousel.style.transform = `translateX(-${currentImageIndex * 100}%)`;
            }
        }

        if (prevButton) {
            prevButton.addEventListener('click', () => {
                currentImageIndex = (currentImageIndex === 0) ? images.length - 1 : currentImageIndex - 1;
                updateCarousel();
            });
        }

        if (nextButton) {
            nextButton.addEventListener('click', () => {
                currentImageIndex = (currentImageIndex === images.length - 1) ? 0 : currentImageIndex + 1;
                updateCarousel();
            });
        }
    }

    function setupLightbox() {
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.getElementById('lightboxImage');
    const lightboxClose = document.getElementsByClassName('lightbox-close')[0];

    let scale = 1; // initial zoom level

    // Reset zoom and show lightbox on image click
    document.addEventListener('click', (event) => {
        if (event.target.classList.contains('carousel-image')) {
            scale = 1;
            lightboxImage.style.transform = `scale(${scale})`;  // reset zoom
            lightbox.style.display = 'flex';
            lightboxImage.src = event.target.src;
            lightboxImage.alt = event.target.alt || '';
        }
    });

    if (lightboxClose) {
        lightboxClose.addEventListener('click', () => {
            lightbox.style.display = 'none';
        });
    }

    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                lightbox.style.display = 'none';
            }
        });
    }

    // Zoom on mouse wheel over the image
    lightboxImage.addEventListener('wheel', (e) => {
        e.preventDefault();

        const zoomStep = 0.1;
        if (e.deltaY < 0) {
            // Zoom in
            scale += zoomStep;
        } else {
            // Zoom out, don't go below 1 (original size)
            scale = Math.max(1, scale - zoomStep);
        }
        lightboxImage.style.transform = `scale(${scale})`;
    });
}


    // Function to encapsulate the action button logic
    function setupActionButtonListener(project) {
        const actionButton = document.getElementById('projectActionButton');
        if (actionButton && project.button_label && project.button_url) {
            actionButton.addEventListener('click', async (event) => {
                event.preventDefault(); // Prevent default navigation initially

                if (!project || !project.id) {
                    console.error("Project data is missing. Cannot increment stats.");
                    window.open(project.button_url, '_blank'); // Still navigate
                    return;
                }

                const projectRef = db.collection("projects").doc(project.id);
                try {
                    if (project.button_label === "Download") {
                        await projectRef.update({
                            downloads: firebase.firestore.FieldValue.increment(1)
                        });
                        console.log(`Downloads incremented for ${project.id}`);
                    } else { // For other labels like "Visit Website", "View Demo"
                        await projectRef.update({
                            visits: firebase.firestore.FieldValue.increment(1)
                        });
                        console.log(`Visits incremented for ${project.id}`);
                    }
                } catch (error) {
                    console.error(`Error incrementing stats for ${project.id}:`, error);
                    // Don't block navigation if stats update fails
                } finally {
                    // Always navigate after attempting to update stats
                    window.open(project.button_url, '_blank');
                }
            });
        }
    }

    /**
     * Helper function to safely escape HTML special characters.
     * This is primarily for `code` blocks or any text that should NOT be interpreted as HTML.
     */
    function escapeHtml(unsafe) {
        if (typeof unsafe !== 'string') return unsafe;
        return unsafe
            .replace(/&/g, "&amp;") // Use full HTML entity for ampersand
            .replace(/</g, "&lt;")  // Use full HTML entity for less-than
            .replace(/>/g, "&gt;")  // Use full HTML entity for greater-than
            .replace(/"/g, "&quot;") // Use full HTML entity for double quote
            .replace(/'/g, "&#039;"); // Use full HTML entity for single quote
    }

});