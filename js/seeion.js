//查询活动配置

var token = '12a39e175b65b434b52602ea0473a5ac';

if(window.location.href.indexOf('openid') !=-1){
  getActSettingsText(token,window.location.href);
}else{
   getActSettings(token,window.location.href);
}
console.log(actSetting.shareimg);

//文档标题
document.title = actSetting.gametitle;

//需要强关
// actSetting.need = 0
if(parseInt(actSetting.need)>0){
  // console.log(userAll[actid].wecha_id);
  // console.log(actSetting.wecha_id);
  if(userAll[actid].wecha_id !=actSetting.wecha_id){
      //强制关注
      // $('#chat').show();
      location.assign('./chat.html')
  }else{
    //need: 需要关注？
    //needHelp: 需要助力？
        if(parseInt(parseInt(actSetting.needHelp))>0){
            if(userAll[actid].fid !=null){
                // $('#friend').show();
              //助力页
             }else{
                //首页                 
                $('#index').show();                             
             }
        }else{
            //首页 
            $('#index').show(); 
            // $('#index').siblings().hide();
        }
    }
}else{
    // 不需要强关
  console.log('not fellow');
  // if(parseInt(actSetting.needHelp)>0){
  //       if(userAll[actid].taskid !="" && userAll[actid].taskid !=null){
  //           $('#friend').show();
  //        }else{
  //           //首页
  //           $('#index').show();
  //        }
  //   }else{
  //       //不需要助力
  //           //首页
  //       $('#index').show();
  //   }
}