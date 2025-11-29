document.addEventListener("DOMContentLoaded", function() {
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

    function updateClock() {
        var now = new Date();
        var hours = String(now.getHours()).padStart(2, '0');
        var minutes = String(now.getMinutes()).padStart(2, '0');
        var seconds = String(now.getSeconds()).padStart(2, '0');
        var clockElement = document.getElementById('clock');
        if (clockElement) {
            clockElement.textContent = hours + ":" + minutes + ":" + seconds;
        }
    }
    
    setInterval(updateClock, 1000);
    updateClock();

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
    });

    Promise.all([minLoadTimePromise, unityInstancePromise]).then(() => {
        loadingScreen.classList.add("hidden");
        setTimeout(() => {
            loadingScreen.style.display = "none";
        }, 500); // Wait for transition to finish
    }).catch((message) => {
        alert(message);
    });

    // Project Overlay Logic
    const overlay = document.getElementById('project-overlay');
    const overlayBody = document.getElementById('overlay-body');
    const backdrop = document.querySelector('.overlay-backdrop');
    const projectLinks = document.querySelectorAll('a[data-project]');

    function openOverlay(projectId) {
        const contentTemplate = document.getElementById('content-' + projectId);
        if (contentTemplate) {
            overlayBody.innerHTML = contentTemplate.innerHTML;
            overlay.classList.remove('hidden');
        } else {
            console.error('Content not found for project:', projectId);
        }
    }

    function closeOverlay() {
        overlay.classList.add('hidden');
        // Optional: Clear content after transition to stop videos etc.
        setTimeout(() => {
            overlayBody.innerHTML = '';
        }, 300);
    }

    projectLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const projectId = this.getAttribute('data-project');
            openOverlay(projectId);
        });
    });

    if (backdrop) {
        backdrop.addEventListener('click', closeOverlay);
    }

    // Close on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && !overlay.classList.contains('hidden')) {
            closeOverlay();
        }
    });
});
