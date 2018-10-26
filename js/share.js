function Getsharejiekou(userid,taskid){
    var getShare = origin +'/support/public/index.php/index/Unified/getSign';
    var signPackage ={
        appId:'',
        nonceStr:'',
        signature:'',
        timestamp:'',
    }
    var shareUrl = window.location.href.split('#/')[0];
    //在主vue中将路由中的"#"替换为"?",并将#后边的内容编码后追加到"?"后边
    // var urls=Url.split('#/')[0]+"?"+encodeURIComponent(Url.split('#/')[1])
  
  var url =window.location.origin+location.pathname;
    
    $.post(getShare,{actid:actid,url:shareUrl},function(data){
        if(data.success){
            console.log(data.signPackage);
            signPackage.appId = data.signPackage.appId;
            signPackage.nonceStr = data.signPackage.nonceStr;
            signPackage.signature = data.signPackage.signature;
            signPackage.timestamp = data.signPackage.timestamp;
            console.log(signPackage);
            wx.config({ 
                debug: true,
                appId: signPackage.appId,
                timestamp: signPackage.timestamp,
                nonceStr:  signPackage.nonceStr,
                signature:  signPackage.signature,
                jsApiList: [
                    'chooseImage',
                    'onMenuShareTimeline',
                    'onMenuShareAppMessage',
                    'startRecord',
                    'stopRecord',
                    'onVoiceRecordEnd',
                    'playVoice',
                    'pauseVoice',
                    'stopVoice',
                    'onVoicePlayEnd',
                    'uploadVoice',
                    'downloadVoice',
                    'chooseImage',
                    'previewImage',
                    'uploadImage',
                    'downloadImage',
                    'hideOptionMenu',
                    'showOptionMenu',
                    'hideMenuItems',
                    'showMenuItems',
                ]
            });
            wx.ready(function () {
                // wx.showOptionMenu();
                $.post(origin +'/support/public/index.php/index/Unified/saveLog',
                    {actid:actid,msg:userAll[actid].nickname+'加载配置'+new Date()},function(res){
                    console.log(res);
                })
              url = url.substring(0, url.lastIndexOf('/'))+'/index.html'
              console.log(url);
              //分享给朋友api
              wx.onMenuShareAppMessage({
                    title: actSetting.gametitle, // 分享标题
                    desc: actSetting.sharetitle, // 分享描述
                    link: url+'?fid='+userid+'&'.replace(/&/g,"%26")+'taskid='+taskid, // 分享链接
                    imgUrl: actSetting.shareimg, // 分享图标
                    type: '', // 分享类型,music、video或link，不填默认为link
                    dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
                    success: function () {
                        location.assign('./award.html?wecha_id=dtcs?openid=oE6oPwbyoDrcSUTGshvKi9Kfoxok')
                        $.post(origin +'/support/public/index.php/index/Unified/saveLog',
                        {actid:actid,msg:userAll[actid].nickname+'分享朋友成功了'+new Date()},function(res){
                            console.log(res);
                        })
                    },
                    cancel: function () {
                        $.post(origin +'/support/public/index.php/index/Unified/saveLog',
                          {actid:actid,msg:userAll[actid].nickname+'分享朋友取消了'+new Date()},function(res){
                            console.log(res);
                        })
                    },
                    fail:function(){
                        $.post(origin +'/support/public/index.php/index/Unified/saveLog',
                        {actid:actid,msg:userAll[actid].nickname+'分享朋友失败了'+new Date()},function(res){
                            console.log(res);
                        })
                    }
                });
                //分享到朋友圈api
                wx.onMenuShareTimeline({
                    title: actSetting.gametitle, // 分享标题
                    link: url+'?fid='+userid+'&'.replace(/&/g,"%26")+'taskid='+taskid, // 分享链接
                    imgUrl: actSetting.shareimg, // 分享图标
                    success: function () {
                        $('.share-img').hide();
                        $('.go-prize').show();
                        $('.share').hide();
                        $.post(origin +'/support/public/index.php/index/Unified/saveLog',
                           {actid:actid,msg:userAll[actid].nickname+'分享朋友圈成功了'+new Date()},function(res){
                            console.log(res);
                        })
                    },
                    cancel: function () {
                    // 用户取消分享后执行的回调函数
                      $.post(origin +'/support/public/index.php/index/Unified/saveLog',
                          {actid:actid,msg:userAll[actid].nickname+'分享朋友圈取消了'+new Date()},function(res){
                          console.log(res);
                       })
                    },
                });
                wx.error(function(res){
                    $.post(origin +'/support/public/index.php/index/Unified/saveLog',
                        {actid:actid,msg:+userAll[actid].userid+JSON.stringify(res)+'%%失败了'},function(res){
                        console.log(res);
                    })
                })
                wx.hideMenuItems({
                    menuList: [
                        // 'menuItem:copyUrl',
                    ] // 要隐藏的菜单项，只能隐藏“传播类”和“保护类”按钮，所有menu项见附录3
                });
                $('#audio')[0].play();
            });
        }
    })
}