/* IE checker for on("input") */
var is_ie = !!navigator.userAgent.match(/(?:MSIE |Trident\/.*; rv:)(\d+)/);

/* data */
var stickertype = ['dreamhack','cologne','comedy','custom'];
var stickerIndex = 0;
var fonts = ["Indie Flower", "Shadows Into Light", "Pacifico", "Dancing Script",
             "Shadows Into Light Two", "Coming Soon", "Handlee", "Cookie",
             "Tangerine", "Great Vibes", "Damion", "Patrick Hand", "Bad Script",
             "Calligraffitti", "Waiting for the Sunrise", "Reenie Beanie",
             "Nothing You Could Do", "Sacramento", "Crafty Girls", "Allura",
             "Kalam", "Yellowtail", "Italianno", "Give You Glory",
             "Dawning of a New Day", "League Script", "Ruthie",
             "Lovers Quarrel", "Mrs Saint Delafield", "Mrs Sheppards",
             "Meie Script", "Princess Sofia", "Caveat", "Iceland"];
var nobg_url = getApplicationPath() + "images/nobg.png";
var fieldMap = {
    '#cologne-team'   : { key : 'cologne15'   },
    '#custom-team'    : { key : 'custom'      },
    '#comedy-team'    : { key : 'comedy'      },
    '#dreamhack-team' : { key : 'dreamhack15' }
};

/* font preloading */
WebFont.load({
    google: {
        families: fonts
    },
    active: updateCanvas
});

/* element preloading */
var $bgbutton = $("#bgbutton");
var $changetype = $("#changetype");
var $clearbg = $("#clearbg");
var $color = $("#color");
var $color_pick = $("#color-pick");
var $color_preview = $("#color_preview");
var $custom_background = $("#custom-background");
var $download = $("#download");
var $font = $("#font");
var $fontsize = $("#fontsize");
var $height = $("#height");
var $name = $("#name");
var $random = $("#random");
var $rotation = $("#rotation");
var $sticker_select = $(".sticker-select");
var $teams = {};
var $update_canvas_change = $("select.update-canvas");
var $update_canvas_input = $("input.update-canvas");
var $width = $("#width");

var $canvas = $("#canvas")[0];
var w = $canvas.width = 228;
var h = $canvas.height = 226;
var $context = $canvas.getContext('2d');

/* image objects */
var stickerImage = new Image();
var backgroundImage = new Image();

// If there is a filename in the path, remove it i.e. .../index.html
function getApplicationPath() {
    return (location.origin + location.pathname).replace(/[^\/]*$/, '');
}

/* main code */
function drawImageToContext(img) {
    if (img.complete && img.width > 0 && img.height > 0) {
        $context.drawImage(img, 0, 0, w, h);
    }
}

function updateCanvas() {
    var color = $color_pick.spectrum("get").toHexString().toUpperCase();
    $color.val(color);
    $color_preview.css("background", color);

    drawImageToContext(backgroundImage);
    drawImageToContext(stickerImage);

    var textString = $name.val();
    $context.save();
    $context.fillStyle = $color.val();
    $context.font = $fontsize.val() + "px " + $font.val();
    $context.translate(w * (1 - $width.val()), h * (1 - $height.val()));
    $context.rotate($rotation.val() * Math.PI / 180);
    $context.fillText(textString, -$context.measureText(textString).width / 2, $fontsize.val() / 4);
    $context.restore();
}

function initilize(data) {
    // Load all of the team drop-downs.
    $.each(fieldMap, function(fieldId, info){
        populateBox(fieldId, data.types, info.key);
    });

    preLoadFields();
    populateBox('#font', data.fonts);
    populateCredits('#credits-header', data.credits.data);

    // hide clear background button
    $clearbg.hide();
}

function addEventListeners() {
    // handle general changes (sliders, text input)
    $update_canvas_input.on("input", updateCanvas);
    if (is_ie) {
        $update_canvas_input.on("change", updateCanvas);
    }
    $update_canvas_change.on("change", updateCanvas);

    // handle color based changes
    $color_pick.spectrum({
        color: "#FFFFFF",
        move: updateCanvas
    });

    $random.on("click", function(e) {
        $color_pick.spectrum("set", randColor());
        updateCanvas();
    });

    // handle background based changes
    $bgbutton.on("click", function(e) {
        $custom_background.val("");
        $custom_background.click();
    });

    $custom_background.on("change", function(e) {
        var file;
        if ((file = this.files[0])) {
            var img = new Image();
            img.onload = function() {
                if (this.width > 288 || this.height > 288){
                    $clearbg.click();
                    alert("File too big! Max size: 288x288");
                } else {
                    backgroundImage.src = (window.URL || window.webkitURL).createObjectURL(file);
                    $clearbg.show();
                    $bgbutton.hide();
                }
                backgroundImage.onload = updateCanvas;
            };
            img.src = (window.URL || window.webkitURL).createObjectURL(file);
        }
    });

    $clearbg.on("click", function(e) {
        backgroundImage.src = nobg_url;
        $custom_background.val("");
        $clearbg.hide();
        $bgbutton.show();
    });

    // handle sticker based changes
    $sticker_select.on("change", function(e) {
        stickerImage.src = $teams[stickertype[stickerIndex]].val();
        stickerImage.onload = updateCanvas;
    });

    $changetype.on("click", function(e) {
        stickerIndex = (stickerIndex + 1) % stickertype.length;
        $changetype.text("Change type (" + stickertype[stickerIndex] + ")");

        for (var i = 0; i < stickertype.length; i++) {
            $teams[stickertype[i]].toggle(i === stickerIndex);
        }

        $sticker_select.change();
    });

    $download.on("click", function(e) {
        $download.attr("download", "DreamhackSignature.png");
        $download.attr("href", $canvas.toDataURL().replace(/^data:image\/[^;]/, 'data:application/octet-stream'));
    });
}

function preLoadFields() {
    // preload team selects based on stickertype array
    for (var i = 0; i < stickertype.length; i++) {
        $teams[stickertype[i]] = $("#" + stickertype[i] + "-team");
        // hide all but current list
        $teams[stickertype[i]].toggle(i === stickerIndex);
    }
    stickerImage.src = $teams[stickertype[stickerIndex]].val();
    backgroundImage.src = nobg_url;
}

function randColor() {
    return '#' + (Math.random() * 0xFFFFFF << 0).toString(16);
}

function populateBox(fieldId, types, type) {
    var obj = types[type] || types;
    $(fieldId).append(obj.data.map(function(record) {
        var isObject = typeof record === 'object';
        return $('<option>', {
            text : isObject ? record.name : record,
            value : isObject ? 'images/' + type + '/' + record.image : record
        });
    }));
}

function populateCredits(listId, data) {
    $.each(data.reverse(), function(index, item) {
        $(listId).after($('<li>').append($('<a>', {
            target : '_blank',
            href : item.href,
            text : item.name
        })).append($('<span>', {
            text : ' > ' + item.description
        })));
    });
}

// Main
(function() {
    $.ajax({
        dataType: "json",
        url: getApplicationPath() + "data.json",
        success: function(data, textStatus, jqXHR) {
            initilize(data);
            addEventListeners();

            /* initial call to draw canvas on page load */
            setTimeout(updateCanvas, 100);
        }
    });
} ());
