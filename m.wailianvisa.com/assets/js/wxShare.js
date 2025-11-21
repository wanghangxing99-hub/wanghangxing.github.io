
//微信分享
function weixinInit(appId, timestamp, nonceStr, signature, share_title, share_digest, share_imgUrl=null){
    var share_url= getShareUrl()  ;
    var share_imgUrl=share_imgUrl;
    if (share_imgUrl == null){
        share_imgUrl='https://static.leapoon.com/Pwebsite/front/common/logo.jpg';
    }
    wx.config({
        debug: false,
        appId: appId, // 必填，公众号的唯一标识
        timestamp: timestamp, // 必填，生成签名的时间戳
        nonceStr: nonceStr, // 必填，生成签名的随机串
        signature: signature,// 必填，签名，见附录1
        jsApiList: ["onMenuShareTimeline", "onMenuShareAppMessage"]
    });

    wx.error(function(res) {});

    wx.ready(function() {
        wx.onMenuShareTimeline({
            title: share_title,
            link: share_url + '&share_type=shareTimeline' ,
            imgUrl: share_imgUrl,
            success: function () {
                // alert("分享朋友圈成功！AAAA");
                weixinShareMsg('shareTimeline');
            },
            cancel: function () {
                // 用户取消分享后执行的回调函数
            }
        });

        wx.onMenuShareAppMessage({
            title: share_title,
            link: share_url  + '&share_type=shareAppMessage' ,
            imgUrl: share_imgUrl,
            desc: share_digest,
            success: function () {
                // alert("分享给好友成功！BBBB");
                weixinShareMsg('shareAppMessage');
            },
            cancel: function () {
                // 用户取消分享后执行的回调函数
            }
        });
    });
}
function getShareUrl(){
  var mg_id = GetQueryString('mg_id');
  var channel = GetQueryString('channel');
  if(mg_id!=null){
     return window.location.href.split("?")[0]+"?mg_id="+mg_id+"&channel="+channel;
  }else{
     return window.location.href ;
  }
}
function GetQueryString(name){
   var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
   var r = window.location.search.substr(1).match(reg);
   if(r!=null)return  unescape(r[2]); return null;
}
