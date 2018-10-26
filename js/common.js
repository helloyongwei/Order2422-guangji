//主要信息
if (!window.location.origin) {
  console.log(window.location.origin);
  window.location.origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port : '');
}
var origin = window.location.origin;
console.log(origin);

var urlSearch =   unescape(window.location.search); //获取url中"?"符后的字串 ('?modFlag=business&role=1')
var urlhref =  window.location.href;

//判断有没有 wecha_id 对于用vue的hash模式的（#/）
var theWecha = new Object();
function getWechaVue(){
    if(urlhref.indexOf('wecha_id') !=-1){
        var str = urlhref.split( "#/" );
        var strs = str[1].split( "=" );
        if(strs[1] == undefined){
            strs[1] = ""
        }
        theWecha[strs[0]] = strs[1];  
    }
}
//判断有没有 wecha_id 对于用普通的
function getWecha(){
    if(urlhref.indexOf('wecha_id') !=-1){
        var str = urlhref.split( "?" );
        var strs = str[1].split( "=" );
        theWecha[strs[0]] = strs[1];
        console.log(theWecha);   
    }
}

getWecha();
var theRequest = new Object();
function GetRequest(){
    if ( urlSearch.indexOf( "?" ) != -1 ) {
        var str = urlSearch.substr( 1 ); //substr()方法返回从参数值开始到结束的字符串；
        var strs = str.split( "&" );
        for ( var i = 0; i < strs.length; i++ ) {
            theRequest[ strs[ i ].split( "=" )[ 0 ] ] = ( strs[ i ].split( "=" )[ 1 ] );
        }
        console.log( theRequest ); //此时的theRequest就是我们需要的参数；
    }
    return theRequest;
}
var Request = {};
Request = GetRequest();

var fidRequest = Request['fid'];
var taskidRequest = Request['taskid'];

if(fidRequest == null ||fidRequest == 0 ||fidRequest==undefined){
    fidRequest=0;
}
if(taskidRequest == null ||taskidRequest == 0 ||taskidRequest==undefined){
    taskidRequest=0;
}
if(theWecha.wecha_id == null ||theWecha.wecha_id == 0 ||theWecha.wecha_id==undefined){
    theWecha.wecha_id=0;
}
// alert(fidRequest);
// alert(taskidRequest);

// 去除微信默认参数
if (/from=[^&$?]{1,}(&|$)/.test(location.search) || /isappinstalled=[^&$?]{1,}(&|$)/.test(location.search)) {
    var newSearch = location.search.replace(/from=[^&$?]{1,}(&|$)/, '').replace(/isappinstalled=[^&$?]{1,}(&|$)/, '').replace(/&$|\?$/, '');
    var newUrl = location.origin + location.pathname + newSearch + location.hash;
    location.replace(newUrl);
}
//判断 userAll是否有actid
var arractid = new Array;
var jsonLength =0;
function isActid(actId){
    for(var key in JSON.parse(sessionStorage.getItem("userAll"))){
        arractid.push(key);
        jsonLength++;
        console.log(arractid);
    }
    for(var i=0;i<arractid.length;i++){
        if(arractid[i]==actId){
            return true;
        }else{
            return false;
        }
    }
}

//查询活动配置
var actid = '';
//活动参数
var actSetting = {
    isStart:false,
    isEnd:false,
    isClose:false,
    isSucces:'',
    gametitle:'',
    sharetitle:'',
    shareimg:'',
    wecha_id:'',
    code:'',
    nowtime:'',
    starttime:'',
    endTime:'',
    closeTime:'',
    cutType:'',
    need:'', 
    needHelp:''
}
//获取的全部信息 授权
var user = {
    url:origin,
    openid:'',
    actid:'',
    userid:'',
    imgurl:'',//头像
    nickname:'',
    dataMsee:'',
    today:'',  //今天
    fid:'',
    taskid:'',
    wecha_id:'',
}
var userAll={
     // 1655:{}
    }
function getActSettings(token,htmlUrl){
  console.log('用户getActSettings')
    $.ajax({
        url:origin+'/support/public/index.php/index/Search/getActSettings',
        type:"POST",
        async:false,
        data:{token:token},
        success:function(data){
            console.log(data)
            actSetting.isSucces = data.success;
            if(data.data==null){
                alert(data.msg+'活动配置中data==null');
                return false;
            }else{
                actid = data.data.actid;
                var settings = data.data.settings;          
                actSetting.code = data.code;
                actSetting.gametitle =settings.gametitle;
                actSetting.sharetitle = settings.sharetitle;
                actSetting.wecha_id = settings.wecha_id;
                actSetting.shareimg = settings.shareimg;
               
                actSetting.cutType = settings.cutType;
                actSetting.need =settings.need; //是否需要强制关注 1=>是 0=>否
                actSetting.needHelp =settings.needHelp; //是否需要助力 1=>是 0=>否

                actSetting.nowtime = data.data.nowtime;  //现在的时间
                actSetting.starttime = settings.starttime; //活动开始时间
                actSetting.endTime = settings.endtime; //活动结束时间
                actSetting.closeTime = settings.closetime; //站点关闭时间
        
                if(actSetting.nowtime>actSetting.starttime && actSetting.nowtime<actSetting.closeTime){
                 //可以去授权 玩游戏
                 actSetting.isStart = true;
                  getSessionId(actid,htmlUrl); 
        
                }else if(actSetting.nowtime>actSetting.closeTime){
                    actSetting.isClose = true;
                    //活动关闭 任何人都不能进入
                    // alert(true);
                }
                if(actSetting.nowtime<actSetting.closeTime && actSetting.nowtime>actSetting.endTime){
                    actSetting.isEnd = true;
                    console.log(actSetting.isEnd);
                    //不能玩游戏只能核销
                }
                sessionStorage.setItem('actSetting',JSON.stringify(actSetting)); 
            }
        },
        error:function(XMLHttpRequest, textStatus, errorThrown){            
            $('body').children().remove();
            console.log(XMLHttpRequest)
            alert("网络繁忙，请稍后再试");
            return false;
        }
    })
}
//获取sessionStorage 活动id 用户id
function getSessionId(actId,htmlUrl){
    if(actId){
        //1、判断session里面有没有userAll
            //2、如果有 判断userAll[actid] key 是否等于actId
                //A、key =actId   不用去授权直接用session 里 useAll
                //B、key !=actId   不用去授权直接用session 里 useAll
            //3、如果没有  去授权
        if(sessionStorage.getItem("userAll")==null){
            //授权  代表第一次进来没有session
            shouquan(actId,htmlUrl,theWecha.wecha_id,fidRequest,taskidRequest);
        }else{
            //2、如果有 判断userAll[actid] key 是否等于actId
                //A、key =actId   不用去授权直接用session 里 useAll
                //B、key !=actId   再将授权得到的data加到userAll中
            var openid = sessionStorage.getItem("openid");
          
            if(isActid(actId) && openid !=null && fidRequest !=0){
              
                userAll = JSON.parse(sessionStorage.getItem("userAll"));
                
            }else{
                shouquan(actId,htmlUrl,theWecha.wecha_id,fidRequest,taskidRequest);
            }
            
        }
    }else{
        alert('没有活动配置');
        location.href = origin +"/close.html"
        return false;
    } 
}
function shouquan(actId,htmlUrl,wecha_id,fid,taskid){
    if(fid==0){
        $.ajax({
            type:'post',
            url:origin+"/support/public/index.php/index/Unified/getId",
            async:false,
            data:{actid:actId,wecha_id:wecha_id,taskid:taskid},
            success:function(data){
                if(data == 'again'){
                    location.href = origin+"/support/public/index.php/index/Unified/getOrizer?actid="+actId+"&htmlUrl="+htmlUrl
                }else{      
                    if(data.actid=='error'){
                        location.reload();  
                        location.href = origin +"/close.html"
                    }else{
                        // console.log(data);
                        sessionStorage.setItem('data',JSON.stringify(data));                        
                        sessionStorage.setItem('openid',data.openid);                
                        
                        userAll[actId]=data;
                        sessionStorage.setItem('userAll',JSON.stringify(userAll));
                        console.log(userAll);
                        $.post(origin +'/support/public/index.php/index/Award/savePv', {
                                    openid: data.openid,
                                    actid: actId
                                }, function (res) {
                       
                        })
                        //授权成功进入活动页面
                        if(data.openid==null){
                            alert('请授权后再进入');
                            WeixinJSBridge.call('closeWindow');
                        }
                    }
                }
            },
            error:function(XMLHttpRequest, textStatus, errorThrown){
                alert("服务器忙");
            }
        })
    }else{
       
       $.ajax({
        type:'post',
        url:origin+"/support/public/index.php/index/Unified/getId",
        async:false,
        data:{actid:actId,wecha_id:wecha_id,fid:fid,taskid:taskid},
        success:function(data){
            if(data == 'again'){
                location.href = origin+"/support/public/index.php/index/Unified/getOrizer?actid="+actId+"&htmlUrl="+htmlUrl
            }else{     
                console.log(data);  
                if(data.actid=='error'){
                    location.reload(); 
                }else{
                    
                    sessionStorage.setItem('data',JSON.stringify(data));                        
                    sessionStorage.setItem('openid',data.openid);                
                   
                    userAll[actId]=data;
                   
                    sessionStorage.setItem('userAll',JSON.stringify(userAll));
                    console.log(userAll);
                    $.post(origin +'/support/public/index.php/index/Award/savePv', {
                                openid: data.openid,
                                actid: actId
                            }, function (res) {
                       
                    })
                    //授权成功进入活动页面
                    if(data.openid==null){
                        //alert('请授权后再进入');
                        location.href = origin +"/close.html"
                    }
              }
            }
        },
        timeout:5000,
        error:function(XMLHttpRequest, textStatus, errorThrown){
            //alert("服务器忙");
        }
    }) 
    }   
}

//测试用sessionStorage
function getActSettingsText(token,htmlUrl){
   console.log('测试用getActSettingsText')
    $.ajax({
        url:origin+'/support/public/index.php/index/Search/getActSettings',
        type:"POST",
        async:false,
        data:{token:token},
        success:function(data){
            console.log(data)
            actSetting.isSucces = data.success;
            if(data.data==null){
                //alert(data.msg+'活动配置中data==null');
                return false;
            }else{
                actid = data.data.actid;
                var settings = data.data.settings;          
                actSetting.code = data.code;

                actSetting.shareimg = settings.shareimg;
                actSetting.gametitle =settings.gametitle;
                actSetting.sharetitle = settings.sharetitle;
                actSetting.wecha_id = settings.wecha_id;
                actSetting.cutType = settings.cutType;
                actSetting.need =settings.need; //是否需要强制关注 1=>是 0=>否
                actSetting.needHelp =settings.needHelp; //是否需要助力 1=>是 0=>否

                actSetting.nowtime = data.data.nowtime;  //现在的时间
                actSetting.starttime = settings.starttime; //活动开始时间
                actSetting.endTime = settings.endtime; //活动结束时间
                actSetting.closeTime = settings.closetime; //站点关闭时间
        
                if(actSetting.nowtime>actSetting.starttime && actSetting.nowtime<actSetting.closeTime){
                 //可以去授权 玩游戏
                 actSetting.isStart = true;
                  getSessionIdText(actid,htmlUrl); 
        
                }else if(actSetting.nowtime>actSetting.closeTime){
                    actSetting.isClose = true;
                    //活动关闭 任何人都不能进入
                }
                if(actSetting.nowtime<actSetting.closeTime && actSetting.nowtime>actSetting.endTime){
                    actSetting.isEnd = true;
                    console.log(actSetting.isEnd);
                    //不能玩游戏只能核销
                }
                sessionStorage.setItem('actSetting',JSON.stringify(actSetting));
            }
        },
        error:function(){            
            $('body').children().remove();
            alert("网络繁忙，请稍后再试");
            return false;
        }
    })
}
//获取sessionStorage 活动id 用户id
function getSessionIdText(actId,htmlUrl){
    if(actId){
        if(sessionStorage.getItem("userAll")==null){
            //授权  代表第一次进来没有session
            console.log("没有sess");
            shouquanText(actId,htmlUrl,theWecha.wecha_id,fidRequest,taskidRequest);
        }else{
           //2、如果有 判断userAll[actid] key 是否等于actId
            console.log(JSON.parse(sessionStorage.getItem("userAll")));
            var openid = sessionStorage.getItem("openid");
            if(isActid(actId) && openid !=null && fidRequest !=0){
                userAll = JSON.parse(sessionStorage.getItem("userAll"));
                
            }else{
                shouquanText(actId,htmlUrl,theWecha.wecha_id,fidRequest,taskidRequest);
            }
        }
    }else{
        alert('没有活动配置');
        location.href = origin +"/close.html"
        return false;
    } 
}
function shouquanText(actId,htmlUrl,wecha_id,fid,taskid){
    var openid = 'oE6oPwbyoDrcSUTGshvKi9Kfoxok'; //我的
    // var openid = "oE6oPwcpWaVVLzcQWcX5hw66-e8M";
    // var openid = "oE6oPwd-dr0UeewacYPTPKUXnHlw";
    if(fid==0){
        $.ajax({
            type:'post',
            url:origin+"/support/public/index.php/index/Unified/getId",
            async:false,
            data:{actid:actId,openid:openid,wecha_id:wecha_id,taskid:taskid},
            success:function(data){
                if(data == 'again'){
                    location.href = origin+"/support/public/index.php/index/Unified/getOrizer?actid="+actId+"&htmlUrl="+htmlUrl
                }else{      
                    if(data.actid=='error'){
                        location.reload();  
                        location.href = origin +"/close.html"
                    }else{
                    console.log(data);
                    sessionStorage.setItem('data',JSON.stringify(data));                        
                    sessionStorage.setItem('openid',data.openid);                
                    
                    userAll[actId]=data;
                    sessionStorage.setItem('userAll',JSON.stringify(userAll));
                    console.log(userAll);
                    $.post(origin +'/support/public/index.php/index/Award/savePv', {
                                openid: data.openid,
                                actid: actId
                            }, function (res) {
                       
                    })
                    //授权成功进入活动页面
                    if(data.openid==null){
                        alert('请授权后再进入');
                        location.href = origin +"/close.html"
                    }
                  }
                }
            },
            timeout:5000,
            error:function(XMLHttpRequest, textStatus, errorThrown){
                alert(textStatus);
            }
        })
    }else{
       $.ajax({
        type:'post',
        url:origin+"/support/public/index.php/index/Unified/getId",
        async:false,
        data:{actid:actId,openid:openid,wecha_id:wecha_id,fid:fid,taskid:taskid},
        success:function(data){
            if(data == 'again'){
                location.href = origin+"/support/public/index.php/index/Unified/getOrizer?actid="+actId+"&htmlUrl="+htmlUrl
            }else{     
                console.log(data);  
                if(data.actid=='error'){
                    location.reload(); 
                       
                }else{
                sessionStorage.setItem('data',JSON.stringify(data));                        
                sessionStorage.setItem('openid',data.openid);                
               
                userAll[actId]=data;
                sessionStorage.setItem('userAll',JSON.stringify(userAll));
                console.log(userAll);
                $.post(origin +'/support/public/index.php/index/Award/savePv', {
                            openid: data.openid,
                            actid: actId
                        }, function (res) {
                       
                })
                //授权成功进入活动页面
                if(data.openid==null){
                    alert('请授权后再进入');
                    location.href = origin +"/close.html"
                }
              }
            }
        },
        timeout:5000,
        error:function(XMLHttpRequest, textStatus, errorThrown){
            alert(textStatus);
        }
    }) 
    }   
}

// 点击除弹框以外的地方 让弹框消失
function disappear(selectorDom){
    $('.selectorDom').click(function(e){
        //console.log(e.target) 
        var layer_div = $('.selectorDom>div'); 
        if(!layer_div.is(e.target) && layer_div.has(e.target).length === 0){ 
            $(".selectorDom").hide();
        }
    });
}
$('input').on('touchstart',function(){
    setTimeout(function(){
        $('body').scrollIntoView(/*true和false选填,根据对齐方式*/);
    },400);
});

function getDrawAward(actId, userId, needScore) {
  var openid = 'oE6oPwbyoDrcSUTGshvKi9Kfoxok'; //我的
  $.ajax({
    type:'post',
    url:location.origin+"/support/public/index.php/index/Award/drawAward",
    async:false,
    data:{actid:actId, userid:userId, needScore},
    success:function(data){
      if(data == 'again'){
        location.href = origin+"/support/public/index.php/index/Unified/getOrizer?actid="+actId+"&htmlUrl="+htmlUrl
      }else{
        if(data.actid=='error'){
          location.reload();
          location.href = origin +"/close.html"
        }else{
          console.log(data);
          sessionStorage.setItem('data',JSON.stringify(data));
          sessionStorage.setItem('openid',data.openid);
          
          userAll[actId]=data;
          sessionStorage.setItem('userAll',JSON.stringify(userAll));
          console.log(userAll);
          $.post(origin +'/support/public/index.php/index/Award/savePv', {
            openid: data.openid,
            actid: actId
          }, function (res) {
          
          })
          //授权成功进入活动页面
          // if(data.openid==null){
          //   alert('请授权后再进入');
          //   location.href = origin +"/close.html"
          // }
        }
      }
    },
    timeout:5000,
    error:function(XMLHttpRequest, textStatus, errorThrown){
      alert(textStatus);
    }
  })
}

function SaveScore(actId, userId, score){
  $.ajax({
    type: "POST",
    url: location.origin + '/support/public/index.php/index/User/saveScore',
    async: false,
    data: {actid:actId, userid:userId, score},
    success: (data)=>{
      console.log(data);
    },
    error: (err)=>{
      console.log(err);
    }
  })
}

function getGameCount(actid, userid) {
  $.ajax({
    type: "POST",
    url: location.origin + '/support/public/index.php/index/User/getGameCount',
    async: false,
    data: {actid, userid},
    success: (data)=>{
      console.log(data);
    },
    error: (err)=>{
      console.log(err);
    }
  })
}

function getResultInfo(actid, userid, param){
  $.ajax({
    url: location.origin + '/support/public/index.php/index/Search/getResultInfo',
    data: {actid:actid,userid:userid,param:JSON.stringify(param)},
    success: function(res){
      console.log(res);
    }
  })
}

function doCode(actid, userid, resultid, code) {
  $.ajax({
    type: 'POST',
    url: location.origin + '/support/public/index.php/index/Code/doCode',
    async: false,
    data: {actid, userid, resultid, code},
    success: (data) => {
      console.log(data);
    },
    error: (err)=> {
      console.log(err);
    }
  })
}