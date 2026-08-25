(function() {
    const canvas = document.getElementById('editor-canvas');
    const ctx = canvas.getContext('2d');
    const fileInput = document.getElementById('file-input');
    const zoomSlider = document.getElementById('zoom-slider');
    
    // Text Inputs
    const boothInput = document.getElementById('booth-input');
    
    const downloadBtn = document.getElementById('download-btn');
    const linkedinBtn = document.getElementById('linkedin-btn');
    const emailBtn = document.getElementById('email-btn');
    const resetBtn = document.getElementById('reset-btn');
    const placeholder = document.getElementById('placeholder');

    // Modal UI Elements
    const customModal = document.getElementById('custom-modal');
    const modalCloseBtn = document.getElementById('modal-close-btn');

    let currentStyle = 'social';
    let FRAME_PATH_CURRENT = 'frame.png'; 

    let frameImage = new Image();
    let userImage = null, userImgX = 0, userImgY = 0, userImgScale = 1;
    let isDragging = false, startX, startY;

    // Landscape Canvas Resolution standard
    canvas.width = 1024; 
    canvas.height = 535;

    frameImage.crossOrigin = "anonymous";
    frameImage.src = FRAME_PATH_CURRENT;
    frameImage.onload = () => render();
    if (document.fonts) {
        document.fonts.ready.then(() => render());
    }

    boothInput.oninput = () => render();

    // Style Switcher Handler
    const styleBtns = document.querySelectorAll('.style-btn');
    const dropZone = document.getElementById('drop-zone');

    styleBtns.forEach(btn => {
        btn.onclick = (e) => {
            e.stopPropagation();
            styleBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            currentStyle = btn.getAttribute('data-style');
            
            if (currentStyle === 'banner') {
                canvas.width = 800;
                canvas.height = 200;
                FRAME_PATH_CURRENT = 'banner-frame.png';
                dropZone.style.aspectRatio = "800 / 200";
                placeholder.style.top = "53.5%";
                placeholder.style.left = "84.5%";
                placeholder.style.transform = "translate(-50%, -50%) scale(0.65)";
            } else {
                canvas.width = 1024;
                canvas.height = 535;
                FRAME_PATH_CURRENT = 'frame.png';
                dropZone.style.aspectRatio = "1024 / 535";
                placeholder.style.top = "65%";
                placeholder.style.left = "83%";
                placeholder.style.transform = "translate(-50%, -50%) scale(0.7)";
            }
            
            frameImage = new Image();
            frameImage.crossOrigin = "anonymous";
            frameImage.src = FRAME_PATH_CURRENT;
            frameImage.onload = () => {
                if (userImage) {
                    userImgScale = (currentStyle === 'banner' ? 140 : 280) / Math.max(userImage.width, userImage.height);
                    zoomSlider.value = userImgScale;
                    userImgX = 0;
                    userImgY = 0;
                }
                render();
            };
        };
    });

    function render() {
        // ALWAYS start the frame layout with a fresh structural state reset
        ctx.restore(); 
        ctx.save();
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 1. Draw Clean Canvas White Underlay Base
        ctx.fillStyle = "#ffffff"; 
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 2. Render User Image Logo (free floating underlay)
        if (userImage) {
            ctx.save();
            const dw = userImage.width * userImgScale;
            const dh = userImage.height * userImgScale;
            
            // Default center around the white area on the right
            const imgCenterX = (currentStyle === 'banner' ? 675 : 850) + userImgX;
            const imgCenterY = (currentStyle === 'banner' ? 107 : 348) + userImgY;
            
            // White background layer directly behind the uploaded image
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(imgCenterX - dw / 2, imgCenterY - dh / 2, dw, dh);

            ctx.drawImage(userImage, imgCenterX - dw / 2, imgCenterY - dh / 2, dw, dh);
            ctx.restore();
        }

        // 3. Render Overlay Frame Template ON TOP
        if (frameImage.complete && frameImage.naturalWidth !== 0) {
            ctx.drawImage(frameImage, 0, 0, canvas.width, canvas.height);
        }

        // 4. Render Stand Number Text
        const boothText = boothInput.value.trim() ? boothInput.value : "";
        if (boothText) {
            const fontSize = currentStyle === 'banner' ? "22px" : "34px";
            const fontName = "'NeueHaasGrotesk', 'Inter', sans-serif";
            
            const textCenterX = currentStyle === 'banner' ? 529 : 878;
            const textBaselineY = currentStyle === 'banner' ? 88 : 175;

            ctx.fillStyle = "#023149"; // Dark blue text color
            ctx.font = `700 ${fontSize} ${fontName}`;
            ctx.textBaseline = "middle";
            ctx.textAlign = "center";
            ctx.fillText(boothText, textCenterX, textBaselineY);
        }
    }

    document.getElementById('drop-zone').onclick = (e) => {
        if(e.target.tagName !== 'INPUT') fileInput.click();
    };

    fileInput.onchange = (e) => {
        if (!e.target.files[0]) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const img = new Image();
            img.onload = () => {
                userImage = img;
                userImgScale = (currentStyle === 'banner' ? 140 : 280) / Math.max(img.width, img.height);
                zoomSlider.value = userImgScale;
                userImgX = 0; 
                userImgY = 0;
                
                placeholder.style.setProperty('display', 'none', 'important');
                [zoomSlider, downloadBtn, linkedinBtn, emailBtn].forEach(b => b.disabled = false);
                render();
            };
            img.src = ev.target.result;
        };
        reader.readAsDataURL(e.target.files[0]);
    };

    canvas.onmousedown = (e) => {
        if (!userImage) return; 
        isDragging = true;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        startX = (e.clientX - rect.left) * scaleX - userImgX;
        startY = (e.clientY - rect.top) * scaleY - userImgY;
    };

    window.onmousemove = (e) => {
        if (!isDragging) return;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        userImgX = (e.clientX - rect.left) * scaleX - startX;
        userImgY = (e.clientY - rect.top) * scaleY - startY;
        render();
    };

    window.onmouseup = () => isDragging = false;
    zoomSlider.oninput = (e) => { userImgScale = parseFloat(e.target.value); render(); };

    downloadBtn.onclick = (e) => {
        e.stopPropagation();
        const link = document.createElement('a');
        link.download = currentStyle === 'banner' ? 'lna27-email-banner.png' : 'lna27-exhibitor-badge.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    };
    
    linkedinBtn.onclick = (e) => { 
        e.stopPropagation();
        downloadBtn.click(); 
        
        const shareText = `We are so excited to exhibit at #lubricantexponorthamerica 2027 - taking place March 9 - 10 \n\nRegister for free here: https://register.visitcloud.com/survey/3dkj7ikw2zeed?actioncode=000096DOC \n\nJoin us at the George R. Brown Convention Center - Houston, TX\n\nSee you there!`;
        
        navigator.clipboard.writeText(shareText).then(() => {
            customModal.classList.add('active');
        }).catch(err => {
            window.open('https://www.linkedin.com/feed/?shareActive=true', '_blank'); 
        });
    };

    modalCloseBtn.onclick = () => {
        customModal.classList.remove('active');
        window.open('https://www.linkedin.com/feed/?shareActive=true', '_blank'); 
    };
    
    emailBtn.onclick = (e) => { 
        e.stopPropagation();
        downloadBtn.click(); 
        
        const emailBody = `We are so excited to exhibit at #lubricantexponorthamerica 2027 - taking place March 9 - 10 \n\nRegister for free here: https://register.visitcloud.com/survey/3dkj7ikw2zeed?actioncode=000096DOC \n\nJoin us at the George R. Brown Convention Center - Houston, TX\n\nSee you there!`;
        window.location.href = `mailto:?subject=We are exhibiting at Lubricant Expo North America 2027!&body=${encodeURIComponent(emailBody)}`; 
    };
    
    resetBtn.onclick = (e) => { e.stopPropagation(); location.reload(); };
})();
