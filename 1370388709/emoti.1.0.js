(function(){

  var _dataUrlRoot = location.protocol + '//' + location.hostname // + location.pathname.replace(/^\/+|(\/[^\/]+){2}$/g,'/');
    , $emos = $('.emo')
    , changeImgData = function($emo){
      var data = $emo.data();
      if(data.img == data.thumb){
        data.thumb += '?thumb'
      }
      $emo.data({
        appid : data.appid,
        img   : _dataUrlRoot + data.img,
        thumb : _dataUrlRoot + data.thumb
      });
    }
    , handleEmoEvent = function(){
      var $emo = $(this)
        , span = $emo.find('span')
        , _appid = $emo.data('appid')
        , _img   = $emo.data('img')
        , _thumb = $emo.data('thumb');

       switch( span.attr('class') ){
        case 'load':
          span.attr('class', 'loading');

          WeixinJSBridge.invoke(
            'addEmoticon',
            {
              'url'       : _img,
              'thumb_url' : _thumb,
              'appid'     : _appid
            },
            function(e){
              alert(e.err_msg);
              switch(e.err_msg){
                case "add_emoticon:ok":
                   _gaq.push(["_trackEvent", "emotion", "click", _img]);
                   span.attr("class", "loaded");
                   break;
                default:
                   span.attr("class", "load");
              }
            }
          );

          break;

        case 'loading':
          WeixinJSBridge.invoke(
            'cancelAddEmoticon',
            {
              'url'       : _img,
              'thumb_url' : _thumb,
              'appid'     : _appid
            },
            function(e){
              switch(e.err_msg){
                case "cancel_add_emoticon:ok":
                  span.attr("class", "load");
                break;
              }
            }
          );
          break;
       }
    }
    , isReady
    , readyFnc = function() {
      if(isReady) return;
      isReady = 1;
      // Call micro-channel built-in picture browsing
      $emos
        .on({
          click      : handleEmoEvent
          //,touchstart : handleEmoEvent
        })
        .each(function(){
          var $emo = $(this);
          changeImgData($emo);
          WeixinJSBridge.invoke(
            'hasEmoticon',
            {'url': $emo.data('img')},
            function(e){
              switch(e.err_msg){
                case 'has_emoticon:yes':
                   $emo.find("span").attr("class", "loaded");
                   break;
                case 'has_emoticon:no':
                   $emo.find('span').attr("class", "load");
                   break;
              }
            }
            );
        });
    }

    jQuery(document).ready(function(){
      window.WeixinJSBridge
      && WeixinJSBridge.finishLoading
      && WeixinJSBridge.finishLoading();
    });

    //When micro-channel built-in browser to complete the internal initialization trigger WeixinJSBridgeReady event.
    document.addEventListener('WeixinJSBridgeReady', readyFnc, false);
    $('body').bind('WeixinJSBridgeReady',readyFnc);
    // $.getScript('/emoticons/emoticons/js/fake_bridge.js');
})();
