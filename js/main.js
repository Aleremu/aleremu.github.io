document.addEventListener("DOMContentLoaded", function () {
    if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
        // Mobile device style: fill the whole browser client area with the game canvas:
        var meta = document.createElement('meta');
        meta.name = 'viewport';
        meta.content = 'width=device-width, height=device-height, initial-scale=1.0, user-scalable=no, shrink-to-fit=yes';
        document.getElementsByTagName('head')[0].appendChild(meta);

        var canvas = document.querySelector("#unity-canvas");
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        canvas.style.position = "fixed";

        document.body.style.textAlign = "left";
    }

    // Note: Clock is now managed by webClock.js (WebClockManager)

    var loadingScreen = document.querySelector("#loading-screen");
    var minLoadTimePromise = new Promise((resolve) => {
        setTimeout(resolve, 2000); // Minimum 2 seconds
    });

    var unityInstancePromise = createUnityInstance(document.querySelector("#unity-canvas"), {
        arguments: [],
        dataUrl: "Build/Web.data",
        frameworkUrl: "Build/Web.framework.js",
        codeUrl: "Build/Web.wasm",
        streamingAssetsUrl: "StreamingAssets",
        companyName: "DefaultCompany",
        productName: "Aleremu Portfolio",
        productVersion: "1.0",
        // matchWebGLToCanvasSize: false, // Uncomment this to separately control WebGL canvas render size and DOM element size.
        // devicePixelRatio: 1, // Uncomment this to override low DPI rendering on high DPI displays.
    }).then(function (instance) {
        // Store Unity instance globally for WebClockBridge communication
        window.unityInstance = instance;
        return instance;
    });

    Promise.all([minLoadTimePromise, unityInstancePromise]).then(() => {
        loadingScreen.classList.add("hidden");
        setTimeout(() => {
            loadingScreen.style.display = "none";
        }, 500); // Wait for transition to finish
    }).catch((message) => {
        alert(message);
    });

    // Project Content Logic
    const contentArea = document.getElementById('content-area');
    const projectContent = document.getElementById('project-content');
    const globalBackdrop = document.getElementById('global-backdrop');
    const projectLinks = document.querySelectorAll('a[data-project]');

    function openProject(projectId) {
        const contentTemplate = document.getElementById('content-' + projectId);
        if (contentTemplate) {
            projectContent.innerHTML = contentTemplate.innerHTML;

            // Convert data-lightbox to GLightbox format
            projectContent.querySelectorAll('a[data-lightbox]').forEach(link => {
                link.classList.add('glightbox');
                link.setAttribute('data-gallery', link.getAttribute('data-lightbox'));
            });

            // Initialize GLightbox
            const lightbox = GLightbox({
                selector: '.glightbox',
                touchNavigation: true,
                loop: true,
                autoplayVideos: true
            });

            contentArea.classList.remove('hidden');
            if (globalBackdrop) globalBackdrop.classList.remove('hidden');
            document.body.classList.add('modal-open');

            // GSAP Animations
            if (typeof gsap !== 'undefined') {
                // Kill any existing tweens on the content to prevent conflicts
                gsap.killTweensOf("#project-content *");

                // Animate header
                gsap.from(projectContent.querySelectorAll(".project-header"), {
                    y: -30,
                    opacity: 0,
                    duration: 0.5,
                    ease: "power2.out",
                    clearProps: "all"
                });

                // Animate content blocks and other elements with stagger
                gsap.from(projectContent.querySelectorAll(".content-block, .youtube-video, .gallery"), {
                    y: 30,
                    opacity: 0,
                    duration: 0.5,
                    stagger: 0.1,
                    ease: "power2.out",
                    delay: 0.1,
                    clearProps: "all"
                });

                // Animate gallery images specifically if needed, or let the gallery block animation handle it
                // But let's add a nice pop effect for images inside gallery
                gsap.from(projectContent.querySelectorAll(".gallery img"), {
                    scale: 0.8,
                    opacity: 0,
                    duration: 0.4,
                    stagger: 0.05,
                    ease: "back.out(1.7)",
                    delay: 0.3,
                    clearProps: "all"
                });
            }

            // Initialize lightbox if needed (it usually auto-inits on DOM change or click)
        } else {
            console.error('Content not found for project:', projectId);
        }
    }

    function closeProject() {
        contentArea.classList.add('hidden');
        if (globalBackdrop) globalBackdrop.classList.add('hidden');
        document.body.classList.remove('modal-open');
        setTimeout(() => {
            projectContent.innerHTML = '';
        }, 300);

        // Remove active class from all links
        projectLinks.forEach(l => l.classList.remove('active'));
    }

    projectLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const projectId = this.getAttribute('data-project');

            if (this.classList.contains('active')) {
                // If already active, close it
                closeProject();
                this.blur();
            } else {
                // If not active, open it
                // Remove active from all others
                projectLinks.forEach(l => l.classList.remove('active'));
                // Add active to this one
                this.classList.add('active');
                openProject(projectId);
            }
        });
    });

    const closeBtn = document.getElementById('close-project');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeProject);
    }

    // Close on Escape key
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && !contentArea.classList.contains('hidden')) {
            closeProject();
        }
    });
});
