$(document).ready(function() {
    const velocity = 4;
    
    var previewParent = $("#js-gallery-items");
    var i = 0, imagesPreloaded = 0, lastImageId = 0;
    var autoPlayInterval, autoPlayTimeout, preloadInterval;

    function drag() {        
        var startPosition;
        $(previewParent).find('img').draggable({
            axis: 'x',
            helper: (e) => $("<div></div>"),
            
            start: (e, ui) => {
                startPosition = ui.position.left;
                
                clearInterval(autoPlayInterval);
                clearTimeout(autoPlayTimeout);
            },
            
            stop: (e, ui) => {
                autoPlayTimeout = setTimeout(() => previewParent.attr('data-autoplay') === 'true' && play(), 3000);
            },

            drag: (e, ui) => {               
                const dir = (startPosition < ui.position.left) ? 'right' : 'left';
                const source = previewParent.attr('data-source');
                
                if(dir === 'right') {
                    $(previewParent).find('img').attr('src', `${source}/${identifier(dir)}.png`);
                } else {
                    $(previewParent).find('img').attr('src', `${source}/${identifier(dir)}.png`);
                }
            }
        });
    }
    
    function play() {
        autoPlayInterval = setInterval(() => {
            const source = previewParent.attr('data-source');
            $(previewParent).find('img').attr('src', `${source}/${identifier('left')}.png`);
        }, 50);
    }

    function identifier(dir) {
        const frames = $(previewParent).attr('data-frames');
        
        if(dir === 'right') {
            i = i - velocity < 0 ? lastImageId : i;
            return i -= velocity;
        } else {
            i = i + velocity > frames ? 0 : i;
            return i += velocity;
        }
    }
    
    function reset() {
        clearInterval(autoPlayInterval);
        clearInterval(preloadInterval);
        clearTimeout(autoPlayTimeout);

        imagesPreloaded = 0;
        lastImageId = 0;
        i = 0;
     
        $("#preview").hide();
        $("#js-loading-progression").css('width', `0%`);
        $("#js-loading").show();
    }

    function preload() {
        const source = previewParent.attr('data-source');
        const frames = previewParent.attr('data-frames');

        for(let j = 0; j < frames; j += velocity) {
            $("#js-gallery-dummy").append(`<img id="js-gallery-item-${j}" src="${source}/${j}.png">`);
            
            $(`img#js-gallery-item-${j}`).on('load', () => {
                imagesPreloaded = imagesPreloaded + 1;
                const progression = (imagesPreloaded / Math.ceil(frames / velocity)) * 100;

                if(progression >= 100) lastImageId = j;

                $("#js-loading-progression").css('width', `${progression}%`);
            });

        }

    }

    function initialize() {
        if(autoPlayInterval !== undefined || autoPlayTimeout !== undefined || preloadInterval !== undefined) reset();

        // Load the first image to display
        const source = previewParent.attr('data-source');
        const frames = previewParent.attr('data-frames');
        const autoplay = previewParent.attr('data-autoplay');

        previewParent.html(`<img src="${source}/${i}.png">`);

        // Preload all images for active drag and autoplay
        preload();

        preloadInterval = setInterval(() => {
            if(Math.ceil(frames / velocity) <= imagesPreloaded) {
                $("#js-loading").hide();
                $("#preview").show();

                drag();
                
                if(autoplay === 'true') play();

                return clearInterval(preloadInterval);
            }
        }, 500);
    }

    initialize();

    document.addEventListener('refreshGallery', e => {
        previewParent = $("#js-gallery-items");        
        return initialize();
    });
});