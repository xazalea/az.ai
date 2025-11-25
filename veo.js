function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1);
        if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
    }
    return "";
}

function checkRateLimit() {
    var now = Date.now();
    var cookieName = "ajax_requests_ip";
    var timestamps = getCookie(cookieName);
    var oneHour = 60 * 60 * 1000;

    if (timestamps === "") {
        setCookie(cookieName, now, 1);
        return { allowed: true };
    }

    var arr = timestamps.split(",").map(Number);

    while (arr.length > 0 && now - arr[0] > oneHour) {
        arr.shift();
    }

    if (arr.length >= 6) {
        var resetTime = arr[0] + oneHour;
        var remainingMs = resetTime - now;
        var minutes = Math.floor(remainingMs / 60000);
        var seconds = Math.floor((remainingMs % 60000) / 1000);
        return { 
            allowed: false, 
            minutes: minutes, 
            seconds: seconds 
        };
    }

    arr.push(now);
    setCookie(cookieName, arr.join(","), 1);
    return { allowed: true };
}
jQuery(document).ready(function($) {

    // ============= Checking cookie ==============//

    // VEO Video Generator
    $('#generate_it').click(function(){
        if($('#generate_it').attr('process') == 'true'){
            return false;
        }
        $('#generate_it').attr('process', 'true');
        // ======== Check Rate Limit ===========//
       var result = checkRateLimit();
        if (!result.allowed) {
            $('.rate-limit-exceed').remove();
            var msg = result.minutes > 0 
                ? `Create again after ${result.minutes} minute${result.minutes > 1 ? 's' : ''} ${result.seconds} second${result.seconds > 1 ? 's' : ''}`
                : `Create again after ${result.seconds} second${result.seconds > 1 ? 's' : ''}`;
                
            $('#tab1 .generate_section').after('<div class="rate-limit-exceed"><p><span>Rate Limit Exceeded: </span>VEO AI is experiencing high usage and only allows 5 video generations per hour. ' + msg + '</p></div>');
            return false;
        }
        let prompt = $('#fn__include_textarea').val();
        if(prompt == ""){
            return 0;
        }

        let totalVariations = $('#total-variations').val();
        let aspectRatio = $('#aspect-ration').val();

        let ratioClass = "";
        if(aspectRatio == "VIDEO_ASPECT_RATIO_LANDSCAPE"){
		ratioClass = "landscape-view";
        }
		

     

let li = '';
for (var i = 0; i < totalVariations; i++) {
   li = li + '<li class="fn__gl_item"><a  href="" class="fn__icon_button downloader-video-btn only-video-download" target="_blank"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-cloud-download-icon lucide-cloud-download"><path d="M12 13v8l-4-4"/><path d="m12 21 4-4"/><path d="M4.393 15.269A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.436 8.284"/></svg></a><div class="fn__gl__item"><div class="show-percentage">1%</div><div class="abs_item"><div class="placeholder"><div class="animated-background"></div></div><div class="all_options"><div class="fn__icon_options medium_size"></div></div></div></div></li>'; 
}
        $(this).parents('.tab-panel').find('.generation_history').prepend('<div class="fn__generation_item video-gen-cont video-gen-item-1 '+ratioClass+'"><div class="item_header"><div class="title_holder"><h2 class="prompt_title">'+prompt+' </h2><p class="negative_prompt_title">Generating Video...</p></div></div><div class="item_list"><ul class="fn__generation_list">'+li+'</ul></div></div>');


        //changing percentage value
        $('.show-percentage').each(function() {
    $(this).prop('Counter', 0).animate({
        Counter: 100
    }, {
        duration: 80000, // 50 seconds
        easing: 'swing',
        step: function(now) {
            $(this).text(Math.ceil(now) + '%');
        }
    });
});

        

    $.ajax({
        url: ajax_object.ajax_url,
        type: 'POST',
        data: {
            action: 'veo_video_generator',
            nonce: ajax_object.nonce,
            prompt: prompt,
            totalVariations: totalVariations, 
            aspectRatio: aspectRatio,
            actionType: 'full-video-generate'

        },
        success: function(response) {
            if(response.includes('Error: '))
             $('#tab1 .generate_section').after();
            setTimeout(function(){
            getVideoData(response);
            }, 4);
        

        },
        error: function(xhr, status, error) {
            console.log('AJAX Error: ' + error);
        }
    });
});
    function getVideoData(sceneData){
        console.log(sceneData);
 $.ajax({
        url: ajax_object.ajax_url,
        type: 'POST',
        data: {
            action: 'veo_video_generator',
            nonce: ajax_object.nonce,
            sceneData: sceneData,
            actionType: 'final-video-results'

        },
        success: function(response) {
        
            var dataArray = JSON.parse(response);

            for (var i = 0; i < dataArray.length; i++) {
               if (dataArray[i].includes(',')) {
                    let videoData = dataArray[i].split(',');
                    let j = i + 1;
                    
                    if(videoData[0] !="" ){
                     if($('ul.fn__generation_list li:nth-child(' + j + ')').find('video').length <= 0) { 
                   
                    let j = i + 1;
                    $('ul.fn__generation_list li:nth-child(' + j + ')').find('.show-percentage, .placeholder').remove();
                    $('.negative_prompt_title').text("We Don't host or save the video so please download this video.");

                    let videoHtml = '<video src="' + videoData[0] + '" poster="' + videoData[1] + '" style="width:100%;" controls preload="auto"></video>';
                    let $video = $(videoHtml);
                 
               
                    $('ul.fn__generation_list li:nth-child(' + j + ')').prepend($video);
                    $video[0].load();
                    $('ul.fn__generation_list li:nth-child(' + j + ')').find('a').attr('href', videoData[0]);
                    
                    $('ul.fn__generation_list li:nth-child(' + j + ')').addClass(videoData[2])
                }
                }
                }
            }
             // ======= checking if the request is completed ==========//
            let videoCompleted = 0;
             for (var i = 0; i < dataArray.length; i++) {
               if (dataArray[i].includes(',')) {
                    let videoData = dataArray[i].split(',');
                    
                    if(videoData[0] !="" ){
                        videoCompleted++;
                    }
                }
            }
            
            let totalVariationsEnd = $('#total-variations').val();
            if(response && videoCompleted < totalVariationsEnd){
            setTimeout(function(){
            getVideoData(sceneData);
            }, 20000);
        }
            
          $('#generate_it').removeAttr('process');
           
            
            
    
    return 0;

        },
        error: function(xhr, status, error) {
            console.log('AJAX Error: ' + error);
        }
    });
    }

// ================== Nano Banana Image Generator ===============//
     $('#generate_it_img').click(function(){
        let promptIMG = $('#fn__include_textarea2').val();
        if(promptIMG == ""){
            return 0;
        }

        let totalVariationsIMG = $('#total-variations2').val();
        let aspectRatioIMG = $('#aspect-ration2').val();

        let ratioClassIMG = "";
        if(aspectRatioIMG == "IMAGE_ASPECT_RATIO_LANDSCAPE"){
        ratioClassIMG = "landscape-view";
        }
    let listData = '';    
for (var i = 1; i <= totalVariationsIMG; i++) {
    listData = listData + '<li class="fn__gl_item"><div class="fn__gl__item"><div class="show-percentage">1%</div><div class="abs_item"><div class="placeholder"><div class="animated-background"></div></div><div class="all_options"><div class="fn__icon_options medium_size"><a  href="" class="fn__icon_button downloader-video-btn" target="_blank"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Layer_1" x="0px" y="0px" viewBox="0 0 383.3 383.3" style="enable-background:new 0 0 383.3 383.3" xml:space="preserve" class="fn__svg replaced-svg"><g><path d="M20.3,383.3c-1.4-0.5-2.8-0.9-4.2-1.4c-10.8-3.8-17.5-15-15.8-25.9c1.9-11.6,11.3-20.1,22.8-20.5c1.5-0.1,3,0,4.5,0   c108.8,0,217.7,0,326.5,0c17.3,0,23.1,4,29.2,20.2c0,2.5,0,5,0,7.5c-0.8,2.3-1.5,4.7-2.5,6.9c-3.6,7.4-9.9,11.3-17.7,13.3   C248.8,383.3,134.5,383.3,20.3,383.3z"></path><path d="M216.8,208.4c0.8-1.1,1.5-2.4,2.4-3.3c13.4-13.4,26.8-26.9,40.2-40.2c6.7-6.6,14.8-8.7,23.8-6.2   c8.9,2.5,14.6,8.6,16.6,17.6c2,9-0.7,16.7-7.2,23.2c-22.5,22.5-45,45-67.5,67.5c-5.2,5.2-10.4,10.4-15.6,15.6   c-10.7,10.6-24.9,10.7-35.6,0.1c-27.8-27.7-55.6-55.6-83.4-83.4c-6.8-6.8-9.3-15-6.7-24.3c2.5-8.9,8.6-14.6,17.6-16.6   c8.8-2,16.5,0.5,22.9,6.9c13.2,13.2,26.5,26.5,39.7,39.7c1,1,1.7,2.1,2.6,3.2c0.4-0.1,0.7-0.3,1.1-0.4c0-1.4,0-2.8,0-4.2   c0-59.5,0-119,0-178.5c0-14.6,10.6-25.3,24.5-25.1c12.5,0.2,22.8,10.3,23.4,22.8c0.1,3,0.1,6,0.1,9c0,57.3,0,114.5,0,171.8   c0,1.3,0,2.7,0,4C216,207.9,216.4,208.1,216.8,208.4z"></path></g></svg></a></div></div></div></div></li>';
}
$('#generate_it').attr('disabled', 'true');
        $(this).parents('.tab-panel').find('.generation_history').prepend('<div class="fn__generation_item video-gen-item-1 '+ratioClassIMG+'"><div class="item_header"><div class="title_holder"><h2 class="prompt_title">'+promptIMG+' </h2><p class="negative_prompt_title">Generating image...</p></div></div><div class="item_list"><ul class="fn__generation_list">'+listData+'</ul></div></div>');

        //changing percentage value
        var $element = $(this);
$(this).parents('.tab-panel').find('.show-percentage').each(function() {
    var $element = $(this);
    
    $element.stop().data('counter', 0).animate({
        counter: 100
    }, {
        duration: 20000, // Reduced duration for better UX
        easing: 'swing',
        step: function(now) {
            $element.text(Math.ceil(now) + '%');
        }
    });
});

        

    $.ajax({
        url: ajax_object.ajax_url,
        type: 'POST',
        data: {
            action: 'veo_video_generator',
            nonce: ajax_object.nonce,
            promptIMG: promptIMG,
            totalVariationsIMG: totalVariationsIMG, 
            aspectRatioIMG: aspectRatioIMG,
            actionType: 'banan-image-generator'
        },
        success: function(response) {
         $('#generate_it').removeAttr('disabled');
           
            let imgData = response.split(',');
         
            $('.show-percentage, .placeholder').remove();
            $('.negative_prompt_title').text("We Don't host or save the images so please download these images.");
            let imgHtml = '';
            for (var i = 0; i < imgData.length; i++) {
                
               imgHtml  = imgHtml + '<li class="fn__gl_item"><div class="fn__gl__item"><div class="abs_item"><img src="data:image/png;base64,'+imgData[i]+'"><div class="all_options"><div class="fn__icon_options medium_size"><a href="" class="fn__icon_button downloader-img-btn" target="_blank"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Layer_1" x="0px" y="0px" viewBox="0 0 383.3 383.3" style="enable-background:new 0 0 383.3 383.3" xml:space="preserve" class="fn__svg replaced-svg"><g><path d="M20.3,383.3c-1.4-0.5-2.8-0.9-4.2-1.4c-10.8-3.8-17.5-15-15.8-25.9c1.9-11.6,11.3-20.1,22.8-20.5c1.5-0.1,3,0,4.5,0   c108.8,0,217.7,0,326.5,0c17.3,0,23.1,4,29.2,20.2c0,2.5,0,5,0,7.5c-0.8,2.3-1.5,4.7-2.5,6.9c-3.6,7.4-9.9,11.3-17.7,13.3   C248.8,383.3,134.5,383.3,20.3,383.3z"></path><path d="M216.8,208.4c0.8-1.1,1.5-2.4,2.4-3.3c13.4-13.4,26.8-26.9,40.2-40.2c6.7-6.6,14.8-8.7,23.8-6.2   c8.9,2.5,14.6,8.6,16.6,17.6c2,9-0.7,16.7-7.2,23.2c-22.5,22.5-45,45-67.5,67.5c-5.2,5.2-10.4,10.4-15.6,15.6   c-10.7,10.6-24.9,10.7-35.6,0.1c-27.8-27.7-55.6-55.6-83.4-83.4c-6.8-6.8-9.3-15-6.7-24.3c2.5-8.9,8.6-14.6,17.6-16.6   c8.8-2,16.5,0.5,22.9,6.9c13.2,13.2,26.5,26.5,39.7,39.7c1,1,1.7,2.1,2.6,3.2c0.4-0.1,0.7-0.3,1.1-0.4c0-1.4,0-2.8,0-4.2   c0-59.5,0-119,0-178.5c0-14.6,10.6-25.3,24.5-25.1c12.5,0.2,22.8,10.3,23.4,22.8c0.1,3,0.1,6,0.1,9c0,57.3,0,114.5,0,171.8   c0,1.3,0,2.7,0,4C216,207.9,216.4,208.1,216.8,208.4z"></path></g></svg></a></div></div></div></div></li>';
            }
            console.log(imgHtml);
    
   $element.parents('.tab-panel').find('ul.fn__generation_list').html(imgHtml);

    

        },
        error: function(xhr, status, error) {
            console.log('AJAX Error: ' + error);
        }
    });
});

    $('#video-submit-btn').click(function(){


    let prompt = $('#videoPrompt').val();
        if(prompt == ""){
            return 0;
        }
        else{
            
        }

    });

    $('.svg-setting').click(function(){
       $(this).parents('.tab-panel').find('.generation__sidebar').toggleClass('show-flex');
        $(this).parents('.tab-panel').find('.header_bottom').toggleClass("margin-prompt-text");
    });

    // =========== Download image ==============//
  $(document).on('click', '.downloader-img-btn', function(e) {
    e.preventDefault();
    var $absItem = $(this).parents('.abs_item');
    var $img = $absItem.find('img');
    var base64Image = $img.attr('src');
    if (!$img.length) {
        console.error('No img element found within .abs_item');
        return;
    }
    if (!base64Image || !base64Image.startsWith('data:image/')) {
        console.error('Invalid or missing base64 image data:', base64Image);
        return;
    }
    var base64Data = base64Image.split(',')[1];
    if (!base64Data) {
        console.error('Failed to parse base64 data');
        return;
    }
    try {
        var byteCharacters = atob(base64Data);
        var byteNumbers = new Array(byteCharacters.length);
        for (var i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        var byteArray = new Uint8Array(byteNumbers);
        var blob = new Blob([byteArray], { type: 'image/jpeg' });
        var url = window.URL.createObjectURL(blob);
        var link = document.createElement('a');
        link.href = url;
        link.download = `image_${Date.now()}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error processing base64 image:', error);
    }
});

  // ========== Text prompt ==============//
  $('#generate_it_prompt').click(function(){
        let prompt = $('.text-prompt-gen').val();
   if(prompt == ""){
    $('#msg').text("Enter your idea in the prompt box...");
  $('#alert').show().addClass('show');
  $('#bar').addClass('anim');
  setTimeout(()=>$('#alert').removeClass('show').hide(),5000);
            return 0;
        }     


$(this).after('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-loader-icon lucide-loader lucide-animate-loader"><path d="M12 2v4"/><path d="m16.2 7.8 2.9-2.9"/><path d="M18 12h4"/><path d="m16.2 16.2 2.9 2.9"/><path d="M12 18v4"/><path d="m4.9 19.1 2.9-2.9"/><path d="M2 12h4"/><path d="m4.9 4.9 2.9 2.9"/></svg>');
    $(this).attr('disabled', 'true');
   

     $.ajax({
        url: ajax_object.ajax_url,
        type: 'POST',
        data: {
            action: 'veo_video_generator',
            nonce: ajax_object.nonce,
            prompt: prompt,
            actionType: 'main-prompt-generation'

        },
        success: function(response) {

            if(response !="empty"){
                $('.text-prompt-gen').val(response);
            }
        $('#generate_it_prompt').removeAttr('disabled');
        $('.lucide-animate-loader').remove();

        },
        error: function(xhr, status, error) {
            console.log('AJAX Error: ' + error);
        }
    });
  });


  // ========== Text prompt ==============//
  $('.megic-prompt').click(function(){
        let prompt = $('#fn__include_textarea').val();
   if(prompt == ""){
    $('#msg').text("Enter your idea in the prompt box...");
  $('#alert').show().addClass('show');
  $('#bar').addClass('anim');
  setTimeout(()=>$('#alert').removeClass('show').hide(),5000);
            return 0;
        }     


$('#generate_it').after('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-loader-icon lucide-loader lucide-animate-loader"><path d="M12 2v4"/><path d="m16.2 7.8 2.9-2.9"/><path d="M18 12h4"/><path d="m16.2 16.2 2.9 2.9"/><path d="M12 18v4"/><path d="m4.9 19.1 2.9-2.9"/><path d="M2 12h4"/><path d="m4.9 4.9 2.9 2.9"/></svg>');
    $(this).attr('disabled', 'true');
   

     $.ajax({
        url: ajax_object.ajax_url,
        type: 'POST',
        data: {
            action: 'veo_video_generator',
            nonce: ajax_object.nonce,
            prompt: prompt,
            actionType: 'main-prompt-generation'

        },
        success: function(response) {

            if(response !="empty"){
                $('#fn__include_textarea').val(response);
            }
       
        $('.lucide-animate-loader').remove();

        },
        error: function(xhr, status, error) {
            console.log('AJAX Error: ' + error);
        }
    });
  });

    // ============= Image to Video ============//
    $('#generate_it_img_video').click(function(){
         if($('#generate_it').attr('process') == 'true'){
            return false;
        }
        $('#generate_it').attr('process', 'true');
        // ======== Check Rate Limit ===========//
       var result = checkRateLimit();
        if (!result.allowed) {
            $('.rate-limit-exceed').remove();
            var msg = result.minutes > 0 
                ? `Create again after ${result.minutes} minute${result.minutes > 1 ? 's' : ''} ${result.seconds} second${result.seconds > 1 ? 's' : ''}`
                : `Create again after ${result.seconds} second${result.seconds > 1 ? 's' : ''}`;
                
            $('#tab1 .generate_section').after('<div class="rate-limit-exceed"><p><span>Rate Limit Exceeded: </span>VEO AI is experiencing high usage and only allows 5 video generations per hour. ' + msg + '</p></div>');
            return false;
        }
        let prompt = $('#fn__include_textarea_img_video').val();
        if(prompt == ""){
            return 0;
        }

        let totalVariations = $('#total-variations_img_video').val();
        let aspectRatio = $('#aspect-ration-img-video').val();

        let ratioClass = "";
        if(aspectRatio == "VIDEO_ASPECT_RATIO_LANDSCAPE"){
        ratioClass = "landscape-view";
        }
        

$('#generate_it_img_video').attr('disabled', 'true');
let li = '';
for (var i = 0; i < totalVariations; i++) {
   li = li + '<li class="fn__gl_item"><a  href="" class="fn__icon_button downloader-video-btn only-video-download" target="_blank"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-cloud-download-icon lucide-cloud-download"><path d="M12 13v8l-4-4"/><path d="m12 21 4-4"/><path d="M4.393 15.269A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.436 8.284"/></svg></a><div class="fn__gl__item"><div class="show-percentage">1%</div><div class="abs_item"><div class="placeholder"><div class="animated-background"></div></div><div class="all_options"><div class="fn__icon_options medium_size"></div></div></div></div></li>'; 
}
        $(this).parents('.tab-panel').find('.generation_history').prepend('<div class="fn__generation_item video-gen-cont video-gen-item-1 '+ratioClass+'"><div class="item_header"><div class="title_holder"><h2 class="prompt_title">'+prompt+' </h2><p class="negative_prompt_title">Generating Video...</p></div></div><div class="item_list"><ul class="fn__generation_list">'+li+'</ul></div></div>');


        //changing percentage value
        $('.show-percentage').each(function() {
    $(this).prop('Counter', 0).animate({
        Counter: 100
    }, {
        duration: 80000, // 50 seconds
        easing: 'swing',
        step: function(now) {
            $(this).text(Math.ceil(now) + '%');
        }
    });
});

       let img1 = $('#base64Result').length && $('#base64Result').val() ? $('#base64Result').val() : '';
       let mimeType1 = "";
       let img2 = $('[name="attach-img-2"]').closest('.attach-images').find('#base64Result').length ? $('#base64Result').val() : ''
       let mimeType2 = "";


if (img1) {
    const match = img1.match(/^data:(image\/[^;]+);base64,(.*)$/);
    if (match) {
        mimeType1 = match[1];      
        img1 = match[2];         
    } else {
        img1 = '';                 
    }
}


if (img2) {
    const match = img2.match(/^data:(image\/[^;]+);base64,(.*)$/);
    if (match) {
        mimeType2 = match[1];
        img2 = match[2];
    } else {
        img2 = '';
    }
}
console.log(mimeType1);
    $.ajax({
        url: ajax_object.ajax_url,
        type: 'POST',
        data: {
            action: 'veo_video_generator',
            nonce: ajax_object.nonce,
            prompt: prompt,
            totalVariations: totalVariations, 
            aspectRatio: aspectRatio,
            actionType: 'img-to-video-start',
            img1: img1,
        img2: img2,
        mimeType1: mimeType1,
        mimeType2: mimeType2


        },
        success: function(response) {
console.log(response);
            setTimeout(function(){
            getVideoData(response);
            }, 40000);
        

        },
        error: function(xhr, status, error) {
            console.log('AJAX Error: ' + error);
        }
    });
});
let currentOffset = 4;

function loadVideoItem($item) {
    let sceneData = $item.data('scene');
    
    if (!sceneData) return;
    $.ajax({
        url: ajax_object.ajax_url,
        type: 'POST',
        data: { action: 'veo_video_generator', nonce: ajax_object.nonce, sceneData: sceneData, actionType: 'final-video-results' },
        success: function(response) {
         

            let dataArray = JSON.parse(response);
            for (let i = 0; i < dataArray.length; i++) {
                if (dataArray[i].includes(',')) {
                    let videoData = dataArray[i].split(',');
                    if (videoData[0]) {

                        let $li = $item.find('ul.fn__generation_list2 li');
                        $li.find('.placeholder').remove();
                        let videoHtml = '<video src="' + videoData[0] + '" poster="' + videoData[1] + '" style="width:100%;" controls preload="none"></video>';
                        $li.prepend($(videoHtml));
                        $li.find('a').attr('href', videoData[0]);
                        $li.addClass(videoData[2]);
                        $item.find('.prompt_title').text('');
                        $item.find('.item_header').remove();
                    }
                }
            }

        }
    });
}
    // ======== Load more items ===========//
    $('.fn__generation_item.video-gen-cont').each(function(){
    console.log('each function'); 
        loadVideoItem($(this)); });
    $(document).on('click', '#load-more-history', function(){
        $.post(ajax_object.ajax_url, {
            action: 'load_more_video_history',
            nonce: ajax_object.nonce,
            offset: currentOffset
        }, function(html){
            if (html.trim()) {
                console.log(html);
                $('.fn__generation_item:last').remove();
                $('.generation_history2 .generation_history2').after(html);
                currentOffset += 4;
                clickLoad = 1;
                console.log("item added");
              
                $('.fn__generation_item').slice(-4).each(function(){ loadVideoItem($(this)); });
            } else { $('#load-more-history').remove(); }
        });
    });
});